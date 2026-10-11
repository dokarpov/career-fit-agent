# Onboarding v2 — Autopilot first

## Goal

Get the user from permission to a running search strategy without making them configure the search engine. Target: about two minutes, excluding external OAuth consent.

## 1. Connect what already exists

Offer Google and GitHub. Each is optional.

- Google → applications, recruiter replies, outcomes, job-alert links and Drive evidence.
- GitHub → owned repositories as evidence candidates.

The user can skip. Skipping does not trigger a manual query form; Autopilot waits for signal.

## 2. Confirm only hard constraints

Ask only for constraints that can invalidate an application:

- remote-only yes/no;
- relocation acceptable yes/no;
- hard salary floor;
- allowed work region(s).

Do not ask for domain keywords, Boolean search or detailed skill filters.

## 3. Choose pace

Show three plain-language choices:

- **Steady** — 16/week (~15–20);
- **Balanced** — 23/week (~20–25);
- **I need a job fast** — 45/week (~40–50).

Every option shows the estimated screening range and expected screenings/week. Search reach stays `Standard` during onboarding.

## 4. Start

Show the actual plan. If a current batch already exists, offer the strongest current role. Otherwise open the cockpit and let Autopilot keep searching. Never invent first-result counts.

## Settings after onboarding

`Search strategy → Tune` exposes the complete controls:

- Focused / Balanced / Fast / Urgent / Custom 10–60/week;
- Precise / Standard / Wider / Broad reach;
- live screening estimate.

The onboarding choice and Settings use the same persisted funnel policy.
