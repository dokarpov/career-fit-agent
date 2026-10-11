"""SQLite-free local preview of the canonical workbook; never bind publicly."""
from __future__ import annotations

import json
import os
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from zipfile import BadZipFile

from .services.pipeline_view import project


class Handler(SimpleHTTPRequestHandler):
    workbook: Path

    def do_GET(self):
        if self.path.split("?", 1)[0] != "/me/pipeline-view":
            return super().do_GET()
        try:
            body = json.dumps(project(self.workbook), ensure_ascii=False).encode("utf-8")
            status = HTTPStatus.OK
        except (OSError, ValueError, KeyError, StopIteration, BadZipFile) as exc:
            body = json.dumps({"detail": str(exc)}, ensure_ascii=False).encode("utf-8")
            status = HTTPStatus.SERVICE_UNAVAILABLE
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)


def main():
    configured = os.getenv("CFA_CANONICAL_PIPELINE_PATH")
    if not configured:
        raise SystemExit("Set CFA_CANONICAL_PIPELINE_PATH to the canonical XLSX")
    workbook = Path(configured)
    directory = Path(__file__).resolve().parents[2] / "telegram_miniapp"

    class LocalHandler(Handler):
        def __init__(self, *args, **kwargs):
            self.workbook = workbook
            super().__init__(*args, directory=str(directory), **kwargs)

    port = int(os.getenv("CFA_PIPELINE_PREVIEW_PORT", "8765"))
    with ThreadingHTTPServer(("127.0.0.1", port), LocalHandler) as server:
        print(f"Read-only cockpit: http://127.0.0.1:{port}/?pipeline=1")
        server.serve_forever()


if __name__ == "__main__":
    main()
