# Career Fit public website (design v2)

A static, accessible, crawlable product website with an interactive three-step UI demo. It works without a build step, customer account, backend, personal data, image hosting, external scripts, or paid fonts.

## Run

From the repository root:

```bash
python -m http.server 8080
```

Open `http://localhost:8080/site/`.

## Real vs illustrative

- Product concepts mirror the repository's implemented decision boundaries.
- Demo roles, companies, claims and UI states are **illustrative**. Nothing in the demo fetches live jobs or submits applications.
- Conversion and placement results are deliberately not claimed.
- Website copy uses static semantic HTML and SoftwareApplication/FAQ structured data.
- `llms.txt` helps machine readers distinguish implemented capabilities from nonclaims.

## Hosting

Publish the `/site/` folder using a static host or GitHub Pages. Do not assume a Pages URL exists until deployment is enabled and verified. Configure the canonical absolute URL after that step.

## Accessibility

Functional tab list with keyboard arrow navigation; labeled controls, visible focus states, skip link, reduced-motion support, and responsive layouts. Full browser/assistive-technology acceptance testing still required before production.
