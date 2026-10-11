import { extractRequirements } from "./extract.js";
import { retrieveEvidence } from "./retrieval.js";
import { classifyMatch, routeMatch } from "./matching.js";
import { proofCards, gaps, reviewQueue, fitDecision, interviewRisks } from "./package.js";

export function analyzeVacancy(vacancyText, evidenceVault) {
  const requirements = extractRequirements(vacancyText);

  const retrieval = requirements.map(requirement => ({
    requirement,
    candidates: retrieveEvidence(requirement, evidenceVault, 3)
  }));

  const matches = retrieval.map(({requirement,candidates}) => {
    const match = classifyMatch(requirement, candidates[0]);
    return { ...match, route: routeMatch(match) };
  });

  const cards = proofCards(requirements, evidenceVault, matches);
  const gapItems = gaps(requirements, matches);
  const reviewItems = reviewQueue(requirements, evidenceVault, matches);
  const decision = fitDecision(requirements, matches);
  const risks = interviewRisks(reviewItems, gapItems);

  return {
    requirements,
    retrieval,
    matches,
    reviewQueue: reviewItems,
    gaps: gapItems,
    proofCards: cards,
    decision,
    interviewRisks: risks
  };
}
