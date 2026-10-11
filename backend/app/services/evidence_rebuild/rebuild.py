from __future__ import annotations
from collections import Counter, defaultdict
import hashlib, re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics.pairwise import cosine_similarity

STOP={"the","and","for","with","from","this","that","into","your","their","our","built","work","working","project","product","role","using","used","across","experience","system","systems","current","public","private","source"}

def _text(x):
    return " ".join([x.get("title",""),x.get("claim",""),x.get("evidence","")," ".join(x.get("tags") or []),x.get("boundary") or ""])

def _tokens(s):
    return [x for x in re.findall(r"[a-zA-Z0-9+#→-]{3,}",s.lower()) if x not in STOP]

def _topic_label(items,max_words=5):
    c=Counter()
    for x in items: c.update(_tokens(x.get("title","")+" "+x.get("claim","")))
    w=[x for x,_ in c.most_common(max_words)]
    return " · ".join(w) if w else "evidence cluster"

def _negated(t):
    return bool(re.search(r"\b(no|not|never|without|didn['’]t|doesn['’]t|cannot|can['’]t)\b",t.lower()))

def _numbers(t):
    return set(re.findall(r"(?<!\w)(?:€|\$|£)?\d+(?:[.,]\d+)?%?(?!\w)",t))

def detect_conflicts(items):
    out=[]
    for i,a in enumerate(items):
        for b in items[i+1:]:
            ta,tb=_text(a),_text(b)
            shared=set(_tokens(ta)) & set(_tokens(tb))
            if len(shared)<2: continue
            # Conflict detection is intentionally conservative to avoid turning
            # ordinary dates / counts from adjacent fragments into false conflicts.
            similarity=len(shared)/max(1,min(len(set(_tokens(ta))),len(set(_tokens(tb)))))
            neg=_negated(ta)!=_negated(tb) and len(shared)>=2 and similarity>=0.5
            na,nb=_numbers(ta),_numbers(tb)
            metric_words={"conversion","revenue","rate","growth","retention","users","customers","salary","cost","time","minutes","hours","percent","percentage"}
            metric_context=bool(shared & metric_words)
            numeric=bool(metric_context and len(shared)>=4 and na and nb and na.isdisjoint(nb))
            if neg or numeric:
                out.append({"a":a.get("id"),"b":b.get("id"),"reason":"negation mismatch" if neg else "numeric mismatch","shared_terms":sorted(shared)[:8]})
    return out

def _cluster(items,distance_threshold=.72):
    if len(items)<=1: return [list(range(len(items)))],None
    X=TfidfVectorizer(ngram_range=(1,2),min_df=1,max_features=18000,sublinear_tf=True).fit_transform([_text(x) for x in items])
    if len(items)==2:
        sim=float(cosine_similarity(X[0],X[1])[0,0])
        return ([[0,1]] if sim >= 1-distance_threshold else [[0],[1]]),X
    labels=AgglomerativeClustering(n_clusters=None,metric="cosine",linkage="average",distance_threshold=distance_threshold).fit_predict(X.toarray())
    g=defaultdict(list)
    for i,l in enumerate(labels): g[int(l)].append(i)
    return list(g.values()),X

def _representative(items,X,idxs):
    sub=X[idxs]
    centroid=np.asarray(sub.mean(axis=0)).reshape(1,-1)
    sims=cosine_similarity(sub,centroid).ravel()
    return items[idxs[int(np.argmax(sims))]]

def rebuild_evidence(candidates,previous_profile=None):
    dedup={}
    for x in candidates:
        sig=hashlib.sha1(re.sub(r"\s+"," ",_text(x)).strip().lower().encode()).hexdigest()
        prev=dedup.get(sig)
        if prev is None or (x.get("status")=="verified" and prev.get("status")!="verified"):
            dedup[sig]=x
    items=list(dedup.values())
    groups,X=_cluster(items)
    canonical=[];all_conflicts=[]
    for idxs in groups:
        cluster=[items[i] for i in idxs]
        conflicts=detect_conflicts(cluster);all_conflicts.extend(conflicts)
        rep=_representative(items,X,idxs) if X is not None else cluster[0]
        sources=sorted({x.get("source_ref","") for x in cluster if x.get("source_ref")})
        verified=[x for x in cluster if x.get("status")=="verified"]
        direct=[x for x in cluster if x.get("direct")]
        status="verified" if verified and not conflicts else "needs-review"
        confidence=min(.95,.35+.09*len(sources)+(.25 if verified else 0)+(.1 if direct else 0))
        if conflicts: confidence=min(confidence,.45)
        cid="canon_"+hashlib.sha1("|".join(sorted(x.get("id","") for x in cluster)).encode()).hexdigest()[:12]
        canonical.append({
            "id":cid,"topic":_topic_label(cluster),"title":rep.get("title") or _topic_label(cluster),
            "claim":rep.get("claim") or rep.get("title",""),"evidence":rep.get("evidence",""),
            "source_count":len(sources),"sources":sources,"source_types":sorted({x.get("source_type","unknown") for x in cluster}),
            "member_ids":[x.get("id") for x in cluster],"status":status,"direct":bool(direct),
            "visibility":"public" if cluster and all(x.get("visibility")=="public" for x in cluster) else "private",
            "confidence":round(confidence,2),"conflict_count":len(conflicts),
            "boundary":rep.get("boundary") or "Review ownership and scope before outward use."
        })
    canonical.sort(key=lambda x:(x["status"]!="verified",-x["source_count"],-x["confidence"]))
    new_topics={x["topic"] for x in canonical};prev_topics=set((previous_profile or {}).get("topics") or [])
    review=[x for x in canonical if x["status"]!="verified" or x["conflict_count"]]
    return {
        "version":hashlib.sha1("|".join(sorted(x["id"] for x in canonical)).encode()).hexdigest()[:12],
        "canonical_count":len(canonical),"verified_count":sum(x["status"]=="verified" for x in canonical),
        "review_count":len(review),"conflict_count":len(all_conflicts),"topics":sorted(new_topics),
        "canonical":canonical,"review_queue":review,"conflicts":all_conflicts,
        "diff":{"added_topics":sorted(new_topics-prev_topics),"removed_topics":sorted(prev_topics-new_topics)}
    }

def requirement_gap_signals(requirement_snapshots,canonical_profile,min_occurrences=3):
    c=Counter()
    for r in requirement_snapshots:
        if r.get("evidence_state") in {"missing","needs_review","adjacent"}: c[r.get("requirement","unknown")]+=1
    topics=" ".join(canonical_profile.get("topics") or []).lower();out=[]
    for req,n in c.items():
        if n<min_occurrences: continue
        direct=req.lower() in topics
        out.append({"requirement":req,"occurrences":n,"state":"existing_profile_signal" if direct else "recurring_gap","action":"review_evidence" if direct else "create_proof_task_or_keep_gap"})
    return sorted(out,key=lambda x:-x["occurrences"])
