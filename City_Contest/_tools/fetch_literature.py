#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Phase 2: download every resolvable open-access paper into City_Contest/ref/.

Reads _lit/oa_resolve.json, builds candidate URLs (with host priority plus
derived MDPI-CDN / arXiv / PMC routes), downloads, verifies the payload is a
real PDF, and where a URL was guessed it additionally verifies the DOI appears
inside the PDF so we never file the wrong paper.

Usage:
  python3 _tools/fetch_literature.py                 # all records that have candidates
  python3 _tools/fetch_literature.py --ids 2,5,10    # selected 序号
  python3 _tools/fetch_literature.py --retry-failed  # only records not yet OK
"""
import argparse, hashlib, json, os, re, subprocess, threading, time
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse
import requests

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESOLVE = os.path.join(BASE, "_lit", "oa_resolve.json")
DEST = os.path.join(BASE, "ref")
MANIFEST = os.path.join(DEST, "MANIFEST.json")
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/126.0.0.0 Safari/537.36")
MIN_PDF = 20 * 1024
GOOD_PDF = 100 * 1024

MDPI_SLUG = {
    "ma": "materials", "su": "sustainability", "app": "applsci", "buildings": "buildings",
    "coatings": "coatings", "polym": "polymers", "rs": "remotesensing", "e": "entropy",
    "data": "data", "infrastructures": "infrastructures", "jmse": "jmse", "energies": "energies",
    "molecules": "molecules", "sensors": "sensors", "metals": "metals", "crystals": "crystals",
    "membranes": "membranes", "water": "water", "foods": "foods", "ijerph": "ijerph",
    "act": "actuators", "sym": "symmetry", "math": "mathematics", "machines": "machines",
    "admi": "admi", "fibers": "fibers", "minerals": "minerals", "resources": "resources",
    "sci": "sci", "urbansci": "urbansci", "smartcities": "smartcities",
    "futuretransp": "futuretransp", "constrmater": "constrmater", "geosciences": "geosciences",
    "pr": "pr", "c": "c", "s": "s", "p": "p", "nano": "nano", "chemosensors": "chemosensors",
}

local = threading.local()
_host_lock = threading.Lock()
_host_next = {}
PER_HOST_DELAY = 0.5


def sess():
    if not hasattr(local, "s"):
        s = requests.Session()
        s.headers.update({
            "User-Agent": UA,
            "Accept": "application/pdf,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8",
        })
        local.s = s
    return local.s


def throttle(host):
    with _host_lock:
        now = time.time()
        nxt = _host_next.get(host, 0)
        wait = max(0.0, nxt - now)
        _host_next[host] = max(now, nxt) + PER_HOST_DELAY
    if wait:
        time.sleep(wait)


def host_rank(url):
    h = urlparse(url).netloc.lower()
    if h.startswith("res.mdpi.com"):
        return 0
    if "arxiv.org" in h:
        return 1
    if h.startswith("downloads.hindawi.com"):
        return 2
    if "europepmc" in h or "ebi.ac.uk" in h:
        return 3
    if ("repository" in h or h.endswith(".edu") or "worktribe" in h or "orca." in h
            or "pureadmin" in h or "digitalcommons" in h or "researchportal" in h):
        return 4
    if "springeropen" in h or "aclweb" in h or "plos" in h or "nature.com" in h or "rsc.org" in h:
        return 5
    if "researchsquare" in h or "chemrxiv" in h or "engrxiv" in h:
        return 6
    if "link.springer.com" in h or "ascelibrary" in h or "tandfonline" in h or "sciencedirect" in h:
        return 9
    if h.startswith("www.mdpi.com"):
        return 12
    if "doi.org" in h:
        return 30
    return 10


def slugify(s, n=80):
    s = re.sub(r"[\\/:*?\"<>|\r\n\t]+", " ", s or "")
    s = re.sub(r"\s+", " ", s).strip()
    return s[:n].strip(" .") or "untitled"


# ---------- text / verification helpers ----------
def norm(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def pdf_text(path, pages=2):
    try:
        r = subprocess.run(["pdftotext", "-f", "1", "-l", str(pages), path, "-"],
                           capture_output=True, timeout=60)
        return r.stdout.decode("utf-8", "ignore")
    except Exception:
        return ""


def df_pages(path):
    try:
        r = subprocess.run(["pdfinfo", path], capture_output=True, timeout=30)
        m = re.search(rb"Pages:\s+(\d+)", r.stdout)
        return int(m.group(1)) if m else None
    except Exception:
        return None


def verify_doi(path, doi):
    t = norm(pdf_text(path, 2))
    if not t:
        return None
    if norm(doi) in t:
        return True
    tail = norm(doi.split("/", 1)[-1])
    return bool(tail) and tail in t


# ---------- candidate construction ----------
def mdpi_landing_candidates(rec):
    """Exact (volume, article) from mdpi.com/ISSN/vol/issue/art landing URLs."""
    out = []
    m = re.match(r"^10\.3390/([a-z]+)\d+$", rec.get("doi", ""), re.I)
    if not m:
        return out
    jr = m.group(1).lower()
    slug = MDPI_SLUG.get(jr)
    if not slug:
        return out
    for c in rec.get("candidates", []):
        u = c.get("url", "")
        mm = re.search(r"mdpi\.com/\d{4}-\d{4}/(\d+)/(\d+)/(\d+)", u)
        if mm:
            vol, _issue, art = mm.group(1), mm.group(2), mm.group(3)
            out.append(mdpi_url(slug, vol, art))
    if not out:
        # derive from DOI digits: try 1- and 2-digit volume, with/without 2-digit issue
        m2 = re.match(r"^10\.3390/([a-z]+)(\d+)$", rec["doi"], re.I)
        digits = m2.group(2)
        for vlen in (2, 1):
            if len(digits) < vlen + 3:
                continue
            vol = digits[:vlen]
            rem = digits[vlen:]
            for ilen in (2, 0):
                if ilen and len(rem) < ilen + 3:
                    continue
                art = rem[ilen:]
                if 3 <= len(art) <= 5:
                    out.append(mdpi_url(slug, vol, art))
    # dedupe
    seen, ded = set(), []
    for u in out:
        if u not in seen:
            seen.add(u)
            ded.append(u)
    return ded


def mdpi_url(slug, vol, art):
    v = "%02d" % int(vol)
    a = "%05d" % int(art)
    base = "https://res.mdpi.com/d_attachment/%s/%s-%s-%s/article_deploy/%s-%s-%s.pdf"
    return base % (slug, slug, v, a, slug, v, a)


def arxiv_candidates(rec):
    out = []
    doi = rec.get("doi", "")
    m = re.match(r"^arxiv:(.+)$", doi, re.I)
    if m:
        out.append("https://arxiv.org/pdf/%s" % m.group(1))
    for c in rec.get("candidates", []):
        u = c.get("url", "")
        m2 = re.search(r"arxiv\.org/(?:abs|pdf)/([0-9]+\.[0-9]+)", u)
        if m2:
            out.append("https://arxiv.org/pdf/%s" % m2.group(1))
    return list(dict.fromkeys(out))


def build_candidates(rec):
    """Return [(url, src, lic, guessed_bool)] in try order."""
    rows = []
    guessed = set(mdpi_landing_candidates(rec)) | set(arxiv_candidates(rec))
    mdpi = mdpi_landing_candidates(rec)
    arx = arxiv_candidates(rec)
    for u in mdpi:
        rows.append((u, "MDPI-CDN", "cc-by", True))
    for u in arx:
        rows.append((u, "arXiv", None, bool(re.match(r"^arxiv:", rec.get("doi", ""), re.I))))
    for c in rec.get("candidates", []):
        u = c.get("url", "")
        if not u or u in mdpi or u in arx:
            continue
        rows.append((u, c.get("src") or "?", c.get("lic"), False))
    # stable sort by host rank, keeping mdpi/arxiv at their rank positions
    rows.sort(key=lambda r: host_rank(r[0]))
    return rows


def fetch(url, timeout=90):
    throttle(urlparse(url).netloc.lower())
    try:
        r = sess().get(url, timeout=timeout, allow_redirects=True, stream=True)
    except Exception as e:
        return "none", b"", "%s: %s" % (type(e).__name__, e)
    if r.status_code != 200:
        r.close()
        return "none", b"", "http=%d" % r.status_code
    ct = (r.headers.get("Content-Type") or "").lower()
    buf = b""
    try:
        for chunk in r.iter_content(65536):
            buf += chunk
            if len(buf) > 60 * 1024 * 1024:
                break
    except Exception as e:
        r.close()
        return "none", buf, "body-error %s" % e
    r.close()
    if buf[:5] == b"%PDF-":
        return "pdf", buf, "ok ct=%s len=%d" % (ct, len(buf))
    head = buf[:200].lstrip()
    is_xml = (head.startswith(b"<?xml") or ct.startswith("application/xml")
              or ct.startswith("text/xml"))
    if is_xml and b"<article" in buf[:200000]:
        return "xml", buf, "ok ct=%s len=%d" % (ct, len(buf))
    return "none", buf, "not-pdf ct=%s len=%d head=%s" % (ct, len(buf), head[:50])


def process(rec):
    idx = rec.get("序号") or 0
    title = rec.get("title") or "untitled"
    doi = rec.get("doi", "")
    out = {
        "序号": idx, "title": title, "doi": doi, "type": rec.get("type", ""),
        "journal": rec.get("journal", ""), "year": rec.get("year", ""),
        "oa_status": rec.get("oa_status"), "is_oa": rec.get("is_oa"),
        "status": "failed", "file": None, "bytes": 0, "sha256": None,
        "source": None, "source_url": None, "license": None,
        "doi_verified_in_pdf": None, "pages": None, "tried": [], "note": "",
    }
    best_xml = None
    for url, src, lic, guessed in build_candidates(rec):
        kind, data, msg = fetch(url)
        out["tried"].append({"url": url, "src": src, "result": msg})
        if kind == "pdf" and len(data) >= MIN_PDF:
            fname = "%03d %s.pdf" % (idx, slugify(title))
            path = os.path.join(DEST, fname)
            with open(path, "wb") as fh:
                fh.write(data)
            ok = verify_doi(path, doi) if doi else None
            if guessed and ok is False:
                os.remove(path)
                out["tried"][-1]["result"] += " -> DOI MISMATCH, rejected"
                continue
            out.update(status="ok" if len(data) >= GOOD_PDF else "ok_small",
                       file=fname, bytes=len(data),
                       sha256=hashlib.sha256(data).hexdigest(),
                       source=src, source_url=url, license=lic,
                       doi_verified_in_pdf=ok, pages=df_pages(path))
            return out
        if kind == "xml" and best_xml is None:
            best_xml = (url, src, lic, data)
    if best_xml:
        url, src, lic, data = best_xml
        fname = "%03d %s.xml" % (idx, slugify(title))
        with open(os.path.join(DEST, fname), "wb") as fh:
            fh.write(data)
        out.update(status="xml_only", file=fname, bytes=len(data),
                   sha256=hashlib.sha256(data).hexdigest(),
                   source=src, source_url=url, license=lic,
                   note="no open PDF; saved Europe PMC full-text XML")
        return out
    out["note"] = "no downloadable open-access copy found"
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ids", default="")
    ap.add_argument("--retry-failed", action="store_true")
    ap.add_argument("--workers", type=int, default=5)
    a = ap.parse_args()

    data = json.load(open(RESOLVE, encoding="utf-8"))
    recs = data["records"]
    if a.ids:
        want = {int(x) for x in a.ids.split(",") if x.strip()}
        recs = [r for r in recs if r.get("序号") in want]
    else:
        recs = [r for r in recs if r.get("candidates")]

    if a.retry_failed and os.path.exists(MANIFEST):
        old = {r["序号"]: r["status"] for r in json.load(open(MANIFEST, encoding="utf-8"))}
        recs = [r for r in recs if old.get(r.get("序号")) not in ("ok", "ok_small", "xml_only")]

    os.makedirs(DEST, exist_ok=True)
    print("downloading %d records -> %s" % (len(recs), DEST), flush=True)

    lock = threading.Lock()
    done = [0]
    results = []

    def work(r):
        res = process(r)
        with lock:
            results.append(res)
            done[0] += 1
            print("[%3d/%3d] %-9s %-46s %s" % (
                done[0], len(recs), res["status"], (res["source"] or "-")[:46],
                res["title"][:48]), flush=True)
        return res

    with ThreadPoolExecutor(max_workers=a.workers) as ex:
        list(ex.map(work, recs))

    results.sort(key=lambda r: r["序号"])
    # merge with previous manifest so partial runs accumulate
    prev = {}
    if os.path.exists(MANIFEST):
        try:
            prev = {r["序号"]: r for r in json.load(open(MANIFEST, encoding="utf-8"))}
        except Exception:
            prev = {}
    for r in results:
        prev[r["序号"]] = r
    merged = [prev[k] for k in sorted(prev)]
    json.dump(merged, open(MANIFEST, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    from collections import Counter
    print("\n== this run ==")
    for k, v in Counter(r["status"] for r in results).most_common():
        print("  %-12s %d" % (k, v))
    print("\n== cumulative ==")
    for k, v in Counter(r["status"] for r in merged).most_common():
        print("  %-12s %d" % (k, v))
    print("manifest:", MANIFEST)


if __name__ == "__main__":
    main()
