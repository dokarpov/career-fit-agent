export function estimateApplicationValue({ role, analysis, preferences }) {
  const c = role.constraints || {};
  const verified = analysis.proofCards?.length || 0;
  const review = analysis.reviewQueue?.length || 0;
  const gaps = analysis.gaps?.length || 0;
  const total = Math.max(1, (analysis.requirements || []).length);

  const reuseRatio = Math.min(1, verified / total);
  const proofFriction = Math.min(1, (review + gaps) / total);

  // Base effort comes from current batch metadata, then reduced by reusable proof.
  const baseMinutes = Number(c.applicationMinutes || 45);
  const estimatedMinutes = Math.max(
    10,
    Math.round(baseMinutes * (1 - reuseRatio * 0.55) * (1 + proofFriction * 0.45))
  );

  const interest = Number(c.roleInterest ?? 50);
  const domain = Number(c.domainAppetite ?? 50);
  const salaryKnown = typeof c.salaryMin === "number";
  const salaryFit = salaryKnown
    ? Math.min(100, Math.round((c.salaryMin / preferences.salaryFloorAnnual) * 75))
    : 55;

  // Not a probability of getting hired. It's a prioritization heuristic.
  const opportunityScore = Math.round(
    0.32 * interest +
    0.23 * domain +
    0.25 * Math.round(reuseRatio * 100) +
    0.20 * salaryFit
  );

  const efficiency = Math.round(opportunityScore / Math.max(estimatedMinutes / 15, 1));

  let valueBand = "LOW";
  if (opportunityScore >= 75 && estimatedMinutes <= 35) valueBand = "HIGH";
  else if (opportunityScore >= 60 && estimatedMinutes <= 50) valueBand = "MEDIUM";

  return {
    reuseRatio:Number(reuseRatio.toFixed(2)),
    proofFriction:Number(proofFriction.toFixed(2)),
    estimatedMinutes,
    opportunityScore,
    efficiency,
    valueBand,
    note:"Prioritization heuristic only — not a hiring probability."
  };
}
