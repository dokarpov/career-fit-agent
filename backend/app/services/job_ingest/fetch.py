from __future__ import annotations
import html as html_lib
import json, re
from html.parser import HTMLParser
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
import httpx

UA="CareerFitAgent/1.6 (+https://github.com/dokarpov)"
MAX_BYTES=2_500_000

def canonical_url(url:str)->str:
    p=urlsplit(url.strip());scheme=p.scheme or "https"
    kept=[]
    for k,v in parse_qsl(p.query,keep_blank_values=True):
        kl=k.lower()
        if kl in {"ref","source","campaign","medium","utm","gh_src"} or kl.startswith(("utm_","mc_","tracking","trk")):continue
        kept.append((k,v))
    return urlunsplit((scheme,p.netloc,p.path,urlencode(kept,doseq=True),""))

def clean_text(s):
    return re.sub(r"\s+"," ",html_lib.unescape(re.sub(r"<[^>]+>"," ",str(s or "")))).strip()

class _VisibleText(HTMLParser):
    SKIP={"script","style","noscript","svg","path","nav","footer","header"}
    BLOCK={"p","div","li","section","article","h1","h2","h3","h4","br","tr"}
    def __init__(self):
        super().__init__(convert_charrefs=True);self.skip=0;self.parts=[]
    def handle_starttag(self,tag,attrs):
        tag=tag.lower()
        if tag in self.SKIP:self.skip+=1
        if not self.skip and tag in self.BLOCK:self.parts.append("\n")
    def handle_endtag(self,tag):
        tag=tag.lower()
        if tag in self.SKIP and self.skip:self.skip-=1
        if not self.skip and tag in self.BLOCK:self.parts.append("\n")
    def handle_data(self,data):
        if not self.skip:self.parts.append(data)
    def text(self):
        raw="".join(self.parts)
        lines=[re.sub(r"\s+"," ",x).strip() for x in raw.splitlines()]
        return "\n".join(x for x in lines if x)

def _iter_jsonld(html):
    for m in re.finditer(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',html,re.I|re.S):
        raw=html_lib.unescape(m.group(1)).strip()
        try:data=json.loads(raw)
        except Exception:continue
        yield data

def _walk_jobposting(obj):
    if isinstance(obj,list):
        for x in obj:
            found=_walk_jobposting(x)
            if found:return found
    elif isinstance(obj,dict):
        typ=obj.get("@type")
        if typ=="JobPosting" or (isinstance(typ,list) and "JobPosting" in typ):return obj
        for key in ("@graph","mainEntity","itemListElement"):
            if key in obj:
                found=_walk_jobposting(obj[key])
                if found:return found
    return None

def _num(x):
    try:return float(x)
    except Exception:return None

def _salary_from_ld(base):
    b=(base or {}).get("baseSalary")
    if not isinstance(b,dict):return (None,None,None)
    currency=b.get("currency")
    value=b.get("value") or {}
    if isinstance(value,(int,float)):return (float(value),float(value),currency)
    if isinstance(value,dict):return (_num(value.get("minValue")),_num(value.get("maxValue") or value.get("value")),currency)
    return (None,None,currency)

def _location_from_ld(j):
    loc=j.get("jobLocation")
    if isinstance(loc,list):loc=loc[0] if loc else {}
    if isinstance(loc,dict):
        addr=loc.get("address") or {}
        if isinstance(addr,dict):
            return ", ".join(str(addr.get(k)) for k in ["addressLocality","addressRegion","addressCountry"] if addr.get(k))
        return clean_text(loc.get("name"))
    return clean_text(loc)

def _company_from_ld(j):
    org=j.get("hiringOrganization") or {}
    return clean_text(org.get("name") if isinstance(org,dict) else org)

def _normalize(job,source,url):
    job=dict(job or {})
    job["source"]=source
    job["source_url"]=canonical_url(job.get("source_url") or url)
    job["description"]=clean_text(job.get("description"))
    job["title"]=clean_text(job.get("title"))
    job["company"]=clean_text(job.get("company"))
    job["location"]=clean_text(job.get("location")) or None
    job["fetch_status"]="ok" if len(job["description"])>=120 else "insufficient"
    return job

async def _request_json(url,params=None):
    async with httpx.AsyncClient(timeout=18,follow_redirects=True,headers={"User-Agent":UA,"Accept":"application/json,text/plain,*/*"}) as c:
        r=await c.get(url,params=params);r.raise_for_status();return r.json()

async def _request_html(url):
    async with httpx.AsyncClient(timeout=18,follow_redirects=True,headers={"User-Agent":UA,"Accept":"text/html,application/xhtml+xml,application/json;q=0.8,*/*;q=0.5","Accept-Language":"en-US,en;q=0.8"}) as c:
        r=await c.get(url);r.raise_for_status();raw=r.content[:MAX_BYTES];enc=r.encoding or "utf-8"
        return raw.decode(enc,errors="replace"),str(r.url)

async def fetch_greenhouse(url):
    p=urlsplit(url);parts=[x for x in p.path.split("/") if x];board=None;job_id=None
    if "jobs" in parts:
        i=parts.index("jobs")
        if i>=1 and i+1<len(parts):board=parts[i-1];job_id=re.sub(r"\D","",parts[i+1])
    if not board or not job_id:return None
    try:x=await _request_json(f"https://boards-api.greenhouse.io/v1/boards/{board}/jobs/{job_id}",{"content":"true"})
    except Exception:return None
    return _normalize({"source_job_id":str(x.get("id") or job_id),"source_url":x.get("absolute_url") or url,"company":board,"title":x.get("title"),"location":(x.get("location") or {}).get("name"),"description":x.get("content") or "","posted_at":x.get("updated_at")},"greenhouse",url)

async def fetch_lever(url):
    p=urlsplit(url);parts=[x for x in p.path.split("/") if x]
    if len(parts)<2:return None
    site,posting=parts[0],parts[1]
    try:x=await _request_json(f"https://api.lever.co/v0/postings/{site}/{posting}",{"mode":"json"})
    except Exception:return None
    cats=x.get("categories") or {}
    return _normalize({"source_job_id":x.get("id") or posting,"source_url":x.get("hostedUrl") or x.get("applyUrl") or url,"company":site,"title":x.get("text"),"location":cats.get("location"),"description":x.get("descriptionPlain") or x.get("description") or "","posted_at":x.get("createdAt")},"lever",url)


async def fetch_workday(url):
    p=urlsplit(url);parts=[x for x in p.path.split("/") if x]
    if "job" not in parts:return None
    i=parts.index("job")
    if i<1 or i+1>=len(parts):return None
    tenant=p.netloc.split(".")[0]
    site=parts[i-1]
    tail="/".join(parts[i+1:])
    api=f"{p.scheme or 'https'}://{p.netloc}/wday/cxs/{tenant}/{site}/job/{tail}"
    try:data=await _request_json(api)
    except Exception:return None
    info=data.get("jobPostingInfo") or data
    return _normalize({
      "source_job_id":info.get("jobReqId") or info.get("jobId") or tail.split("_")[-1],
      "source_url":url,"company":info.get("company") or tenant,
      "title":info.get("title"),"location":info.get("location"),
      "description":info.get("jobDescription") or info.get("description") or "",
      "posted_at":info.get("startDate") or info.get("postedOn")
    },"workday",url)

async def fetch_ashby(url):
    p=urlsplit(url);parts=[x for x in p.path.split("/") if x]
    if len(parts)<1:return None
    board=parts[0];hint=parts[1] if len(parts)>1 else None
    try:data=await _request_json(f"https://api.ashbyhq.com/posting-api/job-board/{board}",{"includeCompensation":"true"})
    except Exception:return None
    candidates=data.get("jobs") or [];x=None
    if hint:x=next((j for j in candidates if str(j.get("id"))==hint or hint in str(j.get("jobUrl","")) or hint in str(j.get("applyUrl",""))),None)
    if x is None and len(candidates)==1:x=candidates[0]
    if x is None:return None
    return _normalize({"source_job_id":x.get("id") or hint,"source_url":x.get("jobUrl") or x.get("applyUrl") or url,"company":board,"title":x.get("title"),"location":x.get("location"),"remote":x.get("isRemote"),"description":x.get("descriptionPlain") or "","posted_at":x.get("publishedAt"),"compensation_raw":x.get("compensation") or {}},"ashby",url)

def parse_generic_html(html,url,final_url=None):
    j=None
    for block in _iter_jsonld(html):
        j=_walk_jobposting(block)
        if j:break
    if j:
        lo,hi,currency=_salary_from_ld(j);desc=j.get("description") or j.get("responsibilities") or j.get("qualifications") or ""
        return _normalize({"source_job_id":j.get("identifier",{}).get("value") if isinstance(j.get("identifier"),dict) else j.get("identifier"),"source_url":j.get("url") or final_url or url,"company":_company_from_ld(j),"title":j.get("title"),"location":_location_from_ld(j),"description":desc,"posted_at":j.get("datePosted"),"salary_min":lo,"salary_max":hi,"currency":currency,"employment_type":j.get("employmentType"),"valid_through":j.get("validThrough"),"remote":str(j.get("jobLocationType","")).upper()=="TELECOMMUTE"},"jsonld",url)
    parser=_VisibleText()
    try:parser.feed(html)
    except Exception:pass
    text=parser.text();title="";mt=re.search(r"<title[^>]*>(.*?)</title>",html,re.I|re.S)
    if mt:title=clean_text(mt.group(1))
    job_words=sum(1 for w in ["responsibilities","requirements","qualifications","experience","about the role","what you'll do","what you will do"] if w in text.lower())
    return _normalize({"source_job_id":None,"source_url":final_url or url,"company":"","title":title,"location":None,"description":text if job_words>=2 else ""},"html",url)

async def fetch_job(url):
    url=canonical_url(url);host=urlsplit(url).netloc.lower();attempts=[]
    for name,fn,condition in [
      ("greenhouse",fetch_greenhouse,"greenhouse" in host),
      ("lever",fetch_lever,"lever.co" in host),
      ("ashby",fetch_ashby,"ashbyhq.com" in host),
      ("workday",fetch_workday,"myworkdayjobs.com" in host)
    ]:
        if not condition:continue
        try:
            job=await fn(url)
            if job and job.get("fetch_status")=="ok":job["fetch_method"]=name;return job
            attempts.append({"method":name,"status":"insufficient"})
        except Exception as e:attempts.append({"method":name,"status":"error","error":str(e)[:240]})
    try:
        html,final_url=await _request_html(url);job=parse_generic_html(html,url,final_url);job["fetch_method"]="jsonld" if job.get("source")=="jsonld" else "html";job["fetch_attempts"]=attempts
        if job.get("fetch_status")!="ok":job["fetch_error"]="The source did not expose enough vacancy text for a defensible match."
        return job
    except Exception as e:
        return {"source":"url","source_url":url,"company":"","title":"","location":None,"description":"","fetch_status":"unavailable","fetch_method":None,"fetch_attempts":attempts,"fetch_error":str(e)[:300]}
