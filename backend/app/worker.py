from __future__ import annotations
import asyncio, os
from pathlib import Path

from .services.product_state import ProductStore
from .services.runtime import runtime_config, capabilities
from .services.oauth import GoogleOAuth, cipher_for
from .services.application_tracking import GmailSyncService
from .services.notifications import TelegramNotifier
from .services.job_search import JobSearchService
from .services.auto_match import AutoMatchService
from .services.autopilot import EvidenceAutopilot, ensure_search_profiles
from .services.funnel import weekly_plan, normalize_policy

DATA_DIR=Path(os.getenv("CFA_DATA_DIR",Path(__file__).resolve().parents[1]/"data"))
DATA_DIR.mkdir(parents=True,exist_ok=True)
product=ProductStore(DATA_DIR/"product_state.db")
runtime=runtime_config()
cipher=cipher_for(DATA_DIR,runtime.managed)
google=GoogleOAuth()
sync=GmailSyncService(product,cipher,google,os.getenv("GMAIL_PUBSUB_TOPIC"),runtime)
notifier=TelegramNotifier(os.getenv("TELEGRAM_BOT_TOKEN",""),os.getenv("TELEGRAM_MINI_APP_URL",""))
job_search=JobSearchService(
  ashby_boards=[x for x in os.getenv("ASHBY_BOARDS","").split(",") if x],
  lever_sites=[x for x in os.getenv("LEVER_SITES","").split(",") if x],
  greenhouse_boards=[x for x in os.getenv("GREENHOUSE_BOARDS","").split(",") if x],
  workable_accounts=[x for x in os.getenv("WORKABLE_ACCOUNTS","").split(",") if x],
  smartrecruiters_companies=[x for x in os.getenv("SMARTRECRUITERS_COMPANIES","").split(",") if x],
  career_site_urls=[x for x in os.getenv("CAREER_SITE_URLS","").split(",") if x]+[x for x in os.getenv("VC_PORTFOLIO_JOB_URLS","").split(",") if x]
)
auto_match=AutoMatchService(product)
evidence_autopilot=EvidenceAutopilot(product,cipher,sync)

def automation_allowed(user_id):
    return capabilities(bool(product.entitlement(user_id)))["gmail_sync"]

async def process_pushes():
    for push in product.pending_gmail_pushes(50):
        watch=product.gmail_watch_by_email(push["email_address"])
        if not watch or not automation_allowed(watch["user_id"]):
            product.mark_gmail_push(push["id"],"ignored","Automation inactive or no watch")
            continue
        try:await sync.process_push(push)
        except Exception as e:print("gmail push",push["id"],repr(e))

async def renew_watches():
    if not os.getenv("GMAIL_PUBSUB_TOPIC"):return
    for watch in product.watches_due_for_renewal():
        if not automation_allowed(watch["user_id"]):continue
        try:await sync.register_watch(watch["user_id"])
        except Exception as e:print("watch renew",watch["user_id"],repr(e))

async def fallback_sync():
    # Gmail documents that push notifications can occasionally be delayed/dropped.
    for watch in product.watches_due_for_fallback(int(os.getenv("GMAIL_FALLBACK_SYNC_SECONDS","21600"))):
        if not automation_allowed(watch["user_id"]):continue
        try:await sync.history_sync(watch["user_id"],fallback=True)
        except Exception as e:print("fallback sync",watch["user_id"],repr(e))

async def dispatch_notifications():
    if not notifier.token or not notifier.mini_app_url:return
    for n in product.pending_notifications(25):
        try:
            job=product.job(n["user_id"],n.get("job_id")) if n.get("job_id") else None
            await notifier.send(n["telegram_user_id"],n["text"],n.get("job_id"),(job or {}).get("source_url"))
            product.mark_notification_sent(n["id"])
            await asyncio.sleep(.05)
        except Exception as e:
            # Backoff grows with attempts; Telegram 429 is safely retried later.
            retry=min(1800,60*(2**min(int(n["attempts"]),4)))
            product.mark_notification_failed(n["id"],e,retry)

async def retry_vacancy_fetches():
    for item in product.due_vacancy_fetches(limit=20):
        try:
            result=await auto_match.ingest_url(item["user_id"],item["url"])
            if result.get("ok"):
                product.mark_vacancy_fetch_done(item["id"])
                a=result["analysis"];j=result["job"]
                product.queue_notification(item["user_id"],"vacancy_parsed",
                  f"Vacancy parsed · {j['company']}\n{j['title']}\n{a['final_action'].replace('_',' ')} · {a['summary']}",
                  j["job_id"],dedupe_key=f"parsed:{item['id']}")
            else:
                product.mark_vacancy_fetch_failed(item["id"],result.get("error","Source unavailable"))
        except Exception as e:
            product.mark_vacancy_fetch_failed(item["id"],e)

async def run_job_searches():
    for profile in product.due_search_profiles(limit=20):
        user_id=profile["user_id"]
        # Free accounts may discover up to ten valid opportunities in either runtime mode.
        # First ten discovered opportunities are free for each signed-in user.
        # This is a server-side cap, not a frontend-only counter.
        free_limit=10
        entitled=bool(product.entitlement(user_id))
        existing_count=len(product.jobs(user_id))
        if not entitled and existing_count>=free_limit:
            product.mark_search_profile_run(user_id,profile["id"])
            continue
        try:
            found=await job_search.search(profile["query"],profile["countries"],profile["remote_only"],profile["sources"] or None)
            policy=normalize_policy(product.funnel_policy(user_id))
            scan_limit=min(260,max(120,int(policy["weekly_target"])*4))
            for job in found[:scan_limit]:
                if not entitled and len(product.jobs(user_id))>=free_limit:
                    break
                if (job.get("source") in {"adzuna","jooble"} or len(str(job.get("description") or ""))<120) and job.get("source_url"):
                    result=await auto_match.ingest_url(user_id,job["source_url"])
                else:
                    result=auto_match.analyze_job(user_id,job)
                if not result.get("ok"):continue
                a=result["analysis"];j=result["job"];tier=(a.get("funnel") or {}).get("tier")
                if tier=="P0":
                    # Exceptional roles can interrupt immediately; P1/P2/low-cost wait for the daily batch.
                    product.queue_notification(user_id,"p0_job_match",f"P0 · {j['company']}\n{j['title']}\n{a['summary']}",j["job_id"],dedupe_key=f"p0:{j['job_id']}")
            product.mark_search_profile_run(user_id,profile["id"])
        except Exception as e:
            print("job search",profile["id"],repr(e));product.mark_search_profile_run(user_id,profile["id"])

async def autopilot_maintenance():
    for user in product.active_users():
        uid=user["id"]
        if runtime.managed and not product.entitlement(uid):continue
        if product.connector_connected(uid,"google"):await evidence_autopilot.sync_google(uid)
        if product.connector_connected(uid,"github"):await evidence_autopilot.sync_github(uid)
        ensure_search_profiles(product,uid)

async def queue_daily_batches():
    import datetime
    day=datetime.datetime.utcnow().strftime("%Y-%m-%d")
    for user in product.active_users():
        uid=user["id"]
        if runtime.managed and not product.entitlement(uid):continue
        plan=weekly_plan(product.jobs(uid),product.submissions(uid),product.conversion_stats(uid),product.funnel_policy(uid))
        batch=plan.get("today_batch") or []
        if not batch:continue
        lines=[f"Today's application batch · {len(batch)} roles · ~{plan.get('today_minutes',0)} min",""]
        for i,j in enumerate(batch,1):
            tier=((j.get("payload") or {}).get("funnel") or {}).get("tier") or ""
            lines.append(f"{i}. {tier} · {j['company']} · {j['title']}")
            if j.get("source_url"):lines.append(j["source_url"])
        lines.append("")
        lines.append(f"Weekly progress: {sum(plan['completed'].values())}/{plan['target_total']} unique applications.")
        fc=plan.get("conversion_forecast") or {}
        lines.append(f"Estimated screening conversion: {fc.get('estimated_rate_low_percent','—')}–{fc.get('estimated_rate_high_percent','—')}% · ~{fc.get('expected_screenings_low','—')}–{fc.get('expected_screenings_high','—')} screening/week.")
        product.queue_notification(uid,"daily_application_batch","\n".join(lines),None,dedupe_key=f"batch:{uid}:{day}")

async def run():
    tick=0
    while True:
        await process_pushes()
        await dispatch_notifications()
        if tick%10==0:await renew_watches()
        if tick%30==0:await fallback_sync()
        if tick%10==0:
            await autopilot_maintenance()
            await run_job_searches()
            await queue_daily_batches()
        await retry_vacancy_fetches()
        product.cleanup_expired_downloads()
        tick+=1
        await asyncio.sleep(int(os.getenv("CFA_WORKER_TICK_SECONDS","30")))

if __name__=="__main__":
    asyncio.run(run())
