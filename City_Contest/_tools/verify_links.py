"""Verify every 代码链接 / 数据集下载地址 by actually requesting it.

GitHub repos are checked against the public HTML page (no API rate limit) and, when the
API quota allows, enriched with stars / last-push / description so the report can say
which repositories are maintained.
"""

import glob
import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request

RAW_DIR = r"D:\code\City_Contest\_lit\raw"
OUT = r"D:\code\City_Contest\_lit\link_check.json"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) asphalt-lit-survey/1.0"

GH_RE = re.compile(r"^https?://(?:www\.)?github\.com/([^/\s]+)/([^/\s#?]+)", re.I)


def request(url, timeout=25, method="GET"):
    for i in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA}, method=method)
            with urllib.request.urlopen(req, timeout=timeout) as f:
                body = f.read(200000).decode("utf-8", "replace")
                return f.status, f.geturl(), body
        except urllib.error.HTTPError as e:
            return e.code, url, ""
        except Exception as e:
            if i == 2:
                return None, url, type(e).__name__ + ": " + str(e)[:70]
            time.sleep(1.5 * (i + 1))
    return None, url, "unknown"


def gh_api(path):
    try:
        req = urllib.request.Request("https://api.github.com" + path,
                                     headers={"User-Agent": UA, "Accept": "application/vnd.github+json"})
        with urllib.request.urlopen(req, timeout=20) as f:
            return json.loads(f.read().decode("utf-8", "replace"))
    except Exception:
        return None


def collect():
    urls = {}
    for f in sorted(glob.glob(os.path.join(RAW_DIR, "*.json"))):
        with open(f, encoding="utf-8-sig") as fh:
            try:
                data = json.loads(fh.read())
            except Exception:
                continue
        for rec in data if isinstance(data, list) else []:
            for field in ("代码链接", "数据集下载地址"):
                raw = str(rec.get(field, "") or "")
                for u in re.split(r"[,\s;]+", raw):
                    u = u.strip().rstrip("。，,;")
                    if u.startswith("http"):
                        urls.setdefault(u, []).append((os.path.basename(f), str(rec.get("论文标题", ""))[:60]))
    return urls


def main():
    urls = collect()
    print("distinct URLs to check:", len(urls), flush=True)

    gh_quota = gh_api("/rate_limit")
    remaining = ((gh_quota or {}).get("resources", {}).get("core", {}) or {}).get("remaining")
    print("github api remaining:", remaining, flush=True)

    results = {}
    for i, (u, refs) in enumerate(sorted(urls.items()), 1):
        m = GH_RE.match(u)
        if m:
            status, final, body = request(u)
            entry = {"kind": "github", "status": status, "final_url": final, "refs": refs}
            if status == 200:
                # a GitHub 404 page still returns 200 on some paths; detect the 404 marker
                if "Page not found" in body and "404" in body:
                    entry["status"] = 404
                    entry["note"] = "GitHub 404 page"
                else:
                    repo = gh_api("/repos/%s/%s" % (m.group(1), m.group(2)))
                    if repo:
                        entry["stars"] = repo.get("stargazers_count")
                        entry["pushed_at"] = (repo.get("pushed_at") or "")[:10]
                        entry["description"] = (repo.get("description") or "")[:150]
                        entry["full_name"] = repo.get("full_name")
                        entry["archived"] = repo.get("archived")
            results[u] = entry
        else:
            status, final, body = request(u)
            results[u] = {"kind": "web", "status": status, "final_url": final, "refs": refs,
                          "note": (body[:70] if status is None else "")}
        r = results[u]
        print("[%2d/%2d] %-4s %s" % (i, len(urls), r.get("status"), u[:96]), flush=True)
        time.sleep(0.5)

    ok = sum(1 for v in results.values() if v.get("status") == 200)
    print("\nOK: %d / %d" % (ok, len(results)))
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=1)
    print("saved", OUT)


if __name__ == "__main__":
    main()
