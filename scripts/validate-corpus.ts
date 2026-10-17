/**
 * 语料校验器（T3）
 *
 * 校验 data/corpus/ 下全部语料真相源：
 *   - scene-tags.json          场景标签词典（contracts 无对应 schema，本地手工校验）
 *   - knowledge/entries.json   知识条目（import packages/contracts 的 KnowledgeEntrySchema 解析 + 业务规则）
 *   - cases/cases.json         5 个预置案例（import CaseSeedSchema + SceneInputSchema 解析 + 引用完整性）
 *   - standards/*.md           规范条文分节文件（结构校验）
 *   - literature/from-xlsx.json 文献题录（本地手工校验，由 convert-literature.ts 产出）
 *
 * 业务规则（在 contracts schema 之上追加的严格约束）：
 *   - entries id 必须匹配 k-<category>-<nnn> 且前缀与 category 一致
 *   - relations.property 必须在 RELATION_PROPERTIES 词汇表内（T6 硬过滤依赖）
 *   - 每条语料 sourceRef 非空（DOI 或规范号，spec Global Constraints）
 *   - cases/relations 引用的标签必须存在于 scene-tags.json
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  KnowledgeEntrySchema,
  CaseSeedSchema,
  type KnowledgeEntry,
  type CaseSeed,
} from '../packages/contracts/src/index';

// ─────────────────────────────────────────────────────────────────────────
// 业务常量（关系表属性词汇，spec §6.1；硬过滤与 mock 依赖该词汇一致性）
// ─────────────────────────────────────────────────────────────────────────

export const ENTRY_CATEGORIES = ['binder', 'modifier', 'gradation', 'additive', 'mixture'] as const;

export const RELATION_PROPERTIES = [
  '高温PG',
  '低温PG',
  '疲劳',
  '水稳TSR',
  'E*',
  '成本',
  '碳排',
  '抗滑',
  '降噪',
  '施工和易性',
  '车辙',
  '弹性恢复',
] as const;

const TAG_KINDS = ['climate', 'traffic', 'distress', 'constraint'] as const;

const ENTRY_ID_RE = /^k-(binder|modifier|gradation|additive|mixture)-\d{3}$/;
const CASE_ID_RE = /^case-\d{2}$/;
const LIT_ID_RE = /^lit-\d{3}$/;

// ─────────────────────────────────────────────────────────────────────────

export interface CorpusReport {
  ok: boolean;
  errors: string[];
  stats: {
    entries: number;
    entryRelations: number;
    cases: number;
    tags: number;
    standards: number;
    standardClauses: number;
    literature: number;
  };
}

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function fmtIssues(issues: { path: (string | number)[]; message: string }[]): string {
  return issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
}

export function validateCorpus(corpusDir: string): CorpusReport {
  const errors: string[] = [];
  const stats: CorpusReport['stats'] = {
    entries: 0,
    entryRelations: 0,
    cases: 0,
    tags: 0,
    standards: 0,
    standardClauses: 0,
    literature: 0,
  };

  // 1. 场景标签词典（contracts 无 schema，手工校验）
  const tagsFile = path.join(corpusDir, 'scene-tags.json');
  let tagIds: Set<string>;
  if (!fs.existsSync(tagsFile)) {
    errors.push('scene-tags.json 不存在');
    tagIds = new Set();
  } else {
    const raw = readJson(tagsFile);
    if (!isRecord(raw) || !Array.isArray(raw.tags)) {
      errors.push('scene-tags.json 非法：顶层应为 {tags: [...]}');
      tagIds = new Set();
    } else {
      tagIds = new Set();
      for (const t of raw.tags) {
        if (!isRecord(t) || typeof t.id !== 'string' || t.id === '') {
          errors.push('scene-tags.json 存在缺 id 的标签');
          continue;
        }
        if (typeof t.label !== 'string' || t.label === '') {
          errors.push(`标签 ${t.id} 缺 label`);
        }
        if (!TAG_KINDS.includes(t.kind as (typeof TAG_KINDS)[number])) {
          errors.push(`标签 ${t.id} 的 kind 非法: ${String(t.kind)}`);
        }
        if (t.synonyms !== undefined && (!Array.isArray(t.synonyms) || t.synonyms.some((s) => typeof s !== 'string'))) {
          errors.push(`标签 ${t.id} 的 synonyms 应为字符串数组`);
        }
        if (tagIds.has(t.id)) errors.push(`标签 id 重复: ${t.id}`);
        tagIds.add(t.id);
      }
      stats.tags = tagIds.size;
    }
  }

  // 2. 知识条目（contracts KnowledgeEntrySchema + 业务规则）
  const entriesFile = path.join(corpusDir, 'knowledge/entries.json');
  if (!fs.existsSync(entriesFile)) {
    errors.push('knowledge/entries.json 不存在');
  } else {
    const entries = readJson(entriesFile);
    if (!Array.isArray(entries)) {
      errors.push('knowledge/entries.json 顶层应为数组');
    } else {
      const seenIds = new Set<string>();
      for (const raw of entries) {
        const parsed = KnowledgeEntrySchema.safeParse(raw);
        if (!parsed.success) {
          const rawId = isRecord(raw) && typeof raw.id === 'string' ? `（id=${raw.id}）` : '';
          errors.push(`条目校验失败${rawId}: ${fmtIssues(parsed.error.issues)}`);
          continue;
        }
        const e = parsed.data as KnowledgeEntry;
        if (!ENTRY_ID_RE.test(e.id)) {
          errors.push(`条目 ${e.id} 的 id 不合法（应为 k-<category>-<nnn>）`);
        }
        const prefix = e.id.replace(/-\d{3}$/, '');
        if (prefix !== `k-${e.category}`) {
          errors.push(`条目 ${e.id} 的 id 前缀与 category 不一致（category=${e.category}）`);
        }
        if (e.sourceRef.trim() === '') {
          errors.push(`条目 ${e.id} 的 sourceRef 为空（需 DOI 或规范号）`);
        }
        if (e.title.trim() === '' || e.text.trim() === '') {
          errors.push(`条目 ${e.id} 的 title/text 为空`);
        }
        if (seenIds.has(e.id)) errors.push(`条目 id 重复: ${e.id}`);
        seenIds.add(e.id);
        for (const rel of e.relations) {
          if (!RELATION_PROPERTIES.includes(rel.property as (typeof RELATION_PROPERTIES)[number])) {
            errors.push(`条目 ${e.id} 关系 property 不在词汇表: ${rel.property}`);
          }
          for (const tag of rel.applicableScene) {
            if (!tagIds.has(tag)) errors.push(`条目 ${e.id} 关系引用未定义标签: ${tag}`);
          }
        }
        stats.entries += 1;
        stats.entryRelations += e.relations.length;
      }
    }
  }

  // 3. 案例（contracts CaseSeedSchema + SceneInputSchema + 引用完整性）
  const casesFile = path.join(corpusDir, 'cases/cases.json');
  if (!fs.existsSync(casesFile)) {
    errors.push('cases/cases.json 不存在');
  } else {
    const cases = readJson(casesFile);
    if (!Array.isArray(cases)) {
      errors.push('cases/cases.json 顶层应为数组');
    } else {
      const seenIds = new Set<string>();
      for (const raw of cases) {
        const parsed = CaseSeedSchema.safeParse(raw);
        if (!parsed.success) {
          const rawId = isRecord(raw) && typeof raw.id === 'string' ? `（id=${raw.id}）` : '';
          errors.push(`案例校验失败${rawId}: ${fmtIssues(parsed.error.issues)}`);
          continue;
        }
        const c = parsed.data as CaseSeed;
        if (!CASE_ID_RE.test(c.id)) {
          errors.push(`案例 ${c.id} 的 id 不合法（应为 case-<nn>）`);
        }
        if (seenIds.has(c.id)) errors.push(`案例 id 重复: ${c.id}`);
        seenIds.add(c.id);
        // contracts CaseSeedSchema 未定义 tags，语料用 passthrough 字段携带并保持引用完整性
        const caseTags = (c as CaseSeed & { tags?: unknown }).tags;
        if (Array.isArray(caseTags)) {
          for (const tag of caseTags) {
            if (typeof tag === 'string' && !tagIds.has(tag)) {
              errors.push(`案例 ${c.id} 引用未定义标签: ${tag}`);
            }
          }
        }
        for (const formula of c.expected.formulas) {
          if (formula.gradation?.type === undefined || formula.binder?.type === undefined) {
            errors.push(`案例 ${c.id} 的期望配方缺少 gradation.type 或 binder.type 方向描述`);
          }
        }
        stats.cases += 1;
      }
      if (stats.cases !== 5) errors.push(`案例数量应为 5，实际 ${stats.cases}`);
      for (const expect of ['case-01', 'case-02', 'case-03', 'case-04', 'case-05']) {
        if (!seenIds.has(expect)) errors.push(`缺少案例 ${expect}`);
      }
    }
  }

  // 4. 规范条文
  const stdDir = path.join(corpusDir, 'standards');
  if (!fs.existsSync(stdDir)) {
    errors.push('standards/ 目录不存在');
  } else {
    const files = fs
      .readdirSync(stdDir)
      .filter((f) => f.endsWith('.md'))
      .sort();
    for (const f of files) {
      const content = fs.readFileSync(path.join(stdDir, f), 'utf-8');
      const clauseMatches = content.match(/^##\s+(jtg|aashto)[-A-Za-z0-9]*\S+\s+\S+/gm) ?? [];
      if (clauseMatches.length === 0) {
        errors.push(`规范文件 ${f} 无 "## 规范号-条号 主题" 分节标题`);
      }
      if (!content.includes('<!-- source:')) {
        errors.push(`规范文件 ${f} 缺少文末 <!-- source: ... --> 来源标注`);
      }
      if (content.length < 1200) {
        errors.push(`规范文件 ${f} 内容过短（${content.length} 字符）`);
      }
      stats.standards += 1;
      stats.standardClauses += clauseMatches.length;
    }
    if (stats.standards < 8) {
      errors.push(`规范文件数量应 ≥8，实际 ${stats.standards}`);
    }
  }

  // 5. 文献题录
  const litFile = path.join(corpusDir, 'literature/from-xlsx.json');
  if (!fs.existsSync(litFile)) {
    errors.push('literature/from-xlsx.json 不存在（请运行 scripts/convert-literature.ts）');
  } else {
    const lits = readJson(litFile);
    if (!Array.isArray(lits)) {
      errors.push('literature/from-xlsx.json 顶层应为数组');
    } else {
      const seenIds = new Set<string>();
      for (const raw of lits) {
        if (!isRecord(raw) || typeof raw.id !== 'string' || !LIT_ID_RE.test(raw.id)) {
          errors.push(`文献条目 id 不合法（应为 lit-<nnn>）: ${JSON.stringify(raw)?.slice(0, 80)}`);
          continue;
        }
        if (typeof raw.title !== 'string' || raw.title === '') {
          errors.push(`文献条目 ${raw.id} 缺 title`);
        }
        if (typeof raw.sourceRef !== 'string' || raw.sourceRef === '') {
          errors.push(`文献条目 ${raw.id} 缺 sourceRef（DOI 或书目引用）`);
        }
        if (seenIds.has(raw.id)) errors.push(`文献 id 重复: ${raw.id}`);
        seenIds.add(raw.id);
        stats.literature += 1;
      }
    }
  }

  return { ok: errors.length === 0, errors, stats };
}

// 直接以 tsx 运行时的 CLI 入口（--root scripts 下: tsx validate-corpus.ts [corpusDir]）
if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = process.argv[2] ?? path.resolve(__dirname, '../data/corpus');
  const report = validateCorpus(dir);
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}
