# GitHub Codespaces — one-click product preview

After this repository is published as `dokarpov/career-fit-agent`, open:

`https://codespaces.new/dokarpov/career-fit-agent?quickstart=1`

Codespaces will:

1. create a Python 3.12 + Node 20 environment;
2. install backend dependencies;
3. run the JS and Python test suites once;
4. start FastAPI and the background worker;
5. forward port 8000 and open it automatically.

Useful paths on the forwarded host:

- `/miniapp/` — product UI / self-host preview;
- `/setup/` — local provider setup;
- `/docs` — FastAPI docs.

The Codespaces preview uses `selfhost` mode and `CFA_SEED_DEMO=0`. It does not need a Telegram token to exercise onboarding, funnel controls, state and application-pack flows.

Real Gmail / GitHub evidence OAuth still requires real OAuth app credentials. The official Telegram flow still requires a bot token and a public HTTPS deployment.
