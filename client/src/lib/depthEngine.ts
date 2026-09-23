import type { ClarityReadingModel } from "@/lib/clarityReadingModel";

export type ReadingDepth = "quick" | "standard" | "deep";
export type ReadingFit = "very-much" | "partly" | "not-really";
export type ReadingFitMap = Partial<Record<string, ReadingFit>>;

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

type ChapterSeed = Omit<DepthChapter, "observation" | "dailyLife" | "action"> & {
  observation: string;
  decisionExample: string;
  relationshipExample: string;
  workExample: string;
};

const sentenceCount = (value: string) =>
  value.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length;

export function isTerminalOneLiner(value: string): boolean {
  return value.trim().length < 140 || sentenceCount(value) < 2;
}

function clean(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function priorFeedbackNote(priorFits: ReadingFit[]): string {
  if (priorFits.includes("not-really")) {
    return "An earlier layer did not fit your experience, so treat this chapter as a fresh hypothesis rather than an extension of that earlier claim.";
  }
  if (priorFits.includes("partly")) {
    return "Earlier feedback was mixed, so keep the part that matches observable experience and discard the part that does not.";
  }
  if (priorFits.includes("very-much")) {
    return "An earlier layer fit strongly. Check whether this is genuinely connected to the same pattern instead of assuming one accurate insight makes every later one true.";
  }
  return "Use one recent situation as the test case; the reading earns weight only where it matches what actually happened.";
}

function applyFeedback(
  chapter: DepthChapter,
  fit: ReadingFit | undefined,
  priorFits: ReadingFit[],
): DepthChapter {
  const priorNote = priorFeedbackNote(priorFits);

  if (fit === "not-really") {
    return {
      ...chapter,
      translation: `${chapter.translation} You marked this layer as not really fitting, so your lived account takes priority over the model's interpretation.`,
      practicalTakeaway: `You marked this layer as not really fitting. Do not force yourself into it. Name what the model missed, preserve the underlying evidence, and use your correction as the starting point for later chapters. ${priorNote}`,
      reflection: `What is the model getting wrong here, and what description would better match the way this actually works in your life?`,
    };
  }

  if (fit === "partly") {
    return {
      ...chapter,
      practicalTakeaway: `You marked this as partly fitting. Separate the accurate part from the generalized part before using it as guidance. ${priorNote}`,
      reflection: `Which part matches your experience, which part does not, and what context changes the pattern?`,
    };
  }

  if (fit === "very-much") {
    return {
      ...chapter,
      practicalTakeaway: `You marked this as fitting very strongly. Use that confirmation to test the mechanism, not to turn it into a fixed identity. ${priorNote}`,
      reflection: `Where did this pattern show up most clearly in the last month, and what changed when you handled it deliberately instead of automatically?`,
    };
  }

  if (priorFits.length === 0) return chapter;
  return {
    ...chapter,
    practicalTakeaway: `${chapter.practicalTakeaway} ${priorNote}`,
  };
}

function chapter(seed: ChapterSeed, action: string): DepthChapter {
  return {
    id: seed.id,
    eyebrow: seed.eyebrow,
    title: seed.title,
    observation: clean(seed.observation),
    translation: clean(seed.translation),
    dailyLife: [seed.decisionExample, seed.relationshipExample, seed.workExample],
    strength: clean(seed.strength),
    cost: clean(seed.cost),
    misunderstanding: clean(seed.misunderstanding),
    relationshipView: clean(seed.relationshipView),
    stressView: clean(seed.stressView),
    practicalTakeaway: clean(seed.practicalTakeaway),
    reflection: clean(seed.reflection),
    action: clean(action),
  };
}

function signalThread(
  model: ClarityReadingModel,
  preferredIds: string[] = [],
  limit = 3,
): string {
  const preferred = preferredIds
    .map((id) => model.signals.find((signal) => signal.id === id))
    .filter((signal): signal is ClarityReadingModel["signals"][number] => Boolean(signal));
  const remaining = model.signals.filter(
    (signal) => !preferred.some((candidate) => candidate.id === signal.id),
  );
  const selected = [...preferred, ...remaining].slice(0, limit);

  if (selected.length === 0) {
    return "No additional evidence signal is needed to make this useful; keep the interpretation provisional and test it against lived experience.";
  }

  return `For context, the evidence ledger currently includes ${selected
    .map((signal) => `${signal.label}: ${signal.value} [${signal.confidence}]`)
    .join("; ")}. Those signals provide context for reflection; they do not prove the behavioral interpretation by themselves.`;
}

function sourceTension(model: ClarityReadingModel): string {
  return model.coreContradiction?.trim()
    ? `The strongest supplied contradiction is: ${model.coreContradiction.trim()}`
    : `The working tension is between the developed possibility — ${model.gift} — and the stated cost — ${model.cost}`;
}

function buildChapterSeeds(model: ClarityReadingModel): ChapterSeed[] {
  const tension = sourceTension(model);
  const visibleSignals = signalThread(model, ["sun", "moon", "rising", "expression"]);
  const protectionSignals = signalThread(model, ["soul-urge", "hd-authority", "moon"]);
  const giftSignals = signalThread(model, ["expression", "hd-type", "hd-strategy", "life-path"]);
  const costSignals = signalThread(model, ["expression", "soul-urge", "hd-authority"]);
  const relationshipSignals = signalThread(model, [
    "moon",
    "placement-venus",
    "placement-mars",
    "soul-urge",
    "hd-authority",
  ]);

  return [
    {
      id: "visible-pattern",
      eyebrow: "What may show first",
      title: "The visible pattern",
      observation: model.visiblePattern,
      translation: `${model.visiblePattern} ${tension} The Diamond Way does not treat the first visible behavior as the whole person. Read it as a surface move that may change with context, stakes, and choice. ${visibleSignals}`,
      strength: `${model.gift} If the visible pattern is accurate, this is the developed capacity worth protecting. The useful test is whether the behavior helps that capacity become clearer and more deliberate rather than simply more automatic.`,
      cost: `${model.cost} Compare that stated cost with the visible behavior instead of assuming the two are identical. A pattern becomes expensive when the observable result starts moving toward this cost even while the behavior still feels reasonable from the inside.`,
      misunderstanding: `Another person may only see the outward move described here — ${model.visiblePattern} — without access to the protection, tradeoff, or intention underneath it. Treat their reaction as relationship data, not as proof that either reading is complete.`,
      relationshipView: `${model.relationshipImpact} Use that relationship layer to check whether the visible pattern becomes easier to understand when expectations are spoken instead of inferred.`,
      stressView: `Under pressure, watch whether the visible pattern accelerates the stated cost — ${model.cost} — or whether the contradiction can be sequenced instead of forced into one answer: ${tension}`,
      practicalTakeaway: `Use one recent situation as the experiment. Mark what happened immediately before the visible pattern appeared, what you did next, and whether the result moved toward the stated gift or the stated cost. Then use the grounded action: ${model.groundedAction}`,
      reflection: "What did you actually do the last time this visible pattern showed up, and did the result look more like the gift or more like the cost?",
      decisionExample: `Decision check: when this pattern appears around a choice, separate the observable move — ${model.visiblePattern} — from the story you tell yourself about why it happened.`,
      relationshipExample: `Relationship check: compare the visible move with the supplied relationship impact — ${model.relationshipImpact}`,
      workExample: `Execution check: test whether this pattern is helping the supplied gift become usable — ${model.gift} — or extending the supplied cost — ${model.cost}`,
    },
    {
      id: "protective-function",
      eyebrow: "What it may be protecting",
      title: "The protective function",
      observation: model.protectiveFunction,
      translation: `${model.protectiveFunction} Protection is a hypothesis about function, not a diagnosis or invented backstory. Compare it with the visible pattern: ${model.visiblePattern} If both descriptions fit, the deeper question is what the behavior preserves, prevents, or makes easier in the present situation. ${protectionSignals}`,
      strength: `The protective function can be useful when it creates enough room for the stated gift to operate deliberately: ${model.gift} A useful protection increases choice; it does not need to explain every part of the personality.`,
      cost: `The same strategy should be questioned when it starts producing the supplied cost: ${model.cost} That comparison gives you a practical boundary between protection that is serving the present and protection that may be running after its usefulness has changed.`,
      misunderstanding: `If the protective reading fits internally but the visible behavior looks different externally, other people may respond to ${model.visiblePattern} without knowing that ${model.protectiveFunction} is the function you recognize underneath it.`,
      relationshipView: `${model.relationshipImpact} If protection is part of the exchange, make the need or boundary explicit enough that another person can respond to it rather than forcing both people to guess.`,
      stressView: `Stress can make a protective strategy feel automatically necessary. Compare the present facts with the stated cost — ${model.cost} — before increasing the intensity of the same protection.`,
      practicalTakeaway: `Name one thing the pattern genuinely protects and one thing it may unnecessarily restrict. Keep the first distinction separate from the second. Then test this supplied action: ${model.groundedAction}`,
      reflection: "What is this pattern protecting in the present situation, and what evidence would show that the protection is no longer needed at the same intensity?",
      decisionExample: `Decision check: ask whether ${model.protectiveFunction} is responding to current evidence or simply appearing whenever the choice feels consequential.`,
      relationshipExample: `Relationship check: state the protected need plainly, then compare the response with this supplied relationship pattern — ${model.relationshipImpact}`,
      workExample: `Execution check: notice whether protection gives the gift room to work — ${model.gift} — or pushes the process toward the stated cost — ${model.cost}`,
    },
    {
      id: "gift",
      eyebrow: "What may become skill",
      title: "The developed gift",
      observation: model.gift,
      translation: `${model.gift} The gift is most useful when it can be separated from the automatic pattern that may accompany it. Compare the gift with the visible pattern — ${model.visiblePattern} — and the protective function — ${model.protectiveFunction} The point is to keep the capability without requiring the same defense or overuse every time. ${giftSignals}`,
      strength: `${model.gift} Treat this as a capability to test in behavior. A developed gift should produce something observable: a cleaner decision, a clearer conversation, more useful work, a stronger boundary, or another result you can name afterward.`,
      cost: `${model.cost} The Diamond Way check is whether the gift is still creating value once this cost begins to rise. Being capable of doing more is not the same as more being required.`,
      misunderstanding: `People may respond to the visible pattern — ${model.visiblePattern} — and miss the developed capacity named here: ${model.gift} That gap is worth noticing without assuming that either perspective is automatically the correct one.`,
      relationshipView: `${model.relationshipImpact} Ask whether the gift helps the relationship become more reciprocal and legible, or whether it turns into work you perform on behalf of the entire connection.`,
      stressView: `A developed gift can become overused under pressure. The stress test is whether ${model.gift} is still producing its intended value or has started reproducing the stated cost — ${model.cost}`,
      practicalTakeaway: `Choose one place where this gift can create a measurable improvement without taking over the whole problem. Define what "enough" looks like before you begin. Then apply: ${model.groundedAction}`,
      reflection: "Where does this gift feel chosen and effective, and where does using it begin to feel compulsory or responsible for everybody else's outcome?",
      decisionExample: `Decision check: use the gift — ${model.gift} — to improve the choice, then stop once the decision has enough support to move.`,
      relationshipExample: `Relationship check: compare the gift with the actual exchange described here — ${model.relationshipImpact}`,
      workExample: `Execution check: define the result this gift is meant to improve, so capability does not silently expand the assignment.`,
    },
    {
      id: "cost",
      eyebrow: "Where the pattern may overreach",
      title: "The tradeoff",
      observation: model.cost,
      translation: `${model.cost} A cost is useful only if it can be recognized in actual outcomes. Compare it with the visible pattern — ${model.visiblePattern} — and the gift — ${model.gift} The same behavior can be constructive in one context and too expensive in another; the difference is what it produces, not whether the behavior has a respectable name. ${costSignals}`,
      strength: `Seeing the cost clearly lets you keep what is useful in the gift — ${model.gift} — without treating the entire pattern as a flaw. The strength is the ability to change dose, timing, or context instead of choosing between total identification and total rejection.`,
      cost: `${model.cost} Use this sentence as the warning condition. If the pattern repeatedly produces that outcome, more effort in the same direction is information, not automatically a solution.`,
      misunderstanding: `A person can look highly capable while privately paying the cost described here. Conversely, somebody else may see a cost where you do not. The app should not decide that disagreement for you; compare both views with observable results.`,
      relationshipView: `${model.relationshipImpact} In relationships, watch whether the stated cost is shared, repaired, or repeatedly absorbed by one person while the surface pattern continues unchanged.`,
      stressView: `When pressure rises, use the cost itself as the warning signal: ${model.cost} If that outcome is increasing, changing dose, sequence, or support is more informative than simply trying harder.`,
      practicalTakeaway: `Give the pattern an exit condition. Decide what result would tell you to continue, adjust, ask for help, or stop. Pair that condition with the supplied grounded action: ${model.groundedAction}`,
      reflection: "What observable result would tell you that this pattern has crossed from useful effort into the cost named here?",
      decisionExample: `Decision check: before investing another round of effort, compare the expected benefit with this stated cost — ${model.cost}`,
      relationshipExample: `Relationship check: look for reciprocity around the supplied relationship pattern — ${model.relationshipImpact}`,
      workExample: `Execution check: preserve the gift — ${model.gift} — while adding a stopping rule for the cost.`,
    },
    {
      id: "relationships",
      eyebrow: "How the pattern meets another person",
      title: "Relationship dynamics",
      observation: model.relationshipImpact,
      translation: `${model.relationshipImpact} Relationship interpretation should describe an exchange, not assign destiny or compatibility from one person's symbols. Bring the visible pattern — ${model.visiblePattern} — and the protective function — ${model.protectiveFunction} — into the same frame, then ask what another person can actually observe, respond to, or misunderstand. ${relationshipSignals}`,
      strength: `${model.gift} In connection, that gift matters most when it improves mutual understanding or action without erasing another person's agency, needs, or version of events.`,
      cost: `${model.cost} In a relationship, the cost deserves attention when one person repeatedly has to absorb, translate, compensate for, or guess around the pattern while the underlying need remains unspoken.`,
      misunderstanding: `The supplied visible pattern — ${model.visiblePattern} — may be interpreted differently by another person. Instead of choosing whose interpretation wins, compare both accounts with the actual sequence of events and what each person was trying to protect or request.`,
      relationshipView: `${model.relationshipImpact} Treat this as the starting hypothesis for a conversation, then let the other person's lived account add information the chart or symbolic model cannot know.`,
      stressView: `Under relationship stress, separate what you observed from what you inferred. Hold the supplied impact — ${model.relationshipImpact} — beside the contradiction — ${tension} — and ask which part is actually active in this exchange.`,
      practicalTakeaway: `Turn one unspoken expectation into a concrete request that permits a real yes, no, or counteroffer. Then test the broader grounded action: ${model.groundedAction}`,
      reflection: "What relationship need is currently being communicated indirectly through behavior, and what would it sound like as a clear request rather than a test?",
      decisionExample: `Decision check: before deciding for the relationship, separate your own pattern from the other person's stated needs and choices.`,
      relationshipExample: `Relationship check: use this supplied pattern as a hypothesis to discuss — ${model.relationshipImpact} — not as a verdict about the bond.`,
      workExample: `Team check: notice whether the relationship pattern improves coordination or creates hidden labor that nobody has explicitly agreed to carry.`,
    },
  ];
}

export function buildDepthChapters(
  model: ClarityReadingModel,
  fits: ReadingFitMap = {},
): DepthChapter[] {
  const seeds = buildChapterSeeds(model);

  return seeds.map((seed, index) => {
    const built = chapter(seed, model.groundedAction);
    const priorFits = seeds
      .slice(0, index)
      .map((priorSeed) => fits[priorSeed.id])
      .filter((fit): fit is ReadingFit => Boolean(fit));
    return applyFeedback(built, fits[seed.id], priorFits);
  });
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
