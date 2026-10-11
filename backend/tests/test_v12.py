import tempfile,unittest,sys,time
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from app.services.product_state import ProductStore
from app.services.runtime.config import capabilities
from app.services.application_tracking import reduce_application_state
from app.services.connectors.gmail import parse_job_email
from app.services.billing.stars import invoice_payload

def b64(s):
 import base64
 return base64.urlsafe_b64encode(s.encode()).decode().rstrip("=")

class V12Tests(unittest.TestCase):
 def store(self):
  f=tempfile.NamedTemporaryFile(suffix=".db",delete=False);f.close()
  return ProductStore(f.name),Path(f.name)

 def test_user_isolated_notes(self):
  s,p=self.store()
  try:
   a=s.ensure_user({"id":1,"first_name":"A"});b=s.ensure_user({"id":2,"first_name":"B"})
   s.save_note(a,"alpha","mine")
   self.assertEqual(s.job(a,"alpha")["note"],"mine")
   self.assertEqual(s.job(b,"alpha")["note"],"")
  finally:p.unlink(missing_ok=True)

 def test_resolve_verify_changes_job(self):
  s,p=self.store()
  try:
   u=s.ensure_user({"id":3})
   s.resolve_action(u,"flodesk","verify")
   self.assertEqual(s.job(u,"flodesk")["decision"],"APPLY")
   self.assertIsNone(s.job(u,"flodesk")["blocker"])
  finally:p.unlink(missing_ok=True)

 def test_entitlement_is_idempotent_by_charge(self):
  s,p=self.store()
  try:
   u=s.ensure_user({"id":4})
   a=s.grant_entitlement(u,"managed_search_cycle","telegram_stars","charge-1",90,{})
   b=s.grant_entitlement(u,"managed_search_cycle","telegram_stars","charge-1",90,{})
   self.assertEqual(a["id"],b["id"])
  finally:p.unlink(missing_ok=True)

 def test_managed_capabilities_gate_automation(self):
  self.assertFalse(capabilities(False)["scheduled_search"])
  self.assertTrue(capabilities(True)["scheduled_search"])

 def test_offer_email_is_candidate_not_final(self):
  msg={"id":"m1","payload":{"headers":[{"name":"Subject","value":"Your employment offer"}],
      "mimeType":"text/plain","body":{"data":b64("We are pleased to offer you the position.")}}}
  ev=parse_job_email(msg)
  self.assertEqual(ev["event_type"],"offer_candidate")
  self.assertEqual(reduce_application_state([ev]),"offer_to_review")

 def test_rejected_is_final_observable_state(self):
  self.assertEqual(reduce_application_state([{"event_type":"application_received"},{"event_type":"rejected"}]),"rejected")

 def test_stars_invoice_currency(self):
  p=invoice_payload(10,2499)
  self.assertEqual(p["currency"],"XTR")
  self.assertEqual(p["prices"][0]["amount"],2499)

if __name__=="__main__":unittest.main()
