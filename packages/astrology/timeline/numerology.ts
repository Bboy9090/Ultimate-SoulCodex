import type { PhaseSignal, TimelinePhase } from "./types";
import { calcPersonalYear } from "@soulcodex/core";

function timelinePhaseCycleYear(personalYear: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 {
  if (personalYear >= 1 && personalYear <= 9 && Number.isInteger(personalYear)) {
    return personalYear as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  }

  const masterRoot: Record<number, 2 | 4 | 6> = {
    11: 2,
    22: 4,
    33: 6,
  };
  const root = masterRoot[personalYear];
  if (root) return root;

  throw new RangeError("Timeline Personal Year must be 1-9, 11, 22, or 33");
}

export function personalYear(birthDate: string, currentDate: Date): number {
  if (!(currentDate instanceof Date) || Number.isNaN(currentDate.getTime())) {
    throw new RangeError("Timeline current date must be valid");
  }
  return calcPersonalYear(birthDate, currentDate.getFullYear());
}

// This phase mapping is the governed Timeline policy. Master Personal Years
// preserve their numerology identity but use 11→2, 22→4, 33→6 for phase scoring.
const YEAR_PHASE_MAP: Record<number, TimelinePhase> = {
  1: "Ignition",
  2: "Integration",
  3: "Expansion",
  4: "Construction",
  5: "Expansion",
  6: "Legacy",
  7: "Refinement",
  8: "Construction",
  9: "Legacy",
};

const YEAR_REASON_MAP: Record<number, string> = {
  1: "Personal Year 1 is treated as an initiation cycle in the Timeline reflection model.",
  2: "Personal Year 2 is treated as an integration cycle in the Timeline reflection model.",
  3: "Personal Year 3 is treated as an expansion cycle in the Timeline reflection model.",
  4: "Personal Year 4 is treated as a construction cycle in the Timeline reflection model.",
  5: "Personal Year 5 is treated as an expansion-and-change cycle in the Timeline reflection model.",
  6: "Personal Year 6 is treated as a responsibility-and-legacy cycle in the Timeline reflection model.",
  7: "Personal Year 7 is treated as a refinement cycle in the Timeline reflection model.",
  8: "Personal Year 8 is treated as a construction-and-execution cycle in the Timeline reflection model.",
  9: "Personal Year 9 is treated as a completion-and-legacy cycle in the Timeline reflection model.",
};

export function getNumerologySignal(
  birthDate: string,
  currentDate: Date
): PhaseSignal | null {
  try {
    const py = personalYear(birthDate, currentDate);
    const phaseYear = timelinePhaseCycleYear(py);
    const masterNote = py !== phaseYear
      ? ` Personal Year ${py} preserves its master-number identity and uses phase-rule root ${phaseYear} for Timeline scoring.`
      : "";

    return {
      phase: YEAR_PHASE_MAP[phaseYear],
      weight: 3,
      reason: `${YEAR_REASON_MAP[phaseYear]}${masterNote}`,
    };
  } catch {
    return null;
  }
}
