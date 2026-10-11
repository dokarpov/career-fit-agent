import { overlapScore } from "./text.js";

export function retrieveEvidence(requirement, evidenceVault, limit = 3) {
  return evidenceVault
    .map(e => {
      const haystack = [
        e.title, e.claim, e.evidence, ...(e.tags || [])
      ].filter(Boolean).join(" ");
      const score = overlapScore(requirement.label, haystack);
      return { ...e, retrievalScore: Number(score.toFixed(3)) };
    })
    .filter(x => x.retrievalScore > 0)
    .sort((a,b) => b.retrievalScore - a.retrievalScore)
    .slice(0, limit);
}
