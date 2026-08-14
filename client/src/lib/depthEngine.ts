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

function clean(value: string): string {
  return value.trim().replace(/\s+/g, " ");
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

export function buildDepthChapters(
  model: ClarityReadingModel,
  fits: ReadingFitMap = {},
): DepthChapter[] {
  const seeds: ChapterSeed[] = [
    {
      id: "visible-pattern",
      eyebrow: "What people may notice",
      title: "The visible pattern",
      observation: model.visiblePattern,
      translation: `${model.visiblePattern} The useful question is not whether this describes you forever, but what your attention does first when stakes rise. A visible habit can be skilled and intentional in one setting, then become a reflex in another. Look for the moment when careful observation stops gathering useful information and starts postponing a choice you already understand well enough to make.`,
      strength: "Discernment becomes valuable when it produces a cleaner decision, a more useful explanation, or a result that survives contact with reality. People may trust this side of you because you notice weak links before they become expensive problems and because you are willing to improve the work instead of merely defending it.",
      cost: "The same sensitivity can create an ever-moving finish line. Once every improvement reveals another possible improvement, quality stops being a standard and becomes a reason not to release, decide, or rest. The cost is not simply overthinking; it is allowing analysis to consume the moment when information should become action.",
      misunderstanding: "Other people may read careful processing as hesitation, emotional distance, or a need to control the outcome. They may not realize you are trying to reduce avoidable mistakes before you commit.",
      relationshipView: "People close to you may experience the pause before your answer more strongly than the reasoning happening inside it. If they cannot see the evaluation process, they may fill the silence with their own explanation. A short sentence such as 'I am checking what I actually think before I answer' can preserve both your processing time and the relationship's sense of contact.",
      stressView: "Under pressure, discernment can become a hunt for the one missing fact that would finally remove uncertainty. That fact often does not exist. The warning sign is not thinking itself; it is collecting information after the next safe, reversible step is already visible.",
      practicalTakeaway: "Choose one current decision and define the evidence threshold before gathering anything else. When that threshold is met, move. This protects the quality of your judgment without making certainty the price of action.",
      reflection: "Where are you still gathering information because it is useful, and where are you gathering it because deciding would make the situation real?",
      decisionExample: "In decisions, you may gather more context than other people expect because acting without understanding feels less responsible than waiting a little longer.",
      relationshipExample: "In conflict, you may become quieter or more explanatory while you sort out what is true, even when the other person interprets that pause as withdrawal.",
      workExample: "In work or creativity, you may notice weak links, inconsistencies, and unfinished details before others do, which can improve the result but also make completion harder.",
    },
    {
      id: "protective-function",
      eyebrow: "What may be underneath",
      title: "The protective function",
      observation: model.protectiveFunction,
      translation: `${model.protectiveFunction} Protection is different from personality. A strategy can develop because it once reduced exposure to disappointment, chaos, dependence, or being trapped without options. The important distinction is whether today's caution is responding to present evidence or to an older lesson that still expects the same danger. Safety becomes healthier when it gives you room to choose rather than requiring you to predict every possible failure in advance.`,
      strength: "Preparation can preserve freedom. Backups, clear expectations, reversible choices, and careful trust-building can keep one bad outcome from controlling the entire situation. At its best, this is not fearfulness; it is the ability to create enough structure that honesty and vulnerability do not require recklessness.",
      cost: "Protection becomes expensive when every relationship needs another test, every plan needs another contingency, or every commitment needs an escape route before it can feel safe. The strategy then prevents surprise by also preventing surrender, spontaneity, and the experience of learning that another person can carry part of the risk with you.",
      misunderstanding: "Someone may call the behavior guarded, stubborn, or overly cautious when the deeper issue is often a wish to avoid being exposed without support or trapped without options.",
      relationshipView: "A partner or friend can respect caution more easily when they know what earns trust. Silent testing leaves them guessing about rules they were never told existed. Naming the actual condition, such as consistency, follow-through, privacy, or time, turns protection from a hidden exam into a boundary another person can consciously meet or decline.",
      stressView: "When safety feels threatened, the mind can widen the threat model until everything becomes evidence for staying guarded. Watch for the shift from 'I need one clear boundary' to 'I need to control every variable.' That expansion is usually the point where protection starts creating the isolation it was trying to prevent.",
      practicalTakeaway: "Identify one protection you genuinely need and one precaution you are maintaining mostly from habit. Keep the boundary that protects dignity; loosen the extra layer that only promises impossible certainty.",
      reflection: "What would make this situation meaningfully safer, and which additional precautions would merely make it feel more controllable?",
      decisionExample: "Before agreeing, you may check whether you can reverse the decision, whether the other person is dependable, and what happens if the plan fails.",
      relationshipExample: "You may reveal yourself in stages, watching how someone handles smaller truths before trusting them with the more vulnerable ones.",
      workExample: "You may build backups, contingency plans, or extra structure because being unprepared feels more dangerous than doing additional work.",
    },
    {
      id: "gift",
      eyebrow: "The developed strength",
      title: "What this pattern can become",
      observation: model.gift,
      translation: `${model.gift} A developed strength is not the same thing as the habit that produced it. The mature version keeps the useful perception while dropping the compulsion to prove worth through constant fixing. What matters is whether your attention can move from noticing a problem to selecting the right level of response, then stop once the response has done its job.`,
      strength: "This can become practical intelligence: seeing patterns across messy information, translating them into something another person can use, and building a solution that works outside theory. The distinctive value is not perfection. It is the combination of observation, correction, and usefulness, especially when other people can feel that the result became clearer because you touched it.",
      cost: "Competence attracts work. Once people learn that you can repair the broken process, remember the overlooked detail, or carry the complicated part, usefulness can quietly become a job you never agreed to. The danger is measuring your value by how much difficulty you can absorb before anyone else has to notice it.",
      misunderstanding: "People may see the result and assume it comes easily. They may miss the private effort, observation, restraint, and repeated correction behind what looks like natural ability.",
      relationshipView: "Care expressed through solving can be deeply valuable, but not everyone experiences a solution as closeness. Sometimes the needed response is repair; sometimes it is presence; sometimes it is letting the other person own the problem. Asking which kind of help is wanted protects your gift from turning into uninvited management.",
      stressView: "When identity gets tied to competence, asking for help can feel more threatening than doing twice the work. A useful warning sign is resentment toward people who never had a chance to know you needed support. That usually means the strength has crossed from contribution into over-functioning.",
      practicalTakeaway: "Before fixing the next problem, decide whether it is yours, whether help was requested, and what 'enough' looks like. Use your capability where it creates leverage, not merely where it can prevent somebody else from being uncomfortable.",
      reflection: "Which parts of your usefulness feel chosen and energizing, and which parts have become obligations you maintain because being needed feels safer than being supported?",
      decisionExample: "You may be strongest when a situation is messy enough to require pattern recognition but real enough that the answer must work outside theory.",
      relationshipExample: "You may show care through fixing, researching, remembering details, or building something useful rather than relying only on emotional language.",
      workExample: "You can connect ideas across subjects and turn them into systems, stories, tools, or explanations that did not exist in that form before.",
    },
    {
      id: "cost",
      eyebrow: "The tradeoff",
      title: "When the strength turns against you",
      observation: model.cost,
      translation: `${model.cost} The tradeoff matters because strengths rarely announce the moment they become liabilities. They usually keep the same respectable name: quality, loyalty, responsibility, patience. The shift is visible in the result. If the strategy is producing less movement, less reciprocity, or less room to recover while demanding more effort, the original virtue may still be real but the current dose is wrong.`,
      strength: "Recognizing the overuse pattern creates a form of choice that raw discipline cannot. You can keep standards without endless revision, keep loyalty without financing one-sided relationships, and keep responsibility without volunteering for every unclaimed burden. The strength here is learning that completion and boundaries can protect quality rather than betray it.",
      cost: "The clearest cost is expansion without an exit condition. A task grows because you can imagine improvements; a bond continues because history makes leaving feel like failure; a responsibility grows because nobody else picked it up. Eventually the standard becomes larger than the life it was supposed to serve.",
      misunderstanding: "From the outside, this may look inconsistent: highly capable in one moment and stalled in another. The missing context is often that the internal standard has grown larger than the task itself.",
      relationshipView: "People can become accustomed to the version of you who compensates for missing effort. When you finally stop, they may experience the boundary as a sudden change even though the imbalance has been growing for a long time. Earlier, smaller boundaries usually create less damage than one exhausted final boundary.",
      stressView: "Stress makes sunk costs persuasive. The more time, care, money, or identity invested, the harder it becomes to ask whether continuing still makes sense. Watch for arguments based entirely on how much has already been spent rather than what the next investment is likely to produce.",
      practicalTakeaway: "Give one current commitment an explicit stopping rule. Define what progress, reciprocity, or usefulness must be present for another round of effort to make sense. If the condition is absent, finishing may mean stopping rather than improving.",
      reflection: "What are you continuing mainly because stopping would force you to admit that earlier effort cannot guarantee the outcome you wanted?",
      decisionExample: "You may delay releasing something because you can already see the next five improvements, even though the current version is useful and ready to be tested.",
      relationshipExample: "You may keep repairing a bond because leaving feels like failure, even after the relationship has stopped meeting you with the same effort.",
      workExample: "You may absorb extra roles because you can see how to do them, then become resentful that everyone assumes you will continue carrying the weight.",
    },
    {
      id: "relationships",
      eyebrow: "Connection",
      title: "How it may affect relationships",
      observation: model.relationshipImpact,
      translation: `${model.relationshipImpact} Relationship patterns become useful only when they describe an exchange between two people rather than turning one person's preferences into destiny. Reliability, space, truth, repair, affection, and independence can all matter at once. The task is to make those needs legible enough that another person can respond to them instead of being judged against expectations they never heard.`,
      strength: "Loyalty can become a durable relational skill when it includes truth. Remembering details, showing up, noticing what is unsaid, and taking repair seriously can create uncommon stability. The developed version also leaves enough room for both people to have limits, separate identities, and the right to change their minds without making every difference a threat to the bond.",
      cost: "Connection becomes costly when care turns into mind-reading, silent testing, or carrying the relationship for two people. History can then receive more loyalty than the current reality. Staying because a bond once mattered is different from staying because both people are still participating in what it is now.",
      misunderstanding: "A need for space may be mistaken for rejection, while intense loyalty may be mistaken for unlimited tolerance. Both readings miss the need for closeness without loss of self.",
      relationshipView: "The strongest version of this pattern makes expectations explicit before resentment has to speak for them. It lets closeness coexist with a self that does not disappear into the relationship. Repair becomes something both people do, not a service one person performs whenever the connection becomes unstable.",
      stressView: "When a bond feels uncertain, you may be tempted either to over-function or to retreat until the other person proves they will come after you. Both moves create information, but neither is as clean as asking directly for the behavior you need and observing the answer.",
      practicalTakeaway: "Choose one relationship need that has been living mostly as an expectation. State it as a concrete request with room for a real yes or no. The response gives you better information than another round of guessing, testing, or compensating.",
      reflection: "Where are you relating to the person in front of you, and where are you still relating to the history, potential, or role you hoped the bond would fulfill?",
      decisionExample: "You may take longer to decide whether someone is truly safe, but once you decide they belong in your inner circle, you may invest deeply.",
      relationshipExample: "You may tolerate more than people realize before walking away because ending the bond can feel like abandoning the meaning, effort, and history attached to it.",
      workExample: "In teams, you may become the translator, stabilizer, or person who quietly notices what everyone else is avoiding, even when that labor is not formally recognized.",
    },
  ];

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
