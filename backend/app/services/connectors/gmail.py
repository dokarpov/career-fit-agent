from __future__ import annotations
import base64, email, re
from email.header import decode_header
import httpx

GMAIL="https://gmail.googleapis.com/gmail/v1"

def _decode_b64url(s):
    return base64.urlsafe_b64decode(s + "="*((4-len(s)%4)%4))

def _headers(payload):
    return {h["name"].lower():h["value"] for h in payload.get("headers",[])}

def _walk_content(part):
    mime=part.get("mimeType","")
    data=(part.get("body") or {}).get("data")
    texts=[];urls=[]
    if data and mime in ("text/plain","text/html"):
        raw=_decode_b64url(data).decode("utf-8","ignore")
        urls.extend(re.findall(r"https?://[^\s<>\"']+",raw))
        if mime=="text/html":
            urls.extend(re.findall(r"href=[\"'](https?://[^\"']+)[\"']",raw,re.I))
            raw=re.sub(r"<[^>]+>"," ",raw)
        texts.append(raw)
    for child in part.get("parts",[]) or []:
        t,u=_walk_content(child);texts.append(t);urls.extend(u)
    return "\n".join(x for x in texts if x),urls

def _walk_text(part):
    return _walk_content(part)[0]

def parse_job_email(message:dict)->dict:
    payload=message.get("payload") or {}
    h=_headers(payload)
    subject=h.get("subject","")
    body,part_urls=_walk_content(payload)
    blob=(subject+" "+body).lower()
    strong_offer = any(x in blob for x in [
        "offer of employment","employment offer","offer letter",
        "pleased to offer you","we would like to offer you","we'd like to offer you",
        "formal offer for the position","job offer for the position"
    ])
    if strong_offer:
        event="offer_candidate"
    elif any(x in blob for x in ["not move forward","decided not to","other candidates","unfortunately","regret to inform"]):
        event="rejected"
    elif any(x in blob for x in ["received your application","thank you for applying","application received","we received your application"]):
        event="application_received"
    elif any(x in blob for x in ["interview","phone call","schedule a call","schedule an interview","talk to you","next interview"]):
        event="recruiter_or_interview"
    elif any(x in blob for x in ["job alert","jobs for you","new jobs","vacancies"]):
        event="job_alert"
    else:
        event="other"
    urls=list(dict.fromkeys(part_urls + re.findall(r'https?://[^\s<>"\']+',body)))
    return {
      "message_id":message.get("id"),"subject":subject,
      "from":h.get("from",""),"date":h.get("date",""),
      "event_type":event,"urls":urls[:30],
      "body_text":body[:20000]
    }

class GmailConnector:
    def __init__(self,access_token:str):
        self.token=access_token
    def headers(self): return {"Authorization":f"Bearer {self.token}"}

    async def search(self,q:str,max_results:int=100):
        async with httpx.AsyncClient(timeout=20) as c:
            r=await c.get(f"{GMAIL}/users/me/messages",headers=self.headers(),params={"q":q,"maxResults":max_results})
            r.raise_for_status()
            return r.json().get("messages",[])

    async def get(self,message_id:str):
        async with httpx.AsyncClient(timeout=20) as c:
            r=await c.get(f"{GMAIL}/users/me/messages/{message_id}",headers=self.headers(),params={"format":"full"})
            r.raise_for_status()
            return r.json()


    async def profile(self):
        async with httpx.AsyncClient(timeout=20) as c:
            r=await c.get(f"{GMAIL}/users/me/profile",headers=self.headers())
            r.raise_for_status()
            return r.json()

    async def watch(self,topic_name:str,label_ids:list[str]|None=None):
        body={"topicName":topic_name}
        if label_ids:
            body["labelIds"]=label_ids
            body["labelFilterBehavior"]="INCLUDE"
        async with httpx.AsyncClient(timeout=20) as c:
            r=await c.post(f"{GMAIL}/users/me/watch",headers={**self.headers(),"Content-Type":"application/json"},json=body)
            r.raise_for_status()
            return r.json()

    async def history(self,start_history_id:str,max_results:int=100):
        out=[];page=None
        async with httpx.AsyncClient(timeout=25) as c:
            while True:
                params={"startHistoryId":str(start_history_id),"historyTypes":"messageAdded","maxResults":max_results}
                if page:params["pageToken"]=page
                r=await c.get(f"{GMAIL}/users/me/history",headers=self.headers(),params=params)
                r.raise_for_status()
                data=r.json()
                out.extend(data.get("history",[]))
                page=data.get("nextPageToken")
                if not page:
                    return {"history":out,"historyId":data.get("historyId")}

    async def stop_watch(self):
        async with httpx.AsyncClient(timeout=20) as c:
            r=await c.post(f"{GMAIL}/users/me/stop",headers=self.headers())
            r.raise_for_status()
            return True
