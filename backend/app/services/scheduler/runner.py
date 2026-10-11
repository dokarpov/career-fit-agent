from __future__ import annotations
import asyncio, time

async def run_due_once(subscription_store, job_search_service):
    summary=[]
    for sub in subscription_store.due():
        jobs=await job_search_service.search(
            sub["query"],sub["countries"],sub["remote_only"],sub["sources"] or None
        )
        new=subscription_store.record_jobs(jobs)
        subscription_store.mark_run(sub["id"])
        summary.append({"subscription":sub["id"],"found":len(jobs),"new":new})
    return summary

async def loop(subscription_store, job_search_service, sleep_seconds=60):
    while True:
        await run_due_once(subscription_store,job_search_service)
        await asyncio.sleep(sleep_seconds)
