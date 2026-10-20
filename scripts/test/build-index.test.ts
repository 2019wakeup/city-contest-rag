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
    // 修改 entries.json 中第一条的 name（维度块 text 由 name+relations 组成）
    const entriesFile = path.join(dir, 'knowledge/entries.json');
    const entries = JSON.parse(fs.readFileSync(entriesFile, 'utf-8')) as Array<Record<string, unknown>>;
    entries[0].name = '基质沥青（更新版）';
    fs.writeFileSync(entriesFile, JSON.stringify(entries));
    const r = await buildIndex(opts);
    expect(r).toEqual({ added: 1, skipped: 5, total: 6 });
    expect((await store.stats()).count).toBe(6);
    store.close();
  });

  it('知识条目按 relations 逐条拆维度块（sourceDocId/tags/text 组合）', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'corpus-dim-'));
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'idx-dim-'));
    fs.mkdirSync(path.join(dir, 'knowledge'), { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'scene-tags.json'),
      JSON.stringify({
        tags: [
          { id: 'c-hot', label: '高温', kind: 'climate' },
          { id: 'd-rutting', label: '车辙', kind: 'distress' },
        ],
      }),
    );
    fs.writeFileSync(
      path.join(dir, 'knowledge/entries.json'),
      JSON.stringify([
        {
          schemaVersion: '1',
          id: 'k-binder-010',
          category: 'binder',
          title: '测试改性沥青',
          name: '测试改性沥青',
          text: '原文文本（关系拆分后不再入块）。',
          specs: { 标号: '70#', 掺量: '3%~5%' },
          tags: ['c-hot'],
          sourceRef: 'JTG F40-2004',
          relations: [
            {
              property: '高温PG',
              effect: '提升高温等级',
              direction: '+',
              magnitude: 'PG64→PG76',
              applicableScene: ['c-hot'],
              sourceRef: '10.1000/a',
            },
            {
              property: '弹性恢复',
              effect: '改善弹性',
              direction: '+',
              magnitude: '恢复率≥75%',
              applicableScene: ['d-rutting'],
              sourceRef: '10.1000/b',
            },
          ],
        },
        {
          schemaVersion: '1',
          id: 'k-binder-011',
          category: 'binder',
          title: '无关系条目',
          name: '无关系条目',
          text: '无关系原文。',
          tags: [],
          sourceRef: 'JTG F40-2004',
          relations: [],
        },
      ]),
    );

    const store = new SqliteVectorStore(path.join(tmp, 'test.db'));
    const r = await buildIndex({
      corpusDir: dir,
      store: store as unknown as VectorStore,
      embedder: makeFakeEmbedder(),
      manifestPath: path.join(tmp, 'manifest.json'),
      pipelineRev: 'testrev1',
    });
    // 2 关系 → 2 块；无关系 → 1 块
    expect(r.total).toBe(3);
    expect((await store.stats()).count).toBe(3);

    const hits = await store.search({ text: '测试改性沥青', topK: 10 });
    const chunks = hits.filter((h) => h.provenance.sourceDocId === 'k-binder-010');
    expect(chunks.map((c) => c.chunkId).sort()).toEqual(['k-binder-010:0', 'k-binder-010:1']);
    for (const c of chunks) {
      expect(c.provenance.sourceDocId).toBe('k-binder-010'); // sourceDocId 保持 entry.id
      expect(c.docType).toBe('knowledge');
    }
    const c0 = chunks.find((c) => c.chunkId === 'k-binder-010:0')!;
    expect(c0.text).toContain('测试改性沥青');
    expect(c0.text).toContain('70#'); // specs 并入维度块文本（条目级上下文锚点）
    expect(c0.text).toContain('高温PG');
    expect(c0.text).toContain('提升高温等级'); // effect 片段
    expect(c0.text).toContain('PG64→PG76'); // magnitude 片段
    expect(c0.text).toContain('高温'); // 场景中文标签（scene-tags 映射）
    expect(c0.text).toContain('10.1000/a'); // relation.sourceRef 优先
    expect(c0.tags).toContain('c-hot'); // relation.applicableScene
    expect(c0.tags).toContain('dim-高温PG'); // 维度标签
    const c1 = chunks.find((c) => c.chunkId === 'k-binder-010:1')!;
    expect(c1.text).toContain('弹性恢复');
    expect(c1.text).toContain('车辙'); // d-rutting → 车辙
    expect(c1.text).toContain('10.1000/b');
    expect(c1.tags).toContain('d-rutting');
    expect(c1.tags).toContain('dim-弹性恢复');
    expect(c1.tags).toContain('c-hot'); // entry.tags 并集

    // 无 relations 的 entry → 单块保留原文
    const hits2 = await store.search({ text: '无关系原文', topK: 5 });
    const single = hits2.find((h) => h.chunkId === 'k-binder-011:0');
    expect(single).toBeDefined();
    expect(single!.text).toBe('无关系原文。');
    expect(single!.tags).toEqual([]);
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

  it('literature-full 按 ## 标题切块 + 无标题长节按 ~500 字聚合', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'corpus-litfull-'));
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'idx-litfull-'));
    fs.mkdirSync(path.join(dir, 'literature-full'), { recursive: true });
    const longSection = '长节正文。'.repeat(160); // 800 字符，无 ## 标题，应硬切成 ≥2 块
    fs.writeFileSync(
      path.join(dir, 'literature-full/litfull-001.md'),
      [
        '<!--',
        'SOURCE: 原始 PDF: reference/x.pdf | 页数: 3 | 集合: reference',
        '题录: litfull-001 测试全文',
        '-->',
        '# 测试全文标题',
        '',
        '摘要正文：这是前言内容。',
        '## 1. 引言',
        '',
        '引言正文甲乙丙。',
        '## 2. 方法',
        '',
        '方法正文。',
        '### 2.1 子节',
        '',
        '子节正文应归入父节。',
        '## 3. 长节',
        '',
        longSection,
        '![图](images/page_1_image_1.jpg)',
      ].join('\n'),
    );

    const store = new SqliteVectorStore(path.join(tmp, 'test.db'));
    const r = await buildIndex({
      corpusDir: dir,
      store: store as unknown as VectorStore,
      embedder: makeFakeEmbedder(),
      manifestPath: path.join(tmp, 'manifest.json'),
      pipelineRev: 'testrev1',
    });
    // 前言+摘要 1 块、引言 1 块、方法（含 2.1 子节）1 块、长节拆 ≥2 块
    expect(r.total).toBeGreaterThanOrEqual(5);
    expect((await store.stats()).count).toBe(r.total);

    // 各块均含「正文」一词（空文本无向量时 search 返回 []，属契约行为）
    const all = await store.search({ text: '正文', topK: 100 });
    const chunks = all.filter((h) => h.provenance.sourceDocId === 'litfull-001');
    expect(chunks.length).toBe(r.total);
    for (const c of chunks) {
      expect(c.docType).toBe('literature-full'); // P0：全文块独立 docType
      expect(c.chunkId).toMatch(/^litfull-001:\d+$/);
      expect(c.text).not.toContain('![图]');
    }
    // 方法块包含 2.1 子节内容（子节不单独成块）
    const methods = chunks.find((c) => c.text.includes('## 2. 方法'));
    expect(methods?.text).toContain('子节正文应归入父节');
    // 长节被拆分且每块 ≤ 600 字符
    const longParts = chunks.filter((c) => c.text.includes('长节正文'));
    expect(longParts.length).toBeGreaterThanOrEqual(2);
    for (const c of longParts) expect(c.text.length).toBeLessThanOrEqual(700);
    store.close();
  });

  it('tables 源：每条表格一个 chunk（docType=table，text=caption+来源+markdown，关键词 tags）', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'corpus-tables-'));
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'idx-tables-'));
    fs.mkdirSync(path.join(dir, 'tables'), { recursive: true });
    const longMd = '| A | B |\n' + Array.from({ length: 200 }, (_, i) => `| ${i} | ${i * 2} |`).join('\n');
    fs.writeFileSync(
      path.join(dir, 'tables/tables.json'),
      JSON.stringify([
        {
          id: 'table-000-0',
          docTitle: '车辙与疲劳性能研究',
          caption: 'Table 1. Rutting and fatigue results.',
          markdown: longMd,
          sourcePath: 'reference/x.pdf',
          page: 3,
        },
        {
          id: 'table-000-1',
          docTitle: '水稳性试验',
          caption: 'Table 2. TSR results.',
          markdown: '| TSR | 80 |',
          sourcePath: 'reference/x.pdf',
          page: 5,
        },
      ]),
    );

    const store = new SqliteVectorStore(path.join(tmp, 'test.db'));
    const r = await buildIndex({
      corpusDir: dir,
      store: store as unknown as VectorStore,
      embedder: makeFakeEmbedder(),
      manifestPath: path.join(tmp, 'manifest.json'),
      pipelineRev: 'testrev1',
    });
    expect(r.total).toBe(2);
    const hits = await store.search({ text: 'Table 1', topK: 5 });
    const t = hits.find((h) => h.provenance.sourceDocId === 'table-000');
    expect(t).toBeDefined();
    expect(t!.docType).toBe('table');
    expect(t!.chunkId).toBe('table-000-0'); // chunkId 直用 tables.json 的 id（table-<docSeq>-<idx>）
    expect(t!.text).toContain('Table 1. Rutting and fatigue results.'); // caption
    expect(t!.text).toContain('来源：车辙与疲劳性能研究'); // docTitle
    expect(t!.text).toContain('| 50 | 100 |'); // markdown 内容（1200 字截断内）
    expect(t!.text.length).toBeLessThanOrEqual(1300); // 截断 1200 + 前缀
    expect(t!.tags).toContain('车辙'); // caption/docTitle 关键词映射
    expect(t!.tags).toContain('疲劳');
    const t2 = hits.find((h) => h.chunkId === 'table-000-1');
    expect(t2).toBeDefined();
    expect(t2!.tags).toContain('水稳');
    store.close();
  });

  it('enterprise 源：binders/additives/catalog 入库（docType=enterprise，chunkId=id:0，lab-indicators 不入块）', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'corpus-ent-'));
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'idx-ent-'));
    fs.mkdirSync(path.join(dir, 'enterprise'), { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'enterprise/binders.json'),
      JSON.stringify([
        {
          schemaVersion: '1',
          id: 'ent-binder-001',
          category: 'binder',
          type: '胶结料（沥青）',
          name: '70# 直馏沥青',
          specs: { 针入度: '72 (0.1mm)' },
          sourceRef: '企业数据',
          text: '70# 直馏沥青：针入度 72。',
          tags: ['enterprise', 'binder'],
          relations: [
            {
              property: '高温PG',
              effect: '低标号高粘度，高温等级相对更优',
              direction: '+',
              magnitude: '针入度 72、软化点 47.6℃',
              applicableScene: ['t-heavy'],
              sourceRef: '企业数据：70# 实测指标',
            },
          ],
        },
        {
          schemaVersion: '1',
          id: 'ent-binder-002',
          category: 'binder',
          type: '胶结料（沥青）',
          name: '90# 再生专用沥青',
          specs: {},
          sourceRef: '企业数据',
          text: '90# 再生专用沥青：针入度 91。',
          tags: ['enterprise'],
          relations: [],
        },
      ]),
    );
    fs.writeFileSync(
      path.join(dir, 'enterprise/additives.json'),
      JSON.stringify([
        {
          schemaVersion: '1',
          id: 'ent-additive-001',
          category: 'additive',
          type: '再生添加剂',
          name: '90（基准）',
          specs: {},
          sourceRef: '企业数据',
          text: '再生添加剂 90（基准）。',
          tags: ['enterprise'],
          relations: [],
        },
      ]),
    );
    fs.writeFileSync(
      path.join(dir, 'enterprise/catalog.json'),
      JSON.stringify([
        {
          schemaVersion: '1',
          id: 'ent-catalog-001',
          category: 'catalog',
          type: '料源',
          name: '拌合站/料源 A',
          specs: { 代号: 'A' },
          sourceRef: '企业数据',
          text: '企业数据料源代号 A。',
          tags: ['enterprise', 'catalog'],
          relations: [],
        },
      ]),
    );
    fs.writeFileSync(
      path.join(dir, 'enterprise/lab-indicators.json'),
      JSON.stringify({ schemaVersion: '1', indicators: [{ key: 'vv', label: '空隙率', group: '体积', unit: '%', threshold: '3~6', sampleSize: 116, testMethod: 'T 0705' }] }),
    );

    const store = new SqliteVectorStore(path.join(tmp, 'test.db'));
    const r = await buildIndex({
      corpusDir: dir,
      store: store as unknown as VectorStore,
      embedder: makeFakeEmbedder(),
      manifestPath: path.join(tmp, 'manifest.json'),
      pipelineRev: 'testrev1',
    });
    // binders 2 + additives 1 + catalog 1 = 4；lab-indicators 不入块
    expect(r.total).toBe(4);
    const hits = await store.search({ text: '70#', topK: 10 });
    const b1 = hits.find((h) => h.chunkId === 'ent-binder-001:0');
    expect(b1).toBeDefined();
    expect(b1!.docType).toBe('enterprise');
    expect(b1!.provenance.sourceDocId).toBe('ent-binder-001');
    expect(b1!.text).toContain('高温PG'); // text 含关系摘要（entry.text 自带）
    expect(b1!.tags).toContain('enterprise');
    const hitAll = await store.search({ text: '企业数据', topK: 20 });
    expect(hitAll.filter((h) => h.docType === 'enterprise').length).toBe(4);
    expect(hitAll.some((h) => h.chunkId.includes('lab-indicators'))).toBe(false);
    store.close();
  });
});
