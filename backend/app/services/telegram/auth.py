import hashlib,hmac,json,time
from urllib.parse import parse_qsl
class TelegramAuthError(ValueError): pass
def validate_init_data(init_data,bot_token,max_age_seconds=3600):
    pairs=dict(parse_qsl(init_data,keep_blank_values=True));received=pairs.pop("hash",None)
    if not received: raise TelegramAuthError("Missing hash")
    check="\n".join(f"{k}={v}" for k,v in sorted(pairs.items()))
    secret=hmac.new(b"WebAppData",bot_token.encode(),hashlib.sha256).digest()
    expected=hmac.new(secret,check.encode(),hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected,received): raise TelegramAuthError("Invalid hash")
    auth_date=int(pairs.get("auth_date","0") or 0)
    if not auth_date or time.time()-auth_date>max_age_seconds: raise TelegramAuthError("Expired initData")
    return {"user":json.loads(pairs["user"]) if pairs.get("user") else {},"auth_date":auth_date,"query_id":pairs.get("query_id"),"raw":pairs}
