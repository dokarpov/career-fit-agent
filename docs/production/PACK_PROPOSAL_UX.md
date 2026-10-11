# Pack proposal UX

The application pack has two layers:

## 1. Proposed proof
Career Fit shows:
- vacancy requirement;
- exact evidence claim;
- match state;
- confidence;
- evidence ID/title/source;
- claim boundary;
- whether the suggestion can be approved.

Every checkbox starts unchecked.

## 2. Editable pack
After approval:
- selected verified claims enter the proof section;
- safe deterministic positioning/recruiter-note drafts are inserted;
- gaps become interview risks;
- user can edit the draft before export.

Exports require:
`verified=true AND approved=true AND evidence_id != empty`.
