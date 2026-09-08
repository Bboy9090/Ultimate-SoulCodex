import type { Signal } from "../types";

const ELEMENT_TAGS: Record<string, string[]> = {
  earth: ["order", "discipline", "craft"],
  water: ["intuition", "emotion_depth", "healing"],
  fire:  ["courage", "intensity", "leadership"],
  air:   ["innovation", "freedom", "precision"],
  metal: ["boundaries", "truth", "discipline"]
};

export function elementSignals(userInputs: any): Signal[] {
  const el = userInputs?.stressElement;
  if (!el) return [];

  return [{
    id: `elem.stress.${el}`,
    system: "elements",
    label: `Under stress, I default into ${el.toUpperCase()} patterns — my nervous system's autopilot under pressure.`,
    evidence: [`Stress element: ${el}`],
    intensity: 0.8,
    polarity: "neutral",
    confidence: "high",
    tags: ELEMENT_TAGS[el] ?? ["discipline"]
  }];
}
