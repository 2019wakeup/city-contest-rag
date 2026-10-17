"""Second-chance verification for records Crossref could not resolve.

For each unresolved record we try, in order:
  1. resolve the DOI through https://doi.org/ and read the landing page <title>;
  2. look up an arXiv id through the official arXiv API;
  3. fetch a source URL quoted in 备注 and check the recorded title tokens appear.

A record is promoted only when one of these yields positive textual evidence; otherwise it
stays unresolved and is reported separately rather than padded into the main table.
"""

import html
import json
import os
import re
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from difflib import SequenceMatcher

LIT = r"D:\code\City_Contest\_lit"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) asphalt-lit-survey/1.0"
ARXIV_RE = re.compile(r"arxiv[:\s/]*(\d{4}\.\d{4,5})", re.I)
URL_RE = re.compile(r"https?://[^\s，。；、）)】\]]+")


def norm(s):
    s = unicodedata.normalize("NFKC", str(s or "")).lower()
    return re.sub(r"[^0-9a-z\u4e00-\u9fff]+", " ", s).strip()


def sim(a, b):
    return SequenceMatcher(None, norm(a), norm(b)).ratio()


def get(url, timeout=25, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en,zh-CN;q=0.8"})
            with urllib.request.urlopen(req, timeout=timeout) as f:
                return f.status, f.geturl(), f.read(300000).decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            if e.code in (403, 401, 404):
                return e.code, url, ""
            time.sleep(1.5 * (i + 1))
        except Exception:
            time.sleep(1.5 * (i + 1))
    return None, url, ""


def page_title(body):
    m = re.search(r"<title[^>]*>(.*?)</title>", body, re.S | re.I)
    if not m:
        return ""
    t = html.unescape(re.sub(r"\s+", " ", m.group(1))).strip()
    for junk in (" - ScienceDirect", " | ScienceDirect.com", " - PubMed", " - PMC",
                 " - MDPI", " | MDPI", " - Taylor & Francis", " - ASCE", " | SpringerLink",
                 " - Crossref", " - Wiley Online Library", " | IEEE Conference Publication"):
        t = t.replace(junk, "")
    return t.strip()


def arxiv_lookup(aid):
    url = "http://export.arxiv.org/api/query?id_list=" + urllib.parse.quote(aid)
    st, _, body = get(url)
    if not body:
        return None
    titles = re.findall(r"<title>(.*?)</title>", body, re.S)
    if len(titles) < 2:
        return None
    return html.unescape(re.sub(r"\s+", " ", titles[1])).strip()


def main():
    with open(os.path.join(LIT, "verified.json"), encoding="utf-8") as f:
        data = json.load(f)
    recs = data["records"]
    todo = [r for r in recs if r["_verify_status"] not in
            ("doi_confirmed", "doi_found_by_title", "title_confirmed_no_doi")]
    print("records needing second chance:", len(todo), flush=True)

    out = {}
    for i, r in enumerate(todo, 1):
        title = r.get("_cr_title") or r.get("论文标题", "")
        doi = r.get("DOI", "")
        blob = " ".join([r.get("备注", ""), r.get("论文标题", ""), r.get("代码链接", ""),
                         r.get("数据集下载地址", "")])
        ev = {"status": "still_unverified", "evidence": "", "title_seen": "", "similarity": 0.0}

        # 1) DOI resolution
        if doi:
            st, final, body = get("https://doi.org/" + urllib.parse.quote(doi))
            if st == 200 and body:
                t = page_title(body)
                s = sim(title, t)
                if s >= 0.55 or norm(title)[:40] in norm(body):
                    ev = {"status": "doi_resolves", "evidence": final[:200], "title_seen": t[:160],
                          "similarity": round(s, 3)}
        # 2) arXiv
        if ev["status"] == "still_unverified":
            m = ARXIV_RE.search(blob)
            if m:
                t = arxiv_lookup(m.group(1))
                if t:
                    s = sim(title, t)
                    ev = {"status": "arxiv_confirmed", "evidence": "https://arxiv.org/abs/" + m.group(1),
                          "title_seen": t[:160], "similarity": round(s, 3)}

        # 3) source URL in notes
        if ev["status"] == "still_unverified":
            for u in URL_RE.findall(blob)[:3]:
                st, final, body = get(u)
                if st == 200 and body:
                    t = page_title(body)
                    s = sim(title, t)
                    key = norm(title)[:24]
                    if (key and key in norm(body)) or s >= 0.5:
                        ev = {"status": "source_url_confirmed", "evidence": final[:200],
                              "title_seen": t[:160], "similarity": round(s, 3)}
                        break

        out[r.get("DOI") or r.get("论文标题", "")[:80]] = ev
        print("[%2d/%2d] %-24s %s" % (i, len(todo), ev["status"], (r.get("DOI") or r.get("论文标题"))[:70]), flush=True)
        time.sleep(0.3)

    with open(os.path.join(LIT, "second_chance.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    from collections import Counter
    print("\n", dict(Counter(v["status"] for v in out.values())))
    print("saved second_chance.json")


if __name__ == "__main__":
    main()
