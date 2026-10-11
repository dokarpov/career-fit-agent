export function evaluateConstraints(role, prefs) {
  const c = role.constraints || {};
  const hard = [];
  const verify = [];
  const soft = [];

  if (prefs.remoteOnly && c.remote === false) {
    hard.push("Role is not remote while remote-only is required.");
  }

  if (!prefs.allowRelocation && c.relocationRequired === true) {
    hard.push("Role requires relocation, which is outside the current search constraints.");
  }

  if (typeof c.salaryMin === "number") {
    if (c.salaryMin < prefs.salaryFloorAnnual) {
      hard.push(`Published minimum compensation (${c.salaryMin}) is below the configured floor (${prefs.salaryFloorAnnual}).`);
    }
  } else {
    verify.push("Compensation is not published; verify before a high-effort application.");
  }

  if (typeof c.roleInterest === "number" && c.roleInterest < prefs.minRoleInterest) {
    soft.push(`Role interest is ${c.roleInterest}/100, below preferred ${prefs.minRoleInterest}.`);
  }

  if (typeof c.domainAppetite === "number" && c.domainAppetite < prefs.minDomainAppetite) {
    soft.push(`Domain appetite is ${c.domainAppetite}/100, below preferred ${prefs.minDomainAppetite}.`);
  }

  if (typeof c.applicationMinutes === "number" && c.applicationMinutes > prefs.maxApplicationMinutes) {
    soft.push(`Estimated application effort (${c.applicationMinutes} min) exceeds the ${prefs.maxApplicationMinutes}-minute budget.`);
  }

  const state = hard.length ? "BLOCKED" : verify.length ? "VERIFY" : soft.length ? "LOW_PRIORITY" : "CLEAR";
  return { state, hard, verify, soft };
}

export function finalAction({ preflight, constraints, fit }) {
  if (preflight.state === "BLOCKED" || constraints.state === "BLOCKED") return "DO_NOT_APPLY";
  if (preflight.state === "VERIFY" || constraints.state === "VERIFY") return "VERIFY_FIRST";
  if (fit.verdict === "SKIP") return "DO_NOT_APPLY";
  if (fit.verdict === "REVIEW") return "REVIEW_PROOF";
  if (constraints.state === "LOW_PRIORITY") return "DEPRIORITIZE";
  return "APPLY";
}
