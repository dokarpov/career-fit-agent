# Human-work audit — v1.6

The audit question is: **is the UI asking a person to do something the system can retrieve, infer, calculate, retry, schedule or deduplicate itself?**

## Removed from the primary flow

| Old friction | v1.6 behaviour |
|---|---|
| Find a vacancy and paste its link | Autopilot discovers roles and Telegram sends the original vacancy links |
| Build a search/Boolean query | Up to three search profiles are inferred from evidence + application/outcome history |
| Copy/paste a job description | The system fetches the original ATS/career page and parses it |
| Decide whether every missing JD line is fatal | Hard eligibility and evidence gaps are separated; noisy gaps reduce priority/effort |
| Manually deduplicate repeated listings | Company + role + requisition/application history dedupe runs before the weekly queue |
| Recheck blocked URLs | Source retry queue with backoff |
| Create an evidence-gap task as a routine action | Connected evidence sources are searched/synced first; unresolved gaps remain explicit |
| Type evidence IDs / mark proof verified | Removed from UI; verification comes from evidence state |
| Trigger the pack proposal | Proposal is built from the analysed vacancy automatically |
| Select Drive files / GitHub repos one-by-one | Connected sources are imported automatically within bounded limits |
| Recalculate weekly volume | Funnel planner uses baseline targets and observed outcome data |

## Human actions retained on purpose

- OAuth/data consent.
- One-time correction of hard preferences/constraints when needed.
- Explicit approval of exact verified claims before outward use.
- Final external application/send.
- Payment/refund.

Those actions are permissions, preferences or representation of the user — not algorithmic chores.
