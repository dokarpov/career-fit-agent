# Gmail push/background sync

v1.3 supports the Gmail API server-push pattern:

1. Connect Google OAuth.
2. First full application-email sync.
3. `users.watch` registers the mailbox against `GMAIL_PUBSUB_TOPIC`.
4. Pub/Sub pushes to:
   `POST /webhooks/gmail/pubsub?token=<GMAIL_PUBSUB_WEBHOOK_TOKEN>`
5. The HTTP endpoint only validates/queues the event and returns 200 quickly.
6. `app.worker` consumes the queue and calls Gmail `history.list`.
7. New relevant messages become application events.
8. Interview / rejection / possible-offer events enter the Telegram notification outbox.

The worker renews mailbox watches before expiration and runs a periodic
history fallback because Gmail push delivery can occasionally be delayed or dropped.

Google Cloud setup still has to be performed outside the codebase:
- create Pub/Sub topic/subscription;
- grant Gmail's system service account permission to publish;
- configure the push subscription URL;
- set the topic and webhook token in `.env`.

The watch itself is real code; the Google Cloud resource provisioning is not bundled.
