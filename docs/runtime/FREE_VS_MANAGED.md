# Free self-host vs managed Telegram — v1.2

One core, two runtimes.

## Free self-host
- Docker Compose
- local SQLite / files
- Ollama or BYOK model provider
- own GitHub / Google connector credentials
- local scheduler
- no product payment

Open:
`http://localhost:8000/setup/`

The setup wizard writes secrets only to the local `data/local_secrets.json`
with restrictive file permissions. It is excluded from the public package.

## Managed Telegram
- Telegram identity
- hosted state / scheduler
- central OAuth
- hosted compute
- Telegram alerts
- Managed Search Cycle entitlement

Payment uses Telegram Stars (`XTR`) through `/upgrade`.
The bot grants the entitlement only after `successful_payment`.

## Product boundary
The paid model sells hosted operation and zero setup.
It does not unlock a "better algorithm" than the free core.
