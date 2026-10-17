#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Split the deduplicated PDF set into N page-balanced shards and emit runner scripts."""
import json, os

WS = "/bigdisk/lhg/road_rec"
plan = json.load(open(os.path.join(WS, ".analysis/plan.json"), encoding="utf-8"))
uniq = plan["unique"]
N = 2

# greedy longest-processing-time balance by page count
order = sorted(uniq, key=lambda x: -x["pages"])
shards = [[] for _ in range(N)]
load = [0] * N
for it in order:
    i = load.index(min(load))
    shards[i].append(it)
    load[i] += it["pages"]

for i, sh in enumerate(shards):
    sh.sort(key=lambda x: x["path"])
    lst = os.path.join(WS, ".analysis", "shard%d.txt" % i)
    with open(lst, "w", encoding="utf-8") as fh:
        for it in sh:
            fh.write(it["path"] + "\n")
    print("shard%d: %d files, %d pages -> %s" % (i, len(sh), load[i], lst))

# per-shard MINERU_HOME (separate .locks so two processes never contend)
for i in range(N):
    home = os.path.join(WS, ".mineru", "home%d" % i)
    mod = os.path.join(home, "models")
    os.makedirs(os.path.join(mod, ".locks"), exist_ok=True)
    for d in ("MinerU-4_models_torch", "MinerU2.5-Pro-2605-1.2B", "MinerU2.5-Pro-2605-1.2B-GGUF"):
        link = os.path.join(mod, d)
        if not os.path.islink(link) and not os.path.exists(link):
            os.symlink("/bigdisk/lhg/mineru/home/models/" + d, link)
    os.makedirs(os.path.join(WS, ".mineru", "tmp%d" % i), exist_ok=True)
print("per-shard MINERU_HOME + TMPDIR ready")
