import {
  synthesizeDepthInterpretationV1,
  validateDepthInterpretationV1,
  type BirthTimeStatus,
  type DepthInterpretationV1,
  type DepthSynthesisSeed,
  type DepthTensionAxis,
  type InterpretationEvidenceRef,
} from "../depth-interpretation/index.js";

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
  northNode: { sign: string; house: number; degree: number };
  southNode: { sign: string; house: number; degree: number };
  chiron: { sign: string; house: number; degree: number };
}

export interface OfflineNumerologyData {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
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
  tarotCards: { card1: string; card2: string; interpretation: string };
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

const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

const SIGN_TRAITS: Record<
  string,
  {
    drive: string;
    gift: string;
    shadow: string;
    relationship: string;
    action: string;
    axes: DepthTensionAxis[];
  }
> = {
  Aries: { drive: "initiating action and leading directly", gift: "courage and momentum", shadow: "impatience that outruns context", relationship: "needs honesty and room for direct action", action: "pause long enough to separate urgency from importance", axes: ["speed", "independence", "directness"] },
  Taurus: { drive: "building stability and protecting what matters", gift: "patience and durable follow-through", shadow: "holding position after conditions change", relationship: "needs consistency and tangible trust", action: "identify one place where flexibility protects the larger commitment", axes: ["stability", "consistency", "structure"] },
  Gemini: { drive: "gathering information and connecting ideas", gift: "adaptability and verbal perspective", shadow: "scattering attention across too many signals", relationship: "needs conversation, variety, and mental responsiveness", action: "choose one question to finish before opening another", axes: ["freedom", "analysis", "speed"] },
  Cancer: { drive: "protecting emotional safety and chosen bonds", gift: "care, memory, and responsiveness", shadow: "absorbing other people's needs as personal duty", relationship: "needs emotional reciprocity and reliable belonging", action: "name the need before trying to manage the entire atmosphere", axes: ["sensitivity", "partnership", "stability"] },
  Leo: { drive: "creating meaning and expressing identity visibly", gift: "warmth, courage, and creative leadership", shadow: "using recognition as proof of worth", relationship: "needs appreciation without performance becoming compulsory", action: "make one meaningful move that does not depend on applause", axes: ["recognition", "independence", "directness"] },
  Virgo: { drive: "precision, improvement, and practical service", gift: "discernment and useful problem solving", shadow: "analysis expanding until action stalls", relationship: "needs reliability, clarity, and respect for effort", action: "define what is good enough before refining again", axes: ["analysis", "structure", "consistency"] },
  Libra: { drive: "creating balance and finding a fair answer", gift: "diplomacy and relational awareness", shadow: "delaying confrontation until resentment accumulates", relationship: "needs mutuality and respectful negotiation", action: "state the uncomfortable preference before harmony becomes avoidance", axes: ["harmony", "partnership", "directness"] },
  Scorpio: { drive: "testing truth and protecting emotional depth", gift: "focus, loyalty, and transformative insight", shadow: "holding suspicion past its useful life", relationship: "needs honesty, privacy, and earned trust", action: "separate what is known from what is feared before escalating", axes: ["sensitivity", "structure", "directness"] },
  Sagittarius: { drive: "seeking meaning, freedom, and expansion", gift: "optimism and broad perspective", shadow: "leaving depth behind for the next horizon", relationship: "needs truth, movement, and room to grow", action: "finish one meaningful commitment before chasing the next possibility", axes: ["freedom", "speed", "independence"] },
  Capricorn: { drive: "building legacy through discipline and mastery", gift: "strategy and responsible endurance", shadow: "measuring worth mainly through output", relationship: "needs respect, competence, and dependable commitments", action: "protect recovery as part of the plan rather than a reward after collapse", axes: ["structure", "stability", "recognition"] },
  Aquarius: { drive: "challenging defaults and thinking independently", gift: "originality and systems perspective", shadow: "using detachment when emotional stakes rise", relationship: "needs intellectual freedom and authentic difference", action: "translate the idea into one human-scale action another person can understand", axes: ["independence", "freedom", "analysis"] },
  Pisces: { drive: "feeling deeply and translating experience into meaning", gift: "empathy, imagination, and intuition", shadow: "weakening boundaries when another person needs support", relationship: "needs gentleness, meaning, and clear emotional boundaries", action: "identify which feeling is yours before deciding what to carry", axes: ["sensitivity", "partnership", "freedom"] },
};

const LIFE_PATH_TRAITS: Record<
  number,
  { theme: string; drive: string; shadow: string; action: string; axes: DepthTensionAxis[] }
> = {
  1: { theme: "independent initiation", drive: "pioneering and self-direction", shadow: "mistaking support for interference", action: "lead clearly without making collaboration prove weakness", axes: ["independence", "directness"] },
  2: { theme: "partnership", drive: "cooperation and sensitivity", shadow: "over-adjusting to preserve peace", action: "state one preference before adapting to everyone else", axes: ["partnership", "harmony", "sensitivity"] },
  3: { theme: "expression", drive: "creativity and communication", shadow: "using activity to avoid emotional depth", action: "finish and share one expression rather than polishing ten possibilities", axes: ["recognition", "freedom"] },
  4: { theme: "structure", drive: "building systems that last", shadow: "confusing control with safety", action: "keep the structure and loosen one unnecessary rule", axes: ["structure", "consistency", "stability"] },
  5: { theme: "freedom", drive: "adaptability and experience", shadow: "resisting the repetition required for mastery", action: "choose one commitment that creates more freedom later", axes: ["freedom", "speed", "stability"] },
  6: { theme: "responsibility", drive: "service and stewardship", shadow: "carrying duties that were never clearly accepted", action: "return one responsibility to its rightful owner", axes: ["partnership", "consistency", "sensitivity"] },
  7: { theme: "analysis", drive: "investigation and private understanding", shadow: "waiting for certainty that cannot arrive", action: "set a decision deadline before collecting another layer of evidence", axes: ["analysis", "independence"] },
  8: { theme: "power", drive: "material mastery and leadership", shadow: "using achievement as the only measure of progress", action: "define the ethical boundary before pursuing the result", axes: ["structure", "recognition", "directness"] },
  9: { theme: "legacy", drive: "humanitarian purpose and completion", shadow: "overextending for the larger mission", action: "finish one cycle before volunteering for another", axes: ["partnership", "sensitivity", "stability"] },
  11: { theme: "intuition", drive: "visionary insight and influence", shadow: "treating intensity as certainty", action: "ground the insight in one observable test", axes: ["sensitivity", "recognition", "analysis"] },
  22: { theme: "master building", drive: "turning vision into durable reality", shadow: "making the scale of the mission personally crushing", action: "reduce the vision to the next testable structure", axes: ["structure", "stability", "recognition"] },
  33: { theme: "master teaching", drive: "uplifting others through example", shadow: "becoming responsible for everyone's healing", action: "teach the principle without taking over the person's work", axes: ["partnership", "sensitivity", "recognition"] },
};

const ARCHETYPES = [
  { keywords: ["fire", "leo", "1", "8"], title: "Solar Sovereign", description: "Radiant leadership and creative power organize the profile.", strengths: ["Natural leadership", "Creative expression", "Courageous action"], shadows: ["Approval dependence", "Over-commanding", "Burnout"], themes: ["Leadership", "Creativity", "Authority"], guidance: "Use visible strength to create direction without requiring constant recognition." },
  { keywords: ["water", "scorpio", "cancer", "4", "5"], title: "Mirror Alchemist", description: "Depth, reflection, and transformation organize the profile.", strengths: ["Emotional depth", "Transformative insight", "Loyalty"], shadows: ["Emotional overwhelm", "Isolation", "Suspicion"], themes: ["Transformation", "Healing", "Depth"], guidance: "Use depth to clarify reality, not to remain submerged in it." },
  { keywords: ["air", "gemini", "aquarius", "3", "7"], title: "Cosmic Messenger", description: "Communication, ideas, and connection organize the profile.", strengths: ["Communication", "Innovation", "Adaptability"], shadows: ["Scattered attention", "Information overload", "Detachment"], themes: ["Communication", "Innovation", "Knowledge"], guidance: "Focus the mind on a message that can become a finished contribution." },
  { keywords: ["earth", "taurus", "virgo", "capricorn", "6", "2"], title: "Sacred Guardian", description: "Stability, service, and practical protection organize the profile.", strengths: ["Reliable support", "Practical wisdom", "Steadfast loyalty"], shadows: ["Over-responsibility", "Rigidity", "Self-neglect"], themes: ["Service", "Protection", "Stability"], guidance: "Protect what matters without treating exhaustion as proof of devotion." },
  { keywords: ["libra", "9"], title: "Harmony Weaver", description: "Balance, understanding, and relational repair organize the profile.", strengths: ["Diplomacy", "Mediation", "Emotional awareness"], shadows: ["Conflict avoidance", "Indecision", "People-pleasing"], themes: ["Balance", "Peace", "Diplomacy"], guidance: "Create harmony through clear truth rather than quiet self-erasure." },
] as const;

function parseDate(value: string): { year: number; month: number; day: number } {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) throw new Error("birthDate must use YYYY-MM-DD");
  return { year, month, day };
}

function reduceNumber(value: number): number {
  let result = Math.abs(Math.trunc(value));
  while (result > 9 && result !== 11 && result !== 22 && result !== 33) {
    result = String(result).split("").reduce((sum, digit) => sum + Number(digit), 0);
  }
  return result;
}

function letterValue(letter: string): number {
  const code = letter.toUpperCase().charCodeAt(0) - 64;
  return code >= 1 && code <= 26 ? ((code - 1) % 9) + 1 : 0;
}

function nameNumber(name: string, mode: "all" | "vowels" | "consonants"): number {
  const vowels = new Set(["A", "E", "I", "O", "U"]);
  const sum = name.toUpperCase().split("").reduce((total, character) => {
    const value = letterValue(character);
    if (!value) return total;
    const isVowel = vowels.has(character);
    if (mode === "vowels" && !isVowel) return total;
    if (mode === "consonants" && isVowel) return total;
    return total + value;
  }, 0);
  return reduceNumber(sum);
}

function sunSign(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

function dayOfYear(year: number, month: number, day: number): number {
  const start = Date.UTC(year, 0, 0);
  return Math.floor((Date.UTC(year, month - 1, day) - start) / 86_400_000);
}

function parseTime(value?: string): { hours: number; minutes: number; known: boolean } {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return { hours: 12, minutes: 0, known: false };
  const [hours, minutes] = value.split(":").map(Number);
  return { hours, minutes, known: Number.isFinite(hours) && Number.isFinite(minutes) };
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
  const date = parseDate(input.birthDate);
  const time = parseTime(input.birthTime);
  const latitude = Number(input.latitude ?? 0);
  const sun = sunSign(date.month, date.day);
  const moon = ZODIAC_SIGNS[(dayOfYear(date.year, date.month, date.day) + time.hours) % 12];
  const rising = ZODIAC_SIGNS[(Math.floor((time.hours * 60 + time.minutes) / 120) + Math.floor(latitude / 10) + 24) % 12];
  const sunIndex = ZODIAC_SIGNS.indexOf(sun as (typeof ZODIAC_SIGNS)[number]);
  const moonIndex = ZODIAC_SIGNS.indexOf(moon);
  const risingIndex = ZODIAC_SIGNS.indexOf(rising);
  const seed = stableHash(`${input.birthDate}|${input.birthTime ?? "unknown"}|${latitude}|${input.longitude ?? 0}`);
  const planet = (offset: number, house: number, degree: number) => ({ sign: ZODIAC_SIGNS[(sunIndex + offset) % 12], house, degree });
  const planets = {
    sun: { sign: sun, house: 1, degree: 15.5 },
    moon: { sign: moon, house: 4, degree: 23.2 },
    mercury: planet(1, 3, 8.7),
    venus: planet(2, 2, 19.3),
    mars: planet(3, 6, 12.8),
    jupiter: planet(4, 9, 26.1),
    saturn: planet(5, 10, 4.9),
    uranus: planet(6, 11, 18.4),
    neptune: planet(7, 12, 21.7),
    pluto: planet(8, 8, 14.2),
  };
  const houses = Array.from({ length: 12 }, (_, index) => ({
    sign: ZODIAC_SIGNS[(risingIndex + index) % 12],
    degree: Number((((seed % 3000) / 100 + index * 30) % 360).toFixed(2)),
  }));
  const northNode = { sign: ZODIAC_SIGNS[(moonIndex + 6) % 12], house: 5, degree: 11.3 };
  return {
    sunSign: sun,
    moonSign: moon,
    risingSign: rising,
    planets,
    houses,
    aspects: [
      { planet1: "sun", planet2: "moon", aspect: "sextile", orb: 2.3 },
      { planet1: "venus", planet2: "mars", aspect: "trine", orb: 1.8 },
      { planet1: "jupiter", planet2: "saturn", aspect: "square", orb: 3.1 },
    ],
    northNode,
    southNode: { sign: ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(northNode.sign) + 6) % 12], house: 11, degree: 11.3 },
    chiron: { sign: ZODIAC_SIGNS[(sunIndex + 9) % 12], house: 7, degree: 16.8 },
  };
}

function calculateNumerology(input: OfflineBirthInput, currentYear: number): OfflineNumerologyData {
  const date = parseDate(input.birthDate);
  const lifePath = reduceNumber(date.day + date.month + date.year);
  const expression = nameNumber(input.name, "all");
  const soulUrge = nameNumber(input.name, "vowels");
  const personality = nameNumber(input.name, "consonants");
  const personalYear = reduceNumber(date.day + date.month + currentYear);
  return {
    lifePath,
    expression,
    soulUrge,
    personality,
    personalYear,
    interpretations: {
      lifePath: `Life Path ${lifePath}: ${LIFE_PATH_TRAITS[lifePath]?.theme ?? "an individual growth pattern"}.`,
      expression: `Expression ${expression}: a symbolic description of how talents may be directed.`,
      soulUrge: `Soul Urge ${soulUrge}: a symbolic description of inner motivation.`,
      personality: `Personality ${personality}: a symbolic description of first impressions.`,
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

function tarotCards(birthDate: string): OfflineArchetypeData["tarotCards"] {
  const { year, month, day } = parseDate(birthDate);
  const value = reduceNumber(day + month + year);
  const cards = [
    ["The Fool", "The World", "Potential develops through completed cycles."],
    ["The Magician", "The High Priestess", "Directed will is balanced by reflection."],
    ["The Empress", "The Emperor", "Creative growth benefits from structure."],
    ["The Hierophant", "The Lovers", "Inherited values meet conscious choice."],
    ["The Chariot", "Strength", "Direction becomes sustainable through self-command."],
    ["The Hermit", "Wheel of Fortune", "Inner guidance helps navigate changing cycles."],
    ["Justice", "The Hanged Man", "Balance may require a deliberate change in perspective."],
    ["Death", "Temperance", "Transformation becomes useful through integration."],
    ["The Devil", "The Tower", "Attachment is challenged by disruptive clarity."],
  ] as const;
  const [card1, card2, interpretation] = cards[value % cards.length];
  return { card1, card2, interpretation };
}

function synthesizeArchetype(astrology: OfflineAstrologyData, numerology: OfflineNumerologyData, birthDate: string): OfflineArchetypeData {
  const keywords = [
    astrology.sunSign.toLowerCase(),
    astrology.moonSign.toLowerCase(),
    astrology.risingSign.toLowerCase(),
    elementForSign(astrology.sunSign),
    String(numerology.lifePath),
  ];
  let best = ARCHETYPES[0];
  let score = -1;
  for (const candidate of ARCHETYPES) {
    const matches = candidate.keywords.filter((keyword) => keywords.some((value) => value.includes(keyword) || keyword.includes(value))).length;
    if (matches > score) {
      score = matches;
      best = candidate;
    }
  }
  return { ...best, strengths: [...best.strengths], shadows: [...best.shadows], themes: [...best.themes], tarotCards: tarotCards(birthDate) };
}

function evidence(input: Omit<InterpretationEvidenceRef, "provenanceStatus" | "notes"> & { notes?: string[] }): InterpretationEvidenceRef {
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

function depthInterpretation(
  input: OfflineBirthInput,
  astrology: OfflineAstrologyData,
  numerology: OfflineNumerologyData,
  archetype: OfflineArchetypeData,
  generatedAt: string,
): DepthInterpretationV1 {
  const time = parseTime(input.birthTime);
  const birthTimeStatus: BirthTimeStatus = time.known ? "known" : "unknown";
  const sign = SIGN_TRAITS[astrology.sunSign];
  const life = LIFE_PATH_TRAITS[numerology.lifePath] ?? LIFE_PATH_TRAITS[9];
  const seeds: DepthSynthesisSeed[] = [
    {
      evidence: evidence({ id: "offline.astrology.sun", system: "astrology", field: "sunSign", value: astrology.sunSign, confidence: "moderate", timeSensitivity: "none", notes: ["Sun-sign boundary calculation is local and deterministic."] }),
      label: `${astrology.sunSign} Sun symbolism`,
      priority: 100,
      claimKind: "derived",
      facets: {
        claritySummary: `A central pattern emphasizes ${sign.drive}.`,
        visiblePattern: `Others may first notice ${sign.gift}.`,
        hiddenNeed: `The pattern may be trying to preserve conditions for ${sign.drive}.`,
        gift: `The constructive expression is ${sign.gift}.`,
        shadow: `When overused, the same pattern can become ${sign.shadow}.`,
        relationshipImpact: `In relationships, the symbolic pattern ${sign.relationship}.`,
        boundaryOrRepair: sign.action,
        action: sign.action,
      },
      tensionAxes: sign.axes,
      limitations: ["Sun-sign symbolism is interpretive and does not establish fixed personality."],
    },
    {
      evidence: evidence({ id: "offline.numerology.life-path", system: "numerology", field: "lifePath", value: numerology.lifePath, confidence: "moderate", timeSensitivity: "none", notes: ["Calculated locally from the entered calendar date."] }),
      label: `Life Path ${numerology.lifePath} symbolism`,
      priority: 95,
      claimKind: "derived",
      facets: {
        claritySummary: `The numerology layer adds a theme of ${life.theme}.`,
        innerExperience: `Internally, attention may return to ${life.drive}.`,
        protectiveFunction: `The pattern may protect the ability to continue ${life.drive}.`,
        shadow: `Under pressure, the cost may appear as ${life.shadow}.`,
        decisionImpact: `Decisions may become clearer when they support ${life.drive} without repeating ${life.shadow}.`,
        action: life.action,
      },
      tensionAxes: life.axes,
      limitations: ["Numerology is a symbolic framework and should be tested against lived experience."],
    },
    {
      evidence: evidence({ id: "offline.archetype.primary", system: "system", field: "archetype", value: archetype.title, confidence: "moderate", timeSensitivity: "none", notes: ["Synthesized from the local astrology and numerology layers."] }),
      label: `${archetype.title} synthesis`,
      priority: 85,
      claimKind: "inferred",
      facets: {
        visiblePattern: archetype.description,
        gift: archetype.strengths.join(", "),
        commonMisreading: `The strengths of ${archetype.title} may be judged only by their shadow form: ${archetype.shadows.join(", ")}.`,
        boundaryOrRepair: archetype.guidance,
      },
      tensionAxes: [...sign.axes, ...life.axes],
      limitations: ["The archetype combines symbolic sources; overlap is supporting context, not independent proof."],
    },
    {
      evidence: evidence({ id: "offline.astrology.moon", system: "astrology", field: "moonSign", value: astrology.moonSign, confidence: "low", timeSensitivity: "birth-time-required", notes: ["The current offline Moon calculation preserves legacy application behavior and is not ephemeris-grade."] }),
      label: `${astrology.moonSign} Moon approximation`,
      priority: 55,
      claimKind: "inferred",
      facets: {
        innerExperience: `A low-confidence Moon approximation adds ${SIGN_TRAITS[astrology.moonSign].drive}.`,
        relationshipImpact: `This approximation may color emotional needs through ${SIGN_TRAITS[astrology.moonSign].relationship}.`,
      },
      tensionAxes: SIGN_TRAITS[astrology.moonSign].axes,
      limitations: ["This Moon sign is a local approximation and must be replaced by an ephemeris-grade calculation before high-confidence use."],
    },
    {
      evidence: evidence({ id: "offline.astrology.rising", system: "astrology", field: "risingSign", value: astrology.risingSign, confidence: "low", timeSensitivity: "birth-time-required", notes: ["The current offline Rising calculation preserves legacy application behavior and is not sidereal-time/house-system grade."] }),
      label: `${astrology.risingSign} Rising approximation`,
      priority: 50,
      claimKind: "inferred",
      facets: {
        visiblePattern: `A low-confidence Rising approximation may present as ${SIGN_TRAITS[astrology.risingSign].gift}.`,
        commonMisreading: `That presentation may be mistaken for ${SIGN_TRAITS[astrology.risingSign].shadow}.`,
      },
      tensionAxes: SIGN_TRAITS[astrology.risingSign].axes,
      limitations: ["This Rising sign is a local approximation and may change after a verified astronomical calculation."],
    },
  ];
  const interpretation = synthesizeDepthInterpretationV1({
    version: 1,
    generatedAt,
    birthTimeStatus,
    seeds,
    missingData: [
      "Mirror behavioral answers are not yet available in the active create-profile flow.",
      "Human Design is not calculated by this offline compatibility runtime.",
      "Moon, Rising, houses, and planetary placements remain legacy-grade approximations until the ephemeris engine is connected.",
    ],
  });
  const validation = validateDepthInterpretationV1(interpretation, { birthTimeStatus });
  if (!validation.valid) {
    throw new Error(`Offline depth interpretation failed validation: ${validation.findings.map((finding) => finding.code).join(", ")}`);
  }
  return interpretation;
}

function makeId(): string {
  const randomUuid = globalThis.crypto?.randomUUID?.bind(globalThis.crypto);
  if (randomUuid) return `local-${randomUuid()}`;
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function generateOfflineCodexProfile(
  input: OfflineBirthInput,
  options: OfflineCodexOptions = {},
): OfflineCodexProfile {
  if (!input.name.trim()) throw new Error("name is required");
  if (!input.birthLocation.trim()) throw new Error("birthLocation is required");
  parseDate(input.birthDate);
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const currentYear = options.currentYear ?? new Date(generatedAt).getUTCFullYear();
  const astrologyData = calculateAstrology(input);
  const numerologyData = calculateNumerology(input, currentYear);
  const archetypeData = synthesizeArchetype(astrologyData, numerologyData, input.birthDate);
  const interpretation = depthInterpretation(input, astrologyData, numerologyData, archetypeData, generatedAt);
  const sign = SIGN_TRAITS[astrologyData.sunSign];
  const life = LIFE_PATH_TRAITS[numerologyData.lifePath] ?? LIFE_PATH_TRAITS[9];
  return {
    id: options.id ?? makeId(),
    userId: null,
    sessionId: null,
    name: input.name.trim(),
    birthDate: input.birthDate,
    birthTime: input.birthTime || null,
    birthLocation: input.birthLocation.trim(),
    timezone: input.timezone,
    latitude: input.latitude === undefined ? null : String(input.latitude),
    longitude: input.longitude === undefined ? null : String(input.longitude),
    isPremium: false,
    astrologyData,
    numerologyData,
    personalityData: {},
    archetypeData,
    biography: `${input.name.trim()}'s local Codex combines ${astrologyData.sunSign} symbolism, Life Path ${numerologyData.lifePath}, and the ${archetypeData.title} synthesis. The strongest supported themes are ${sign.drive} and ${life.drive}. These are reflective frameworks, not fixed identity or guaranteed biography.`,
    dailyGuidance: `${life.action}. ${sign.action}.`,
    depthInterpretation: interpretation,
    localOnly: true,
    syncStatus: "local-only",
    createdAt: generatedAt,
    updatedAt: generatedAt,
  };
}

export function isOfflineCodexProfile(value: unknown): value is OfflineCodexProfile {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<OfflineCodexProfile>;
  return record.localOnly === true && record.syncStatus === "local-only" && record.depthInterpretation?.version === 1;
}
