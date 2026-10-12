# RoleHint public site

Live: https://dokarpov.github.io/rolehint/site/

The static GitHub Pages site contains the marketing presentation, native, responsive, clickable guided product preview derived from existing workspace, and early-access application form. The actual experimental product lives in `workspace.html` and is not a production service.

## Before sharing

1. Confirm the FormSubmit activation email sent to **dokarpov@gmail.com**; this step must be done by the mailbox owner.
2. Submit one real test application through `/#apply` from another email and confirm receipt (check spam).
3. Open the public site on a real mobile browser and check width, embedded workspace behavior, form validation and confirmation redirect.
4. Check https://dokarpov.github.io/rolehint/site/privacy.html

## Form configuration

`index.html` contains the `https://formsubmit.co/dokarpov@gmail.com` form action, CAPTCHA, honeypot, and the thank-you redirect. `early-access.js` reports submission progress without intercepting the POST. **No receipt is guaranteed before verification.** This is a third-party email form, not an application database.

## Install

A web manifest and service worker enable basic PWA use. Open the site in Safari on iOS and select **Share → Add to Home Screen**, or choose **Install** in a supporting Android/desktop browser. Some install prompts may require raster PNG icons in addition to the SVG manifest icon; those are not bundled yet. Offline access never queues form POSTs.

## Brand and UI

Purple icon: `favicon.svg`. Typography/material tokens: `design-lock.css` and `silver-restore.css`. Historical source and rules: `../docs/DESIGN_SYSTEM.md`.

The public site is independent from the unfinished CV onboarding/demo; no user account, payments or live AI inference are available on GitHub Pages.

## Privacy and legal readiness

The expanded `privacy.html` now contains 12 sections including data flows, legal bases, processor and transfer caveats, retention, rights, local storage, security incidents and future AI processing. The public form includes a first-layer privacy summary. **Not launch-complete:** the operator's verified legal identification and direct dedicated mailbox, controller-side retention schedule and processor/transfer review are still outstanding. These must be supplied before claiming GDPR compliance. Updated service-worker cache version `rolehint-public-v3` helps prevent stale privacy content.

## Shareable Release 1

The landing page no longer embeds the workspace in an iframe. `release-v1.css` and `release-v1.js` provide a native, accessible preview with three selectable fictional roles. No live hiring checks are implied. The public workspace remains experimental.

QA source: `qa-release.mjs` with GitHub Actions workflow `../.github/workflows/release-qa.yml` (GitHub Actions tab). It checks 320/375/390/768/1024/1440 widths, preview controls, CTA, form wiring and privacy overflow using headless Chromium. Check the workflow result; a test file is not a successful test.

Before public promotion, verify the FormSubmit receiving inbox and a test submission, supply the dedicated project mailbox and full controller identity, review the privacy notice, and validate on actual mobile Safari/Android. These steps are pending external confirmation.

## Product UX implementation (separate from the marketing site)

`workspace.html` now offers a direct first-use path: choose/paste CV → review editable text → confirm hiring rules → guided sample job review, with a transparent no-CV bypass. It preserves the fictional-data distinction, shows locally saved search preferences, and offers a delete-local-CV control under Preferences. Saved/passed sample-role decisions persist in localStorage across visits.

See [UX specification](../docs/PROTOTYPE_UX_V1.md) and [automated onboarding scenarios](qa-workspace.mjs); the Actions workflow is `../.github/workflows/prototype-ux.yml`. Browser and device acceptance remain unverified until the checks are run and reviewed. Real personalized job analysis is not present.
