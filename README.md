# Career Fit Agent v1.9.0

**Evidence-first job-search orchestration for experienced professionals.**

Most AI job tools optimize text generation. Career Fit starts one layer earlier: **is the role actually eligible, what evidence supports the match, what is missing, and what can the system safely say without inventing ownership or impact?**

```text
connect sources
      ↓
infer target + hard constraints
      ↓
discover vacancies
      ↓
eligibility preflight
      ↓
requirements ↔ evidence/provenance
      ↓
fit tier + effort recommendation
      ↓
use evidence / human review / gap
      ↓
application pack
      ↓
outcome tracking → funnel learning
```

## Product wedge

**Evidence orchestration + fit diagnosis + proof packaging + conversion learning.**

This is deliberately not an AI CV writer, generic cover-letter generator or “apply everywhere” bot. The system keeps hard eligibility, evidence provenance and outward claims separate from persuasive copy.

## Core product decisions

### 1. Hard constraints before semantic fit

Work authorization, geography/remote constraints, excluded roles/domains, minimum seniority and clearly incompatible published compensation can invalidate an opportunity. A good embedding score cannot override them.

### 2. `similarity != proof`

A requirement may be semantically similar to a candidate's experience without being safe to claim externally. Proof objects keep source, ownership, result type and confidence attached to the claim.

### 3. Three evidence outcomes

```text
USE       verified evidence is sufficient
REVIEW    evidence exists but ownership / wording / confidence needs a person
GAP       the requirement is not supported by available evidence
```

The product prefers a visible gap over a fabricated accomplishment.

### 4. Controlled volume, not indiscriminate automation

The funnel allocates weekly effort across high-fit, acceptable-fit and low-cost bets. It never weakens hard constraints or manufactures duplicate opportunities just to hit a quota.

### 5. Humans stay at irreversible / identity-sensitive boundaries

Automation handles discovery, retrieval, dedupe, requirement parsing, evidence matching, retry scheduling and outcome learning. Human approval remains for personal constraints, verified outward claims, final application/send and payment/refund actions.

## What is implemented

- vacancy discovery adapters for common ATS/career-site sources;
- hard preflight and target-profile logic;
- requirement extraction and evidence matching;
- provenance-aware evidence store / retrieval;
- gap resolution and human-review paths;
- deduplication using company + normalized role + requisition/fingerprint;
- reusable proof / application-pack generation;
- application tracking and funnel analytics;
- weekly funnel planner with guarded learning after enough observed outcomes;
- Gmail job-alert ingestion, Telegram/Mini App surfaces and self-host setup;
- local pipeline cockpit for a private workbook (localhost-only; not intended for publication/proxying).

## Funnel policy

The default baseline is **23 unique applications/week**:

- **P0/P1: 6** — strongest natural fit and/or exceptional upside;
- **P2: 10** — acceptable fit, including roles with incomplete public compensation data;
- **Low-cost: 7** — defensible applications with low effort and no heavy take-home burden.

Before 50 unique applications, the product uses the baseline allocation. From 50–75, observed screening/interview conversion is blended progressively. From 75 onward, allocation may shift toward tiers producing better yield per unit of application effort, with guardrails.

These numbers are **product defaults / operating policy**, not claims of statistical optimality.

## Trust boundary

```text
retrieval / semantic match
          ≠
      verified proof
```

An automatic match may rank a vacancy. An outward proof card still requires a current evidence object and role-level approval. Export paths revalidate the exact claim against the source-of-truth evidence object.

## Run locally

```bash
cp .env.example .env
docker compose up --build
```

Then open:

- API docs: `http://localhost:8000/docs`
- Self-host setup: `http://localhost:8000/setup/`
- Mini App preview: `http://localhost:8000/miniapp/`

JavaScript tests:

```bash
npm test
# 22/22 in v1.9.0
```

The backend also contains Python unit tests under `backend/tests/` for the service modules.

## Public / evidence boundary

The public repository demonstrates architecture, structured product logic, provenance-aware matching, human fallback, evaluation discipline and a working prototype.

It does **not** prove PMF, paid traction, statistically calibrated hiring probability, production-grade semantic search or enterprise integrations. Public fixtures and examples are intentionally separated from private evidence sources.

## Useful docs

- `docs/PRODUCT_BOUNDARIES.md`
- `docs/architecture/SOURCE_COVERAGE.md`
- `docs/product/FUNNEL_AUTOPILOT_V16.md`
- `docs/product/HUMAN_WORK_AUDIT_V16.md`

## Related projects

- [`decision-systems`](https://github.com/dokarpov/decision-systems) — explicit system vs human decision boundary.
- [`policy-kit`](https://github.com/dokarpov/policy-kit) — tool-action AUTO / ASK / BLOCK policy.

---

Built by **Daria Karpova** · Product Systems & AI · 0→1 · [dokarpov](https://github.com/dokarpov)
