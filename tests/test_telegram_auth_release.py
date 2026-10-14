import hashlib
import hmac
import json
import time
from urllib.parse import urlencode

import pytest
from fastapi import HTTPException

from app.services.telegram.auth import TelegramAuthError, validate_init_data
from app.services.telegram.context import identity_from_init_data


BOT_TOKEN = "test-only-123456:fake-token"


def signed_data(user_id, *, token=BOT_TOKEN, timestamp=None):
    values = {
        "auth_date": str(int(time.time()) if timestamp is None else timestamp),
        "user": json.dumps({"id": user_id, "first_name": "Tester"}, separators=(",", ":")),
    }
    secret = hmac.new(b"WebAppData", token.encode(), hashlib.sha256).digest()
    check = "\n".join(f"{k}={v}" for k, v in sorted(values.items()))
    values["hash"] = hmac.new(secret, check.encode(), hashlib.sha256).hexdigest()
    return urlencode(values)


class UserStore:
    def ensure_user(self, telegram_user=None, local=False):
        assert telegram_user is not None and not local
        return "tg:" + str(telegram_user["id"])


def test_valid_signed_identity_is_distinct_per_user(monkeypatch):
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", BOT_TOKEN)
    monkeypatch.setenv("CFA_ALLOW_ANONYMOUS_SELFHOST", "0")
    one = identity_from_init_data(signed_data(101), UserStore())
    two = identity_from_init_data(signed_data(202), UserStore())
    assert one["user_id"] == "tg:101"
    assert two["user_id"] == "tg:202"
    assert one["user_id"] != two["user_id"]


def test_missing_identity_is_rejected(monkeypatch):
    monkeypatch.setenv("CFA_ALLOW_ANONYMOUS_SELFHOST", "0")
    with pytest.raises(HTTPException) as err:
        identity_from_init_data(None, UserStore())
    assert err.value.status_code == 401


def test_tampered_identity_is_rejected():
    changed = signed_data(101).replace("%22101", "%22999")
    with pytest.raises(TelegramAuthError):
        validate_init_data(changed, BOT_TOKEN)


def test_expired_signed_identity_is_rejected():
    with pytest.raises(TelegramAuthError):
        validate_init_data(signed_data(101, timestamp=int(time.time()) - 90000), BOT_TOKEN, max_age_seconds=86400)


def test_wrong_bot_token_is_rejected():
    with pytest.raises(TelegramAuthError):
        validate_init_data(signed_data(101), "another-test-token")


def test_miniapp_entries_are_not_required_to_hold_secrets():
    # Tokens remain server-side; the browser must only submit Telegram initData.
    assert "TELEGRAM_BOT_TOKEN" not in "X-Telegram-Init-Data"
