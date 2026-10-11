import { retrieveEvidence } from "./retrieval.js";
import { classifyMatch, routeMatch } from "./matching.js";
import { fitDecision, proofCards, gaps, reviewQueue, interviewRisks } from "./package.js";
import { preflight } from "./preflight.js";
import { evaluateConstraints, finalAction } from "./constraints.js";
import { estimateApplicationValue } from "./value.js";

export function analyzeRole(role, evidenceVault, preferences = {}) {
  const requirements = (role.requirements || []).map((label, i) => ({
    id: `${role.id}-r${i+1}`,
    label,
    source: "live-role-derived",
    mustHave: true
  }));

  const retrieval = requirements.map(requirement => ({
    requirement,
    candidates: retrieveEvidence(requirement, evidenceVault, 3)
  }));

  const matches = retrieval.map(({requirement,candidates}) => {
    const match = classifyMatch(requirement, candidates[0]);
    return { ...match, route: routeMatch(match) };
  });

  const review = reviewQueue(requirements, evidenceVault, matches);
  const gapItems = gaps(requirements, matches);
  const cards = proofCards(requirements, evidenceVault, matches);
  const fit = fitDecision(requirements, matches);

  const pf = preflight(role);
  const constraints = evaluateConstraints(role, preferences);
  const action = finalAction({ preflight: pf, constraints, fit });
  const value = estimateApplicationValue({ role, analysis:{requirements,matches,reviewQueue:review,gaps:gapItems,proofCards:cards}, preferences });

  return {
    role,
    preflight: pf,
    constraints,
    finalAction: action,
    value,
    requirements,
    retrieval,
    matches,
    reviewQueue: review,
    gaps: gapItems,
    proofCards: cards,
    interviewRisks: interviewRisks(review, gapItems),
    fit
  };
}
