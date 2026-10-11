export function proofCards(requirements, evidenceVault, matches) {
  return matches
    .filter(m => m.status === "verified")
    .map(m => {
      const requirement = requirements.find(r => r.id === m.requirementId);
      const evidence = evidenceVault.find(e => e.id === m.evidenceId);
      return {
        requirement: requirement?.label || "Requirement",
        claim: evidence?.claim || "",
        evidence: evidence?.evidence || "",
        metric: evidence?.metric || null,
        boundary: evidence?.boundary || "Use only within verified scope.",
        confidence: m.confidence
      };
    });
}

export function gaps(requirements, matches) {
  return requirements
    .map(r => ({ requirement:r, match:matches.find(m=>m.requirementId===r.id) }))
    .filter(x => !x.match || x.match.status === "missing")
    .map(x => ({
      requirementId:x.requirement.id,
      requirement:x.requirement.label,
      mustHave:Boolean(x.requirement.mustHave),
      action:"Find a real artifact, verify adjacent evidence, or accept this as a capability gap."
    }));
}

export function reviewQueue(requirements, evidenceVault, matches) {
  return matches
    .filter(m => m.status === "needs_review")
    .map(m => ({
      match:m,
      requirement:requirements.find(r=>r.id===m.requirementId),
      evidence:evidenceVault.find(e=>e.id===m.evidenceId)
    }));
}

export function fitDecision(requirements, matches) {
  const must = requirements.filter(r=>r.mustHave);
  if (!must.length) return { verdict:"REVIEW", reason:"No must-have requirements were identified." };

  const states = must.map(r=>matches.find(m=>m.requirementId===r.id)?.status || "missing");
  const verified = states.filter(x=>x==="verified").length;
  const review = states.filter(x=>x==="needs_review").length;
  const missing = states.filter(x=>x==="missing").length;

  const coverage = verified / must.length;

  if (missing > Math.max(1, Math.floor(must.length * 0.35))) {
    return { verdict:"SKIP", reason:"Too many must-have requirements currently have no defensible proof.", coverage };
  }
  if (review > 0 || coverage < 0.7) {
    return { verdict:"REVIEW", reason:"Fit may be plausible, but at least one must-have proof needs human judgment.", coverage };
  }
  return { verdict:"PURSUE", reason:"Most must-have requirements have direct verified proof.", coverage };
}

export function interviewRisks(reviewItems, gapItems) {
  const out = [];
  for (const x of reviewItems) {
    out.push({
      type:"ambiguous-proof",
      title:`Defend: ${x.requirement?.label || "requirement"}`,
      prompt:"State the ownership boundary first, then explain the strongest adjacent evidence without upgrading it into a stronger claim."
    });
  }
  for (const x of gapItems.filter(g=>g.mustHave)) {
    out.push({
      type:"capability-gap",
      title:`Gap: ${x.requirement}`,
      prompt:"Do not fabricate equivalence. Decide whether to explain the adjacent skill, close the gap before applying, or skip the role."
    });
  }
  return out;
}
