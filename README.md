# RoleHint

**Career decisions with evidence — product under active validation.**

RoleHint explores a workflow from job discovery and hiring eligibility to verifiable experience, role-specific application materials and application tracking. Its purpose is to reduce wasted effort, not produce more unfiltered vacancies.

> **Release boundary (17 October 2026):** the complete browser journey — real eligible opportunities → verified evidence mapping → editable application package → submission/hand-off → durable tracking — has **not** been accepted as a public end-to-end release. Sample jobs are not live employer recommendations; no checkout or paid subscription is operational.

## Choose the correct entry

| Entry | What exists | What it does not prove |
| --- | --- | --- |
| [Public overview](https://dokarpov.github.io/rolehint/site/) | Editorial landing page with illustrative Discover / Verify / Decide states | Not an end-to-end authenticated web application |
| [Telegram bot entry](https://rolehint-api-worker-production.up.railway.app/open-bot) | Current entry to the authenticated bot experience | Does not establish universal ATS submission or the complete browser CJM |
| [Browser sample workspace](https://dokarpov.github.io/rolehint/site/workspace.html) | Local demonstration using fictional jobs and locally saved preferences | No CV-to-live-vacancy matching, account sync or real application submission |
| [Experimental search desk](https://dokarpov.github.io/rolehint/) | Separate web shell for search settings and decisions | Not a separately accepted public product release |

The public website must not advertise fictional employers as live vacancies. The sample workspace should not invite real CV data without a complete privacy and security review.

## What is implemented and tested

The repository includes backend ATS discovery, vacancy checks, decision logic, search settings, application-package experiments and Telegram integrations. The [backend release gate](https://github.com/dokarpov/rolehint/actions) has passed automated checks, including a public ATS vacancy-source check on 17 October 2026. **That verifies a narrow technical slice, not the complete applicant journey.**

The static website and the backend are different release surfaces. A green build for one does not establish that the other is connected or ready.

## Product decision and acceptance

[Product experience / CJM and release acceptance](docs/PRODUCT_EXPERIENCE_V1.md) is the source of truth. The planned first value is **up to ten distinct, live, eligibility-checked opportunities without a card**, with transparent evidence gaps and job-specific materials. If fewer real opportunities exist, the product must show the actual count rather than fabricate a quota.

A public release requires verified account/session behavior; real and reachable jobs; safe CV parsing and editable facts; approved export; authorized submission or honest handoff; durable tracking; privacy/recovery paths; and real browser E2E on a deployed version.

[Decision policy](docs/DECISION_POLICY.md) · [Technical overview](docs/TECHNICAL_OVERVIEW.md) · [ADR: value before payment](docs/adr/ADR-001-value-before-payment.md)

**Pricing:** the current sample is free; the pricing and subscription pages describe a *possible future offer*, not an active trial, automatic renewal, working checkout or an available subscription.

**Status:** exploratory product / technical validation. No hiring uplift, revenue or product–market fit is claimed.
