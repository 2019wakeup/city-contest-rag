"""Re-check URLs whose first probe failed with a connection error (not 404).

Connection errors are transient in this environment; a second, slower pass distinguishes
"genuinely unreachable" from "flaky first attempt".
"""

import json
import time
import urllib.error
import urllib.request

LIT = r"D:\code\City_Contest\_lit"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) asphalt-lit-survey/1.0"


def get(url, timeout=45, tries=4):
    last = ""
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=timeout) as f:
                return f.status, f.geturl(), ""
        except urllib.error.HTTPError as e:
            return e.code, url, str(e.reason)[:60]
        except Exception as e:
            last = type(e).__name__ + ": " + str(e)[:60]
            time.sleep(2.0 * (i + 1))
    return None, url, last


def main():
    with open(LIT + r"\link_check.json", encoding="utf-8") as f:
        data = json.load(f)
    retry = {u: v for u, v in data.items() if v.get("status") is None}
    print("retrying", len(retry), "entries", flush=True)
    for u, v in retry.items():
        st, final, note = get(u)
        print("%-6s %s  %s" % (st, u[:90], note), flush=True)
        data[u]["status_retry"] = st
        data[u]["final_url_retry"] = final
        data[u]["retry_note"] = note
        if st == 200:
            data[u]["status"] = 200
    with open(LIT + r"\link_check.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    ok = sum(1 for v in data.values() if v.get("status") == 200)
    print("\nfinal OK: %d / %d" % (ok, len(data)))


if __name__ == "__main__":
    main()
