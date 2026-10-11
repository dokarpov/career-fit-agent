#!/usr/bin/env bash
set -euo pipefail
cd "${CODESPACE_VSCODE_FOLDER:-$PWD}"
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
mkdir -p data .devcontainer/logs
if [ ! -f .env ]; then
  cp .env.example .env
  {
    echo ""
    echo "# Codespaces/self-host preview"
    echo "CFA_RUNTIME_MODE=selfhost"
    echo "CFA_SEED_DEMO=0"
    echo "CFA_DATA_DIR=$PWD/data"
    echo "CFA_WEB_ROOT=$PWD"
  } >> .env
fi
npm test
TEST_KEY=$(python - <<'PYKEY'
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
PYKEY
)
PYTHONPATH="$PWD/backend" CFA_RUNTIME_MODE=managed CFA_SEED_DEMO=1 CFA_TOKEN_ENCRYPTION_KEY="$TEST_KEY" TELEGRAM_BOT_TOKEN="123:TEST" TELEGRAM_MINI_APP_URL="https://example.test/miniapp/" CFA_INTERNAL_BOT_SECRET="test" python -m unittest discover -s backend/tests
echo "Career Fit dependencies and tests are ready."
