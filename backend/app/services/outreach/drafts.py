from __future__ import annotations

def build_outreach_draft(job:dict,contact:dict|None,proof_cards:list[dict],channel="linkedin"):
    who=(contact or {}).get("name") or "there"
    company=job.get("company","your team")
    role=job.get("title","the role")
    strongest=proof_cards[:2]
    proof_sentence=" ".join(
      f"I've worked on {p.get('requirement','a related area').lower()} — {p.get('claim','').rstrip('.')}."
      for p in strongest if p.get("claim")
    ).strip()
    if not proof_sentence:
        proof_sentence="I’m looking at the role because the problem space overlaps strongly with systems and product work I can show."
    body=(
      f"Hi {who}, I’m looking at {role} at {company}. "
      f"{proof_sentence} "
      "I’m trying to understand the highest-cost product uncertainty the team wants this hire to remove. "
      "If you’re close to the role, I’d value a quick pointer on that before I send a generic application."
    )
    return {
      "channel":channel,
      "subject":None if channel=="linkedin" else f"{role} — one specific question",
      "body":body,
      "status":"draft",
      "boundary":"Draft only. Review facts and relationship context before sending."
    }
