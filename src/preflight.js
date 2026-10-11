/**
 * Hard-constraint preflight — runs BEFORE evidence fit analysis.
 *
 * Product rule (from live batch 2026-10-02):
 * fit analysis cannot happen before hard-constraint preflight.
 * A role may have excellent evidence fit and still be non-sendable.
 *
 * States:
 *   CLEAR   — may analyze fit and may send
 *   VERIFY  — may analyze fit, must not send until human verifies
 *   BLOCKED — may analyze fit for learning, must not send
 *
 * This is intentionally separate from evidence fit (PURSUE / REVIEW / SKIP).
 */

function geoGate(role) {
  const geo = role?.geo?.state || "review";
  if (geo === "block") {
    return { severity: "BLOCKED", reason: role.geo?.reason || "Geography / authorization blocked." };
  }
  if (geo === "review") {
    return { severity: "VERIFY", reason: role.geo?.reason || "Geography / authorization needs verification." };
  }
  return { severity: "CLEAR", reason: role?.geo?.reason || "No hard location blocker detected." };
}

function compensationGate(role, prefs = {}) {
  const c = role?.constraints || {};
  const floor = prefs.salaryFloorAnnual;
  if (typeof c.salaryMin === "number" && typeof floor === "number") {
    if (c.salaryMin < floor) {
      return {
        severity: "BLOCKED",
        reason: `Published minimum compensation (${c.salaryMin}) is below the configured floor (${floor}).`
      };
    }
  }
  if (c.salaryMin === undefined || c.salaryMin === null) {
    return {
      severity: "VERIFY",
      reason: "Compensation is not published; verify before a high-effort application."
    };
  }
  return null;
}

function remoteRelocationGate(role, prefs = {}) {
  const c = role?.constraints || {};
  if (prefs.remoteOnly && c.remote === false) {
    return {
      severity: "BLOCKED",
      reason: "Role is not remote while remote-only is required."
    };
  }
  if (!prefs.allowRelocation && c.relocationRequired === true) {
    return {
      severity: "BLOCKED",
      reason: "Role requires relocation, which is outside the current search constraints."
    };
  }
  return null;
}

function contractLanguageGate(role, prefs = {}) {
  const c = role?.constraints || {};
  if (prefs.excludeContractTypes?.length && c.contractType) {
    if (prefs.excludeContractTypes.includes(c.contractType)) {
      return {
        severity: "BLOCKED",
        reason: `Contract type ${c.contractType} is excluded by search policy.`
      };
    }
  }
  if (prefs.requiredLanguages?.length && c.languages?.length) {
    const missing = prefs.requiredLanguages.filter((l) => !c.languages.includes(l));
    if (missing.length) {
      return {
        severity: "VERIFY",
        reason: `Role languages may not cover required: ${missing.join(", ")}.`
      };
    }
  }
  return null;
}

/**
 * @param {object} role
 * @param {object} [prefs] optional preference object (salaryFloorAnnual, remoteOnly, allowRelocation, ...)
 * @returns {{ state: 'CLEAR'|'VERIFY'|'BLOCKED', reason: string, reasons: string[], mayAnalyzeFit: boolean, maySend: boolean, gates: object }}
 */
export function preflight(role, prefs = {}) {
  const gates = {
    geo: geoGate(role),
    compensation: compensationGate(role, prefs),
    remoteRelocation: remoteRelocationGate(role, prefs),
    contractLanguage: contractLanguageGate(role, prefs)
  };

  const active = Object.entries(gates)
    .filter(([, g]) => g && g.severity !== "CLEAR")
    .map(([name, g]) => ({ name, ...g }));

  const blocked = active.filter((g) => g.severity === "BLOCKED");
  const verify = active.filter((g) => g.severity === "VERIFY");

  let state = "CLEAR";
  let reason = gates.geo.reason;
  const reasons = [];

  if (blocked.length) {
    state = "BLOCKED";
    reason = blocked.map((g) => g.reason).join(" ");
    reasons.push(...blocked.map((g) => g.reason));
  } else if (verify.length) {
    state = "VERIFY";
    reason = verify.map((g) => g.reason).join(" ");
    reasons.push(...verify.map((g) => g.reason));
  } else {
    reasons.push(gates.geo.reason);
  }

  return {
    state,
    reason,
    reasons,
    mayAnalyzeFit: true,
    maySend: state === "CLEAR",
    gates
  };
}

/** Convenience: map preflight + constraints + fit to final product action. */
export function stackAction({ preflight: pf, constraints, fit }) {
  if (pf?.state === "BLOCKED" || constraints?.state === "BLOCKED") return "DO_NOT_APPLY";
  if (pf?.state === "VERIFY" || constraints?.state === "VERIFY") return "VERIFY_FIRST";
  if (fit?.verdict === "SKIP") return "DO_NOT_APPLY";
  if (fit?.verdict === "REVIEW") return "REVIEW_PROOF";
  if (constraints?.state === "LOW_PRIORITY") return "DEPRIORITIZE";
  return "APPLY";
}
