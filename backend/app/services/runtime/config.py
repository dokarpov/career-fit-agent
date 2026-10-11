from __future__ import annotations
import os
from dataclasses import dataclass

@dataclass(frozen=True)
class RuntimeConfig:
    mode: str
    managed_cycle_days: int
    managed_cycle_stars: int
    mini_app_url: str
    github_url: str

    @property
    def managed(self): return self.mode == "managed"
    @property
    def selfhost(self): return self.mode == "selfhost"

def runtime_config() -> RuntimeConfig:
    mode=os.getenv("CFA_RUNTIME_MODE","selfhost").strip().lower()
    if mode not in {"selfhost","managed"}:
        raise ValueError("CFA_RUNTIME_MODE must be selfhost or managed")
    return RuntimeConfig(
      mode=mode,
      managed_cycle_days=int(os.getenv("CFA_MANAGED_CYCLE_DAYS","90")),
      managed_cycle_stars=int(os.getenv("CFA_MANAGED_CYCLE_STARS","2499")),
      mini_app_url=os.getenv("TELEGRAM_MINI_APP_URL","").rstrip("/"),
      github_url=os.getenv("CFA_GITHUB_URL","https://github.com/dokarpov/career-fit-agent")
    )

def capabilities(entitlement_active: bool=False):
    cfg=runtime_config()
    if cfg.selfhost:
        return {
          "managed":False,"local_compute":True,"byok":True,
          "scheduled_search":True,"gmail_sync":True,"drive_sync":True,
          "managed_connectors":False,"payment_required":False
        }
    return {
      "managed":True,"local_compute":False,"byok":False,
      "scheduled_search":entitlement_active,
      "gmail_sync":entitlement_active,
      "drive_sync":entitlement_active,
      "managed_connectors":entitlement_active,
      "payment_required":not entitlement_active
    }
