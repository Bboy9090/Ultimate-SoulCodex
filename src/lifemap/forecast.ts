import type { LifeMap, LifeMapYear, TimelinePhase, CurrentEra } from "../types/soulcodex";
import { resolveTimeline } from "../timeline/engine";

export type { LifeMap, LifeMapYear, CurrentEra };

const PHASE_EXPLANATIONS: Record<TimelinePhase, { felt: string; lesson: string }> = {
  Ignition: {
    felt: "Something new was starting. Raw energy, fresh direction, a sense of beginning whether you chose it or not.",
    lesson: "This year asked you to commit to a direction before the spark faded.",
  },
  Exposure: {
    felt: "Things that were hidden came to the surface. You became more visible, or truths you avoided became impossible to ignore.",
    lesson: "This year asked you to stop editing yourself and let people see the real version.",
  },
  Construction: {
    felt: "Slow, grinding, deliberate work. Not glamorous, but foundational. You were building something that required patience.",
    lesson: "This year asked you to prioritize structure over speed.",
  },
  Expansion: {
    felt: "Growth was available. Opportunities appeared, connections formed, and your world got bigger — sometimes uncomfortably.",
    lesson: "This year asked you to say yes to growth without losing your standards.",
  },
  Friction: {
    felt: "Tension and pressure were constant. Things that weren't working became impossible to ignore. Conflict surfaced.",
    lesson: "This year asked you to stop avoiding the thing that needed to change.",
  },
  Refinement: {
    felt: "Cutting away what didn't work. Sharpening what did. Less noise, more clarity. Quality over quantity.",
    lesson: "This year asked you to reduce and focus instead of accumulating.",
  },
  Integration: {
    felt: "Absorbing lessons. Resting after intensity. Processing what happened in the previous cycle.",
    lesson: "This year asked you to stop doing and let the understanding land.",
  },
  Legacy: {
    felt: "Something bigger than yourself was calling. Building for others, passing things forward, thinking beyond your own timeline.",
    lesson: "This year asked you to create something that survives without you.",
  },
};

const PHASE_MEANING: Record<TimelinePhase, string> = {
  Ignition: "A period of new beginnings and raw initiative. Life is asking you to start.",
  Exposure: "A period of visibility and truth. What was hidden is becoming undeniable.",
  Construction: "A period of discipline, structure, and narrowing your focus. Life is asking you to build.",
  Expansion: "A period of growth, opportunity, and scaling what works.",
  Friction: "A period of pressure and forced change. What isn't working is breaking down.",
  Refinement: "A period of cutting, sharpening, and quality over quantity.",
  Integration: "A period of rest, absorption, and processing what you've been through.",
  Legacy: "A period of building for others and thinking beyond your own timeline.",
};

const PHASE_DO: Record<TimelinePhase, string[]> = {
  Ignition: ["Commit to one clear direction.", "Act on the idea that won't leave you alone.", "Start before you feel ready."],
  Exposure: ["Let people see the real version.", "Share work before it feels finished.", "Stop editing your truth."],
  Construction: ["Finish what already matters before starting something new.", "Simplify commitments.", "Choose depth over speed."],
  Expansion: ["Say yes to growth opportunities.", "Invest in what's working.", "Expand your network deliberately."],
  Friction: ["Face the thing you've been avoiding.", "Let go of what clearly isn't working.", "Use the tension as a signal, not a punishment."],
  Refinement: ["Cut what doesn't serve the core.", "Sharpen your best skill.", "Reduce noise in all areas."],
  Integration: ["Rest without guilt.", "Process what happened before moving forward.", "Let understanding arrive on its own timing."],
  Legacy: ["Build something that survives without you.", "Mentor or teach.", "Think about what you're passing forward."],
};

const PHASE_DONT: Record<TimelinePhase, string[]> = {
  Ignition: ["Wait for perfect conditions.", "Overplan instead of acting.", "Let other people's doubt become yours."],
  Exposure: ["Hide from feedback.", "Perform a polished version instead of the real one.", "Avoid visibility out of fear."],
  Construction: ["Chase novelty to avoid the grind.", "Overcommit to escape boredom.", "Mistake planning for progress."],
  Expansion: ["Expand without standards.", "Say yes to everything.", "Confuse busyness with growth."],
  Friction: ["Numb out to avoid the pain.", "Blame external forces for internal problems.", "Force things to stay the same."],
  Refinement: ["Accumulate more of what isn't working.", "Confuse cutting with quitting.", "Rush into the next thing."],
  Integration: ["Force productivity.", "Compare your pace to others.", "Skip the processing to feel useful."],
  Legacy: ["Build only for ego.", "Ignore the people your work affects.", "Hoard what should be shared."],
};

const PY_REASON: Record<number, string> = {
  1: "Personal Year 1 supports new beginnings and initiative.",
  2: "Personal Year 2 supports cooperation and inner processing.",
  3: "Personal Year 3 supports creative expression and expansion.",
  4: "Personal Year 4 supports structure, discipline, and building.",
  5: "Personal Year 5 supports change, freedom, and disruption.",
  6: "Personal Year 6 supports responsibility, service, and healing.",
  7: "Personal Year 7 supports reflection, analysis, and inner work.",
  8: "Personal Year 8 supports material mastery and consolidation.",
  9: "Personal Year 9 supports completion, release, and legacy.",
};

const AGE_MARKERS: { age: number; label: string; phase_influence?: TimelinePhase }[] = [
  { age: 7, label: "First Saturn square — early identity formation" },
  { age: 14, label: "Saturn opposition — adolescent rebellion and self-discovery" },
  { age: 21, label: "Saturn closing square — entering adulthood" },
  { age: 29, label: "Saturn return — major life restructuring", phase_influence: "Friction" },
  { age: 30, label: "Post-Saturn return — rebuilding on new foundations", phase_influence: "Construction" },
  { age: 36, label: "Midlife adjustment — re-evaluating direction", phase_influence: "Refinement" },
  { age: 42, label: "Uranus opposition — midlife awakening", phase_influence: "Ignition" },
  { age: 44, label: "Second Saturn opposition — testing what you've built", phase_influence: "Friction" },
  { age: 50, label: "Chiron return — integrating old wounds into wisdom", phase_influence: "Integration" },
  { age: 58, label: "Second Saturn return — elder wisdom phase", phase_influence: "Legacy" },
];

function personalYearForDate(birthMonth: number, birthDay: number, targetYear: number): number {
  const sum = (birthMonth + birthDay + targetYear)
    .toString()
    .split("")
    .reduce((a, b) => a + Number(b), 0);
  let reduced = sum;
  while (![11, 22, 33].includes(reduced) && reduced > 9) {
    reduced = reduced
      .toString()
      .split("")
      .reduce((a, b) => a + Number(b), 0);
  }
  return reduced > 9 ? ((reduced - 1) % 9) + 1 : reduced;
}

function buildReasons(phase: TimelinePhase, personalYear: number, age: number, themes: string[]): string[] {
  const reasons: string[] = [];

  const pyReason = PY_REASON[personalYear];
  if (pyReason) reasons.push(pyReason);

  const ageMarker = AGE_MARKERS.find(m => m.age === age);
  if (ageMarker) {
    reasons.push(`Age ${age}: ${ageMarker.label}.`);
  }

  const themePhaseMap: Record<string, TimelinePhase[]> = {
    precision: ["Construction", "Refinement"],
    truth: ["Exposure", "Friction"],
    legacy: ["Legacy", "Construction"],
    freedom: ["Expansion", "Ignition"],
    boundaries: ["Refinement", "Friction"],
    discipline: ["Construction"],
    service: ["Legacy", "Integration"],
  };

  for (const theme of themes) {
    const lower = theme.toLowerCase();
    for (const [keyword, phases] of Object.entries(themePhaseMap)) {
      if (lower.includes(keyword) && phases.includes(phase)) {
        reasons.push(`Your Codex theme "${theme}" reinforces this ${phase} phase.`);
        break;
      }
    }
  }

  return reasons.slice(0, 4);
}

function buildExplanation(
  phase: TimelinePhase,
  age: number,
  personalYear: number,
  isCurrent: boolean,
  isFuture: boolean,
): string {
  const phaseData = PHASE_EXPLANATIONS[phase];
  const parts: string[] = [];

  if (isCurrent) {
    parts.push(`You are here now. ${phaseData.felt}`);
  } else if (isFuture) {
    parts.push(`Coming up: ${phaseData.felt.replace("was ", "will be ").replace("were ", "will be ").replace("appeared", "may appear").replace("became", "may become")}`);
  } else {
    parts.push(phaseData.felt);
  }

  const ageMarker = AGE_MARKERS.find(m => m.age === age);
  if (ageMarker) {
    parts.push(ageMarker.label + ".");
  }

  parts.push(phaseData.lesson);

  return parts.join(" ");
}

export function generateLifeMap(
  birthDate: string,
  futureYears = 5,
  themes: string[] = [],
): LifeMap {
  const birth = new Date(birthDate);
  const birthYear = birth.getFullYear();
  const birthMonth = birth.getMonth() + 1;
  const birthDay = birth.getDate();
  const now = new Date();
  const currentYear = now.getFullYear();

  const startYear = Math.max(birthYear, birthYear + 7);
  const endYear = currentYear + futureYears;

  const years: LifeMapYear[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const age = year - birthYear;
    const pYear = personalYearForDate(birthMonth, birthDay, year);
    const phase = resolveTimeline({ personalYear: pYear, themes });
    const isCurrent = year === currentYear;
    const isFuture = year > currentYear;

    years.push({
      year,
      age,
      phase,
      personalYear: pYear,
      explanation: buildExplanation(phase, age, pYear, isCurrent, isFuture),
      isCurrent,
    });
  }

  const currentIdx = years.findIndex(y => y.isCurrent);
  const currentData = years[currentIdx];
  const prevData = currentIdx > 0 ? years[currentIdx - 1] : null;
  const nextData = currentIdx < years.length - 1 ? years[currentIdx + 1] : null;

  const currentPhase: TimelinePhase = currentData?.phase || "Integration";
  const prevPhase: TimelinePhase = prevData?.phase || "Integration";
  const nextPhase: TimelinePhase = nextData?.phase || "Expansion";

  const currentAge = currentYear - birthYear;
  const currentPY = currentData?.personalYear || 1;

  const currentEra: CurrentEra = {
    phase: currentPhase,
    meaning: PHASE_MEANING[currentPhase],
    reasons: buildReasons(currentPhase, currentPY, currentAge, themes),
    do: PHASE_DO[currentPhase],
    dont: PHASE_DONT[currentPhase],
    nextPhase,
    nextMeaning: `Once this ${currentPhase} phase stabilizes, ${nextPhase} opens. ${PHASE_MEANING[nextPhase]}`,
    previousPhase: prevPhase,
    previousMeaning: `You came from ${prevPhase}. ${PHASE_EXPLANATIONS[prevPhase].felt}`,
  };

  return { birthYear, currentYear, currentEra, years };
}
