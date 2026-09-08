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
