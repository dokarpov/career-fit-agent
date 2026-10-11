from __future__ import annotations
from collections import Counter,defaultdict

def generate_insights(applications:list[dict],requirements:list[dict],outcomes:list[dict],min_rejections:int=5):
    insights=[]
    rejected_app_ids={o["application_id"] for o in outcomes if o.get("event_type")=="rejected"}
    interview_app_ids={o["application_id"] for o in outcomes if o.get("event_type") in {"interview","recruiter_screen"}}

    if len(rejected_app_ids)>=min_rejections:
        weak=Counter()
        for r in requirements:
            if r.get("application_id") in rejected_app_ids and r.get("evidence_state") in {"missing","needs_review","adjacent"}:
                weak[r.get("requirement","unknown")]+=1
        if weak:
            top=weak.most_common(5)
            insights.append({
              "type":"weak_requirements",
              "title":"Weak proof repeats across rejected applications",
              "evidence":{"rejections":len(rejected_app_ids),"requirements":top},
              "action":"Strengthen or narrow targets around the repeated weak-proof requirements."
            })
        else:
            insights.append({
              "type":"data_gap",
              "title":"There are enough rejections to learn, but old applications lack requirement snapshots",
              "evidence":{"rejections":len(rejected_app_ids)},
              "action":"Backfill requirement/evidence snapshots for a small rejection sample before changing the target profile."
            })

    package_interviews=defaultdict(lambda:[0,0])
    for a in applications:
        pkg=a.get("package_id") or "none"
        package_interviews[pkg][1]+=1
        if a.get("id") in interview_app_ids: package_interviews[pkg][0]+=1
    comparable=[(k,v[0],v[1],v[0]/v[1] if v[1] else 0) for k,v in package_interviews.items() if v[1]>=3]
    if comparable:
        comparable.sort(key=lambda x:x[3],reverse=True)
        insights.append({
          "type":"package_conversion",
          "title":"Application-pack conversion can now be compared",
          "evidence":{"packages":comparable[:5]},
          "action":"Reuse the best-performing pack structure only where role evidence stays truthful."
        })

    source=defaultdict(lambda:[0,0])
    for a in applications:
        s=a.get("source") or "unknown";source[s][1]+=1
        if a.get("id") in interview_app_ids:source[s][0]+=1
    src=[(k,v[0],v[1],v[0]/v[1] if v[1] else 0) for k,v in source.items() if v[1]>=5]
    if src:
        src.sort(key=lambda x:x[3],reverse=True)
        insights.append({
          "type":"source_conversion",
          "title":"Job sources differ in observed interview yield",
          "evidence":{"sources":src[:6]},
          "action":"Shift search time toward sources with stronger observed yield; keep sample-size warnings visible."
        })
    return insights
