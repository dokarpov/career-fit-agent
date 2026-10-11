#!/usr/bin/env bash
set -euo pipefail
ROOT="${CODESPACE_VSCODE_FOLDER:-$PWD}"
cd "$ROOT"
mkdir -p data .devcontainer/logs
export PYTHONPATH="$ROOT/backend"
export CFA_RUNTIME_MODE=selfhost
export CFA_SEED_DEMO=0
export CFA_DATA_DIR="$ROOT/data"
export CFA_WEB_ROOT="$ROOT"

start_if_needed() {
  local name="$1" pattern="$2" cmd="$3" log="$4"
  if pgrep -f "$pattern" >/dev/null 2>&1; then
    echo "$name already running"
  else
    nohup bash -lc "$cmd" >"$log" 2>&1 &
    echo "$name started (pid $!)"
  fi
}

start_if_needed "API" "uvicorn app.main:app.*8000" "cd '$ROOT' && PYTHONPATH='$ROOT/backend' CFA_RUNTIME_MODE=selfhost CFA_DATA_DIR='$ROOT/data' CFA_WEB_ROOT='$ROOT' python -m uvicorn app.main:app --host 0.0.0.0 --port 8000" "$ROOT/.devcontainer/logs/api.log"
start_if_needed "worker" "python -m app.worker" "cd '$ROOT' && PYTHONPATH='$ROOT/backend' CFA_RUNTIME_MODE=selfhost CFA_DATA_DIR='$ROOT/data' CFA_WEB_ROOT='$ROOT' python -m app.worker" "$ROOT/.devcontainer/logs/worker.log"

echo "Career Fit: http://localhost:8000/miniapp/"
echo "Setup:      http://localhost:8000/setup/"
echo "API docs:   http://localhost:8000/docs"
