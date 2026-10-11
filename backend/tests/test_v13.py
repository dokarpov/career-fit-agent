import tempfile,unittest,sys,time,base64,json
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))

from app.services.product_state import ProductStore
from app.services.application_packs import markdown,html_document,exportable_proof_cards
from app.services.connectors.gmail import parse_job_email

def enc(s):return base64.urlsafe_b64encode(s.encode()).decode().rstrip("=")

class V13Tests(unittest.TestCase):
 def store(self):
  f=tempfile.NamedTemporaryFile(suffix=".db",delete=False);f.close()
  return ProductStore(f.name),Path(f.name)

 def test_notification_dedupe(self):
  s,p=self.store()
  try:
   u=s.ensure_user({"id":123})
   a=s.queue_notification(u,"offer_candidate","x","alpha","email:m1:offer")
   b=s.queue_notification(u,"offer_candidate","x","alpha","email:m1:offer")
   self.assertIsNotNone(a);self.assertIsNone(b)
  finally:p.unlink(missing_ok=True)

 def test_pubsub_queue_dedupe(self):
  s,p=self.store()
  try:
   self.assertTrue(s.enqueue_gmail_push("pub1","x@example.com","100"))
   self.assertFalse(s.enqueue_gmail_push("pub1","x@example.com","100"))
  finally:p.unlink(missing_ok=True)

 def test_watch_lookup_and_history_update(self):
  s,p=self.store()
  try:
   u=s.ensure_user({"id":124})
   s.save_gmail_watch(u,"me@example.com","10",9999999999999)
   s.update_gmail_history(u,"11",notification=True)
   self.assertEqual(s.gmail_watch_by_email("ME@EXAMPLE.COM")["last_history_id"],"11")
  finally:p.unlink(missing_ok=True)

 def test_pack_persists_and_versions(self):
  s,p=self.store()
  try:
   u=s.ensure_user({"id":125})
   pack=s.application_pack(u,"alpha")
   out=s.save_application_pack(u,"alpha",{"role":pack["data"]["role"],"positioning":"AI systems fit","proof_cards":[]})
   self.assertEqual(out["version"],2);self.assertEqual(out["data"]["positioning"],"AI systems fit")
  finally:p.unlink(missing_ok=True)

 def test_export_excludes_unverified_proof(self):
  pack={"role":{"company":"A","title":"PM"},"proof_cards":[
    {"claim":"verified claim","evidence_id":"ev1","verified":True,"approved":True},
    {"claim":"unverified claim","evidence_id":"ev2","verified":False,"approved":True},
    {"claim":"missing provenance","evidence_id":"","verified":True,"approved":True}
  ]}
  md=markdown(pack)
  self.assertIn("verified claim",md);self.assertNotIn("unverified claim",md);self.assertNotIn("missing provenance",md)

 def test_download_expires(self):
  s,p=self.store()
  try:
   u=s.ensure_user({"id":126})
   token=s.create_export_download(u,"alpha","md","hello","x.md",ttl_seconds=-1)
   self.assertIsNone(s.export_download(token))
  finally:p.unlink(missing_ok=True)

 def test_offer_weak_language_does_not_trigger(self):
  msg={"id":"x","payload":{"headers":[{"name":"Subject","value":"Next steps"}],"mimeType":"text/plain",
       "body":{"data":enc("We hope to make a decision soon. Thank you.")}}}
  self.assertNotEqual(parse_job_email(msg)["event_type"],"offer_candidate")

if __name__=="__main__":unittest.main()
