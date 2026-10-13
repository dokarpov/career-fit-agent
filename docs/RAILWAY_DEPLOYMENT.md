# RoleHint deployment on Railway

**State:** deployment configuration committed; no Railway service, volume, API, or bot is verified running yet.

## Architecture

Start with **one Railway Docker service** running FastAPI, the background worker, and (only if configured) the Telegram polling bot. All three share the same local SQLite databases. This avoids the split-volume corruption and missing-state risk that would arise from putting the current SQLite-backed worker and API on separate Railway services.

The Dockerfile is `backend/Dockerfile`; Railway uses `railway.json` and `sh ./start_railway.sh`. `GET /health` is the service health check.

## Deployment steps requiring Railway access

1. Inspect the existing Railway projects, volumes, and any prior database. **Do not create empty storage in place of existing data without verifying it.**
2. Create/connect the RoleHint service from `dokarpov/rolehint`, default branch.
3. Attach a **persistent Railway volume mounted at `/app/data`**. The current backend stores `career_fit.db`, `career_state.db`, `product_state.db`, and some local secrets beneath this path. Back up and inventory any prior database *before* migrating. Do not store real customer data on an ephemeral container filesystem.
4. Configure service environment variables using Railway's private Variables UI; never put values into GitHub source, chat or public build logs:

   - `CFA_DATA_DIR=/app/data`
   - `CFA_RUNTIME_MODE=selfhost`
   - `CFA_SEED_DEMO=0`
   - `TELEGRAM_BOT_TOKEN` (BotFather token; optional until bot activation)
   - `TELEGRAM_MINI_APP_URL=https://<your-railway-domain>/miniapp/`
   - `CFA_INTERNAL_BOT_SECRET` (unique high-entropy value)
   - `CFA_PUBLIC_BASE_URL=https://<your-railway-domain>`
   - Provider/ATS/OAuth secrets only when those integrations are configured and consented to.

5. Assign a public HTTPS domain. Check `/health` and `/miniapp/`.
6. **Before external beta:** security-review unauthenticated legacy evidence/API routes, access-control boundaries, encryption at rest, CV deletion, OAuth redirect configurations, privacy disclosures, backups and uptime checks.
7. Open the Telegram bot's public username, press `/start`, verify the Mini App button, signed Telegram identity, profile persistence, job state and one real test notification.
8. Run regression checks and verify the API, worker and Telegram processes remain healthy after a restart.

## Important limits

- Railway project connection is required for remote deployment; committing these files does not create infrastructure.
- The current GitHub Pages onboarding continues to use browser localStorage and sample jobs. Connecting it to the backend requires a separate authenticated integration.
- Telegram payments, real provider connections, job delivery and account sync must not be declared live based on source code alone.
- The Telegram token belongs in **Railway Variables**, not a GitHub Actions secret unless an actual deployment workflow explicitly consumes that secret.
- Do not use more than one instance of the SQLite service or mount separate isolated volumes for API/worker.
