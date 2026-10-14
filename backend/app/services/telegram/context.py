from __future__ import annotations
import os
from fastapi import Header, HTTPException
from .auth import validate_init_data, TelegramAuthError
from ..runtime import runtime_config

def identity_from_init_data(init_data:str|None, product_store):
    cfg=runtime_config()
    if cfg.selfhost and not init_data and os.getenv("CFA_ALLOW_ANONYMOUS_SELFHOST", "0") == "1":
        uid=product_store.ensure_user(local=True)
        return {"user_id":uid,"telegram_user":None,"mode":"selfhost"}
    if not init_data:
        raise HTTPException(401,"Telegram initData required")
    token=os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        raise HTTPException(503,"Telegram bot token not configured")
    try:
        data=validate_init_data(init_data,token,max_age_seconds=86400)
    except TelegramAuthError as e:
        raise HTTPException(401,str(e))
    uid=product_store.ensure_user(telegram_user=data["user"])
    return {"user_id":uid,"telegram_user":data["user"],"mode":cfg.mode}
