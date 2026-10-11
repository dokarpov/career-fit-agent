# ATS autofill validation

Implemented browser-extension behavior:

- captures current job page;
- identifies common ATS hosts (Greenhouse, Lever, Ashby, Workday);
- matches basic fields by accessible label / aria-label / name / placeholder;
- fills only saved profile values;
- dispatches native input/change events;
- never clicks submit.

Current limitation:
this sandbox does not provide an interactive Chrome extension runtime, so browser execution is not marked as live-tested here.

The safety boundary is intentional: long-form screening answers remain reviewable drafts, not silent autofill.
