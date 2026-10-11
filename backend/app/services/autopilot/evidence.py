from __future__ import annotations
from ..connectors.google_drive import GoogleDriveEvidenceConnector
from ..connectors.github import GitHubEvidenceConnector
from ..oauth.crypto import decrypt_json

class EvidenceAutopilot:
    def __init__(self,product,cipher,gmail_sync):self.product=product;self.cipher=cipher;self.gmail_sync=gmail_sync
    async def sync_google(self,user_id,force=False):
        if not self.product.connector_connected(user_id,"google"):return {"status":"not_connected","count":0}
        if not force and not self.product.source_sync_due(user_id,"google"):return self.product.source_sync_state(user_id,"google")
        try:
            token=await self.gmail_sync.access_token(user_id);items=await GoogleDriveEvidenceConnector(token).import_files(limit=160)
            for x in items:self.product.upsert_user_evidence(user_id,x)
            self.product.mark_source_sync(user_id,"google","ok",len(items));return {"status":"ok","count":len(items)}
        except Exception as e:
            self.product.mark_source_sync(user_id,"google","error",0,e);return {"status":"error","count":0,"error":str(e)}
    async def sync_github(self,user_id,force=False):
        if not self.product.connector_connected(user_id,"github"):return {"status":"not_connected","count":0}
        if not force and not self.product.source_sync_due(user_id,"github"):return self.product.source_sync_state(user_id,"github")
        try:
            rec=self.product.connector_token(user_id,"github");token=decrypt_json(self.cipher,rec["encrypted_json"]).get("access_token")
            gh=GitHubEvidenceConnector(token);repos=await gh.list_repos(limit=30);items=[]
            for repo in [r for r in repos if not r.get("fork")][:12]:
                try:items.extend(await gh.import_repo(repo["full_name"],max_files=60))
                except Exception:pass
            for x in items:self.product.upsert_user_evidence(user_id,x)
            self.product.mark_source_sync(user_id,"github","ok",len(items));return {"status":"ok","count":len(items)}
        except Exception as e:
            self.product.mark_source_sync(user_id,"github","error",0,e);return {"status":"error","count":0,"error":str(e)}
