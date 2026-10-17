/**
 * RRF（Reciprocal Rank Fusion）融合：score = Σ 1/(k + rank)，rank 从 1 起。
 * 免调权重、稳健（spec §5 检索细节）。默认 k=60。
 */
export interface RankedItem {
  id: string;
  score: number;
}

export const DEFAULT_RRF_K = 60;

export function rrf(rankings: RankedItem[][], k: number = DEFAULT_RRF_K): RankedItem[] {
  const scores = new Map<string, number>();
  for (const ranking of rankings) {
    ranking.forEach((item, index) => {
      const contribution = 1 / (k + (index + 1));
      scores.set(item.id, (scores.get(item.id) ?? 0) + contribution);
    });
  }
  return [...scores.entries()]
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
