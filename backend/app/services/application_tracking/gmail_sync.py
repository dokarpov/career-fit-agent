from __future__ import annotations
import time, httpx
from ..connectors.gmail import GmailConnector, parse_job_email
from ..oauth.crypto import encrypt_json, decrypt_json
from .state import reduce_application_state
from ..funnel import submission_candidate

DEFAULT_QUERY='newer_than:180d ("application" OR interview OR "offer letter" OR "employment offer" OR "thank you for applying" OR "job alert" OR "jobs for you" OR vacancies) -in:spam -in:trash' 

def _job_like_url(url):
    u=str(url or "").lower()
    if any(x in u for x in ("unsubscribe","preferences","privacy","support","pixel","mailto:")):return False
    return any(x in u for x in ("/job","/jobs","career","greenhouse","lever.co","ashbyhq","workable","smartrecruiters","linkedin.com/jobs","wellfound.com/jobs","ycombinator.com/companies"))

class GmailSyncService:
    def __init__(self,product_store,cipher,google_oauth,pubsub_topic:str|None=None,runtime=None):
        self.product=product_store
        self.cipher=cipher
        self.google=google_oauth
        self.topic=pubsub_topic
        self.runtime=runtime

    async def access_token(self,user_id):
        rec=self.product.connector_token(user_id,"google")
        if not rec: raise LookupError("Google connector not connected")
        tok=decrypt_json(self.cipher,rec["encrypted_json"])
        now=time.time()
        expires_at=float(tok.get("expires_at") or 0)
        if tok.get("access_token") and (not expires_at or expires_at>now+90):
            return tok["access_token"]
        refresh=tok.get("refresh_token")
        if not refresh: raise PermissionError("Google connector requires reauthorization")
        fresh=await self.google.refresh(refresh)
        fresh["refresh_token"]=refresh
        fresh["obtained_at"]=now
        fresh["expires_at"]=now+int(fresh.get("expires_in",3600))
        self.product.save_connector_token(user_id,"google",encrypt_json(self.cipher,fresh),rec.get("scopes",""))
        return fresh["access_token"]

    def _notification_text(self,event,job):
        company=(job or {}).get("company") or "Application"
        role=(job or {}).get("title") or ""
        typ=event["event_type"]
        if typ=="offer_candidate":
            return f"Possible offer email · {company}\n{role}\nReview the email before confirming the outcome."
        if typ=="recruiter_or_interview":
            return f"Recruiter / interview signal · {company}\n{role}\nA new recruiting email needs attention."
        if typ=="rejected":
            return f"Application update · {company}\n{role}\nA rejection signal was detected and added to the search history."
        return None

    def ingest_event(self,user_id,event):
        if event["event_type"]=="other":return False,None
        if event["event_type"]=="job_alert":
            inserted=self.product.add_email_event(user_id,event,None)
            for url in [u for u in (event.get("urls") or []) if _job_like_url(u)][:30]:
                self.product.queue_vacancy_fetch(user_id,url,delay_seconds=0)
            return inserted,None
        job_id=self.product.match_event_to_job(user_id,event)
        inserted=self.product.add_email_event(user_id,event,job_id)
        job=self.product.job(user_id,job_id) if job_id else None
        if inserted and event["event_type"]=="application_received" and job:
            funnel=(job.get("payload") or {}).get("funnel") or ((job.get("payload") or {}).get("analysis") or {}).get("funnel") or {}
            cand=submission_candidate(self.product,user_id,job,self.product.funnel_policy(user_id))
            if cand["eligible"]:
                self.product.record_submission(user_id,job_id,cand["application_key"],cand["base_key"],funnel.get("tier") or "P2",
                  cand.get("requisition_id"),cand.get("role_fingerprint"),cand.get("evidence_version"),
                  source=(job.get("payload") or {}).get("source"),estimated_minutes=funnel.get("estimated_minutes"),
                  payload={"requirement_labels":cand.get("requirement_labels") or [],"email_message_id":event.get("message_id")})
        if inserted and event["event_type"] in {"offer_candidate","recruiter_or_interview","rejected","offer_confirmed"}:
            if job_id:
                updated=self.product.update_application_response(user_id,job_id,event["event_type"])
                # A recruiter/rejection/offer email is itself evidence that an application existed.
                # If the ATS never sent an "application received" email, infer the missing submission once.
                if not updated and job:
                    funnel=(job.get("payload") or {}).get("funnel") or ((job.get("payload") or {}).get("analysis") or {}).get("funnel") or {}
                    cand=submission_candidate(self.product,user_id,job,self.product.funnel_policy(user_id))
                    if cand["eligible"]:
                        self.product.record_submission(user_id,job_id,cand["application_key"],cand["base_key"],funnel.get("tier") or "P2",
                          cand.get("requisition_id"),cand.get("role_fingerprint"),cand.get("evidence_version"),source=(job.get("payload") or {}).get("source"),
                          estimated_minutes=funnel.get("estimated_minutes"),payload={"requirement_labels":cand.get("requirement_labels") or [],"inferred_from_response":event["event_type"]})
                        self.product.update_application_response(user_id,job_id,event["event_type"])
            if event["event_type"] in {"offer_candidate","recruiter_or_interview","rejected"}:
                text=self._notification_text(event,job)
                self.product.queue_notification(user_id,event["event_type"],text,job_id,dedupe_key=f"email:{event['message_id']}:{event['event_type']}")
        return inserted,job_id

    async def full_sync(self,user_id,query=DEFAULT_QUERY,max_results=100):
        token=await self.access_token(user_id)
        gmail=GmailConnector(token)
        refs=await gmail.search(query,max_results)
        imported=0;offer_candidates=[]
        for ref in refs:
            try: msg=await gmail.get(ref["id"])
            except Exception: continue
            ev=parse_job_email(msg)
            inserted,job_id=self.ingest_event(user_id,ev)
            if inserted:
                imported+=1
                if ev["event_type"]=="offer_candidate":
                    offer_candidates.append({"job_id":job_id,"subject":ev.get("subject")})
        return {"imported":imported,"offer_candidates":offer_candidates}

    async def register_watch(self,user_id):
        if not self.topic:
            return {"enabled":False,"reason":"GMAIL_PUBSUB_TOPIC is not configured"}
        token=await self.access_token(user_id)
        gmail=GmailConnector(token)
        profile=await gmail.profile()
        result=await gmail.watch(self.topic,["INBOX"])
        self.product.save_gmail_watch(
          user_id,profile["emailAddress"],result.get("historyId"),result.get("expiration")
        )
        return {"enabled":True,"email":profile["emailAddress"],**result}

    async def history_sync(self,user_id,notification=False,fallback=False):
        watch=self.product.gmail_watch(user_id)
        if not watch or not watch.get("last_history_id"):
            full=await self.full_sync(user_id)
            registered=await self.register_watch(user_id)
            return {"mode":"full","full":full,"watch":registered}
        token=await self.access_token(user_id)
        gmail=GmailConnector(token)
        try:
            result=await gmail.history(watch["last_history_id"])
        except httpx.HTTPStatusError as e:
            # Gmail returns 404 when startHistoryId is too old. Reconstruct conservatively.
            if e.response.status_code==404:
                full=await self.full_sync(user_id)
                registered=await self.register_watch(user_id)
                return {"mode":"full_after_stale_history","full":full,"watch":registered}
            raise

        message_ids=[]
        for h in result.get("history",[]):
            for added in h.get("messagesAdded",[]):
                mid=(added.get("message") or {}).get("id")
                if mid:message_ids.append(mid)
        imported=0
        for mid in dict.fromkeys(message_ids):
            try: msg=await gmail.get(mid)
            except Exception: continue
            ev=parse_job_email(msg)
            inserted,_=self.ingest_event(user_id,ev)
            imported += int(inserted)
        new_history=result.get("historyId") or watch["last_history_id"]
        self.product.update_gmail_history(user_id,new_history,notification=notification,fallback=fallback)
        return {"mode":"history","messages_seen":len(set(message_ids)),"imported":imported,"history_id":new_history}

    async def process_push(self,push:dict):
        watch=self.product.gmail_watch_by_email(push["email_address"])
        if not watch:
            self.product.mark_gmail_push(push["id"],"ignored","No connected user for email")
            return {"ignored":True}
        try:
            result=await self.history_sync(watch["user_id"],notification=True)
            # PubSub history id can be ahead even if Gmail returns no matching job email.
            latest=result.get("history_id") or push.get("history_id")
            if latest:self.product.update_gmail_history(watch["user_id"],latest,notification=True)
            self.product.mark_gmail_push(push["id"],"done")
            return result
        except Exception as e:
            self.product.mark_gmail_push(push["id"],"pending",str(e))
            raise
