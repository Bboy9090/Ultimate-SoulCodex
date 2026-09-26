import {
  synthesizeDepthInterpretationV1,
  validateDepthInterpretationV1,
  type BirthTimeStatus,
  type DepthInterpretationV1,
  type DepthSynthesisSeed,
  type DepthTensionAxis,
  type InterpretationEvidenceRef,
} from "../depth-interpretation/index.js";
import {
  calcBirthday,
  calcExpression,
  calcLifePath,
  calcMaturity,
  calcPersonality,
  calcSoulUrge,
  numerologyNameComponentAvailability,
} from "../compute/numerology.js";
import { calcPersonalYear } from "../compute/personal-numbers.js";
import { resolveOfflineSun } from "../compute/offline-sun.js";

export interface OfflineBirthInput {
  name: string;
  birthDate: string;
  birthTime?: string;
  birthLocation: string;
  timezone: string;
  latitude?: string | number;
  longitude?: string | number;
}

export interface OfflineAstrologyData {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  planets: Record<string, { sign: string; house: number; degree: number }>;
  houses: Array<{ sign: string; degree: number }>;
  aspects: Array<{ planet1: string; planet2: string; aspect: string; orb: number }>;
  northNode: { sign: string; house: number; degree: number } | null;
  southNode: { sign: string; house: number; degree: number } | null;
  chiron: { sign: string; house: number; degree: number } | null;
}

export interface OfflineNumerologyData {
  lifePath: number;
  birthday: number;
  expression: number;
  soulUrge: number | null;
  personality: number | null;
  maturity: number;
  personalYear: number;
  interpretations: Record<string, string>;
}

export interface OfflineArchetypeData {
  title: string;
  description: string;
  strengths: string[];
  shadows: string[];
  themes: string[];
  guidance: string;
}

export interface OfflineCodexProfile {
  id: string;
  userId: null;
  sessionId: null;
  name: string;
  birthDate: string;
  birthTime: string | null;
  birthLocation: string;
  timezone: string;
  latitude: string | null;
  longitude: string | null;
  isPremium: false;
  astrologyData: OfflineAstrologyData;
  numerologyData: OfflineNumerologyData;
  humanDesignData?: Record<string, unknown> | null;
  personalityData: Record<string, never>;
  archetypeData: OfflineArchetypeData;
  biography: string;
  dailyGuidance: string;
  depthInterpretation: DepthInterpretationV1;
  localOnly: true;
  syncStatus: "local-only";
  createdAt: string;
  updatedAt: string;
}

export interface OfflineCodexOptions {
  id?: string;
  generatedAt?: string;
  currentYear?: number;
}

type SignTrait = {
  drive: string;
  gift: string;
  shadow: string;
  relationship: string;
  action: string;
  axes: DepthTensionAxis[];
};

type LifePathTrait = {
  theme: string;
  drive: string;
  shadow: string;
  action: string;
  axes: DepthTensionAxis[];
};

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const SIGN_TRAITS: Record<string, SignTrait> = {
  Aries: trait("initiating action and leading directly", "courage and momentum", "impatience that outruns context", "needs honesty and room for direct action", "Pause long enough to separate urgency from importance.", ["speed", "independence", "directness"]),
  Taurus: trait("building stability and protecting what matters", "patience and durable follow-through", "holding position after conditions change", "needs consistency and tangible trust", "Identify one place where flexibility protects the larger commitment.", ["stability", "consistency", "structure"]),
  Gemini: trait("gathering information and connecting ideas", "adaptability and verbal perspective", "scattering attention across too many signals", "needs conversation, variety, and mental responsiveness", "Choose one question to finish before opening another.", ["freedom", "analysis", "speed"]),
  Cancer: trait("protecting emotional safety and chosen bonds", "care, memory, and responsiveness", "absorbing other people's needs as personal duty", "needs emotional reciprocity and reliable belonging", "Name the need before trying to manage the entire atmosphere.", ["sensitivity", "partnership", "stability"]),
  Leo: trait("creating meaning and expressing identity visibly", "warmth, courage, and creative leadership", "using recognition as proof of worth", "needs appreciation without compulsory performance", "Make one meaningful move that does not depend on applause.", ["recognition", "independence", "directness"]),
  Virgo: trait("precision, improvement, and practical service", "discernment and useful problem solving", "analysis expanding until action stalls", "needs reliability, clarity, and respect for effort", "Define what is good enough before refining again.", ["analysis", "structure", "consistency"]),
  Libra: trait("creating balance and finding a fair answer", "diplomacy and relational awareness", "delaying confrontation until resentment accumulates", "needs mutuality and respectful negotiation", "State the uncomfortable preference before harmony becomes avoidance.", ["harmony", "partnership", "directness"]),
  Scorpio: trait("testing truth and protecting emotional depth", "focus, loyalty, and transformative insight", "holding suspicion past its useful life", "needs honesty, privacy, and earned trust", "Separate what is known from what is feared before escalating.", ["sensitivity", "structure", "directness"]),
  Sagittarius: trait("seeking meaning, freedom, and expansion", "optimism and broad perspective", "leaving depth behind for the next horizon", "needs truth, movement, and room to grow", "Finish one meaningful commitment before chasing the next possibility.", ["freedom", "speed", "independence"]),
  Capricorn: trait("building legacy through discipline and mastery", "strategy and responsible endurance", "measuring worth mainly through output", "needs respect, competence, and dependable commitments", "Protect recovery as part of the plan rather than a reward after collapse.", ["structure", "stability", "recognition"]),
  Aquarius: trait("challenging defaults and thinking independently", "originality and systems perspective", "using detachment when emotional stakes rise", "needs intellectual freedom and authentic difference", "Translate the idea into one human-scale action another person can understand.", ["independence", "freedom", "analysis"]),
  Pisces: trait("feeling deeply and translating experience into meaning", "empathy, imagination, and intuition", "weakening boundaries when another person needs support", "needs gentleness, meaning, and clear emotional boundaries", "Identify which feeling is yours before deciding what to carry.", ["sensitivity", "partnership", "freedom"]),
};

const LIFE_PATH_TRAITS: Record<number, LifePathTrait> = {
  1: life("independent initiation", "pioneering and self-direction", "mistaking support for interference", "Lead clearly without making collaboration prove weakness.", ["independence", "directness"]),
  2: life("partnership", "cooperation and sensitivity", "over-adjusting to preserve peace", "State one preference before adapting to everyone else.", ["partnership", "harmony", "sensitivity"]),
  3: life("expression", "creativity and communication", "using activity to avoid emotional depth", "Finish and share one expression rather than polishing ten possibilities.", ["recognition", "freedom"]),
  4: life("structure", "building systems that last", "confusing control with safety", "Keep the structure and loosen one unnecessary rule.", ["structure", "consistency", "stability"]),
  5: life("freedom", "adaptability and experience", "resisting repetition required for mastery", "Choose one commitment that creates more freedom later.", ["freedom", "speed", "stability"]),
  6: life("responsibility", "service and stewardship", "carrying duties that were never clearly accepted", "Return one responsibility to its rightful owner.", ["partnership", "consistency", "sensitivity"]),
  7: life("analysis", "investigation and private understanding", "waiting for certainty that cannot arrive", "Set a decision deadline before collecting another layer of evidence.", ["analysis", "independence"]),
  8: life("power", "material mastery and leadership", "using achievement as the only measure of progress", "Define the ethical boundary before pursuing the result.", ["structure", "recognition", "directness"]),
  9: life("legacy", "humanitarian purpose and completion", "overextending for the larger mission", "Finish one cycle before volunteering for another.", ["partnership", "sensitivity", "stability"]),
  11: life("intuition", "visionary insight and influence", "treating intensity as certainty", "Ground the insight in one observable test.", ["sensitivity", "recognition", "analysis"]),
  22: life("master building", "turning vision into durable reality", "making the scale of the mission personally crushing", "Reduce the vision to the next testable structure.", ["structure", "stability", "recognition"]),
  33: life("master teaching", "uplifting others through example", "becoming responsible for everyone's healing", "Teach the principle without taking over the person's work.", ["partnership", "sensitivity", "recognition"]),
};

const NUMBER_LABELS: Record<number, string> = {
  1: "Independence", 2: "Partnership", 3: "Expression", 4: "Structure",
  5: "Freedom", 6: "Responsibility", 7: "Analysis", 8: "Power", 9: "Legacy",
  11: "Intuition", 22: "Master Building", 33: "Master Teaching",
};

function trait(drive: string, gift: string, shadow: string, relationship: string, action: string, axes: DepthTensionAxis[]): SignTrait {
  return { drive, gift, shadow, relationship, action, axes };
}

function life(theme: string, drive: string, shadow: string, action: string, axes: DepthTensionAxis[]): LifePathTrait {
  return { theme, drive, shadow, action, axes };
}

function parseDate(value: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error("birthDate must use YYYY-MM-DD");
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error("birthDate is not a valid calendar date");
  }
  return { year, month, day };
}

function parseTime(value?: string): { hours: number; minutes: number; known: boolean } {
  const match = /^(\d{2}):(\d{2})$/.exec(value ?? "");
  if (!match) return { hours: 12, minutes: 0, known: false };
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return { hours: 12, minutes: 0, known: false };
  return { hours, minutes, known: true };
}

function reduceNumber(input: number): number {
  let value = Math.abs(Math.trunc(input));
  while (value > 9 && value !== 11 && value !== 22 && value !== 33) {
    value = String(value).split("").reduce((sum, digit) => sum + Number(digit), 0);
  }
  return value;
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function calculateAstrology(input: OfflineBirthInput): OfflineAstrologyData {
  const sun = resolveOfflineSun(input.birthDate, input.birthTime, input.timezone);

  // Fail closed in offline mode. The Sun is retained only when real ephemeris
  // math resolves it exactly or proves the sign stable across the local day.
  // Every time-sensitive or otherwise ungoverned placement stays unresolved.
  return {
    sunSign: sun.status === "resolved" ? sun.sign : "",
    moonSign: "",
    risingSign: "",
    planets: {},
    houses: [],
    aspects: [],
    northNode: null,
    southNode: null,
    chiron: null,
  };
}

function calculateNumerology(input: OfflineBirthInput, currentYear: number): OfflineNumerologyData {
  const availability = numerologyNameComponentAvailability(input.name);
  const lifePath = calcLifePath(input.birthDate);
  const birthday = calcBirthday(input.birthDate);
  const expression = calcExpression(input.name);
  const soulUrge = availability.vowelCount > 0 ? calcSoulUrge(input.name) : null;
  const personality = availability.consonantCount > 0 ? calcPersonality(input.name) : null;
  const maturity = calcMaturity(input.birthDate, input.name);
  const personalYear = calcPersonalYear(input.birthDate, currentYear);

  return {
    lifePath,
    birthday,
    expression,
    soulUrge,
    personality,
    maturity,
    personalYear,
    interpretations: {
      lifePath: `Life Path ${lifePath}: ${LIFE_PATH_TRAITS[lifePath]?.theme ?? "an individual growth pattern"}.`,
      birthday: `Birthday ${birthday}: deterministic reduction of the calendar day, used here only as symbolic reflection.`,
      expression: `Expression ${expression}: a symbolic description of how talents may be directed.`,
      soulUrge: soulUrge === null
        ? "Soul Urge is unresolved because the normalized name contains no A/E/I/O/U vowels under the active Y-as-consonant policy."
        : `Soul Urge ${soulUrge}: a symbolic description of inner motivation.`,
      personality: personality === null
        ? "Personality Number is unresolved because the normalized name contains no consonants under the active numerology policy."
        : `Personality ${personality}: a symbolic description of first impressions.`,
      maturity: `Maturity ${maturity}: deterministic combination of Life Path and Expression, used here only as symbolic reflection.`,
      personalYear: `Personal Year ${personalYear}: a reflective theme for ${currentYear}, not a guaranteed prediction.`,
    },
  };
}

function elementForSign(sign: string): string {
  if (["Aries", "Leo", "Sagittarius"].includes(sign)) return "fire";
  if (["Taurus", "Virgo", "Capricorn"].includes(sign)) return "earth";
  if (["Gemini", "Libra", "Aquarius"].includes(sign)) return "air";
  return "water";
}

function synthesizeArchetype(astrology: OfflineAstrologyData, numerology: OfflineNumerologyData): OfflineArchetypeData {
  const sign = astrology.sunSign ? SIGN_TRAITS[astrology.sunSign] ?? null : null;
  const path = LIFE_PATH_TRAITS[numerology.lifePath];
  if (!path) {
    throw new Error("Supported Life Path is required for local archetype synthesis.");
  }

  const expression = LIFE_PATH_TRAITS[numerology.expression];
  const soulUrgeNumber = numerology.soulUrge;
  const soulUrge = soulUrgeNumber === null ? null : LIFE_PATH_TRAITS[soulUrgeNumber];
  const fingerprint = stableHash([
    astrology.sunSign || "sun-unresolved",
    numerology.lifePath,
    numerology.expression,
    soulUrgeNumber ?? "soul-unresolved",
    numerology.personality ?? "personality-unresolved",
  ].join("|")).toString(16).padStart(8, "0").slice(0, 6).toUpperCase();

  const title = (astrology.sunSign ? astrology.sunSign + " × " : "") +
    "Life Path " + numerology.lifePath + " · " + fingerprint;
  const strengths = [...new Set([
    sign?.gift,
    path.drive,
    expression?.drive,
    soulUrge?.drive,
  ].filter((value): value is string => Boolean(value)))];
  const shadows = [...new Set([
    sign?.shadow,
    path.shadow,
    expression?.shadow,
    soulUrge?.shadow,
  ].filter((value): value is string => Boolean(value)))];
  const themes = [
    ...(astrology.sunSign ? [
      astrology.sunSign,
      elementForSign(astrology.sunSign),
    ] : []),
    "Life Path " + numerology.lifePath,
    ...(expression ? ["Expression " + numerology.expression] : []),
    ...(soulUrge ? ["Soul Urge " + soulUrgeNumber] : []),
  ].filter((value): value is string => Boolean(value));

  return {
    title,
    description:
      "Local symbolic synthesis uses " +
      (astrology.sunSign ? astrology.sunSign + " Sun themes plus " : "") +
      "Life Path " + numerology.lifePath +
      (expression ? ", Expression " + numerology.expression : "") +
      (soulUrge ? ", and Soul Urge " + soulUrgeNumber : "") +
      (astrology.sunSign
        ? ". The Sun placement is a local ephemeris calculation and has not been independently verified."
        : ". Sun-sign interpretation is withheld because the local birth day crosses a solar-sign boundary or cannot be resolved safely.") +
      " No preset archetype template is substituted for unsupported inputs.",
    strengths,
    shadows,
    themes,
    guidance: [sign?.action, path.action, expression?.action, soulUrge?.action]
      .filter((value): value is string => Boolean(value))
      .slice(0, 3)
      .join(" "),
  };
}

function makeEvidence(input: Omit<InterpretationEvidenceRef, "provenanceStatus" | "notes"> & { notes?: string[] }): InterpretationEvidenceRef {
  return {
    ...input,
    provenanceStatus: "unverified",
    notes: [
      "Generated locally from user-entered birth data.",
      "Confidence describes source completeness and internal consistency, not scientific truth.",
      ...(input.notes ?? []),
    ],
  };
}

function buildDepthInterpretation(input: OfflineBirthInput, astrology: OfflineAstrologyData, numerology: OfflineNumerologyData, archetypeData: OfflineArchetypeData, generatedAt: string): DepthInterpretationV1 {
  const birthTimeStatus: BirthTimeStatus = parseTime(input.birthTime).known ? "known" : "unknown";
  const sign = astrology.sunSign ? SIGN_TRAITS[astrology.sunSign] ?? null : null;
  const path = LIFE_PATH_TRAITS[numerology.lifePath];
  if (!path) throw new Error("Unsupported Life Path cannot influence offline synthesis.");
  const expression = LIFE_PATH_TRAITS[numerology.expression] ?? null;
  const soulUrgeNumber = numerology.soulUrge;
  const soulUrge = soulUrgeNumber === null ? null : LIFE_PATH_TRAITS[soulUrgeNumber] ?? null;

  const seeds: DepthSynthesisSeed[] = [
    ...(sign ? [{
      evidence: makeEvidence({
        id: "offline.astrology.sun",
        system: "astrology",
        field: "sunSign",
        value: astrology.sunSign,
        confidence: "moderate",
        timeSensitivity: "none",
        notes: [
          "Calculated locally with astronomy-engine.",
          "The placement is not independently verified in offline mode.",
        ],
      }),
      label: `${astrology.sunSign} Sun symbolism`,
      priority: 100,
      claimKind: "derived" as const,
      facets: {
        claritySummary: `A central pattern emphasizes ${sign.drive}.`,
        visiblePattern: `Others may first notice ${sign.gift}.`,
        hiddenNeed: `The pattern may be trying to preserve conditions for ${sign.drive}.`,
        gift: `The constructive expression is ${sign.gift}.`,
        shadow: `When overused, the same pattern can become ${sign.shadow}.`,
        relationshipImpact: `In relationships, the symbolic pattern ${sign.relationship}.`,
        boundaryOrRepair: sign.action,
        action: `Choose one situation to test this pattern this week. ${sign.action}`,
      },
      tensionAxes: sign.axes,
      limitations: [
        "Sun longitude is locally calculated but not independently verified.",
        "Sun-sign symbolism is interpretive and does not establish fixed personality.",
      ],
    }] : []),
    {
      evidence: makeEvidence({ id: "offline.numerology.life-path", system: "numerology", field: "lifePath", value: numerology.lifePath, confidence: "moderate", timeSensitivity: "none", notes: ["Calculated locally from the entered calendar date."] }),
      label: `Life Path ${numerology.lifePath} symbolism`, priority: 95, claimKind: "derived",
      facets: {
        claritySummary: `The numerology layer adds a theme of ${path.theme}.`, innerExperience: `Internally, attention may return to ${path.drive}.`,
        protectiveFunction: `The pattern may protect the ability to continue ${path.drive}.`, shadow: `Under pressure, the cost may appear as ${path.shadow}.`,
        decisionImpact: `Decisions may become clearer when they support ${path.drive} without repeating ${path.shadow}.`, action: path.action,
      },
      tensionAxes: path.axes,
      limitations: ["Numerology is a symbolic framework and should be tested against lived experience."],
    },
    ...(expression ? [{
      evidence: makeEvidence({ id: "offline.numerology.expression", system: "numerology", field: "expression", value: numerology.expression, confidence: "moderate", timeSensitivity: "none", notes: ["Calculated deterministically from the supplied name."] }),
      label: "Expression " + numerology.expression + " " + (NUMBER_LABELS[numerology.expression] ?? expression.theme), priority: 108, claimKind: "derived" as const,
      facets: {
        visiblePattern: "Expression " + numerology.expression + " adds " + expression.drive + " as a symbolic outward-development theme.",
        gift: "The Expression layer can become " + expression.drive + " when it is chosen rather than performed.",
        decisionImpact: "Expression " + numerology.expression + " may favor choices that preserve " + expression.drive + ".",
        commonMisreading: "The visible Expression pattern may be mistaken for a fixed personality when it is only one name-number interpretation.",
      },
      tensionAxes: expression.axes,
      limitations: ["The Expression number is deterministic from the supplied name; its personality meaning remains symbolic interpretation."],
    }] : []),
    ...(soulUrge && soulUrgeNumber !== null ? [{
      evidence: makeEvidence({ id: "offline.numerology.soul-urge", system: "numerology", field: "soulUrge", value: soulUrgeNumber, confidence: "moderate", timeSensitivity: "none", notes: ["Calculated deterministically from vowels in the supplied name."] }),
      label: "Soul Urge " + soulUrgeNumber + " " + (NUMBER_LABELS[soulUrgeNumber] ?? soulUrge.theme), priority: 107, claimKind: "derived" as const,
      facets: {
        hiddenNeed: "Soul Urge " + soulUrgeNumber + " adds " + soulUrge.drive + " as a symbolic inner-motivation theme.",
        protectiveFunction: "Protection may become organized around preserving room for " + soulUrge.drive + ".",
        relationshipImpact: "The Soul Urge layer may make " + soulUrge.drive + " especially noticeable around trust and belonging.",
        shadow: "When overused, the Soul Urge theme may repeat " + soulUrge.shadow + ".",
      },
      tensionAxes: soulUrge.axes,
      limitations: ["The Soul Urge number is deterministic from the supplied name; its motivation meaning remains symbolic interpretation."],
    }] : []),
    {
      evidence: makeEvidence({ id: "offline.archetype.primary", system: "system", field: "archetype", value: archetypeData.title, confidence: "moderate", timeSensitivity: "none", notes: ["Synthesized only from locally supported inputs."] }),
      label: `${archetypeData.title} synthesis`, priority: 85, claimKind: "inferred",
      facets: {
        visiblePattern: archetypeData.description, gift: archetypeData.strengths.join(", "),
        commonMisreading: `The strengths of ${archetypeData.title} may be judged only by their shadow form: ${archetypeData.shadows.join(", ")}.`,
        boundaryOrRepair: archetypeData.guidance,
      },
      tensionAxes: [...(sign?.axes ?? []), ...path.axes],
      limitations: ["The archetype combines symbolic sources; overlap is supporting context, not independent proof."],
    },
  ];

  const interpretation = synthesizeDepthInterpretationV1({
    version: 1,
    generatedAt,
    birthTimeStatus,
    seeds,
    missingData: [
      ...(!sign ? ["Sun sign is unresolved locally because the birth day crosses a solar-sign boundary or the local time cannot be resolved safely."] : []),
      ...(birthTimeStatus === "unknown" ? ["Exact birth time is unknown; Rising sign, houses, angles, Moon degree, and time-sensitive Human Design claims are unavailable."] : []),
      "Mirror behavioral answers are not yet available in the active create-profile flow.",
      "Human Design core is withheld from this offline profile until its qualified engine result is explicitly reconciled.",
      "Moon, Rising, houses, planetary placements, nodes, aspects, and Chiron are withheld from local interpretation until verified astronomy is explicitly reconciled.",
    ],
  });
  const validation = validateDepthInterpretationV1(interpretation, { birthTimeStatus });
  if (!validation.valid) {
    throw new Error(`Offline depth interpretation failed validation: ${validation.findings.map((finding) => finding.code).join(", ")}`);
  }
  return interpretation;
}

function makeId(): string {
  if (globalThis.crypto?.randomUUID) return `local-${globalThis.crypto.randomUUID()}`;
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function generateOfflineCodexProfile(input: OfflineBirthInput, options: OfflineCodexOptions = {}): OfflineCodexProfile {
  if (!input.name.trim()) throw new Error("name is required");
  if (!input.birthLocation.trim()) throw new Error("birthLocation is required");
  parseDate(input.birthDate);
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const currentYear = options.currentYear ?? new Date(generatedAt).getUTCFullYear();
  const astrologyData = calculateAstrology(input);
  const numerologyData = calculateNumerology(input, currentYear);
  const archetypeData = synthesizeArchetype(astrologyData, numerologyData);
  const depthInterpretation = buildDepthInterpretation(input, astrologyData, numerologyData, archetypeData, generatedAt);
  const sign = astrologyData.sunSign ? SIGN_TRAITS[astrologyData.sunSign] ?? null : null;
  const path = LIFE_PATH_TRAITS[numerologyData.lifePath];
  if (!path) throw new Error("Unsupported Life Path cannot influence offline profile prose.");
  return {
    id: options.id ?? makeId(), userId: null, sessionId: null,
    name: input.name.trim(), birthDate: input.birthDate, birthTime: input.birthTime || null,
    birthLocation: input.birthLocation.trim(), timezone: input.timezone,
    latitude: input.latitude === undefined ? null : String(input.latitude),
    longitude: input.longitude === undefined ? null : String(input.longitude),
    isPremium: false, astrologyData, numerologyData, personalityData: {}, archetypeData,
    biography: `${input.name.trim()}'s local Codex combines ${astrologyData.sunSign ? astrologyData.sunSign + " Sun symbolism, " : ""}Life Path ${numerologyData.lifePath}, Expression ${numerologyData.expression}${numerologyData.soulUrge === null ? "" : `, Soul Urge ${numerologyData.soulUrge}`}, and the ${archetypeData.title} synthesis. ${sign ? "Supported Sun and numerology themes include " + sign.drive + " and " + path.drive + "." : "The Sun layer is withheld because it cannot be resolved safely from the available local birth data; numerology remains available."} These are reflective frameworks, not fixed identity or guaranteed biography.`,
    dailyGuidance: [path.action, sign?.action].filter(Boolean).join(" "),
    depthInterpretation, localOnly: true, syncStatus: "local-only",
    createdAt: generatedAt, updatedAt: generatedAt,
  };
}

export function isOfflineCodexProfile(value: unknown): value is OfflineCodexProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Partial<OfflineCodexProfile>;
  return profile.localOnly === true && profile.syncStatus === "local-only" && profile.depthInterpretation?.version === 1;
}
