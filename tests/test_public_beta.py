"""Regression checks for anonymous access and unavailable OAuth integrations.

Run: CFA_PUBLIC_BETA_LOCK=1 CFA_ALLOW_ANONYMOUS_SELFHOST=0 pytest -q tests/test_public_beta.py
This is deliberately separate from signed Telegram identity tests.
"""
import os
os.environ["CFA_PUBLIC_BETA_LOCK"]="1"
os.environ["CFA_ALLOW_ANONYMOUS_SELFHOST"]="0"
from fastapi.testclient import TestClient
from backend.app.main import app

client=TestClient(app)

def test_health_works_without_login():
    assert client.get("/health").status_code == 200

def test_unknown_user_cannot_read_profile():
    response=client.get("/me/bootstrap")
    assert response.status_code == 401

def test_unprotected_legacy_api_is_not_public():
    assert client.get("/evidence").status_code == 503

def test_miniapp_root_redirect_is_not_blocked():
    assert client.get("/miniapp",follow_redirects=False).status_code in (200,307,308)

def test_provider_connection_requires_identity_before_oauth():
    for provider in ("google","github"):
        assert client.post(f"/me/connectors/{provider}/start",json={}).status_code == 401
