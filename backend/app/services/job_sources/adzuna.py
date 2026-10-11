import os, httpx
from .base import JobSource

class AdzunaSource(JobSource):
    name="adzuna"
    async def search(self, query, countries, remote_only):
        app_id=os.getenv("ADZUNA_APP_ID"); key=os.getenv("ADZUNA_APP_KEY")
        if not app_id or not key: return []
        countries = countries or ["es"]
        out=[]
        async with httpx.AsyncClient(timeout=15) as c:
            for country in countries:
                url=f"https://api.adzuna.com/v1/api/jobs/{country.lower()}/search/1"
                params={"app_id":app_id,"app_key":key,"what":query,"results_per_page":50}
                data=(await c.get(url,params=params)).json()
                for x in data.get("results",[]):
                    out.append({
                      "source":"adzuna","source_job_id":str(x.get("id","")),
                      "source_url":x.get("redirect_url",""),
                      "company":(x.get("company") or {}).get("display_name",""),
                      "title":x.get("title",""),"location":(x.get("location") or {}).get("display_name"),
                      "remote":None,"salary_min":x.get("salary_min"),"salary_max":x.get("salary_max"),
                      "currency":None,"description":x.get("description",""),"posted_at":x.get("created")
                    })
        return out
