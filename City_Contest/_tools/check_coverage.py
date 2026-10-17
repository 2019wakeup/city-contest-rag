#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Compare reference.zip contents against the 149-entry survey and the earlier ref/ pulls."""
import json, os, re, subprocess, difflib
from collections import defaultdict

ROOT = "/bigdisk/lhg/road_rec"
REF = os.path.join(ROOT, "reference")                       # newly delivered package
OLD = os.path.join(ROOT, "City_Contest", "ref")             # earlier automated pulls
VER = os.path.join(ROOT, "City_Contest", "_lit", "verified.json")

DOI_RE = re.compile(r"10\.\d{4,9}/[-._;()/:A-Za-z0-9]+")
# NOTE: must keep CJK -- stripping it made every Chinese title normalize to "" and match everything
norm = lambda s: re.sub(r"[^0-9a-z\u4e00-\u9fff]", "", (s or "").lower())


def norm_doi(d):
    return norm(d).replace("arxiv", "")


def pdf_dois(path, pages=2):
    try:
        t = subprocess.run(["pdftotext", "-f", "1", "-l", str(pages), path, "-"],
                           capture_output=True, timeout=90).stdout.decode("utf-8", "ignore")
    except Exception:
        return set()
    out = set()
    for m in DOI_RE.findall(t):
        m = m.rstrip(".,;)]}»")
        out.add(norm(m))
    return out


def guess_title(fn):
    base = os.path.splitext(os.path.basename(fn))[0]
    # "Author - 2020 - Title"  /  "2020-Journal-Title"
    base = re.sub(r"^FDIS_MD5_\d+_", "", base)      # scanned-standard dump prefix
    base = base.replace("《", "").replace("》", "").strip()
    m = re.match(r"^.{0,40}?\s-\s(\d{4})\s-\s(.+)$", base)
    if m:
        return m.group(2)
    m = re.match(r"^(\d{4})[-_](.+)$", base)
    if m:
        return re.sub(r"^[^-]{0,60}?-", "", m.group(2), count=1) or m.group(2)
    return base


CODE_RE = re.compile(
    r"(?:JTG(?:/T)?\s*\d+(?:[—\-–]\d+)?(?:[—\-–]\d{4})?"
    r"|AASHTO\s+[A-Z]{0,2}\s*\d+"
    r"|ASTM\s+[A-Z]\s*\d+"
    r"|NCHRP\s+\d+(?:-\d+[A-Z]?)?"
    r"|HM-\d+)", re.I)


def codes(s):
    return {re.sub(r"\s+", "", c.upper()).replace("—", "-").replace("–", "-")
            for c in CODE_RE.findall(s or "")}


def main():
    # ---- index the new package ----
    pkg = []
    for dirpath, _d, files in os.walk(REF):
        for f in files:
            if not f.lower().endswith(".pdf"):
                continue
            p = os.path.join(dirpath, f)
            rel = os.path.relpath(p, REF)
            pkg.append({"path": p, "rel": rel, "cat": rel.split(os.sep)[0],
                        "size": os.path.getsize(p),
                        "dois": pdf_dois(p), "title": guess_title(f)})
    print("reference.zip PDFs: %d" % len(pkg))

    # DOI -> package entries
    by_doi = defaultdict(list)
    for e in pkg:
        for d in e["dois"]:
            by_doi[d].append(e)

    # ---- index the earlier pulls ----
    man = os.path.join(OLD, "MANIFEST.json")

    # ---- walk the survey ----
    recs = json.load(open(VER, encoding="utf-8"))["records"]
    res = []
    for i, r in enumerate(recs, 1):
        doi = (r.get("DOI") or "").strip()
        title = r.get("论文标题", "")
        nd = norm_doi(doi) if doi else ""
        hit_pkg = by_doi.get(nd, []) if nd else []
        # filename/title fallback for entries without a usable DOI
        if not hit_pkg:
            nt = norm(title)
            best = None
            hit_how = None
            rcode = codes(title)
            for e in pkg:
                ne = norm(e["title"])
                # (a) standard-designation match  (JTG F40-2004 / AASHTO M 320 / ...)
                if rcode and rcode & codes(e["title"] + " " + e["rel"]):
                    cand = (0.99, e, "code")
                # (b) containment of a Chinese title stem
                elif len(nt) >= 6 and len(ne) >= 6 and (nt in ne or ne in nt):
                    cand = (0.95, e, "contains")
                # (c) fuzzy title
                elif len(nt) >= 8 and len(ne) >= 8:
                    s = difflib.SequenceMatcher(None, nt[:90], ne[:90]).ratio()
                    cand = (s, e, "fuzzy") if s >= 0.85 else None
                else:
                    cand = None
                if cand and (best is None or cand[0] > best[0]):
                    best = cand
            if best:
                hit_pkg = [best[1]]
                hit_sim = round(best[0], 2)
                hit_how = best[2]
            else:
                hit_sim = None
                hit_how = None
        else:
            hit_sim = 1.0
            hit_how = "doi"
        # earlier pull (from manifest below)
        res.append({
            "序号": i, "doi": doi, "title": title, "type": r.get("类型", ""),
            "in_pkg": bool(hit_pkg), "pkg_file": hit_pkg[0]["rel"] if hit_pkg else "",
            "pkg_sim": hit_sim, "pkg_how": hit_how, "in_old": None,
        })
    # earlier pull coverage straight from the manifest
    oldman = {}
    if os.path.exists(man):
        oldman = {r["序号"]: r for r in json.load(open(man, encoding="utf-8"))}
    DONE = {"ok", "ok_small", "xml_only"}
    for e in res:
        m = oldman.get(e["序号"], {})
        e["in_old"] = m.get("status") in DONE
        if e["in_old"]:
            e["old_file"] = m.get("file")

    tmp = os.path.join(ROOT, "City_Contest", "_lit", "coverage_vs_reference.json")
    json.dump(res, open(tmp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    n_pkg = sum(1 for e in res if e["in_pkg"])
    n_old = sum(1 for e in res if e["in_old"])
    n_both = sum(1 for e in res if e["in_pkg"] and e["in_old"])
    n_either = sum(1 for e in res if e["in_pkg"] or e["in_old"])
    print("\n== 149 条调研条目的覆盖情况 ==")
    print("  仅 reference.zip 提供的新增      : %d" % (n_pkg - n_both))
    print("  之前 ref/ 已有                    : %d" % n_old)
    print("  两者都有                          : %d" % n_both)
    print("  --------------------------------------------------")
    print("  合计已覆盖                        : %d / %d" % (n_either, len(res)))
    print("  仍未获得                          : %d" % (len(res) - n_either))

    print("\n== reference.zip 新增覆盖（之前没有）=%d ==" % (n_pkg - n_both))
    for e in res:
        if e["in_pkg"] and not e["in_old"]:
            print("  %3d [%s] %s" % (e["序号"], e["type"], e["title"][:56]))
            print("       -> %s" % e["pkg_file"][:96])

    print("\n== 仍未获得 ==")
    for e in res:
        if not e["in_pkg"] and not e["in_old"]:
            print("  %3d [%s] %s  | %s" % (e["序号"], e["type"], e["title"][:50], e["doi"] or "-"))

    # package files that matched no survey entry
    matched = {e["pkg_file"] for e in res if e["in_pkg"]}
    print("\n== reference.zip 中未匹配到调研条目的文件 ==")
    for e in pkg:
        if e["rel"] not in matched:
            print("  %-88s %s" % (e["rel"][:88], "/".join(sorted(e["dois"]))[:40]))
    print("\nsaved:", tmp)


if __name__ == "__main__":
    main()
