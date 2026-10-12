# RoleHint — current visual system

**Status:** active, shared across the landing page and the guided interactive demo. Last updated October 2026.

## Source of truth

| Surface | HTML | Structural styling | Shared theme |
| --- | --- | --- | --- |
| Marketing site | `site/index.html` | `site/landing.css`, `site/motion.css`, `site/story.css` | `site/finish.css` (loaded last) |
| Guided demo | `site/workspace.html` | `site/workbench.css` | `site/finish.css` (loaded last) |

The landing base imports `site/design-system.css`. Both surfaces use **Manrope** (400/500/600/700/800) and share `site/finish.css` for all final appearance decisions. Do not add divergent color overrides to individual pages. Film texture lives in `site/film-grain.svg`, composed with gradients via `background-image` and `background-blend-mode`; it never requires large raster images.

## Identity and color

The original approved starburst remains unchanged at `site/favicon.svg`; it is not an invitation to redesign the logo.

- **Backgrounds and interactive panels:** white `#FFFFFF`.
- **Primary copy:** near-black `#24252D`; muted copy `#60616E`.
- **Dividers / gray checks:** `#E6E6ED`, `#EDEDF0`, and `#626470`.
- **Accent:** lilac-to-silver gradient `linear-gradient(117deg, #AC9CDA 0%, #D6D5E4 46%, #A1A9BB 100%)`.
- **Accent used for typography on white:** deeper tonal gradient `#68598F → #82799F → #5E6C84`, not pale silver text.
- **Film grain:** `film-grain.svg` at low opacity, composited with the accent gradient; not over paragraphs, cards or body backgrounds.
- **Checks:** neutral gray in every state. Uncertainty is explained in text; no green success/red failure color dependency.

The background stays white in all chapters, including the formerly orange story and formerly dark mockup. Gradient is only an *accent material*: CTA, selected progress indication, heading highlight, cursor and small motifs. Keep the landing and guided demo aligned.

## Typography, spacing, and components

- Hero/headline uses Manrope 800 with controlled negative tracking; body is 16px desktop, approximately 15–16px narrow screens.
- Labels are at least 11–12px; body paragraphs should not rely on tiny uppercase captions.
- Use consistent moderate corner radii (8–14px); controls and fields target at least 44px height on touch devices.
- Primary CTA text is **Try demo** on the landing, not a different long phrase in each section.
- Real interactive elements must have keyboard activation, focus states and click behavior. Static comparison cards must not mimic buttons.
- Marketing home illustrates fit checks through actual `details/summary` expanders.
- The guided demo reveals *one stage at a time*: role and preferences → eligibility → self-declared fit → next decision. Never claim these are live vacancies, verified offers, or actual user outcomes.
- Progress stages and mockups can animate, but animation must communicate eligibility, fit or decision, never manufacture a result.

## Responsive, motion, and acceptance criteria

- Minimum supported viewport target: **320px**. Also check 375/390px mobile, 768px tablet, 1280/1440px desktop.
- Test keyboard-only interaction, details expansion, role selection, custom role entry, soft/hard eligibility constraints, back, reset, copy and completion.
- Observe `prefers-reduced-motion:reduce`; hover enhancements must not block pointer/touch or scrolling.
- Maintain at least WCAG AA contrast for normal-sized text (4.5:1); gradient action buttons use dark text for readability, and gradient display typography uses the darker secondary gradient.
- Do not claim cross-device visual QA until an actual browser has been exercised on those viewports.

## Avoid

No orange-theme overrides, green checks, extra font families, overlaid grain across white background, ghost buttons with deceptive hover, unsupported hiring promises, or publication of unapproved logos.
