import type { Signal } from "../types";

const ASPECT_POLARITY: Record<string, "strength" | "shadow" | "neutral"> = {
  trine:       "strength",
  sextile:     "strength",
  conjunction: "neutral",
  square:      "shadow",
  opposition:  "shadow",
  quincunx:    "neutral"
};

const ASPECT_TAGS: Record<string, string[]> = {
  square:      ["intensity", "discipline", "courage"],
  opposition:  ["boundaries", "truth", "intensity"],
  trine:       ["intuition", "healing", "craft"],
  sextile:     ["innovation", "social_sensitivity", "freedom"],
  conjunction: ["focus", "legacy", "intensity"],
  quincunx:    ["innovation", "freedom", "discipline"]
};

export function aspectSignals(fullChart: any): Signal[] {
  const aspects = fullChart?.aspects ?? [];
  const out: Signal[] = [];

  for (const a of aspects.slice(0, 8)) {
    const p1 = a.planet1 ?? a.a;
    const p2 = a.planet2 ?? a.b;
    const type = a.aspect ?? a.type;
    const orb  = typeof a.orb === "number" ? a.orb : 1;

    if (!p1 || !p2 || !type) continue;

    out.push({
      id: `aspect.${p1}.${type}.${p2}`,
      system: "aspects",
      label: `${p1} ${type} ${p2} (orb ${orb.toFixed(1)}°) — how these inner systems cooperate or create friction.`,
      evidence: [`${p1} ${type} ${p2}`],
      intensity: Math.max(0.5, 1 - orb / 10),
      polarity: ASPECT_POLARITY[type] ?? "neutral",
      confidence: "high",
      tags: ASPECT_TAGS[type] ?? ["craft", "innovation"]
    });
  }

  return out;
}
