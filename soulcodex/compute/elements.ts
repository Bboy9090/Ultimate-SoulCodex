import type { StressElement } from "../types";

const ELEMENT_NOTES: Record<StressElement, string> = {
  air: "Mind speeds up — loops, overthinking, scattered attention.",
  fire: "Anger flares fast — snapping, restlessness, need to act now.",
  water: "Emotions flood — shutting down, tears, withdrawal into feelings.",
  earth: "Body locks up — tension, fatigue, stubbornness, refusing to move.",
  metal: "Goes cold — detachment, hyper-control, cutting people off.",
};

export function stressNotes(element: StressElement): string {
  return ELEMENT_NOTES[element] ?? ELEMENT_NOTES.air;
}
