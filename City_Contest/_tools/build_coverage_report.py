#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Emit reference/COVERAGE.md : how far reference.zip closes the 149-entry survey."""
import json, os
from collections import Counter, defaultdict

ROOT = "/bigdisk/lhg/road_rec"
REF = os.path.join(ROOT, "reference")
COV = os.path.join(ROOT, "City_Contest", "_lit", "coverage_vs_reference.json")
OLD_MAN = os.path.join(ROOT, "City_Contest", "ref", "MANIFEST.json")

cov = json.load(open(COV, encoding="utf-8"))
oldman = {r["序号"]: r for r in json.load(open(OLD_MAN, encoding="utf-8"))}

new = [e for e in cov if e["in_pkg"] and not e["in_old"]]
both = [e for e in cov if e["in_pkg"] and e["in_old"]]
miss = [e for e in cov if not e["in_pkg"] and not e["in_old"]]

NONPAPER = {"规范标准": "规范/标准", "数据集": "数据集", "开源代码": "开源软件/工具"}


def cat(e):
    t = e["type"]
    if t in NONPAPER:
        return NONPAPER[t]
    return "论文"


bycat = Counter(cat(e) for e in miss)

L = []
L.append("# reference.zip 对文献调研的补全情况\n")
L.append("> 对照基准：`City_Contest/_lit/verified.json` 全部 **149** 条调研条目")
L.append("> 比对方法：`pdftotext` 抽取每份 PDF 的 DOI 做精确匹配；无 DOI 的用规范编号"
         "（JTG/AASHTO/ASTM/NCHRP）与标题包含关系匹配")
L.append("> 生成日期：2026-10-16\n")
L.append("## 一、结论：**没有补全**，覆盖率为 81/149（54.3%）\n")
L.append("| 覆盖来源 | 数量 |")
L.append("|---|---|")
L.append("| 本次 reference.zip 带来的**新增** | **%d** |" % len(new))
L.append("| 上次自动抓取（`City_Contest/ref/`）已有 | %d |" % sum(1 for e in cov if e["in_old"]))
L.append("| 两者都有（重复投入） | %d |" % len(both))
L.append("| **合计已覆盖** | **%d / 149** |" % sum(1 for e in cov if e["in_pkg"] or e["in_old"]))
L.append("| **仍未获得** | **%d** |" % len(miss))
L.append("")
L.append("reference.zip 解压后为 **7 个分类目录 / 66 个 PDF（600.7 MB）**，其中 **3 组文件完全重复**"
         "（MD5 相同），去重后 **63 份唯一内容**。67 个文件全部通过 CRC 校验。\n")
L.append("## 二、本次新增覆盖的 %d 条\n" % len(new))
L.append("| 序号 | 匹配方式 | 分类 | 文件 | 标题 |")
L.append("|---|---|---|---|---|")
how = {"doi": "DOI", "code": "规范编号", "contains": "标题包含", "fuzzy": "标题相似"}
for e in sorted(new, key=lambda x: x["序号"]):
    L.append("| %d | %s | %s | %s | %s |" % (
        e["序号"], how.get(e.get("pkg_how"), e.get("pkg_how") or "-"),
        e["pkg_file"].split("/")[0], os.path.basename(e["pkg_file"])[:46], e["title"][:44]))
L.append("")
L.append("## 三、仍未获得的 %d 条\n" % len(miss))
L.append("| 类别 | 数量 |")
L.append("|---|---|")
for k, v in sorted(bycat.items(), key=lambda x: -x[1]):
    L.append("| %s | %d |" % (k, v))
L.append("")
L.append("| 序号 | 类别 | DOI | 标题 |")
L.append("|---|---|---|---|")
for e in sorted(miss, key=lambda x: x["序号"]):
    L.append("| %d | %s | %s | %s |" % (
        e["序号"], cat(e), e["doi"] or "-", e["title"][:56]))
L.append("")
L.append("## 四、连带发现的三个问题\n")
L.append("### 1. 公报年份对不上，而且它推翻了调研报告的一处“事实性更正”\n")
L.append("记录 50 要的是《**2024年**交通运输行业发展统计公报》（549.04 万公里），"
         "包里给的却是《**2025年**交通运输行业发展统计公报》。")
L.append("我把这份扫描件首页渲染出来读过，原文是：\n")
L.append("> 年末全国公路里程 **557.89 万公里**，比上年末增加 8.85 万公里。")
L.append("")
L.append("而《文献调研报告》§5.1 把 557.89 万公里判为“数据错误”、要求改成 549.04 万公里。"
         "实际上**两个数字都对，只是年份不同**：\n")
L.append("| 年末 | 全国公路里程 | 比上年末增加 | 出处 |")
L.append("|---|---|---|---|")
L.append("| 2023 | 543.69 万公里 | — | 由 2024 年公报反推 |")
L.append("| 2024 | **549.04 万公里** | +5.35 | 2024 年公报 |")
L.append("| 2025 | **557.89 万公里** | +8.85 | 2025 年公报（本次交付） |")
L.append("")
L.append("链条自洽：549.04 − 5.35 = 543.69，557.89 − 8.85 = 549.04。"
         "企业需求 PDF 说的“2025 年全国公路总里程达 557.89 万公里”**并没有写错**——"
         "它引用的就是 2025 年口径。若按调研报告的建议改成 549.04，反而会错。\n")
L.append("### 2. 交付的中文规范几乎全是**扫描件**（无文字层）\n")
L.append("以下文件 `pdftotext` 抽出 **0 个字符**，直接入向量库/RAG 前必须先 OCR：\n")
L.append("| 文件 | 页数 | 可提取字符 |")
L.append("|---|---|---|")
for r in [
    ("背景知识/公路沥青路面设计规范（JTG D50—2017）.pdf", 103),
    ("背景知识/公路技术状况评定标准（JTG 5210—2018）.pdf", 56),
    ("背景知识/《公路沥青路面养护技术规范》（JTG 5142—2019）.pdf", 106),
    ("背景知识/公路工程沥青及沥青混合料试验规程.pdf", 619),
    ("背景知识/2025年交通运输行业发展统计公报.pdf", 12),
    ("规范标准/FDIS_MD5_12168_公路沥青路面设计规范.pdf", 106),
    ("规范标准/FDIS_MD5_12221_公路沥青路面施工技术规范.pdf", 186),
    ("规范标准/FDIS_MD5_12258_公路技术状况评定标准.pdf", 59),
    ("规范标准/FDIS_MD5_12266_公路沥青路面养护设计规范.pdf", 70),
]:
    L.append("| %s | %d | **0** |" % (r[0], r[1]))
L.append("")
L.append("唯一有文字层的中文文献是 `背景知识/中国沥青路面气候影响分区方案.pdf`（3.6 万字符），"
         "即记录 20 那篇《交通运输工程学报》2007 年论文。\n")
L.append("### 3. AASHTO 规范只覆盖到目录与勘误，不是正文\n")
L.append("`规范标准/HM-40-G3_TableOfContents.pdf` 是 AASHTO HM-40 第 40 版 **第三组目录**，"
         "`规范标准/HM-41-E1.pdf` 是 HM-41 第 41 版的 **勘误清单**。"
         "两者都不含记录 51 要的 M 320 / T 283 / T 324 / R 35 标准正文，"
         "因此记录 51 仍算未覆盖。\n")
L.append("## 五、两份材料怎么合\n")
L.append("- `reference/` 按主题分了 7 个目录，可读性好；`City_Contest/ref/` 按调研序号命名，"
         "可追溯到报告附录 A。二者**有 %d 条重叠**，同一篇论文存在两份拷贝。" % len(both))
L.append("- 建议以 `reference/` 为人工阅读目录、`City_Contest/ref/` 为机器索引目录，"
         "不要直接物理合并，否则会丢序号映射。")
L.append("- 若要做成单一全集，我可以生成一个去重后的合并目录 + 统一清单。\n")

open(os.path.join(REF, "COVERAGE.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print("wrote", os.path.join(REF, "COVERAGE.md"))
print("covered %d/%d, new %d, missing %d %s" % (
    sum(1 for e in cov if e["in_pkg"] or e["in_old"]), len(cov), len(new), len(miss), dict(bycat)))
