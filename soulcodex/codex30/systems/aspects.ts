import type { Signal } from "../types";

const ASPECT_POLARITY: Record<string, "strength" | "shadow" | "neutral"> = {
  trine:       "strength",
  sextile:     "strength",
  conjunction: "neutral",
  square:      "shadow",
  opposition:  "shadow",
};

const ASPECT_TAGS: Record<string, string[]> = {
  square:      ["intensity", "discipline", "courage"],
  opposition:  ["boundaries", "truth", "intensity"],
  trine:       ["intuition", "healing", "craft"],
  sextile:     ["innovation", "social_sensitivity", "freedom"],
  conjunction: ["focus", "legacy", "intensity"],
};

export function aspectSignals(fullChart: any, verified: boolean): Signal[] {
  if (!verified) return [];
  const aspects = Array.isArray(fullChart?.aspects) ? fullChart.aspects : [];
  const out: Signal[] = [];

  for (const a of aspects.slice(0, 8)) {
    const p1 = a.planet1 ?? a.a;
    const p2 = a.planet2 ?? a.b;
    const type = a.aspect ?? a.type;
    const orb = a.orb;

    if (
      !p1 ||
      !p2 ||
      typeof type !== "string" ||
      !(type in ASPECT_POLARITY) ||
      !Number.isFinite(orb) ||
      orb < 0
    ) continue;

    out.push({
      id: `aspect.${p1}.${type}.${p2}`,
      system: "aspects",
      label: `${p1} ${type} ${p2} (orb ${orb.toFixed(1)}°) is verified aspect geometry; the interaction meaning is symbolic.`,
      evidence: [`${p1} ${type} ${p2}`],
      intensity: Math.max(0.5, 1 - orb / 10),
      polarity: ASPECT_POLARITY[type] ?? "neutral",
      confidence: "high",
      tags: ASPECT_TAGS[type]
    });
  }

  return out;
}
