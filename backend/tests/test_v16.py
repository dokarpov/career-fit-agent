import os,tempfile,unittest,sys,time
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))

from app.services.product_state import ProductStore
from app.services.funnel import classify,adaptive_quotas,weekly_plan,submission_candidate,application_base_key
from app.services.autopilot import ensure_search_profiles
from app.services.auto_match.service import evaluate_constraints
from app.services.job_search import JobSearchService

class V16Tests(unittest.TestCase):
    def store(self):
        f=tempfile.NamedTemporaryFile(suffix='.db',delete=False);f.close();return ProductStore(f.name),Path(f.name)
    def evidence(self):
        return {"id":"e1","source_type":"github","source_ref":"repo","title":"Agentic workflows","claim":"Built agentic workflows with human approval and evaluation","evidence":"prototype","tags":["agentic","evaluation","product"],"status":"verified","direct":True,"visibility":"private","boundary":"prototype"}
    def base_analysis(self,verified=2,must=5,gaps=2,review=1,salary=None,work_mode='remote'):
        return {"verified_count":verified,"must_have_count":must,"gap_count":gaps,"review_count":review,"constraints":{"salary_min":salary,"salary_max":salary,"currency":"EUR","work_mode":work_mode,"relocation_required":False,"location":"Europe"},"constraint_evaluation":{"hard":[],"unknown":[],"notes":[],"state":"CLEAR"}}

    def test_baseline_funnel_targets_23_not_15(self):
        q=adaptive_quotas({},{})
        self.assertEqual((q['P01'],q['P2'],q['LOW_COST']),(6,10,7))
        self.assertEqual(q['P01']+q['P2']+q['LOW_COST'],23)

    def test_adaptive_allocation_moves_volume_to_better_tier(self):
        stats={"P1":{"applications":30,"strong":4,"avg_minutes":20},"P2":{"applications":30,"strong":0,"avg_minutes":20},"LOW_COST":{"applications":20,"strong":0,"avg_minutes":5}}
        q=adaptive_quotas(stats,{})
        self.assertEqual(q['mode'],'adaptive')
        self.assertGreater(q['P01'],5)
        self.assertLessEqual(q['P2'],12)

    def test_missing_requirements_do_not_auto_reject_good_eligible_role(self):
        job={"title":"Senior Product Manager","company":"A","description":"Product strategy and agentic workflows for a remote team.","source":"greenhouse"}
        f=classify(job,self.base_analysis(verified=2,must=5,gaps=2,review=1,salary=130000),{"remote_only":True,"allow_relocation":False},{})
        self.assertIn(f['tier'],{'P1','P2'})

    def test_undisclosed_salary_changes_priority_not_eligibility(self):
        job={"title":"Senior Product Manager","company":"A","description":"Remote product strategy with agentic workflows and evaluation.","source":"greenhouse"}
        f=classify(job,self.base_analysis(verified=4,must=5,gaps=1,review=0,salary=None),{"remote_only":True,"allow_relocation":False},{})
        self.assertIn(f['tier'],{'P1','P2'})

    def test_clear_bad_compensation_is_blocked(self):
        job={"title":"Senior Product Manager","company":"A","description":"Remote product strategy.","source":"greenhouse"}
        f=classify(job,self.base_analysis(verified=4,must=5,gaps=0,review=0,salary=70000),{"remote_only":True,"allow_relocation":False},{})
        self.assertEqual(f['tier'],'BLOCKED')

    def test_remote_unknown_is_verify_not_fake_reject(self):
        ce=evaluate_constraints({"work_mode":"unknown","relocation_required":False,"salary_min":None,"salary_max":None,"location":"Europe"},{"remote_only":True,"allow_relocation":False,"allowed_regions":["Europe"]})
        self.assertEqual(ce['state'],'VERIFY')

    def test_operations_can_be_explicit_hard_exclusion(self):
        job={"title":"Product Operations Manager","company":"A","description":"Own product operations.","source":"greenhouse"}
        f=classify(job,self.base_analysis(4,5,0,0,130000),{}, {"excluded_role_terms":["operations"]})
        self.assertEqual(f['tier'],'BLOCKED')

    def test_duplicate_submission_not_eligible(self):
        s,p=self.store();old=os.environ.get('CFA_SEED_DEMO');os.environ['CFA_SEED_DEMO']='0'
        try:
            u=s.ensure_user({'id':1601});s.upsert_user_evidence(u,self.evidence())
            job={"job_id":"j1","company":"Acme","title":"Senior Product Manager","payload":{"source":"greenhouse","source_job_id":"123","description":"remote product role","analysis":{"requirements":[{"label":"product strategy"}]}}}
            c1=submission_candidate(s,u,job,{})
            s.record_submission(u,'j1',c1['application_key'],c1['base_key'],'P1',c1['requisition_id'],c1['role_fingerprint'],c1['evidence_version'],source='greenhouse',estimated_minutes=5,payload={"requirement_labels":c1['requirement_labels']})
            c2=submission_candidate(s,u,job,{})
            self.assertFalse(c2['eligible']);self.assertEqual(c2['reason'],'duplicate_application')
        finally:
            if old is None:os.environ.pop('CFA_SEED_DEMO',None)
            else:os.environ['CFA_SEED_DEMO']=old
            p.unlink(missing_ok=True)

    def test_new_requisition_is_new_application_identity(self):
        a={"company":"Acme","title":"Senior Product Manager","source":"greenhouse","source_job_id":"111"}
        b={"company":"Acme","title":"Senior Product Manager","source":"greenhouse","source_job_id":"222"}
        self.assertNotEqual(application_base_key(a),application_base_key(b))

    def test_autopilot_infers_search_from_evidence_without_user_query(self):
        s,p=self.store();old=os.environ.get('CFA_SEED_DEMO');os.environ['CFA_SEED_DEMO']='0'
        try:
            u=s.ensure_user({'id':1602});s.upsert_user_evidence(u,self.evidence())
            out=ensure_search_profiles(s,u)
            self.assertEqual(out['mode'],'inferred');self.assertTrue(out['profiles'])
        finally:
            if old is None:os.environ.pop('CFA_SEED_DEMO',None)
            else:os.environ['CFA_SEED_DEMO']=old
            p.unlink(missing_ok=True)

    def test_source_registry_expanded_beyond_aggregators(self):
        svc=JobSearchService(workable_accounts=['x'],smartrecruiters_companies=['y'],career_site_urls=['https://example.com/careers'])
        self.assertTrue({'greenhouse','lever','ashby','workable','smartrecruiters','career_sites','adzuna','jooble'}.issubset(set(svc.sources)))

    def test_weekly_plan_excludes_already_submitted_job(self):
        job={"job_id":"j1","company":"A","title":"PM","payload":{"analysis":{"funnel":{"tier":"P1","value_score":80,"estimated_minutes":5}}}}
        submissions=[{"job_id":"j1","tier":"P1","submitted_at":time.time(),"is_unique":1}]
        plan=weekly_plan([job],submissions,{}, {})
        self.assertEqual(plan['queue'],[])

    def test_50_to_75_is_gradual_learning_not_full_reallocation(self):
        stats={"P1":{"applications":25,"strong":4,"avg_minutes":20},"P2":{"applications":20,"strong":0,"avg_minutes":20},"LOW_COST":{"applications":15,"strong":0,"avg_minutes":5}}
        q=adaptive_quotas(stats,{})
        self.assertEqual(q['mode'],'learning')
        self.assertGreater(q['learning_progress'],0)
        self.assertLess(q['learning_progress'],1)
        self.assertEqual(q['P01']+q['P2']+q['LOW_COST'],23)

    def test_75_plus_is_fully_adaptive(self):
        stats={"P1":{"applications":30,"strong":4,"avg_minutes":20},"P2":{"applications":30,"strong":0,"avg_minutes":20},"LOW_COST":{"applications":15,"strong":0,"avg_minutes":5}}
        q=adaptive_quotas(stats,{})
        self.assertEqual(q['mode'],'adaptive')
        self.assertEqual(q['sample'],75)

    def test_cross_source_duplicate_base_key_without_requisition(self):
        a={"company":"Acme Inc","title":"Senior Product Manager","source":"adzuna","source_job_id":"listing-a"}
        b={"company":"Acme Inc","title":"Senior Product Manager","source":"jooble","source_job_id":"listing-b"}
        self.assertEqual(application_base_key(a),application_base_key(b))

    def test_explicit_us_only_remote_blocks_spain_profile(self):
        from app.services.auto_match.service import extract_constraints
        job={"description":"This is a fully remote role. Candidates must be based in the United States.","location":"Remote"}
        c=extract_constraints(job)
        ce=evaluate_constraints(c,{"remote_only":True,"allow_relocation":False,"home_region":"Spain","allowed_regions":["Spain","Europe"]})
        self.assertEqual(c['remote_geo_restriction'],'US')
        self.assertEqual(ce['state'],'BLOCKED')

    def test_low_cost_bet_is_reachable_for_imperfect_but_defensible_match(self):
        job={"title":"Senior Product Manager","company":"A","description":"Remote product role with several adjacent requirements.","source":"greenhouse"}
        f=classify(job,self.base_analysis(verified=1,must=6,gaps=4,review=1,salary=None),{"remote_only":True,"allow_relocation":False},{})
        self.assertEqual(f['tier'],'LOW_COST')
        self.assertLessEqual(f['estimated_minutes'],5)

if __name__=='__main__':unittest.main()
