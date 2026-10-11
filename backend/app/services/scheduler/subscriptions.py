from __future__ import annotations
import json, sqlite3, time
from pathlib import Path

SCHEMA="""
CREATE TABLE IF NOT EXISTS search_subscriptions(
 id TEXT PRIMARY KEY,
 query TEXT NOT NULL,
 countries_json TEXT NOT NULL,
 remote_only INTEGER NOT NULL,
 sources_json TEXT NOT NULL,
 interval_minutes INTEGER NOT NULL,
 enabled INTEGER NOT NULL,
 last_run REAL,
 next_run REAL
);
CREATE TABLE IF NOT EXISTS discovered_jobs(
 canonical_key TEXT PRIMARY KEY,
 job_json TEXT NOT NULL,
 first_seen REAL NOT NULL,
 last_seen REAL NOT NULL
);
"""

class SubscriptionStore:
    def __init__(self,path):
        self.conn=sqlite3.connect(str(path),check_same_thread=False)
        self.conn.row_factory=sqlite3.Row
        self.conn.executescript(SCHEMA)

    def upsert_subscription(self,sub:dict):
        now=time.time()
        next_run=sub.get("next_run") or now
        self.conn.execute("""INSERT INTO search_subscriptions VALUES(?,?,?,?,?,?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET query=excluded.query,countries_json=excluded.countries_json,
        remote_only=excluded.remote_only,sources_json=excluded.sources_json,
        interval_minutes=excluded.interval_minutes,enabled=excluded.enabled,next_run=excluded.next_run""",
        (sub["id"],sub["query"],json.dumps(sub.get("countries",[])),int(sub.get("remote_only",False)),
         json.dumps(sub.get("sources",[])),int(sub.get("interval_minutes",360)),int(sub.get("enabled",True)),
         sub.get("last_run"),next_run))
        self.conn.commit()

    def due(self,now=None):
        now=now or time.time()
        rows=self.conn.execute("SELECT * FROM search_subscriptions WHERE enabled=1 AND next_run<=?",(now,)).fetchall()
        return [self._sub(r) for r in rows]

    def mark_run(self,id,when=None):
        when=when or time.time()
        r=self.conn.execute("SELECT interval_minutes FROM search_subscriptions WHERE id=?",(id,)).fetchone()
        self.conn.execute("UPDATE search_subscriptions SET last_run=?,next_run=? WHERE id=?",
                          (when,when+int(r["interval_minutes"])*60,id))
        self.conn.commit()

    def record_jobs(self,jobs):
        now=time.time(); new=0
        for j in jobs:
            key=j["canonical_key"]
            prev=self.conn.execute("SELECT canonical_key FROM discovered_jobs WHERE canonical_key=?",(key,)).fetchone()
            if prev:
                self.conn.execute("UPDATE discovered_jobs SET job_json=?,last_seen=? WHERE canonical_key=?",(json.dumps(j),now,key))
            else:
                self.conn.execute("INSERT INTO discovered_jobs VALUES(?,?,?,?)",(key,json.dumps(j),now,now)); new+=1
        self.conn.commit()
        return new

    def _sub(self,r):
        return {"id":r["id"],"query":r["query"],"countries":json.loads(r["countries_json"]),
        "remote_only":bool(r["remote_only"]),"sources":json.loads(r["sources_json"]),
        "interval_minutes":r["interval_minutes"],"enabled":bool(r["enabled"]),
        "last_run":r["last_run"],"next_run":r["next_run"]}
