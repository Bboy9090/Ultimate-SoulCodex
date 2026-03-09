import type { CompatibilityResult } from "../types/soulcodex";

export type { CompatibilityResult };

export type PersonProfile = {
  themes: string[];
  driver: string;
  stress: string;
};

export function analyzeCompatibility(
  a: PersonProfile,
  b: PersonProfile
): CompatibilityResult {
  let score = 50;

  const overlap = a.themes.filter((t) => b.themes.includes(t));
  score += overlap.length * 5;

  if (a.driver === b.driver) score += 10;
  if (a.stress !== b.stress) score -= 10;

  return {
    score: Math.max(0, Math.min(100, score)),
    overlap,
    friction: a.stress !== b.stress ? ["Different stress responses"] : [],
    advice: [
      "Respect each other's decision styles",
      "Avoid forcing emotional timing",
      "Use shared strengths",
    ],
  };
}
