"""Re-query Crossref for the still-unverified records that do carry a DOI.

The first pass hit Crossref rate limiting, which is why several perfectly valid MDPI/ACM
DOIs came back unresolved. This retry is slow and polite on purpose, and writes its
findings back into second_chance.json.
"""

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
UA = "asphalt-lit-survey/1.0 (mailto:contest-team@example.org)"
DOI_OK = re.compile(r"^10\.\d{4,9}/\S+$")


def norm(s):
    s = unicodedata.normalize("NFKC", str(s or "")).lower()
    return re.sub(r"[^0-9a-z\u4e00-\u9fff]+", " ", s).strip()


def sim(a, b):
    return SequenceMatcher(None, norm(a), norm(b)).ratio()


def fetch(url, tries=4, timeout=35):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=timeout) as f:
                return json.loads(f.read().decode("utf-8", "replace"))
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            time.sleep(2.0 * (i + 1))
        except Exception:
            time.sleep(2.0 * (i + 1))
    return None


def main():
    with open(os.path.join(LIT, "verified.json"), encoding="utf-8") as f:
        recs = json.load(f)["records"]
    with open(os.path.join(LIT, "second_chance.json"), encoding="utf-8") as f:
        second = json.load(f)

    todo = []
    for r in recs:
        key = r.get("DOI") or r.get("论文标题", "")[:80]
        if second.get(key, {}).get("status") == "still_unverified" and DOI_OK.match(r.get("DOI", "")):
            todo.append((key, r))

    print("retrying Crossref for", len(todo), "DOI-bearing records", flush=True)
    for i, (key, r) in enumerate(todo, 1):
        doi = r["DOI"]
        d = fetch("https://api.crossref.org/works/" + urllib.parse.quote(doi))
        msg = (d or {}).get("message")
        if msg:
            title = re.sub(r"\s+", " ", (msg.get("title") or [""])[0]).strip()
            cont = (msg.get("container-title") or [""])
            cont = cont[0] if cont else ""
            parts = ((msg.get("issued") or {}).get("date-parts") or [[None]])[0]
            year = str(parts[0]) if parts and parts[0] else ""
            s = sim(r.get("论文标题", ""), title)
            second[key] = {
                "status": "crossref_retry",
                "evidence": "https://api.crossref.org/works/" + doi,
                "title_seen": title[:160],
                "container": cont,
                "year": year,
                "similarity": round(s, 3),
                "note": "" if s >= 0.72 else "注册标题与检索标题不一致，建议人工确认",
            }
        else:
            second[key] = dict(second.get(key, {}))
            second[key]["status"] = "still_unverified"
            second[key]["retry_note"] = "Crossref 重查仍未收录"
        print("[%2d/%2d] %-28s %s" % (i, len(todo), second[key]["status"], doi), flush=True)
        time.sleep(1.2)

    with open(os.path.join(LIT, "second_chance.json"), "w", encoding="utf-8") as f:
        json.dump(second, f, ensure_ascii=False, indent=1)
    from collections import Counter
    print("\n", dict(Counter(v.get("status") for v in second.values())))


if __name__ == "__main__":
    main()
