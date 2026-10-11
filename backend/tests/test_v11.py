import unittest,sys,time,json,hashlib,hmac
from pathlib import Path
from urllib.parse import urlencode
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from app.services.evidence_rebuild import rebuild_evidence,requirement_gap_signals,detect_conflicts
from app.services.telegram.auth import validate_init_data
class T(unittest.TestCase):
 def test_rebuild_does_not_auto_verify(self):
  items=[{"id":"1","source_type":"file","source_ref":"a","title":"Agent routing","claim":"Agent routing human approval","evidence":"routing and approval","tags":["agentic"],"status":"needs-review","direct":False},{"id":"2","source_type":"github","source_ref":"b","title":"Agent routing","claim":"Agent workflow human approval","evidence":"routing approval","tags":["agentic"],"status":"needs-review","direct":False}]
  self.assertEqual(rebuild_evidence(items)["verified_count"],0)
 def test_verified_seed(self):
  p=rebuild_evidence([{"id":"1","source_type":"github","source_ref":"r","title":"Decision boundary","claim":"Human approval","evidence":"Executable implementation","tags":["approval"],"status":"verified","direct":True,"visibility":"public"}])
  self.assertEqual(p["verified_count"],1)
 def test_conflict(self):
  self.assertTrue(detect_conflicts([{"id":"1","title":"Conversion","claim":"conversion improved 20%","evidence":"conversion result 20%"},{"id":"2","title":"Conversion","claim":"conversion did not improve 20%","evidence":"conversion result did not improve 20%"}]))
 def test_gap(self):
  out=requirement_gap_signals([{"requirement":"production RAG","evidence_state":"missing"}]*3,{"topics":[]});self.assertEqual(out[0]["state"],"recurring_gap")
 def test_tg_auth(self):
  token="123:ABC";f={"auth_date":str(int(time.time())),"query_id":"q","user":json.dumps({"id":42},separators=(",",":"))};d="\n".join(f"{k}={v}" for k,v in sorted(f.items()));s=hmac.new(b"WebAppData",token.encode(),hashlib.sha256).digest();f["hash"]=hmac.new(s,d.encode(),hashlib.sha256).hexdigest();self.assertEqual(validate_init_data(urlencode(f),token,60)["user"]["id"],42)
if __name__=="__main__":unittest.main()
