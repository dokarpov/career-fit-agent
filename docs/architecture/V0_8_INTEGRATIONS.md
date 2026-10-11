# v0.8 integrations

Implemented:

- ESCO web API client + local cache
- local vector retrieval via LSI
- hybrid lexical + vector search
- persistent search subscriptions
- due-crawl runner
- Gmail API connector + application/job-alert classifier
- GitHub repository evidence importer
- Google Drive read-only evidence importer
- ATS capture + autofill browser extension
- DOCX/XLSX evidence ingestion

## Important boundaries

### ESCO
Uses the official web-service search API and caches results. For higher throughput, production should use ESCO's local API/dataset.

### Vector retrieval
The bundled offline engine is LSI (TF-IDF → SVD → cosine), so the public repo remains runnable without paid embedding APIs.
Production can replace the vector encoder with neural embeddings / pgvector without changing the evidence-state rules.

### Gmail / Drive
OAuth tokens are never stored in the public repo. Recommended scopes:
- Gmail: `gmail.readonly`
- Drive: `drive.readonly`

### ATS autofill
Autofill is deliberately limited to low-risk profile fields. It never auto-submits and does not fabricate long-form answers.
