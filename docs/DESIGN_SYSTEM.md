# RoleHint — locked public-site design system
Updated 12 October 2026.

## Design identity
**Graphite × neutral ivory × muted lilac × silver metal.** No green icon, pink UI rebrand, decorative vector shapes, cloud landscapes, or generic small-type SaaS cards.

Public landing: `site/index.html`. Keep independent experimental demos and backend untouched. The homepage presents a concrete fictional vacancy vs. evidence-based decision brief, then specific benefits and an early-access form.

## Source of truth
Styles load in this order:
1. `site/design-system.css`: foundation and Manrope.
2. `site/landing.css`: original editorial composition.
3. `site/lilac-polish.css`: historically agreed graphite/lilac material language.
4. `site/motion-stability.css`: restrained motion and stable layout.
5. `site/early-access.css` and `site/product-preview.css`: section layouts.
6. **`site/design-lock.css` (last): authoritative typography and silver surfaces.**

Do not silently shrink font sizes, add another font family, or replace the brand palette in individual section CSS files.

## Fixed typography
- Primary display: `clamp(70px,8.9vw,150px)` desktop, `clamp(42px,10.4vw,57px)` small mobile.
- Section headline: `clamp(49px,5.8vw,90px)` desktop, `clamp(38px,9.6vw,54px)` mobile.
- Body: 17px desktop / 16px mobile.
- Leading copy: 19–24px desktop / 18px mobile.
- Buttons: 16px; navigation: 15px desktop.
- Labels: 13px desktop / 12px mobile (metadata only).
- Font: Manrope 400–800.

## Materials
Use silver surface tokens `--rh-silver` and `--rh-silver-light` for light-catching metallic panels, balanced against graphite. The current implementation uses CSS multi-stop highlights, **not a photographic raster metallic material**. A genuine raster silver texture remains a separate asset task. Do not imply the CSS gradient meets the raster-art requirement.

## Wordmark
The on-page logo is now the enlarged typography `rolehint.` without the legacy green star icon. The old favicon asset remains and should not be presented as an approved new brandmark; replace it only after an approved icon asset exists.

## Rules for product previews
The public product story should show: a job posting with a hidden condition → source-backed mismatch and unknowns → a specific next action. Any examples are fictional. Keep sales copy readable, no misleading real-time AI claims. No public demo CTA until the demo is approved.

## Acceptance criteria
Visually review 320, 375, 390, 768, 1024, 1440 widths; no horizontal scrolling, no typography below 16px for core copy, no jumpy animations, stable menus, readable silver-surface contrast. Verify on actual mobile Safari and desktop browser before claiming QA complete.
