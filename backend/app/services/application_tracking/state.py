from __future__ import annotations

ORDER={"application_received":1,"recruiter_or_interview":2,"offer_candidate":3,"offer_confirmed":4}
TERMINAL={"rejected","offer_confirmed"}

def reduce_application_state(events:list[dict]):
    if not events: return "unknown"
    kinds=[e.get("event_type") for e in events]
    if "offer_confirmed" in kinds: return "offer"
    # rejection is a final observable outcome unless later explicitly overridden by offer confirmation
    if "rejected" in kinds: return "rejected"
    if "offer_candidate" in kinds: return "offer_to_review"
    ranked=[k for k in kinds if k in ORDER]
    if not ranked: return "unknown"
    best=max(ranked,key=lambda x:ORDER[x])
    return {
      "application_received":"applied",
      "recruiter_or_interview":"interview",
    }.get(best,best)
