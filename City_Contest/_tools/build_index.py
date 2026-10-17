#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate 文献清单索引.md : a single index over both literature collections."""
import csv, json, os, subprocess

ROOT = "/bigdisk/lhg/road_rec"
REF = "reference"
OLD = "City_Contest/ref"
COV = os.path.join(ROOT, "City_Contest/_lit/coverage_vs_reference.json")
MAN = os.path.join(ROOT, OLD, "MANIFEST.csv")
VER = os.path.join(ROOT, "City_Contest/_lit/verified.json")

# group order for the index
ORDER = ["背景知识", "综述", "规范标准", "评估方法", "推荐算法", "知识图谱",
         "RAG与检索", "多准则决策", "案例推理", "应用研究",
         "实验研究（掺量-性能）", "实验研究（改性机理-疲劳）", "实验研究（温拌降温定量）",
         "实验研究（材料-模量-车辙）", "实验研究（纤维类型/长度/掺量）",
         "实验研究（RAP掺量-性能权衡）", "实验研究（抗剥落剂/纳米材料掺量）",
         "实验研究（再生剂掺量-工艺）", "实验研究（纤维+抗车辙剂复配）",
         "经验回归建模（胶结料-配合比→车辙）", "现场统计研究（体积参数-路况）",
         "多目标优化设计（降噪-性能）", "机理实验研究（PG等级-疲劳）",
         "设计方法对比研究", "数据集", "开源代码"]

cov = {e["序号"]: e for e in json.load(open(COV, encoding="utf-8"))}
old = {int(r["序号"]): r for r in csv.DictReader(open(MAN, encoding="utf-8-sig"))}
ver = json.load(open(VER, encoding="utf-8"))["records"]


# scanned flags (cache by path)
scan_cache = {}


def scanned(rel):
    """True when the PDF has no text layer on its first pages (needs OCR)."""
    if rel in scan_cache:
        return scan_cache[rel]
    p = os.path.join(ROOT, REF, rel)
    try:
        out = subprocess.run(["pdftotext", "-f", "1", "-l", "3", p, "-"],
                             capture_output=True, timeout=120).stdout
        scan_cache[rel] = len(out.strip()) < 40
    except Exception:
        scan_cache[rel] = False
    return scan_cache[rel]


# scan the whole package once
pkg_all = []
for dp, _d, fs in os.walk(os.path.join(ROOT, REF)):
    for f in fs:
        if f.lower().endswith(".pdf"):
            pkg_all.append(os.path.relpath(os.path.join(dp, f), os.path.join(ROOT, REF)))
for rel in pkg_all:
    scanned(rel)
scanned_total = sum(1 for v in scan_cache.values() if v)


rows = []
for i, r in enumerate(ver, 1):
    e = cov.get(i, {})
    m = old.get(i, {})
    has_pkg = bool(e.get("in_pkg"))
    has_old = m.get("状态") in ("ok", "ok_small", "xml_only")
    rows.append({
        "i": i, "title": r.get("论文标题", ""), "type": r.get("类型", ""),
        "journal": r.get("期刊/会议名", ""), "year": r.get("发表时间", ""),
        "doi": (r.get("DOI") or "").strip(),
        "pkg": e.get("pkg_file") if has_pkg else None,
        "old": m.get("文件名") if has_old else None,
        "old_status": m.get("状态", ""),
        "old_note": m.get("说明", ""),
    })

got = [x for x in rows if x["pkg"] or x["old"]]
miss = [x for x in rows if not x["pkg"] and not x["old"]]

# scanned flags (cache already warmed by the full-package scan above -- do not reset it)
for x in got:
    if x["pkg"]:
        if x["pkg"] not in scan_cache:
            scan_cache[x["pkg"]] = scanned(x["pkg"])
        x["scan"] = scan_cache[x["pkg"]]
    else:
        x["scan"] = False


def mark(x):
    if x["pkg"] and x["old"]:
        return "双"
    return "新" if x["pkg"] else "旧"


def tbl(recs, with_doi=True):
    out = []
    h = "| 序号 | 标题 | 年 | DOI | 所在地 | 文件 |"
    s = "|---|---|---|---|---|---|"
    out += [h, s]
    for x in recs:
        loc = mark(x)
        locell = "【%s】" % loc
        files = []
        if x["pkg"]:
            files.append("`%s/%s`" % (REF, x["pkg"]))
        if x["old"]:
            files.append("`%s/%s`" % (OLD, x["old"]))
        f = "<br>".join(files)
        if x.get("scan"):
            f += " ⚠扫描件"
        out.append("| %d | %s | %s | %s | %s | %s |" % (
            x["i"], x["title"], x["year"] or "-", x["doi"] or "-", locell, f))
    return out


def group(recs):
    d, other = {}, []
    for x in recs:
        t = x["type"]
        (d.setdefault(t, []) if t in ORDER else other).append(x)  # noqa
    return d, other


L = []
A = L.append
A("# 文献清单索引\n")
A("> 项目：第十二届中国研究生智慧城市大赛 · 企业揭榜赛道 · 课题一《数智选材》")
A("> 覆盖：《课题一 文献调研报告》全部 **149** 条条目，已获得全文 **%d** 条，未获得 **%d** 条" % (len(got), len(miss)))
A("> 生成日期：2026-10-16　｜　所有路径均相对于 `/bigdisk/lhg/road_rec/`\n")

A("## 0. 一页速查\n")
A("| 项目 | 数值 |")
A("|---|---|")
A("| 调研条目总数 | 149 |")
A("| **已获得全文** | **%d** |" % len(got))
A("| 　└ 仅 `reference/` 有 | %d |" % sum(1 for x in got if mark(x) == "新"))
A("| 　└ 仅 `City_Contest/ref/` 有 | %d |" % sum(1 for x in got if mark(x) == "旧"))
A("| 　└ 两处都有（重复） | %d |" % sum(1 for x in got if mark(x) == "双"))
A("| 未获得 | %d |" % len(miss))
A("| `reference/` 中无文字层的扫描件 | %d / 66 份（需 OCR，见 §5.2） |" % scanned_total)
A("")
A("## 1. 两个文献库怎么用\n")
A("| 目录 | 内容 | 用途 | 命名方式 |")
A("|---|---|---|---|")
A("| `reference/` | 66 个 PDF（600.6 MB），按主题分 7 个目录 | 人工阅读、按主题找材料 | `年份-期刊-标题.pdf` 或 `作者 - 年份 - 标题.pdf` |")
A("| `City_Contest/ref/` | 50 个文件（168 MB），含 2 份 Europe PMC 全文 XML | 机器索引、按序号回溯报告 | `序号 标题.pdf`，与 `City_Contest/文献调研.xlsx` 的序号一一对应 |")
A("")
A("**所在地标记**：【新】只在 `reference/`；【旧】只在 `City_Contest/ref/`；【双】两处都有重复拷贝。")
A("")
A("配套文件：")
A("- `City_Contest/文献调研.xlsx` —— 全部 149 条的题录、DOI、核验状态（权威源）")
A("- `City_Contest/文献调研报告.md` —— 调研结论与分类综述")
A("- `City_Contest/ref/MANIFEST.csv` —— 机器可读清单（含来源 URL、许可、页数）")
A("- `reference/COVERAGE.md` —— 本次补包的覆盖分析与遗留问题")
A("- `文献清单索引.md` —— 本文件")
A("")

A("## 2. 已获得全文（%d 条）\n" % len(got))
A("> 按文献类型分组，组内按调研序号排列。⚠扫描件 = 无文字层，需 OCR 后才能检索。\n")
d, other = group(got)
for t in ORDER:
    if t not in d:
        continue
    A("### %s（%d）\n" % (t, len(d[t])))
    L.extend(tbl(sorted(d[t], key=lambda x: x["i"])))
    A("")
if other:
    A("### 其他（%d）\n" % len(other))
    L.extend(tbl(sorted(other, key=lambda x: x["i"])))
    A("")

A("## 3. 未获得清单（%d 条）\n" % len(miss))
A("| 原因 | 条数 | 含义 |")
A("|---|---|---|")
A("| 付费墙 | 29 | 出版商要求订阅，无公开版本 |")
A("| 开放获取但站点封锁 | 17 | 文章本身免费，但出版商/机构库拒绝了本机出口 IP |")
A("| 未找到开放副本 | 1 | 中文期刊《材料导报》，官网未提供公开 PDF |")
A("| 非论文条目 | 21 | 规范 7、数据集 7、开源软件 7，本身不是论文形态 |")
A("")
A("> 下面按序号列出。前四类合计 47 篇论文，换到能正常访问出版商的网络后可补下其中 17 篇。\n")
A("| 序号 | 类别 | 标题 | DOI | 原因 |")
A("|---|---|---|---|---|")
for x in sorted(miss, key=lambda x: x["i"]):
    A("| %d | %s | %s | %s | %s |" % (
        x["i"], x["type"], x["title"], x["doi"] or "-",
        (x["old_note"] or "未获得").replace("|", "/")[:60]))
A("")

A("## 4. `reference/` 中未对应调研条目的文件\n")
A("| 文件 | 说明 |")
A("|---|---|")
for rel, note in [
    ("背景知识/2025年交通运输行业发展统计公报.pdf",
     "**2025 年**公报（557.89 万公里）。调研记录 50 引用的是 **2024 年**公报（549.04 万公里），年份不同，见注意事项 1"),
    ("规范标准/HM-40-G3_TableOfContents.pdf", "AASHTO HM-40 第 40 版第三组**目录**，不含标准正文"),
    ("规范标准/HM-41-E1.pdf", "AASHTO HM-41 第 41 版**勘误清单**，不含标准正文"),
    ("背景知识/2022materials-The Structure of Bitumen Conceptual Models and Experimental Evidences.pdf", "与 2 号条目重复（MD5 相同）"),
    ("规范标准/《公路沥青路面养护技术规范》（JTG 5142—2019）.pdf", "与 `reference/背景知识/` 下的同名文件重复"),
    ("规范标准/公路工程沥青及沥青混合料试验规程.pdf", "与 `reference/背景知识/` 下的同名文件重复"),
    ("推荐算法/Zhong 等 - 2024 - A Comprehensive Survey on Automatic Knowledge Graph Construction-1.pdf", "与同目录无 `-1` 后缀的文件重复"),
]:
    A("| `reference/%s` | %s |" % (rel, note))
A("")

A("## 5. 使用注意事项\n")
A("### 1) 全国公路里程：两个数字都对，看年份\n")
A("企业需求 PDF 写「2025 年 557.89 万公里」没有错；《文献调研报告》§5.1 依据 **2024 年**公报"
  "把它改成 549.04 万公里，是按 2024 年口径纠正的。**引用时须与年份匹配**：\n")
A("| 年末 | 公路里程 | 比上年末 |")
A("|---|---|---|")
A("| 2023 | 543.69 万公里 | — |")
A("| 2024 | **549.04 万公里** | +5.35 |")
A("| 2025 | **557.89 万公里** | +8.85（见 `reference/背景知识/2025年交通运输行业发展统计公报.pdf`） |")
A("")
A("### 2) %d 份中文规范/公报是扫描件，检索不到\n" % scanned_total)
A("`reference/` 的 66 个 PDF 中有 **%d 份**用 `pdftotext` 抽出 0 字符（纯图像、无文字层），"
  "直接进向量库等于检索盲区，必须先 OCR：\n" % scanned_total)
A("| 文件 | 页数 |")
A("|---|---|")
for rel in sorted(k for k, v in scan_cache.items() if v):
    try:
        pg = subprocess.run(["pdfinfo", os.path.join(ROOT, REF, rel)],
                            capture_output=True, timeout=60).stdout.decode("utf-8", "ignore")
        import re as _re
        m = _re.search(r"Pages:\s+(\d+)", pg)
        pages = m.group(1) if m else "?"
    except Exception:
        pages = "?"
    A("| `reference/%s` | %s |" % (rel, pages))
A("")
A("唯一带文字层的中文文献是 `reference/背景知识/中国沥青路面气候影响分区方案.pdf`（3.6 万字符）。")
A("")
A("### 3) 付费墙与站点封锁是两类问题\n")
A("未获得的 47 篇论文里：\n")
A("- **29 篇是真付费墙**（Elsevier / T&F / IEEE / ASCE / Springer 订阅制），需机构订阅或作者索取；")
A("- **17 篇本身开放获取、只是出版商封了本机 IP**（ScienceDirect 为主，另有 Hindawi、RSC、De Gruyter）；")
A("- **1 篇**是中文期刊《材料导报》，官网未提供公开 PDF。")
A("")
A("换到能正常访问出版商的网络（校园网 / VPN）后，中间那 17 篇可直接补下，"
  "清单见 `reference/COVERAGE.md` 的 blocked 部分。")
A("")

out = os.path.join(ROOT, "文献清单索引.md")
open(out, "w", encoding="utf-8").write("\n".join(L) + "\n")
print("wrote", out)
print("got %d, miss %d, scanned %d" % (len(got), len(miss), sum(1 for x in got if x.get("scan"))))
