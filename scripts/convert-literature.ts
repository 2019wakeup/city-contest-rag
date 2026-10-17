/**
 * 文献题录转换脚本（T3）
 *
 * 读取 City_Contest/文献调研.xlsx 的「全部文献」表，
 * 产出 data/corpus/literature/from-xlsx.json（文献题录，一条一 chunk 的原料）。
 *
 * 字段映射：
 *   序号 → id: lit-<序号（3 位补零）>
 *   论文标题 → title；作者 → authors；期刊/会议名 → journal；发表时间 → year
 *   任务（中文） → taskZh；DOI → doi（"（无 DOI）" 等占位按无 DOI 处理）
 *   sourceRef：DOI 优先，无 DOI 用「期刊/会议名, 年份」作为书目引用（满足全局约束 sourceRef 非空）
 *
 * 用法：tsx scripts/convert-literature.ts [xlsxPath] [outPath]
 */
import fs from 'node:fs';
import path from 'node:path';
import * as XLSX from 'xlsx';

export interface LiteratureRecord {
  id: string;
  title: string;
  authors?: string;
  journal?: string;
  year?: string;
  doi?: string;
  taskZh?: string;
  sourceRef: string;
}

const NO_DOI_MARKERS = ['（无 doi）', '（无DOI）', '(无 doi)', '(无DOI)', '无', '', '-'];

export function convertLiterature(xlsxPath: string): LiteratureRecord[] {
  const wb = XLSX.readFile(xlsxPath);
  const ws = wb.Sheets['全部文献'];
  if (!ws) throw new Error(`xlsx 中缺少「全部文献」表（实际: ${wb.SheetNames.join(', ')}）`);
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: false, defval: '' });
  if (rows.length === 0) throw new Error('「全部文献」表为空');
  const header = rows[0] as string[];
  const col = (name: string): number => header.findIndex((h) => String(h).trim() === name);

  const iNum = col('序号');
  const iTitle = col('论文标题');
  const iAuthors = col('作者');
  const iJournal = col('期刊/会议名');
  const iYear = col('发表时间');
  const iDoi = col('DOI');
  const iTaskZh = col('任务（中文）');
  if ([iNum, iTitle, iDoi].some((i) => i < 0)) {
    throw new Error(`xlsx 表头缺少必需列：${JSON.stringify(header.slice(0, 14))}`);
  }

  const records: LiteratureRecord[] = [];
  const seen = new Set<string>();
  for (const row of rows.slice(1)) {
    const title = String(row[iTitle] ?? '').trim();
    if (title === '') continue; // 跳过空行
    const numStr = String(row[iNum] ?? '').trim();
    if (!/^\d+$/.test(numStr)) continue; // 跳过无序号行（如说明行）
    const id = `lit-${numStr.padStart(3, '0')}`;
    if (seen.has(id)) throw new Error(`序号重复: ${numStr}`);
    seen.add(id);

    const doiRaw = String(row[iDoi] ?? '').trim();
    const doi = NO_DOI_MARKERS.includes(doiRaw) ? undefined : doiRaw;
    const journal = String(row[iJournal] ?? '').trim() || undefined;
    const year = String(row[iYear] ?? '').trim() || undefined;
    const authors = String(row[iAuthors] ?? '').trim() || undefined;
    const taskZh = String(row[iTaskZh] ?? '').trim() || undefined;

    const rec: LiteratureRecord = {
      id,
      title,
      sourceRef: doi ?? `${journal ?? '文献'}${year ? `, ${year}` : ''}`,
    };
    if (authors) rec.authors = authors;
    if (journal) rec.journal = journal;
    if (year) rec.year = year;
    if (doi) rec.doi = doi;
    if (taskZh) rec.taskZh = taskZh;
    records.push(rec);
  }
  return records;
}

// CLI 入口（tsx scripts/convert-literature.ts）
if (import.meta.url === `file://${process.argv[1]}`) {
  const xlsxPath = process.argv[2] ?? path.resolve(__dirname, '../City_Contest/文献调研.xlsx');
  const outPath = process.argv[3] ?? path.resolve(__dirname, '../data/corpus/literature/from-xlsx.json');
  const records = convertLiterature(xlsxPath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(records, null, 2) + '\n');
  const withDoi = records.filter((r) => r.doi).length;
  console.log(`产出 ${records.length} 条文献题录（含 DOI ${withDoi} 条）→ ${outPath}`);
}
