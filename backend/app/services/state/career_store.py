from __future__ import annotations
import sqlite3, json, time, uuid
from pathlib import Path

SCHEMA="""
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS jobs(
 id TEXT PRIMARY KEY,
 canonical_key TEXT,
 company TEXT NOT NULL,
 title TEXT NOT NULL,
 source TEXT,
 source_url TEXT,
 location TEXT,
 status TEXT NOT NULL DEFAULT 'saved',
 created_at REAL NOT NULL,
 updated_at REAL NOT NULL,
 payload_json TEXT NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS job_notes(
 id TEXT PRIMARY KEY,
 job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
 body TEXT NOT NULL,
 created_at REAL NOT NULL,
 updated_at REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS applications(
 id TEXT PRIMARY KEY,
 job_id TEXT REFERENCES jobs(id) ON DELETE SET NULL,
 status TEXT NOT NULL,
 package_id TEXT,
 source TEXT,
 applied_at REAL,
 updated_at REAL NOT NULL,
 payload_json TEXT NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS outcomes(
 id TEXT PRIMARY KEY,
 application_id TEXT REFERENCES applications(id) ON DELETE CASCADE,
 event_type TEXT NOT NULL,
 occurred_at REAL NOT NULL,
 source TEXT,
 payload_json TEXT NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS requirement_snapshots(
 id TEXT PRIMARY KEY,
 job_id TEXT REFERENCES jobs(id) ON DELETE CASCADE,
 requirement TEXT NOT NULL,
 evidence_state TEXT NOT NULL,
 evidence_id TEXT,
 captured_at REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS contacts(
 id TEXT PRIMARY KEY,
 company TEXT,
 name TEXT NOT NULL,
 title TEXT,
 linkedin_url TEXT,
 email TEXT,
 source TEXT NOT NULL,
 state TEXT NOT NULL DEFAULT 'new',
 job_id TEXT REFERENCES jobs(id) ON DELETE SET NULL,
 last_contacted REAL,
 notes TEXT,
 created_at REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS outreach_drafts(
 id TEXT PRIMARY KEY,
 job_id TEXT REFERENCES jobs(id) ON DELETE CASCADE,
 contact_id TEXT REFERENCES contacts(id) ON DELETE SET NULL,
 channel TEXT NOT NULL,
 subject TEXT,
 body TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'draft',
 created_at REAL NOT NULL,
 updated_at REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS tasks(
 id TEXT PRIMARY KEY,
 job_id TEXT REFERENCES jobs(id) ON DELETE CASCADE,
 title TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'open',
 priority TEXT NOT NULL DEFAULT 'normal',
 due_at REAL,
 source TEXT,
 created_at REAL NOT NULL
);
"""

class CareerStore:
    def __init__(self,path):
        self.conn=sqlite3.connect(str(path),check_same_thread=False)
        self.conn.row_factory=sqlite3.Row
        self.conn.executescript(SCHEMA)

    def now(self): return time.time()
    def uid(self,prefix): return f"{prefix}_{uuid.uuid4().hex[:12]}"

    def upsert_job(self,job:dict):
        now=self.now(); jid=job["id"]
        self.conn.execute("""INSERT INTO jobs(id,canonical_key,company,title,source,source_url,location,status,created_at,updated_at,payload_json)
        VALUES(?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET canonical_key=excluded.canonical_key,company=excluded.company,title=excluded.title,
        source=excluded.source,source_url=excluded.source_url,location=excluded.location,updated_at=excluded.updated_at,payload_json=excluded.payload_json""",
        (jid,job.get("canonical_key"),job.get("company",""),job.get("title",""),job.get("source"),job.get("source_url"),
         job.get("location"),job.get("status","saved"),now,now,json.dumps(job)))
        self.conn.commit(); return jid

    def add_note(self,job_id,body):
        now=self.now(); nid=self.uid("note")
        self.conn.execute("INSERT INTO job_notes VALUES(?,?,?,?,?)",(nid,job_id,body,now,now));self.conn.commit()
        return nid

    def notes(self,job_id):
        return [dict(r) for r in self.conn.execute("SELECT * FROM job_notes WHERE job_id=? ORDER BY created_at DESC",(job_id,)).fetchall()]

    def add_contact(self,contact):
        now=self.now(); cid=contact.get("id") or self.uid("contact")
        self.conn.execute("""INSERT OR REPLACE INTO contacts(id,company,name,title,linkedin_url,email,source,state,job_id,last_contacted,notes,created_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?)""",(cid,contact.get("company"),contact["name"],contact.get("title"),contact.get("linkedin_url"),
        contact.get("email"),contact.get("source","manual"),contact.get("state","new"),contact.get("job_id"),
        contact.get("last_contacted"),contact.get("notes"),now));self.conn.commit();return cid

    def contacts_for_job(self,job_id):
        return [dict(r) for r in self.conn.execute("SELECT * FROM contacts WHERE job_id=? OR job_id IS NULL ORDER BY created_at DESC",(job_id,)).fetchall()]

    def add_task(self,title,job_id=None,priority="normal",due_at=None,source="system"):
        now=self.now();tid=self.uid("task")
        self.conn.execute("INSERT INTO tasks VALUES(?,?,?,?,?,?,?)",(tid,job_id,title,"open",priority,due_at,source,now));self.conn.commit();return tid

    def open_tasks(self):
        return [dict(r) for r in self.conn.execute("SELECT * FROM tasks WHERE status='open' ORDER BY CASE priority WHEN 'high' THEN 0 WHEN 'normal' THEN 1 ELSE 2 END, due_at").fetchall()]
