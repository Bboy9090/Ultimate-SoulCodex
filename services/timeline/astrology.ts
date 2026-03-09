import type { PhaseSignal } from "./types";

function ageAt(birthDate: string, currentDate: Date): number {
  const d = new Date(birthDate);
  let age = currentDate.getFullYear() - d.getFullYear();
  const m = currentDate.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && currentDate.getDate() < d.getDate())) age -= 1;
  return age;
}

// Saturn cycle: ~29.5 yr period; returns at ~29-30, ~58-60; squares at ~7, ~21, ~36-37, ~51
function saturnSignals(age: number): PhaseSignal[] {
  const signals: PhaseSignal[] = [];

  if (age >= 27 && age <= 31) {
    signals.push({
      phase: "Friction",
      weight: 4,
      reason:
        "Saturn Return (age 27-31): The first major structural audit of your life. Anything built on a weak foundation breaks here so something real can replace it.",
    });
  } else if (age >= 56 && age <= 61) {
    signals.push({
      phase: "Legacy",
      weight: 4,
      reason:
        "Second Saturn Return (age 56-61): A reckoning with what you have actually built versus what you assumed you would build. Legacy decisions are live.",
    });
  } else if ((age >= 6 && age <= 8) || (age >= 20 && age <= 23)) {
    signals.push({
      phase: "Construction",
      weight: 2,
      reason: `Saturn Square (age ~${age}): A structural pressure point — early discipline and foundation work are being tested.`,
    });
  } else if (age >= 35 && age <= 38) {
    signals.push({
      phase: "Refinement",
      weight: 3,
      reason:
        "Saturn Opposition (age 35-38): A mid-cycle audit. What matters vs. what is noise becomes obvious. Precision over volume.",
    });
  } else if (age >= 49 && age <= 53) {
    signals.push({
      phase: "Friction",
      weight: 2,
      reason:
        "Saturn Square pre-return (age 49-53): Structural tension before the second Saturn Return. Old patterns resurface for final processing.",
    });
  }

  return signals;
}

// Jupiter cycle: ~12 yr return; conjunctions at ~12, ~24, ~36, ~48, ~60; squares at ~3, ~6, ~9...
function jupiterSignals(age: number): PhaseSignal[] {
  const signals: PhaseSignal[] = [];
  const mod12 = age % 12;

  if (mod12 <= 1 || mod12 >= 11) {
    signals.push({
      phase: "Expansion",
      weight: 3,
      reason: `Jupiter Return window (age ~${age}): A natural growth and opportunity cycle is opening. What you have built now has more room to breathe.`,
    });
  } else if (mod12 >= 5 && mod12 <= 7) {
    signals.push({
      phase: "Exposure",
      weight: 2,
      reason: `Jupiter Opposition (age ~${age}): Others see your trajectory clearly. External feedback — positive and critical — arrives with more force.`,
    });
  }

  return signals;
}

// Nodal Return: ~18.6 yr cycle; returns at ~19, ~38, ~57, ~76
function nodalSignals(age: number): PhaseSignal[] {
  const signals: PhaseSignal[] = [];

  if ((age >= 18 && age <= 20) || (age >= 37 && age <= 39) || (age >= 56 && age <= 58)) {
    signals.push({
      phase: "Integration",
      weight: 3,
      reason: `Nodal Return (age ~${age}): The axis of purpose and past cycles back to its original position. Patterns from ~19 years ago resurface for integration.`,
    });
  } else if ((age >= 8 && age <= 10) || (age >= 27 && age <= 29) || (age >= 46 && age <= 48)) {
    signals.push({
      phase: "Refinement",
      weight: 2,
      reason: `Nodal Reversal (age ~${age}): A pivot point in the life direction. What you are moving toward versus what you are letting go of becomes clearer.`,
    });
  }

  return signals;
}

// Uranus square: ~21, ~63; half-return: ~42
function uranusSignals(age: number): PhaseSignal[] {
  const signals: PhaseSignal[] = [];

  if (age >= 40 && age <= 44) {
    signals.push({
      phase: "Friction",
      weight: 3,
      reason:
        "Uranus Opposition / Midlife Disruption (age 40-44): Identity structures built in the first half of life are being challenged. Authentic restructuring is the task — not crisis avoidance.",
    });
  } else if (age >= 19 && age <= 22) {
    signals.push({
      phase: "Ignition",
      weight: 2,
      reason:
        "Uranus Square (age 19-22): A jolt of independence and identity formation. The first major divergence from inherited patterns.",
    });
  } else if (age >= 61 && age <= 65) {
    signals.push({
      phase: "Legacy",
      weight: 2,
      reason:
        "Uranus Square (age 61-65): A late-cycle freedom surge. The structures that served career and family are loosening; new creative expression opens.",
    });
  }

  return signals;
}

export function getAstrologySignals(
  birthDate: string,
  currentDate: Date,
  _fullChart?: unknown
): PhaseSignal[] {
  const age = ageAt(birthDate, currentDate);
  if (age < 0) return []; // birth date is in the future relative to currentDate
  if (age > 120) return [];

  return [
    ...saturnSignals(age),
    ...jupiterSignals(age),
    ...nodalSignals(age),
    ...uranusSignals(age),
  ];
}
