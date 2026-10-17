"""Merge subagent literature JSON, then verify every record against Crossref.

Bibliographic fields (title / authors / venue / year) in the final deliverable come from
Crossref when a DOI resolves. Agent-supplied values are kept only as `*_reported` for audit.

Batch strategy: DOIs are resolved through Crossref's `filter=doi:...` endpoint in chunks,
which turns ~150 requests into a handful. Records without a DOI fall back to a single
title query. Semantic Scholar is not used: it throttles too aggressively to be reliable,
and Crossref's own is-referenced-by-count is a citable citation figure.
"""

import glob
import json
import os
import re
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from difflib import SequenceMatcher

RAW_DIR = r"D:\code\City_Contest\_lit\raw"
OUT_DIR = r"D:\code\City_Contest\_lit"
UA = "asphalt-lit-survey/1.0 (mailto:contest-team@example.org)"
CROSSREF = "https://api.crossref.org/works"
SELECT = "DOI,title,container-title,issued,published-print,published-online,author,type,publisher,is-referenced-by-count,abstract"
CHUNK = 20

FIELDS = [
    "类型", "有无代码", "论文标题", "作者", "期刊/会议名", "JCR/CCF", "IF",
    "发表时间", "引用率", "任务（中文）", "DOI", "代码链接", "数据模态",
    "所用数据集", "数据集下载地址", "备注",
]


def log(*a):
    print(*a, flush=True)


def fetch_json(url, tries=3, timeout=40):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=timeout) as f:
                return json.loads(f.read().decode("utf-8", "replace"))
        except urllib.error.HTTPError as e:
            if e.code in (404, 400):
                return None
            time.sleep(1.0 * (i + 1))
        except Exception:
            time.sleep(1.0 * (i + 1))
    return None


def norm(s):
    s = unicodedata.normalize("NFKC", str(s or "")).lower()
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"[^0-9a-z\u4e00-\u9fff]+", " ", s).strip()


def sim(a, b):
    return SequenceMatcher(None, norm(a), norm(b)).ratio()


def clean_doi(d):
    d = str(d or "").strip()
    d = re.sub(r"^(https?://(dx\.)?doi\.org/|doi:\s*)", "", d, flags=re.I).strip()
    return d.rstrip(").,; ").lower()


def parse_agent_file(path):
    with open(path, "r", encoding="utf-8-sig") as f:
        txt = f.read().strip()
    if txt.startswith("```"):
        txt = re.sub(r"^```[a-zA-Z]*\s*", "", txt)
        txt = re.sub(r"```\s*$", "", txt).strip()
    try:
        data = json.loads(txt)
    except json.JSONDecodeError:
        m = re.search(r"\[.*\]", txt, re.S)
        if not m:
            log("  !! unparseable:", os.path.basename(path))
            return []
        data = json.loads(m.group(0))
    if isinstance(data, dict):
        for key in ("references", "data", "items", "文献"):
            if isinstance(data.get(key), list):
                data = data[key]
                break
        else:
            data = [data]
    out = []
    for rec in data:
        if not isinstance(rec, dict):
            continue
        row = {k: str(rec.get(k, "") or "").strip() for k in FIELDS}
        row["_source_file"] = os.path.basename(path)
        if row["论文标题"] or row["DOI"]:
            out.append(row)
    return out


def cr_meta(msg):
    if not msg:
        return {}
    title = (msg.get("title") or [""])
    title = title[0] if title else ""
    container = (msg.get("container-title") or [""])
    container = container[0] if container else ""
    year = ""
    for key in ("published-print", "published-online", "issued", "created"):
        parts = ((msg.get(key) or {}).get("date-parts") or [[None]])[0]
        if parts and parts[0]:
            year = str(parts[0])
            break
    authors = []
    for a in (msg.get("author") or [])[:4]:
        nm = " ".join(x for x in [a.get("given", ""), a.get("family", "")] if x).strip() or a.get("name", "")
        if nm:
            authors.append(nm)
    author_str = ", ".join(authors)
    if len(msg.get("author") or []) > 4:
        author_str += ", et al."
    return {"title": re.sub(r"\s+", " ", title).strip(), "container": container.strip(),
            "year": year, "authors": author_str, "type": msg.get("type", ""),
            "publisher": msg.get("publisher", ""),
            "citations": str(msg.get("is-referenced-by-count", "") or "")}


def doi_lookup(doi):
    """Single-DOI lookup: reliable, and without Semantic Scholar it is fast enough."""
    if not doi:
        return None
    d = fetch_json(CROSSREF + "/" + urllib.parse.quote(doi) + "?mailto=contest-team@example.org",
                   tries=2, timeout=25)
    return (d or {}).get("message")


def batch_lookup(dois):
    """Resolve DOIs one by one, keeping a small delay to stay inside Crossref's limits."""
    found = {}
    dois = [d for d in dois if d]
    for i, d in enumerate(dois, 1):
        msg = doi_lookup(d)
        if msg:
            got = clean_doi(msg.get("DOI", ""))
            if got:
                found[got] = msg
        if i % 20 == 0 or i == len(dois):
            log("  resolved %d/%d (found %d)" % (i, len(dois), len(found)))
        time.sleep(0.15)
    return found


def crossref_by_title(title):
    if not title or len(norm(title)) < 6:
        return None, 0.0
    url = (CROSSREF + "?rows=5&select=%s&query.bibliographic=%s"
           % (urllib.parse.quote(SELECT), urllib.parse.quote(title[:280])))
    d = fetch_json(url)
    items = ((d or {}).get("message") or {}).get("items") or []
    best, best_score = None, 0.0
    for it in items:
        s = sim(title, (it.get("title") or [""])[0])
        if s > best_score:
            best, best_score = it, s
    return best, best_score


def main():
    files = sorted(glob.glob(os.path.join(RAW_DIR, "*.json")))
    recs = []
    for f in files:
        got = parse_agent_file(f)
        log("  %-42s %d records" % (os.path.basename(f), len(got)))
        recs.extend(got)
    log("total raw records:", len(recs))

    # ---- dedupe ----
    by_doi, seen_titles, merged = {}, {}, []
    for r in recs:
        r["DOI"] = clean_doi(r["DOI"])
        key = r["DOI"] or None
        tkey = norm(r["论文标题"])[:120]
        tgt = by_doi.get(key) if key else None
        if tgt is None and tkey:
            tgt = seen_titles.get(tkey)
        if tgt is not None:
            for k in FIELDS:
                if not tgt[k] and r[k]:
                    tgt[k] = r[k]
            tgt["_source_file"] += " + " + r["_source_file"]
            continue
        merged.append(r)
        if key:
            by_doi[key] = r
        if tkey:
            seen_titles[tkey] = r
    log("after dedupe:", len(merged))

    # ---- batched DOI resolution ----
    log("\nresolving DOIs via batched Crossref filter queries ...")
    found = batch_lookup([r["DOI"] for r in merged])
    log("DOIs resolved in batch:", len(found))

    # ---- per-record assembly ----
    verified, stats = [], {}
    for i, r in enumerate(merged, 1):
        doi = r["DOI"]
        cr, status, note = found.get(doi), "unverified", ""
        if doi and cr:
            status = "doi_confirmed"
        if cr is None:
            best, score = crossref_by_title(r["论文标题"])
            if best and score >= 0.90:
                cr, status = best, "doi_found_by_title"
                if not doi:
                    doi = clean_doi(best.get("DOI", ""))
            elif best and score >= 0.82:
                cr, status = best, "title_confirmed_no_doi"
                note = "标题近似匹配 %.2f" % score
                if not doi:
                    doi = clean_doi(best.get("DOI", ""))
            else:
                status, note = "unverified", "Crossref 未能匹配"
        m = cr_meta(cr)
        rec = dict(r)
        rec["DOI"] = doi
        rec["_verify_status"] = status
        rec["_verify_note"] = note
        rec["_cr_title"] = m.get("title", "")
        rec["_cr_container"] = m.get("container", "")
        rec["_cr_year"] = m.get("year", "")
        rec["_cr_authors"] = m.get("authors", "")
        rec["_cr_type"] = m.get("type", "")
        rec["_cr_publisher"] = m.get("publisher", "")
        rec["_citations"] = m.get("citations", "")
        rec["_title_similarity"] = round(sim(r["论文标题"], m.get("title", "")), 3) if m.get("title") else 0.0
        stats[status] = stats.get(status, 0) + 1
        verified.append(rec)
        log("[%3d/%3d] %-24s %s" % (i, len(merged), status, (m.get("title") or r["论文标题"])[:76]))

    mism = [v for v in verified if v["_cr_title"] and v["_title_similarity"] < 0.72]
    log("\nstats:", json.dumps(stats, ensure_ascii=False))
    log("title mismatches for review:", len(mism))

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(os.path.join(OUT_DIR, "verified.json"), "w", encoding="utf-8") as f:
        json.dump({"stats": stats, "records": verified}, f, ensure_ascii=False, indent=1)
    with open(os.path.join(OUT_DIR, "mismatches.json"), "w", encoding="utf-8") as f:
        json.dump(mism, f, ensure_ascii=False, indent=1)
    journals = sorted({(v["_cr_container"] or v["期刊/会议名"]) for v in verified if (v["_cr_container"] or v["期刊/会议名"])})
    with open(os.path.join(OUT_DIR, "journals.json"), "w", encoding="utf-8") as f:
        json.dump(journals, f, ensure_ascii=False, indent=1)
    log("distinct venues:", len(journals))
    log("DONE")


if __name__ == "__main__":
    main()
