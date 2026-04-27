import type { Signal, ThemeScore } from "../types.js";

export function scoreThemes(signals: Signal[]): ThemeScore[] {
  const map = new Map<string, { score: number; sources: string[] }>();

  for (const s of signals) {
    for (const tag of s.tags) {
      const current = map.get(tag) ?? { score: 0, sources: [] };
      const confW = s.confidence === "high" ? 1 : s.confidence === "medium" ? 0.7 : 0.45;
      const polW  = s.polarity  === "strength" ? 1 : s.polarity === "shadow" ? 0.8 : 0.9;
      current.score += 100 * s.intensity * confW * polW;
      current.sources.push(s.id);
      map.set(tag, current);
    }
  }

  const scored = Array.from(map.entries()).map(([tag, v]) => ({
    tag,
    score: Math.round(v.score),
    sources: Array.from(new Set(v.sources))
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 12);
}
