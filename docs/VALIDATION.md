# Career Fit Agent validation plan

The product hypothesis is not “AI can write applications.” It is:

> Better eligibility filtering + evidence provenance can increase useful applications per unit of effort without increasing unsupported claims.

## Primary product outcomes

- **Useful applications per hour** — applications that pass hard eligibility and are worth the effort.
- **Evidence coverage** — requirements backed by verified evidence vs REVIEW / GAP.
- **Unsupported-claim incidents** — target is zero; a persuasive sentence is not allowed to become proof.
- **Screening / interview signal rate by tier** — observed outcome, not predicted probability.
- **Time per application** — including human review.
- **Duplicate / hard-constraint leakage** — should remain visible as failures, not hidden in aggregate volume.

## Evaluation sequence

1. Validate hard constraints and dedupe before semantic fit.
2. Validate evidence provenance independently from copy quality.
3. Compare the agent-assisted workflow against a manual baseline for the same target profile.
4. Track observed outcomes by tier and effort.
5. Only adapt allocation after the sample thresholds already encoded in the funnel policy.

## Guardrails

- Similarity is never treated as proof.
- GAP stays visible.
- Final outward claims and final send remain human-controlled.
- Public examples exclude private/former-employer source material.
- A higher application count alone is not success if quality or evidence integrity falls.

## Current boundary

The repository proves the orchestration model, tests, managed-runtime backend path and responsive Mini App shell. It does not yet prove interview lift, hiring probability calibration or paid traction.
