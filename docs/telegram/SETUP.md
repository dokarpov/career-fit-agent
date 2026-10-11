# Telegram setup

1. Create bot in @BotFather.
2. `/mybots` → Bot Settings → Configure Mini App → Enable Mini App.
3. Set the HTTPS URL to deployed `telegram_miniapp/`.
4. Configure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_MINI_APP_URL`.
5. Run `python telegram_bot/bot.py`.
6. Backend validates raw `Telegram.WebApp.initData` via `/telegram/auth`.
