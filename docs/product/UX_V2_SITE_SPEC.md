# Career Fit UI / Website v2 — implementation notes

## Job-to-be-done

Daily: **What deserves my attention right now?** Weekly: **Is my search progressing?** Occasional: **Which constraints, evidence and search settings should I adjust?**

## Progressive app layer

`telegram_miniapp/ux-v2.js` and `ux-v2.css` reorganize the existing application without changing the backend API or claim-approval state machine.

**Today**: one grounded next-action card -> current recommendations -> only meaningful eligibility blockers -> more roles -> small metrics. The engine's original Autopilot, strategy, estimates and funnel are kept under expandable settings. A bottom navigation gives repeat users direct access to Today, All roles, Progress and Settings. Inline application-pack access is provided for non-Telegram previews.

**Onboarding**: original 4-step flow and hard constraints stay unchanged. **Pack**: proof approval and export semantics stay unchanged. **Pipeline**: existing canonical preview is unchanged and the UX overlay is hidden in pipeline mode.

## Website

Static Oído-style storytelling pattern: sharp value proposition, fully coded interaction demo, clear evidence boundary, genuine use-case differences, honest prototype disclosure. No stock photography, fabricated traction, arbitrary fit accuracy or invented live role counts. SEO/agent-readable semantic text and JSON-LD; `site/llms.txt` explains boundaries; no JS required to read positioning and feature content.

## Review checklist before merging

1. Visual review at 320/375/768/1280px, dark and light Telegram themes, keyboard-only.
2. Test onboarding, live job rows, claim approval, exports, strategy save, failure/paused states with a real API session.
3. Decide brand lockup and external URL; verify GitHub Pages before enabling a canonical meta URL.
4. Run user usability sessions for targeted / transitioning / urgent job seekers. Measure time to first useful decision, taps per application and false eligibility blockers.

## No claims of validated impact

The UI is implemented and existing Node test suite passes. It has not been validated by a production usability study and was not tested against live user credentials.
