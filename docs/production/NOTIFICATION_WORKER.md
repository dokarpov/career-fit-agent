# Managed notification worker

`python -m app.worker`

Responsibilities:
- consume Gmail Pub/Sub queue;
- renew Gmail watches;
- periodically reconcile Gmail history;
- dispatch Telegram alerts from an idempotent notification outbox;
- retry failed Telegram messages with exponential backoff;
- clean expired application-pack download tokens.

Notifications are deduplicated by email message ID + event type.
The worker does not send a second alert if the same Gmail event is delivered twice.
