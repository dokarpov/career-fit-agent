import tempfile,unittest,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))

from app.services.product_state import ProductStore
from app.services.pack_proposal import extract_requirements,propose
from app.services.application_packs import markdown,exportable_proof_cards

class V14Tests(unittest.TestCase):
 def store(self):
  f=tempfile.NamedTemporaryFile(suffix=".db",delete=False);f.close()
  return ProductStore(f.name),Path(f.name)

 def ev(self,id,claim,status="verified",direct=True,user="u"):
  return {"id":id,"source_type":"github","source_ref":"repo","title":claim,"claim":claim,
          "evidence":"Working implementation and test artifact","tags":["agentic","approval"],
          "status":status,"direct":direct,"visibility":"private","boundary":"Use exact verified scope."}

 def test_evidence_is_user_scoped(self):
  s,p=self.store()
  try:
   a=s.ensure_user({"id":1});b=s.ensure_user({"id":2})
   s.upsert_user_evidence(a,self.ev("e1","Agent routing and human approval"))
   self.assertEqual(len(s.user_evidence(a)),1);self.assertEqual(len(s.user_evidence(b)),0)
  finally:p.unlink(missing_ok=True)

 def test_requirement_extraction_does_not_invent_from_empty(self):
  self.assertEqual(extract_requirements(""),[])

 def test_proposal_uses_verified_direct_evidence(self):
  req=[{"id":"r1","label":"human-in-the-loop","source":"human review","mustHave":True,"extractor":"test"}]
  evidence=[self.ev("e1","Human approval and fallback for agent workflows")]
  p=propose({"company":"A","title":"AI PM"},req,evidence)
  self.assertEqual(p["verified_suggestions"],1)
  self.assertTrue(p["suggestions"][0]["can_approve"])

 def test_unverified_evidence_cannot_be_approved_into_pack(self):
  s,p=self.store()
  try:
   u=s.ensure_user({"id":3})
   s.upsert_user_evidence(u,self.ev("e1","Human approval",status="needs-review"))
   s.save_pack_proposal(u,"alpha",{"suggestions":[{"suggestion_id":"s1","evidence_id":"e1","evidence_status":"needs-review","claim":"Human approval","requirement":"approval"}],"draft_positioning":"","draft_recruiter_note":"","interview_risks":[]})
   pack=s.approve_pack_proposal(u,"alpha",["s1"])
   self.assertEqual(pack["data"]["proof_cards"],[])
  finally:p.unlink(missing_ok=True)

 def test_approval_requires_exact_suggestion_selection(self):
  s,p=self.store()
  try:
   u=s.ensure_user({"id":4})
   s.upsert_user_evidence(u,self.ev("e1","Exact verified claim"))
   s.save_pack_proposal(u,"alpha",{"suggestions":[{"suggestion_id":"s1","evidence_id":"e1","evidence_status":"verified","claim":"Exact verified claim","requirement":"approval","confidence":.9,"boundary":"Exact scope"}],"draft_positioning":"p","draft_recruiter_note":"n","interview_risks":[]})
   pack=s.approve_pack_proposal(u,"alpha",["s1"])
   c=pack["data"]["proof_cards"][0]
   self.assertTrue(c["verified"]);self.assertTrue(c["approved"]);self.assertEqual(c["claim"],"Exact verified claim")
  finally:p.unlink(missing_ok=True)

 def test_export_requires_approved_and_verified(self):
  pack={"role":{"company":"A","title":"PM"},"proof_cards":[
   {"claim":"both gates","evidence_id":"e1","verified":True,"approved":True},
   {"claim":"not approved","evidence_id":"e2","verified":True,"approved":False},
   {"claim":"not verified","evidence_id":"e3","verified":False,"approved":True}
  ]}
  md=markdown(pack)
  self.assertIn("both gates",md);self.assertNotIn("not approved",md);self.assertNotIn("not verified",md)

 def test_vacancy_requirements_persist(self):
  s,p=self.store()
  try:
   u=s.ensure_user({"id":5})
   req=extract_requirements("Required: experience with agentic workflows and human review.")
   s.save_job_requirements(u,"alpha",req)
   self.assertGreaterEqual(len(s.job_requirements(u,"alpha")),2)
  finally:p.unlink(missing_ok=True)


 def test_editing_approved_claim_revokes_approval(self):
  s,p=self.store()
  try:
   u=s.ensure_user({"id":6});s.upsert_user_evidence(u,self.ev("e1","Exact verified claim"))
   current=s.application_pack(u,"alpha")
   current["data"]["proof_cards"]=[{"claim":"Invented stronger claim","evidence_id":"e1","verified":True,"approved":True}]
   saved=s.save_application_pack(u,"alpha",current["data"])
   self.assertFalse(saved["data"]["proof_cards"][0]["approved"])
   self.assertTrue(saved["data"]["proof_cards"][0]["verified"])
  finally:p.unlink(missing_ok=True)

 def test_stale_proposal_cannot_approve_downgraded_evidence(self):
  s,p=self.store()
  try:
   u=s.ensure_user({"id":7});s.upsert_user_evidence(u,self.ev("e1","Exact verified claim"))
   s.save_pack_proposal(u,"alpha",{"suggestions":[{"suggestion_id":"s1","evidence_id":"e1","evidence_status":"verified","claim":"Exact verified claim","requirement":"approval","confidence":.9}],"interview_risks":[]})
   downgraded=self.ev("e1","Exact verified claim",status="needs-review");s.upsert_user_evidence(u,downgraded)
   pack=s.approve_pack_proposal(u,"alpha",["s1"])
   self.assertEqual(pack["data"]["proof_cards"],[])
  finally:p.unlink(missing_ok=True)

if __name__=="__main__":unittest.main()
