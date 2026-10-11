from __future__ import annotations
import re

GENERIC={"no-reply","noreply","jobs","careers","recruiting","recruitment","talent","hiring","notifications"}

def extract_contact(email_event:dict,job_id:str|None=None):
    raw=email_event.get("from","") or email_event.get("from_","")
    m=re.search(r'(?:"?([^"<]+)"?\s*)?<([^>]+)>',raw)
    if m:
        name=(m.group(1) or "").strip();address=m.group(2).strip()
    else:
        parts=raw.strip().split()
        address=next((p for p in reversed(parts) if "@" in p),"")
        name=raw.replace(address,"").strip(' "\'')
    local=address.split("@")[0].lower() if "@" in address else ""
    if not address or any(g in local for g in GENERIC):
        return None
    return {
      "name":name or address,
      "email":address,
      "company":email_event.get("company"),
      "title":email_event.get("sender_title"),
      "source":"gmail",
      "job_id":job_id,
      "notes":"Direct human sender detected from recruiting/application correspondence."
    }
