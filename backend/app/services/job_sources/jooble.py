import os, httpx
from .base import JobSource

class JoobleSource(JobSource):
    name="jooble"
    async def search(self, query, countries, remote_only):
        # Jooble keys are region/domain-specific. Configure JOOBLE_ENDPOINT + JOOBLE_API_KEY.
        key=os.getenv("JOOBLE_API_KEY"); endpoint=os.getenv("JOOBLE_ENDPOINT")
        if not key or not endpoint: return []
        async with httpx.AsyncClient(timeout=15) as c:
            r=await c.post(f"{endpoint.rstrip('/')}/{key}",json={"keywords":query,"location":""})
            data=r.json()
        return [{
          "source":"jooble","source_job_id":str(x.get("id","")),"source_url":x.get("link",""),
          "company":x.get("company",""),"title":x.get("title",""),"location":x.get("location"),
          "remote":None,"salary_min":None,"salary_max":None,"currency":None,
          "description":x.get("snippet",""),"posted_at":x.get("updated")
        } for x in data.get("jobs",[])]
