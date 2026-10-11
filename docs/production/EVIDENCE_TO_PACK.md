# Evidence → application pack — v1.4

## Closed loop

```text
stored vacancy text
→ requirement extraction
→ user-scoped evidence retrieval
→ match classification
→ proof suggestions
→ explicit human approval
→ application pack
→ trusted export
```

## Safety / truth model

There are now two independent gates:

1. **Evidence verification**
   - the underlying evidence object must be `verified`;
2. **Role approval**
   - the user must explicitly approve that exact evidence-backed claim for this role.

`similarity != proof`

A semantic match never silently enters an outward-facing package.

## Match states

- `verified`: direct, verified evidence with sufficient retrieval overlap;
- `needs_review`: verified-but-adjacent or weakly matched evidence, or an unverified evidence candidate;
- `missing`: no defensible support.

Verified-but-adjacent evidence may be shown for human judgment, but the exported claim remains the evidence object's exact claim; Career Fit does not rewrite it into the stronger vacancy requirement.

Unverified evidence cannot be approved for export.

## Requirements

If the captured job already contains its full description, requirements are extracted automatically.

If it does not, the Mini App asks for the vacancy text once. It does not invent requirements from a job title.

## Multi-user privacy

Managed mode now uses `user_evidence`, keyed by user ID.

The legacy global evidence vault remains only as a self-host/demo migration source and is copied only into the local self-host user when their user-scoped vault is empty.
