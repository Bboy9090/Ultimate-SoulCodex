/**
 * SoulCodexReading - Progressive disclosure reading format
 *
 * Single normalized output supporting three display depths:
 * - Essential (snapshot + action)
 * - Complete (full engines + interactions)
 * - Technical (exact degrees, calculations, metadata)
 */

export type ConfidenceLevel = "high" | "medium" | "low";

export interface BirthData {
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM (optional for reduced readings)
  location: string;
  timezone: string; // IANA timezone
  coordinates?: { latitude: number; longitude: number };
}

export interface VerifiedFact {
  key: string;
  value: string | number;
  confidence: ConfidenceLevel;
  source: string;
  calculationVersion: string;
}

export interface Interpretation {
  title: string;
  summary: string;
  evidenceFactIds: string[];
  confidence: ConfidenceLevel;
  category: InsightCategory;
}

export type InsightCategory =
  | "identity"
  | "emotional"
  | "decision"
  | "relationship"
  | "stress"
  | "work"
  | "shadow"
  | "growth"
  | "mission";

export interface EvidenceReference {
  factId: string;
  system: "astrology" | "numerology" | "human-design" | "mbti" | "enneagram" | "gene-keys";
  detail: string;
}

export interface EngineInsight {
  id: string;
  type: InsightCategory;
  title: string;
  summary: string; // 25–45 words
  observation: string;
  meaning: string;
  gift: string;
  shadow: string;
  action: string;
  evidence: EvidenceReference[];
  confidence: ConfidenceLevel;
}

export type InteractionType = "reinforcement" | "balance" | "conflict";

export interface InteractionInsight {
  title: string;
  relationship: InteractionType;
  inputA: EvidenceReference;
  inputB: EvidenceReference;
  result: string;
  explanation: string;
  behavior: string;
  action: string;
  strength: 1 | 2 | 3 | 4 | 5; // 1=weak, 5=dominant
}

export interface DominantSignal {
  theme: string;
  influence: "Very High" | "High" | "Moderate" | "Low";
  reasoning: string;
}

export interface ActionPlan {
  today: string;
  thisWeek: string;
  avoid: string;
  relationshipAction: string;
  workAction: string;
}

export interface VerifiedSystems {
  astrology: AstrologyOutput;
  numerology: NumerologyOutput;
  humanDesign?: HumanDesignOutput;
  mbti?: MBTIOutput;
  enneagram?: EnneagramOutput;
  geneKeys?: GeneKeysOutput;
}

export interface AstrologyOutput {
  sunSign: string;
  sunDegree: number;
  sunHouse: number;
  moonSign: string;
  moonDegree: number;
  moonHouse: number;
  ascendant: string;
  ascendantDegree: number;
  midheaven: string;
  midheavenDegree: number;
  planets: PlanetPosition[];
  houses: HouseCusp[];
  aspects: Aspect[];
  northNode: NodePosition;
  southNode: NodePosition;
  chiron: ChironPosition;
}

export interface PlanetPosition {
  name: string;
  sign: string;
  degree: number;
  house: number;
  longitude: number;
}

export interface HouseCusp {
  houseNumber: number;
  sign: string;
  degree: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  aspectType: string;
  orb: number;
}

export interface NodePosition {
  sign: string;
  degree: number;
  house: number;
  longitude: number;
}

export interface ChironPosition extends NodePosition {}

export interface NumerologyOutput {
  lifePathNumber: number;
  birthdayNumber: number;
  attitudeNumber: number;
  expressionNumber?: number;
  soulUrgeNumber?: number;
  personalityNumber?: number;
  hiddenPassion?: string[];
  karmicLessons?: string[];
}

export interface HumanDesignOutput {
  type: string; // Manifestor, Generator, Generative Generator, Projector, Reflector
  profile: string; // e.g., "2/5"
  strategy: string;
  authority: string;
  definedCenters: string[];
  channels: string[];
  gates: number[];
  harmonic: string;
}

export interface MBTIOutput {
  type: string; // e.g., "INTJ"
  dichotomies: {
    extraversion: string;
    sensing: string;
    thinking: string;
    judging: string;
  };
}

export interface EnneagramOutput {
  type: number; // 1-9
  wing?: number;
  instinctualVariant?: string;
}

export interface GeneKeysOutput {
  profile: string;
  venus: number;
  earth: number;
  guiding: number;
}

export interface CodexSnapshot {
  archetype: string;
  coreFormula: string[];
  centralPattern: string;
  coreGift: string;
  primaryTension: string;
  nextAction: string;
}

export interface SoulCodexReading {
  meta: {
    subjectName: string;
    birthData: BirthData;
    calculationStatus: "verified" | "partial" | "blocked";
    confidence: ConfidenceLevel;
    engineVersion: string;
    generatedAt: string;
  };

  snapshot: CodexSnapshot;

  verifiedSystems: VerifiedSystems;

  engines: EngineInsight[];

  interactions: {
    reinforcements: InteractionInsight[];
    balances: InteractionInsight[];
    conflicts: InteractionInsight[];
  };

  dominance: DominantSignal[];

  actionPlan: ActionPlan;

  technicalAppendix?: TechnicalRecord;
}

export interface TechnicalRecord {
  calculationMethod: string;
  ephemerisSource: string;
  houseSystem: string;
  zodiacType: "tropical" | "sidereal";
  precessionModel: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: {
    name: string;
    offset: number; // in minutes
    isDST: boolean;
  };
  utcTime: string;
  julianDay: number;
  siderealTime: string;
}

/**
 * Display mode controllers
 */
export type ReadingDepth = "essential" | "complete" | "technical";

export interface ReadingDisplayConfig {
  depth: ReadingDepth;
  expandedSections?: string[]; // IDs of sections to expand
  theme?: "light" | "dark";
  language?: string;
}

/**
 * Validation result for quality gates
 */
export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}
