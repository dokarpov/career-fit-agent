# RoleHint Telegram bot — deployment and acceptance

The bot source exists, but repository code does **not** prove the bot is deployed or connected to a production database. Never commit a Telegram bot token or customer data.

## Prepare

1. Create a Telegram bot through [BotFather](https://t.me/BotFather); keep its access token secret.
2. Deploy the FastAPI backend to a reachable HTTPS domain with durable `./data` storage. GitHub Pages cannot run the API or background worker.
3. Set these values in the server-only `.env`:
   - `TELEGRAM_BOT_TOKEN` — BotFather token.
   - `TELEGRAM_MINI_APP_URL` — public HTTPS URL of the **backend-served** miniapp, such as `https://app.example.com/miniapp/`.
   - `CFA_INTERNAL_BOT_SECRET` — random server-side shared secret for internal bot API routes.
   - `CFA_PUBLIC_BASE_URL` — public HTTPS origin of the API.
   - Provider and search connectors only when actually enabled.
4. Configure the menu / Mini App URL using BotFather if appropriate. Do **not** point to the GitHub Pages marketing prototype: that version has no authenticated live API.

## Run

```bash
docker compose up -d --build api worker
docker compose --profile telegram up -d --build telegram_bot
docker compose logs -f telegram_bot
```

The Telegram bot runs as an optional Compose service so a missing token does not break ordinary local development. The bot uses long polling via `getUpdates`; do not operate a competing polling worker or active webhook for the same token.

## Verify before sending people a link

- `GET https://YOUR_BACKEND/health` succeeds.
- A private `/start` message returns a functioning Mini App button.
- The Mini App authenticates with signed Telegram `initData` against the backend.
- `/jobs` and `/today` return expected results or an honest empty state.
- API, bot and worker use the same durable database volume.
- Sample fixtures are not seeded for real users (`CFA_SEED_DEMO=0`).
- CV/job data deletion, backup, TLS, access controls and legal notices are verified.
- An actual test notification succeeds before declaring alerts operational.

**Not activated here:** This project still needs a real BotFather token, HTTPS backend deployment and live end-to-end QA. No working public bot username has been established.

## Deployment audit — 14 October 2026

Railway service `rolehint-api-worker` has persistent `/app/data` volume and working `/health` endpoint. Anonymous `/me/bootstrap` requests now receive HTTP 401; legacy `/evidence` remains blocked while `CFA_PUBLIC_BETA_LOCK=1`. The internal bot secret is configured, but the **current Railway environment does not contain `TELEGRAM_BOT_TOKEN`** (verified from variable names and runtime logs). GitHub Actions repository secrets do not propagate automatically. Add `TELEGRAM_BOT_TOKEN` to **Railway → RoleHint → rolehint-api-worker → Variables**. No Telegram `/start` or signed-initData journey can be marked passed until the secret is present and an end-to-end bot test succeeds.
