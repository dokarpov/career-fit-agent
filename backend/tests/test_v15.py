import tempfile, unittest, sys, os
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))

from app.services.job_ingest.fetch import parse_generic_html, canonical_url
from app.services.product_state import ProductStore
from app.services.auto_match import AutoMatchService, evaluate_constraints

HTML = r'''<html><head><script type="application/ld+json">
{"@context":"https://schema.org","@type":"JobPosting","title":"AI Product Manager",
"hiringOrganization":{"@type":"Organization","name":"Acme"},
"jobLocation":{"@type":"Place","address":{"addressLocality":"Barcelona","addressCountry":"ES"}},
"jobLocationType":"TELECOMMUTE",
"description":"We are looking for a product manager with experience in agentic workflows, human review, evaluation, schemas, analytics and product strategy. Required: ability to lead cross-functional product work and own experimentation with clear product metrics.",
"baseSalary":{"@type":"MonetaryAmount","currency":"USD","value":{"minValue":130000,"maxValue":170000}}}
</script></head><body></body></html>'''

class V15Tests(unittest.TestCase):
    def store(self):
        f=tempfile.NamedTemporaryFile(suffix=".db",delete=False);f.close()
        return ProductStore(f.name),Path(f.name)

    def evidence(self):
        return [
          {"id":"e1","source_type":"github","source_ref":"repo","title":"Agentic workflows",
           "claim":"Built agentic workflows with explicit human approval gates","evidence":"working prototype",
           "tags":["agentic","human review","approval"],"status":"verified","direct":True,"visibility":"private","boundary":"prototype scope"},
          {"id":"e2","source_type":"github","source_ref":"repo","title":"Evaluation",
           "claim":"Built deterministic evaluation cases for routing decisions","evidence":"tests",
           "tags":["evaluation","evals"],"status":"verified","direct":True,"visibility":"private","boundary":"reference implementation"},
        ]

    def test_jsonld_job_parses_without_user_text(self):
        j=parse_generic_html(HTML,"https://example.com/job")
        self.assertEqual(j["title"],"AI Product Manager")
        self.assertEqual(j["company"],"Acme")
        self.assertGreater(len(j["description"]),120)
        self.assertEqual(j["salary_min"],130000)

    def test_tracking_query_removed_from_canonical_url(self):
        self.assertEqual(canonical_url("https://x.com/a?utm_source=tg#foo"),"https://x.com/a")

    def test_auto_match_from_parsed_source(self):
        s,p=self.store()
        try:
            os.environ["CFA_SEED_DEMO"]="0"
            u=s.ensure_user({"id":55})
            for e in self.evidence():s.upsert_user_evidence(u,e)
            s.save_preferences(u,{"remote_only":True,"allow_relocation":False,"salary_floor_annual":120000,"allowed_regions":["Barcelona","ES"]})
            j=parse_generic_html(HTML,"https://example.com/job")
            result=AutoMatchService(s).analyze_job(u,j)
            self.assertTrue(result["ok"])
            self.assertIn(result["analysis"]["final_action"],{"APPLY","REVIEW_PROOF","VERIFY_FIRST","DO_NOT_APPLY"})
            self.assertGreaterEqual(result["analysis"]["verified_count"],1)
        finally:p.unlink(missing_ok=True)

    def test_remote_only_blocks_onsite(self):
        ce=evaluate_constraints({"work_mode":"onsite","relocation_required":False,"salary_min":130000,"salary_max":170000,"location":"Barcelona"},{"remote_only":True,"allow_relocation":False,"salary_floor_annual":120000,"allowed_regions":["Barcelona"]})
        self.assertEqual(ce["state"],"BLOCKED")

    def test_missing_salary_is_soft_not_rejected(self):
        ce=evaluate_constraints({"work_mode":"remote","relocation_required":False,"salary_min":None,"salary_max":None,"location":"Europe"},{"remote_only":True,"allow_relocation":False,"salary_floor_annual":120000,"allowed_regions":["Europe"]})
        self.assertEqual(ce["state"],"CLEAR")
        self.assertTrue(any("Compensation" in x for x in ce["notes"]))

    def test_search_profiles_are_user_scoped(self):
        s,p=self.store()
        try:
            os.environ["CFA_SEED_DEMO"]="0"
            a=s.ensure_user({"id":1});b=s.ensure_user({"id":2})
            pr=s.upsert_search_profile(a,{"query":"AI Product Manager","countries":["ES"],"remote_only":True})
            self.assertEqual(pr["user_id"],a)
            self.assertEqual(len([x for x in s.due_search_profiles() if x["user_id"]==b]),0)
        finally:p.unlink(missing_ok=True)

    def test_real_user_does_not_receive_demo_jobs(self):
        s,p=self.store()
        old=os.environ.get("CFA_SEED_DEMO")
        try:
            os.environ["CFA_SEED_DEMO"]="0"
            u=s.ensure_user({"id":987})
            self.assertEqual(s.jobs(u),[])
        finally:
            if old is None:os.environ.pop("CFA_SEED_DEMO",None)
            else:os.environ["CFA_SEED_DEMO"]=old
            p.unlink(missing_ok=True)

    def test_failed_url_can_be_queued_without_user_copying_description(self):
        s,p=self.store()
        old=os.environ.get("CFA_SEED_DEMO")
        try:
            os.environ["CFA_SEED_DEMO"]="0"
            u=s.ensure_user({"id":1001})
            q=s.queue_vacancy_fetch(u,"https://example.com/private-job","blocked",delay_seconds=0)
            due=s.due_vacancy_fetches()
            self.assertTrue(any(x["id"]==q for x in due))
            s.mark_vacancy_fetch_failed(q,"still blocked")
            row=s.conn.execute("SELECT attempts,state FROM vacancy_fetch_queue WHERE id=?",(q,)).fetchone()
            self.assertEqual(row["attempts"],1)
        finally:
            if old is None:os.environ.pop("CFA_SEED_DEMO",None)
            else:os.environ["CFA_SEED_DEMO"]=old
            p.unlink(missing_ok=True)

if __name__=="__main__":unittest.main()
