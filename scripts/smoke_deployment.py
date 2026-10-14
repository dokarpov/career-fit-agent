#!/usr/bin/env python3
"""RoleHint public deployment smoke check. No credentials and no user data."""
import json
import os
import sys
import urllib.error
import urllib.request

BASE = os.getenv("ROLEHINT_BASE_URL", "").rstrip("/")
if not BASE.startswith("https://"):
    sys.exit("Set ROLEHINT_BASE_URL to the deployed HTTPS origin")

def request(path):
    try:
        with urllib.request.urlopen(BASE + path, timeout=15) as response:
            return response.status, response.read(2048).decode()
    except urllib.error.HTTPError as error:
        return error.code, error.read(2048).decode()

health_status, health_body = request("/health")
if health_status != 200 or json.loads(health_body).get("ok") is not True:
    sys.exit(f"FAIL health: {health_status}: {health_body[:200]}")
print("PASS: backend health responded")

public_status, _ = request("/evidence")
if public_status == 503:
    print("PASS: legacy evidence endpoint is locked for private beta")
elif public_status == 200:
    sys.exit("FAIL: legacy evidence endpoint is publicly accessible; enable CFA_PUBLIC_BETA_LOCK=1")
else:
    sys.exit(f"CHECK: unexpected legacy evidence status {public_status}")
print("PASS: private-beta smoke checks")
