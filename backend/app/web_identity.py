"""First-party web identity. Email links are delivered only with configured SMTP; no debug tokens."""
from __future__ import annotations
import hashlib, hmac, os, re, secrets, smtplib, sqlite3, ssl, time, uuid
from email.message import EmailMessage
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse

router=APIRouter(prefix="/web-api")
COOKIE="rh_session"
EMAIL_RE=re.compile(r"^[^\\s@]{1,64}@[^\\s@]{1,250}\\.[A-Za-z]{2,}$")

def init(conn):
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS web_accounts(
      email TEXT PRIMARY KEY COLLATE NOCASE, user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
      created_at REAL NOT NULL);
    CREATE TABLE IF NOT EXISTS web_login_links(
      token_hash TEXT PRIMARY KEY, email TEXT NOT NULL,
      expires_at REAL NOT NULL, consumed_at REAL, created_at REAL NOT NULL);
    CREATE INDEX IF NOT EXISTS web_login_email_created ON web_login_links(email,created_at);
    CREATE TABLE IF NOT EXISTS web_sessions(
      token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
      expires_at REAL NOT NULL, created_at REAL NOT NULL);
    """)
    conn.commit()

def token_hash(token):return hashlib.sha256(token.encode()).hexdigest()
def configuration():
    base=os.getenv("CFA_WEB_APP_URL","").rstrip("/")
    host=os.getenv("CFA_SMTP_HOST","")
    sender=os.getenv("CFA_MAIL_FROM","")
    if not (base.startswith("https://") and host and sender):
        raise HTTPException(503,"Web email sign-in is not configured")
    return base,host,sender

def send_email(email,url,host,sender):
    msg=EmailMessage()
    msg["Subject"]="Sign in to RoleHint"
    msg["From"]=sender
    msg["To"]=email
    msg.set_content("Use this one-time sign-in link (valid for 15 minutes):\n"+url+"\nIf you did not request it, ignore this message.")
    port=int(os.getenv("CFA_SMTP_PORT","465"))
    user=os.getenv("CFA_SMTP_USER","")
    password=os.getenv("CFA_SMTP_PASSWORD","")
    if port==465:
        with smtplib.SMTP_SSL(host,port,timeout=10,context=ssl.create_default_context()) as client:
            if user:client.login(user,password)
            client.send_message(msg)
    else:
        with smtplib.SMTP(host,port,timeout=10) as client:
            client.starttls(context=ssl.create_default_context())
            if user:client.login(user,password)
            client.send_message(msg)

def init_routes(product):
    conn=product.conn
    init(conn)

    def require_user(request:Request):
        token=request.cookies.get(COOKIE,"")
        if len(token)<30:raise HTTPException(401,"Please sign in")
        row=conn.execute("SELECT user_id FROM web_sessions WHERE token_hash=? AND expires_at>?",
                         (token_hash(token),time.time())).fetchone()
        if not row:raise HTTPException(401,"Session expired")
        return row["user_id"]

    def check_origin(request:Request):
        origin=request.headers.get("origin")
        base=os.getenv("CFA_WEB_APP_URL","").rstrip("/")
        if not base or not origin or not hmac.compare_digest(origin,base):
            raise HTTPException(403,"Invalid request origin")

    @router.post("/login")
    async def request_link(request:Request):
        check_origin(request)
        base,host,sender=configuration()
        body=await request.json()
        email=str(body.get("email") or "").strip().lower()
        if len(email)>254 or not EMAIL_RE.fullmatch(email):raise HTTPException(422,"Enter a valid email")
        now=time.time()
        recent=conn.execute("SELECT COUNT(*) n FROM web_login_links WHERE email=? AND created_at>?",
                            (email,now-3600)).fetchone()["n"]
        if recent>=5:raise HTTPException(429,"Too many sign-in requests")
        token=secrets.token_urlsafe(36)
        digest=token_hash(token)
        conn.execute("INSERT INTO web_login_links VALUES(?,?,?,?,?)",(digest,email,now+900,None,now))
        conn.commit()
        try:send_email(email,base+"/web-api/callback?token="+token,host,sender)
        except Exception:
            conn.execute("DELETE FROM web_login_links WHERE token_hash=?",(digest,));conn.commit()
            raise HTTPException(503,"Email delivery unavailable")
        return {"ok":True,"message":"Check your inbox for a one-time sign-in link."}

    @router.get("/callback")
    def complete_login(token:str=""):
        configuration()
        now=time.time()
        digest=token_hash(token)
        # Consume once and create account in a single SQLite transaction.
        try:
            conn.execute("BEGIN IMMEDIATE")
            row=conn.execute("SELECT email FROM web_login_links WHERE token_hash=? AND consumed_at IS NULL AND expires_at>?",(digest,now)).fetchone()
            if not row:raise ValueError("Invalid or expired link")
            email=row["email"]
            conn.execute("UPDATE web_login_links SET consumed_at=? WHERE token_hash=? AND consumed_at IS NULL",(now,digest))
            account=conn.execute("SELECT user_id FROM web_accounts WHERE email=?",(email,)).fetchone()
            if account:uid=account["user_id"]
            else:
                uid="web_"+uuid.uuid4().hex
                conn.execute("INSERT INTO users(id,telegram_user_id,first_name,username,created_at,last_seen) VALUES(?,NULL,NULL,NULL,?,?)",(uid,now,now))
                conn.execute("INSERT INTO web_accounts(email,user_id,created_at) VALUES(?,?,?)",(email,uid,now))
            session=secrets.token_urlsafe(48)
            conn.execute("INSERT INTO web_sessions VALUES(?,?,?,?)",(token_hash(session),uid,now+86400*14,now))
            conn.commit()
        except (sqlite3.Error,ValueError):
            conn.rollback()
            raise HTTPException(400,"Invalid or expired sign-in link")
        response=RedirectResponse("/webapp/",status_code=303)
        response.set_cookie(COOKIE,session,max_age=86400*14,secure=True,httponly=True,samesite="lax",path="/")
        response.headers["Cache-Control"]="no-store"
        return response

    @router.get("/me")
    def me(request:Request):
        uid=require_user(request)
        prefs=product.preferences(uid)
        profiles=product.search_profiles(uid)
        jobs=product.jobs(uid)
        return {"authenticated":True,"preferences":prefs,"search_profiles":profiles,
                "jobs":jobs[:10],"free_limit":10,"free_used":min(10,len(jobs))}

    @router.put("/preferences")
    async def save_preferences(request:Request):
        check_origin(request);uid=require_user(request)
        data=await request.json()
        allowed={"remote_only","allow_relocation","salary_floor_annual","home_region","allowed_regions"}
        patch={k:v for k,v in data.items() if k in allowed}
        if not isinstance(patch.get("allowed_regions",[]),list):raise HTTPException(422,"Invalid regions")
        return product.save_preferences(uid,patch)

    @router.post("/search")
    async def save_search(request:Request):
        check_origin(request);uid=require_user(request)
        data=await request.json()
        role=str(data.get("query","")).strip()
        if not 3<=len(role)<=120:raise HTTPException(422,"Enter a target role")
        profiles=product.search_profiles(uid)
        if len(profiles)>=3:raise HTTPException(409,"Maximum three active searches")
        return product.upsert_search_profile(uid,{"query":role,"countries":[],"remote_only":bool(product.preferences(uid).get("remote_only")),"enabled":True,"interval_minutes":360})

    @router.post("/logout")
    def logout(request:Request):
        check_origin(request)
        token=request.cookies.get(COOKIE)
        if token:
            conn.execute("DELETE FROM web_sessions WHERE token_hash=?",(token_hash(token),));conn.commit()
        response=RedirectResponse("/webapp/",status_code=303)
        response.delete_cookie(COOKIE,path="/")
        return response

    return router
