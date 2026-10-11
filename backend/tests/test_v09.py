import tempfile, unittest, sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from app.services.analytics.metrics import dashboard_metrics
from app.services.analytics.insights import generate_insights
from app.services.state.career_store import CareerStore
from app.services.contacts.email_contacts import extract_contact
from app.services.contacts.linkedin_capture import parse_linkedin_snapshot
from app.services.outreach.drafts import build_outreach_draft

class V09Tests(unittest.TestCase):
    def test_efficiency_is_transparent_ratio(self):
        m=dashboard_metrics(search_start="2026-08-01",applications=73,rejections=24,interviews=3,plan_per_week=10,today=__import__("datetime").date(2026,10,2))
        self.assertEqual(m["market_interview_benchmark_pct"],4.83)
        self.assertEqual(m["efficiency_coefficient"],0.85)

    def test_notes_persist_per_job(self):
        with tempfile.NamedTemporaryFile(suffix=".db") as f:
            s=CareerStore(f.name)
            s.upsert_job({"id":"j1","company":"A","title":"PM"})
            s.add_note("j1","Ask about salary")
            self.assertEqual(s.notes("j1")[0]["body"],"Ask about salary")

    def test_five_rejections_trigger_learning_not_fake_causality(self):
        apps=[{"id":f"a{i}","package_id":"p1","source":"direct"} for i in range(5)]
        outcomes=[{"application_id":f"a{i}","event_type":"rejected"} for i in range(5)]
        insights=generate_insights(apps,[],outcomes)
        self.assertTrue(any(x["type"]=="data_gap" for x in insights))

    def test_human_email_becomes_contact(self):
        c=extract_contact({"from":"Alex Smith <alex@company.com>","company":"Company"})
        self.assertEqual(c["email"],"alex@company.com")
        self.assertIsNone(extract_contact({"from":"no-reply@company.com"}))

    def test_linkedin_capture_requires_profile(self):
        self.assertIsNotNone(parse_linkedin_snapshot({"url":"https://www.linkedin.com/in/alex-smith/","title":"Alex Smith | LinkedIn","text":"Alex Smith\\nHead of Product at Acme"}))
        self.assertIsNone(parse_linkedin_snapshot({"url":"https://www.linkedin.com/jobs/view/1","title":"Job","text":"x"}))

    def test_outreach_uses_verified_proof_input(self):
        d=build_outreach_draft({"company":"Acme","title":"AI PM"},{"name":"Alex"},[{"requirement":"Human review","claim":"Built an approval boundary"}])
        self.assertIn("Built an approval boundary",d["body"])
        self.assertEqual(d["status"],"draft")

if __name__=="__main__": unittest.main()
