from __future__ import annotations
import hashlib, os
import httpx

TEXT_EXT=(".md",".txt",".json",".yaml",".yml",".py",".js",".ts",".tsx",".jsx",".html",".css")
API="https://api.github.com"

class GitHubEvidenceConnector:
    def __init__(self,token:str|None=None):
        self.token=token
    def headers(self):
        h={"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"}
        if self.token: h["Authorization"]=f"Bearer {self.token}"
        return h

    async def list_repos(self,limit:int=50):
        async with httpx.AsyncClient(timeout=20,headers=self.headers()) as c:
            r=await c.get(f"{API}/user/repos",params={"per_page":min(limit,100),"sort":"updated","affiliation":"owner,collaborator"})
            r.raise_for_status()
            return [{"full_name":x.get("full_name"),"fork":bool(x.get("fork")),"private":bool(x.get("private")),"updated_at":x.get("updated_at")} for x in r.json() if x.get("full_name")]

    async def repo_files(self,full_name:str,branch:str|None=None):
        owner,repo=full_name.split("/",1)
        async with httpx.AsyncClient(timeout=20,headers=self.headers()) as c:
            if branch is None:
                info=(await c.get(f"{API}/repos/{owner}/{repo}")).json()
                branch=info.get("default_branch","main")
            tree=(await c.get(f"{API}/repos/{owner}/{repo}/git/trees/{branch}",params={"recursive":"1"}))
            tree.raise_for_status()
            return [x for x in tree.json().get("tree",[]) if x.get("type")=="blob" and x.get("path","").lower().endswith(TEXT_EXT)]

    async def import_repo(self,full_name:str,max_files:int=100):
        files=await self.repo_files(full_name)
        owner,repo=full_name.split("/",1)
        out=[]
        async with httpx.AsyncClient(timeout=20,headers=self.headers()) as c:
            for f in files[:max_files]:
                raw=f"https://raw.githubusercontent.com/{owner}/{repo}/HEAD/{f['path']}"
                r=await c.get(raw)
                if r.status_code!=200 or len(r.content)>500_000: continue
                text=r.text
                eid="gh_"+hashlib.sha1(f"{full_name}:{f['path']}".encode()).hexdigest()[:14]
                out.append({
                  "id":eid,"source_type":"github","source_ref":f"https://github.com/{full_name}/blob/HEAD/{f['path']}",
                  "title":f"{full_name} · {f['path']}","claim":f['path'],
                  "evidence":text[:12000],"tags":["github",repo]+[x for x in f['path'].replace(".","/").split("/") if x][:8],
                  "status":"needs-review","direct":False,"visibility":"private",
                  "boundary":"Imported from GitHub. Verify authorship, ownership and claim boundary before outward use."
                })
        return out
