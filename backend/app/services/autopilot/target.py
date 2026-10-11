from __future__ import annotations
from collections import Counter
import hashlib, os, re
from ..funnel import normalize_policy

ROLE_RULES=[
 ("AI Product Manager",{"ai":2,"agentic":5,"agent":2,"llm":4,"rag":3,"retrieval":2,"evaluation":2,"evals":2}),
 ("Product Systems Lead",{"systems":4,"workflow":3,"automation":3,"routing":3,"orchestration":2,"decision":2}),
 ("Senior Product Manager",{"roadmap":2,"strategy":3,"discovery":2,"experimentation":2,"metrics":2,"product":1}),
 ("Product Lead",{"leadership":3,"lead":2,"0→1":4,"0-1":4,"zero-to-one":4,"cross-functional":2}),
 ("Design Product Lead",{"design":3,"ux":3,"prototype":2,"interaction":2,"visual":1}),
]

def _tok(s):return re.findall(r"[a-z0-9+#→-]+",str(s or "").lower())

def infer_queries(product,user_id,max_queries=3):
    score=Counter()
    for e in product.user_evidence(user_id):
        toks=Counter(_tok(" ".join([e.get("title", ""),e.get("claim", "")," ".join(e.get("tags") or [])])))
        for role,rules in ROLE_RULES:score[role]+=sum(toks.get(k,0)*w for k,w in rules.items())
    for row in product.outcome_weighted_job_titles(user_id):
        title=row.get("title") or "";pos=int(row.get("positives") or 0)
        for role,_ in ROLE_RULES:
            overlap=len(set(_tok(role))&set(_tok(title)))
            score[role]+=overlap*(3+5*pos)
    for e in product.recent_email_subjects(user_id):
        for role,_ in ROLE_RULES:
            overlap=len(set(_tok(role))&set(_tok(e.get("subject"))))
            score[role]+=overlap*(4 if e.get("event_type") in {"recruiter_or_interview","offer_candidate","offer_confirmed"} else 2)
    return [r for r,v in score.most_common(max_queries) if v>0]

def ensure_search_profiles(product,user_id):
    existing=[p for p in product.search_profiles(user_id) if not p["id"].startswith("auto_")]
    if existing:return {"mode":"explicit","profiles":existing}
    policy=normalize_policy(product.funnel_policy(user_id))
    queries=infer_queries(product,user_id,max_queries=int(policy.get("search_query_count",3)))
    if not queries:
        product.disable_auto_search_profiles(user_id,[]);return {"mode":"waiting_for_signal","profiles":[]}
    prefs=product.preferences(user_id);raw=os.getenv("CFA_SEARCH_COUNTRIES","es,de,fr,nl,pt,ie,gb")
    countries=[x.strip().lower() for x in raw.split(",") if x.strip()]
    ids=[];out=[]
    for q in queries:
        pid="auto_"+hashlib.sha1(f"{user_id}|{q}".encode()).hexdigest()[:10];ids.append(pid)
        out.append(product.upsert_search_profile(user_id,{"id":pid,"query":q,"countries":countries,
          "remote_only":bool(prefs.get("remote_only")),"sources":[],
          "interval_minutes":int(policy.get("search_interval_minutes") or os.getenv("CFA_AUTOPILOT_SEARCH_MINUTES","360")),"enabled":True}))
    product.disable_auto_search_profiles(user_id,ids)
    return {"mode":"inferred","profiles":out}
