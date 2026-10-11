import argparse,json,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from app.services.evidence_ingest import ingest_path
from app.services.evidence_rebuild import rebuild_evidence
p=argparse.ArgumentParser();p.add_argument("paths",nargs="+");p.add_argument("--out",default="data/evidence_profile.json");a=p.parse_args()
items=[]
for raw in a.paths:
    path=Path(raw)
    if path.exists(): items.extend(ingest_path(path))
profile=rebuild_evidence(items)
out=Path(a.out);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(profile,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps({k:profile[k] for k in ["canonical_count","verified_count","review_count","conflict_count"]},indent=2))
