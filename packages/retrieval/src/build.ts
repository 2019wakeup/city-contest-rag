/**
 * 入库管线核心（T4）：语料 → 切块 → contentHash 幂等 → embed → 写 provenance → VectorStore。
 *
 * - server 的 /api/v1/kb/rebuild 与 scripts/build-index.ts CLI 共用本模块。
 * - 幂等逻辑（Review Focus #5/#6）：manifest 按 chunkId 记录 contentHash；
 *   同 hash 跳过、hash 变化重嵌、语料删除同步 delete(docId)；
 *   换 embedding 模型（modelName/modelVersion/dim 任一变化）或 rebuild=true → 强制全量重建
 *   （spec §4 防线 3：杜绝"旧向量 + 新查询"的静默检索漂移）。
 * - chunk id = `{docId}:{chunkIdx}`（docId 即语料 id：k-binder-001 / jtg-5142-2019 / lit-001）。
 * - provenance 7 字段（spec §6.2）：sourceDocId/contentHash/embeddingModel/modelVersion/dim/pipelineRev/embeddedAt。
 */
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  CorpusChunkSchema,
  KnowledgeEntrySchema,
  type CorpusChunk,
  type KnowledgeEntry,
} from '@road-rec/contracts';
import type { VectorStore } from './types';

/** 结构性接口：与 packages/embedding 的 Embedder 兼容，避免跨包依赖 */
export interface EmbedderLike {
  embed(texts: string[], opts?: { mode?: 'query' | 'passage' }): Promise<number[][]>;
  dim: number;
  modelName: string;
  modelVersion: string;
}

export interface BuildOptions {
  corpusDir: string;
  store: VectorStore;
  embedder: EmbedderLike;
  /** 全量重建（默认 false，按 manifest 增量/幂等） */
  rebuild?: boolean;
  /** manifest 路径（默认 <corpusDir>/../index/manifest.json，即 data/index/manifest.json） */
  manifestPath?: string;
  /** 管线修订号（默认 git rev-parse HEAD 前 7 位；测试可注入） */
  pipelineRev?: string;
}

export interface BuildResult {
  added: number;
  skipped: number;
  total: number;
}

interface PlannedChunk {
  chunk: CorpusChunk;
  docId: string;
  contentHash: string;
}

interface Manifest {
  storeVersion: 1;
  embeddingModel: string;
  modelVersion: string;
  dim: number;
  pipelineRev: string;
  chunks: Record<string, { docId: string; contentHash: string; docType: string }>;
}

export function contentHashOf(text: string): string {
  return createHash('sha256').update(text, 'utf-8').digest('hex');
}

export function getGitHeadShort(): string {
  try {
    return execSync('git rev-parse HEAD', { stdio: 'ignore', timeout: 5000 }).toString().trim().slice(0, 7);
  } catch {
    return 'unknown';
  }
}

// ─────────────────────────────────────────────────────────────────────────
// 切块（spec §5 检索细节：知识条目/规范条文/文献题录 各一 chunk）
// ─────────────────────────────────────────────────────────────────────────

const CLAUSE_HEADING_RE = /^##\s+(\S+)\s+(.+)$/gm;

function collectPlanned(corpusDir: string): PlannedChunk[] {
  const planned: PlannedChunk[] = [];

  // 场景标签 → 中文标签映射（知识条目维度块 text 用）
  const sceneLabels = new Map<string, string>();
  const tagsFile = path.join(corpusDir, 'scene-tags.json');
  if (fs.existsSync(tagsFile)) {
    try {
      const t = JSON.parse(fs.readFileSync(tagsFile, 'utf-8')) as { tags?: Array<{ id: string; label: string }> };
      for (const tag of t.tags ?? []) sceneLabels.set(tag.id, tag.label);
    } catch {
      // 标签文件缺失/损坏时不阻塞入库（text 退化为标签 id）
    }
  }

  // 1. 知识条目（按 relations[] 逐条拆维度块；docId = k-<category>-<nnn>，sourceDocId 恒为 entry.id）
  const entriesFile = path.join(corpusDir, 'knowledge/entries.json');
  if (fs.existsSync(entriesFile)) {
    const entries = JSON.parse(fs.readFileSync(entriesFile, 'utf-8')) as unknown[];
    entries.forEach((raw) => {
      const e = KnowledgeEntrySchema.parse(raw) as KnowledgeEntry & { name?: string };
      const entryName = e.name ?? e.title;
      if (e.relations.length === 0) {
        if (!e.text || e.text.trim() === '') throw new Error(`知识条目 ${e.id} 缺 text`);
        planned.push(makeChunk(`${e.id}:0`, e.id, e.text, 'knowledge', e.tags ?? []));
        return;
      }
      e.relations.forEach((rel, ri) => {
        const sceneNames = rel.applicableScene.map((t) => sceneLabels.get(t) ?? t);
        // specs 并入维度块文本：条目级上下文锚点（标号/掺量/类型等术语跨维度可见，提升 BM25 召回）
        const specs = (e as KnowledgeEntry & { specs?: Record<string, unknown> }).specs ?? {};
        const specsStr = Object.entries(specs)
          .map(([k, v]) => `${k} ${Array.isArray(v) ? v.join('/') : String(v)}`)
          .join('，');
        const head = specsStr ? `${entryName}（${specsStr}）` : entryName;
        const text =
          `${head}｜${rel.property}：${rel.effect}；${rel.magnitude}。` +
          `适用场景：${sceneNames.join('、')}。依据：${rel.sourceRef || e.sourceRef}`;
        const tags = [...new Set([...(e.tags ?? []), ...rel.applicableScene, `dim-${rel.property}`])];
        planned.push(makeChunk(`${e.id}:${ri}`, e.id, text, 'knowledge', tags));
      });
    });
  }

  // 2. 规范条文（每个 "## 规范号-条号 主题" 分节一 chunk，docId = 文件名去扩展名）
  const stdDir = path.join(corpusDir, 'standards');
  if (fs.existsSync(stdDir)) {
    for (const f of fs.readdirSync(stdDir).filter((x) => x.endsWith('.md')).sort()) {
      const docId = f.replace(/\.md$/, '');
      const content = fs.readFileSync(path.join(stdDir, f), 'utf-8');
      const matches = [...content.matchAll(CLAUSE_HEADING_RE)];
      if (matches.length === 0) {
        throw new Error(`规范文件 ${f} 无条文分节标题（请先跑 scripts/validate-corpus.ts）`);
      }
      matches.forEach((m, idx) => {
        const head = m[1];
        const title = m[2].trim();
        const bodyStart = (m.index ?? 0) + m[0].length;
        const bodyEnd = matches[idx + 1]?.index ?? content.length;
        const body = content.slice(bodyStart, bodyEnd).trim();
        const text = `## ${head} ${title}\n${body}`;
        planned.push(makeChunk(`${docId}:${idx}`, docId, text, 'standard', []));
      });
    }
  }

  // 3. 文献题录（一条一 chunk，docId = lit-<序号>）
  const litFile = path.join(corpusDir, 'literature/from-xlsx.json');
  if (fs.existsSync(litFile)) {
    const lits = JSON.parse(fs.readFileSync(litFile, 'utf-8')) as Array<{
      id?: string;
      title?: string;
      authors?: string;
      journal?: string;
      year?: string;
      doi?: string;
      taskZh?: string;
    }>;
    lits.forEach((l, i) => {
      if (!l.id || !l.title) throw new Error(`文献题录第 ${i} 条缺 id/title`);
      const parts = [l.title];
      if (l.authors) parts.push(`作者：${l.authors}`);
      if (l.journal) parts.push(`期刊：${l.journal}`);
      if (l.year) parts.push(`年份：${l.year}`);
      if (l.taskZh) parts.push(`内容：${l.taskZh}`);
      if (l.doi) parts.push(`DOI：${l.doi}`);
      const text = parts.join('。');
      planned.push(makeChunk(`${l.id}:0`, l.id, text, 'literature', []));
    });
  }

  // 4. 文献全文（litfull-<题录序号>.md：按 ## 标题切块，无标题长节按 ~500 字聚合）
  const litFullDir = path.join(corpusDir, 'literature-full');
  if (fs.existsSync(litFullDir)) {
    for (const f of fs.readdirSync(litFullDir).filter((x) => x.endsWith('.md')).sort()) {
      const docId = f.replace(/\.md$/, '');
      const content = fs.readFileSync(path.join(litFullDir, f), 'utf-8');
      planned.push(...chunkLiteratureFull(docId, content));
    }
  }

  // 5. 表格块（RAG P0·D1：extract-tables.ts 产出的含数值表格，每条一 chunk，结构化定量证据）
  const tablesFile = path.join(corpusDir, 'tables/tables.json');
  if (fs.existsSync(tablesFile)) {
    const tables = JSON.parse(fs.readFileSync(tablesFile, 'utf-8')) as Array<{
      id?: string;
      docTitle?: string;
      caption?: string;
      markdown?: string;
    }>;
    tables.forEach((t, i) => {
      if (!t.id || !t.markdown) throw new Error(`tables.json 第 ${i} 条缺 id/markdown`);
      // id = table-<docSeq>-<idx> → docId = table-<docSeq>（同文档多表共属一 doc）
      const docId = t.id.replace(/-\d+$/, '');
      const caption = t.caption ?? `${t.docTitle ?? docId} 表 ${i + 1}`;
      const text = `${caption}｜来源：${t.docTitle ?? ''}｜${t.markdown.slice(0, 1200)}`;
      const tags = mapTableTags(`${caption} ${t.docTitle ?? ''}`);
      planned.push(makeChunk(`${t.id}`, docId, text, 'table', tags));
    });
  }

  // 6. 企业数据（RAG P1·E1：binders/additives/catalog 三份条目 JSON；lab-indicators 为
  //    backend 的 LAB_INDICATOR_META 真相源，不入块）
  const entDir = path.join(corpusDir, 'enterprise');
  if (fs.existsSync(entDir)) {
    interface EnterpriseEntry {
      id?: string;
      name?: string;
      sourceRef?: string;
      tags?: string[];
      specs?: Record<string, unknown>;
      relations?: Array<{ property?: string; effect?: string; magnitude?: string }>;
    }
    for (const f of ['binders.json', 'additives.json', 'catalog.json']) {
      const p = path.join(entDir, f);
      if (!fs.existsSync(p)) continue;
      const entries = JSON.parse(fs.readFileSync(p, 'utf-8')) as EnterpriseEntry[];
      entries.forEach((e, i) => {
        if (!e.id || !e.name) throw new Error(`enterprise/${f} 第 ${i} 条缺 id/name`);
        const specsStr = Object.entries(e.specs ?? {})
          .map(([k, v]) => `${k} ${Array.isArray(v) ? v.join('/') : String(v)}`)
          .join('，');
        const relStr = (e.relations ?? [])
          .map((r) => `${r.property ?? ''}${r.effect ?? ''}；${r.magnitude ?? ''}`)
          .join('。');
        // E3 口径：text = 名称 + 规格 + 关系摘要（+ 依据）
        const head = specsStr ? `${e.name}（${specsStr}）` : e.name;
        const text = `${head}${relStr ? `｜${relStr}` : ''}。依据：${e.sourceRef ?? '企业数据'}`;
        planned.push(makeChunk(`${e.id}:0`, e.id, text, 'enterprise', e.tags ?? []));
      });
    }
  }

  return planned;
}

/** 表格块标签：从 caption + docTitle 关键词映射（P0·D1 设计口径） */
const TABLE_TAG_KEYWORDS: Array<[string, string]> = [
  ['车辙', '车辙'],
  ['低温', '低温'],
  ['疲劳', '疲劳'],
  ['水稳', '水稳'],
  ['TSR', '水稳'],
  ['掺量', '掺量'],
  ['RAP', 'RAP'],
  ['再生', '再生'],
  ['级配', '级配'],
  ['模量', '模量'],
  ['裂缝', '裂缝'],
  ['温度', '温度'],
  ['规范', '规范'],
  ['马歇尔', '马歇尔'],
  ['针入度', '针入度'],
  ['软化点', '软化点'],
  ['延度', '延度'],
  ['黏度', '黏度'],
  ['粘度', '黏度'],
  ['空隙率', '空隙率'],
  ['碳排', '碳排'],
  ['排放', '碳排'],
];

function mapTableTags(text: string): string[] {
  const tags = new Set<string>();
  for (const [kw, tag] of TABLE_TAG_KEYWORDS) {
    if (text.includes(kw)) tags.add(tag);
  }
  return [...tags];
}

/** 文献全文切块：按 `## ` 分节；节内正文超长时按段落聚合（目标 ~500 字，硬上限 600） */
const LITFULL_CHUNK_TARGET = 500;
const LITFULL_CHUNK_MAX = 600;

function chunkLiteratureFull(docId: string, content: string): PlannedChunk[] {
  const cleaned = content
    .split('\n')
    .filter((line) => !/^\s*!\[[^\]]*\]\([^)]*\)\s*$/.test(line)) // 图片引用行不入块
    .join('\n');

  const matches = [...cleaned.matchAll(/^##\s+(.+)$/gm)];
  const sections: Array<{ heading: string; body: string }> = [];
  if (matches.length === 0) {
    sections.push({ heading: '', body: cleaned });
  } else {
    if ((matches[0].index ?? 0) > 0) {
      sections.push({ heading: '', body: cleaned.slice(0, matches[0].index) });
    }
    matches.forEach((m, i) => {
      const bodyStart = (m.index ?? 0) + m[0].length;
      const bodyEnd = matches[i + 1]?.index ?? cleaned.length;
      sections.push({ heading: m[0], body: cleaned.slice(bodyStart, bodyEnd) });
    });
  }

  const chunks: PlannedChunk[] = [];
  let idx = 0;
  for (const s of sections) {
    const prefix = s.heading ? `${s.heading}\n` : '';
    for (const part of packParagraphs(s.body, LITFULL_CHUNK_TARGET, LITFULL_CHUNK_MAX)) {
      const text = (prefix + part).trim();
      if (text.length < 10) continue;
      chunks.push(makeChunk(`${docId}:${idx++}`, docId, text, 'literature-full', []));
    }
  }
  return chunks;
}

/** 段落聚合：优先按空行分段装包到 target 附近；单段超长则按 max 硬切 */
function packParagraphs(body: string, target: number, max: number): string[] {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const out: string[] = [];
  let buf = '';
  const flush = () => {
    if (buf.trim().length > 0) {
      out.push(buf.trim());
      buf = '';
    }
  };
  for (const p of paragraphs) {
    if (p.length > max) {
      flush();
      for (let i = 0; i < p.length; i += max) out.push(p.slice(i, i + max));
      continue;
    }
    if (buf.length === 0) buf = p;
    else if (buf.length + p.length + 2 <= target) buf = `${buf}\n\n${p}`;
    else {
      flush();
      buf = p;
    }
  }
  flush();
  return out;
}

function makeChunk(
  chunkId: string,
  docId: string,
  text: string,
  docType: CorpusChunk['docType'],
  tags: string[],
): PlannedChunk {
  // provenance 在 buildIndex 内统一填充（需要 embedder/pipelineRev 上下文）
  return { docId, contentHash: contentHashOf(text), chunk: { chunkId, text, docType, tags } as CorpusChunk };
}

// ─────────────────────────────────────────────────────────────────────────

function readManifest(manifestPath: string): Manifest | null {
  try {
    const m = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as Manifest;
    if (m.storeVersion !== 1 || typeof m.chunks !== 'object') return null;
    return m;
  } catch {
    return null;
  }
}

function writeManifest(manifestPath: string, manifest: Manifest): void {
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

export async function buildIndex(opts: BuildOptions): Promise<BuildResult> {
  const planned = collectPlanned(opts.corpusDir);
  const manifestPath =
    opts.manifestPath ?? path.join(opts.corpusDir, '..', 'index', 'manifest.json');
  const pipelineRev = opts.pipelineRev ?? getGitHeadShort();
  const embedder = opts.embedder;

  const manifest = readManifest(manifestPath);
  const storeCount = (await opts.store.stats()).count;

  // 换 embedding 模型 / 显式 rebuild / manifest 缺失 → 强制全量重建
  const modelChanged =
    manifest !== null &&
    (manifest.embeddingModel !== embedder.modelName ||
      manifest.modelVersion !== embedder.modelVersion ||
      manifest.dim !== embedder.dim);
  const storeLost = manifest !== null && Object.keys(manifest.chunks).length > 0 && storeCount === 0;
  const needFullRebuild = opts.rebuild === true || manifest === null || modelChanged || storeLost;

  if (needFullRebuild) {
    await opts.store.rebuild();
    const vectors = await embedder.embed(planned.map((p) => p.chunk.text), { mode: 'passage' });
    await addWithProvenance(opts.store, planned, vectors, embedder, pipelineRev);
    writeManifest(manifestPath, buildManifest(planned, embedder, pipelineRev));
    return { added: planned.length, skipped: 0, total: planned.length };
  }

  // 增量/幂等路径
  const byChunkId = new Map(planned.map((p) => [p.chunk.chunkId, p]));
  const toDelete = new Set<string>();
  const toEmbed: PlannedChunk[] = [];

  for (const [chunkId, m] of Object.entries(manifest!.chunks)) {
    const p = byChunkId.get(chunkId);
    if (!p) {
      toDelete.add(m.docId);
    } else if (p.contentHash !== m.contentHash) {
      if (p.docId !== m.docId) toDelete.add(m.docId);
      toEmbed.push(p);
    }
    // hash 未变：跳过（除非所属 docId 因删除需要整体重嵌，见下方 C1 处理）
  }
  for (const p of planned) {
    if (!manifest!.chunks[p.chunk.chunkId]) toEmbed.push(p);
  }
  // R2-C1：VectorStore.delete(docId) 是 doc 级删除，会连带吞掉同 doc 未变化的兄弟 chunk，
  // 因此所有涉及删除的 docId 的幸存 chunk 必须一并重嵌（否则索引静默缺块而 manifest 虚记）。
  for (const docId of toDelete) {
    for (const p of planned) {
      if (p.docId === docId && !toEmbed.includes(p)) toEmbed.push(p);
    }
  }

  for (const docId of toDelete) await opts.store.delete(docId);
  if (toEmbed.length > 0) {
    const vectors = await embedder.embed(toEmbed.map((p) => p.chunk.text), { mode: 'passage' });
    await addWithProvenance(opts.store, toEmbed, vectors, embedder, pipelineRev);
  }

  writeManifest(manifestPath, buildManifest(planned, embedder, pipelineRev));
  const skipped = planned.length - toEmbed.length;
  return { added: toEmbed.length, skipped, total: planned.length };
}

async function addWithProvenance(
  store: VectorStore,
  planned: PlannedChunk[],
  vectors: number[][],
  embedder: EmbedderLike,
  pipelineRev: string,
): Promise<void> {
  if (planned.length !== vectors.length) {
    throw new Error(`planned(${planned.length}) 与 vectors(${vectors.length}) 数量不一致`);
  }
  const chunks = planned.map((p) =>
    CorpusChunkSchema.parse({
      schemaVersion: '1',
      chunkId: p.chunk.chunkId,
      text: p.chunk.text,
      docType: p.chunk.docType,
      tags: p.chunk.tags,
      provenance: {
        sourceDocId: p.docId,
        contentHash: p.contentHash,
        embeddingModel: embedder.modelName,
        modelVersion: embedder.modelVersion,
        dim: embedder.dim,
        pipelineRev,
        embeddedAt: new Date().toISOString(),
      },
    }),
  );
  await store.add(chunks, vectors);
}

function buildManifest(planned: PlannedChunk[], embedder: EmbedderLike, pipelineRev: string): Manifest {
  const chunks: Manifest['chunks'] = {};
  for (const p of planned) {
    chunks[p.chunk.chunkId] = { docId: p.docId, contentHash: p.contentHash, docType: p.chunk.docType };
  }
  return {
    storeVersion: 1,
    embeddingModel: embedder.modelName,
    modelVersion: embedder.modelVersion,
    dim: embedder.dim,
    pipelineRev,
    chunks,
  };
}
