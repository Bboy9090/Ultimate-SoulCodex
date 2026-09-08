import type { Signal } from "../types";

const LP_TAGS: Record<number, string[]> = {
  1: ["leadership", "courage", "innovation"],
  2: ["healing", "social_sensitivity", "boundaries"],
  3: ["freedom", "innovation", "social_sensitivity"],
  4: ["order", "discipline", "craft", "legacy"],
  5: ["freedom", "rebellion", "innovation"],
  6: ["service", "healing", "order"],
  7: ["privacy", "precision", "intuition"],
  8: ["legacy", "leadership", "discipline"],
  9: ["service", "healing", "legacy", "truth"],
  11:["intuition", "healing", "social_sensitivity"],
  22:["legacy", "craft", "order", "discipline"],
  33:["service", "healing", "leadership"]
};

export function numerologySignals(inputs: any): Signal[] {
  const lp = inputs?.numerology?.lifePath ?? inputs?.lifePath ?? inputs?.signals?.lifePath;
  if (lp == null) return [];

  const n = Number(lp);
  const tags = LP_TAGS[n] ?? ["legacy", "craft"];

  return [{
    id: `num.lifepath.${n}`,
    system: "numerology",
    label: `Life Path ${n} is the long-game assignment I keep getting until I master it.`,
    evidence: [`Life Path ${n}`],
    intensity: 0.85,
    polarity: "neutral",
    confidence: "medium",
    tags
  }];
}
