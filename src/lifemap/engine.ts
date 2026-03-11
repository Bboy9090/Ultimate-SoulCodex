import type { LifeMapInput, LifeMapResult, LifeMapYear, LifeMapPhase } from "./types";
import { scoreLifeMap, rankPhases } from "./score";
import { phaseDoList, phaseDontList, phaseSummary } from "./narrative";
import { NUMEROLOGY_PHASE_RULES } from "./rules";

function nextPhaseFrom(current: LifeMapPhase): LifeMapPhase {
  switch (current) {
    case "Ignition": return "Construction";
    case "Exposure": return "Refinement";
    case "Construction": return "Expansion";
    case "Expansion": return "Friction";
    case "Friction": return "Refinement";
    case "Refinement": return "Integration";
    case "Integration": return "Legacy";
    case "Legacy": return "Ignition";
  }
}

function previousPhaseFrom(current: LifeMapPhase): LifeMapPhase {
  switch (current) {
    case "Ignition": return "Legacy";
    case "Exposure": return "Ignition";
    case "Construction": return "Exposure";
    case "Expansion": return "Construction";
    case "Friction": return "Expansion";
    case "Refinement": return "Friction";
    case "Integration": return "Refinement";
    case "Legacy": return "Integration";
  }
}

function projectYearPhase(basePersonalYear: number, offset: number): LifeMapPhase {
  const cycleYear = ((basePersonalYear - 1 + offset) % 9) + 1;
  return NUMEROLOGY_PHASE_RULES[cycleYear]?.primary || "Integration";
}

export function buildLifeMap(input: LifeMapInput): LifeMapResult {
  const { scores, reasons, confidence } = scoreLifeMap(input);
  const ranked = rankPhases(scores);

  const currentPhase = ranked[0];
  const previousPhase = previousPhaseFrom(currentPhase);
  const nextPhase = nextPhaseFrom(currentPhase);

  const doList = phaseDoList(currentPhase);
  const dontList = phaseDontList(currentPhase);

  const basePersonalYear = input.profile?.numerology?.personalYear || 1;
  const years: LifeMapYear[] = [];

  for (let i = -2; i <= 5; i++) {
    const year = input.currentYear + i;
    const phase = i === 0 ? currentPhase : projectYearPhase(basePersonalYear, i);
    years.push({
      year,
      phase,
      summary: phaseSummary(phase),
      why: `This year leans toward ${phase} based on your numerology cycle and the broader patterns in your profile.`,
      do: phaseDoList(phase).slice(0, 3),
      dont: phaseDontList(phase).slice(0, 3),
    });
  }

  return {
    confidence,
    currentPhase,
    previousPhase,
    nextPhase,
    reasons: reasons
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5),
    do: doList,
    dont: dontList,
    years,
  };
}
