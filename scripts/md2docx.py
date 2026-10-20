#!/usr/bin/env python3
"""Markdown 报告章节 → Word(.docx) 转换器（中文报告排版）

用法：
  python3 scripts/md2docx.py <input.md> <output.docx> [--title 标题]

排版约定（中文报告）：
  - 一级标题：黑体 三号（16pt）加粗居中
  - 二级标题：黑体 四号（14pt）加粗，段前 12pt / 段后 6pt
  - 正文：宋体 小四（12pt），1.5 倍行距，首行缩进 2 字符
  - 页面：A4，页边距 2.54cm
  - 行内 **加粗** 转为加粗 run；"- " 列表项转为带项目符号的段落
"""
import re
import sys
from typing import Optional

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml.ns import qn
from docx.shared import Cm, Pt

BODY_FONT = '宋体'
HEADING_FONT = '黑体'
BODY_SIZE = Pt(12)
TITLE_SIZE = Pt(16)
H2_SIZE = Pt(14)


def set_eastasia(run, font: str) -> None:
    run.font.name = font
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.find(qn('w:rFonts'))
    if rfonts is None:
        rfonts = rpr.makeelement(qn('w:rFonts'), {})
        rpr.append(rfonts)
    rfonts.set(qn('w:eastAsia'), font)


def add_inline(paragraph, text: str) -> None:
    """处理 **加粗** 行内标记。"""
    for i, part in enumerate(re.split(r'\*\*(.+?)\*\*', text)):
        if not part:
            continue
        run = paragraph.add_run(part)
        run.bold = i % 2 == 1
        set_eastasia(run, BODY_FONT)
        run.font.size = BODY_SIZE


def body_paragraph(doc, text: str, indent: bool = True, bullet: bool = False):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.line_spacing_rule = WD_LINE_SPACING.ONE_POINT_FIVE
    pf.space_after = Pt(0)
    if bullet:
        pf.left_indent = Cm(0.74)
        text = text[2:] if text.startswith('- ') else text
        run = p.add_run('• ')
        set_eastasia(run, BODY_FONT)
        run.font.size = BODY_SIZE
    elif indent:
        pf.first_line_indent = Pt(24)
    add_inline(p, text)
    return p


def heading(doc, text: str, level: int):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(12)
    pf.space_after = Pt(6)
    pf.line_spacing_rule = WD_LINE_SPACING.ONE_POINT_FIVE
    if level == 1:
        pf.alignment = WD_ALIGN_PARAGRAPH.CENTER
        size = TITLE_SIZE
    else:
        size = H2_SIZE
    run = p.add_run(text)
    run.bold = True
    set_eastasia(run, HEADING_FONT)
    run.font.size = size
    return p


def convert(md_path: str, docx_path: str, title: Optional[str] = None) -> None:
    doc = Document()
    # 页面设置：A4 + 2.54cm 页边距
    section = doc.sections[0]
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)
    for attr in ('top_margin', 'bottom_margin', 'left_margin', 'right_margin'):
        setattr(section, attr, Cm(2.54))

    with open(md_path, encoding='utf-8') as f:
        lines = f.read().splitlines()

    first_heading_seen = False
    for raw in lines:
        line = raw.rstrip()
        if not line.strip():
            continue
        if line.startswith('#'):
            text = re.sub(r'^#+\s*', '', line)
            level = len(line) - len(line.lstrip('#'))
            if level == 1 and not first_heading_seen:
                first_heading_seen = True
                heading(doc, title or text, 1)
            else:
                heading(doc, text, 2 if level >= 2 else 1)
            continue
        if line.startswith('- '):
            body_paragraph(doc, line, indent=False, bullet=True)
        else:
            body_paragraph(doc, line)

    doc.save(docx_path)
    print(f'saved: {docx_path}')


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    title = None
    for a in sys.argv[1:]:
        if a.startswith('--title='):
            title = a.split('=', 1)[1]
    if len(args) < 2:
        print('用法: python3 scripts/md2docx.py <input.md> <output.docx> [--title=标题]')
        sys.exit(1)
    convert(args[0], args[1], title)
