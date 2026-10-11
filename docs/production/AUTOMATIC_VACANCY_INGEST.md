# Automatic vacancy ingestion — current

The primary product does not ask the user for a vacancy URL or job description.

Vacancies enter automatically from configured direct ATS/career sources, aggregators, VC/career-page seeds and job links extracted from connected Gmail alerts. The original vacancy is then fetched and analysed.

Internal/power-user URL ingestion endpoints remain available for debugging, extension capture and recovery, but they are not exposed as the normal UX.

Pipeline:

`discovery → original source → full vacancy → constraints → requirements → user evidence → funnel tier → Telegram batch → pack proposal`

If retrieval fails, Career Fit retries automatically. It does not invent requirements from a title/snippet and does not use “copy the description manually” as the normal fallback.
