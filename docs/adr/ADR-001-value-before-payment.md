# ADR-001 — Value before payment; evidence before application
Date: 2026-10-16
Status: **Accepted product direction** (implementation pending)
Related contract: [RoleHint product experience](../PRODUCT_EXPERIENCE_V1.md)

## Context
The current public CV-first page persists demo preferences locally and redirects to fictional jobs. The Telegram-authenticated backend is separate. Marketing/mobile CI success does not prove that an anonymous browser user can receive real vacancies, tailor a CV, or apply. The founder rejected launch messaging before the complete core loop.

## Decision
1. Use a unified entry module: **CV upload OR target role**. Neither is mandatory for beginning the alternative path.
2. Offer useful free CV analysis and up to ten qualified live job opportunities, no card. CV matching adds evidence-depth; role-first matching is explicitly provisional.
3. Establish secure identity before persisting identifiable results/quota; process optional anonymous CV only transiently with clear consent and expiry.
4. Count unique *delivered valid jobs*, not searches. Give each a free application studio: tailored CV, cover letter, relevant insights and pre-drafted screening answers from real questions where available.
5. Enforce human approval of factual changes and actual submission. Prefer authorized ATS integration; fall back to browser-assisted autofill and honest application companion when embedded forms are blocked.
6. Monetization follows proven value, with Stripe checkout/trial only after explicit approval and tested subscription lifecycle.
7. Evidence status reflects provenance, ownership and external corroboration. Retrieval overlap alone does not mean verified.
8. No fictional jobs in authenticated user results. Public example media must be labelled. No public acquisition campaign until full verified production E2E.

## Alternatives rejected
- CV required before seeing any vacancies: too much friction.
- Ten sample jobs, a separate fictional workspace, or magic-looking but nonfunctional CTA: no value.
- Charge or require a card before showing real matches: weak trust/activation.
- Embed arbitrary employer websites into an iframe: often blocked by CSP/X-Frame-Options and mobile behavior.
- Unreviewed auto-apply: false claim and irreversible-action risk.
- Treat user-typed metrics or AI similarity as independently verified proof: misleading.

## Consequences and dependencies
Requires a real browser authentication stack, explicit data retention/deletion, vacancy source quality, idempotent quota/entitlements, evidence provenance schema, template/document generator, ATS-form integration strategy, and release automation that proves a complete customer journey. Stripe connection alone is insufficient.

## Review triggers
New evidence from user testing, ATS legal/technical constraints, CV data-protection assessment, payment economics or materially different usage patterns. Update this ADR with a new superseding ADR rather than silently rewriting accepted product decisions.
