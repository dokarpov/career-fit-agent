"""Live external ATS contract check: this is not a mocked job or a fake vacancy."""
import asyncio
from urllib.parse import urlsplit
from app.services.job_search import JobSearchService

def test_real_public_ats_produces_traceable_jobs():
    svc=JobSearchService(ashby_boards=["openai","elevenlabs","ashby"])
    found=asyncio.run(svc.search("Product Manager",remote_only=False,sources=["ashby"]))
    assert found,"Configured public ATS boards returned no real Product Manager vacancies"
    assert all(j.get("title") and j.get("company") and j.get("source_url") for j in found[:10])
    assert all(urlsplit(j["source_url"]).scheme in {"http","https"} for j in found[:10])
    print("real live job listings:",len(found))
