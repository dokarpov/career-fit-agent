from __future__ import annotations
import hashlib, io
import httpx

DRIVE="https://www.googleapis.com/drive/v3"
GOOGLE_MIME={
 "application/vnd.google-apps.document":"text/plain",
 "application/vnd.google-apps.spreadsheet":"text/csv",
 "application/vnd.google-apps.presentation":"text/plain"
}

class GoogleDriveEvidenceConnector:
    """Read-only Drive connector using an OAuth access token.

    Use scope: https://www.googleapis.com/auth/drive.readonly
    """
    def __init__(self,access_token:str):
        self.token=access_token
    def headers(self): return {"Authorization":f"Bearer {self.token}"}

    async def list_files(self,q:str|None=None,page_size:int=100):
        params={"pageSize":page_size,"fields":"nextPageToken,files(id,name,mimeType,modifiedTime,webViewLink,md5Checksum)"}
        if q: params["q"]=q
        out=[]; token=None
        async with httpx.AsyncClient(timeout=30) as c:
            while True:
                if token: params["pageToken"]=token
                r=await c.get(f"{DRIVE}/files",headers=self.headers(),params=params); r.raise_for_status()
                data=r.json(); out.extend(data.get("files",[])); token=data.get("nextPageToken")
                if not token: break
        return out

    async def download_text(self,file:dict):
        mime=file["mimeType"]
        async with httpx.AsyncClient(timeout=30) as c:
            if mime in GOOGLE_MIME:
                r=await c.get(f"{DRIVE}/files/{file['id']}/export",headers=self.headers(),params={"mimeType":GOOGLE_MIME[mime]})
            else:
                r=await c.get(f"{DRIVE}/files/{file['id']}",headers=self.headers(),params={"alt":"media"})
            r.raise_for_status()
            return r.text

    async def import_files(self,q:str|None=None,limit:int=200):
        files=await self.list_files(q)
        out=[]
        for f in files[:limit]:
            try: text=await self.download_text(f)
            except Exception: continue
            eid="gd_"+hashlib.sha1(f["id"].encode()).hexdigest()[:14]
            out.append({
              "id":eid,"source_type":"google_drive","source_ref":f.get("webViewLink") or f["id"],
              "title":f["name"],"claim":f["name"],"evidence":text[:12000],
              "tags":["google-drive"],"status":"needs-review","direct":False,"visibility":"private",
              "boundary":"Imported from Google Drive. Verify ownership and outward-sharing permission before use."
            })
        return out
