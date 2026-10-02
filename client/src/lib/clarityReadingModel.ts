import { calcExpression, calcLifePath, calcSoulUrge } from "@soulcodex/core";
import { humanDesignDefinedChannels, humanDesignListLabel, normalizeHumanDesignCenters } from "@/lib/humanDesignDisplay";
import { hasVerifiedHumanDesignTrust } from "./humanDesignTrust";
import { getSynthesisPlacement } from "./placementVerification";
export type ClarityConfidence =
  | "verified"
  | "deterministic"
  | "stable"
  | "supported"
  | "tentative"
  | "unavailable";

export type CalculationCertainty = "verified" | "range-stable" | "deterministic" | "user-stated" | "unverified";
export type EvidenceStatus = "verified-source" | "stable-across-range" | "calculated" | "user-assessed" | "symbolic-only" | "unresolved";
export type InterpretationConfidence = "high" | "moderate" | "low" | "not-applicable";

export interface ClaritySignal {
  id: string;
  label: string;
  value: string;
  confidence: ClarityConfidence;
  source: string;
  calculationCertainty: CalculationCertainty;
  evidenceStatus: EvidenceStatus;
  interpretationConfidence: InterpretationConfidence;
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
const ZODIAC_SIGNS = new Set([
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]);
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
    "No protective function is established from the current behavioral evidence. Symbolic systems may suggest reflection prompts, but they do not verify what you are protecting.",
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

function receiptForSignal(
  confidence: ClarityConfidence,
  source: string,
): Pick<ClaritySignal, "calculationCertainty" | "evidenceStatus" | "interpretationConfidence"> {
  if (confidence === "verified") {
    return {
      calculationCertainty: "verified",
      evidenceStatus: "verified-source",
      interpretationConfidence: "not-applicable",
    };
  }
  if (confidence === "stable") {
    return {
      calculationCertainty: "range-stable",
      evidenceStatus: "stable-across-range",
      interpretationConfidence: "not-applicable",
    };
  }
  if (confidence === "deterministic") {
    return {
      calculationCertainty: "deterministic",
      evidenceStatus: "calculated",
      interpretationConfidence: "not-applicable",
    };
  }
  if (source.toLowerCase().includes("user assessment")) {
    return {
      calculationCertainty: "user-stated",
      evidenceStatus: "user-assessed",
      interpretationConfidence: "moderate",
    };
  }
  if (confidence === "supported") {
    return {
      calculationCertainty: "unverified",
      evidenceStatus: "symbolic-only",
      interpretationConfidence: "low",
    };
  }
  return {
    calculationCertainty: "unverified",
    evidenceStatus: "unresolved",
    interpretationConfidence: "low",
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
  if (clean) signals.push({ id, label, value: clean, confidence, source, ...receiptForSignal(confidence, source) });
}

const SUPPORTED_CORE_NUMBERS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]);

function validatedCoreNumber(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isInteger(parsed) && SUPPORTED_CORE_NUMBERS.has(parsed) ? parsed : undefined;
}

function evidenceText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function evidenceTimestamp(value: unknown): value is string {
  return evidenceText(value) && !Number.isNaN(Date.parse(value));
}

function verifiedPlacement(value: unknown): AnyRecord | undefined {
  if (!value || typeof value !== "object") return undefined;
  const placement = value as AnyRecord;
  const evidence = placement.provenance ?? placement.evidence;
  const directEvidence = Boolean(
    evidenceText(evidence?.source) &&
    evidenceText(evidence?.engine) &&
    evidenceTimestamp(evidence?.calculatedAt)
  );
  const governedDerivedEvidence = Boolean(
    evidenceText(placement.policyId) &&
    evidenceText(placement.evidenceArtifactId)
  );
  return placement.verificationStatus === "verified" &&
    typeof placement.sign === "string" &&
    ZODIAC_SIGNS.has(placement.sign) &&
    (directEvidence || governedDerivedEvidence)
    ? placement
    : undefined;
}

function validHouse(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 12;
}

function verifiedEqualHouses(astrology: AnyRecord): boolean {
  return astrology.houseSystem === "equal" &&
    typeof astrology.verification?.policyId === "string" &&
    astrology.verification.policyId.includes("ASTRO-EQUAL-HOUSE-v1") &&
    Array.isArray(astrology.houses) &&
    astrology.houses.length === 12 &&
    astrology.houses.every((row: AnyRecord, index: number) =>
      row?.verificationStatus === "verified" &&
      row?.policyId === "ASTRO-EQUAL-HOUSE-v1" &&
      row?.house === index + 1 &&
      ZODIAC_SIGNS.has(row?.sign) &&
      Number.isFinite(row?.longitude) &&
      Number.isFinite(row?.degree),
    );
}

function verifiedHumanDesignCore(value: AnyRecord): boolean {
  return hasVerifiedHumanDesignTrust(value);
}

function appendTheme(base: string, sentence?: string): string {
  if (!sentence) return base;
  return `${base} ${sentence}`;
}

function numerologyTension(expression: number | undefined, soulUrge: number | undefined): string | undefined {
  const expressionTheme = expression ? EXPRESSION_THEMES[expression] : undefined;
  const soulTheme = soulUrge ? SOUL_URGE_THEMES[soulUrge] : undefined;
  if (!expression || !soulUrge || !expressionTheme || !soulTheme) return undefined;

  return `Two different pulls may be active at once: ${expressionTheme.pull} and ${soulTheme.pull}. The useful question is which one you are choosing on purpose, and which one is quietly making the decision for you.`;
}

export function buildClarityReadingModel(profile: AnyRecord): ClarityReadingModel {
  const astrology = (profile.astrologyData ?? {}) as AnyRecord;
  const verified = (profile.verifiedAstrologyData ?? profile.astrologyData ?? {}) as AnyRecord;
  const numerology = (profile.numerologyData ?? {}) as AnyRecord;
  const humanDesign = (profile.humanDesignData ?? {}) as AnyRecord;
  const personality = (profile.personalityData ?? {}) as AnyRecord;
  const archetype = (profile.archetypeData ?? {}) as AnyRecord;
  const depth = (profile.depthInterpretation ?? {}) as AnyRecord;
  const birthDate = typeof profile.birthDate === "string" ? profile.birthDate.slice(0, 10) : null;
  const fullBirthName = typeof profile.fullBirthName === "string" && profile.fullBirthName.trim()
    ? profile.fullBirthName.trim()
    : null;
  let lifePath: number | undefined;
  let expression: number | undefined;
  let soulUrge: number | undefined;
  try {
    lifePath = birthDate ? validatedCoreNumber(calcLifePath(birthDate)) : undefined;
    expression = fullBirthName ? validatedCoreNumber(calcExpression(fullBirthName)) : undefined;
    soulUrge = fullBirthName ? validatedCoreNumber(calcSoulUrge(fullBirthName)) : undefined;
  } catch {
    lifePath = undefined;
    expression = undefined;
    soulUrge = undefined;
  }
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
  ) ?? "Start with the pattern you can actually recognize in your life. Keep what fits; discard what does not.";

  const depthEvidence = Array.isArray(depth.evidence) ? depth.evidence as AnyRecord[] : [];
  const protectiveEvidenceIds = Array.isArray(depth.protectiveFunction?.evidenceIds)
    ? depth.protectiveFunction.evidenceIds.filter((value: unknown): value is string => typeof value === "string")
    : [];
  const behavioralEvidenceIds = new Set(
    depthEvidence
      .filter((entry) =>
        entry &&
        typeof entry === "object" &&
        ["user-stated", "mirror", "tracker"].includes(String(entry.system))
      )
      .map((entry) => String(entry.id ?? ""))
      .filter(Boolean),
  );
  const governedProtectiveLayer =
    depth.protectiveFunction &&
    typeof depth.protectiveFunction === "object" &&
    (
      typeof depth.protectiveFunction.claimKind === "string" ||
      Array.isArray(depth.protectiveFunction.evidenceIds)
    );
  const protectiveBehavioralSupport =
    !governedProtectiveLayer ||
    depth.protectiveFunction?.claimKind === "observed" ||
    protectiveEvidenceIds.some((id: string) => behavioralEvidenceIds.has(id));

  const baseVisible = firstSupportedText(
    sectionText(depth.visiblePattern),
    sectionText(depth.behavior),
    sectionText(depth.behaviorPattern),
    archetype.strengths?.[0],
    archetype.gifts?.[0],
  ) ?? FALLBACKS.visiblePattern;
  const baseProtective = protectiveBehavioralSupport
    ? firstSupportedText(sectionText(depth.protectiveFunction)) ?? FALLBACKS.protectiveFunction
    : FALLBACKS.protectiveFunction;
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
        ? `Expression ${expression} points toward ${expressionTheme.drive}. Notice whether ownership sharpens your focus when the outcome matters.`
        : undefined,
    ),
    protectiveFunction: baseProtective,
    gift: appendTheme(
      baseGift,
      expression && expressionTheme
        ? `Expression ${expression} is strongest when ${expressionTheme.drive} becomes a chosen skill instead of ${expressionTheme.risk}.`
        : undefined,
    ),
    cost: appendTheme(
      baseCost,
      expressionTheme || soulTheme
        ? `Watch for the tradeoff: ${[expressionTheme?.risk, soulTheme?.risk].filter(Boolean).join("; ")}.`
        : undefined,
    ),
    relationshipImpact: appendTheme(
      baseRelationship,
      expression && soulUrge && expressionTheme && soulTheme
        ? `One side may pull toward ${expressionTheme.pull}; another toward ${soulTheme.pull}. Relationships make it easier to see which pull you are choosing and which one has become an unspoken demand.`
        : soulUrge && soulTheme
          ? `Soul Urge ${soulUrge} points toward ${soulTheme.drive}. In relationships, watch for ${soulTheme.risk}.`
          : undefined,
    ),
  });

  const signals: ClaritySignal[] = [];
  const addAstrologySignal = (key: "sun" | "moon" | "rising", label: string) => {
    const placement = getSynthesisPlacement(verified[key]);
    if (!placement) return;
    addSignal(
      signals,
      key,
      label,
      placement.sign,
      placement.evidenceState === "verified" ? "verified" : "stable",
      placement.evidenceState === "verified"
        ? "independent astronomy"
        : "full-day minute-range astronomy",
    );
  };
  addAstrologySignal("sun", "Sun");
  addAstrologySignal("moon", "Moon");
  addAstrologySignal("rising", "Rising");
  addSignal(signals, "life-path", "Life Path", lifePath, "deterministic", "birth-date calculation");
  addSignal(signals, "expression", "Expression", expression, "deterministic", "name calculation");
  addSignal(signals, "soul-urge", "Soul Urge", soulUrge, "deterministic", "name-vowel calculation");
  const equalHousesVerified = verifiedEqualHouses(verified);
  const midheaven = verifiedPlacement(verified.midheaven);
  if (equalHousesVerified && midheaven?.policyId === "ASTRO-EQUAL-HOUSE-v1") {
    addSignal(signals, "midheaven", "Midheaven", midheaven.sign, "verified", "verified Equal House geometry");
  }
  if (equalHousesVerified) {
    addSignal(signals, "houses", "House system", "12 verified Equal House cusps", "verified", "ASTRO-EQUAL-HOUSE-v1");
  }
  const planetaryHouses = (verified.planetaryHouses ?? {}) as AnyRecord;
  for (const body of ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]) {
    const placement = verifiedPlacement(verified.planets?.[body] ?? verified[body]);
    const house = planetaryHouses[body];
    if (equalHousesVerified && placement && validHouse(house)) {
      addSignal(signals, `placement-${body}`, body.charAt(0).toUpperCase() + body.slice(1), `${placement.sign} · House ${house}`, "verified", "verified natal placement and house assignment");
    }
  }
  const northNode = verifiedPlacement(verified.northNode);
  if (northNode?.mode === "mean" && northNode.policyId === "ASTRO-MEAN-NODE-v1" && validHouse(northNode.house)) {
    addSignal(signals, "north-node", "Mean North Node", `${verified.northNode.sign}${verified.northNode.house ? ` · House ${verified.northNode.house}` : ""}`, "verified", "verified mean-node contract");
  }
  const southNode = verifiedPlacement(verified.southNode);
  if (southNode?.mode === "mean" && southNode.policyId === "ASTRO-MEAN-NODE-v1" && validHouse(southNode.house)) {
    addSignal(signals, "south-node", "Mean South Node", `${verified.southNode.sign}${verified.southNode.house ? ` · House ${verified.southNode.house}` : ""}`, "verified", "verified mean-node contract");
  }
  const chiron = verifiedPlacement(verified.chiron);
  if (chiron?.policyId === "ASTRO-CHIRON-v1" && chiron?.qualificationMethod === "live-jpl-qualified-against-swiss" && validHouse(chiron.house)) {
    addSignal(signals, "chiron", "Chiron", `${verified.chiron.sign}${verified.chiron.house ? ` · House ${verified.chiron.house}` : ""}`, "verified", "live JPL qualified against Swiss Ephemeris");
  }
  if (verifiedHumanDesignCore(humanDesign)) {
    addSignal(signals, "hd-type", "Human Design type", humanDesign.type, "verified", "HUMAN-DESIGN-CORE-v1");
    addSignal(signals, "hd-strategy", "Strategy", humanDesign.strategy, "verified", "HUMAN-DESIGN-CORE-v1");
    addSignal(signals, "hd-authority", "Authority", humanDesign.authority, "verified", "HUMAN-DESIGN-CORE-v1");
    addSignal(signals, "hd-profile", "Profile", humanDesign.profile, "verified", "HUMAN-DESIGN-CORE-v1");
    addSignal(signals, "hd-definition", "Definition", humanDesign.definition, "verified", "verified bodygraph calculation");
    const hdCenters = normalizeHumanDesignCenters(humanDesign.centers);
    addSignal(signals, "hd-centers", "Defined centers", hdCenters.defined.join(", ") || "None", "verified", "verified bodygraph calculation");
    const hdChannels = humanDesignDefinedChannels(humanDesign.channels);
    addSignal(signals, "hd-channels", "Defined channels", humanDesignListLabel(hdChannels, "channel", "None"), "verified", "verified bodygraph calculation");
    if (Array.isArray(humanDesign.activatedGates)) {
      addSignal(signals, "hd-gates", "Activated gates", humanDesignListLabel(humanDesign.activatedGates, "gate"), "verified", "verified bodygraph calculation");
    }
  } else if (humanDesign.status === "range_analyzed" && humanDesign.components) {
    const stableComponent = (key: string): AnyRecord | null => {
      const component = humanDesign.components?.[key];
      return component?.evidenceState === "stable_across_range" &&
        component?.rangeEvidence?.resolutionMinutes === 1 &&
        component?.rangeEvidence?.testedValues === 1440
        ? component
        : null;
    };
    const addStableHd = (key: string, id: string, label: string, emptyLabel?: string) => {
      const component = stableComponent(key);
      if (!component) return;
      const value = typeof component.value === "string" ? component.value : "";
      addSignal(signals, id, label, value || emptyLabel, "stable", "full-day Human Design range analysis");
    };
    addStableHd("type", "hd-type", "Human Design type");
    addStableHd("strategy", "hd-strategy", "Strategy");
    addStableHd("authority", "hd-authority", "Authority");
    addStableHd("profile", "hd-profile", "Profile");
    addStableHd("definition", "hd-definition", "Definition");
    addStableHd("centers", "hd-centers", "Defined centers", "None");
    addStableHd("channels", "hd-channels", "Defined channels", "None");
    addStableHd("gates", "hd-gates", "Activated gates", "None");
    addStableHd("incarnationCross", "hd-incarnation-cross", "Incarnation Cross");
  }
  addSignal(signals, "enneagram", "Enneagram", personality.enneagram?.type, "supported", "user assessment");
  addSignal(signals, "mbti", "MBTI", personality.mbti?.type, "supported", "user assessment");

  const limitations = [
    "Symbolic overlap is supporting context, not independent proof.",
    "Only governed core numerology values (1-9, 11, 22, 33) are admitted as deterministic signals; malformed or unsupported values are excluded.",
    "Date numerology is recomputed from birth date; name numerology is recomputed only from the explicit full birth name. Stored numbers alone are not authority; their meanings remain symbolic interpretation.",
    "Unknown birth time may contribute only placements proven stable across the complete supported range. Conditional branches never become main-reading facts.",
    "Verified or full-range-stable geometry/Human Design components can support reflection with their provenance intact; their psychological meanings remain symbolic rather than scientific diagnoses.",
    "Lived experience is the final correction layer.",
  ];
  if (!signals.some((signal) => signal.confidence === "verified" || signal.confidence === "stable")) {
    limitations.unshift("No independently verified or full-range-stable astronomical signal is available in this reading model.");
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
