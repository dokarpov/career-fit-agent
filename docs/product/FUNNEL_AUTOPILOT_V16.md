# Funnel Autopilot — v1.6

## Why the queue is volume-aware

At a 3–6% application → screening range, a 12–15 application week produces an expected 0.36–0.90 screening signals. The default operating target is therefore 23 **unique eligible** applications per week, not 15 “perfect” roles.

This is a planning expectation, not a hiring-probability claim.

## Baseline weekly allocation

- P0/P1: 6 (operating band 5–7)
- P2: 10 (operating band 8–12)
- Low-cost: 7 (operating band 5–10)
- Total: 23, within the intended 20–25 working target

The daily batch is capped at 5 roles and approximately 60 minutes so the search does not become a second full-time job.

## Tier logic

**P0/P1** — strongest evidence overlap and/or published compensation ≥ strong-salary threshold / strong upside.

**P2** — eligible role with meaningful proof overlap; salary can be €85–120k-equivalent or undisclosed. One/two gaps are not a reason to reject the opportunity.

**Low-cost** — imperfect but defensible role with at least one strong proof reason and estimated 3–5 minute application friction; no cover letter or test assignment.

**VERIFY** — an actual hard fact is unresolved, such as explicit remote/geography eligibility.

**BLOCKED** — hard mismatch such as onsite vs remote-only, explicit incompatible work region, required relocation when disallowed, below-floor published compensation, too-low seniority, configured excluded role/domain, or absurd role sprawl.

## Learning policy

- `<50` recent unique applications: baseline allocation.
- `50–74`: learning mode; observed conversion/effort is gradually blended into the baseline.
- `75+`: adaptive allocation with min/max guardrails.

The stats window is the most recent 75 unique applications and is calculated separately for P0, P1, P2 and Low-cost. A tier with higher screening/interview yield per unit of effort receives more future volume, without collapsing the whole funnel into one category after a small sample.

## Duplicate policy

A repeated listing does not count toward quota. Reapplication is allowed only when:

- employer requisition ID is new;
- role requirements changed materially;
- or cooldown elapsed and the verified evidence profile materially changed.

Aggregator listing IDs are not treated as employer requisition IDs.

## Telegram delivery

The bot owns discovery. `/today` sends the current application batch and direct original-vacancy links. `/jobs` returns the wider weekly queue. P0 can interrupt immediately; lower tiers normally wait for the batch to avoid notification noise.
