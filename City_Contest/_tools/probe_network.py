"""Probe reachability of code-hosting, dataset and DOI endpoints from this environment."""
import json
import urllib.error
import urllib.request

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) asphalt-lit-survey/1.0"
TARGETS = [
    ("github.com", "https://github.com/"),
    ("api.github.com", "https://api.github.com/rate_limit"),
    ("raw.githubusercontent.com", "https://raw.githubusercontent.com/pymoo/pymoo/master/README.rst"),
    ("zenodo.org", "https://zenodo.org/"),
    ("data.mendeley.com", "https://data.mendeley.com/datasets/yb4brz3sdx/3"),
    ("hive.utah.edu", "https://hive.utah.edu/records/g15zy-0x872"),
    ("infopave.fhwa.dot.gov", "https://infopave.fhwa.dot.gov/"),
    ("catalog.data.gov", "https://catalog.data.gov/dataset/long-term-pavement-performance-ltpp"),
    ("pypi.org", "https://pypi.org/project/pymoo/"),
    ("paperswithcode.com", "https://paperswithcode.com/"),
    ("doi.org", "https://doi.org/10.1016/j.conbuildmat.2024.136182"),
    ("openalex", "https://api.openalex.org/works/doi:10.1016/j.conbuildmat.2024.136182"),
]


def probe(name, url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=20) as f:
            body = f.read(4000).decode("utf-8", "replace")
            return name, "OK", f.status, len(body)
    except urllib.error.HTTPError as e:
        return name, "HTTPError", e.code, str(e.reason)[:60]
    except Exception as e:
        return name, "FAIL", type(e).__name__, str(e)[:80]


if __name__ == "__main__":
    out = []
    for n, u in TARGETS:
        r = probe(n, u)
        out.append(r)
        print("%-26s %-10s %-22s %s" % r, flush=True)
    with open(r"D:\code\City_Contest\_lit\network_probe.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
