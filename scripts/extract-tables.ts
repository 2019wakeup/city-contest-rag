/**
 * 表格提取脚本（RAG P0·D1）：扫描 literature_md 下的 structured_content.json，
 * 递归提取 type==='table' 节点 → data/corpus/tables/tables.json。
 *
 * 规则：
 *   - 只保留含数值的表格（正则 \d，长度 ≥20 防碎片）；过滤空表/纯图片表
 *   - caption 取 captions[0].content，为空时用「文档标题 表 <序号>」兜底
 *   - page 取所属 pages 数组下标 +1（bbox 页码不可靠，不用 bbox 推算）
 *   - id = table-<docSeq>-<idx>：docSeq 按扫描路径稳定排序，idx 为文档内表序号
 *
 * 用法：tsx scripts/extract-tables.ts [rootDir] [outPath]
 */
import fs from 'node:fs';
import path from 'node:path';

export interface TableRecord {
  id: string;
  docTitle: string;
  caption: string;
  markdown: string;
  sourcePath: string;
  page?: number;
}

interface ScNode {
  type?: string;
  content?: string;
  captions?: Array<{ content?: string }>;
  image_source?: string;
  footnotes?: unknown;
  blocks?: ScNode[];
  [key: string]: unknown;
}

interface ScDoc {
  pages?: Array<{ blocks?: ScNode[] }>;
  metadata?: { document?: { title?: string } };
}

const MIN_TABLE_LEN = 20;

function walkBlocks(blocks: ScNode[] | undefined, out: Array<{ node: ScNode; page: number }>, page: number): void {
  for (const b of blocks ?? []) {
    if (b.type === 'table') out.push({ node: b, page });
    if (Array.isArray(b.blocks)) walkBlocks(b.blocks, out, page);
  }
}

/** 元数据标题清理：模板占位/文件路径/垃圾标题 → 退回 SOURCE.txt 的 PDF 文件名 */
function cleanTitle(title: string, sourcePath: string, docDir: string): string {
  const junk = ['标题', 'A', 'type of the paper (article'];
  const t = title.trim();
  const isJunk =
    junk.some((j) => t.toLowerCase() === j.toLowerCase()) ||
    /^[a-z]:\\/i.test(t) || // C:\Users\... 文件路径
    t.length < 4 ||
    /^type of the paper/i.test(t);
  if (isJunk) {
    const base = path.basename(sourcePath).replace(/\.pdf$/i, '');
    if (base && base !== '') return base;
    return path.basename(docDir);
  }
  return t;
}

export function extractTables(rootDir: string): TableRecord[] {
  const files = new Map<string, { sc: string; source: string }>();
  const scan = (dir: string): void => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(p);
      } else if (entry.name === 'structured_content.json') {
        const sourcePath = path.join(path.dirname(p), 'SOURCE.txt');
        files.set(path.dirname(p), { sc: p, source: fs.existsSync(sourcePath) ? sourcePath : '' });
      }
    }
  };
  scan(rootDir);

  const sortedDirs = [...files.keys()].sort();
  const tables: TableRecord[] = [];
  sortedDirs.forEach((docDir, docSeq) => {
    const { sc, source } = files.get(docDir)!;
    let doc: ScDoc;
    try {
      doc = JSON.parse(fs.readFileSync(sc, 'utf-8')) as ScDoc;
    } catch {
      return; // 损坏的 structured_content 跳过
    }
    const sourcePath = readSourcePath(source) ?? docDir;
    const rawTitle = doc.metadata?.document?.title ?? '';
    const docTitle = cleanTitle(rawTitle, sourcePath, docDir);

    const found: Array<{ node: ScNode; page: number }> = [];
    (doc.pages ?? []).forEach((pg, i) => walkBlocks(pg.blocks, found, i + 1));

    let idx = 0;
    for (const { node, page } of found) {
      const markdown = (node.content ?? '').trim();
      if (markdown.length < MIN_TABLE_LEN || !/\d/.test(markdown)) continue; // 空表 / 碎片 / 无数值表
      const captionRaw = node.captions?.find((c) => c.content && c.content.trim() !== '')?.content?.trim();
      const caption = captionRaw && captionRaw !== '' ? captionRaw : `${docTitle} 表 ${idx + 1}`;
      tables.push({
        id: `table-${String(docSeq).padStart(3, '0')}-${idx}`,
        docTitle,
        caption,
        markdown,
        sourcePath,
        page,
      });
      idx += 1;
    }
  });
  return tables;
}

function readSourcePath(sourceFile: string): string | undefined {
  try {
    const content = fs.readFileSync(sourceFile, 'utf-8');
    const m = content.match(/^原始 PDF:\s*(.+)$/m);
    return m ? m[1].trim() : undefined;
  } catch {
    return undefined;
  }
}

// 仅 CLI 直跑时执行（被测试 import 无副作用）
if (import.meta.url === `file://${process.argv[1]}`) {
  const rootDir = process.argv[2] ?? path.resolve(__dirname, '../literature_md');
  const outPath = process.argv[3] ?? path.resolve(__dirname, '../data/corpus/tables/tables.json');
  const tables = extractTables(rootDir);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(tables, null, 2) + '\n');
  const perDoc = new Map<string, number>();
  for (const t of tables) perDoc.set(t.docTitle, (perDoc.get(t.docTitle) ?? 0) + 1);
  console.log(`提取 ${tables.length} 个含数值表格（${perDoc.size} 篇文档）→ ${outPath}`);
}
