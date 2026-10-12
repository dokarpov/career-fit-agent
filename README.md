# RoleHint.

**Less searching. Better deciding.** A prototype for evidence-aware job decisions and guided career search.

[Website](https://dokarpov.github.io/rolehint/site/) · [CV-first onboarding](https://dokarpov.github.io/rolehint/site/onboarding.html) · [Workspace demo](https://dokarpov.github.io/rolehint/site/workspace.html)

## Current experience

1. Drop a **PDF, DOCX, or TXT résumé**, or paste its text. Parsing runs in the browser; no CV is sent to a RoleHint server.
2. Inspect and correct the extracted text and preliminary keyword themes. These are **not independently verified qualifications**.
3. Set target roles, hiring location, remote preference and optional annual salary floor.
4. Enter a **neutral, minimalist workspace** showing the existing fictional opportunity simulation, with a locally stored seven-day exploration indicator.

**What works:** drag-and-drop, local résumé text extraction (via client-side libraries), editable review, locally persisted preferences and onboarding state, and prototype workspace navigation. A separate [real-job description checker](https://dokarpov.github.io/rolehint/site/assess.html) is available as an experiment.

**What is not implemented:** real job discovery/matching against the uploaded CV, backend inference or hosted Ollama, LinkedIn OAuth, account sync, subscription enforcement or payment processing. The seven-day trial is a **UI concept**, not a paid subscription. The workspace jobs are **fictional**. Browser PDF/DOCX extraction depends on external libraries and may fail with scans or complex layouts. Profile/CV text is stored in localStorage on this device; avoid uploading sensitive CVs on shared devices.

## Architecture / planned separation

The existing repository currently mixes marketing assets, demo frontend and backend experiments. The intended architecture is:

- `rolehint-site` — public marketing website.
- `rolehint-app` — public frontend and interaction demos.
- `rolehint-core` — private backend, decision engine and integrations.

**This separation has not been completed.** The present `dokarpov/rolehint` repository is public and contains backend work. Making a new repository private does not erase previously exposed Git history.

## Development

The repository also includes backend experiments, **not connected to the GitHub Pages demo**.

```bash
cp .env.example .env
docker compose up --build
```

[Technical overview](docs/TECHNICAL_OVERVIEW.md) · [Decision policy](docs/DECISION_POLICY.md) · [Design system](docs/DESIGN_SYSTEM.md)

*Exploratory prototype. No verified hiring uplift or product–market fit.*
