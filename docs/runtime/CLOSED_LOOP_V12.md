# v1.2 closed loop

This release closes the largest gap in v1.1:

`Telegram → Mini App → persisted API state`

instead of static demo data.

Implemented:
- Telegram Mini App authenticates each API request with raw `initData`.
- Managed backend creates / restores a Telegram user.
- Self-host runtime has a local-user fallback.
- Mini App bootstrap is API-driven.
- Job notes autosave to backend.
- Role blocker resolution updates persisted job state.
- Bot `/today` and `/jobs` read the same backend state.
- Bot buttons deep-link into a specific Mini App job.
- Gmail parser has conservative `offer_candidate`.
- User confirmation creates `offer_confirmed`; email alone does not.
- Google OAuth connect/start/callback is implemented.
- Gmail sync writes timeline events to the user's state.
- Stars payment grants a time-bounded managed entitlement.
- Free self-host has a setup wizard for Ollama / BYOK / connector credentials.

Still separate next integrations:
- application-pack editor / export;
- production webhook-based Gmail push instead of explicit sync;
- GitHub OAuth UI (token/import already exists);
- managed background notification worker;
- refund command implementation against Telegram Bot API.
