# Prompt contract — requirement extraction

## System objective
Extract the smallest useful set of hiring requirements from a vacancy.

## Rules
- Preserve the vacancy's language where possible.
- Separate must-have from nice-to-have only when the source supports it.
- Do not invent hidden requirements.
- Do not convert company marketing language into a capability requirement unless it constrains the role.
- Return structured JSON only.

## Output
```json
{
  "requirements": [
    {
      "label": "human-in-the-loop workflow design",
      "must_have": true,
      "source_quote": "..."
    }
  ]
}
```

## Failure / fallback
If the vacancy is too vague, return `needs_human_review: true`.
