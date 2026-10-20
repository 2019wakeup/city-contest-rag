import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { extractTables, type TableRecord } from '../extract-tables';

/** 构造 fixture：两篇文档，一篇含 3 个表（1 数值/1 无数值/1 纯图片），一篇无表 */
function makeFixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'extract-tables-'));
  const docA = path.join(root, 'doc-a');
  const docB = path.join(root, 'doc-b');
  fs.mkdirSync(docA, { recursive: true });
  fs.mkdirSync(docB, { recursive: true });
  const table = (content: string, caption?: string, imageSource?: string) => ({
    type: 'table',
    bbox: [0.1, 0.2, 0.9, 0.4],
    content,
    captions: caption ? [{ bbox: [0, 0, 0, 0], content: caption }] : [],
    footnotes: [],
    image_source: imageSource ?? '',
  });
  const docAJson = {
    pages: [
      { blocks: [table('| A | B |\n| --- | --- |\n| 1.5 | 2 |\n| 3 | 4 |', 'Table 1. Numeric data.')] },
      {
        blocks: [
          table('| X | Y |\n| --- | --- |\n| aa | bb |\n| cc | dd |', 'Table 2. Text only.'), // 无数值 → 过滤
        ],
      },
      {
        blocks: [
          table('|  |  |\n| --- | --- |\n|  |  |', '', 'images/page_3_table_1.jpg'), // 空表/纯图片 → 过滤
        ],
      },
      {
        blocks: [
          // HTML 形态表格（无 | 行）含数值 → 保留
          table('<table><tr><td>Additive</td><td>Dosage (%)</td></tr><tr><td>Lilamin VP</td><td>0.15</td></tr></table>', 'Table 3. Html table.'),
        ],
      },
    ],
    metadata: { document: { title: 'Fixture Doc A' } },
  };
  fs.writeFileSync(path.join(docA, 'structured_content.json'), JSON.stringify(docAJson));
  fs.writeFileSync(path.join(docA, 'SOURCE.txt'), '原始 PDF: reference/x/doc-a.pdf\n页数: 3\n集合: reference\n');
  fs.writeFileSync(path.join(docB, 'structured_content.json'), JSON.stringify({ pages: [], metadata: { document: { title: 'Fixture Doc B' } } }));
  fs.writeFileSync(path.join(docB, 'SOURCE.txt'), '原始 PDF: reference/x/doc-b.pdf\n页数: 0\n集合: reference\n');
  return root;
}

describe('extract-tables（fixture structured_content）', () => {
  it('提取含数值表格、过滤无数值表与空表/纯图片表', () => {
    const root = makeFixture();
    const tables: TableRecord[] = extractTables(root);
    // doc-a: 4 表中 Table 1（markdown 形态）与 Table 3（HTML 形态）保留；doc-b 无表
    expect(tables).toHaveLength(2);
    const t = tables[0];
    expect(t.id).toMatch(/^table-\d{3}-0$/);
    expect(t.docTitle).toBe('Fixture Doc A');
    expect(t.caption).toBe('Table 1. Numeric data.');
    expect(t.markdown).toContain('| 1.5 | 2 |');
    expect(t.sourcePath).toContain('doc-a.pdf');
    expect(t.page).toBe(1); // pages 数组 1-based
    expect(tables[1].markdown).toContain('<table>'); // HTML 表格保留
    expect(tables[1].id).toMatch(/^table-\d{3}-1$/);
  });

  it('caption 为空时用文档标题+序号兜底', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'extract-caption-'));
    fs.mkdirSync(root, { recursive: true });
    fs.writeFileSync(
      path.join(root, 'structured_content.json'),
      JSON.stringify({
        pages: [
          {
            blocks: [
              { type: 'table', bbox: [0, 0, 1, 1], content: '| A | B | C |\n| --- | --- | --- |\n| 7 | 8 | 9 |\n| 10 | 11 | 12 |', captions: [], footnotes: [], image_source: '' },
            ],
          },
        ],
        metadata: { document: { title: 'No Caption Doc' } },
      }),
    );
    fs.writeFileSync(path.join(root, 'SOURCE.txt'), '原始 PDF: reference/x/nc.pdf\n页数: 1\n集合: reference\n');
    const tables = extractTables(root);
    expect(tables).toHaveLength(1);
    expect(tables[0].caption).toBe('No Caption Doc 表 1');
  });

  it('docSeq 按扫描顺序稳定编号', () => {
    const root = makeFixture();
    const first = extractTables(root);
    const second = extractTables(root);
    expect(first.map((t) => t.id)).toEqual(second.map((t) => t.id));
  });
});
