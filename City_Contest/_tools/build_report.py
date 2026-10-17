"""Append the auto-generated appendices to 文献调研报告.md, using the same verified rows
as the workbook so the two deliverables can never disagree."""

import re

from build_xlsx import TYPE_ORDER, build_rows

REPORT = r"D:\code\City_Contest\文献调研报告.md"


def footnote(r):
    bits = []
    if r["核验方式"]:
        bits.append(r["核验方式"])
    if r["引用率"]:
        bits.append("被引 %s" % r["引用率"])
    if r["备注"]:
        bits.append(r["备注"][:150])
    return "　".join(bits)


def main():
    rows, review, metrics, links, second = build_rows()

    with open(REPORT, encoding="utf-8") as f:
        body = f.read()
    body = body.split("\n## 附录")[0].rstrip()
    # collapse the horizontal rules the hand-written body left before the appendix,
    # so exactly one separator precedes the generated appendices
    body = re.sub(r"(?:\s*\n\s*-{3,})+\s*$", "", body).rstrip()
    body = body.replace("<!--N_MAIN-->", str(len(rows))).replace("<!--N_REVIEW-->", str(len(review)))

    out = [body, "", "---", "", "## 附录 A　经核验文献总表（%d 条）" % len(rows), "",
           "> 完整字段（任务中文描述、代码链接、数据集、备注、核验方式）见 `文献调研.xlsx`。",
           "> 本附录编号与工作簿「全部文献」表「序号」列**一一对应**。", ""]

    n = 0
    emitted = []
    for task in ["任务1 背景知识", "任务2 推荐算法", "任务3 评估方法"]:
        grp = [r for r in rows if r["对应任务（分工表）"] == task]
        if not grp:
            continue
        out.append("### %s（%d 条）" % (task.split(" ", 1)[1], len(grp)))
        out.append("")
        for typ in TYPE_ORDER:
            sub = [r for r in grp if r["类型"] == typ]
            if not sub:
                continue
            out.append("#### %s（%d 条）" % (typ, len(sub)))
            out.append("")
            for r in sub:
                n += 1
                emitted.append(r["论文标题"])
                out.append("%d. **%s**　*%s*, %s.　DOI: %s" % (
                    n, r["论文标题"] or "(无题名)", r["期刊/会议名"] or "—",
                    r["发表时间"] or "—", r["DOI"] or "（无 DOI）"))
                out.append("   - %s" % (r["任务（中文）"] or "")[:190])
                out.append("   - %s" % footnote(r))
            out.append("")

    # the appendix claims one-to-one numbering with the workbook's 序号 column; verify it
    expected = [r["论文标题"] for r in rows]
    if emitted != expected:
        raise SystemExit("FATAL: appendix order diverges from workbook row order")
    print("order check: appendix numbering matches workbook 序号 (1..%d)" % len(rows))

    out += ["", "## 附录 B　待人工复核（%d 条，不计入正表）" % len(review), ""]
    if not review:
        out.append("无。")
    for i, r in enumerate(review, 1):
        raw = r.get("_cr_title") or r.get("论文标题", "")
        out.append("%d. **%s**　*%s*, %s　DOI: %s" % (
            i, raw, r.get("_cr_container") or r.get("期刊/会议名", "—"),
            r.get("_cr_year") or r.get("发表时间", "—"), r.get("DOI") or "（无 DOI）"))
        out.append("   - 失败原因：%s / %s" % (r.get("_verify_status"), r.get("_verify_note") or "—"))
        out.append("   - 来源文件：%s" % r.get("_source_file", ""))
        if r.get("备注"):
            out.append("   - 备注：%s" % r["备注"][:200])
        out.append("")
    out += ["", "## 附录 C　核验可复现性说明", "",
            "本报告的题录不是人工誊写的，而是由脚本经官方接口回填：", "",
            "1. **主途径**：`https://api.crossref.org/works/<DOI>` —— 标题、作者、期刊、年份、被引次数取自出版商向 Crossref 注册的元数据。",
            "2. **补充途径**：`https://doi.org/<DOI>` 落地页标题、`http://export.arxiv.org/api/query`（arXiv 官方 API）、记录中登记的来源页面。",
            "3. **链接实测**：对所有代码/数据集链接实际发起 HTTP 请求，状态码写入工作簿「链接可用性核查」表。",
            "4. **未通过者隔离**：三条途径均未命中且无有效标识的条目，不进入正表。", "",
            "本次运行结果：正表 %d 条，待复核 %d 条，实测链接 %d 个（其中 %d 个返回 200）。"
            % (len(rows), len(review), len(links),
               sum(1 for v in links.values() if v.get("status") == 200)), "",
            "> 说明：本次核验中，`api.crossref.org` 与 `doi.org` 在后期出现明显的限流"
            "（SSL 握手超时、HTTP 403），导致少数 DOI 的二次复核未能完成。这类条目已单独标注，"
            "其失败原因是网络受限而**不是 404 未收录**，请人工打开 `doi.org` 快速确认。", ""]

    with open(REPORT, "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    print("report written:", REPORT)
    print("appendix A entries:", n, "| review entries:", len(review))


if __name__ == "__main__":
    main()
