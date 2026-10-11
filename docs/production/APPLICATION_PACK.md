# Application pack editor/export

Each job can now have one persisted editable pack:

- positioning;
- proof cards;
- recruiter note;
- short answers;
- interview risks.

Trust boundary:
a proof card is exportable only when:
1. `verified=true`
2. it has a non-empty `evidence_id`.

Unverified cards remain editable in the draft but are automatically omitted
from Markdown / HTML exports.

Exports use temporary public download tokens. In Telegram Mini Apps the client
uses Telegram's native `downloadFile()` when available.
