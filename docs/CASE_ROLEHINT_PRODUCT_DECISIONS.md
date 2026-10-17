# RoleHint: a job search that remembers its own decisions

**Current stage:** working backend components; connected browser journey under development.  
**Role:** independent product design, research, UX, implementation and release validation.  
**Origin:** [Public product reflection (17 October 2026)](https://www.linkedin.com/posts/dokarpov_job-hunting-has-a-fascinating-feature-collective-activity-7517137903018295296-sVIi).

## The problem wasn't another missing AI feature

I was applying for jobs and kept encountering the same costly repetitions: upload a CV, type the career history again, discover a role with incompatible hiring requirements, get an AI-generated claim I could not substantiate, or rediscover a company I'd already applied to. Separate tools covered individual steps, but nobody owned the continuity between them.

The product question became **how to preserve context and make the next application decision better**, rather than how to generate more applications.

## Four product decisions

| Decision | Why | Visible boundary |
| --- | --- | --- |
| Check eligibility before persuasion | “Remote” does not establish whether an employer can hire someone based in a particular country; hard blockers waste effort | A hard block, unknown requirement and soft preference are three different states |
| Match requirements to evidence, not confident phrasing | A relevant keyword or plausible rewrite does not prove scope, ownership or outcomes | `REVIEW` / `GAP` remains visible; final claims need approval |
| Remember companies, jobs and outcomes | A job search is longitudinal, not a sequence of disconnected CV-generation sessions | Deduplication, saved search settings and application status are part of the product model |
| Count useful outcomes, not activity | Ten listings displayed or a generated document isn't the same as a good completed application | Value follows an approved application package and confirmed submission/handoff, not a page view |

This rules out a single opaque “94% match” rating. An explainable **next action** is more useful: apply, verify eligibility, review proof, deprioritise or skip.

## Inspect the work, not just the mockup

| What has an implementation or test | Evidence you can inspect | What that evidence *doesn't* establish |
| --- | --- | --- |
| Live-source vacancy discovery has an executable path | [Job search service](../backend/app/services/job_search.py) and [public ATS test](../tests/test_real_job_sources.py) | A full personalised real-job browser journey |
| Hard constraints and free-discovery rules are modelled | [Decision policy](DECISION_POLICY.md) and [worker regression](../tests/test_free_discovery_worker.py) | Correct eligibility for every employer or country |
| Requirements are compared with candidate evidence rather than a universal fit percentage | [Matching service](../backend/app/services/auto_match/service.py) and [proposal engine](../backend/app/services/pack_proposal/engine.py) | Independent verification of every source claim, or accuracy on all vacancies |
| Application packs can be rendered from explicitly approved proof cards | [Pack rendering and export rules](../backend/app/services/application_packs/render.py) | A completed browser editing/approval/export journey |
| Application responses can be classified and ingested from authorized mail connections | [Status reducer](../backend/app/services/application_tracking/state.py) and [Gmail sync service](../backend/app/services/application_tracking/gmail_sync.py) | Live end-to-end mailbox sync for every user, or verified submission coverage |
| Preferences can persist for distinct authenticated users | [Persistence regression](../tests/test_settings_persistence.py) | Finished standalone web onboarding or cloud sync across all clients |
| Web identity boundaries are tested | [Web identity tests](../tests/test_web_identity.py), with mocked outbound email | A working production email sign-in; mail transport requires deployment configuration |
| Full journey is specified, not yet accepted | [Product CJM and release acceptance](PRODUCT_EXPERIENCE_V1.md) | A released application submission and tracking experience |

An internal `verified` evidence flag represents the project's evidence policy, **not independent third-party verification of a career claim**. A passing unit/contract check is evidence for its specific behavior, not evidence of an end-to-end launch. The public [overview](https://dokarpov.github.io/rolehint/site/) contains illustrative employer data. The [Telegram entry](https://rolehint-api-worker-production.up.railway.app/open-bot) is the current connected channel; neither is presented here as a finished browser product.

## How I'll know it actually helps

The hypothesis is **more useful applications per hour, with fewer unsupported claims and fewer repeated or ineligible submissions**. The test must compare real candidates' application work against a manual baseline, with eligibility, accuracy, human review time and downstream employer response tracked separately.

Current state: backend components and focused technical checks exist, but **improved screening outcomes, application time savings, production browser E2E, user retention and paid traction have not been established**. The next release gate is a complete, safe CV-or-role entry → real vacancy → evidence review → approved package → supported submission/handoff → saved outcome journey.

## Why this is a product-management case

The hard work is not generating another convincing paragraph. It is deciding what the software may infer, which conditions must be checked first, where uncertainty stays visible, what needs a person's approval and which event actually represents user value. The interface and architecture follow those decisions—not the other way around.
