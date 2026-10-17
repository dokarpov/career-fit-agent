"""Acceptance: two authenticated users keep distinct preferences and search targets across DB reopen."""
import tempfile
from pathlib import Path
from app.services.product_state import ProductStore

def test_saved_settings_survive_reopen_and_do_not_leak_accounts():
    with tempfile.TemporaryDirectory() as directory:
        path=Path(directory)/"product.db"
        first=ProductStore(path)
        a=first.ensure_user(telegram_user={"id":970001,"first_name":"First"})
        b=first.ensure_user(telegram_user={"id":970002,"first_name":"Second"})
        first.save_preferences(a,{"remote_only":True,"salary_floor_annual":120000,"allowed_regions":["Spain","Europe"]})
        first.save_preferences(b,{"remote_only":False,"salary_floor_annual":40000,"allowed_regions":["Germany"]})
        first.upsert_search_profile(a,{"query":"Senior Product Manager","countries":["Spain"],"remote_only":True})
        first.upsert_search_profile(b,{"query":"Data Engineer","countries":["Germany"],"remote_only":False})
        first.conn.close()
        reopened=ProductStore(path)
        assert reopened.ensure_user(telegram_user={"id":970001,"first_name":"First"})==a
        assert reopened.preferences(a)["remote_only"] is True
        assert reopened.preferences(a)["salary_floor_annual"]==120000
        assert reopened.preferences(a)["allowed_regions"]==["Spain","Europe"]
        assert reopened.preferences(b)["salary_floor_annual"]==40000
        assert [x["query"] for x in reopened.search_profiles(a)]==["Senior Product Manager"]
        assert [x["query"] for x in reopened.search_profiles(b)]==["Data Engineer"]
        reopened.conn.close()
