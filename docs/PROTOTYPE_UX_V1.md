# RoleHint — First-session UX specification (implemented prototype)

Updated 12 October 2026. Scope: `site/workspace.html` and standalone onboarding. Public marketing website remains separate.

## Product contract
RoleHint helps candidates screen vacancies against work constraints and review what can be substantiated from their experience. **This GitHub Pages prototype uses fictional sample vacancies and sample candidate evidence; it does not compare the visitor's uploaded CV with live openings.** The demo must explain that limitation before collecting CV text, after finishing onboarding, and beside recommendations.

## First-session information architecture
1. **Start.** One primary action: choose CV (PDF/DOCX/TXT under 10MB); alternative: paste CV text; explicit secondary action: explore sample jobs without a CV. No registration/paywall.
2. **Read and recover.** Validate file and show processing status. If PDF/DOCX parser fails, allow paste. Preserve original input so retry does not destroy work.
3. **Review evidence.** Present a short theme extraction summary explicitly labelled **keywords**, not verified professional achievements. Show complete editable extracted text. Allow replace/back, then confirm.
4. **Set search rules.** Target role and hiring country are required to proceed; work arrangement has a visible default; base salary is optional. Explain data stays in the browser and is not used to score live jobs.
5. **First decision.** Show contextual guidance to review one fictional opportunity, inspect eligibility/status, expand evidence sources, then choose a meaningful action in the existing workspace.
6. **Return.** Skip onboarding when a local profile exists; provide **My experience** to reopen. The profile summary refreshes without a page reload. No fake trial countdown.
7. **No-CV demo.** Skip directly to the sample decision flow without implying personalization.

## Mobile architecture
- At <=760px, onboarding content is a single column with readable headings and full-width upload controls; decorative 3D document objects are removed from the visual flow.
- Existing workbench list → inspector navigation remains native; back returns to the job list.
- Keep action and disclosure controls at least 44px high.
- Avoid two nested scrolling regions and width overflow.
- Respect reduced-motion settings.

## State and copy rules
- "Supported" = *sample* proof attached; never a verified user claim.
- "To confirm" = unresolved question with a source/context.
- "Missing" = no proof in the sample, not a judgment of the user.
- Save/pass/draft actions are local **demo state**. Preparing a draft does not submit an application.
- Browser-local CV text is **sensitive**. Explain localStorage and provide a clearing action before production user trials.
- Every enabled control must perform an action or be removed.

## Acceptance checks
Automated checks: `site/qa-workspace.mjs`, GitHub workflow `prototype-ux.yml`.
Expected viewport widths: 320, 375, 390, 768, 1024, 1440.
Required scenarios: initial onboarding; paste text; step back; missing target role; missing hiring country; completion without reload; guided first job; no-CV skip; mobile overflow and JS errors.

## Unfinished product capabilities
- Actual evidence extraction is only keyword matching and editable raw text; it does **not** reliably identify skills, impact, seniority or project ownership.
- Vacancy filtering is sample-only and does **not** use new CV or country inputs to match real roles.
- No backend persistence, real employer eligibility verification, live job ingestion or application submission.
- Real mobile Safari/Android and assistive-technology testing is still required; writing tests does not mean they have passed.

## Definition of done for a real beta
Signed-in storage/privacy controls; structured and reviewable evidence with document provenance; trustworthy country/compensation hard checks; working actions and recoverable failures; functional browser/device QA; consent and retention handling for CV files.
