# Automatic match pipeline

For every successfully parsed vacancy Career Fit automatically:

1. extracts requirements;
2. extracts work mode, relocation language and published compensation;
3. evaluates configured hard constraints;
4. retrieves from that user's evidence vault;
5. classifies every must-have as direct verified / adjacent-review / gap;
6. returns `APPLY`, `VERIFY_FIRST`, `REVIEW_PROOF` or `DO_NOT_APPLY`;
7. persists the analysis and creates the next action;
8. pre-builds the evidence proposal for the application pack.

`VERIFY_FIRST` is a system result, not a request for the user to analyse the vacancy. It means the source did not publish enough information for a hard constraint such as compensation or exact remote eligibility.

## Search automation

Search profiles are user-scoped. The managed worker runs due profiles, sends results through the same auto-match service, stores only defensible analyses and queues Telegram notifications for actionable matches.

## Demo isolation

`CFA_SEED_DEMO=0` by default. Production users do not receive the repository's sample roles. Demo fixtures are opt-in only.
