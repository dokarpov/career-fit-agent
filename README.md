# RoleHint.

**Only the jobs worth your time.**

RoleHint helps professionals decide which jobs are worth pursuing by checking eligibility rules, the match to their experience, and the next useful action.

[Website](https://dokarpov.github.io/rolehint/site/) · [Explore the opportunity agent](https://dokarpov.github.io/rolehint/site/workspace.html) · [Check a job description](https://dokarpov.github.io/rolehint/site/check.html)

## Two public demo paths

**1. Opportunity agent simulation.** Choose Product, Design, Engineering, or Marketing; edit an example experience profile; and set remote, hiring-region, salary, and time constraints. The simulated agent discovers a fictional opportunity set, filters it, ranks a shortlist, and explains each *Pursue / Verify / Skip* decision. You can save or pass sample jobs and review the next action.

**2. Your job-description checker.** Paste text from an actual vacancy, enter preferences, select requirements you can substantiate, and copy a list of blockers, unknowns, and questions for the employer. Text is analyzed locally using transparent heuristics; no network scraping or AI inference is performed in this checker.

Neither public demo connects accounts, authenticates job listings, submits applications, or predicts hiring outcomes. The simulation's employers, salaries and jobs are fictional. The job-description checker does not validate employer claims.

## Backend

The repository also includes separate backend work for source-driven job discovery, eligibility checks, experience mapping and human-approved application preparation. **Those services are not connected to the GitHub Pages demos.**

```bash
cp .env.example .env
docker compose up --build
```

[Technical overview](docs/TECHNICAL_OVERVIEW.md) · [Decision policy](docs/DECISION_POLICY.md) · [Design system](docs/DESIGN_SYSTEM.md)

*Prototype v1.9.0 · No independently demonstrated hiring uplift or product–market fit.*
