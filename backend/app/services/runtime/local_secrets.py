from __future__ import annotations
import json, os
from pathlib import Path

class LocalSecretStore:
    def __init__(self,path:Path):
        self.path=path
    def read(self):
        if not self.path.exists(): return {}
        return json.loads(self.path.read_text(encoding="utf-8"))
    def write(self,data):
        self.path.parent.mkdir(parents=True,exist_ok=True)
        self.path.write_text(json.dumps(data,indent=2),encoding="utf-8")
        try: os.chmod(self.path,0o600)
        except OSError: pass
    def merge(self,updates):
        d=self.read()
        for k,v in updates.items():
            if v not in (None,""): d[k]=v
        self.write(d);return d
