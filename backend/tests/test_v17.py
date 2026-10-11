import tempfile,unittest,sys,os
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from app.services.funnel import normalize_policy,adaptive_quotas,conversion_forecast,classify,weekly_plan
from app.services.product_state import ProductStore
from app.services.autopilot import ensure_search_profiles

class V17Tests(unittest.TestCase):
    def store(self):
        f=tempfile.NamedTemporaryFile(suffix='.db',delete=False);f.close();return ProductStore(f.name),Path(f.name)
    def analysis(self,verified=2,must=6,gaps=3,salary=None):
        return {"verified_count":verified,"must_have_count":must,"gap_count":gaps,"review_count":1,"constraints":{"salary_min":salary,"salary_max":salary,"currency":"EUR","work_mode":"remote","relocation_required":False,"location":"Europe"},"constraint_evaluation":{"hard":[],"unknown":[],"notes":[],"state":"CLEAR"}}
    def test_urgent_is_45_per_week(self):
        p=normalize_policy({"pace_preset":"urgent"});self.assertEqual(p["weekly_target"],45);q=adaptive_quotas({},p);self.assertEqual((q['P01'],q['P2'],q['LOW_COST']),(12,20,13))
    def test_custom_target_50(self):
        p=normalize_policy({"pace_preset":"custom","weekly_target":50});self.assertEqual(p['weekly_target'],50);q=adaptive_quotas({},p);self.assertEqual(q['P01']+q['P2']+q['LOW_COST'],50)
    def test_custom_target_is_bounded(self):
        self.assertEqual(normalize_policy({"pace_preset":"custom","weekly_target":100})['weekly_target'],60);self.assertEqual(normalize_policy({"pace_preset":"custom","weekly_target":1})['weekly_target'],10)
    def test_conversion_forecast_exists_with_zero_history(self):
        f=conversion_forecast({},45,{});self.assertEqual((f['estimated_rate_low_percent'],f['estimated_rate_high_percent']),(3.0,6.0));self.assertEqual((f['expected_screenings_low'],f['expected_screenings_high']),(1.35,2.7));self.assertEqual(f['mode'],'baseline')
    def test_conversion_blends_observed_history(self):
        stats={'P1':{'applications':25,'strong':3,'avg_minutes':20},'P2':{'applications':25,'strong':0,'avg_minutes':12}};f=conversion_forecast(stats,35,{});self.assertEqual(f['mode'],'blended');self.assertGreater(f['data_weight'],0);self.assertIsNotNone(f['observed_rate_percent'])
    def test_broader_reach_admits_role_standard_holds(self):
        job={'title':'Senior Product Manager','company':'A','description':'Remote product role with adjacent requirements.','source':'greenhouse'};prefs={'remote_only':True,'allow_relocation':False};standard=classify(job,self.analysis(verified=1,must=6,gaps=4,salary=80000),prefs,{'breadth':'standard'});wider=classify(job,self.analysis(verified=1,must=6,gaps=4,salary=80000),prefs,{'breadth':'wider'});self.assertIn(standard['tier'],{'BLOCKED','LOW_COST','HOLD'});self.assertIn(wider['tier'],{'P2','LOW_COST'})
    def test_hard_constraint_survives_broad_reach(self):
        a=self.analysis(verified=5,must=6,gaps=1,salary=150000);a['constraint_evaluation']={'hard':['The vacancy explicitly requires relocation.'],'unknown':[],'notes':[],'state':'BLOCKED'};job={'title':'Senior Product Manager','company':'A','description':'Remote role.','source':'greenhouse'};self.assertEqual(classify(job,a,{}, {'breadth':'broad'})['tier'],'BLOCKED')
    def test_breadth_never_overrides_hard_salary_floor(self):
        from app.services.auto_match.service import evaluate_constraints
        ce=evaluate_constraints({"work_mode":"remote","relocation_required":False,"salary_min":70000,"salary_max":80000,"location":"Europe"},{"remote_only":True,"allow_relocation":False,"salary_floor_annual":90000,"allowed_regions":["Europe"]})
        self.assertEqual(ce["state"],"BLOCKED")
        self.assertTrue(any("hard salary floor" in x for x in ce["hard"]))

    def test_funnel_plan_always_returns_forecast(self):
        p=weekly_plan([],[],{}, {'pace_preset':'fast'});self.assertEqual(p['target_total'],35);self.assertIn('conversion_forecast',p);self.assertEqual(p['conversion_forecast']['estimated_rate_low_percent'],3.0)
    def test_broad_reach_expands_auto_query_count(self):
        s,p=self.store();old=os.environ.get('CFA_SEED_DEMO');os.environ['CFA_SEED_DEMO']='0'
        try:
            u=s.ensure_user({'id':1701})
            for i,tag in enumerate(['ai agentic','systems automation','product strategy','leadership 0→1','design ux']):
                s.upsert_user_evidence(u,{"id":f"e{i}","source_type":"file","source_ref":"x","title":tag,"claim":tag,"evidence":"proof","tags":tag.split(),"status":"verified","direct":True,"visibility":"private"})
            s.save_funnel_policy(u,{'breadth':'broad'});out=ensure_search_profiles(s,u);self.assertGreaterEqual(len(out['profiles']),4)
        finally:
            if old is None:os.environ.pop('CFA_SEED_DEMO',None)
            else:os.environ['CFA_SEED_DEMO']=old
            p.unlink(missing_ok=True)
if __name__=='__main__':unittest.main()
