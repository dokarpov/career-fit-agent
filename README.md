# RoleHint

**Less searching. Better deciding.**

[Public website](https://dokarpov.github.io/rolehint/site/) · [Early-access application](https://dokarpov.github.io/rolehint/site/#apply) · [Privacy](https://dokarpov.github.io/rolehint/site/privacy.html)

## What visitors see

A responsive editorial landing page with restored large typography, purple brand icon, graphite/lilac/silver accents, and a responsive, native guided preview derived from the existing RoleHint workspace. The three selectable opportunities are fictional demonstration data; it is **not** real CV matching or employer discovery. The public CTA opens an early-access application form.

## Receiving applications

The form submits via **FormSubmit** to `dokarpov@gmail.com` and includes name, email, and an optional job-search goal. It does **not** use `mailto:` or require a visitor to send an email draft. A CAPTCHA/honeypot is enabled.

**Required one-time activation:** FormSubmit sends an activation/verification message to the receiving address. Confirm that message before sharing the site widely. Until verification and an end-to-end test succeed, **receipt of submissions is unverified**. Test with a different email address and verify delivery to Inbox/Spam. The form depends on FormSubmit's availability and privacy practices, and this static site has no first-party submission database, autoresponder, or admin console.

## Install RoleHint

The public website includes a web manifest and service worker for installation and basic offline caching.

- **iPhone (Safari):** open the site, Share → Add to Home Screen.
- **Android (Chrome):** open the site, menu → Install app or Add to Home Screen.
- **Desktop (Chromium):** use the browser's Install option when offered.

A standalone app-store package is not provided. The current manifest references an SVG icon; some browsers require PNG icon sizes for install prompts, so installability is device/browser dependent. Offline caching is for public pages, **not** submitting applications offline.

## Repository contents

- `site/` — public marketing site, early-access form, PWA assets, privacy and thank-you pages.
- `site/workspace.html` — experimental fictional job-decision workspace and CV-first onboarding; not ready for public product launch.
- Other backend and checker experiments are **not connected** to the GitHub Pages site.
- `docs/DESIGN_SYSTEM.md` — typography and visual rules.

Planned split into `rolehint-site` (public), `rolehint-app` (public), and `rolehint-core` (private) is **not completed**. This GitHub repo remains public, including its history and experimental backend.

## Development

```bash
cp .env.example .env
docker compose up --build
```

[Technical overview](docs/TECHNICAL_OVERVIEW.md) · [Decision policy](docs/DECISION_POLICY.md) · [Design system](docs/DESIGN_SYSTEM.md)

*Exploratory prototype. No verified hiring uplift or product–market fit.*

## Release 1 — one-site shareability pass

- Replaced iframe with one responsive, fully clickable HTML/CSS/JS product preview for three illustrative roles (no inner scroll or separate mini-browser).
- Bumped service-worker cache so updated styles, privacy policy and preview scripts refresh.
- Added `site/qa-release.mjs` and `.github/workflows/release-qa.yml` for Chromium regression checks at 320, 375, 390, 768, 1024 and 1440px; checks preview selection, CTA wiring and privacy overflow. A test definition is **not proof of a passed run**. Check GitHub Actions for the actual result.
- Kept live demo unpromoted while product onboarding remains experimental.

**Release acceptance still pending:** receiving mailbox verification, a real end-to-end test lead, legal controller identification and direct privacy contact, real Safari/Android device QA, and verification of deployment/build status. Do not claim complete GDPR compliance or validated mobile QA without those checks. The FormSubmit recipient is still the existing personal address pending creation of an approved dedicated mailbox.
