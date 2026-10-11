# UX review — v1.0

## Core recurring job

The daily user does not need to navigate a career operating system.

They need to answer:

> What deserves my attention now?

Everything else should support that decision.

## Problems found in v0.9

### 1. Too many competing dashboard blocks
Metrics, jobs, insights, tasks and outreach all appeared as separate work areas.

They are different system objects but the same user question:
**what should I do next?**

### 2. Too many actions per job
A job row could expose:
- note
- find hiring manager
- find peer
- draft outreach
- view details
- apply

Most states only have one sensible next action.

### 3. Metrics were visible but not hierarchical
Six equally weighted KPIs created dashboard reading rather than decision support.

### 4. Onboarding had no explicit time-to-value path
Profile, evidence, connectors and preferences are necessary system setup,
but the user should experience a useful role decision before feeling they
have "configured software".

## v1.0 principles

### One action inbox
Tasks, role blockers, outreach opportunities and evidence signals collapse
into one prioritized queue.

### One next action per object
The interface chooses the default next step. Secondary actions are hidden in
an overflow / inline expansion.

### Metrics: 3 primary + details
Primary:
- search days
- interview conversion
- efficiency vs benchmark

Activity volume remains visible, but secondary.

### Inline detail
No navigation for:
- vacancy notes
- proof state
- direct-contact suggestion
- outreach draft
- constraint reason

Expand the row in place.

### Evidence is profile infrastructure
Evidence is not a daily section. It resurfaces only when:
- a new source was connected;
- repeated job requirements expose a proof gap;
- provenance changes;
- a new artifact can strengthen an existing claim.

### Onboarding = first useful decision
Target: first useful feed / decision in <2 minutes.

Flow:
1. Connect or skip data sources.
2. Confirm inferred target.
3. Confirm 3 hard constraints.
4. See first jobs and one recommended action.

Evidence ingestion runs in the background and does not block first value.

## Click budget

### Daily "verify role then apply"
v0.9:
open app → find role → find contact → draft outreach → verify → return → apply
≈ 5–7 interactions.

v1.0:
open app → primary action → confirm / continue
≈ 2–3 interactions.

### Add a job note
v0.9: locate row → click/edit note → blur.
v1.0: expand row → type note; autosave.
≈ 2 interactions.

### Handle evidence gap
v0.9: Profile → find evidence signal → interpret.
v1.0: appears in action inbox only when actionable.
≈ 1 click to review.

## Mobile behavior

The home view becomes:
1. attention headline
2. primary action queue
3. compact search metrics
4. saved / upcoming roles

No desktop-only right rail.
