"""Compact digest of all agent findings, for writing the survey report."""

import glob
import json
import os

RAW = r"D:\code\City_Contest\_lit\raw"
OUT = r"D:\code\City_Contest\_lit\digest.md"

order = ["背景知识", "规范标准", "综述", "推荐算法", "评估方法", "数据集", "开源代码"]


def main():
    recs = []
    for f in sorted(glob.glob(os.path.join(RAW, "*.json"))):
        with open(f, encoding="utf-8-sig") as fh:
            try:
                data = json.loads(fh.read())
            except Exception:
                continue
        for r in data if isinstance(data, list) else []:
            r["_f"] = os.path.basename(f)
            recs.append(r)

    seen, uniq = set(), []
    for r in recs:
        k = (r.get("DOI") or "").lower().strip() or (r.get("论文标题") or "")[:90]
        if k in seen:
            continue
        seen.add(k)
        uniq.append(r)

    lines = ["# 原始检索结果速览（核验前）", "", "共 %d 条（去重后）" % len(uniq), ""]
    for t in order:
        grp = [r for r in uniq if (r.get("类型") or "").strip() == t]
        if not grp:
            continue
        lines.append("## %s（%d 条）" % (t, len(grp)))
        lines.append("")
        for r in grp:
            lines.append("- **%s** (%s, %s) DOI:%s" % (
                (r.get("论文标题") or "").strip()[:110],
                (r.get("发表时间") or "").strip(),
                (r.get("期刊/会议名") or "").strip()[:44],
                (r.get("DOI") or "").strip()))
            lines.append("  - 任务: %s" % (r.get("任务（中文）") or "").strip()[:150])
            extra = []
            if (r.get("有无代码") or "") in ("有", "部分"):
                extra.append("代码:%s" % (r.get("代码链接") or "")[:90])
            if (r.get("数据集下载地址") or ""):
                extra.append("数据:%s" % (r.get("数据集下载地址") or "")[:90])
            if extra:
                lines.append("  - " + " | ".join(extra))
            if (r.get("备注") or "").strip():
                lines.append("  - 备注: %s" % (r.get("备注") or "").strip()[:110])
        lines.append("")

    other = [r for r in uniq if (r.get("类型") or "").strip() not in order]
    if other:
        lines.append("## 其他类型（%d 条）" % len(other))
        lines.append("")
        for r in other:
            lines.append("- **%s** [类型:%s] DOI:%s" % (
                (r.get("论文标题") or "").strip()[:110], r.get("类型"),
                (r.get("DOI") or "").strip()))
        lines.append("")

    with open(OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print("wrote", OUT, len(uniq), "records")


if __name__ == "__main__":
    main()
