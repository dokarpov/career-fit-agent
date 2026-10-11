import httpx
from .base import JobSource
class WorkableSource(JobSource):
    name="workable"
    def __init__(self,accounts=None):self.accounts=accounts or []
    async def search(self,query,countries,remote_only):
        out=[]
        async with httpx.AsyncClient(timeout=18,follow_redirects=True) as c:
            for account in self.accounts:
                try:r=await c.get(f"https://www.workable.com/api/accounts/{account}",params={"details":"true"});r.raise_for_status();data=r.json()
                except Exception:continue
                company=data.get("name") or account
                for x in data.get("jobs",[]):
                    desc=x.get("description") or x.get("full_description") or "";title=x.get("title") or ""
                    if query.lower() not in (title+" "+desc).lower():continue
                    loc=", ".join(str(x.get(k)) for k in ("city","state","country") if x.get(k))
                    out.append({"source":"workable","source_job_id":x.get("shortcode") or x.get("code"),"source_url":x.get("url") or x.get("application_url") or "",
                      "company":company,"title":title,"location":loc or None,"remote":x.get("workplace_type")=="remote","salary_min":None,"salary_max":None,"currency":None,
                      "description":desc,"posted_at":x.get("created_at")})
        return out
