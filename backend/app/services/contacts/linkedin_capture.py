from __future__ import annotations
import re

def parse_linkedin_snapshot(snapshot:dict,job_id=None):
    url=snapshot.get("url","")
    if "linkedin.com/in/" not in url:
        return None
    title=snapshot.get("title","")
    text=snapshot.get("text","")
    name=title.split("|")[0].split("- LinkedIn")[0].strip()
    lines=[x.strip() for x in text.splitlines() if x.strip()]
    headline=next((x for x in lines[1:12] if len(x)<180 and x!=name),None)
    company=None
    if headline and " at " in headline:
        company=headline.rsplit(" at ",1)[-1].strip()
    return {
      "name":name or "LinkedIn contact","title":headline,"company":company,
      "linkedin_url":url.split("?")[0],"source":"linkedin_capture",
      "job_id":job_id,"state":"new"
    }
