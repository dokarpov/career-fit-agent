# Funnel Control v1.7

The funnel is configurable without turning job search into manual filter management.

## Pace

- Focused — 16 unique applications/week
- Balanced — 23/week
- Fast — 35/week
- Urgent — 45/week
- Custom — 10–60/week

Urgent is designed for the “I need a job fast” state: roughly 40–50 applications/week.

Changing pace changes:
- total weekly capacity;
- P0/P1 / P2 / low-cost quota mix;
- daily batch size/time budget;
- automatic search frequency;
- discovery scan depth.

It does not silently relax hard constraints.

## Search reach

- Precise
- Standard
- Wider
- Broad

Reach changes only soft filters:
- P2 funnel salary floor;
- evidence coverage required for P1/P2;
- minimum direct evidence for P2;
- tolerated role-sprawl before it becomes unreasonable;
- number of adjacent inferred search clusters.

Hard constraints remain hard:
- explicit remote/geography incompatibility;
- relocation rules;
- configured hard salary requirement;
- minimum seniority;
- excluded roles/domains.

## Estimated conversion is always visible

The UI always shows:

`estimated application → screening conversion`

and

`expected screening signals per week at the current volume`.

Before personal outcome data, the baseline range is 3–6%.

As unique applications accumulate, the estimate blends the 3–6% prior with the user's observed outcomes. At 75+ unique applications the estimate is primarily driven by the user's outcomes, while still showing uncertainty as a range instead of a fake exact probability.

This is a portfolio-level screening conversion forecast, not a probability that a particular employer will invite the user.

## Dynamic quota scaling

The 23/week baseline mix is 6 P0/P1, 10 P2, 7 low-cost.

Urgent 45/week scales to about 12 P0/P1, 20 P2, 13 low-cost before observed outcomes begin reallocating volume.
