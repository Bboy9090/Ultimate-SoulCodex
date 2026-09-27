import type { StressElement } from "../types";

type StressElementValue = StressElement[number];

const ELEMENT_NOTES: Record<StressElementValue, string> = {
  air: "Mind speeds up — loops, overthinking, scattered attention.",
  fire: "Anger flares fast — snapping, restlessness, need to act now.",
  water: "Emotions flood — shutting down, tears, withdrawal into feelings.",
  earth: "Body locks up — tension, fatigue, stubbornness, refusing to move.",
  metal: "Goes cold — detachment, hyper-control, cutting people off.",
};

export function stressNotes(elements: StressElement): string {
  const supported = Array.from(new Set(elements ?? []))
    .filter((element): element is StressElementValue => element in ELEMENT_NOTES);

  if (supported.length === 0) {
    return "No direct stress-element signal was provided.";
  }

  return supported
    .slice(0, 2)
    .map((element) => ELEMENT_NOTES[element])
    .join(" ");
}
