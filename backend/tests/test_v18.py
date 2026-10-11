import os,tempfile,unittest,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from app.services.product_state import ProductStore
from app.services.funnel import normalize_policy

class V18Tests(unittest.TestCase):
 def store(self):
  f=tempfile.NamedTemporaryFile(suffix='.db',delete=False);f.close();return ProductStore(f.name),Path(f.name)
 def test_new_user_needs_onboarding(self):
  s,p=self.store();old=os.environ.get('CFA_SEED_DEMO');os.environ['CFA_SEED_DEMO']='0'
  try:
   u=s.ensure_user({'id':1801});self.assertFalse(s.onboarding_status(u)['completed'])
  finally:
   if old is None:os.environ.pop('CFA_SEED_DEMO',None)
   else:os.environ['CFA_SEED_DEMO']=old
   p.unlink(missing_ok=True)
 def test_onboarding_complete_persists(self):
  s,p=self.store()
  try:
   u=s.ensure_user({'id':1802});s.complete_onboarding(u,{'pace_preset':'urgent'});x=s.onboarding_status(u)
   self.assertTrue(x['completed']);self.assertEqual(x['state']['pace_preset'],'urgent')
  finally:p.unlink(missing_ok=True)
 def test_onboarding_pace_maps_to_same_funnel_policy(self):
  self.assertEqual(normalize_policy({'pace_preset':'focused'})['weekly_target'],16)
  self.assertEqual(normalize_policy({'pace_preset':'balanced'})['weekly_target'],23)
  self.assertEqual(normalize_policy({'pace_preset':'urgent'})['weekly_target'],45)
 def test_progress_does_not_complete_onboarding(self):
  s,p=self.store()
  try:
   u=s.ensure_user({'id':1803});x=s.save_onboarding_progress(u,{'step':2});self.assertFalse(x['completed']);self.assertEqual(x['state']['step'],2)
  finally:p.unlink(missing_ok=True)
if __name__=='__main__':unittest.main()
