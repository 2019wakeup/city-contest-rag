#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Phase 3: extra resolution for records that phase 1/2 could not obtain.

Adds, for every still-missing record:
  * Europe PMC full-text XML  (PMC-deposited articles)
  * arXiv preprint            (title search with similarity gate)
  * OpenAIRE repository instances
  * existing local file match (a PDF already sitting in ref/ that carries the DOI)

Merges the new candidates into _lit/oa_resolve.json (backup kept) so that
fetch_literature.py --retry-failed can pick them up.
"""
import difflib, json, os, re, shutil, subprocess, threading, time
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import quote
import requests

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESOLVE = os.path.join(BASE, "_lit", "oa_resolve.json")
MANIFEST = os.path.join(BASE, "ref", "MANIFEST.json")
DEST = os.path.join(BASE, "ref")
EMAIL = "lhg.research2026@gmail.com"
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/126.0.0.0 Safari/537.36")
local = threading.local()


def sess():
    if not hasattr(local, "s"):
        s = requests.Session()
        s.headers.update({"User-Agent": UA, "Accept": "application/json,text/xml,*/*"})
        local.s = s
    return local.s


def gj(url, timeout=40, tries=3, headers=None):
    for i in range(tries):
        try:
            r = sess().get(url, timeout=timeout, headers=headers)
            if r.status_code == 200:
                return r
            if r.status_code in (403, 404):
                return None
        except Exception:
            pass
        time.sleep(1.2 * (i + 1))
    return None


def norm(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def title_sim(a, b):
    return difflib.SequenceMatcher(None, norm(a), norm(b)).ratio()


def epmc_candidates(rec):
    """Europe PMC: full-text XML when the article is deposited and open."""
    out = []
    doi = rec.get("doi", "")
    q = 'DOI:"%s"' % doi if doi else 'TITLE:"%s"' % rec.get("title", "")
    r = gj("https://www.ebi.ac.uk/europepmc/webservices/rest/search"
           "?query=%s&format=json&resultType=core&pageSize=5" % quote(q, safe=':"'))
    if not r:
        return out
    try:
        hits = (r.json().get("resultList") or {}).get("result") or []
    except Exception:
        return out
    for h in hits:
        if doi and norm(doi.split("/")[-1]) not in norm(str(h.get("doi", ""))):
            if title_sim(rec.get("title", ""), h.get("title", "")) < 0.85:
                continue
        pmcid = h.get("pmcid")
        if pmcid and h.get("inEPMC") == "Y":
            out.append(("https://www.ebi.ac.uk/europepmc/webservices/rest/%s/fullTextXML" % pmcid,
                        "EuropePMC:fullTextXML(%s)" % pmcid, h.get("license")))
            break
    return out


def arxiv_candidates(rec):
    """arXiv title search with a similarity gate."""
    out = []
    title = rec.get("title", "")
    if not title:
        return out
    words = re.sub(r"[^A-Za-z0-9 ]", " ", title)
    words = " ".join([w for w in words.split() if len(w) > 2][:12])
    if not words:
        return out
    r = gj("https://export.arxiv.org/api/query?search_query=ti:%s&max_results=6"
           % quote('"%s"' % words[:120]), timeout=40)
    if not r:
        return out
    entries = re.findall(r"<entry>(.*?)</entry>", r.text, re.S)
    best = None
    for e in entries:
        t = re.search(r"<title>(.*?)</title>", e, re.S)
        idm = re.search(r"<id>(http://arxiv\.org/abs/[^<]+)</id>", e)
        if not (t and idm):
            continue
        sim = title_sim(title, t.group(1))
        if sim >= 0.85 and (best is None or sim > best[0]):
            best = (sim, idm.group(1))
    if best:
        aid = best[1].rsplit("/abs/", 1)[-1]
        out.append(("https://arxiv.org/pdf/%s" % aid, "arXiv:title-match(%.2f)" % best[0], None))
    return out


def openaire_candidates(rec):
    out = []
    doi = rec.get("doi", "")
    if not doi:
        return out
    r = gj("https://api.openaire.eu/search/publications?doi=%s&format=json" % doi)
    if not r:
        return out
    try:
        d = r.json()
    except Exception:
        return out
    results = (((d.get("response") or {}).get("results") or {}).get("result")) or []
    if isinstance(results, dict):
        results = [results]
    for it in results[:2]:
        m = ((it.get("metadata") or {}).get("oaf:entity") or {}).get("oaf:result") or {}
        inst = ((m.get("children") or {}).get("instance")) or []
        if isinstance(inst, dict):
            inst = [inst]
        for i in inst:
            wu = i.get("webresource") or {}
            if isinstance(wu, list):
                wu = wu[0] if wu else {}
            url = wu.get("url")
            if isinstance(url, dict):
                url = url.get("$")
            if not url:
                continue
            low = url.lower()
            if any(x in low for x in ("doi.org", "sciencedirect", "tandfonline", "ascelibrary",
                                      "ieeexplore", "dl.acm", "link.springer", "onlinelibrary.wiley")):
                continue
            if low.endswith(".pdf") or "pdf" in low or "download" in low:
                out.append((url, "OpenAIRE:repository", i.get("license")))
    return out


def pre_existing(rec):
    """A PDF already in ref/ (not from this pipeline) that carries the DOI."""
    doi = rec.get("doi", "")
    if not doi:
        return None
    for fn in os.listdir(DEST):
        if not fn.lower().endswith(".pdf") or re.match(r"^\d{3} ", fn):
            continue
        p = os.path.join(DEST, fn)
        try:
            r = subprocess.run(["pdftotext", "-f", "1", "-l", "2", p, "-"],
                               capture_output=True, timeout=60)
            t = norm(r.stdout.decode("utf-8", "ignore"))
        except Exception:
            continue
        if norm(doi) in t or norm(doi.split("/")[-1]) in t:
            return fn
    return None


def main():
    data = json.load(open(RESOLVE, encoding="utf-8"))
    recs = data["records"]
    status = {}
    if os.path.exists(MANIFEST):
        status = {r["序号"]: r["status"] for r in json.load(open(MANIFEST, encoding="utf-8"))}
    done = {"ok", "ok_small", "xml_only"}
    todo = [r for r in recs if status.get(r.get("序号")) not in done]
    print("records needing extra resolution: %d" % len(todo), flush=True)

    lock = threading.Lock()
    counter = [0]

    def work(r):
        extra = []
        note = []
        for fn in (epmc_candidates, arxiv_candidates, openaire_candidates):
            try:
                got = fn(r)
            except Exception as e:
                got = []
                note.append("%s err %s" % (fn.__name__, e))
            extra += got
        pre = None
        try:
            pre = pre_existing(r)
        except Exception:
            pass
        with lock:
            counter[0] += 1
            if extra or pre:
                print("[%3d/%3d] %-3s +%d extra %s" % (
                    counter[0], len(todo), r.get("序号"),
                    len(extra), (pre and ("PRE-EXISTING " + pre)) or ""), flush=True)
                for u, s, _l in extra:
                    print("            %-32s %s" % (s, u[:96]), flush=True)
            elif counter[0] % 15 == 0:
                print("  ... %d/%d scanned" % (counter[0], len(todo)), flush=True)
        return r, extra, pre, note

    results = []
    with ThreadPoolExecutor(max_workers=5) as ex:
        results = list(ex.map(work, todo))

    shutil.copy(RESOLVE, RESOLVE + ".bak")
    added = 0
    for r, extra, pre, note in results:
        if pre:
            r["_pre_existing"] = pre
        have = {c.get("url") for c in r.get("candidates", [])}
        for u, s, lic in extra:
            if u in have:
                continue
            have.add(u)
            r.setdefault("candidates", []).append(
                {"url": u, "src": s, "kind": "pdf" if not u.endswith("XML") else "xml",
                 "ver": None, "lic": lic})
            added += 1
        r.setdefault("notes", []).extend(note)
    json.dump(data, open(RESOLVE, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    pre_count = sum(1 for r, _e, p, _n in results if p)
    print("\nadded %d extra candidate URLs; %d records matched a pre-existing local PDF" %
          (added, pre_count))
    print("backup:", RESOLVE + ".bak")


if __name__ == "__main__":
    main()
