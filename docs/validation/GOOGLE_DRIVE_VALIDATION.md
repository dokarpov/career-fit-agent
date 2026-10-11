# Google Drive validation status

The read-only Google Drive importer is implemented against Drive API v3:
- list files;
- download blob files;
- export Google Docs / Sheets / Slides;
- convert each imported file to private `needs-review` evidence.

A live Google Drive OAuth connection is **not available in this chat environment**, so this adapter was not falsely marked as live-tested.

Required production scope:
`https://www.googleapis.com/auth/drive.readonly`
