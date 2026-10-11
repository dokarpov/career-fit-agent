from __future__ import annotations
import re
from urllib.parse import urljoin,urlsplit
import httpx
from .base import JobSource
from ..job_ingest import fetch_job
class CareerSiteSource(JobSource):
    name="career_sites"
    def __init__(self,pages=None):self.pages=pages or []
    async def search(self,query,countries,remote_only):
        out=[]
        async with httpx.AsyncClient(timeout=18,follow_redirects=True,headers={"User-Agent":"CareerFitAgent/1.6"}) as c:
            for page in self.pages:
                try:r=await c.get(page);r.raise_for_status();html=r.text
                except Exception:continue
                links=[]
                for href in re.findall(r'href=["\']([^"\']+)["\']',html,re.I):
                    u=urljoin(str(r.url),href)
                    if any(x in u.lower() for x in ("/job/","/jobs/","/career/","/careers/","opening","position")):links.append(u)
                for u in list(dict.fromkeys(links))[:50]:
                    try:j=await fetch_job(u)
                    except Exception:continue
                    if j.get("fetch_status")!="ok":continue
                    if query.lower() not in ((j.get("title") or "")+" "+(j.get("description") or "")).lower():continue
                    j["source"]="career_site";out.append(j)
        return out
