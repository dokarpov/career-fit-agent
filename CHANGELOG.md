# Changelog

## v1.8.1 — 2026-10-09

### Packaging / product
- README restructured: product overview first, then version history and local pipeline cockpit
- Explicit product boundaries and status (what public prototype proves / does not prove)
- package.json version, author, keywords
- CHANGELOG added

### Unchanged
- Funnel control, onboarding, Codespaces path, evals, Telegram surface, evidence matching logic

## v1.8.0
- Onboarding + one-click Codespaces; funnel policy in onboarding

## v1.7.0
- Funnel Control (pace + reach)

## v1.6.0
- Funnel Autopilot baseline

## v1.9.0 — 2026-10-09

### Product / system
- **Preflight is a full hard-constraint stack**, not only geography:
  - geo / authorization
  - compensation floor vs published min
  - remote-only / relocation
  - contract type exclusions
  - language verification
- Returns structured `gates`, `reasons[]`, `mayAnalyzeFit`, `maySend`
- `stackAction()` helper aligned with Decision Policy (DO_NOT_APPLY / VERIFY_FIRST / REVIEW_PROOF / DEPRIORITIZE / APPLY)
- Backward compatible: `preflight(role)` without prefs still works
