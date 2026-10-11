# Discovery/source coverage — v1.6

The search architecture intentionally avoids treating a list of job boards as the market.

## Direct ATS / career sources

Implemented source families:

- Greenhouse
- Lever
- Ashby
- Workable
- SmartRecruiters
- Workday URL retrieval
- configurable direct company career pages
- configurable VC portfolio job pages

These sources are preferred because they can expose the employer's original vacancy rather than another re-indexed snippet.

## Aggregators

- Adzuna
- Jooble

Aggregator results are discovery leads. When possible the worker fetches the original source before final match analysis. Aggregator IDs are not used as employer requisition IDs for deduplication.

## Ecosystem / alert coverage

Connected Gmail job alerts are parsed for job links and feed the same fetch/match pipeline. This is also the current non-scraping coverage path for job-like links from LinkedIn, Wellfound and YC/startup emails.

Career/VC portfolio URL seeds can be configured with `CAREER_SITE_URLS` and `VC_PORTFOLIO_JOB_URLS`.

## Failure behaviour

A blocked/unavailable source is queued for retry with backoff. Career Fit does not invent a full JD from an aggregator snippet and does not make the normal user copy/paste the description.

## Production configuration

Some adapters need external credentials or account/company lists. Code presence is not a claim that every source has been live-validated in this environment. Source failures are isolated: one failed adapter must not prevent other discovery channels from running.
