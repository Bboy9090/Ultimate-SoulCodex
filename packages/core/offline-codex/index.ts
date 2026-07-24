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

type ArchetypeTemplate = Omit<OfflineArchetypeData, "tarotCards"> & {
  keywords: string[];
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

const ARCHETYPES: ArchetypeTemplate[] = [
  archetype(["fire", "leo", "1", "8"], "Solar Sovereign", "Radiant leadership and creative power organize the profile.", ["Natural leadership", "Creative expression", "Courageous action"], ["Approval dependence", "Over-commanding", "Burnout"], ["Leadership", "Creativity", "Authority"], "Use visible strength to create direction without requiring constant recognition."),
  archetype(["water", "scorpio", "cancer", "4", "5"], "Mirror Alchemist", "Depth, reflection, and transformation organize the profile.", ["Emotional depth", "Transformative insight", "Loyalty"], ["Emotional overwhelm", "Isolation", "Suspicion"], ["Transformation", "Healing", "Depth"], "Use depth to clarify reality, not to remain submerged in it."),
  archetype(["air", "gemini", "aquarius", "3", "7"], "Cosmic Messenger", "Communication, ideas, and connection organize the profile.", ["Communication", "Innovation", "Adaptability"], ["Scattered attention", "Information overload", "Detachment"], ["Communication", "Innovation", "Knowledge"], "Focus the mind on a message that can become a finished contribution."),
  archetype(["earth", "taurus", "virgo", "capricorn", "6", "2"], "Sacred Guardian", "Stability, service, and practical protection organize the profile.", ["Reliable support", "Practical wisdom", "Steadfast loyalty"], ["Over-responsibility", "Rigidity", "Self-neglect"], ["Service", "Protection", "Stability"], "Protect what matters without treating exhaustion as proof of devotion."),
  archetype(["libra", "9"], "Harmony Weaver", "Balance, understanding, and relational repair organize the profile.", ["Diplomacy", "Mediation", "Emotional awareness"], ["Conflict avoidance", "Indecision", "People-pleasing"], ["Balance", "Peace", "Diplomacy"], "Create harmony through clear truth rather than quiet self-erasure."),
];

function trait(drive: string, gift: string, shadow: string, relationship: string, action: string, axes: DepthTensionAxis[]): SignTrait {
  return { drive, gift, shadow, relationship, action, axes };
}

function life(theme: string, drive: string, shadow: string, action: string, axes: DepthTensionAxis[]): LifePathTrait {
  return { theme, drive, shadow, action, axes };
}

function archetype(keywords: string[], title: string, description: string, strengths: string[], shadows: string[], themes: string[], guidance: string): ArchetypeTemplate {
  return { keywords, title, description, strengths, shadows, themes, guidance };
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

function nameNumber(name: string, mode: "all" | "vowels" | "consonants"): number {
  const vowels = new Set(["A", "E", "I", "O", "U"]);
  const total = name.toUpperCase().split("").reduce((sum, character) => {
    const code = character.charCodeAt(0) - 64;
    if (code < 1 || code > 26) return sum;
    const value = ((code - 1) % 9) + 1;
    const isVowel = vowels.has(character);
    if (mode === "vowels" && !isVowel) return sum;
    if (mode === "consonants" && isVowel) return sum;
    return sum + value;
  }, 0);
  return reduceNumber(total);
}

function calculateSunSign(month: number, day: number): string {
  const boundaries: Array<[number, number, string]> = [
    [1, 20, "Aquarius"], [2, 19, "Pisces"], [3, 21, "Aries"],
    [4, 20, "Taurus"], [5, 21, "Gemini"], [6, 21, "Cancer"],
    [7, 23, "Leo"], [8, 23, "Virgo"], [9, 23, "Libra"],
    [10, 23, "Scorpio"], [11, 22, "Sagittarius"], [12, 22, "Capricorn"],
  ];
  const current = boundaries.find(([boundaryMonth]) => boundaryMonth === month);
  const nextSign = current?.[2] ?? "Capricorn";
  const previousSign = SIGNS[(SIGNS.indexOf(nextSign as (typeof SIGNS)[number]) + 11) % 12];
  return day >= (current?.[1] ?? 22) ? nextSign : previousSign;
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
  const sunSign = calculateSunSign(date.month, date.day);
  const dayIndex = Math.floor((Date.UTC(date.year, date.month - 1, date.day) - Date.UTC(date.year, 0, 0)) / 86_400_000);
  const moonSign = SIGNS[(dayIndex + time.hours) % 12];
  const risingSign = SIGNS[(Math.floor((time.hours * 60 + time.minutes) / 120) + Math.floor(latitude / 10) + 24) % 12];
  const sunIndex = SIGNS.indexOf(sunSign as (typeof SIGNS)[number]);
  const risingIndex = SIGNS.indexOf(risingSign);
  const seed = stableHash(`${input.birthDate}|${input.birthTime ?? "unknown"}|${latitude}|${input.longitude ?? 0}`);
  const planet = (offset: number, house: number, degree: number) => ({ sign: SIGNS[(sunIndex + offset) % 12], house, degree });
  const planets = {
    sun: { sign: sunSign, house: 1, degree: 15.5 },
    moon: { sign: moonSign, house: 4, degree: 23.2 },
    mercury: planet(1, 3, 8.7), venus: planet(2, 2, 19.3), mars: planet(3, 6, 12.8),
    jupiter: planet(4, 9, 26.1), saturn: planet(5, 10, 4.9), uranus: planet(6, 11, 18.4),
    neptune: planet(7, 12, 21.7), pluto: planet(8, 8, 14.2),
  };
  const houses = Array.from({ length: 12 }, (_, index) => ({
    sign: SIGNS[(risingIndex + index) % 12],
    degree: Number((((seed % 3000) / 100 + index * 30) % 360).toFixed(2)),
  }));
  const moonIndex = SIGNS.indexOf(moonSign);
  const northNode = { sign: SIGNS[(moonIndex + 6) % 12], house: 5, degree: 11.3 };
  return {
    sunSign, moonSign, risingSign, planets, houses,
    aspects: [
      { planet1: "sun", planet2: "moon", aspect: "sextile", orb: 2.3 },
      { planet1: "venus", planet2: "mars", aspect: "trine", orb: 1.8 },
      { planet1: "jupiter", planet2: "saturn", aspect: "square", orb: 3.1 },
    ],
    northNode,
    southNode: { sign: SIGNS[(SIGNS.indexOf(northNode.sign) + 6) % 12], house: 11, degree: 11.3 },
    chiron: { sign: SIGNS[(sunIndex + 9) % 12], house: 7, degree: 16.8 },
  };
}

function calculateNumerology(input: OfflineBirthInput, currentYear: number): OfflineNumerologyData {
  const { year, month, day } = parseDate(input.birthDate);
  const lifePath = reduceNumber(day + month + year);
  const expression = nameNumber(input.name, "all");
  const soulUrge = nameNumber(input.name, "vowels");
  const personality = nameNumber(input.name, "consonants");
  const personalYear = reduceNumber(day + month + currentYear);
  return {
    lifePath, expression, soulUrge, personality, personalYear,
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

function calculateTarotCards(birthDate: string): OfflineArchetypeData["tarotCards"] {
  const { year, month, day } = parseDate(birthDate);
  const cards: Array<[string, string, string]> = [
    ["The Fool", "The World", "Potential develops through completed cycles."],
    ["The Magician", "The High Priestess", "Directed will is balanced by reflection."],
    ["The Empress", "The Emperor", "Creative growth benefits from structure."],
    ["The Hierophant", "The Lovers", "Inherited values meet conscious choice."],
    ["The Chariot", "Strength", "Direction becomes sustainable through self-command."],
    ["The Hermit", "Wheel of Fortune", "Inner guidance helps navigate changing cycles."],
    ["Justice", "The Hanged Man", "Balance may require a deliberate change in perspective."],
    ["Death", "Temperance", "Transformation becomes useful through integration."],
    ["The Devil", "The Tower", "Attachment is challenged by disruptive clarity."],
  ];
  const selected = cards[reduceNumber(day + month + year) % cards.length];
  return { card1: selected[0], card2: selected[1], interpretation: selected[2] };
}

function synthesizeArchetype(astrology: OfflineAstrologyData, numerology: OfflineNumerologyData, birthDate: string): OfflineArchetypeData {
  const keywords = [astrology.sunSign.toLowerCase(), astrology.moonSign.toLowerCase(), astrology.risingSign.toLowerCase(), elementForSign(astrology.sunSign), String(numerology.lifePath)];
  let best: ArchetypeTemplate = ARCHETYPES[0];
  let bestScore = -1;
  for (const candidate of ARCHETYPES) {
    const score = candidate.keywords.filter((keyword) => keywords.some((value) => value.includes(keyword) || keyword.includes(value))).length;
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return { ...best, strengths: [...best.strengths], shadows: [...best.shadows], themes: [...best.themes], tarotCards: calculateTarotCards(birthDate) };
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
  const sign = SIGN_TRAITS[astrology.sunSign];
  const path = LIFE_PATH_TRAITS[numerology.lifePath] ?? LIFE_PATH_TRAITS[9];
  const seeds: DepthSynthesisSeed[] = [
    {
      evidence: makeEvidence({ id: "offline.astrology.sun", system: "astrology", field: "sunSign", value: astrology.sunSign, confidence: "moderate", timeSensitivity: "none", notes: ["Sun-sign boundary calculation is local and deterministic."] }),
      label: `${astrology.sunSign} Sun symbolism`, priority: 100, claimKind: "derived",
      facets: {
        claritySummary: `A central pattern emphasizes ${sign.drive}.`, visiblePattern: `Others may first notice ${sign.gift}.`,
        hiddenNeed: `The pattern may be trying to preserve conditions for ${sign.drive}.`, gift: `The constructive expression is ${sign.gift}.`,
        shadow: `When overused, the same pattern can become ${sign.shadow}.`, relationshipImpact: `In relationships, the symbolic pattern ${sign.relationship}.`,
        boundaryOrRepair: sign.action, action: sign.action,
      },
      tensionAxes: sign.axes,
      limitations: ["Sun-sign symbolism is interpretive and does not establish fixed personality."],
    },
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
    {
      evidence: makeEvidence({ id: "offline.archetype.primary", system: "system", field: "archetype", value: archetypeData.title, confidence: "moderate", timeSensitivity: "none", notes: ["Synthesized from the local astrology and numerology layers."] }),
      label: `${archetypeData.title} synthesis`, priority: 85, claimKind: "inferred",
      facets: {
        visiblePattern: archetypeData.description, gift: archetypeData.strengths.join(", "),
        commonMisreading: `The strengths of ${archetypeData.title} may be judged only by their shadow form: ${archetypeData.shadows.join(", ")}.`,
        boundaryOrRepair: archetypeData.guidance,
      },
      tensionAxes: [...sign.axes, ...path.axes],
      limitations: ["The archetype combines symbolic sources; overlap is supporting context, not independent proof."],
    },
    timeSensitiveSeed("moon", astrology.moonSign, 55),
    timeSensitiveSeed("rising", astrology.risingSign, 50),
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

function timeSensitiveSeed(kind: "moon" | "rising", signName: string, priority: number): DepthSynthesisSeed {
  const sign = SIGN_TRAITS[signName];
  const isMoon = kind === "moon";
  return {
    evidence: makeEvidence({
      id: `offline.astrology.${kind}`,
      system: "astrology",
      field: `${kind}Sign`,
      value: signName,
      confidence: "low",
      timeSensitivity: "birth-time-required",
      notes: [`The current offline ${kind} calculation preserves legacy application behavior and is not ephemeris-grade.`],
    }),
    label: `${signName} ${isMoon ? "Moon" : "Rising"} approximation`,
    priority,
    claimKind: "inferred",
    facets: isMoon
      ? { innerExperience: `A low-confidence Moon approximation adds ${sign.drive}.`, relationshipImpact: `This approximation may color emotional needs and ${sign.relationship}.` }
      : { visiblePattern: `A low-confidence Rising approximation may present as ${sign.gift}.`, commonMisreading: `That presentation may be mistaken for ${sign.shadow}.` },
    tensionAxes: sign.axes,
    limitations: [`This ${isMoon ? "Moon" : "Rising"} sign is a local approximation and may change after a verified astronomical calculation.`],
  };
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
  const archetypeData = synthesizeArchetype(astrologyData, numerologyData, input.birthDate);
  const depthInterpretation = buildDepthInterpretation(input, astrologyData, numerologyData, archetypeData, generatedAt);
  const sign = SIGN_TRAITS[astrologyData.sunSign];
  const path = LIFE_PATH_TRAITS[numerologyData.lifePath] ?? LIFE_PATH_TRAITS[9];
  return {
    id: options.id ?? makeId(), userId: null, sessionId: null,
    name: input.name.trim(), birthDate: input.birthDate, birthTime: input.birthTime || null,
    birthLocation: input.birthLocation.trim(), timezone: input.timezone,
    latitude: input.latitude === undefined ? null : String(input.latitude),
    longitude: input.longitude === undefined ? null : String(input.longitude),
    isPremium: false, astrologyData, numerologyData, personalityData: {}, archetypeData,
    biography: `${input.name.trim()}'s local Codex combines ${astrologyData.sunSign} symbolism, Life Path ${numerologyData.lifePath}, and the ${archetypeData.title} synthesis. The strongest supported themes are ${sign.drive} and ${path.drive}. These are reflective frameworks, not fixed identity or guaranteed biography.`,
    dailyGuidance: `${path.action} ${sign.action}`,
    depthInterpretation, localOnly: true, syncStatus: "local-only",
    createdAt: generatedAt, updatedAt: generatedAt,
  };
}

export function isOfflineCodexProfile(value: unknown): value is OfflineCodexProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Partial<OfflineCodexProfile>;
  return profile.localOnly === true && profile.syncStatus === "local-only" && profile.depthInterpretation?.version === 1;
}
