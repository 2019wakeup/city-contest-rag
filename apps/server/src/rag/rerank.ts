import { z } from 'zod';
import type { SearchHit } from '@road-rec/contracts';
import { callLlmText, readPrompt } from '../llm/client';
import type { LlmCall } from '../llm/client';

/**
 * B3：LLM 批量重排（一次调用处理 5 查询 × 每查询 top-8）。
 * 失败/未配置/超时/RERANK=off → 回退 RRF 原序（明确降级路径，不抛错）。
 */

export interface RerankOptions {
  llm?: LlmCall;
  timeoutMs?: number;
}

export interface RerankItem {
  hit: SearchHit;
  score: number;
  reason: string;
}

const RerankResponseSchema = z
  .object({
    results: z.array(
      z
        .object({
          queryIndex: z.number().int(),
          chunkId: z.string(),
          score: z.number().min(0).max(1),
          reason: z.string(),
        })
        .passthrough(),
    ),
  })
  .passthrough();

/** RERANK=off 强制关闭；默认 llm（未配置 key/LLM_OFF 时自动 off；注入 fake 视为可用） */
export function rerankEnabled(llm?: LlmCall): boolean {
  if (process.env.RERANK === 'off') return false;
  return llm != null || Boolean(process.env.DEEPSEEK_API_KEY && process.env.LLM_OFF !== '1');
}

function originalOrder(
  perCandidate: Array<{ query: string; hits: SearchHit[] }>,
): Map<number, RerankItem[]> {
  const map = new Map<number, RerankItem[]>();
  perCandidate.forEach((p, i) => map.set(i, p.hits.map((hit) => ({ hit, score: 0, reason: '' }))));
  return map;
}

function buildPrompt(perCandidate: Array<{ query: string; hits: SearchHit[] }>): string {
  const items = perCandidate
    .map(
      (p, qi) =>
        `[Q${qi}] ${p.query}\n` +
        p.hits.map((h, hi) => `  ${qi}-${hi} :: ${h.chunkId} :: ${h.text.slice(0, 160)}`).join('\n'),
    )
    .join('\n\n');
  return readPrompt('rerank.md').replace('{{items}}', items);
}

export async function rerankHits(
  perCandidate: Array<{ query: string; hits: SearchHit[] }>,
  opts: RerankOptions = {},
): Promise<Map<number, RerankItem[]>> {
  const llm = opts.llm;
  if (!rerankEnabled(llm)) return originalOrder(perCandidate);
  const raw = await callLlmText(buildPrompt(perCandidate), {
    temperature: 0,
    llm,
    timeoutMs: opts.timeoutMs ?? 5000,
  });
  if (raw === null) return originalOrder(perCandidate);
  try {
    const parsed = RerankResponseSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return originalOrder(perCandidate);

    // 只接受给定列表内的 (queryIndex, chunkId) 组合
    const scored = new Map<string, RerankItem>();
    for (const r of parsed.data.results) {
      const p = perCandidate[r.queryIndex];
      if (!p) continue;
      const hit = p.hits.find((h) => h.chunkId === r.chunkId);
      if (hit) scored.set(`${r.queryIndex}:${r.chunkId}`, { hit, score: r.score, reason: r.reason });
    }

    const map = new Map<number, RerankItem[]>();
    perCandidate.forEach((p, qi) => {
      const ranked: RerankItem[] = [];
      // LLM 给了分的按分数降序（稳定排序保持同分相对原序）
      for (const h of p.hits) {
        const item = scored.get(`${qi}:${h.chunkId}`);
        if (item) ranked.push(item);
      }
      // 未给分的保持原序排在末尾
      for (const h of p.hits) {
        if (!scored.has(`${qi}:${h.chunkId}`)) ranked.push({ hit: h, score: -1, reason: '' });
      }
      ranked.sort((a, b) => b.score - a.score);
      map.set(qi, ranked);
    });
    return map;
  } catch {
    return originalOrder(perCandidate);
  }
}
