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
  embed(texts: string[]): Promise<number[][]>;
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

  // 1. 知识条目（一条一 chunk，docId = k-<category>-<nnn>）
  const entriesFile = path.join(corpusDir, 'knowledge/entries.json');
  if (fs.existsSync(entriesFile)) {
    const entries = JSON.parse(fs.readFileSync(entriesFile, 'utf-8')) as unknown[];
    entries.forEach((raw, i) => {
      const e = KnowledgeEntrySchema.parse(raw) as KnowledgeEntry;
      if (!e.text || e.text.trim() === '') throw new Error(`知识条目 ${e.id} 缺 text`);
      planned.push(makeChunk(`${e.id}:0`, e.id, e.text, 'knowledge', e.tags ?? [], i));
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
        planned.push(makeChunk(`${docId}:${idx}`, docId, text, 'standard', [], idx));
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
      planned.push(makeChunk(`${l.id}:0`, l.id, text, 'literature', [], i));
    });
  }

  return planned;
}

function makeChunk(
  chunkId: string,
  docId: string,
  text: string,
  docType: CorpusChunk['docType'],
  tags: string[],
  _idx: number,
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
    const vectors = await embedder.embed(planned.map((p) => p.chunk.text));
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
    const vectors = await embedder.embed(toEmbed.map((p) => p.chunk.text));
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
