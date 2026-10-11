from __future__ import annotations
import json, sqlite3
from pathlib import Path
from typing import Iterable

SCHEMA = '''
CREATE TABLE IF NOT EXISTS evidence (
    id TEXT PRIMARY KEY,
    source_type TEXT NOT NULL,
    source_ref TEXT NOT NULL,
    title TEXT NOT NULL,
    claim TEXT NOT NULL,
    evidence TEXT NOT NULL,
    tags_json TEXT NOT NULL,
    status TEXT NOT NULL,
    direct INTEGER NOT NULL,
    visibility TEXT NOT NULL,
    ownership TEXT,
    metric TEXT,
    boundary TEXT
);
CREATE VIRTUAL TABLE IF NOT EXISTS evidence_fts USING fts5(
    id UNINDEXED,
    title,
    claim,
    evidence,
    tags
);
'''

class EvidenceStore:
    def __init__(self, db_path: str | Path):
        self.db_path = str(db_path)
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript(SCHEMA)

    def upsert(self, item: dict):
        tags = item.get("tags") or []
        vals = (
            item["id"], item.get("source_type","unknown"), item.get("source_ref",""),
            item.get("title",""), item.get("claim",""), item.get("evidence",""),
            json.dumps(tags), item.get("status","needs-review"), int(bool(item.get("direct"))),
            item.get("visibility","private"), item.get("ownership"),
            item.get("metric"), item.get("boundary")
        )
        self.conn.execute(
            '''INSERT INTO evidence VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
               ON CONFLICT(id) DO UPDATE SET
               source_type=excluded.source_type, source_ref=excluded.source_ref,
               title=excluded.title, claim=excluded.claim, evidence=excluded.evidence,
               tags_json=excluded.tags_json, status=excluded.status, direct=excluded.direct,
               visibility=excluded.visibility, ownership=excluded.ownership,
               metric=excluded.metric, boundary=excluded.boundary''', vals)
        self.conn.execute("DELETE FROM evidence_fts WHERE id=?", (item["id"],))
        self.conn.execute(
            "INSERT INTO evidence_fts(id,title,claim,evidence,tags) VALUES (?,?,?,?,?)",
            (item["id"], item.get("title",""), item.get("claim",""), item.get("evidence",""), " ".join(tags))
        )
        self.conn.commit()

    def all(self):
        rows = self.conn.execute("SELECT * FROM evidence ORDER BY title").fetchall()
        return [self._row(r) for r in rows]

    def search(self, query: str, limit: int = 10):
        terms = [t for t in query.replace('"'," ").split() if len(t) > 2]
        if not terms:
            return []
        match = " OR ".join(f'"{t}"' for t in terms[:12])
        rows = self.conn.execute(
            '''SELECT e.*, bm25(evidence_fts) AS rank
               FROM evidence_fts JOIN evidence e ON e.id=evidence_fts.id
               WHERE evidence_fts MATCH ?
               ORDER BY rank LIMIT ?''', (match, limit)
        ).fetchall()
        out = []
        for r in rows:
            item = self._row(r)
            item["rank"] = r["rank"]
            out.append(item)
        return out

    def _row(self, r):
        return {
            "id":r["id"], "source_type":r["source_type"], "source_ref":r["source_ref"],
            "title":r["title"], "claim":r["claim"], "evidence":r["evidence"],
            "tags":json.loads(r["tags_json"]), "status":r["status"],
            "direct":bool(r["direct"]), "visibility":r["visibility"],
            "ownership":r["ownership"], "metric":r["metric"], "boundary":r["boundary"]
        }
