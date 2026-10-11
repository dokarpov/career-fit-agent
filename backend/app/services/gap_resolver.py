def resolve_gap(requirement: str, search_results: list[dict], user_can_answer: bool = True) -> dict:
    if search_results:
        return {
          "requirement":requirement,
          "state":"search_more",
          "reason":"Potential evidence exists elsewhere in the vault; review before declaring a gap."
        }
    if user_can_answer:
        return {
          "requirement":requirement,
          "state":"ask_user",
          "reason":"No artifact found. Ask for a concrete example, file, link, screenshot, metric or shipped object."
        }
    return {
      "requirement":requirement,
      "state":"accept_gap",
      "reason":"No defensible evidence found. Keep the gap visible; do not generate a stronger claim."
    }
