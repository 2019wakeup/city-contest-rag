"""Precisely diagnose individual DOIs: report the exact HTTP status of both the Crossref
API and the doi.org resolution, so "not found" can be distinguished from "rate limited"."""

import json
import sys
import urllib.error
import urllib.parse
import urllib.request

UA = "asphalt-lit-survey/1.0 (mailto:contest-team@example.org)"
DOIS = [
    "10.3390/ma13071556",
    "10.3390/su15043539",
    "10.3390/ma19163408",
    "10.1080/10298436.2026.2668561",
    "10.1145/3397271.3401075",
    "10.3390/ma12081285",
    "10.3390/infrastructures9100173",
    "10.1061/jmcee7.mteng-20929",
]


def probe(url):
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *a, **k):
            return None

    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as f:
            return f.status, f.geturl(), f.read(4000).decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        loc = e.headers.get("Location", "") if e.headers else ""
        return e.code, loc, ""
    except Exception as e:
        return None, type(e).__name__ + ": " + str(e)[:60], ""


for d in DOIS:
    st, info, body = probe("https://api.crossref.org/works/" + urllib.parse.quote(d))
    title = ""
    if st == 200 and body:
        try:
            title = json.loads(body)["message"]["title"][0][:80]
        except Exception:
            title = "(parse fail)"
    print("CROSSREF %-34s status=%-6s %s" % (d, st, title or info[:70]))

    st2, info2, _ = probe("https://doi.org/" + urllib.parse.quote(d))
    print("     doi.org -> status=%-6s %s" % (st2, str(info2)[:110]))
    sys.stdout.flush()
