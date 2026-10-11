import httpx
from .base import JobSource
class SmartRecruitersSource(JobSource):
    name="smartrecruiters"
    def __init__(self,companies=None):self.companies=companies or []
    async def search(self,query,countries,remote_only):
        out=[]
        async with httpx.AsyncClient(timeout=18,follow_redirects=True) as c:
            for company in self.companies:
                try:
                    r=await c.get(f"https://api.smartrecruiters.com/v1/companies/{company}/postings",params={"q":query,"limit":100});r.raise_for_status();rows=r.json().get("content",[])
                except Exception:continue
                for row in rows:
                    pid=row.get("id") or row.get("uuid")
                    try:d=(await c.get(f"https://api.smartrecruiters.com/v1/companies/{company}/postings/{pid}")).json()
                    except Exception:d=row
                    loc=d.get("location") or row.get("location") or {};loc_text=", ".join(str(loc.get(k)) for k in ("city","region","country") if loc.get(k))
                    sections=d.get("jobAd") or {};desc="\n".join(str(sections.get(k) or "") for k in ("company","job","qualifications","additionalInformation"))
                    out.append({"source":"smartrecruiters","source_job_id":str(pid),"source_url":d.get("applyUrl") or d.get("postingUrl") or f"https://jobs.smartrecruiters.com/{company}/{pid}",
                      "company":company,"title":d.get("name") or row.get("name") or "","location":loc_text or None,"remote":loc.get("remote"),"salary_min":None,"salary_max":None,
                      "currency":None,"description":desc,"posted_at":d.get("releasedDate")})
        return out
