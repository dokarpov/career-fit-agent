from __future__ import annotations
import hashlib, re
from .job_ingest.fetch import canonical_url as canonical_job_url

def clean(s:str|None)->str:
    return re.sub(r"\s+"," ",(s or "").strip())

def canonical_url(url:str)->str:
    return canonical_job_url(url) if url else ""

def canonical_key(job:dict)->str:
    raw="|".join([
      clean(job.get("company")).lower(),
      clean(job.get("title")).lower(),
      clean(job.get("location")).lower()
    ])
    return hashlib.sha1(raw.encode()).hexdigest()[:16]

def normalize(job:dict)->dict:
    j=dict(job)
    j["company"]=clean(j.get("company"))
    j["title"]=clean(j.get("title"))
    j["location"]=clean(j.get("location")) or None
    j["source_url"]=canonical_url(j.get("source_url",""))
    j["canonical_key"]=canonical_key(j)
    j["id"]=f"{j.get('source','src')}:{j.get('source_job_id') or j['canonical_key']}"
    return j

def dedupe(jobs:list[dict])->list[dict]:
    # Prefer richer descriptions / salaries while preserving source provenance.
    groups={}
    for job in jobs:
        j=normalize(job)
        key=j["canonical_key"]
        if key not in groups:
            j["sources"]=[{"source":j["source"],"url":j["source_url"]}]
            groups[key]=j
            continue
        cur=groups[key]
        cur["sources"].append({"source":j["source"],"url":j["source_url"]})
        if len(j.get("description","")) > len(cur.get("description","")):
            cur["description"]=j["description"]
        for f in ["salary_min","salary_max","currency","remote","posted_at"]:
            if cur.get(f) is None and j.get(f) is not None:
                cur[f]=j[f]
    return list(groups.values())
