# Architecture

## Product objects

```text
Vacancy
  └── Requirement[]
        └── EvidenceMatch[]
              ├── verified
              ├── needs_review
              └── missing

verified → ProofCard[]
needs_review → HumanReviewQueue
missing → GapMap
```

## Why the review queue exists

Career evidence is unusually easy for generative systems to overstate.

The dangerous failure is not a malformed sentence.

It is a plausible-sounding claim that subtly upgrades:

- team outcome → personal outcome;
- adjacent experience → direct experience;
- modeled impact → measured result;
- design contribution → engineering ownership.

So ambiguity is a product state, not a prompt failure.

## Replaceable adapters

The current implementation is deliberately deterministic.

Production adapters could replace:

- parser → LLM structured extraction;
- retrieval → embeddings / hybrid search;
- matcher → LLM rubric + deterministic guardrails.

The contracts and human-review boundary should remain.
