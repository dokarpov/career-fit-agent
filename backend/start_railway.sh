#!/bin/sh
set -eu
export CFA_DATA_DIR="${CFA_DATA_DIR:-/app/data}"
mkdir -p "$CFA_DATA_DIR"
if [ -z "${TELEGRAM_BOT_TOKEN:-}" ]; then
 echo "RoleHint: TELEGRAM_BOT_TOKEN not set; API + worker start, bot disabled"
fi
python -m app.worker &
WORKER_PID=$!
if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_MINI_APP_URL:-}" ] && [ -n "${CFA_INTERNAL_BOT_SECRET:-}" ]; then
  export CAREER_FIT_API_URL="http://127.0.0.1:${PORT:-8000}"
  python telegram_bot/bot.py &
  BOT_PID=$!
else
  BOT_PID=""
fi
cleanup(){
 kill "$WORKER_PID" 2>/dev/null || true
 if [ -n "$BOT_PID" ]; then kill "$BOT_PID" 2>/dev/null || true; fi
}
trap cleanup INT TERM EXIT
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
