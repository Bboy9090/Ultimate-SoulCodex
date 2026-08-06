import type { ClarityReadingModel } from "@/lib/clarityReadingModel";

export type ReadingDepth = "quick" | "standard" | "deep";
export type ReadingFit = "very-much" | "partly" | "not-really";

export interface DepthChapter {
  id: string;
  eyebrow: string;
  title: string;
  observation: string;
  translation: string;
  dailyLife: string[];
  strength: string;
  cost: string;
  misunderstanding: string;
  relationshipView: string;
  stressView: string;
  practicalTakeaway: string;
  reflection: string;
  action: string;
}

type ChapterSeed = {
  id: string;
  eyebrow: string;
  title: string;
  observation: string;
  healthyAim: string;
  overuseRisk: string;
  misunderstanding: string;
  decisionExample: string;
  relationshipExample: string;
  workExample: string;
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
  return `${clean(seed.observation)} This is not best understood as a fixed trait stamped onto your identity. It is a pattern of attention and response that may become more visible when this part of life matters to you. In real situations, the pattern can help you create ${seed.healthyAim}; the important question is whether you are choosing it for the present moment or repeating it because it once kept you safe.`;
}

function dailyExamples(seed: ChapterSeed): string[] {
  return [
    seed.decisionExample,
    seed.relationshipExample,
    seed.workExample,
  ];
}

function chapter(seed: ChapterSeed, action: string): DepthChapter {
  return {
    ...seed,
    observation: clean(seed.observation),
    translation: translate(seed),
    dailyLife: dailyExamples(seed),
    strength: `When used consciously, this pattern can become ${seed.healthyAim}. You are not merely reacting; you are turning sensitivity to this theme into judgment, timing, and a dependable way of responding. That is the part other people may come to trust in you.`,
    cost: `The tradeoff appears when the same strategy becomes automatic. Then ${seed.overuseRisk}. A strength can keep its honorable name long after it has stopped helping, which is how people end up defending exhaustion as loyalty, delay as wisdom, or control as responsibility.`,
    misunderstanding: seed.misunderstanding,
    relationshipView: `In close relationships, people usually meet the visible behavior before they understand the need beneath it. Naming the need directly gives the other person a fair chance to respond. Without that translation, they may react to your silence, intensity, distance, fixing, or over-explaining and completely miss what you were trying to protect.`,
    stressView: `Under pressure, this theme is likely to become faster, narrower, and less flexible. You may repeat the familiar move before checking whether this situation is actually the same as the one that taught you the move. The earliest warning sign is often urgency: the feeling that you must decide, withdraw, explain, repair, or take over immediately.`,
    practicalTakeaway: `Before acting, name three things: what you are protecting, what the present evidence actually shows, and what response would preserve both self-respect and flexibility. That turns a personality description into a usable decision.` ,
    reflection: `Where has this pattern genuinely helped you recently, and where did it continue after the pressure, danger, or obligation had already passed?`,
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
      healthyAim: "clarity and deliberate movement without pretending certainty",
      overuseRisk: "you can keep analyzing, explaining, or managing long after a simpler response would be more honest",
      misunderstanding: "Other people may read careful processing as hesitation, emotional distance, or a need to control the outcome. They may not realize you are trying to reduce avoidable mistakes before you commit.",
      decisionExample: "In decisions, you may gather more context than other people expect because acting without understanding feels less responsible than waiting a little longer.",
      relationshipExample: "In conflict, you may become quieter or more explanatory while you sort out what is true, even when the other person interprets that pause as withdrawal.",
      workExample: "In work or creativity, you may notice weak links, inconsistencies, and unfinished details before others do, which can improve the result but also make completion harder.",
    },
    {
      id: "protective-function",
      eyebrow: "What may be underneath",
      title: "The protective function",
      observation: model.protectiveFunction,
      healthyAim: "safety that does not require losing honesty, dignity, or freedom",
      overuseRisk: "protection can become isolation, testing, over-preparation, or an attempt to prevent every possible disappointment",
      misunderstanding: "Someone may call the behavior guarded, stubborn, or overly cautious when the deeper issue is often a wish to avoid being exposed without support or trapped without options.",
      decisionExample: "Before agreeing, you may check whether you can reverse the decision, whether the other person is dependable, and what happens if the plan fails.",
      relationshipExample: "You may reveal yourself in stages, watching how someone handles smaller truths before trusting them with the more vulnerable ones.",
      workExample: "You may build backups, contingency plans, or extra structure because being unprepared feels more dangerous than doing additional work.",
    },
    {
      id: "gift",
      eyebrow: "The developed strength",
      title: "What this pattern can become",
      observation: model.gift,
      healthyAim: "discernment, courage, practical wisdom, and contribution that other people can actually use",
      overuseRisk: "competence can turn into carrying everything, solving what was not yours, or believing you must remain useful to remain valued",
      misunderstanding: "People may see the result and assume it comes easily. They may miss the private effort, observation, restraint, and repeated correction behind what looks like natural ability.",
      decisionExample: "You may be strongest when a situation is messy enough to require pattern recognition but real enough that the answer must work outside theory.",
      relationshipExample: "You may show care through fixing, researching, remembering details, or building something useful rather than relying only on emotional language.",
      workExample: "You can connect ideas across subjects and turn them into systems, stories, tools, or explanations that did not exist in that form before.",
    },
    {
      id: "cost",
      eyebrow: "The tradeoff",
      title: "When the strength turns against you",
      observation: model.cost,
      healthyAim: "choice instead of repetition and completion without abandoning quality",
      overuseRisk: "improvement can become endless revision, loyalty can outlive reciprocity, and responsibility can expand until there is no room left for rest",
      misunderstanding: "From the outside, this may look inconsistent: highly capable in one moment and stalled in another. The missing context is often that the internal standard has grown larger than the task itself.",
      decisionExample: "You may delay releasing something because you can already see the next five improvements, even though the current version is useful and ready to be tested.",
      relationshipExample: "You may keep repairing a bond because leaving feels like failure, even after the relationship has stopped meeting you with the same effort.",
      workExample: "You may absorb extra roles because you can see how to do them, then become resentful that everyone assumes you will continue carrying the weight.",
    },
    {
      id: "relationships",
      eyebrow: "Connection",
      title: "How it may affect relationships",
      observation: model.relationshipImpact,
      healthyAim: "loyal connection with room for truth, boundaries, independence, and repair",
      overuseRisk: "care can become mind-reading, silent testing, over-functioning, or staying loyal to the history of a bond rather than its present reality",
      misunderstanding: "A need for space may be mistaken for rejection, while intense loyalty may be mistaken for unlimited tolerance. Both readings miss the need for closeness without loss of self.",
      decisionExample: "You may take longer to decide whether someone is truly safe, but once you decide they belong in your inner circle, you may invest deeply.",
      relationshipExample: "You may tolerate more than people realize before walking away because ending the bond can feel like abandoning the meaning, effort, and history attached to it.",
      workExample: "In teams, you may become the translator, stabilizer, or person who quietly notices what everyone else is avoiding, even when that labor is not formally recognized.",
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
    chapter.misunderstanding,
    chapter.relationshipView,
    chapter.stressView,
    chapter.practicalTakeaway,
    chapter.reflection,
    chapter.action,
  ].join(" ").split(/\s+/).filter(Boolean).length;
}
