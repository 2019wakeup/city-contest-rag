#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Phase 1: resolve open-access PDF locations for every reference in _lit/verified.json.

Sources: OpenAlex (primary), Unpaywall (cross-check), Europe PMC (PMC id).
Output: _lit/oa_resolve.json  (one record per reference, candidate URLs ordered)
"""
import json, os, re, sys, time, threading
from concurrent.futures import ThreadPoolExecutor
import requests

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERIFIED = os.path.join(BASE, "_lit", "verified.json")
OUT = os.path.join(BASE, "_lit", "oa_resolve.json")
EMAIL = "lhg.research2026@gmail.com"
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/126.0.0.0 Safari/537.36")

local = threading.local()


def sess():
    if not hasattr(local, "s"):
        s = requests.Session()
        s.headers.update({"User-Agent": UA, "Accept": "application/json,text/html,*/*"})
        local.s = s
    return local.s


def get_json(url, timeout=40, tries=3):
    last = None
    for i in range(tries):
        try:
            r = sess().get(url, timeout=timeout)
            if r.status_code == 200:
                return r.json()
            if r.status_code in (404, 403, 422):
                return {"_http": r.status_code}
            last = "_http=%d" % r.status_code
        except Exception as e:
            last = "%s: %s" % (type(e).__name__, e)
        time.sleep(1.5 * (i + 1))
    return {"_err": last}


MD = {
    "ma": "materials", "su": "sustainability", "app": "applsci", "buildings": "buildings",
    "coatings": "coatings", "polym": "polymers", "rs": "remotesensing", "e": "entropy",
    "infrastructures": "infrastructures", "energies": "energies", "jmse": "jmse",
    "molecules": "molecules", "sensors": "sensors", "metals": "metals", "crystals": "crystals",
    "membranes": "membranes", "water": "water", "foods": "foods", "ijerph": "ijerph",
    "toxics": "toxics", "act": "actuators", "sym": "symmetry", "math": "mathematics",
    "machines": "machines", "admi": "admi", "fibers": "fibers", "minerals": "minerals",
    "resources": "resources", "sci": "sci", "urbansci": "urbansci", "smartcities": "smartcities",
    "futuretransp": "futuretransp", "constrmater": "constrmater", "geosciences": "geosciences",
    "pr": "pr", "c": "c", "s": "s", "p": "p", "nano": "nano", "chemosensors": "chemosensors",
}


def mdpi_candidates(doi):
    """MDPI DOI -> res.mdpi.com CDN pdf urls (works when www.mdpi.com returns 403)."""
    m = re.match(r"^10\.3390/([a-z]+)(\d+)(\d{2})(\d+)$", doi, re.I)
    if not m:
        m2 = re.match(r"^10\.3390/([a-z]+)(\d+)(\d+)$", doi, re.I)
        if not m2:
            return []
        j, vol, art = m2.group(1).lower(), m2.group(2), m2.group(3)
    else:
        j, vol, art = m.group(1).lower(), m.group(2), m.group(4)
    slug = MD.get(j, j)
    out = []
    for a in {art, art.lstrip("0") or "0", art.zfill(5)}:
        base = "https://res.mdpi.com/d_attachment/%s/%s-%s-%s/article_deploy/%s-%s-%s.pdf"
        out.append(base % (slug, slug, vol, a, slug, vol, a))
    return out


def resolve_one(rec):
    doi = (rec.get("DOI") or "").strip()
    out = {
        "序号": rec.get("_idx"),
        "title": rec.get("论文标题", ""),
        "type": rec.get("类型", ""),
        "doi": doi,
        "journal": rec.get("期刊/会议名", ""),
        "year": rec.get("发表时间", ""),
        "oa_status": None,
        "is_oa": None,
        "pmcid": None,
        "candidates": [],
        "notes": [],
    }
    if not doi:
        out["notes"].append("no-doi")
        return out

    # arXiv-style key stored in the DOI column
    m = re.match(r"^arxiv:(.+)$", doi, re.I)
    if m:
        aid = m.group(1)
        out["is_oa"] = True
        out["oa_status"] = "arxiv"
        out["candidates"].append({"url": "https://arxiv.org/pdf/%s" % aid, "src": "arXiv",
                                  "kind": "pdf", "ver": "preprint", "lic": None})
        return out

    # ---- OpenAlex (primary) ----
    oa = get_json("https://api.openalex.org/works/doi:%s?mailto=%s" % (doi, EMAIL))
    if isinstance(oa, dict) and oa.get("id"):
        o = oa.get("open_access") or {}
        out["is_oa"] = o.get("is_oa")
        out["oa_status"] = o.get("oa_status")
        if o.get("oa_url"):
            out["candidates"].append({"url": o["oa_url"], "src": "OpenAlex:oa_url",
                                      "kind": "pdf", "ver": None, "lic": o.get("oa_status")})
        locs = oa.get("locations") or []
        # prefer: pdf_url present, then version publishedVersion
        locs = sorted(locs, key=lambda l: (0 if l.get("pdf_url") else 1,
                                           0 if l.get("version") == "publishedVersion" else 1))
        for l in locs:
            src = (l.get("source") or {}).get("display_name")
            if l.get("pdf_url"):
                out["candidates"].append({"url": l["pdf_url"], "src": "OpenAlex:%s" % src,
                                          "kind": "pdf", "ver": l.get("version"), "lic": l.get("license")})
            ids = l.get("ids") or {}
            pmcid = ids.get("pmcid")
            if pmcid and not out["pmcid"]:
                out["pmcid"] = pmcid.rsplit("/", 1)[-1]
            if l.get("landing_page_url") and "pmc/articles" in (l.get("landing_page_url") or ""):
                if not out["pmcid"]:
                    out["pmcid"] = l["landing_page_url"].rstrip("/").rsplit("/", 1)[-1]
    else:
        out["notes"].append("openalex-miss %s" % (oa.get("_http") or oa.get("_err")))

    # ---- Unpaywall (cross-check / fills gaps) ----
    up = get_json("https://api.unpaywall.org/v2/%s?email=%s" % (doi, EMAIL))
    if isinstance(up, dict) and up.get("doi"):
        if out["is_oa"] is None:
            out["is_oa"] = up.get("is_oa")
            out["oa_status"] = up.get("oa_status")
        b = up.get("best_oa_location") or {}
        if b.get("url_for_pdf"):
            out["candidates"].append({"url": b["url_for_pdf"], "src": "Unpaywall:best",
                                      "kind": "pdf", "ver": b.get("version"), "lic": b.get("license")})
        for l in (up.get("oa_locations") or []):
            if l.get("url_for_pdf"):
                out["candidates"].append({"url": l["url_for_pdf"],
                                          "src": "Unpaywall:%s" % (l.get("host_type") or "?"),
                                          "kind": "pdf", "ver": l.get("version"), "lic": l.get("license")})
    else:
        out["notes"].append("unpaywall-miss %s" % (up.get("_http") or up.get("_err")))

    # ---- Europe PMC by DOI ----
    try:
        ep = get_json("https://www.ebi.ac.uk/europepmc/webservices/rest/search"
                      "?query=DOI:%22%s%22&format=json&resultType=core" % doi)
        hits = ((ep.get("resultList") or {}).get("result") or []) if isinstance(ep, dict) else []
        for h in hits:
            if h.get("pmcid"):
                out["pmcid"] = out["pmcid"] or h["pmcid"]
                if h.get("isOpenAccess") == "Y":
                    out["candidates"].append({
                        "url": "https://www.ebi.ac.uk/europepmc/webservices/rest/%s/fullTextXML" % h["pmcid"],
                        "src": "EuropePMC:fullTextXML", "kind": "xml", "ver": "publishedVersion",
                        "lic": h.get("license")})
                break
    except Exception as e:
        out["notes"].append("epmc-err %s" % e)

    # ---- MDPI CDN fallback ----
    for u in mdpi_candidates(doi):
        out["candidates"].append({"url": u, "src": "MDPI-CDN", "kind": "pdf",
                                  "ver": "publishedVersion", "lic": "cc-by"})

    # dedupe preserving order, drop empty
    seen, ded = set(), []
    for c in out["candidates"]:
        u = (c.get("url") or "").strip()
        if not u or u in seen:
            continue
        seen.add(u)
        c["url"] = u
        ded.append(c)
    out["candidates"] = ded
    return out


def main():
    data = json.load(open(VERIFIED, encoding="utf-8"))
    recs = data["records"]
    for i, r in enumerate(recs, 1):
        r["_idx"] = i
    todo = recs
    print("resolving %d records ..." % len(todo), flush=True)
    results = [None] * len(todo)
    done = [0]
    lock = threading.Lock()

    def work(pair):
        i, r = pair
        try:
            results[i] = resolve_one(r)
        except Exception as e:
            results[i] = {"序号": r.get("_idx"), "title": r.get("论文标题", ""),
                          "doi": r.get("DOI", ""), "type": r.get("类型", ""),
                          "candidates": [], "notes": ["fatal %s" % e]}
        with lock:
            done[0] += 1
            if done[0] % 20 == 0:
                print("  %d/%d" % (done[0], len(todo)), flush=True)

    with ThreadPoolExecutor(max_workers=6) as ex:
        list(ex.map(work, list(enumerate(todo))))

    res = [r for r in results if r]
    stats = {
        "total": len(res),
        "with_doi": sum(1 for r in res if r.get("doi")),
        "is_oa": sum(1 for r in res if r.get("is_oa")),
        "has_candidate": sum(1 for r in res if r.get("candidates")),
        "no_doi": sum(1 for r in res if not r.get("doi")),
    }
    json.dump({"stats": stats, "records": res}, open(OUT, "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(json.dumps(stats, ensure_ascii=False, indent=1))
    print("written:", OUT)


if __name__ == "__main__":
    main()
