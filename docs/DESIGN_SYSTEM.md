# RoleHint — gray/lilac editorial website system

Updated October 2026. **Marketing website only**. Do not change `site/workspace.html`, `site/workbench.js`, or `site/workbench.css` when polishing the website.

## Files and order

1. `site/design-system.css`: Manrope typography, reset, core colors and control defaults.
2. `site/landing.css`: original October 12 editorial composition.
3. `site/lilac-polish.css`: **final source of truth** for the visual tokens, type scale, responsive rules, layered material surfaces, and interactive 01/03 controls. Loaded last.
4. `site/texture-grain.svg`: small tile of procedural film grain. It is composited into the lilac and graphite background recipes, never drawn over actual text.
5. `site/landing.js`: one synchronized three-stage narrative across hero and product workflow.

The selected concept is **gray × lilac × graphite**, not orange, white/silver corporate UI, or lime green. Preserve the original RoleHint SVG mark. Neither the composition nor the product workbench should be replaced without approval.

## Token foundation

| Role | Token / value |
| --- | --- |
| Warm neutral | `--rh-bg: #F6F5F2` |
| Primary typography | `--rh-ink: #202026` |
| Secondary typography | `--rh-muted: #5A5864` |
| Lilac focal color | `--rh-accent: #5945A8` |
| Accent hover | `--rh-accent-hover: #473586` |
| Lilac chapter | `--rh-mist` with `--rh-grain` |
| Product material | `--rh-velvet` with `--rh-grain` |
| Product walkthrough | `--rh-iris` with `--rh-grain` |
| Primary controls | `--rh-button` with `--rh-grain` |

Gradient recipes use paired radial lights with a directional base. A fine noise tile adds texture, **not a gray border**. Cards and chapters use surface depth/shadows rather than visible outlines; thin rules are reserved for truly tabular content. Keep visible outlines for keyboard focus only.

## Typography and spacing

One font family: **Manrope**. Use the shared tokens rather than inserting new, arbitrary breakpoints:

| Token | Value |
| --- | --- |
| `--rh-label` | 12px |
| `--rh-small` | 13px |
| `--rh-body` | 16px |
| `--rh-lead` | 18–21px |
| `--rh-h3` | 27–38px |
| `--rh-h2` | 39–76px |
| `--rh-display` | 45–120px on desktop; responsive override on mobile |

Space uses `--rh-1` through `--rh-10` on a 4px-based progression. A consistent 10–16px corner radius is for containers, not decorative borders.

## Motion and UX criteria

One *meaningful* state shared between hero 01/03 and workflow tabs: **Eligibility → Your fit → Next action**.

- The two arrows in the hero are actual, accessible buttons; counters update in both locations.
- The three workflow tabs update the same hero and product content immediately.
- Stage change animates only the content being evaluated, with restrained entrance motion. No ambient particles or fake cursor.
- The sequence can advance automatically while the story is visible, but stops on the final decision. A deliberate click stops auto-advance so it does not fight the user.
- Swipe changes state on touch screens. Keyboard users can use actual buttons and focusable disclosures. Respect reduced-motion preferences.
- The sample employer/job is explicitly fictional. CTAs say **Try demo** and open the pre-onboarding workbench; there are no unverified real-time discovery claims.

## Acceptance criteria still requiring actual browser verification

Check widths **320, 375, 390, 768, 1440px** for layout, type contrast, overflow, expanding detail rows and arrows. Check keyboard-only focus and touch swipe. No false claim of production-quality cross-device visual QA until these are run.
