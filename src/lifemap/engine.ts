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

const PHASE_WHY: Record<LifeMapPhase, string> = {
  Ignition: "Your numerology cycle hit a Year 1 — new beginnings. Combined with your profile themes, life pushed toward fresh starts and initiative.",
  Exposure: "Your cycle entered a visibility window. Patterns that were operating quietly became harder to ignore. Truth got louder.",
  Construction: "Your cycle favored building. Personal Year 4 or 8 combined with discipline-oriented themes created pressure to focus and build structure.",
  Expansion: "Your cycle entered a growth window. Personal Year 3 or 5 created momentum for new connections, opportunities, and outward movement.",
  Friction: "Your cycle hit a pressure point. This typically happens when numerology and life themes create tension between what you want and what needs to change.",
  Refinement: "Your cycle favored editing. Personal Year 7 combined with precision or boundary themes created pressure to simplify and sharpen.",
  Integration: "Your cycle entered a rest phase. Personal Year 2 or 6 combined with your profile signals created space for absorbing lessons and stabilizing.",
  Legacy: "Your cycle reached a completion point. Personal Year 9 combined with legacy or service themes created focus on what lasts beyond you.",
};

const PHASE_FELT: Record<LifeMapPhase, string> = {
  Ignition: "This year likely felt like a restart — restless energy, new ideas, a sense that something had to begin even if the direction wasn't fully clear.",
  Exposure: "This year likely felt revealing — things you'd been managing privately became visible, or truths you'd avoided demanded acknowledgment.",
  Construction: "This year likely felt heavy but productive — slow progress, discipline required, and a sense that shortcuts would cost more than patience.",
  Expansion: "This year likely felt expansive — more options, more connections, more movement. The challenge was choosing what deserved real commitment.",
  Friction: "This year likely felt pressured — relationships, habits, or structures that weren't working became impossible to maintain without confrontation.",
  Refinement: "This year likely felt like editing — cutting commitments, simplifying, choosing quality over quantity. Less felt like more.",
  Integration: "This year likely felt quieter — processing, absorbing, resting. Progress felt slow but the grounding was real.",
  Legacy: "This year likely felt purposeful — focus shifted from personal achievement to contribution, meaning, and what you're building for others.",
};

function buildYearWhy(phase: LifeMapPhase, cycleYear: number, yearOffset: number, currentYear: number): string {
  const year = currentYear + yearOffset;
  const isFuture = yearOffset > 0;
  const isPast = yearOffset < 0;

  const parts: string[] = [];

  if (isPast) {
    parts.push(PHASE_FELT[phase]);
  } else if (isFuture) {
    parts.push(phaseSummary(phase));
  }

  parts.push(PHASE_WHY[phase]);

  const rule = NUMEROLOGY_PHASE_RULES[cycleYear];
  if (rule) {
    parts.push(`Personal Year ${cycleYear} favors ${rule.primary}${rule.secondary ? ` with a secondary pull toward ${rule.secondary}` : ""}.`);
  }

  return parts.join(" ");
}

export function buildLifeMap(input: LifeMapInput, pastYears = 2, futureYears = 5): LifeMapResult {
  const { scores, reasons, confidence } = scoreLifeMap(input);
  const ranked = rankPhases(scores);

  const currentPhase = ranked[0];
  const previousPhase = previousPhaseFrom(currentPhase);
  const nextPhase = nextPhaseFrom(currentPhase);

  const doList = phaseDoList(currentPhase);
  const dontList = phaseDontList(currentPhase);

  const basePersonalYear = input.profile?.numerology?.personalYear || 1;
  const years: LifeMapYear[] = [];

  for (let i = -pastYears; i <= futureYears; i++) {
    const year = input.currentYear + i;
    const cycleYear = ((basePersonalYear - 1 + i) % 9 + 9) % 9 + 1;
    const phase = i === 0 ? currentPhase : projectYearPhase(basePersonalYear, i);
    years.push({
      year,
      phase,
      summary: phaseSummary(phase),
      why: buildYearWhy(phase, cycleYear, i, input.currentYear),
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
