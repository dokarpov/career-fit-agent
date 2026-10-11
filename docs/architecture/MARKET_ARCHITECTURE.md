# Market architecture — current

Career Fit is designed as a search/decision system, not a vacancy analyser waiting for manual input.

## Product loop

`discover broadly → retrieve original source → dedupe → hard eligibility → evidence match → funnel → apply efficiently → ingest outcomes → adapt discovery/allocation`

## Source architecture

No single job API is treated as sufficient. Discovery combines direct ATS/career sources, aggregators, configurable company/VC pages and job URLs from connected email alerts. All sources normalize into the same vacancy object and dedupe layer.

## Evidence architecture

Evidence is user-scoped. Connected GitHub/Drive/files become candidates; claim verification and provenance are kept separate from semantic similarity. Application packs use only current verified evidence plus explicit role-level approval for outward claims.

## Human boundary

The user grants data access, corrects personal hard constraints when necessary, approves claims they will represent externally, and performs final submission. Search mechanics and analysis are automated.
