import type { OpenAPIHono } from '@hono/zod-openapi';
import { z } from 'zod';
import { buildIndex, contentHashOf, getGitHeadShort } from '@road-rec/retrieval';
import { DocTypeSchema } from '@road-rec/contracts';
import type { DocType } from '@road-rec/contracts';
import type { AppDeps } from '../app';

const MAX_CHUNK_CHARS = 800;

/** 简单确定性切块：空行分段 → 超长段落按句切（企业资料 MVP 口径） */
function chunkText(text: string): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const para of paragraphs) {
    if (para.length <= MAX_CHUNK_CHARS) {
      out.push(para);
      continue;
    }
    const sentences = para.split(/(?<=[。！？；])/);
    let buf = '';
    for (const s of sentences) {
      if (buf && (buf + s).length > MAX_CHUNK_CHARS) {
        out.push(buf);
        buf = s;
      } else {
        buf += s;
      }
    }
    if (buf) out.push(buf);
  }
  return out.length > 0 ? out : [text];
}

const DocBodySchema = z
  .object({
    title: z.string().optional(),
    docType: DocTypeSchema,
    text: z.string(),
  })
  .passthrough();

const SearchBodySchema = z
  .object({
    query: z.string(),
    topK: z.number().int().optional(),
    docTypes: z.array(DocTypeSchema).optional(),
  })
  .passthrough();

async function ingestDocument(
  opts: { title: string; docType: DocType; text: string },
  deps: AppDeps,
): Promise<string[]> {
  const modelName = deps.embedder?.modelName ?? 'none';
  const modelVersion = deps.embedder?.modelVersion ?? 'n/a';
  const dim = deps.embedder?.dim ?? 0;
  const sourceDocId = `kb-${opts.docType}-${Date.now().toString(36)}-${contentHashOf(opts.text).slice(0, 8)}`;
  const parts = chunkText(opts.text);
  const chunks = parts.map((text, idx) => ({
    schemaVersion: '1' as const,
    chunkId: `${sourceDocId}:${idx}:${modelVersion}`,
    text,
    docType: opts.docType,
    tags: [opts.title, 'kb-upload'].filter(Boolean),
    provenance: {
      sourceDocId,
      contentHash: contentHashOf(text),
      embeddingModel: modelName,
      modelVersion,
      dim,
      pipelineRev: getGitHeadShort(),
      embeddedAt: new Date().toISOString(),
    },
  }));
  const vectors = deps.embedder ? await deps.embedder.embed(parts) : parts.map(() => []);
  await deps.store.add(chunks, vectors);
  return chunks.map((c) => c.chunkId);
}

function zeroEmbedder() {
  return {
    dim: 0,
    modelName: 'none',
    modelVersion: 'n/a',
    embed: async (texts: string[]) => texts.map(() => [] as number[]),
  };
}

/**
 * 知识库管理：stats / documents（JSON 或 multipart，PDF 走 pdf-parse）/ search / rebuild。
 * rebuild 复用 packages/retrieval 的 buildIndex（与 CLI 同一套幂等/provenance 逻辑）。
 */
export function registerKb(app: OpenAPIHono, deps: AppDeps): void {
  app.get('/api/v1/kb/stats', async (c) => {
    try {
      const stats = await deps.store.stats();
      return c.json({ ...stats, backend: deps.backend });
    } catch (err) {
      return c.json({ count: 0, docTypes: {}, backend: deps.backend, error: String(err) });
    }
  });

  app.post('/api/v1/kb/documents', async (c) => {
    const contentType = c.req.header('content-type') ?? '';
    let title = '';
    let docType: DocType = 'enterprise';
    let text = '';

    if (contentType.includes('multipart/form-data')) {
      const body = await c.req.parseBody();
      const file = body.file;
      if (!(file instanceof File)) return c.json({ error: '缺少 file 字段' }, 400);
      title = typeof body.title === 'string' ? body.title : file.name;
      const docTypeParsed = DocTypeSchema.safeParse(body.docType);
      if (typeof body.docType === 'string' && docTypeParsed.success) docType = docTypeParsed.data;
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const pdfModule = await import('pdf-parse');
        const pdf = pdfModule.default ?? pdfModule;
        text = (await pdf(Buffer.from(await file.arrayBuffer()))).text;
      } else {
        text = await file.text();
      }
    } else {
      const parsed = DocBodySchema.safeParse(await c.req.json().catch(() => null));
      if (!parsed.success) return c.json({ error: '文档 JSON 不合法' }, 400);
      title = parsed.data.title ?? '';
      docType = parsed.data.docType;
      text = parsed.data.text;
    }

    if (!text.trim()) return c.json({ error: '文档内容为空' }, 400);
    const chunkIds = await ingestDocument({ title, docType, text }, deps);
    return c.json({ added: 1, chunks: chunkIds.length });
  });

  app.post('/api/v1/kb/search', async (c) => {
    const parsed = SearchBodySchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: '检索请求不合法' }, 400);
    let vector: number[] | undefined;
    if (deps.embedder) {
      try {
        vector = (await deps.embedder.embed([parsed.data.query]))[0];
      } catch {
        vector = undefined;
      }
    }
    const hits = await deps.store.search({
      text: parsed.data.query,
      vector,
      topK: parsed.data.topK ?? 5,
      filter: { docTypes: parsed.data.docTypes },
    });
    return c.json(hits);
  });

  app.post('/api/v1/kb/rebuild', async (c) => {
    const embedder = deps.embedder ?? zeroEmbedder();
    const result = await buildIndex({
      corpusDir: deps.corpusDir,
      store: deps.store,
      embedder,
      rebuild: true,
      manifestPath: deps.manifestPath,
    });
    return c.json({
      count: result.total,
      ...(deps.embedder ? {} : { warning: 'embedding 模型不可用，索引以零向量重建（仅 BM25 检索可用）' }),
    });
  });
}
