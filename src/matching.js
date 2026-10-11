export function classifyMatch(requirement, candidate) {
  if (!candidate) {
    return {
      requirementId: requirement.id,
      status: "missing",
      confidence: 0,
      reason: "No evidence object was retrieved."
    };
  }

  const provenanceBonus = candidate.status === "verified" ? 0.25 : 0;
  const directnessBonus = candidate.direct ? 0.2 : 0;
  const raw = Math.min(1, candidate.retrievalScore + provenanceBonus + directnessBonus);
  const confidence = Number(raw.toFixed(2));

  if (candidate.status !== "verified") {
    return {
      requirementId: requirement.id,
      evidenceId: candidate.id,
      status: "needs_review",
      confidence,
      reason: "Potentially relevant evidence exists, but provenance is not verified."
    };
  }

  // Even strong lexical similarity must not upgrade adjacent evidence
  // into a direct claim without human confirmation.
  if (!candidate.direct) {
    return {
      requirementId: requirement.id,
      evidenceId: candidate.id,
      status: "needs_review",
      confidence,
      reason: "Verified evidence is adjacent rather than direct, so a person must confirm the claim boundary."
    };
  }

  if (confidence >= 0.65) {
    return {
      requirementId: requirement.id,
      evidenceId: candidate.id,
      status: "verified",
      confidence,
      reason: "Verified evidence with sufficiently direct overlap."
    };
  }

  if (confidence >= 0.35) {
    return {
      requirementId: requirement.id,
      evidenceId: candidate.id,
      status: "needs_review",
      confidence,
      reason: "Evidence may support the requirement, but the match is not direct enough to auto-use."
    };
  }

  return {
    requirementId: requirement.id,
    evidenceId: candidate.id,
    status: "missing",
    confidence,
    reason: "Retrieved evidence is too weak to defend this requirement."
  };
}

export function routeMatch(match) {
  if (match.status === "verified") return "auto_use";
  if (match.status === "needs_review") return "human_review";
  return "gap";
}
