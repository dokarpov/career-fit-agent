# Decision policy — v0.5

The product now separates four different questions:

1. **Can I apply?** — hard constraints.
2. **Can I credibly prove fit?** — evidence fit.
3. **Do I actually want this role/domain?** — preference fit.
4. **Is the application worth the time right now?** — effort budget.

These must not be collapsed into one score.

## Hard constraints

Current configurable examples:

- remote-only;
- relocation allowed / not allowed;
- compensation floor;
- geography / authorization preflight.

A hard failure produces `DO_NOT_APPLY`.

## Verification constraints

Unknown compensation or contradictory location metadata produces `VERIFY_FIRST`.

Unknown is not treated as failure and is not treated as success.

## Soft constraints

- role interest;
- domain appetite;
- estimated application time.

Low soft preference does not mean the candidate is unqualified. It means the role should be deprioritized.

## Evidence fit

Evidence still runs independently:

- `PURSUE`
- `REVIEW`
- `SKIP`

## Final action

```text
hard block                     → DO_NOT_APPLY
unknown hard constraint        → VERIFY_FIRST
evidence skip                  → DO_NOT_APPLY
ambiguous evidence             → REVIEW_PROOF
soft-preference mismatch       → DEPRIORITIZE
clear constraints + proof fit  → APPLY
```

This is intentionally a decision stack, not a blended score.
