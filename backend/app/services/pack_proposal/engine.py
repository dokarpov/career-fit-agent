from __future__ import annotations
import hashlib,re
from collections import Counter
from ..vector_retrieval import LocalLSIRetriever

PATTERNS=[
 ("agentic workflows",["agentic","agents","multi-agent","agent workflows","orchestration"]),
 ("human-in-the-loop",["human-in-the-loop","human review","approval","fallback","escalation"]),
 ("evaluation",["evaluation","evals","quality","rubric","benchmark","test cases"]),
 ("tool calling",["tools","tool calling","function calling","mcp"]),
 ("schemas",["schema","structured output","json schema","typed output"]),
 ("retrieval",["retrieval","rag","grounding","context retrieval","knowledge base"]),
 ("product strategy",["product strategy","roadmap","prioritization","0→1","0-1"]),
 ("experimentation",["experimentation","a/b","ab test","experiments","hypothesis"]),
 ("stakeholder management",["stakeholder","cross-functional","cross functional"]),
 ("analytics",["analytics","metrics","funnel","conversion","retention"]),
]

STOP={"the","and","for","with","from","this","that","into","your","their","our","you","will",
      "role","product","senior","manager","lead","required","requirements","experience","responsible"}

def norm(s):
    return re.sub(r"\s+"," ",re.sub(r"[^a-z0-9+#→]+"," ",str(s).lower())).strip()

def tokens(s):
    return [x for x in norm(s).split() if len(x)>2 and x not in STOP]

def overlap_score(a,b):
    aa=set(tokens(a));bb=set(tokens(b))
    if not aa or not bb:return 0.0
    return len(aa&bb)/len(aa)

def extract_requirements(text,max_items=12):
    n=norm(text);out=[];i=1
    for label,variants in PATTERNS:
        hit=next((v for v in variants if norm(v) in n),None)
        if hit:
            out.append({"id":f"r{i}","label":label,"source":hit,"mustHave":True,"extractor":"deterministic-pattern-v0.4"});i+=1
    lines=[x.strip(" \t•-*") for x in re.split(r"\n|•",str(text)) if x.strip()]
    for line in lines:
        lower=line.lower()
        looks=bool(re.search(r"\b(experience|ability|knowledge|familiar|must|required|should|responsib|you will|you'll|we need|we're looking)\b",lower))
        if not looks:continue
        short=re.sub(r"^\W+","",line)[:140]
        if not short:continue
        if any(norm(x["label"]) in norm(short) or norm(short) in norm(x["label"]) for x in out):continue
        out.append({"id":f"r{i}","label":short,"source":line[:500],
                    "mustHave":bool(re.search(r"\b(must|required|responsib|need)\b",lower)),
                    "extractor":"line-heuristic-v0.4"});i+=1
        if len(out)>=max_items:break
    return out

def _retrieve(requirement,evidence,limit=4):
    if not evidence:return []
    vec=LocalLSIRetriever(dimensions=min(64,max(2,len(evidence)-1))).fit(evidence)
    vh={h.item["id"]:h.score for h in vec.search(requirement["label"],limit*3)}
    rows=[]
    for e in evidence:
        lex=overlap_score(requirement["label"]," ".join([e.get("title",""),e.get("claim",""),e.get("evidence","")," ".join(e.get("tags") or [])]))
        v=vh.get(e["id"],0)
        score=.62*v+.38*lex
        if score>0:
            rows.append({**e,"retrieval_score":round(score,4),"vector_score":round(v,4),"lexical_score":round(lex,4)})
    return sorted(rows,key=lambda x:x["retrieval_score"],reverse=True)[:limit]

def classify(requirement,e):
    if not e:return {"status":"missing","confidence":0,"reason":"No evidence candidate was retrieved."}
    raw=min(1,e["retrieval_score"] + (.22 if e.get("status")=="verified" else 0) + (.18 if e.get("direct") else 0))
    confidence=round(raw,2)
    if e.get("status")!="verified":
        return {"status":"needs_review","confidence":confidence,
                "reason":"Potential evidence exists, but the evidence object itself is not verified."}
    if not e.get("direct"):
        return {"status":"needs_review","confidence":confidence,
                "reason":"The evidence is verified but adjacent. A person must decide whether the exact verified claim is relevant enough."}
    if confidence>=.60:
        return {"status":"verified","confidence":confidence,
                "reason":"Direct verified evidence with sufficient retrieval overlap."}
    if confidence>=.35:
        return {"status":"needs_review","confidence":confidence,
                "reason":"Verified evidence exists, but the requirement-to-proof match is not strong enough for silent use."}
    return {"status":"missing","confidence":confidence,"reason":"Retrieved evidence is too weak to defend this requirement."}

def _positioning(job,verified,review,gaps):
    role=job.get("title") or "this role";company=job.get("company") or "the company"
    labels=[x["requirement"] for x in verified[:3]]
    if labels:
        base=f"For {role} at {company}, the strongest verified overlap is in " + ", ".join(labels) + "."
    else:
        base=f"For {role} at {company}, no requirement currently has direct verified proof strong enough for automatic use."
    if gaps:
        base+=f" {len(gaps)} requirement{'s' if len(gaps)!=1 else ''} remain explicit gaps and should not be rewritten as experience."
    elif review:
        base+=f" {len(review)} additional match{'es' if len(review)!=1 else ''} need human review before use."
    return base

def _recruiter_note(job,verified):
    company=job.get("company") or "your team";role=job.get("title") or "the role"
    claims=[x.get("claim","").rstrip(".") for x in verified[:2] if x.get("claim")]
    if claims:
        proof=" ".join(f"I can show {c}." for c in claims)
        return f"Hi — I’m looking at {role} at {company}. {proof} I’d be interested in understanding the highest-cost product uncertainty this hire is expected to remove."
    return f"Hi — I’m looking at {role} at {company}. I’m reviewing the role against evidence from my actual work before applying, and I’d be interested in understanding the highest-cost product uncertainty this hire is expected to remove."

def propose(job,requirements,evidence):
    suggestions=[];review=[];gaps=[];verified=[]
    for req in requirements:
        candidates=_retrieve(req,evidence,4)
        best=candidates[0] if candidates else None
        match=classify(req,best)
        base={"requirement_id":req["id"],"requirement":req["label"],"must_have":bool(req.get("mustHave")),
              "match_status":match["status"],"confidence":match["confidence"],"reason":match["reason"]}
        if not best:
            gaps.append(base);continue
        sid="sug_"+hashlib.sha1(f"{req['id']}|{best['id']}".encode()).hexdigest()[:12]
        item={**base,"suggestion_id":sid,"evidence_id":best["id"],"evidence_status":best.get("status"),
              "direct":bool(best.get("direct")),"claim":best.get("claim",""),"evidence_title":best.get("title",""),
              "source_type":best.get("source_type"),"source_ref":best.get("source_ref"),
              "boundary":best.get("boundary") or "Use only within the verified claim boundary.",
              "metric":best.get("metric"),"approval_state":"pending",
              "can_approve":best.get("status")=="verified"}
        suggestions.append(item)
        if match["status"]=="verified":verified.append(item)
        elif match["status"]=="needs_review":review.append(item)
        else:gaps.append(base)
    risks=[]
    for x in review:
        risks.append(f"Review claim boundary for {x['requirement']}; use the exact verified claim rather than upgrading it to the requirement.")
    for x in gaps:
        if x.get("must_have"):
            risks.append(f"Must-have gap: {x['requirement']}. Explain adjacent capability, close the gap with a real artifact, or skip.")
    return {
      "requirements":requirements,
      "suggestions":suggestions,
      "verified_suggestions":len(verified),
      "review_suggestions":len(review),
      "gaps":gaps,
      "draft_positioning":_positioning(job,verified,review,gaps),
      "draft_recruiter_note":_recruiter_note(job,verified),
      "interview_risks":risks,
      "human_gate":"No suggestion enters the outward-facing pack until the user explicitly approves it. Unverified evidence cannot be approved for export."
    }
