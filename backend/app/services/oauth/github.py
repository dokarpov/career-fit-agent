from __future__ import annotations
import os
from urllib.parse import urlencode
import httpx
AUTH="https://github.com/login/oauth/authorize";TOKEN="https://github.com/login/oauth/access_token"
class GitHubOAuth:
    def __init__(self):
        self.client_id=os.getenv("GITHUB_CLIENT_ID");self.client_secret=os.getenv("GITHUB_CLIENT_SECRET");self.callback_url=os.getenv("GITHUB_OAUTH_CALLBACK_URL")
    def configured(self):return bool(self.client_id and self.client_secret and self.callback_url)
    def authorize_url(self,state):
        if not self.configured():raise RuntimeError("GitHub OAuth is not configured")
        return AUTH+"?"+urlencode({"client_id":self.client_id,"redirect_uri":self.callback_url,"scope":"read:user repo","state":state})
    async def exchange(self,code):
        async with httpx.AsyncClient(timeout=30,headers={"Accept":"application/json"}) as c:
            r=await c.post(TOKEN,data={"client_id":self.client_id,"client_secret":self.client_secret,"code":code,"redirect_uri":self.callback_url});r.raise_for_status();d=r.json()
            if d.get("error"):raise RuntimeError(d.get("error_description") or d["error"])
            return d
