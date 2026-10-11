# Live batch — 2 Oct 2026

This batch tests Career Fit Agent against the seven fresh roles in today's application plan.

The important product discovery was immediate:

**fit analysis cannot happen before hard-constraint preflight.**

A role may have excellent evidence fit and still be non-sendable because of:

- location / work authorization;
- compensation floor;
- contract type;
- relocation requirement;
- language requirement;
- availability / time-zone overlap.

v0.4 therefore adds a separate `preflight` state:

- `CLEAR`
- `VERIFY`
- `BLOCKED`

This is deliberately separate from `fit`.

A role can be:

`strong evidence fit + BLOCKED`

or:

`weak evidence fit + CLEAR`

Those are different decisions.

## Today's live roles

- ScorePlay — Senior Product Manager, Vault
- Restream — Senior Product Manager, Studio
- Flodesk — Sr. Product Manager, AI
- AlphaLife Sciences — AI Product Manager (EU)
- Attio — Product Lead
- RemotePass — Product Manager, AI
- Plata — Senior Product Manager, KYB

## New failure mode found

The earlier prototype would have over-focused on evidence fit and missed contradictory remote/location metadata.

That is a product bug, not merely a job-search detail.

The corrected pipeline is now:

`hard constraints → requirements → retrieval → evidence match → review/gaps → package`

rather than:

`requirements → fit → package`
