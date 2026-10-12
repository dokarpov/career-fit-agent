# RoleHint design system — active site

**Status:** shared, conservative visual baseline. No new brand exploration or logo changes.

## Live surfaces and source of truth

| Surface | Entry | Product-specific CSS | Shared |
| --- | --- | --- | --- |
| Landing | `site/index.html` | `site/landing.css` | `site/tokens.css`, `site/typography.css` |
| Interactive demo | `site/workspace.html` | `site/workbench.css` | `site/tokens.css`, `site/typography.css` |

The existing starburst `site/favicon.svg` is approved as the provisional mark. Do not replace it with generated icons. Retired prototype styles `site/workspace.css` and `site/design-system.css` are not loaded by these two live pages.

## Task A — typography

The typography source of truth is `site/typography.css`. One family, Inter with system-sans fallback, across both active surfaces. It defines a fluid display scale, section heading scale, consistent paragraph line height, coherent weights, and mobile overrides. Headline, job detail, labels and actionable copy all have explicitly scoped selectors. Typography overrides are loaded **after** each page's own CSS.

Do not introduce a second display face, novelty font, italic headline, or decorative tracking without a separate brand decision. 320px is the lower target width; body text remains legible and important labels are not reduced to tiny metadata.

## Task B — foundations and components

The shared token source of truth is `site/tokens.css`. It defines:

- neutral page, canvas, text and borders;
- restrained landing identity with forest-green action, plus a neutral workbench action scheme registered in the same token file;
- red-orange focus ring (functional accessibility, not a decorative accent);
- status colors for positive / pending / blocked;
- radii, spacing and motion easing.

`landing.css` and `workbench.css` map their local variables to canonical tokens while retaining page-specific layout rules. The workbench deliberately uses a denser neutral interface, not the green marketing accent. Both palettes are governed by the same token source, but the component styles have not yet been fully deduplicated. This is **token consolidation**, not a full component-library migration.

### Design rules

1. One primary action per screen; visually de-emphasize secondary actions.
2. A job result distinguishes hard eligibility, evidence coverage, uncertainty and user decision. Do not replace these with a single confidence score.
3. Status color is always accompanied by text. No color-only meaning.
4. Focus state must be visible; controls should have at least 44px target when practical.
5. Animations have reduced-motion behavior and must not obstruct content.
6. Hero graphic uses real product interface conventions and always discloses fictional data.
7. Keep headings compact, paragraph widths readable, and mobile flow logically ordered.

## Release verification

Verify at 320, 390, 768 and 1440px: no horizontal scrolling, legible display and labels, usable controls, no overlapping fixed/sticky headers, keyboard navigation and reduced-motion fallback. Check both the landing and interactive workbench. Do not claim automated checks have passed without a recorded browser run.

## Boundaries

There is no completed cross-project favicon identity system. Apart from existing approved marks, logo concepts remain proposals until explicitly approved. Product claims of interview lift, live verified roles or paid traction are not supported by the demo.
