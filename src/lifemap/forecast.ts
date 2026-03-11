import type { LifeMap, LifeMapYear, TimelinePhase } from "../types/soulcodex";
import { resolveTimeline } from "../timeline/engine";

export type { LifeMap, LifeMapYear };

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

const AGE_MARKERS: { age: number; label: string }[] = [
  { age: 7, label: "First Saturn square — early identity formation" },
  { age: 14, label: "Saturn opposition — adolescent rebellion and self-discovery" },
  { age: 21, label: "Saturn closing square — entering adulthood" },
  { age: 29, label: "Saturn return — major life restructuring" },
  { age: 30, label: "Post-Saturn return — rebuilding on new foundations" },
  { age: 36, label: "Midlife adjustment — re-evaluating direction" },
  { age: 42, label: "Uranus opposition — midlife awakening" },
  { age: 44, label: "Second Saturn opposition — testing what you've built" },
  { age: 50, label: "Chiron return — integrating old wounds into wisdom" },
  { age: 58, label: "Second Saturn return — elder wisdom phase" },
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

  return { birthYear, currentYear, years };
}
