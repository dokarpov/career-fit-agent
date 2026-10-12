# RoleHint

**Less searching. Better deciding.**

[Public website](https://dokarpov.github.io/rolehint/site/) · [Early-access request](https://dokarpov.github.io/rolehint/site/#apply)

## Public site

The public RoleHint website is a minimal, editorial landing page explaining the product's proposed value: understanding eligibility, reviewing experience evidence, and deciding where to invest time in a job search.

The previous animated abyss, 3D CV sculpture, and CV-upload conversion block were removed from the homepage. The site's main CTA now opens a simple, responsive **early-access form** on the same page. Submitting the form opens an email draft addressed to the project owner; the visitor must send that email. The website itself does **not** collect or store form submissions.

The experimental interactive workspace and CV-first onboarding remain in source control but are intentionally **not linked from the public marketing website** until the demo is ready. Other experimental checkers and backend components remain separate from the public-site user journey.

## Status and limitations

The public site is a prototype. No account system, live job discovery, CV-to-job scoring, live AI analysis, billing, or real subscription trial is offered through the public homepage. Illustrative examples should not be treated as verified employer or user data.

## Intended architecture

- `rolehint-site`: public marketing (planned separate repository)
- `rolehint-app`: public frontend (planned separate repository)
- `rolehint-core`: private backend (planned separate repository)

The split is **not finished**: this repository remains public and includes experimental backend files. Moving code into a private repository would not erase earlier public Git history.

## Backend experiments

Not connected to GitHub Pages.

```bash
cp .env.example .env
docker compose up --build
```

[Technical overview](docs/TECHNICAL_OVERVIEW.md) · [Decision policy](docs/DECISION_POLICY.md)

*Prototype. No independently verified hiring uplift or product–market fit.*
