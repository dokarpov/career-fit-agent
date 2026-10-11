import tempfile, unittest, sys, json, asyncio, time
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))

from app.services.evidence_store import EvidenceStore
from app.services.vector_retrieval import LocalLSIRetriever, HybridRetriever
from app.services.scheduler.subscriptions import SubscriptionStore
from app.services.connectors.gmail import parse_job_email
from app.services.scheduler.runner import run_due_once

class V08Tests(unittest.TestCase):
    def test_vector_retrieval(self):
        items=[
          {"id":"1","title":"Agent workflows","claim":"Human approval fallback","evidence":"agent routing and safe fallback","tags":["agentic"],"boundary":""},
          {"id":"2","title":"Cooking","claim":"Soup","evidence":"boil vegetables","tags":[],"boundary":""}
        ]
        v=LocalLSIRetriever().fit(items)
        hits=v.search("agent approval fallback",2)
        self.assertEqual(hits[0].item["id"],"1")

    def test_subscription_due(self):
        with tempfile.NamedTemporaryFile(suffix=".db") as f:
            s=SubscriptionStore(f.name)
            s.upsert_subscription({"id":"x","query":"product manager","countries":["es"],"remote_only":True,"sources":[],"interval_minutes":60,"enabled":True,"next_run":1})
            self.assertEqual(len(s.due(now=2)),1)

    def test_gmail_application_status(self):
        msg={"id":"1","payload":{"headers":[{"name":"Subject","value":"Thank you for applying"}],
             "mimeType":"text/plain","body":{"data":"V2UgcmVjZWl2ZWQgeW91ciBhcHBsaWNhdGlvbi4"}}}
        out=parse_job_email(msg)
        self.assertEqual(out["event_type"],"application_received")


    def test_due_crawl_persists_new_job(self):
        class FakeJobs:
            async def search(self,*args,**kwargs):
                return [{"canonical_key":"abc","source":"fixture","title":"Product Manager","company":"Example","source_url":"https://example.test/job"}]
        with tempfile.NamedTemporaryFile(suffix=".db") as f:
            s=SubscriptionStore(f.name)
            s.upsert_subscription({"id":"daily","query":"product manager","countries":["es"],"remote_only":True,"sources":[],"interval_minutes":60,"enabled":True,"next_run":1})
            result=asyncio.run(run_due_once(s,FakeJobs()))
            self.assertEqual(result[0]["new"],1)
            self.assertEqual(len(s.due(now=2)),0)

if __name__=="__main__": unittest.main()

