# Real evidence vault

This build replaces the synthetic sample vault with a **sanitized set of real proof objects from Daria Karpova's own/public projects**.

No former-employer case is required for the demo.

## Included project families

- Claw
- Decision Systems
- Career Fit Agent
- Evidence OS / portfolio-evidence operating method

## Explicit exclusions

This public vault does not include:

- former-employer names or internal artifacts;
- private customer data;
- client-confidential work;
- ArchiTech implementation details that may affect IP / patent strategy;
- unsupported revenue or traction claims.

## Evidence object contract

Each object has:

- `id`
- `project`
- `title`
- `claim`
- `evidence`
- `metric`
- `boundary`
- `status`
- `direct`
- `visibility`
- `tags`

The important fields are `boundary`, `status` and `direct`.

They prevent the system from turning adjacent experience into a stronger claim than the evidence supports.

## Public vs interview-safe

`visibility = public`
: safe to expose directly in a public repo.

`visibility = public-safe`
: safe at the level of the current sanitized wording.

`visibility = interview-safe`
: suitable for a live interview explanation; do not publish deeper implementation details automatically.
