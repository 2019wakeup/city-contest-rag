"""Build 文献调研.xlsx from the verified reference set.

- Keeps the original 17-column schema, plus 对应任务 and 核验方式.
- Bibliographic fields come from Crossref; agent annotations fill the domain columns.
- Every row records HOW it was verified, and rows that could not be verified are not
  padded into the main table.
"""

import json
import os
import re
from collections import Counter
from datetime import date

import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

LIT = r"D:\code\City_Contest\_lit"
XLSX = r"D:\code\City_Contest\文献调研.xlsx"

HEADERS = ["序号", "对应任务（分工表）", "类型", "有无代码", "论文标题", "作者", "期刊/会议名",
           "JCR/CCF", "IF", "发表时间", "引用率", "任务（中文）", "DOI", "代码链接",
           "数据模态", "所用数据集", "数据集下载地址", "备注", "核验方式"]
WIDTHS = [6, 14, 13, 10, 60, 30, 30, 13, 8, 10, 10, 48, 34, 42, 12, 22, 44, 46, 30]

CONFIRMED = {"doi_confirmed": "Crossref 注册库按 DOI 回填",
             "doi_found_by_title": "Crossref 标题匹配回填",
             "title_confirmed_no_doi": "Crossref 标题近似匹配"}

PROMOTED = {"doi_resolves": "doi.org 解析落地页确认",
            "arxiv_confirmed": "arXiv 官方 API 确认",
            "source_url_confirmed": "来源 URL 页面确认",
            "crossref_retry": "Crossref 重查确认"}

DOI_OK = re.compile(r"^10\.\d{4,9}/\S+$")

# single source of truth for type ordering, so the workbook and the report appendix
# number their rows identically
TYPE_ORDER = ["背景知识", "规范标准", "综述", "推荐算法", "材料-性能关系",
              "评估方法", "数据集", "开源代码", "其他"]
TASK_ORDER = {"任务1 背景知识": 0, "任务2 推荐算法": 1, "任务3 评估方法": 2}


def sort_index(rec):
    t = rec["类型"]
    return (TASK_ORDER.get(rec["对应任务（分工表）"], 9),
            TYPE_ORDER.index(t) if t in TYPE_ORDER else 99,
            rec["期刊/会议名"].lower(),
            rec["论文标题"])

TASK_BY_SOURCE = {
    "bg_asphalt_material": "任务1 背景知识",
    "bg_pavement_condition": "任务1 背景知识",
    "bg_spec_standard_review": "任务1 背景知识",
    "rec_material_selection_algo": "任务2 推荐算法",
    "rec_mix_design_knowledge": "任务2 推荐算法",
    "eval_perf_prediction_models": "任务3 评估方法",
    "eval_inverse_design_optimization": "任务3 评估方法",
    "eval_datasets_opensource": "任务3 评估方法",
    "00_seed_team_downloaded": "任务3 评估方法",
}

STANDARD_HINT = re.compile(r"JTG|AASHTO|ASTM|NCHRP|统计公报|试验规程|技术规范|设计规范|评定标准", re.I)

HDR_FILL = PatternFill("solid", fgColor="1F4E79")
HDR_FONT = Font(bold=True, color="FFFFFF", size=10.5)
ALT_FILL = PatternFill("solid", fgColor="F2F7FB")
WARN_FILL = PatternFill("solid", fgColor="FFF2CC")
THIN = Side(style="thin", color="BFBFBF")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)


def load_json(name, default):
    p = os.path.join(LIT, name)
    if not os.path.exists(p):
        return default
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def src_key(rec):
    return re.sub(r"\.json.*$", "", rec.get("_source_file", "")).split(" + ")[0]


def norm_type(rec):
    src = rec.get("_source_file", "")
    t = (rec.get("类型") or "").strip()
    title = rec.get("论文标题", "")
    if "eval_datasets_opensource" in src:
        return "数据集" if ("数据集" in t or "Repository" in title) else "开源代码"
    if "bg_spec_standard_review" in src:
        return "规范标准" if (STANDARD_HINT.search(title) or "标准" in t or "公报" in title) else "综述"
    if "bg_" in src:
        return t or "背景知识"
    if "rec_mix_design_knowledge" in src:
        return "材料-性能关系"
    if "rec_material_selection_algo" in src:
        return "推荐算法"
    if "eval_" in src:
        return "评估方法"
    return t or "其他"


def arxiv_id(doi, blob):
    m = re.match(r"^arxiv[:\s]*(\d{4}\.\d{4,5})", doi or "", re.I)
    if m:
        return m.group(1)
    m = re.search(r"arxiv\.org/abs/(\d{4}\.\d{4,5})", blob or "", re.I)
    return m.group(1) if m else ""


def resolve(rec, metrics, second, links):
    """Decide whether a record is verified, how, and assemble its output row."""
    key = rec.get("DOI") or rec.get("论文标题", "")[:80]
    sc = second.get(key, {})
    status = rec.get("_verify_status", "unverified")
    typ = norm_type(rec)
    src = src_key(rec)
    notes, method = [], ""

    if status in CONFIRMED:
        method = CONFIRMED[status]
    elif sc.get("status") in PROMOTED:
        method = PROMOTED[sc["status"]]
        if sc.get("note"):
            notes.append(sc["note"])
    elif typ == "规范标准":
        method = "标准/官方文件（无 DOI，来源 URL 已登记）"
    else:
        code = rec.get("代码链接", "")
        data = rec.get("数据集下载地址", "")
        ok_code = code and links.get(code, {}).get("status") == 200
        ok_data = data and links.get(data, {}).get("status") == 200
        if typ in ("数据集", "开源代码") and (ok_code or ok_data):
            method = "链接实测 HTTP 200 可达"
        else:
            return None

    venue = (rec.get("_cr_container") or rec.get("期刊/会议名") or "").strip()
    jm = metrics.get(venue.lower(), {})

    doi = rec.get("DOI", "")
    aid = arxiv_id(doi, " ".join([rec.get("备注", ""), rec.get("论文标题", ""), rec.get("代码链接", "")]))
    if re.match(r"^arxiv", doi, re.I):
        doi = ("10.48550/arXiv." + aid) if (aid and sc.get("status") == "arxiv_confirmed") else ""
        if aid:
            notes.append("预印本 arXiv:%s（https://arxiv.org/abs/%s）" % (aid, aid))

    if method == "Crossref 重查确认" and sc.get("note"):
        method += "（标题待核）"

    code = rec.get("代码链接", "")
    lc = links.get(code, {}) if code else {}
    if code and lc.get("status") != 200:
        notes.append("代码链接本次实测未返回 200，需人工打开确认")

    data_url = rec.get("数据集下载地址", "")
    if data_url and links.get(data_url, {}).get("status") not in (200, None):
        notes.append("数据链接本次实测返回 %s，需人工确认" % links[data_url].get("status"))

    remark = (rec.get("备注") or "").strip()
    if notes:
        remark = ("[" + "；".join(notes) + "] " + remark).strip()

    return {
        "对应任务（分工表）": TASK_BY_SOURCE.get(src, "任务3 评估方法"),
        "类型": typ,
        "有无代码": rec.get("有无代码", ""),
        "论文标题": rec.get("_cr_title") or rec.get("论文标题", ""),
        "作者": rec.get("_cr_authors") or rec.get("作者", ""),
        "期刊/会议名": venue,
        "JCR/CCF": (jm.get("quartile") or rec.get("JCR/CCF", "")).strip(),
        "IF": str(jm.get("if", "") or "").strip(),
        "发表时间": rec.get("_cr_year") or rec.get("发表时间", ""),
        "引用率": rec.get("_citations", ""),
        "任务（中文）": rec.get("任务（中文）", ""),
        "DOI": doi,
        "代码链接": code,
        "数据模态": rec.get("数据模态", ""),
        "所用数据集": rec.get("所用数据集", ""),
        "数据集下载地址": data_url,
        "备注": remark,
        "核验方式": method,
    }


def build_rows():
    records = load_json("verified.json", {"records": []})["records"]
    metrics = {k.strip().lower(): v for k, v in load_json("journal_metrics.json", {}).items()}
    second = load_json("second_chance.json", {})
    links = load_json("link_check.json", {})

    rows, review = [], []
    for rec in records:
        row = resolve(rec, metrics, second, links)
        (rows if row else review).append(row or rec)

    rows.sort(key=sort_index)
    return rows, review, metrics, links, second


def style_sheet(ws, ncols, nrows, warn_from=None):
    for i, w in enumerate(WIDTHS[:ncols], 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    for c in range(1, ncols + 1):
        cell = ws.cell(row=1, column=c)
        cell.fill, cell.font = HDR_FILL, HDR_FONT
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = BORDER
    ws.row_dimensions[1].height = 32
    for r in range(2, max(nrows, 1) + 1):
        for c in range(1, ncols + 1):
            cell = ws.cell(row=r, column=c)
            cell.alignment = Alignment(vertical="top", wrap_text=True)
            cell.border = BORDER
            cell.font = Font(size=10)
            if warn_from is not None and r >= warn_from:
                cell.fill = WARN_FILL
            elif r % 2 == 0:
                cell.fill = ALT_FILL
        ws.row_dimensions[r].height = 64
    ws.freeze_panes = "E2"
    ws.auto_filter.ref = "A1:%s%d" % (get_column_letter(ncols), max(nrows, 1))


def write_rows(ws, rows):
    for i, rec in enumerate(rows, 1):
        ws.append([i] + [rec.get(h, "") for h in HEADERS[1:]])
    return len(rows) + 1


def main():
    rows, review, metrics, links, second = build_rows()
    wb = openpyxl.Workbook()

    ws = wb.active
    ws.title = "说明"
    ws.column_dimensions["A"].width = 26
    ws.column_dimensions["B"].width = 122
    readme = README + [
        ("", ""),
        ("【本次核验统计】", ""),
        ("进入主表", "%d 条" % len(rows)),
        ("未能核验", "%d 条（见「待人工复核」工作表，不计入主表）" % len(review)),
        ("含代码", "%d 条" % sum(1 for r in rows if r["有无代码"] in ("有", "部分"))),
        ("含数据集链接", "%d 条" % sum(1 for r in rows if r["数据集下载地址"])),
        ("链接实测", "%d 个链接，其中 %d 个实测 HTTP 200"
         % (len(links), sum(1 for v in links.values() if v.get("status") == 200))),
    ]
    for i, (a, b) in enumerate(readme, 1):
        ws.cell(row=i, column=1, value=a).font = Font(
            bold=True, size=10.5, color="C00000" if a.startswith("【") else "1F4E79")
        ws.cell(row=i, column=2, value=b).font = Font(size=10.5)
        for c in (1, 2):
            ws.cell(row=i, column=c).alignment = Alignment(vertical="top", wrap_text=True)
    ws.cell(row=1, column=1).font = Font(bold=True, size=15, color="1F4E79")
    ws.row_dimensions[1].height = 28

    for title, grp in [
        ("全部文献", rows),
        ("任务1-背景知识", [r for r in rows if r["对应任务（分工表）"] == "任务1 背景知识"]),
        ("任务2-推荐算法", [r for r in rows if r["对应任务（分工表）"] == "任务2 推荐算法"]),
        ("任务3-评估方法与代码", [r for r in rows if r["对应任务（分工表）"] == "任务3 评估方法"]),
    ]:
        s = wb.create_sheet(title)
        s.append(HEADERS)
        style_sheet(s, len(HEADERS), write_rows(s, grp))

    ds = wb.create_sheet("数据集与开源工具")
    ds.append(HEADERS)
    drows = [r for r in rows if r["类型"] in ("数据集", "开源代码") or r["数据集下载地址"] or r["代码链接"]]
    style_sheet(ds, len(HEADERS), write_rows(ds, drows))

    ms = wb.create_sheet("期刊指标来源")
    mh = ["序号", "期刊/会议名", "IF", "IF年度", "来源类型", "来源URL", "备注"]
    ms.append(mh)
    for i, (k, v) in enumerate(sorted(metrics.items()), 1):
        ms.append([i, k, v.get("if", ""), v.get("if_year", ""), v.get("source_type", ""),
                   v.get("source", ""), v.get("note", "")])
    for col, w in zip("ABCDEFG", [6, 46, 8, 10, 16, 62, 44]):
        ms.column_dimensions[col].width = w
    for c in range(1, len(mh) + 1):
        cell = ms.cell(row=1, column=c)
        cell.fill, cell.font = HDR_FILL, HDR_FONT
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    for r in range(2, ms.max_row + 1):
        for c in range(1, len(mh) + 1):
            ms.cell(row=r, column=c).alignment = Alignment(vertical="top", wrap_text=True)
            ms.cell(row=r, column=c).font = Font(size=10)
    ms.freeze_panes = "A2"

    ls = wb.create_sheet("链接可用性核查")
    lh = ["序号", "链接", "类型", "实测HTTP状态", "GitHub星标", "最近推送", "对应文献"]
    ls.append(lh)
    for i, (u, v) in enumerate(sorted(links.items()), 1):
        ls.append([i, u, v.get("kind", ""), v.get("status", ""), v.get("stars", ""),
                   v.get("pushed_at", ""), "; ".join(x[1] for x in v.get("refs", []))[:120]])
    for col, w in zip("ABCDEFG", [6, 62, 10, 14, 12, 12, 58]):
        ls.column_dimensions[col].width = w
    for c in range(1, len(lh) + 1):
        cell = ls.cell(row=1, column=c)
        cell.fill, cell.font = HDR_FILL, HDR_FONT
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    for r in range(2, ls.max_row + 1):
        for c in range(1, len(lh) + 1):
            ls.cell(row=r, column=c).alignment = Alignment(vertical="top", wrap_text=True)
            ls.cell(row=r, column=c).font = Font(size=10)
    ls.freeze_panes = "A2"

    rv = wb.create_sheet("待人工复核")
    rv.append(HEADERS)
    rrows = []
    for r in review:
        has_doi = bool(DOI_OK.match(r.get("DOI", "") or ""))
        note = ("[未能核验：%s%s] " % (
            "本机网络受限（SSL 超时/doi.org 403），注册库复核未完成，非 404 未收录，DOI 来自检索阶段核对，请打开 doi.org 确认"
            if has_doi else
            "无 DOI，且注册库、arXiv、来源页面均未能确认",
            "")) + (r.get("备注") or "")
        rrows.append({
            "对应任务（分工表）": TASK_BY_SOURCE.get(src_key(r), ""),
            "类型": r.get("类型", ""), "有无代码": r.get("有无代码", ""),
            "论文标题": r.get("_cr_title") or r.get("论文标题", ""),
            "作者": r.get("_cr_authors") or r.get("作者", ""),
            "期刊/会议名": r.get("_cr_container") or r.get("期刊/会议名", ""),
            "JCR/CCF": r.get("JCR/CCF", ""), "IF": r.get("IF", ""),
            "发表时间": r.get("_cr_year") or r.get("发表时间", ""),
            "任务（中文）": r.get("任务（中文）", ""), "DOI": r.get("DOI", ""),
            "代码链接": r.get("代码链接", ""), "数据模态": r.get("数据模态", ""),
            "所用数据集": r.get("所用数据集", ""), "数据集下载地址": r.get("数据集下载地址", ""),
            "备注": note, "核验方式": "未通过（待人工复核）",
        })
    style_sheet(rv, len(HEADERS), write_rows(rv, rrows))

    wb.save(XLSX)
    print("saved", XLSX)
    print("main rows:", len(rows), "| review rows:", len(review))
    print("by task:", dict(Counter(r["对应任务（分工表）"] for r in rows)))
    print("by type:", dict(Counter(r["类型"] for r in rows)))
    print("by method:", dict(Counter(r["核验方式"].split("（")[0] for r in rows)))
    print("with code:", sum(1 for r in rows if r["有无代码"] in ("有", "部分")))
    print("with dataset url:", sum(1 for r in rows if r["数据集下载地址"]))


README = [
    ("文献调研表 · 使用说明", ""),
    ("适用赛题", "中国研究生智慧城市技术与创意设计大赛 · 企业揭榜赛道 · 课题一：数智选材——AI 驱动的道路养护决策与沥青材料方案智能推荐系统"),
    ("整理日期", str(date.today())),
    ("对应分工", "《20261012-分工表》第 1/2/3 项文献调研任务（DDL 10.13–10.14）"),
    ("", ""),
    ("【本表如何保证文献真实】", ""),
    ("1. 注册库回填", "每条文献的标题、作者、期刊、年份均由 Crossref 官方 API（api.crossref.org）按 DOI 反查后自动回填，不采用人工记忆值。"),
    ("2. 逐条标注核验方式", "「核验方式」列写明每一条是通过哪种途径确认的，可逐条审计。"),
    ("3. 未核实不充数", "未能通过任何途径确认的条目一律不进入主表，另列于「待人工复核」并写明失败原因。"),
    ("4. 链接实测", "「代码链接」「数据集下载地址」由程序实际发起 HTTP 请求核验，结果见「链接可用性核查」表。"),
    ("5. 引用率口径", "「引用率」为 Crossref is-referenced-by-count，与 Google Scholar 数值不同，仅供参考。"),
    ("6. 影响因子口径", "「IF」仅在我方从可访问来源实际读到数值时填入，来源见「期刊指标来源」表；均为第三方汇总站数据，不是 Clarivate 官方导出。"),
    ("7. 分区口径", "「JCR/CCF」为调研阶段填写的参考分区。本次未能取得可访问的 JCR 官方分区来源，请勿直接引用，投稿前须以最新 JCR/CCF 目录复核。"),
    ("8. 自行复核", "任意一条可复制 DOI 到 https://doi.org/ 打开原始页面验证。"),
    ("", ""),
    ("【工作表导航】", ""),
    ("全部文献", "经核验的全部文献汇总（主表），可按「对应任务」「类型」「核验方式」筛选。"),
    ("任务1-背景知识", "沥青组成与参数、路况病害、气候荷载、养护决策、规范标准、权威综述 → 用于文档背景写作。"),
    ("任务2-推荐算法", "场景→材料/方案推荐算法、RAG/LLM/知识图谱、MCDM、配合比设计与材料-性能定量关系 → 用于建向量数据库。"),
    ("任务3-评估方法与代码", "材料组合→性能指标评估模型、性能预测 ML、逆向设计/多目标优化、公开数据集 → 用于建模与基线复现。"),
    ("数据集与开源工具", "公开数据集与开源代码仓库清单，便于直接取用。"),
    ("期刊指标来源", "每个 IF 数值的来源页面 URL 与统计年度。"),
    ("链接可用性核查", "每个代码/数据链接的实测 HTTP 状态。"),
    ("待人工复核", "未能确认的条目及失败原因（黄色高亮），请人工判断是否保留，不计入主表。"),
    ("", ""),
    ("【新增列说明】", ""),
    ("对应任务（分工表）", "新增列，把文献映射到分工表的三类文献调研任务，便于按人分发阅读。"),
    ("核验方式", "新增列，记录该条的确认途径：Crossref 回填 / 标题匹配 / doi.org 解析 / arXiv API / 来源页确认 / 链接实测 / 标准文件。"),
    ("", ""),
    ("【重要事实更正（已核实到官方原文）】", ""),
    ("公路总里程", "《2024年交通运输行业发展统计公报》为 549.04 万公里（高速 19.07 万公里）。原《作战计划》所写 557.89 万公里与官方公报不符，建议更正。"),
    ("试验规程", "JTG E20-2011 已于 2025-10-01 被 JTG 3410-2025 替代（交通运输部公告 2025 年第 27 号）；引用试验规程请改用 JTG 3410-2025。"),
    ("技术状况评定", "JTG H20-2007 已被 JTG 5210-2018 替代；引用时请写 JTG 5210-2018。"),
]


if __name__ == "__main__":
    main()
