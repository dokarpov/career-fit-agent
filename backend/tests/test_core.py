import tempfile, unittest
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.jobs import normalize, dedupe
from app.services.evidence_store import EvidenceStore
from app.services.evidence_ingest import atomize_text
from app.services.gap_resolver import resolve_gap

class CoreTests(unittest.TestCase):
    def test_job_dedupe(self):
        jobs=[
          {"source":"a","source_job_id":"1","source_url":"https://x/a?utm=1","company":"Acme","title":"Product Manager","location":"Remote","description":"short"},
          {"source":"b","source_job_id":"2","source_url":"https://y/b","company":"Acme","title":"Product Manager","location":"Remote","description":"a much longer canonical description"}
        ]
        out=dedupe(jobs)
        self.assertEqual(len(out),1)
        self.assertEqual(len(out[0]["sources"]),2)
        self.assertIn("much longer",out[0]["description"])

    def test_atomized_evidence_is_not_verified(self):
        items=atomize_text("# Project\n\nBuilt a working prototype and tested it with five cases.", "demo.md")
        self.assertTrue(items)
        self.assertEqual(items[0]["status"],"needs-review")

    def test_fts_search(self):
        with tempfile.NamedTemporaryFile(suffix=".db") as f:
            s=EvidenceStore(f.name)
            s.upsert({
              "id":"e1","source_type":"file","source_ref":"x","title":"Agent workflow",
              "claim":"Human approval boundary","evidence":"Fallback before external send",
              "tags":["agent","approval"],"status":"verified","direct":True,"visibility":"public"
            })
            self.assertTrue(s.search("approval"))

    def test_gap_never_fabricates(self):
        out=resolve_gap("production RAG",[],True)
        self.assertEqual(out["state"],"ask_user")

if __name__=="__main__":
    unittest.main()
