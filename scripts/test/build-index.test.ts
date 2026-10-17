import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { SqliteVectorStore } from '../../packages/retrieval/src/sqlite';
import type { VectorStore } from '../../packages/retrieval/src/types';
import { buildIndex } from '../../packages/retrieval/src/build';
import type { EmbedderLike } from '../../packages/retrieval/src/build';

/** 确定性 fake embedder（8 维，不下载模型） */
function makeFakeEmbedder(modelName = 'fake/test-embedder', modelVersion = 'fake-1.0.0'): EmbedderLike {
  return {
    dim: 8,
    modelName,
    modelVersion,
    async embed(texts: string[]): Promise<number[][]> {
      return texts.map((t) => {
        let acc = 0;
        for (const ch of t) acc = (acc * 31 + ch.codePointAt(0)!) % 1000003;
        return Array.from({ length: 8 }, (_, i) => ((acc + i * 17) % 97) / 97);
      });
    },
  };
}

function makeEntry(id: string, title: string, text: string, tags: string[] = []): unknown {
  return {
    schemaVersion: '1',
    id,
    category: id.includes('binder') ? 'binder' : 'modifier',
    title,
    text,
    tags,
    sourceRef: 'JTG F40-2004',
    relations: [
      {
        property: '高温PG',
        effect: '提升',
        direction: '+',
        magnitude: '提升约 2 级',
        applicableScene: tags.length > 0 ? tags : ['t-heavy'],
        sourceRef: 'JTG F40-2004',
      },
    ],
  };
}

function makeLit(id: string, title: string): unknown {
  return { id, title, journal: '测试期刊', year: '2024', doi: '10.1000/test', sourceRef: '10.1000/test' };
}

function makeCorpus(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'corpus-'));
  fs.mkdirSync(path.join(dir, 'knowledge'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'standards'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'literature'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'knowledge/entries.json'),
    JSON.stringify([
      makeEntry('k-binder-001', '基质沥青', '基质沥青是通用基准胶结料，成本最低。', ['k-budget']),
      makeEntry('k-binder-002', 'SBS改性沥青', 'SBS 改性沥青提升高温等级与弹性恢复。', ['d-rutting']),
    ]),
  );
  fs.writeFileSync(
    path.join(dir, 'standards/jtg-test.md'),
    [
      '# 测试规范\n',
      '## jtg-test-1.1 总则\n\n正文一：测试规范总则内容。\n',
      '## jtg-test-2.1 材料\n\n正文二：测试规范材料要求内容。\n',
      '<!-- source: 测试规范 第 1.1/2.1 条 -->\n',
    ].join('\n'),
  );
  fs.writeFileSync(
    path.join(dir, 'literature/from-xlsx.json'),
    JSON.stringify([makeLit('lit-001', '第一篇测试文献'), makeLit('lit-002', '第二篇测试文献')]),
  );
  return dir;
}

async function setup(manifestInTmp = true): Promise<{ store: SqliteVectorStore; dir: string; db: string; manifest: string }> {
  const dir = makeCorpus();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'idx-'));
  const db = path.join(tmp, 'test.db');
  const manifest = path.join(tmp, 'manifest.json');
  const store = new SqliteVectorStore(db);
  return { store, dir, db, manifest };
}

const PROVENANCE_KEYS = ['sourceDocId', 'contentHash', 'embeddingModel', 'modelVersion', 'dim', 'pipelineRev', 'embeddedAt'];

describe('buildIndex（fake embedder + SqliteVectorStore 全流程）', () => {
  it('首次构建：2 条目 + 2 条文 + 2 文献 = 6 chunk，added=6', async () => {
    const { store, dir, manifest } = await setup();
    const r = await buildIndex({
      corpusDir: dir,
      store: store as unknown as VectorStore,
      embedder: makeFakeEmbedder(),
      manifestPath: manifest,
      pipelineRev: 'testrev1',
    });
    expect(r).toEqual({ added: 6, skipped: 0, total: 6 });
    const s = await store.stats();
    expect(s.count).toBe(6);
    expect(s.docTypes).toEqual({ knowledge: 2, standard: 2, literature: 2 });
    store.close();
  });

  it('幂等：同内容二次构建 skip 6 且 count 不变（Review Focus #6）', async () => {
    const { store, dir, manifest } = await setup();
    await buildIndex({
      corpusDir: dir,
      store: store as unknown as VectorStore,
      embedder: makeFakeEmbedder(),
      manifestPath: manifest,
      pipelineRev: 'testrev1',
    });
    const r2 = await buildIndex({
      corpusDir: dir,
      store: store as unknown as VectorStore,
      embedder: makeFakeEmbedder(),
      manifestPath: manifest,
      pipelineRev: 'testrev1',
    });
    expect(r2).toEqual({ added: 0, skipped: 6, total: 6 });
    expect((await store.stats()).count).toBe(6);
    store.close();
  });

  it('改一条语料只重嵌该条（contentHash 变更 → added=1 skipped=5）', async () => {
    const { store, dir, manifest } = await setup();
    const opts = {
      corpusDir: dir,
      store: store as unknown as VectorStore,
      embedder: makeFakeEmbedder(),
      manifestPath: manifest,
      pipelineRev: 'testrev1',
    };
    await buildIndex(opts);
    // 修改 entries.json 中第一条的 text
    const entriesFile = path.join(dir, 'knowledge/entries.json');
    const entries = JSON.parse(fs.readFileSync(entriesFile, 'utf-8')) as Array<Record<string, unknown>>;
    entries[0].text = '基质沥青是通用基准胶结料，成本最低，适用于轻交通。';
    fs.writeFileSync(entriesFile, JSON.stringify(entries));
    const r = await buildIndex(opts);
    expect(r).toEqual({ added: 1, skipped: 5, total: 6 });
    expect((await store.stats()).count).toBe(6);
    store.close();
  });

  it('rebuild=true 全量重建', async () => {
    const { store, dir, manifest } = await setup();
    const opts = {
      corpusDir: dir,
      store: store as unknown as VectorStore,
      embedder: makeFakeEmbedder(),
      manifestPath: manifest,
      pipelineRev: 'testrev1',
    };
    await buildIndex(opts);
    const r = await buildIndex({ ...opts, rebuild: true });
    expect(r).toEqual({ added: 6, skipped: 0, total: 6 });
    expect((await store.stats()).count).toBe(6);
    store.close();
  });

  it('换 embedding 模型强制全量重建（modelVersion 变化）', async () => {
    const { store, dir, manifest } = await setup();
    await buildIndex({
      corpusDir: dir,
      store: store as unknown as VectorStore,
      embedder: makeFakeEmbedder('fake/test-embedder', 'fake-1.0.0'),
      manifestPath: manifest,
      pipelineRev: 'testrev1',
    });
    const r = await buildIndex({
      corpusDir: dir,
      store: store as unknown as VectorStore,
      embedder: makeFakeEmbedder('fake/test-embedder', 'fake-2.0.0'),
      manifestPath: manifest,
      pipelineRev: 'testrev1',
    });
    expect(r).toEqual({ added: 6, skipped: 0, total: 6 });
    store.close();
  });

  it('删除语料后对应 docId 被清除，count 减少', async () => {
    const { store, dir, manifest } = await setup();
    const opts = {
      corpusDir: dir,
      store: store as unknown as VectorStore,
      embedder: makeFakeEmbedder(),
      manifestPath: manifest,
      pipelineRev: 'testrev1',
    };
    await buildIndex(opts);
    const litFile = path.join(dir, 'literature/from-xlsx.json');
    const lits = JSON.parse(fs.readFileSync(litFile, 'utf-8')) as unknown[];
    fs.writeFileSync(litFile, JSON.stringify(lits.slice(0, 1)));
    const r = await buildIndex(opts);
    expect(r).toEqual({ added: 0, skipped: 5, total: 5 });
    expect((await store.stats()).count).toBe(5);
    store.close();
  });

  it('单 doc 多 chunk 删 1 条：幸存 chunk 被重嵌且可检索（R2-C1 回归）', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'corpus-c1-'));
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'idx-c1-'));
    fs.mkdirSync(path.join(dir, 'standards'), { recursive: true });
    const stdFile = path.join(dir, 'standards/jtg-c1.md');
    const clauses = [
      '## jtg-c1-1.1 条款甲\n\n条款甲正文：甲甲甲甲。\n',
      '## jtg-c1-1.2 条款乙\n\n条款乙正文：乙乙乙乙。\n',
      '## jtg-c1-1.3 条款丙\n\n条款丙正文：丙丙丙丙。\n',
    ];
    const writeStd = (cs: string[]) =>
      fs.writeFileSync(stdFile, ['# 测试\n', ...cs, '<!-- source: 测试 -->\n'].join('\n'));
    writeStd(clauses);

    const store = new SqliteVectorStore(path.join(tmp, 'test.db'));
    const opts = {
      corpusDir: dir,
      store: store as unknown as VectorStore,
      embedder: makeFakeEmbedder(),
      manifestPath: path.join(tmp, 'manifest.json'),
      pipelineRev: 'testrev1',
    };
    const r1 = await buildIndex(opts);
    expect(r1.total).toBe(3);
    expect((await store.stats()).count).toBe(3);

    // 删除中间条文（同 docId 的另两条 hash 未变）
    writeStd([clauses[0], clauses[2]]);
    const r2 = await buildIndex(opts);
    expect(r2).toEqual({ added: 2, skipped: 0, total: 2 });
    expect((await store.stats()).count).toBe(2);

    // 幸存 chunk 必须可检索（条文索引随文件位置重排：丙从 :2 变为 :1）、被删 chunk 不可检索
    const hitSurvivor = await store.search({ text: '甲甲甲甲', topK: 3 });
    expect(hitSurvivor.map((h) => h.chunkId)).toContain('jtg-c1:0');
    const hitSurvivor2 = await store.search({ text: '丙丙丙丙', topK: 3 });
    expect(hitSurvivor2.map((h) => h.chunkId)).toContain('jtg-c1:1');
    const hitRemoved = await store.search({ text: '乙乙乙乙', topK: 3 });
    expect(hitRemoved).toEqual([]);
    store.close();
  });

  it('入库 chunk 带完整 provenance 7 字段且检索可命中', async () => {
    const { store, dir, manifest } = await setup();
    await buildIndex({
      corpusDir: dir,
      store: store as unknown as VectorStore,
      embedder: makeFakeEmbedder(),
      manifestPath: manifest,
      pipelineRev: 'testrev1',
    });
    const hits = await store.search({ text: '基质沥青', topK: 3 });
    expect(hits.length).toBeGreaterThan(0);
    const hit = hits.find((h) => h.provenance.sourceDocId === 'k-binder-001');
    expect(hit).toBeDefined();
    for (const key of PROVENANCE_KEYS) {
      expect(hit!.provenance, `provenance.${key}`).toHaveProperty(key);
    }
    expect(hit!.provenance.embeddingModel).toBe('fake/test-embedder');
    expect(hit!.provenance.dim).toBe(8);
    expect(hit!.provenance.pipelineRev).toBe('testrev1');
    expect(hit!.docType).toBe('knowledge');
    store.close();
  });
});
