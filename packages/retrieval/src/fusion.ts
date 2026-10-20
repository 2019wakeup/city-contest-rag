/**
 * RRF（Reciprocal Rank Fusion）融合：score = Σ w_i/(k + rank)，rank 从 1 起。
 * 免调权重、稳健（spec §5 检索细节）。默认 k=60；B6 支持每路权重（默认全 1.0 不变，
 * 环境变量 HYBRID_WEIGHTS=bm25,vec 可调，如 "1.5,0.8"）。
 */
export interface RankedItem {
  id: string;
  score: number;
}

export const DEFAULT_RRF_K = 60;

export function rrf(
  rankings: RankedItem[][],
  k: number = DEFAULT_RRF_K,
  weights?: number[],
): RankedItem[] {
  const scores = new Map<string, number>();
  rankings.forEach((ranking, listIndex) => {
    const w = weights?.[listIndex] ?? 1;
    ranking.forEach((item, index) => {
      const contribution = w / (k + (index + 1));
      scores.set(item.id, (scores.get(item.id) ?? 0) + contribution);
    });
  });
  return [...scores.entries()]
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

/**
 * B6：解析 HYBRID_WEIGHTS（格式 "bm25权重,vec权重"，如 "1.5,0.8"）。
 * 空/非法 → [1, 1]（默认不变，保持既有行为）。
 */
export function parseHybridWeights(env: NodeJS.ProcessEnv = process.env): number[] {
  const raw = env.HYBRID_WEIGHTS;
  if (!raw) return [1, 1];
  const parts = raw.split(',').map((p) => Number(p.trim()));
  if (parts.length !== 2 || parts.some((n) => !Number.isFinite(n) || n < 0)) return [1, 1];
  return parts;
}
