import type { Signal } from "../types.js";

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
    label: `The selected ${el.toUpperCase()} stress element is a symbolic reflection prompt about pressure responses, not a nervous-system diagnosis or automatic behavior.`,
    evidence: [`Stress element: ${el}`],
    intensity: 0.8,
    polarity: "neutral",
    confidence: "medium",
    tags: ELEMENT_TAGS[el] ?? ["discipline"]
  }];
}
