# RoleHint

**Less searching. Better deciding.**

[Public website](https://dokarpov.github.io/rolehint/site/) · [Early-access request](https://dokarpov.github.io/rolehint/site/#apply)

## Public site

The public RoleHint website uses an evidence-led sales narrative: the hidden catch in a seemingly ideal remote job, an illustrative vacancy-versus-decision brief, and three concrete outputs: grounded experience, precise recruiter questions, and an apply/verify/skip next step. Preview data is fictional, not a live analysis or a customer result.

The public product presentation embeds the **actual existing RoleHint workspace** in a responsive iframe with a legacy demo bypass, explicitly labelled as fictional sample jobs and not live matching. The previous synthetic glass product mockup is no longer loaded. The showcase follows a locked editorial design system with restored large Manrope typography, graphite/lilac contrast, and silver metallic CSS surfaces. The on-page logo uses the enlarged rolehint. wordmark; the legacy green icon is removed from the page (favicon replacement pending). See [design system](docs/DESIGN_SYSTEM.md). The previous animated abyss, 3D CV sculpture, and CV-upload conversion block were removed from the homepage. The site's main CTA now opens a simple, responsive **early-access form** on the same page. Submitting the form opens an email draft addressed to the project owner; the visitor must send that email. The website itself does **not** collect or store form submissions.

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
