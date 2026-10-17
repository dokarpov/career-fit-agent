"""Regression: a first-time user receives at most ten qualified real-source-shaped jobs, no card.
These are worker unit fixtures. Live source availability is tested separately in test_real_job_sources.py.
"""
import asyncio
from types import SimpleNamespace

from app import worker


class Product:
    def __init__(self):
        self.rows = []
        self.marked = []
        self.profile = {"id":"p1","user_id":"test","query":"Product Manager",
                        "countries":[],"remote_only":True,"sources":[],
                        "interval_minutes":360}
    def due_search_profiles(self,limit=20):
        return [self.profile]
    def entitlement(self,user_id):
        return None
    def jobs(self,user_id):
        return list(self.rows)
    def preferences(self,user_id):
        return {"remote_only":True,"allow_relocation":False,
                "salary_floor_annual":0,"allowed_regions":[]}
    def funnel_policy(self,user_id):
        return {}
    def mark_search_profile_run(self,user_id,profile_id):
        self.marked.append(profile_id)
    def queue_notification(self,*args,**kwargs):
        pass


class ATS:
    async def search(self,*args,**kwargs):
        # Eleven allowed remote jobs + one explicit hybrid hard blocker.
        allowed=[{"source":"ashby","source_url":f"https://jobs.example.org/{i}",
                 "company":"Example","source_job_id":f"open-{i}","title":f"Product Manager {i}","location":"Remote",
                 "remote":True,"description":"Product discovery and research. "+("Work remotely. "*24)}
                 for i in range(11)]
        excluded={"source":"ashby","source_url":"https://jobs.example.org/hybrid",
                  "company":"Example","source_job_id":"hybrid","title":"Product Manager hybrid","location":"Office",
                  "description":"Hybrid, three days per week in the office. "*10}
        return [excluded]+allowed


class Match:
    def __init__(self,product):
        self.product=product
    def analyze_job(self,user_id,job):
        self.product.rows.append(job)
        return {"ok":True,"analysis":{"funnel":{"tier":"P2"},"summary":"Test evidence"},
                "job":{"job_id":job["source_url"],"company":job["company"],"title":job["title"]}}


def test_free_discovery_filters_blockers_caps_at_ten_and_is_idempotent(monkeypatch):
    p=Product()
    monkeypatch.setattr(worker,"product",p)
    monkeypatch.setattr(worker,"job_search",ATS())
    monkeypatch.setattr(worker,"auto_match",Match(p))
    monkeypatch.setattr(worker,"runtime",SimpleNamespace(managed=True))
    asyncio.run(worker.run_job_searches())
    assert len(p.rows)==10
    assert all("hybrid" not in row["title"] for row in p.rows)
    assert p.marked==["p1"]
    asyncio.run(worker.run_job_searches())
    assert len(p.rows)==10
    assert p.marked==["p1","p1"]
