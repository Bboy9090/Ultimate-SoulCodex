export type ClarityConfidence = "verified" | "deterministic" | "supported" | "tentative" | "unavailable";

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

export function firstSupportedText(...values: unknown[]): string | undefined {
  return values.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  ) as string | undefined;
}

function addSignal(
  signals: ClaritySignal[],
  id: string,
  label: string,
  value: unknown,
  confidence: ClarityConfidence,
  source: string,
) {
  if (typeof value !== "string" && typeof value !== "number") return;
  const normalized = String(value).trim();
  if (!normalized) return;
  signals.push({ id, label, value: normalized, confidence, source });
}

export function buildClarityReadingModel(profile: AnyRecord): ClarityReadingModel {
  const astrology = (profile.astrologyData ?? {}) as AnyRecord;
  const verifiedAstrology = (profile.verifiedAstrologyData ?? {}) as AnyRecord;
  const numerology = (profile.numerologyData ?? {}) as AnyRecord;
  const personality = (profile.personalityData ?? {}) as AnyRecord;
  const archetype = (profile.archetypeData ?? {}) as AnyRecord;
  const depth = (profile.depthInterpretation ?? {}) as AnyRecord;

  const title =
    firstSupportedText(depth.title, archetype.title, archetype.name) ??
    "Your evolving pattern";

  const summary =
    firstSupportedText(
      depth.summary,
      profile.biography,
      archetype.description,
    ) ??
    "The available profile contains calculated and symbolic signals that should be tested against lived experience rather than treated as fixed identity.";

  const visiblePattern =
    firstSupportedText(
      depth.visiblePattern,
      depth.behavior?.summary,
      archetype.strengths?.[0],
      archetype.gifts?.[0],
    ) ??
    "A visible strength may help you create order, care, momentum, or understanding when a situation feels uncertain.";

  const protectiveFunction =
    firstSupportedText(
      depth.protectiveFunction,
      depth.hiddenNeed,
      archetype.protectiveFunction,
      archetype.hiddenNeed,
    ) ??
    "This pattern may protect stability, dignity, belonging, certainty, or emotional safety. The profile cannot prove which one without lived context.";

  const gift =
    firstSupportedText(
      depth.gift,
      depth.healthyExpression,
      archetype.gifts?.[0],
      archetype.strengths?.[0],
    ) ??
    "The pattern becomes a gift when reflection turns into a deliberate, practical choice.";

  const cost =
    firstSupportedText(
      depth.cost,
      depth.shadow,
      archetype.shadows?.[0],
      archetype.growthAreas?.[0],
    ) ??
    "A useful strength becomes costly when it is overused, performed for approval, or used to avoid a necessary choice.";

  const relationshipImpact =
    firstSupportedText(
      depth.relationshipImpact,
      personality.relationshipStyle,
      archetype.relationshipImpact,
    ) ??
    "In relationships, the central task is to name needs and boundaries directly instead of expecting other people to decode them.";

  const signals: ClaritySignal[] = [];
  addSignal(signals, "sun", "Sun", verifiedAstrology.sun?.sign ?? verifiedAstrology.sunSign, "verified", "independent astronomy");
  addSignal(signals, "moon", "Moon", verifiedAstrology.moon?.sign ?? verifiedAstrology.moonSign, "verified", "independent astronomy");
  addSignal(signals, "rising", "Rising", verifiedAstrology.rising?.sign ?? verifiedAstrology.risingSign, "verified", "independent astronomy");

  if (!signals.some((signal) => signal.id === "sun")) {
    addSignal(signals, "sun-symbolic", "Sun", astrology.sunSign, "supported", "saved symbolic profile");
  }
  addSignal(signals, "life-path", "Life Path", numerology.lifePath, "deterministic", "birth-date calculation");
  addSignal(signals, "expression", "Expression", numerology.expression, "deterministic", "name calculation");
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
    visiblePattern,
    protectiveFunction,
    gift,
    cost,
    relationshipImpact,
    groundedAction: firstSupportedText(depth.groundedAction, depth.action) ?? DEFAULT_ACTION,
    signals,
    limitations,
  };
}
