from __future__ import annotations
import json, os
from pathlib import Path
import httpx

class EscoNormalizer:
    def __init__(self, cache_path: str|Path|None=None, base_url: str="https://ec.europa.eu/esco/api"):
        self.base_url=base_url.rstrip("/")
        self.cache_path=Path(cache_path) if cache_path else None
        self.cache={}
        if self.cache_path and self.cache_path.exists():
            self.cache=json.loads(self.cache_path.read_text(encoding="utf-8"))

    def _key(self,text,language):
        return f"{language}:{text.strip().lower()}"

    async def search_occupations(self, text: str, language: str="en", limit: int=5):
        key=self._key(text,language)
        if key in self.cache:
            return self.cache[key]
        params={
            "text":text,"language":language,"type":"occupation",
            "limit":limit,"full":"true","selectedVersion":"latest"
        }
        async with httpx.AsyncClient(timeout=15,follow_redirects=True) as c:
            r=await c.get(f"{self.base_url}/search",params=params)
            r.raise_for_status()
            data=r.json()
        results=[]
        # ESCO response shapes vary by API version; normalize common forms.
        raw=data.get("_embedded",{}).get("results") or data.get("results") or data.get("_embedded",{}).get("searchResults") or []
        for x in raw[:limit]:
            results.append({
                "uri":x.get("uri") or x.get("_links",{}).get("self",{}).get("href"),
                "title":x.get("title") or x.get("preferredLabel") or x.get("prefLabel"),
                "className":x.get("className") or x.get("type"),
                "raw":x
            })
        if self.cache_path:
            self.cache[key]=results
            self.cache_path.parent.mkdir(parents=True,exist_ok=True)
            self.cache_path.write_text(json.dumps(self.cache,ensure_ascii=False,indent=2),encoding="utf-8")
        return results

    async def normalize_title(self, title: str, language: str="en"):
        hits=await self.search_occupations(title,language,5)
        if not hits:
            return {"input":title,"status":"unresolved","occupation":None}
        return {"input":title,"status":"matched","occupation":hits[0],"alternatives":hits[1:]}
