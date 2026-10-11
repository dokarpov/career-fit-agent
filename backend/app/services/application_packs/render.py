from __future__ import annotations
import html, re

def exportable_proof_cards(pack):
    return [x for x in (pack.get("proof_cards") or [])
            if x.get("verified") is True and x.get("approved") is True
            and str(x.get("evidence_id","")).strip() and str(x.get("claim","")).strip()]

def markdown(pack):
    role=pack.get("role") or {}
    lines=[
      f"# {role.get('company','')} — {role.get('title','')}".strip(),
      "",
      "## Positioning",
      pack.get("positioning","").strip() or "_Not set_",
      "",
      "## Verified proof",
    ]
    cards=exportable_proof_cards(pack)
    if cards:
        for x in cards:
            lines.append(f"- {x['claim'].strip()}  \n  Evidence: `{x['evidence_id']}`")
    else:
        lines.append("_No exportable verified proof cards yet._")
    lines += ["","## Recruiter note",pack.get("recruiter_note","").strip() or "_Not set_"]
    answers=pack.get("short_answers") or []
    if answers:
        lines += ["","## Short answers"]
        for a in answers:
            if isinstance(a,dict):lines.append(f"### {a.get('question','Question')}\n{a.get('answer','')}")
            else:lines.append(f"- {a}")
    risks=pack.get("interview_risks") or []
    if risks:
        lines += ["","## Interview risks"]+[f"- {x if isinstance(x,str) else x.get('text','')}" for x in risks]
    lines += ["","---","Only proof cards backed by verified evidence and explicitly approved for this role are exported."]
    return "\n".join(lines).strip()+"\n"

def html_document(pack):
    role=pack.get("role") or {}
    cards=exportable_proof_cards(pack)
    proof="".join(f"<li>{html.escape(x['claim'])}<small>Evidence: {html.escape(x['evidence_id'])}</small></li>" for x in cards) or "<li class='muted'>No exportable verified proof cards yet.</li>"
    answers=""
    for a in pack.get("short_answers") or []:
        if isinstance(a,dict):
            answers+=f"<section><h3>{html.escape(str(a.get('question','Question')))}</h3><p>{html.escape(str(a.get('answer','')))}</p></section>"
    risks="".join(f"<li>{html.escape(x if isinstance(x,str) else str(x.get('text','')))}</li>" for x in (pack.get("interview_risks") or []))
    return f"""<!doctype html><html><head><meta charset="utf-8"><title>{html.escape(role.get('company',''))} application pack</title>
<style>body{{font:15px/1.55 Inter,Arial,sans-serif;max-width:820px;margin:50px auto;padding:0 24px;color:#18151d}}h1{{font-size:34px;letter-spacing:-.03em}}h2{{margin-top:34px}}small{{display:block;color:#777;margin-top:4px}}.muted{{color:#888}}section{{border-top:1px solid #eee;padding-top:12px;margin-top:12px}}</style></head><body>
<h1>{html.escape(role.get('company',''))} — {html.escape(role.get('title',''))}</h1>
<h2>Positioning</h2><p>{html.escape(pack.get('positioning','') or 'Not set')}</p>
<h2>Verified proof</h2><ul>{proof}</ul>
<h2>Recruiter note</h2><p>{html.escape(pack.get('recruiter_note','') or 'Not set')}</p>
{('<h2>Short answers</h2>'+answers) if answers else ''}
{('<h2>Interview risks</h2><ul>'+risks+'</ul>') if risks else ''}
<hr><small>Export policy: only verified proof cards with an evidence ID and explicit role approval are included.</small>
</body></html>"""

def safe_filename(company,title,ext):
    raw=f"{company}_{title}_application_pack"
    raw=re.sub(r"[^A-Za-z0-9._-]+","_",raw).strip("_")[:120] or "application_pack"
    return raw+"."+ext
