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

function makeProgressiveSections(
  summary: string,
  values: Omit<ClarityReadingModel, "title" | "summary" | "signals" | "limitations" | "groundedAction">,
) {
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

export function buildClarityReadingModel(profile: AnyRecord): ClarityReadingModel {
  const astrology = (profile.astrologyData ?? {}) as AnyRecord;
  const verified = (profile.verifiedAstrologyData ?? {}) as AnyRecord;
  const numerology = (profile.numerologyData ?? {}) as AnyRecord;
  const personality = (profile.personalityData ?? {}) as AnyRecord;
  const archetype = (profile.archetypeData ?? {}) as AnyRecord;
  const depth = (profile.depthInterpretation ?? {}) as AnyRecord;

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

  const progressive = makeProgressiveSections(summary, {
    visiblePattern: firstSupportedText(
      sectionText(depth.visiblePattern),
      sectionText(depth.behavior),
      sectionText(depth.behaviorPattern),
      archetype.strengths?.[0],
      archetype.gifts?.[0],
    ) ?? FALLBACKS.visiblePattern,
    protectiveFunction: firstSupportedText(
      sectionText(depth.protectiveFunction),
      sectionText(depth.hiddenNeed),
      sectionText(archetype.protectiveFunction),
      sectionText(archetype.hiddenNeed),
    ) ?? FALLBACKS.protectiveFunction,
    gift: firstSupportedText(
      sectionText(depth.gift),
      sectionText(depth.healthyExpression),
      archetype.gifts?.[0],
      archetype.strengths?.[0],
    ) ?? FALLBACKS.gift,
    cost: firstSupportedText(
      sectionText(depth.cost),
      sectionText(depth.shadow),
      archetype.shadows?.[0],
      archetype.growthAreas?.[0],
    ) ?? FALLBACKS.cost,
    relationshipImpact: firstSupportedText(
      sectionText(depth.relationshipImpact),
      sectionText(depth.relationships),
      sectionText(personality.relationshipStyle),
      sectionText(archetype.relationshipImpact),
    ) ?? FALLBACKS.relationshipImpact,
  });

  const signals: ClaritySignal[] = [];
  addSignal(signals, "sun", "Sun", verified.sun?.sign ?? verified.sunSign, "verified", "independent astronomy");
  addSignal(signals, "moon", "Moon", verified.moon?.sign ?? verified.moonSign, "verified", "independent astronomy");
  addSignal(signals, "rising", "Rising", verified.rising?.sign ?? verified.risingSign, "verified", "independent astronomy");
  if (!signals.some((signal) => signal.id === "sun")) {
    addSignal(signals, "sun-symbolic", "Sun", astrology.sunSign, "supported", "saved symbolic profile");
  }
  addSignal(signals, "life-path", "Life Path", numerology.lifePath, "deterministic", "birth-date calculation");
  addSignal(signals, "expression", "Expression", numerology.expression, "deterministic", "name calculation");
  addSignal(signals, "soul-urge", "Soul Urge", numerology.soulUrge, "deterministic", "name-vowel calculation");
  addSignal(signals, "enneagram", "Enneagram", personality.enneagram?.type, "supported", "user assessment");
  addSignal(signals, "mbti", "MBTI", personality.mbti?.type, "supported", "user assessment");

  const limitations = [
    "Symbolic overlap is supporting context, not independent proof.",
    "Unknown or approximate birth time must not be promoted into verified Moon, Rising, house, or timing claims.",
    "Lived experience is the final correction layer.",
  ];
  if (!signals.some((signal) => signal.confidence === "verified")) {
    limitations.unshift("No independently verified astronomical signal is available in this reading model.");
  }

  return {
    title,
    summary,
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
