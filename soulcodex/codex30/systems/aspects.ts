import type { Signal } from "../types";

const ALLOWED_ASPECTS = new Set(["trine", "sextile", "conjunction", "square", "opposition", "quincunx"]);

const ASPECT_POLARITY: Record<string, "strength" | "shadow" | "neutral"> = {
  trine: "strength",
  sextile: "strength",
  conjunction: "neutral",
  square: "shadow",
  opposition: "shadow",
  quincunx: "neutral",
};

const ASPECT_TAGS: Record<string, string[]> = {
  square: ["intensity", "discipline", "courage"],
  opposition: ["boundaries", "truth", "intensity"],
  trine: ["intuition", "healing", "craft"],
  sextile: ["innovation", "social_sensitivity", "freedom"],
  conjunction: ["focus", "legacy", "intensity"],
  quincunx: ["innovation", "freedom", "discipline"],
};

export function aspectSignals(fullChart: any): Signal[] {
  const aspects = Array.isArray(fullChart?.aspects) ? fullChart.aspects : [];
  const out: Signal[] = [];

  for (const aspect of aspects.slice(0, 16)) {
    const p1 = typeof aspect?.planet1 === "string" ? aspect.planet1.trim() : "";
    const p2 = typeof aspect?.planet2 === "string" ? aspect.planet2.trim() : "";
    const type = typeof aspect?.aspect === "string" ? aspect.aspect.trim().toLowerCase() : "";
    const orb = Number(aspect?.orb);

    const governed =
      aspect?.policyId === "ASTRO-ASPECT-MAJOR-v1" &&
      typeof aspect?.evidenceArtifactId === "string" &&
      aspect.evidenceArtifactId.trim().length > 0;

    if (!governed || !p1 || !p2 || !ALLOWED_ASPECTS.has(type)) continue;
    if (!Number.isFinite(orb) || orb < 0 || orb > 10) continue;

    out.push({
      id: `aspect.${p1}.${type}.${p2}`,
      system: "aspects",
      label: `Governed ${p1} ${type} ${p2} (orb ${orb.toFixed(1)}°) contributes a traditional symbolic tension/flow theme, not a behavioral fact.`,
      evidence: [`${p1} ${type} ${p2} · ASTRO-ASPECT-MAJOR-v1`],
      intensity: Math.max(0.5, 1 - orb / 10),
      polarity: ASPECT_POLARITY[type] ?? "neutral",
      confidence: "high",
      tags: ASPECT_TAGS[type] ?? [],
    });
  }

  return out;
}
