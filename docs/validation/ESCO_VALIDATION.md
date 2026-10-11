# ESCO integration validation

The client is implemented against the official ESCO web-service search endpoint:

`GET https://ec.europa.eu/esco/api/search`

It normalizes the API response to:
- ESCO URI
- preferred title
- class/type
- alternatives

Results are cached locally so job normalization does not require a network call on every render.

The current sandbox cannot make arbitrary outbound HTTP calls from the local Python runtime, so the ESCO adapter is code-tested/offline-structured here rather than falsely marked as a live API run.

For a higher-throughput production deployment, use ESCO's downloadable Local API / dataset.
