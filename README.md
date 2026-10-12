# RoleHint.

**Less searching. Better deciding.** A CV-first career decision prototype.

[Full marketing website and main CV CTA](https://dokarpov.github.io/rolehint/site/) · [Standalone demo / inline CV onboarding](https://dokarpov.github.io/rolehint/site/workspace.html) · [Separate vacancy checker experiment](https://dokarpov.github.io/rolehint/site/assess.html)

## Public website and conversion flow\n\nThe **full marketing site** at `site/index.html` now includes a dedicated main CTA chapter with a dimensional CV sculpture, subtle pointer parallax and **Start with your CV** navigation. The artwork is visual only: actual CV files are accepted within the inline onboarding in the workspace. There is also a separate **Explore demo** route that bypasses onboarding with fictional example data.\n\n## Experience

The primary demo is **one continuous screen flow** at `site/workspace.html` — no redirect to a separate onboarding page.

1. Interact with a layered **3D CV object**: click or drag-and-drop PDF, DOCX, or TXT (up to 10 MB), with a paste-text fallback.
2. Review extracted CV text and detected vocabulary themes. **No unverified career achievements are invented.**
3. Enter only essentials: target roles, hiring country, work mode, optional annual salary floor.
4. Continue to the neutral decision workspace. Preferences and CV text remain in this browser; a **seven-day exploration indicator** is shown.

The 3D illustration is CSS-layered (not a fully rendered 3D model), with perspective, shadow, material gradients, hover/drag response, and reduced-motion support. Browser document extraction depends on CDN libraries; complex and scanned CVs may not extract correctly.

## Prototype limitations and privacy

**The app works as a browser prototype, not a production job-search service.** Parsing happens on the device; no CV is sent to a RoleHint backend. PDF/DOCX parsing libraries are fetched from a CDN. CV text is saved in browser `localStorage` so it persists across sessions; **do not use sensitive résumés on a shared computer**.

No LinkedIn authorization, hosted Ollama, employer verification, real vacancy retrieval, live CV-to-job scoring, accounts, payment processing, or subscription enforcement is currently available. The 7-day trial indicator is not a real paid trial. The opportunity cards and results in the workspace are **fictional** and are not generated from the uploaded CV. The separate job checker uses deterministic heuristics.

## Planned repository structure

- `rolehint-site` — public marketing.
- `rolehint-app` — public frontend.
- `rolehint-core` — private backend and integrations.

**The split is pending.** This repository is still public and also contains backend experiments. Relocating code to a private repository won't erase existing public commit history.

## Local backend experiments

Not connected to the public GitHub Pages demo.

```bash
cp .env.example .env
docker compose up --build
```

[Technical overview](docs/TECHNICAL_OVERVIEW.md) · [Decision policy](docs/DECISION_POLICY.md) · [Design system](docs/DESIGN_SYSTEM.md)

*Exploratory prototype; no verified improvements in hiring outcomes or demonstrated product–market fit.*
