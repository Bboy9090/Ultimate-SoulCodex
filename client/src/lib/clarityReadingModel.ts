export type ClarityConfidence =
  | "verified"
  | "deterministic"
  | "supported"
  | "tentative"
  | "unavailable";

export interface ClaritySignal {
  id: string;
  label: string;
  value: string;
  confidence: ClarityConfidence;
  source: string;
}

export interface ClarityReadingModel {
  title: string;
  summary: string;
  coreContradiction?: string;
  visiblePattern: string;
  protectiveFunction: string;
  gift: string;
  cost: string;
  relationshipImpact: string;
  groundedAction: string;
  signals: ClaritySignal[];
  limitations: string[];
}

type AnyRecord = Record<string, any>;
type ProgressiveSections = Pick<
  ClarityReadingModel,
  "visiblePattern" | "protectiveFunction" | "gift" | "cost" | "relationshipImpact"
>;

type NumberTheme = {
  label: string;
  drive: string;
  pull: string;
  risk: string;
};

const DEFAULT_ACTION =
  "Choose one situation where you usually over-explain, delay, perform, withdraw, or take over. Replace the automatic move with one direct sentence and one observable action. Record what actually happened.";

const FALLBACKS = {
  visiblePattern:
    "Notice the behavior that appears first under pressure. That visible move is useful evidence, but it is not the whole person.",
  protectiveFunction:
    "Ask what the pattern prevents, preserves, or helps you avoid. Protection explains the behavior without excusing its cost.",
  gift:
    "The gift is not the automatic pattern itself. It is the deliberate skill that remains after fear, performance, and overuse are removed.",
  cost:
    "The cost appears when a once-useful strategy becomes rigid, repetitive, or more important than the present reality.",
  relationshipImpact:
    "In relationships, the work is to make the hidden need speak plainly before another person is forced to interpret the behavior.",
};

const EXPRESSION_THEMES: Record<number, NumberTheme> = {
  1: { label: "Independence", drive: "self-directed initiation and leadership", pull: "choose the direction and move in your own way", risk: "treating collaboration as interference when autonomy feels threatened" },
  2: { label: "Cooperation", drive: "mediation, partnership, and relational awareness", pull: "build agreement before forcing movement", risk: "over-adjusting to preserve connection" },
  3: { label: "Expression", drive: "creative communication and visible self-expression", pull: "turn experience into something that can be shared", risk: "opening new expressions faster than they can be completed" },
  4: { label: "Structure", drive: "reliability, order, and durable execution", pull: "create a dependable system before expanding", risk: "protecting the structure after the situation has changed" },
  5: { label: "Freedom", drive: "adaptability, experimentation, and movement", pull: "keep enough room to pivot and discover", risk: "mistaking necessary repetition for confinement" },
  6: { label: "Stewardship", drive: "responsibility, care, and practical support", pull: "make the environment more dependable for the people in it", risk: "becoming responsible for work or needs that were never actually assigned" },
  7: { label: "Analysis", drive: "investigation, private mastery, and depth", pull: "understand the underlying pattern before accepting the surface answer", risk: "waiting for a level of certainty the decision cannot provide" },
  8: { label: "Power", drive: "leadership, achievement, and material effectiveness", pull: "turn ability into visible impact and authority", risk: "using output as the main evidence of worth" },
  9: { label: "Contribution", drive: "completion, perspective, and service beyond the self", pull: "connect personal effort to a larger purpose", risk: "overextending because the mission always contains another need" },
  11: { label: "Vision", drive: "inspiration, intuition, and expressive influence", pull: "translate an unusual perception into something others can recognize", risk: "treating intensity or inspiration as proof" },
  22: { label: "Master Building", drive: "large-scale structure and practical vision", pull: "turn an ambitious idea into something durable", risk: "letting the scale of the mission become personally crushing" },
  33: { label: "Teaching", drive: "service, example, and compassionate leadership", pull: "make experience useful to other people", risk: "becoming responsible for everybody else's growth" },
};

const SOUL_URGE_THEMES: Record<number, NumberTheme> = {
  1: { label: "Autonomy", drive: "inner independence and self-definition", pull: "know that the final choice is genuinely yours", risk: "withdrawing when closeness begins to feel like control" },
  2: { label: "Belonging", drive: "emotional reciprocity and partnership", pull: "feel mutuality rather than carrying connection alone", risk: "silencing a preference to keep the bond calm" },
  3: { label: "Joy", drive: "expression, play, and emotional visibility", pull: "feel free to say, create, and enjoy what is alive", risk: "using stimulation to outrun disappointment or depth" },
  4: { label: "Security", drive: "predictability, loyalty, and grounded order", pull: "know what can be relied on before relaxing into it", risk: "confusing familiarity with safety" },
  5: { label: "Freedom", drive: "experience, movement, and personal latitude", pull: "have enough space to keep becoming rather than feeling trapped", risk: "leaving before a stable commitment has time to deepen" },
  6: { label: "Responsibility", drive: "care, loyalty, and dependable belonging", pull: "make sure important people and commitments are genuinely cared for", risk: "taking ownership of other people's needs until care becomes obligation" },
  7: { label: "Meaning", drive: "privacy, understanding, and inward depth", pull: "have enough quiet to know what you actually believe", risk: "using privacy to avoid being known while still wanting deep connection" },
  8: { label: "Impact", drive: "competence, influence, and earned respect", pull: "know that your effort can materially change the outcome", risk: "equating control of the outcome with emotional security" },
  9: { label: "Compassion", drive: "human concern, release, and contribution", pull: "feel that what matters to you serves something larger than ego", risk: "remaining responsible for people or endings that are no longer yours to carry" },
  11: { label: "Inspiration", drive: "meaning, sensitivity, and intuitive resonance", pull: "feel that inner perception can become something meaningful", risk: "overloading ordinary events with significance" },
  22: { label: "Legacy", drive: "durable contribution and large-scale purpose", pull: "build something that outlasts the immediate moment", risk: "making every decision answer to an enormous future burden" },
  33: { label: "Compassionate Service", drive: "care, teaching, and restorative contribution", pull: "help without abandoning the humanity of the person being helped", risk: "confusing love with responsibility for another person's healing" },
};

export function firstSupportedText(...values: unknown[]): string | undefined {
  return values.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  ) as string | undefined;
}

function sectionText(section: unknown): string | undefined {
  if (typeof section === "string") return section.trim() || undefined;
  if (!section || typeof section !== "object") return undefined;
  const record = section as AnyRecord;
  return firstSupportedText(
    record.summary,
    record.description,
    record.text,
    record.body,
    record.insight,
    record.value,
  );
}

function normalized(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function makeProgressiveSections(summary: string, values: ProgressiveSections) {
  const used = new Set([normalized(summary)]);
  const choose = (value: string, fallback: string) => {
    const key = normalized(value);
    if (!key || used.has(key)) {
      used.add(normalized(fallback));
      return fallback;
    }
    used.add(key);
    return value;
  };

  return {
    visiblePattern: choose(values.visiblePattern, FALLBACKS.visiblePattern),
    protectiveFunction: choose(values.protectiveFunction, FALLBACKS.protectiveFunction),
    gift: choose(values.gift, FALLBACKS.gift),
    cost: choose(values.cost, FALLBACKS.cost),
    relationshipImpact: choose(values.relationshipImpact, FALLBACKS.relationshipImpact),
  };
}

function addSignal(
  signals: ClaritySignal[],
  id: string,
  label: string,
  value: unknown,
  confidence: ClarityConfidence,
  source: string,
) {
  if (signals.some((signal) => signal.id === id)) return;
  if (typeof value !== "string" && typeof value !== "number") return;
  const clean = String(value).trim();
  if (clean) signals.push({ id, label, value: clean, confidence, source });
}

function parsedNumber(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

function appendTheme(base: string, sentence?: string): string {
  if (!sentence) return base;
  return `${base} ${sentence}`;
}

function numerologyTension(expression: number | undefined, soulUrge: number | undefined): string | undefined {
  const expressionTheme = expression ? EXPRESSION_THEMES[expression] : undefined;
  const soulTheme = soulUrge ? SOUL_URGE_THEMES[soulUrge] : undefined;
  if (!expression || !soulUrge || !expressionTheme || !soulTheme) return undefined;

  return `Expression ${expression} (${expressionTheme.label}) emphasizes ${expressionTheme.drive} and a pull to ${expressionTheme.pull}. Soul Urge ${soulUrge} (${soulTheme.label}) emphasizes ${soulTheme.drive} and a pull to ${soulTheme.pull}. Both can be active at once. The useful tension is deciding which responsibility is chosen, which boundary protects autonomy, and whether one side is being used to silence the other.`;
}

export function buildClarityReadingModel(profile: AnyRecord): ClarityReadingModel {
  const astrology = (profile.astrologyData ?? {}) as AnyRecord;
  const verified = (profile.verifiedAstrologyData ?? {}) as AnyRecord;
  const numerology = (profile.numerologyData ?? {}) as AnyRecord;
  const personality = (profile.personalityData ?? {}) as AnyRecord;
  const archetype = (profile.archetypeData ?? {}) as AnyRecord;
  const depth = (profile.depthInterpretation ?? {}) as AnyRecord;
  const expression = parsedNumber(numerology.expression ?? profile.personalNumbers?.expression);
  const soulUrge = parsedNumber(numerology.soulUrge ?? profile.personalNumbers?.soulUrge);
  const expressionTheme = expression ? EXPRESSION_THEMES[expression] : undefined;
  const soulTheme = soulUrge ? SOUL_URGE_THEMES[soulUrge] : undefined;

  const title = firstSupportedText(
    depth.title,
    depth.claritySummary?.title,
    archetype.title,
    archetype.name,
  ) ?? "Your evolving pattern";

  const summary = firstSupportedText(
    depth.summary,
    sectionText(depth.claritySummary),
    profile.biography,
    archetype.description,
  ) ?? "The available profile contains calculated and symbolic signals that should be tested against lived experience rather than treated as fixed identity.";

  const baseVisible = firstSupportedText(
    sectionText(depth.visiblePattern),
    sectionText(depth.behavior),
    sectionText(depth.behaviorPattern),
    archetype.strengths?.[0],
    archetype.gifts?.[0],
  ) ?? FALLBACKS.visiblePattern;
  const baseProtective = firstSupportedText(
    sectionText(depth.protectiveFunction),
    sectionText(depth.hiddenNeed),
    sectionText(archetype.protectiveFunction),
    sectionText(archetype.hiddenNeed),
  ) ?? FALLBACKS.protectiveFunction;
  const baseGift = firstSupportedText(
    sectionText(depth.gift),
    sectionText(depth.healthyExpression),
    archetype.gifts?.[0],
    archetype.strengths?.[0],
  ) ?? FALLBACKS.gift;
  const baseCost = firstSupportedText(
    sectionText(depth.cost),
    sectionText(depth.shadow),
    archetype.shadows?.[0],
    archetype.growthAreas?.[0],
  ) ?? FALLBACKS.cost;
  const baseRelationship = firstSupportedText(
    sectionText(depth.relationshipImpact),
    sectionText(depth.relationships),
    sectionText(personality.relationshipStyle),
    sectionText(archetype.relationshipImpact),
  ) ?? FALLBACKS.relationshipImpact;

  const progressive = makeProgressiveSections(summary, {
    visiblePattern: appendTheme(
      baseVisible,
      expression && expressionTheme
        ? `Expression ${expression} adds a deterministic name-number theme of ${expressionTheme.drive}; in practice, that may make the visible pattern more self-directed when ownership of the outcome matters.`
        : undefined,
    ),
    protectiveFunction: appendTheme(
      baseProtective,
      soulUrge && soulTheme
        ? `Soul Urge ${soulUrge} adds an inner theme of ${soulTheme.drive}. As symbolic interpretation, that can make protection focus on the ability to ${soulTheme.pull}.`
        : undefined,
    ),
    gift: appendTheme(
      baseGift,
      expression && expressionTheme
        ? `The Expression ${expression} contribution is strongest when ${expressionTheme.drive} becomes deliberate skill rather than ${expressionTheme.risk}.`
        : undefined,
    ),
    cost: appendTheme(
      baseCost,
      expressionTheme || soulTheme
        ? `The name-number layer adds another tradeoff: ${[expressionTheme?.risk, soulTheme?.risk].filter(Boolean).join("; ")}.`
        : undefined,
    ),
    relationshipImpact: appendTheme(
      baseRelationship,
      expression && soulUrge && expressionTheme && soulTheme
        ? `Expression ${expression} may push toward ${expressionTheme.pull}, while Soul Urge ${soulUrge} may push toward ${soulTheme.pull}. Relationships can expose the difference between choosing both consciously and letting one side become an unspoken demand.`
        : soulUrge && soulTheme
          ? `Soul Urge ${soulUrge} adds a relationship theme of ${soulTheme.drive}, with the risk of ${soulTheme.risk}.`
          : undefined,
    ),
  });

  const signals: ClaritySignal[] = [];
  addSignal(signals, "sun", "Sun", verified.sun?.sign ?? verified.sunSign, "verified", "independent astronomy");
  addSignal(signals, "moon", "Moon", verified.moon?.sign ?? verified.moonSign, "verified", "independent astronomy");
  addSignal(signals, "rising", "Rising", verified.rising?.sign ?? verified.risingSign, "verified", "independent astronomy");
  if (!signals.some((signal) => signal.id === "sun")) {
    addSignal(signals, "sun-symbolic", "Sun", astrology.sunSign, "supported", "saved symbolic profile");
  }
  addSignal(signals, "life-path", "Life Path", numerology.lifePath, "deterministic", "birth-date calculation");
  addSignal(signals, "expression", "Expression", expression, "deterministic", "name calculation");
  addSignal(signals, "soul-urge", "Soul Urge", soulUrge, "deterministic", "name-vowel calculation");
  addSignal(signals, "enneagram", "Enneagram", personality.enneagram?.type, "supported", "user assessment");
  addSignal(signals, "mbti", "MBTI", personality.mbti?.type, "supported", "user assessment");

  const limitations = [
    "Symbolic overlap is supporting context, not independent proof.",
    "Numerology values are deterministic calculations from supplied birth/name data; their personality meanings remain symbolic interpretation.",
    "Unknown or approximate birth time must not be promoted into verified Moon, Rising, house, or timing claims.",
    "Lived experience is the final correction layer.",
  ];
  if (!signals.some((signal) => signal.confidence === "verified")) {
    limitations.unshift("No independently verified astronomical signal is available in this reading model.");
  }

  return {
    title,
    summary,
    coreContradiction: firstSupportedText(
      sectionText(depth.coreContradiction),
      numerologyTension(expression, soulUrge),
    ),
    ...progressive,
    groundedAction: firstSupportedText(
      sectionText(depth.groundedAction),
      sectionText(depth.action),
      profile.dailyGuidance,
    ) ?? DEFAULT_ACTION,
    signals,
    limitations,
  };
}
