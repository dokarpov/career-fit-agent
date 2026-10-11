from __future__ import annotations
import asyncio, httpx, urllib.parse

class TelegramNotifier:
    def __init__(self,token,mini_app_url):
        self.token=token;self.mini_app_url=mini_app_url.rstrip("/")
        self.api=f"https://api.telegram.org/bot{token}"

    async def send(self,telegram_user_id,text,job_id=None,vacancy_url=None):
        url=self.mini_app_url
        if job_id:url += ("&" if "?" in url else "?")+urllib.parse.urlencode({"open":job_id})
        rows=[]
        if vacancy_url and str(vacancy_url).startswith(("http://","https://")):
            rows.append([{"text":"Open vacancy ↗","url":vacancy_url}])
        rows.append([{"text":"Review in Career Fit","web_app":{"url":url}}])
        payload={"chat_id":int(telegram_user_id),"text":text,"disable_web_page_preview":True,"reply_markup":{"inline_keyboard":rows}}
        async with httpx.AsyncClient(timeout=25) as c:
            r=await c.post(f"{self.api}/sendMessage",json=payload)
            if r.status_code==429:
                try:retry=int(r.json().get("parameters",{}).get("retry_after",1))
                except Exception:retry=1
                raise RuntimeError(f"Telegram rate limited; retry_after={retry}")
            r.raise_for_status()
            data=r.json()
            if not data.get("ok"):raise RuntimeError(str(data))
            return data["result"]
