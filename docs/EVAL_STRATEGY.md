# Eval strategy

The product should not optimize only for "nice output".

The critical failure classes are:

1. **false fit** — says pursue when must-have proof is absent;
2. **proof inflation** — upgrades adjacent evidence into direct evidence;
3. **provenance loss** — uses evidence whose ownership/source is unclear;
4. **review bypass** — auto-uses a low-confidence match;
5. **gap suppression** — hides a missing requirement;
6. **package contamination** — unverified evidence enters the application pack.

## Batch structure

Each case contains:
- vacancy text;
- evidence vault;
- expected requirement;
- expected route;
- expected fit decision where relevant.

The reference batch is small by design. It tests policy consistency, not business impact.

Business validation remains separate:
- time-to-apply;
- reply rate;
- interview rate;
- willingness to pay;
- user acceptance of `skip` recommendations.
