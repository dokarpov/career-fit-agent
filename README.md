# RoleHint.

**Know before you apply.** An evidence-first job decision tool.

[Live website](https://dokarpov.github.io/rolehint/site/) · [Try the real-job assessment](https://dokarpov.github.io/rolehint/site/assess.html)

## Public prototype

Paste the text of a real vacancy and optionally store its original URL as a reference. Set your country, work arrangement, annual EUR salary floor, and seniority once (saved locally). The assessment separates explicit potential mismatches from unknown hiring conditions, extracts likely role requirements for your review, and generates targeted recruiter questions plus an application note using only experience you supplied.

**Limits:** Static GitHub Pages cannot reliably fetch arbitrary job URLs. URL input is reference-only; paste the listing text to analyze it. Checks use deterministic browser heuristics, not an AI model or verified employer data; they can miss restrictions and produce false positives. User-marked requirements and self-described experience are not independently verified. Nothing is uploaded or sent; the app does not connect accounts, apply for jobs, or predict hiring outcomes.

An [older job-description wizard](https://dokarpov.github.io/rolehint/site/check.html) and [fictional discovery workbench](https://dokarpov.github.io/rolehint/site/workspace.html) remain available as legacy experiments, not as the primary demo.

## Technical work

The repository contains separate backend experiments for source-driven opportunity discovery, eligibility checking, evidence mapping and human review. **These services are not connected to the GitHub Pages demo.**

```bash
cp .env.example .env
docker compose up --build
```

[Technical overview](docs/TECHNICAL_OVERVIEW.md) · [Decision policy](docs/DECISION_POLICY.md)

*Exploratory prototype · No demonstrated hiring uplift or product–market fit.*
