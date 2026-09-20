import {
  calcExpression,
  calcLifePath,
  calcPersonality,
  calcSoulUrge,
  synthesizeDepthInterpretationV1,
  validateDepthInterpretationV1,
  type DepthSynthesisSeed,
  type DepthTensionAxis,
  type InterpretationEvidenceRef,
  type OfflineCodexProfile,
} from "@soulcodex/core";
import type { BirthData } from "@shared/schema";

type Pattern = {
  drive: string;
  gift: string;
  shadow: string;
  relationship: string;
  action: string;
  axes: DepthTensionAxis[];
};

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const SIGN_PATTERNS: Record<string, Pattern> = {
  Aries: pattern("initiating action directly", "courage and momentum", "moving faster than context", "may need honesty and room for direct action", "Separate urgency from importance before acting.", ["speed", "directness"]),
  Taurus: pattern("building stability", "patience and follow-through", "holding position after conditions change", "may need consistency and tangible trust", "Identify one place where flexibility protects the larger commitment.", ["stability", "consistency"]),
  Gemini: pattern("connecting information and ideas", "adaptability and verbal perspective", "scattering attention", "may need conversation and mental responsiveness", "Finish one question before opening another.", ["analysis", "freedom"]),
  Cancer: pattern("protecting emotional safety", "care and responsiveness", "carrying other people's needs", "may need reciprocity and reliable belonging", "Name the need before managing the whole atmosphere.", ["sensitivity", "partnership"]),
  Leo: pattern("expressing identity visibly", "warmth and creative leadership", "using recognition as proof of worth", "may need appreciation without compulsory performance", "Make one meaningful move that does not depend on applause.", ["recognition", "independence"]),
  Virgo: pattern("improving what is practical", "discernment and useful problem solving", "analysis expanding until action stalls", "may need reliability and respect for effort", "Define what is good enough before refining again.", ["analysis", "structure"]),
  Libra: pattern("creating balance", "diplomacy and relational awareness", "delaying conflict until resentment grows", "may need mutuality and respectful negotiation", "State the uncomfortable preference before harmony becomes avoidance.", ["harmony", "partnership"]),
  Scorpio: pattern("testing truth and protecting depth", "focus and loyalty", "holding suspicion past its useful life", "may need privacy and earned trust", "Separate what is known from what is feared before escalating.", ["sensitivity", "directness"]),
  Sagittarius: pattern("seeking meaning and expansion", "optimism and broad perspective", "leaving depth for the next horizon", "may need truth and room to grow", "Finish one meaningful commitment before chasing the next possibility.", ["freedom", "speed"]),
  Capricorn: pattern("building through discipline", "strategy and endurance", "measuring worth mainly through output", "may need respect and dependable commitments", "Protect recovery as part of the plan rather than a reward after collapse.", ["structure", "stability"]),
  Aquarius: pattern("challenging defaults", "originality and systems perspective", "using detachment when stakes rise", "may need intellectual freedom and authentic difference", "Translate the idea into one human-scale action.", ["independence", "analysis"]),
  Pisces: pattern("translating feeling into meaning", "empathy and imagination", "weakening boundaries while helping", "may need gentleness and clear emotional boundaries", "Identify which feeling is yours before deciding what to carry.", ["sensitivity", "freedom"]),
};

const LIFE_PATHS: Record<number, Pattern> = {
  1: pattern("self-directed initiation", "pioneering independence", "mistaking support for interference", "may need autonomy without isolation", "Lead clearly without making collaboration prove weakness.", ["independence", "directness"]),
  2: pattern("partnership", "cooperation and sensitivity", "over-adjusting to preserve peace", "may need mutuality", "State one preference before adapting to everyone else.", ["partnership", "harmony"]),
  3: pattern("expression", "creativity and communication", "using activity to avoid depth", "may need room to be heard", "Finish and share one expression rather than polishing ten possibilities.", ["recognition", "freedom"]),
  4: pattern("structure", "building systems that last", "confusing control with safety", "may need dependable expectations", "Keep the structure and loosen one unnecessary rule.", ["structure", "consistency"]),
  5: pattern("freedom", "adaptability and experience", "resisting repetition required for mastery", "may need movement without chaos", "Choose one commitment that creates more freedom later.", ["freedom", "speed"]),
  6: pattern("responsibility", "service and stewardship", "carrying duties never clearly accepted", "may need reciprocity", "Return one responsibility to its rightful owner.", ["partnership", "consistency"]),
  7: pattern("analysis", "investigation and private understanding", "waiting for impossible certainty", "may need privacy and intellectual trust", "Set a decision deadline before collecting another layer of evidence.", ["analysis", "independence"]),
  8: pattern("material mastery", "leadership and execution", "using achievement as the only measure", "may need respect without domination", "Define the ethical boundary before pursuing the result.", ["structure", "recognition"]),
  9: pattern("completion and legacy", "humanitarian perspective", "overextending for the larger mission", "may need boundaries around service", "Finish one cycle before volunteering for another.", ["partnership", "stability"]),
  11: pattern("vision and intuition", "inspiration", "treating intensity as certainty", "may need grounding around strong impressions", "Ground the insight in one observable test.", ["sensitivity", "analysis"]),
  22: pattern("master building", "turning vision into structure", "making scale personally crushing", "may need sustainable delegation", "Reduce the vision to the next testable structure.", ["structure", "stability"]),
  33: pattern("teaching through service", "uplifting others", "becoming responsible for everyone's healing", "may need compassionate boundaries", "Teach the principle without taking over the person's work.", ["partnership", "sensitivity"]),
};

function pattern(drive: string, gift: string, shadow: string, relationship: string, action: string, axes: DepthTensionAxis[]): Pattern {
  return { drive, gift, shadow, relationship, action, axes };
}

function parseDate(dateISO: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO);
  if (!match) throw new Error("birthDate must use YYYY-MM-DD");
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function sunSignForDate(dateISO: string): string {
  const { month, day } = parseDate(dateISO);
  const boundaries: Array<[number, number, string]> = [
    [1, 20, "Aquarius"], [2, 19, "Pisces"], [3, 21, "Aries"], [4, 20, "Taurus"],
    [5, 21, "Gemini"], [6, 21, "Cancer"], [7, 23, "Leo"], [8, 23, "Virgo"],
    [9, 23, "Libra"], [10, 23, "Scorpio"], [11, 22, "Sagittarius"], [12, 22, "Capricorn"],
  ];
  const current = boundaries.find(([candidate]) => candidate === month);
  const next = current?.[2] ?? "Capricorn";
  const previous = SIGNS[(SIGNS.indexOf(next as (typeof SIGNS)[number]) + 11) % 12];
  return day >= (current?.[1] ?? 22) ? next : previous;
}

function reduceNumber(input: number): number {
  let value = Math.abs(Math.trunc(input));
  while (value > 9 && value !== 11 && value !== 22 && value !== 33) {
    value = String(value).split("").reduce((sum, digit) => sum + Number(digit), 0);
  }
  return value;
}

function personalYear(dateISO: string, year: number) {
  const date = parseDate(dateISO);
  return reduceNumber(date.day + date.month + year);
}

function elementForSign(sign: string) {
  if (["Aries", "Leo", "Sagittarius"].includes(sign)) return "Fire";
  if (["Taurus", "Virgo", "Capricorn"].includes(sign)) return "Earth";
  if (["Gemini", "Libra", "Aquarius"].includes(sign)) return "Air";
  return "Water";
}

function archetypeFor(sign: string, lifePath: number) {
  const element = elementForSign(sign);
  const path = LIFE_PATHS[lifePath] ?? LIFE_PATHS[9];
  const titles: Record<string, string> = {
    Fire: "Ember Initiator",
    Earth: "Grounded Builder",
    Air: "Pattern Messenger",
    Water: "Depth Navigator",
  };
  return {
    title: titles[element],
    description: `${element}-sign symbolism and Life Path ${lifePath} are the supported local ingredients in this synthesis. It is a reflective pattern, not a verified personality diagnosis.`,
    strengths: [SIGN_PATTERNS[sign].gift, path.gift],
    shadows: [SIGN_PATTERNS[sign].shadow, path.shadow],
    themes: [element, `Life Path ${lifePath}`, "Local symbolic synthesis"],
    guidance: `${path.action} ${SIGN_PATTERNS[sign].action}`,
    tarotCards: {
      card1: "Unresolved locally",
      card2: "Unresolved locally",
      interpretation: "Tarot birth-card interpretation is not used as evidence in the Foundation local profile.",
    },
  };
}

function evidence(input: Omit<InterpretationEvidenceRef, "provenanceStatus" | "notes"> & { notes?: string[] }): InterpretationEvidenceRef {
  return {
    ...input,
    provenanceStatus: "unverified",
    notes: [
      "Generated locally from user-entered data.",
      "Confidence describes source completeness and internal consistency, not scientific truth.",
      ...(input.notes ?? []),
    ],
  };
}

function makeSeed(id: string, system: InterpretationEvidenceRef["system"], field: string, value: string | number, label: string, patternValue: Pattern, priority: number): DepthSynthesisSeed {
  return {
    evidence: evidence({ id, system, field, value, confidence: "moderate", timeSensitivity: "none" }),
    label,
    priority,
    claimKind: "derived",
    facets: {
      claritySummary: `This symbolic layer emphasizes ${patternValue.drive}.`,
      visiblePattern: `A constructive expression may look like ${patternValue.gift}.`,
      hiddenNeed: `The pattern may be trying to preserve room for ${patternValue.drive}.`,
      gift: patternValue.gift,
      shadow: `When overused, the same pattern may become ${patternValue.shadow}.`,
      relationshipImpact: `In relationships, it ${patternValue.relationship}.`,
      commonMisreading: "A symbolic pattern can be mistaken for a fixed trait when context and lived experience may tell a different story.",
      action: patternValue.action,
      boundaryOrRepair: patternValue.action,
    },
    tensionAxes: patternValue.axes,
    limitations: ["This is symbolic interpretation. The user may confirm, refine, or reject it from lived experience."],
  };
}

function makeId() {
  if (globalThis.crypto?.randomUUID) return `local-${globalThis.crypto.randomUUID()}`;
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Foundation-safe local profile generator.
 *
 * Local mode deliberately does NOT manufacture Moon, Rising, planets, houses,
 * aspects, nodes, Chiron, or any other astronomical placement without an
 * ephemeris-grade verification source. Those fields remain unresolved until
 * the user explicitly requests online astronomy verification.
 */
export function generateFoundationOfflineCodexProfile(
  input: BirthData,
  options: { id?: string; generatedAt?: string; currentYear?: number } = {},
): OfflineCodexProfile {
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const currentYear = options.currentYear ?? new Date(generatedAt).getUTCFullYear();
  const sunSign = sunSignForDate(input.birthDate);
  const signPattern = SIGN_PATTERNS[sunSign];
  const lifePath = calcLifePath(input.birthDate);
  const expression = calcExpression(input.name);
  const soulUrge = calcSoulUrge(input.name);
  const personality = calcPersonality(input.name);
  const yearNumber = personalYear(input.birthDate, currentYear);
  const pathPattern = LIFE_PATHS[lifePath] ?? LIFE_PATHS[9];
  const archetypeData = archetypeFor(sunSign, lifePath);

  const numerologyData = {
    lifePath,
    expression,
    soulUrge,
    personality,
    personalYear: yearNumber,
    interpretations: {
      lifePath: `Life Path ${lifePath}: deterministic number, symbolic interpretation.`,
      expression: `Expression ${expression}: deterministic name number, symbolic interpretation.`,
      soulUrge: `Soul Urge ${soulUrge}: deterministic vowel-number calculation, symbolic interpretation.`,
      personality: `Personality ${personality}: deterministic consonant-number calculation, symbolic interpretation.`,
      personalYear: `Personal Year ${yearNumber}: reflective theme for ${currentYear}, not a guaranteed prediction.`,
    },
  };

  const depthInterpretation = synthesizeDepthInterpretationV1({
    version: 1,
    generatedAt,
    birthTimeStatus: input.birthTime ? "known" : "unknown",
    seeds: [
      makeSeed("offline.astrology.sun", "astrology", "sunSign", sunSign, `${sunSign} Sun symbolism`, signPattern, 100),
      makeSeed("offline.numerology.life-path", "numerology", "lifePath", lifePath, `Life Path ${lifePath} symbolism`, pathPattern, 95),
      makeSeed("offline.numerology.expression", "numerology", "expression", expression, `Expression ${expression} symbolism`, LIFE_PATHS[expression] ?? LIFE_PATHS[1], 92),
      makeSeed("offline.numerology.soul-urge", "numerology", "soulUrge", soulUrge, `Soul Urge ${soulUrge} symbolism`, LIFE_PATHS[soulUrge] ?? LIFE_PATHS[6], 91),
    ],
    missingData: [
      "Moon sign is unavailable in local mode until independently verified astronomy is requested.",
      "Rising sign is unavailable in local mode until exact birth time, coordinates, timezone, and independent astronomy verification are available.",
      "Planetary positions, houses, aspects, nodes, Chiron, and Midheaven are unavailable in local mode.",
      "Human Design is unavailable without its separate calculation and evidence contract.",
      "Mirror behavioral answers are not yet available in the active create-profile flow.",
    ],
  });

  const validation = validateDepthInterpretationV1(depthInterpretation, {
    birthTimeStatus: input.birthTime ? "known" : "unknown",
  });
  if (!validation.valid) {
    throw new Error(`Foundation local depth interpretation failed validation: ${validation.findings.map((finding) => finding.code).join(", ")}`);
  }

  const unresolvedAstrology = {
    sunSign,
    moonSign: "",
    risingSign: "",
    planets: {},
    houses: [],
    aspects: [],
    northNode: null,
    southNode: null,
    chiron: null,
  } as unknown as OfflineCodexProfile["astrologyData"];

  return {
    id: options.id ?? makeId(),
    userId: null,
    sessionId: null,
    name: input.name.trim(),
    birthDate: input.birthDate,
    birthTime: input.birthTime || null,
    birthLocation: input.birthLocation.trim(),
    timezone: input.timezone,
    latitude: input.latitude === undefined || input.latitude === "" ? null : String(input.latitude),
    longitude: input.longitude === undefined || input.longitude === "" ? null : String(input.longitude),
    isPremium: false,
    astrologyData: unresolvedAstrology,
    numerologyData,
    personalityData: {},
    archetypeData,
    biography: `${input.name.trim()}'s local Codex uses only ${sunSign} Sun symbolism and deterministic numerology in this first-pass synthesis. Life Path ${lifePath}, Expression ${expression}, and Soul Urge ${soulUrge} are calculated from entered date/name data; their meanings remain symbolic. Moon, Rising, planets, houses, aspects, nodes, and Chiron are deliberately absent rather than approximated.`,
    dailyGuidance: `${pathPattern.action} ${signPattern.action}`,
    depthInterpretation,
    localOnly: true,
    syncStatus: "local-only",
    createdAt: generatedAt,
    updatedAt: generatedAt,
  };
}


type VerifiedPlacementForSynthesis = {
  verificationStatus?: string;
  sign?: string | null;
};

export type VerifiedAstrologyForSynthesis = {
  sun?: VerifiedPlacementForSynthesis;
  moon?: VerifiedPlacementForSynthesis;
  rising?: VerifiedPlacementForSynthesis;
  planets?: Partial<Record<
    "sun" | "moon" | "mercury" | "venus" | "mars" |
    "jupiter" | "saturn" | "uranus" | "neptune" | "pluto",
    VerifiedPlacementForSynthesis
  >>;
  planetaryHouses?: Partial<Record<
    "sun" | "moon" | "mercury" | "venus" | "mars" |
    "jupiter" | "saturn" | "uranus" | "neptune" | "pluto",
    number
  >>;
  midheaven?: VerifiedPlacementForSynthesis;
  northNode?: VerifiedPlacementForSynthesis & { house?: number; mode?: string };
  southNode?: VerifiedPlacementForSynthesis & { house?: number; mode?: string };
  chiron?: VerifiedPlacementForSynthesis & {
    house?: number;
    qualificationMethod?: string;
  };
  aspects?: Array<{
    planet1?: string;
    planet2?: string;
    aspect?: string;
    orb?: number;
  }>;
};

function verifiedEvidence(
  id: string,
  field: string,
  value: string | number,
  notes: string[] = [],
): InterpretationEvidenceRef {
  return {
    id,
    system: "astrology",
    field,
    value,
    confidence: "high",
    provenanceStatus: "externally-verified",
    timeSensitivity: "birth-time-required",
    notes: [
      "Astronomical placement passed the active Soul Codex verification policy.",
      ...notes,
    ],
  };
}

function verifiedPlacementSeed(input: {
  id: string;
  field: string;
  bodyLabel: string;
  sign: string;
  house?: number;
  priority: number;
  facets: Partial<Record<
    "claritySummary" | "visiblePattern" | "innerExperience" | "hiddenNeed" |
    "protectiveFunction" | "gift" | "shadow" | "commonMisreading" |
    "relationshipImpact" | "decisionImpact" | "boundaryOrRepair" | "action",
    string
  >>;
  axes?: DepthTensionAxis[];
}): DepthSynthesisSeed {
  const signPattern = SIGN_PATTERNS[input.sign] ?? SIGN_PATTERNS.Virgo;
  const houseText = typeof input.house === "number" ? ` in House ${input.house}` : "";
  return {
    evidence: verifiedEvidence(
      input.id,
      input.field,
      `${input.sign}${houseText}`,
      [`${input.bodyLabel} sign${houseText} is verified chart evidence; its psychological meaning remains symbolic interpretation.`],
    ),
    label: `${input.bodyLabel} in ${input.sign}${houseText}`,
    priority: input.priority,
    claimKind: "derived",
    facets: Object.fromEntries(
      Object.entries(input.facets).map(([facet, value]) => [
        facet,
        typeof value === "string" && typeof input.house === "number"
          ? `${value} House ${input.house} adds emphasis on ${HOUSE_THEMES[input.house]?.theme ?? "this life area"}.`
          : value,
      ]),
    ) as DepthSynthesisSeed["facets"],
    tensionAxes: input.axes ?? signPattern.axes,
    limitations: [
      "The astronomical placement is verified; the interpretation is symbolic and should be tested against lived experience.",
    ],
  };
}

function verifiedSign(astrology: VerifiedAstrologyForSynthesis, key: "sun" | "moon" | "rising"): string | null {
  const placement = astrology[key];
  return placement?.verificationStatus === "verified" && typeof placement.sign === "string"
    ? placement.sign
    : null;
}

const HOUSE_THEMES: Record<number, { theme: string; action: string }> = {
  1: { theme: "identity, initiation, and direct self-definition", action: "Choose one action that makes your position visible without over-explaining it." },
  2: { theme: "resources, values, and material steadiness", action: "Name the resource or value you are protecting before deciding what to spend, keep, or build." },
  3: { theme: "learning, language, and everyday exchange", action: "Write the message in one clear sentence before adding more detail." },
  4: { theme: "home, roots, and private foundations", action: "Strengthen one private foundation before asking the public layer to carry more weight." },
  5: { theme: "creative risk, play, and visible self-expression", action: "Make one creative choice that is specific enough to be seen and tested." },
  6: { theme: "craft, routines, service, and maintenance", action: "Improve one repeatable routine instead of trying to repair the whole system at once." },
  7: { theme: "partnership, agreements, and reflected needs", action: "Clarify one agreement out loud rather than assuming mutual understanding." },
  8: { theme: "shared stakes, trust, and transformation", action: "Separate what is yours to carry from what is shared before making the next commitment." },
  9: { theme: "meaning, worldview, study, and expansion", action: "Test one belief against a concrete experience or source before building on it." },
  10: { theme: "public direction, responsibility, and visible contribution", action: "Choose the next public responsibility by impact, not by appearance alone." },
  11: { theme: "networks, future plans, and collective contribution", action: "Identify which group or long-range goal deserves your next unit of attention." },
  12: { theme: "closure, retreat, imagination, and hidden processing", action: "Create protected space to finish or release one unfinished internal cycle." },
};

const ELEMENT_LANGUAGE: Record<string, { emphasis: string; gift: string; shadow: string }> = {
  Fire: {
    emphasis: "initiative, visibility, and momentum",
    gift: "decisive movement and the courage to make energy visible",
    shadow: "acting before enough context or recovery is available",
  },
  Earth: {
    emphasis: "stability, usefulness, and durable execution",
    gift: "turning intention into repeatable structure",
    shadow: "staying with a method after the conditions have changed",
  },
  Air: {
    emphasis: "ideas, comparison, language, and perspective",
    gift: "seeing connections quickly and translating them for others",
    shadow: "remaining in analysis after the useful decision point has passed",
  },
  Water: {
    emphasis: "sensitivity, bonding, memory, and emotional context",
    gift: "noticing relational or emotional information that others may miss",
    shadow: "carrying emotional material without first checking whether it belongs to you",
  },
};

function verifiedAggregateEvidence(
  id: string,
  field: string,
  value: string,
  notes: string[],
): InterpretationEvidenceRef {
  return {
    id,
    system: "astrology",
    field,
    value,
    confidence: "high",
    provenanceStatus: "partially-verified",
    timeSensitivity: "birth-time-required",
    notes: [
      "This aggregate is deterministically derived from individually verified chart placements.",
      ...notes,
    ],
  };
}

function dominantVerifiedElement(
  astrology: VerifiedAstrologyForSynthesis,
): { element: string; count: number; total: number } | null {
  const counts = new Map<string, number>();
  let total = 0;
  for (const placement of Object.values(astrology.planets ?? {})) {
    if (placement?.verificationStatus !== "verified" || !placement.sign) continue;
    const element = elementForSign(placement.sign);
    counts.set(element, (counts.get(element) ?? 0) + 1);
    total += 1;
  }
  if (total === 0) return null;
  const ordered = ["Fire", "Earth", "Air", "Water"];
  const element = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || ordered.indexOf(a[0]) - ordered.indexOf(b[0]))[0]?.[0];
  if (!element) return null;
  return { element, count: counts.get(element) ?? 0, total };
}

function strongestVerifiedHouse(
  astrology: VerifiedAstrologyForSynthesis,
): { house: number; count: number } | null {
  const counts = new Map<number, number>();
  for (const house of Object.values(astrology.planetaryHouses ?? {})) {
    if (typeof house !== "number" || house < 1 || house > 12) continue;
    counts.set(house, (counts.get(house) ?? 0) + 1);
  }
  const winner = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0];
  return winner ? { house: winner[0], count: winner[1] } : null;
}

function aspectDynamicText(aspect: NonNullable<VerifiedAstrologyForSynthesis["aspects"]>[number]): {
  summary: string;
  relationship: string;
  repair: string;
} {
  const pair = `${aspect.planet1}–${aspect.planet2}`;
  const orb = typeof aspect.orb === "number" ? ` at ${aspect.orb.toFixed(2)}°` : "";
  switch (aspect.aspect) {
    case "conjunction":
      return {
        summary: `${pair} conjunction${orb} concentrates two verified functions into the same symbolic lane.`,
        relationship: `The ${pair} conjunction may make those two functions arrive together rather than taking turns.`,
        repair: "When both impulses activate at once, name which one is setting the pace before acting.",
      };
    case "opposition":
      return {
        summary: `${pair} opposition${orb} places two verified functions across a polarity that may need active balancing.`,
        relationship: `The ${pair} opposition may become most visible when another person or situation carries the opposite side of the polarity.`,
        repair: "State both sides of the tradeoff before choosing which one leads this decision.",
      };
    case "square":
      return {
        summary: `${pair} square${orb} marks a verified friction angle that may demand adjustment rather than passive blending.`,
        relationship: `The ${pair} square may show up as pressure to solve two valid demands at the same time.`,
        repair: "Choose one concrete compromise that reduces friction without pretending the two demands are identical.",
      };
    case "trine":
      return {
        summary: `${pair} trine${orb} links two verified functions through an easier flow that may become automatic.`,
        relationship: `The ${pair} trine may make this combination feel natural enough that its strengths are easy to overlook.`,
        repair: "Use the easy coordination deliberately instead of assuming it will carry every situation by itself.",
      };
    case "sextile":
      return {
        summary: `${pair} sextile${orb} marks a verified opportunity angle that tends to need participation to become useful.`,
        relationship: `The ${pair} sextile may work best when there is an active invitation, experiment, or exchange.`,
        repair: "Create one small opportunity to use both functions together instead of waiting for the pattern to activate itself.",
      };
    default:
      return {
        summary: `${pair} ${aspect.aspect ?? "aspect"}${orb} is verified geometry that adds a specific interaction to the chart.`,
        relationship: `The ${pair} interaction may be more useful as a coordination question than as a fixed personality label.`,
        repair: "Observe when both functions appear together and record what actually helps them coordinate.",
      };
  }
}

function verifiedAggregateSeeds(
  astrology: VerifiedAstrologyForSynthesis,
): DepthSynthesisSeed[] {
  const seeds: DepthSynthesisSeed[] = [];

  const risingSign =
    astrology.rising?.verificationStatus === "verified" &&
    typeof astrology.rising.sign === "string"
      ? astrology.rising.sign
      : null;
  const midheavenSign =
    astrology.midheaven?.verificationStatus === "verified" &&
    typeof astrology.midheaven.sign === "string"
      ? astrology.midheaven.sign
      : null;
  const sunHouse = astrology.planetaryHouses?.sun;
  const moonHouse = astrology.planetaryHouses?.moon;

  if (
    risingSign &&
    midheavenSign &&
    typeof sunHouse === "number" &&
    typeof moonHouse === "number"
  ) {
    const sunHouseLanguage = HOUSE_THEMES[sunHouse];
    const moonHouseLanguage = HOUSE_THEMES[moonHouse];
    const risingLanguage = SIGN_PATTERNS[risingSign] ?? SIGN_PATTERNS.Virgo;
    const mcLanguage = SIGN_PATTERNS[midheavenSign] ?? SIGN_PATTERNS.Virgo;

    seeds.push({
      evidence: verifiedAggregateEvidence(
        "verified.astrology.aggregate.chart-geometry",
        "chartGeometrySignature",
        `Ascendant ${risingSign}; MC ${midheavenSign}; Sun H${sunHouse}; Moon H${moonHouse}`,
        [
          "Chart geometry signature uses only verified Ascendant, Midheaven, and Equal House assignments.",
        ],
      ),
      label: `Verified geometry: ${risingSign} Rising, ${midheavenSign} MC, Sun H${sunHouse}, Moon H${moonHouse}`,
      priority: 126,
      claimKind: "derived",
      facets: {
        claritySummary:
          `Verified chart geometry combines ${risingSign} Rising with a ${midheavenSign} Midheaven, while the Sun falls in House ${sunHouse} and Moon in House ${moonHouse}.`,
        visiblePattern:
          `The ${risingSign} Ascendant may make ${risingLanguage.gift} more visible, while the ${midheavenSign} Midheaven adds public-direction symbolism around ${mcLanguage.drive}.`,
        hiddenNeed:
          `Moon in House ${moonHouse} places extra symbolic weight on ${moonHouseLanguage.theme}, while Sun in House ${sunHouse} keeps returning attention to ${sunHouseLanguage.theme}.`,
        decisionImpact:
          `When priorities compete, this chart geometry suggests checking both House ${sunHouse} themes—${sunHouseLanguage.theme}—and House ${moonHouse} themes—${moonHouseLanguage.theme}—instead of treating them as interchangeable.`,
        boundaryOrRepair:
          `Use the verified House ${sunHouse}/House ${moonHouse} split as a reflection prompt: identify which life area is asking for action and which is asking for emotional processing before combining them.`,
      },
      tensionAxes: [...risingLanguage.axes, ...mcLanguage.axes],
      limitations: [
        "The chart geometry is verified astronomical data; the psychological and life-area language remains symbolic interpretation.",
      ],
    });
  }
  const element = dominantVerifiedElement(astrology);
  if (element) {
    const language = ELEMENT_LANGUAGE[element.element];
    seeds.push({
      evidence: verifiedAggregateEvidence(
        "verified.astrology.aggregate.element",
        "dominantElement",
        `${element.element} ${element.count}/${element.total}`,
        ["Element concentration is counted from verified Sun-through-Pluto signs."],
      ),
      label: `${element.element} concentration (${element.count} of ${element.total} verified planets)`,
      priority: 110,
      claimKind: "derived",
      facets: {
        claritySummary: `Across the verified planets, ${element.element} is the strongest element concentration, emphasizing ${language.emphasis}.`,
        gift: `This ${element.element} concentration may support ${language.gift}.`,
        shadow: `When the same emphasis is overused, the cost may look like ${language.shadow}.`,
      },
      tensionAxes: [],
      limitations: ["Element concentration is a symbolic aggregation of verified placements, not a scientific personality measurement."],
    });
  }

  const house = strongestVerifiedHouse(astrology);
  if (house) {
    const houseLanguage = HOUSE_THEMES[house.house];
    seeds.push({
      evidence: verifiedAggregateEvidence(
        "verified.astrology.aggregate.house",
        "houseConcentration",
        `House ${house.house}: ${house.count} verified planets`,
        ["House concentration is counted from verified planetary Equal House assignments."],
      ),
      label: `House ${house.house} concentration (${house.count} verified planets)`,
      priority: 109,
      claimKind: "derived",
      facets: {
        visiblePattern: `The strongest house concentration falls in House ${house.house}, putting extra symbolic weight on ${houseLanguage.theme}.`,
        hiddenNeed: `A repeated House ${house.house} emphasis may keep pulling attention back toward ${houseLanguage.theme}.`,
        decisionImpact: `When choices compete, House ${house.house} themes—${houseLanguage.theme}—may deserve explicit consideration rather than being treated as background.`,
        action: houseLanguage.action,
      },
      tensionAxes: [],
      limitations: ["House concentration is a deterministic summary of verified Equal House positions; interpretation remains symbolic."],
    });
  }

  const strongest = [...(astrology.aspects ?? [])]
    .filter((aspect) => aspect.planet1 && aspect.planet2 && aspect.aspect && typeof aspect.orb === "number")
    .sort((a, b) => (a.orb ?? 99) - (b.orb ?? 99))[0];
  if (strongest) {
    const dynamic = aspectDynamicText(strongest);
    seeds.push({
      evidence: verifiedAggregateEvidence(
        "verified.astrology.aggregate.strongest-aspect",
        "strongestAspect",
        `${strongest.planet1} ${strongest.aspect} ${strongest.planet2} ${strongest.orb?.toFixed(2)}°`,
        ["The strongest aspect is the smallest-orb verified major aspect in the supplied chart."],
      ),
      label: `Strongest aspect: ${strongest.planet1} ${strongest.aspect} ${strongest.planet2}`,
      priority: 108,
      claimKind: "inferred",
      facets: {
        innerExperience: dynamic.summary,
        relationshipImpact: dynamic.relationship,
        commonMisreading: "A strong aspect describes interaction between chart functions; reducing it to one adjective can erase the actual tension or cooperation.",
        boundaryOrRepair: dynamic.repair,
      },
      tensionAxes: [],
      limitations: ["Aspect geometry is verified; the interaction language is symbolic and should be tested against lived experience."],
    });
  }

  return seeds;
}

/**
 * Rebuild narrative synthesis only after the full astronomy verification
 * contract has passed. This prevents the richer chart from being stored merely
 * as rows while biography/depth prose remains frozen at the local Sun-only
 * synthesis.
 */
export function synthesizeVerifiedFoundationProfile(
  local: OfflineCodexProfile,
  astrology: VerifiedAstrologyForSynthesis,
  generatedAt = new Date().toISOString(),
): Pick<
  OfflineCodexProfile,
  "biography" | "dailyGuidance" | "depthInterpretation" | "archetypeData"
> {
  const sun = verifiedSign(astrology, "sun");
  const moon = verifiedSign(astrology, "moon");
  const rising = verifiedSign(astrology, "rising");
  if (!sun || !moon || !rising || !astrology.planets) {
    return {
      biography: local.biography,
      dailyGuidance: local.dailyGuidance,
      depthInterpretation: local.depthInterpretation,
      archetypeData: local.archetypeData,
    };
  }

  const lifePath = local.numerologyData.lifePath;
  const expression = local.numerologyData.expression;
  const soulUrge = local.numerologyData.soulUrge;
  const pathPattern = LIFE_PATHS[lifePath] ?? LIFE_PATHS[9];
  const sunPattern = SIGN_PATTERNS[sun] ?? SIGN_PATTERNS.Virgo;
  const moonPattern = SIGN_PATTERNS[moon] ?? SIGN_PATTERNS.Virgo;
  const risingPattern = SIGN_PATTERNS[rising] ?? SIGN_PATTERNS.Virgo;

  const seeds: DepthSynthesisSeed[] = [
    ...verifiedAggregateSeeds(astrology),
    makeSeed("verified.numerology.life-path", "numerology", "lifePath", lifePath, `Life Path ${lifePath} symbolism`, pathPattern, 100),
    makeSeed("verified.numerology.expression", "numerology", "expression", expression, `Expression ${expression} symbolism`, LIFE_PATHS[expression] ?? LIFE_PATHS[1], 96),
    makeSeed("verified.numerology.soul-urge", "numerology", "soulUrge", soulUrge, `Soul Urge ${soulUrge} symbolism`, LIFE_PATHS[soulUrge] ?? LIFE_PATHS[6], 95),
    verifiedPlacementSeed({
      id: "verified.astrology.sun",
      field: "sun",
      bodyLabel: "Sun",
      sign: sun,
      house: astrology.planetaryHouses?.sun,
      priority: 130,
      facets: {
        claritySummary: `The verified Sun layer emphasizes ${sunPattern.drive}.`,
      },
    }),
    verifiedPlacementSeed({
      id: "verified.astrology.moon",
      field: "moon",
      bodyLabel: "Moon",
      sign: moon,
      house: astrology.planetaryHouses?.moon,
      priority: 128,
      facets: {
        innerExperience: `The verified Moon layer may describe an inner pull toward ${moonPattern.drive}.`,
        hiddenNeed: `Emotionally, the pattern may seek conditions that support ${moonPattern.drive}.`,
        relationshipImpact: `In close relationships, it ${moonPattern.relationship}.`,
      },
    }),
    verifiedPlacementSeed({
      id: "verified.astrology.rising",
      field: "rising",
      bodyLabel: "Rising",
      sign: rising,
      priority: 127,
      facets: {
        visiblePattern: `The verified Rising layer may present through ${risingPattern.gift}.`,
        commonMisreading: `That outward style may be mistaken for ${risingPattern.shadow} when context is ignored.`,
      },
    }),
  ];

  const bodyConfig: Array<{
    key: keyof NonNullable<VerifiedAstrologyForSynthesis["planets"]>;
    label: string;
    priority: number;
    facet: keyof NonNullable<DepthSynthesisSeed["facets"]>;
    prefix: string;
  }> = [
    { key: "mercury", label: "Mercury", priority: 122, facet: "claritySummary", prefix: "Communication and mental sorting may emphasize" },
    { key: "venus", label: "Venus", priority: 121, facet: "relationshipImpact", prefix: "Relational preferences may emphasize" },
    { key: "mars", label: "Mars", priority: 120, facet: "action", prefix: "Action and assertion may emphasize" },
    { key: "jupiter", label: "Jupiter", priority: 116, facet: "gift", prefix: "Growth and confidence may expand through" },
    { key: "saturn", label: "Saturn", priority: 119, facet: "protectiveFunction", prefix: "Structure and restraint may organize around" },
    { key: "uranus", label: "Uranus", priority: 112, facet: "commonMisreading", prefix: "Change and nonconformity may be expressed through" },
    { key: "neptune", label: "Neptune", priority: 111, facet: "innerExperience", prefix: "Imagination and sensitivity may color" },
    { key: "pluto", label: "Pluto", priority: 118, facet: "shadow", prefix: "Pressure for transformation may intensify" },
  ];

  for (const config of bodyConfig) {
    const placement = astrology.planets[config.key];
    if (placement?.verificationStatus !== "verified" || !placement.sign) continue;
    const patternValue = SIGN_PATTERNS[placement.sign] ?? SIGN_PATTERNS.Virgo;
    seeds.push(verifiedPlacementSeed({
      id: `verified.astrology.${config.key}`,
      field: config.key,
      bodyLabel: config.label,
      sign: placement.sign,
      house: astrology.planetaryHouses?.[config.key],
      priority: config.priority,
      facets: {
        [config.facet]: `${config.prefix} ${patternValue.drive}.`,
      },
      axes: patternValue.axes,
    }));
  }

  if (astrology.midheaven?.verificationStatus === "verified" && astrology.midheaven.sign) {
    const mcPattern = SIGN_PATTERNS[astrology.midheaven.sign] ?? SIGN_PATTERNS.Virgo;
    seeds.push(verifiedPlacementSeed({
      id: "verified.astrology.midheaven",
      field: "midheaven",
      bodyLabel: "Midheaven",
      sign: astrology.midheaven.sign,
      priority: 117,
      facets: {
        visiblePattern: `Public-direction symbolism may emphasize ${mcPattern.drive}.`,
        decisionImpact: `Visible commitments may become clearer when they support ${mcPattern.gift} without repeating ${mcPattern.shadow}.`,
      },
    }));
  }

  for (const [key, label] of [["northNode", "Mean North Node"], ["southNode", "Mean South Node"]] as const) {
    const node = astrology[key];
    if (node?.verificationStatus !== "verified" || !node.sign) continue;
    const nodePattern = SIGN_PATTERNS[node.sign] ?? SIGN_PATTERNS.Virgo;
    seeds.push(verifiedPlacementSeed({
      id: `verified.astrology.${key}`,
      field: key,
      bodyLabel: label,
      sign: node.sign,
      house: node.house,
      priority: key === "northNode" ? 114 : 109,
      facets: key === "northNode"
        ? { decisionImpact: `Developmental-direction symbolism may invite more ${nodePattern.drive}.` }
        : { protectiveFunction: `Familiar-pattern symbolism may fall back toward ${nodePattern.drive}.` },
    }));
  }

  if (
    astrology.chiron?.verificationStatus === "verified" &&
    astrology.chiron.sign &&
    astrology.chiron.qualificationMethod === "live-jpl-qualified-against-swiss"
  ) {
    const chironPattern = SIGN_PATTERNS[astrology.chiron.sign] ?? SIGN_PATTERNS.Virgo;
    seeds.push(verifiedPlacementSeed({
      id: "verified.astrology.chiron",
      field: "chiron",
      bodyLabel: "Chiron",
      sign: astrology.chiron.sign,
      house: astrology.chiron.house,
      priority: 115,
      facets: {
        boundaryOrRepair: `Repair-oriented symbolism may call for ${chironPattern.action.toLowerCase()}`,
        action: chironPattern.action,
      },
    }));
  }

  const strongestAspects = [...(astrology.aspects ?? [])]
    .filter((aspect) => aspect.planet1 && aspect.planet2 && aspect.aspect && typeof aspect.orb === "number")
    .sort((left, right) => (left.orb ?? 99) - (right.orb ?? 99))
    .slice(0, 6);
  for (const [index, aspect] of strongestAspects.entries()) {
    const label = `${aspect.planet1} ${aspect.aspect} ${aspect.planet2}`;
    seeds.push({
      evidence: verifiedEvidence(
        `verified.astrology.aspect.${index}`,
        "aspect",
        `${label} orb ${aspect.orb?.toFixed(2)}°`,
      ),
      label,
      priority: 108 - index,
      claimKind: "inferred",
      facets: {
        decisionImpact: `The verified ${label} aspect may describe two chart functions that need coordination rather than a single fixed trait.`,
        commonMisreading: `When these two functions pull differently, reducing the aspect to one fixed personality label may miss the interaction.`,
      },
      tensionAxes: [],
      limitations: [
        "Aspect geometry is verified; this interpretive meaning is symbolic and non-diagnostic.",
      ],
    });
  }

  const depthInterpretation = synthesizeDepthInterpretationV1({
    version: 1,
    generatedAt,
    birthTimeStatus: "known",
    seeds,
    missingData: [
      "Human Design core can only be included when its separately verified snapshot is present on the profile.",
      "Mirror behavioral answers are not yet available in the active create-profile flow.",
      "Variables and Incarnation Cross naming remain outside the verified Human Design core.",
    ],
  });
  const validation = validateDepthInterpretationV1(depthInterpretation, {
    birthTimeStatus: "known",
  });
  if (!validation.valid) {
    throw new Error(`Verified depth synthesis failed validation: ${validation.findings.map((finding) => finding.code).join(", ")}`);
  }

  const planetSummary = bodyConfig
    .map((config) => {
      const placement = astrology.planets?.[config.key];
      if (placement?.verificationStatus !== "verified" || !placement.sign) return null;
      const house = astrology.planetaryHouses?.[config.key];
      return `${config.label} in ${placement.sign}${typeof house === "number" ? ` (House ${house})` : ""}`;
    })
    .filter((value): value is string => Boolean(value));

  const aspectSummary = strongestAspects
    .slice(0, 3)
    .map((aspect) =>
      `${aspect.planet1} ${aspect.aspect} ${aspect.planet2} (${aspect.orb?.toFixed(2)}°)`
    );

  const dominantElement = dominantVerifiedElement(astrology);
  const houseConcentration = strongestVerifiedHouse(astrology);
  const strongestAspect = strongestAspects[0];
  const strongestAspectText = strongestAspect
    ? aspectDynamicText(strongestAspect).summary
    : null;
  const emphasisSummary = [
    dominantElement
      ? `${dominantElement.element} leads the verified elemental distribution (${dominantElement.count}/${dominantElement.total})`
      : null,
    houseConcentration
      ? `House ${houseConcentration.house} is the most populated verified house (${houseConcentration.count} planets)`
      : null,
    strongestAspectText,
  ].filter((value): value is string => Boolean(value)).join(". ");

  const geometrySignature = [
    `${rising}-Rising`,
    typeof astrology.planetaryHouses?.sun === "number"
      ? `${sun}-Sun-H${astrology.planetaryHouses.sun}`
      : `${sun}-Sun`,
    typeof astrology.planetaryHouses?.moon === "number"
      ? `${moon}-Moon-H${astrology.planetaryHouses.moon}`
      : `${moon}-Moon`,
    astrology.midheaven?.sign
      ? `${astrology.midheaven.sign}-MC`
      : "MC-unresolved",
  ].join(" / ");

  const biography =
    `${local.name}'s verified Codex is now anchored by a ${sun} Sun` +
    `${typeof astrology.planetaryHouses?.sun === "number" ? ` in House ${astrology.planetaryHouses.sun}` : ""}, ` +
    `${moon} Moon` +
    `${typeof astrology.planetaryHouses?.moon === "number" ? ` in House ${astrology.planetaryHouses.moon}` : ""}, ` +
    `and ${rising} Rising. Geometry signature: ${geometrySignature}. ` +
    `${planetSummary.length ? `Verified planetary pattern: ${planetSummary.join("; ")}. ` : ""}` +
    `Midheaven ${astrology.midheaven?.sign ?? "unresolved"}; ` +
    `Mean North Node ${astrology.northNode?.sign ?? "unresolved"}` +
    `${typeof astrology.northNode?.house === "number" ? ` in House ${astrology.northNode.house}` : ""}; ` +
    `Mean South Node ${astrology.southNode?.sign ?? "unresolved"}` +
    `${typeof astrology.southNode?.house === "number" ? ` in House ${astrology.southNode.house}` : ""}; ` +
    `Chiron ${astrology.chiron?.sign ?? "unresolved"}` +
    `${typeof astrology.chiron?.house === "number" ? ` in House ${astrology.chiron.house}` : ""}. ` +
    `${aspectSummary.length ? `Strongest verified major aspects: ${aspectSummary.join("; ")}. ` : ""}` +
    `${emphasisSummary ? `Chart emphasis: ${emphasisSummary}. ` : ""}` +
    `Life Path ${lifePath}, Expression ${expression}, and Soul Urge ${soulUrge} add deterministic numerology layers. ` +
    `These are evidence-backed calculations feeding symbolic interpretation, not a fixed identity diagnosis.`;

  const enrichedArchetype = {
    ...local.archetypeData,
    description:
      `${local.archetypeData.description} Verified ${moon} Moon and ${rising} Rising now add time-sensitive chart context.`,
    themes: Array.from(new Set([
      ...local.archetypeData.themes,
      `${moon} Moon`,
      `${rising} Rising`,
      `${astrology.midheaven?.sign ?? "Unresolved"} Midheaven`,
    ])),
  };

  return {
    biography,
    dailyGuidance: [
      houseConcentration ? HOUSE_THEMES[houseConcentration.house].action : null,
      strongestAspect ? aspectDynamicText(strongestAspect).repair : null,
      dominantElement ? `Use the ${dominantElement.element} emphasis deliberately: ${ELEMENT_LANGUAGE[dominantElement.element].gift}.` : null,
      pathPattern.action,
    ].filter((value): value is string => Boolean(value)).join(" "),
    depthInterpretation,
    archetypeData: enrichedArchetype,
  };
}

/**
 * Repair deterministic local synthesis created by the former timezone-sensitive
 * date parser. Online astronomy evidence is deliberately preserved verbatim.
 */
export function repairFoundationOfflineCodexProfile<T extends OfflineCodexProfile>(
  profile: T,
  options: { repairedAt?: string; currentYear?: number } = {},
): T {
  let expectedLifePath: number;
  try {
    expectedLifePath = calcLifePath(profile.birthDate);
  } catch {
    return profile;
  }

  if (profile.numerologyData?.lifePath === expectedLifePath) return profile;

  const repairedAt = options.repairedAt ?? new Date().toISOString();
  const rebuilt = generateFoundationOfflineCodexProfile(
    {
      name: profile.name,
      birthDate: profile.birthDate,
      birthTime: profile.birthTime ?? "",
      birthLocation: profile.birthLocation,
      timezone: profile.timezone,
      latitude: profile.latitude ?? "",
      longitude: profile.longitude ?? "",
    },
    {
      id: profile.id,
      generatedAt: repairedAt,
      currentYear: options.currentYear,
    },
  );

  return {
    ...profile,
    numerologyData: rebuilt.numerologyData,
    archetypeData: rebuilt.archetypeData,
    biography: rebuilt.biography,
    dailyGuidance: rebuilt.dailyGuidance,
    depthInterpretation: rebuilt.depthInterpretation,
    updatedAt: repairedAt,
  };
}
