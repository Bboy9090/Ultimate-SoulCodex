import type { ClarityReadingModel } from "@/lib/clarityReadingModel";

export type ReadingDepth = "quick" | "standard" | "deep";

export interface DepthChapter {
  id: string;
  eyebrow: string;
  title: string;
  observation: string;
  translation: string;
  dailyLife: string[];
  strength: string;
  cost: string;
  relationshipView: string;
  stressView: string;
  reflection: string;
  action: string;
}

type ChapterSeed = {
  id: string;
  eyebrow: string;
  title: string;
  observation: string;
  counterpart: string;
};

const sentenceCount = (value: string) =>
  value.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length;

export function isTerminalOneLiner(value: string): boolean {
  return value.trim().length < 140 || sentenceCount(value) < 2;
}

function clean(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function translate(seed: ChapterSeed): string {
  return `${clean(seed.observation)} In ordinary life, this is less about a permanent label and more about the move you are most likely to make when the situation touches this theme. The useful question is not only whether the description sounds familiar, but what the move is trying to accomplish and whether it still fits the present moment.`;
}

function dailyExamples(seed: ChapterSeed): string[] {
  return [
    `In decisions, this may appear as a preference for ${seed.counterpart} before you feel settled enough to move.`,
    `In work or creativity, the same pattern may become a reliable skill when you choose it deliberately instead of reacting automatically.`,
    `In conflict, other people may notice the behavior before they understand the need or concern underneath it.`,
  ];
}

function chapter(seed: ChapterSeed, action: string): DepthChapter {
  return {
    ...seed,
    observation: clean(seed.observation),
    translation: translate(seed),
    dailyLife: dailyExamples(seed),
    strength: `At its healthiest, this pattern gives you a deliberate way to create ${seed.counterpart}. The strength is not the reflex itself; it is the judgment, awareness, and timing you develop around it.`,
    cost: `The tradeoff begins when the pattern becomes the only available response. Then a useful strategy can turn rigid, hide new information, or make the present situation answer for an older fear.`,
    relationshipView: `Other people may react to the visible behavior without seeing its purpose. Clarity improves when you name the underlying need directly instead of requiring someone else to decode the pattern from distance, intensity, silence, control, or over-explanation.`,
    stressView: `Under stress, expect this theme to become faster and less flexible. The first sign is usually not the feeling itself, but the urge to repeat a familiar move before checking what this specific moment requires.`,
    reflection: `Where did this pattern protect or strengthen you recently, and where did it continue after the danger or pressure had already passed?`,
    action: clean(action),
  };
}

export function buildDepthChapters(model: ClarityReadingModel): DepthChapter[] {
  const seeds: ChapterSeed[] = [
    {
      id: "visible-pattern",
      eyebrow: "What people may notice",
      title: "The visible pattern",
      observation: model.visiblePattern,
      counterpart: "clarity, control, safety, distance, or forward movement",
    },
    {
      id: "protective-function",
      eyebrow: "What may be underneath",
      title: "The protective function",
      observation: model.protectiveFunction,
      counterpart: "protection without losing honesty or flexibility",
    },
    {
      id: "gift",
      eyebrow: "The developed strength",
      title: "What this pattern can become",
      observation: model.gift,
      counterpart: "discernment, skill, courage, and useful contribution",
    },
    {
      id: "cost",
      eyebrow: "The tradeoff",
      title: "When the strength turns against you",
      observation: model.cost,
      counterpart: "choice instead of repetition",
    },
    {
      id: "relationships",
      eyebrow: "Connection",
      title: "How it may affect relationships",
      observation: model.relationshipImpact,
      counterpart: "connection that does not require mind-reading",
    },
  ];

  return seeds.map((seed) => chapter(seed, model.groundedAction));
}

export function chapterWordCount(chapter: DepthChapter): number {
  return [
    chapter.observation,
    chapter.translation,
    ...chapter.dailyLife,
    chapter.strength,
    chapter.cost,
    chapter.relationshipView,
    chapter.stressView,
    chapter.reflection,
    chapter.action,
  ].join(" ").split(/\s+/).filter(Boolean).length;
}
