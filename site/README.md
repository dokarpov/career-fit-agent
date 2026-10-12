# RoleHint public site

Live: https://dokarpov.github.io/rolehint/site/

The static GitHub Pages site contains the marketing presentation, embedded fictional demo preview, and early-access application form. The actual experimental product lives in `workspace.html` and is not a production service.

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
