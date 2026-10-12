# RoleHint.

**Only the jobs worth your time.**

RoleHint explores a simple question: *Should I apply to this job?* The project checks explicit eligibility rules before matching a role to a person's real experience.

[Website](https://dokarpov.github.io/rolehint/site/) · [Try the browser demo](https://dokarpov.github.io/rolehint/site/workspace.html)

## Try the demo

Paste a job description, choose a target role and set your remote/location/salary preferences. RoleHint's public browser demo extracts stated constraints and requirement excerpts, lets you indicate which requirements you can substantiate, and prepares a copyable decision checklist: **review / verify / skip**.

The demo works **locally in your browser**. It does not fetch or authenticate vacancy URLs, call an AI model, save your data, send applications or verify work authorization. Its checks are text heuristics and must be confirmed against the employer's original listing. Fictional sample jobs are available for exploration.

The broader repository also contains backend work for source-driven job discovery, eligibility checks, requirement-to-experience mapping, human-reviewed application preparation, and outcome tracking. Those backend capabilities are **not connected to the public GitHub Pages demo**.

## Run the backend

```bash
cp .env.example .env
docker compose up --build
```

[Setup](docs/TECHNICAL_OVERVIEW.md) · [Decision policy](docs/DECISION_POLICY.md) · [Design system](docs/DESIGN_SYSTEM.md)

*Prototype v1.9.0 · No validated hiring uplift, guaranteed outcomes, or product–market fit.*
