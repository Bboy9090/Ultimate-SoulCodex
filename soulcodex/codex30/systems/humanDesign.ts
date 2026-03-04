import type { Signal } from "../types";

const TYPE_TAGS: Record<string, string[]> = {
  reflector:  ["social_sensitivity", "intuition", "privacy"],
  projector:  ["leadership", "precision", "boundaries"],
  generator:  ["craft", "discipline", "service"],
  manifesting_generator: ["craft", "courage", "innovation"],
  manifestor: ["leadership", "freedom", "intensity"]
};

export function humanDesignSignals(hd: any): Signal[] {
  if (!hd?.type) return [];
  const raw  = String(hd.type).toLowerCase().replace(/\s+/g, "_");
  const tags = TYPE_TAGS[raw] ?? ["courage", "craft"];

  return [{
    id: `hd.type.${raw}`,
    system: "humanDesign",
    label: `Energy Type: ${hd.type} shapes my pacing, rest needs, and decision timing.`,
    evidence: [`Human Design: ${hd.type}`],
    intensity: 0.75,
    polarity: "neutral",
    confidence: "low",
    tags
  }];
}
