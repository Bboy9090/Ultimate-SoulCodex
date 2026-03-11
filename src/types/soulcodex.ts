/* CORE USER INPUT */

export type BirthData = {
  name?: string;
  birthDate: string;
  birthTime?: string;
  birthPlace: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  timeKnown: boolean;
};

/* MIRROR ENGINE */

export type MirrorAnswers = {
  reaction: "fix" | "analyze" | "talk" | "withdraw";
  betrayal: "disrespect" | "dishonesty" | "stupidity" | "emotional";
  drain: "chaos" | "repetition" | "lies" | "misunderstood";
  freedomBuild: "system" | "movement" | "masterpiece" | "sanctuary";
};

export type MirrorProfile = {
  driver: string;
  shadowTrigger: string;
  decisionStyle: string;
  energyStyle: string;
  conflictStyle: string;
};

/* NUMEROLOGY */

export type NumerologyProfile = {
  lifePath: number;
  expression?: number;
  soulUrge?: number;
  personality?: number;
  personalYear?: number;
};

/* ASTROLOGY */

export type PlanetPosition = {
  planet: string;
  sign: string;
  degree?: number;
};

export type FullChart = {
  sun: PlanetPosition;
  moon: PlanetPosition;
  rising?: PlanetPosition;
  mercury?: PlanetPosition;
  venus?: PlanetPosition;
  mars?: PlanetPosition;
  jupiter?: PlanetPosition;
  saturn?: PlanetPosition;
  uranus?: PlanetPosition;
  neptune?: PlanetPosition;
  pluto?: PlanetPosition;
};

export type Aspect = {
  planetA: string;
  planetB: string;
  type: "conjunction" | "square" | "trine" | "sextile" | "opposition";
  orb?: number;
};

/* ELEMENT ENGINE */

export type ElementBalance = {
  earth: number;
  air: number;
  fire: number;
  water: number;
};

/* MORAL COMPASS */

export type MoralCompass = {
  values: string[];
  intolerances: string[];
  crisisResponse: string;
};

/* CODEX THEMES */

export type CodexThemes = {
  topThemes: string[];
  strengths: string[];
  shadows: string[];
};

/* TIMELINE ENGINE */

export type TimelinePhase =
  | "Ignition"
  | "Exposure"
  | "Construction"
  | "Expansion"
  | "Friction"
  | "Refinement"
  | "Integration"
  | "Legacy";

export type TimelineProfile = {
  currentPhase: TimelinePhase;
  nextPhase?: TimelinePhase;
  reasons?: string[];
};

/* DAILY TRANSIT */

export type TransitDetail = {
  title: string;
  whatItAffects: string;
  realLifeExample: string;
  do: string[];
  avoid: string[];
};

export type DailyCard = {
  focus: string;
  do: string[];
  dont: string[];
  watchouts?: string[];
  transits?: TransitDetail[];
  decisionAdvice: string;
};

/* COMPATIBILITY */

export type CompatibilityResult = {
  score: number;
  overlap: string[];
  friction: string[];
  advice: string[];
};

/* LIFE MAP */

export type LifeMapYear = {
  year: number;
  age: number;
  phase: TimelinePhase;
  personalYear: number;
  explanation: string;
  isCurrent: boolean;
};

export type LifeMap = {
  birthYear: number;
  currentYear: number;
  years: LifeMapYear[];
};

/* LIFE EVENT DECODER */

export type LifeEventResult = {
  whyNow: string;
  lesson: string;
  nextSteps: string[];
};

/* TRACE SYSTEM */

export type InsightTrace = {
  system: string;
  explanation: string;
};

/* HUMAN DESIGN */

export type HumanDesignProfile = {
  type: string;
  strategy: string;
  authority: string;
  profile?: string;
};

/* ARCHETYPE */

export type Archetype = {
  name: string;
  tagline: string;
  element: string;
  role: string;
};

/* CONFIDENCE */

export type ConfidenceBadge = "verified" | "partial" | "unverified";

export type Confidence = {
  badge: ConfidenceBadge;
  label: string;
  reason: string;
};

/* CODEX SYNTHESIS */

export type CodexSynthesis = {
  archetype: string;
  topThemes: string[];
  coreNature: string;
  stressPattern: string;
  decisionStyle: string;
  relationshipStyle: string;
  blindSpot: string;
  growthEdge: string;
  currentPhaseMeaning: string;
  practicalGuidance: string[];
};

/* FULL SOUL PROFILE */

export type SoulProfile = {
  birth: BirthData;
  confidence?: Confidence;
  archetype?: Archetype;
  mirror?: MirrorProfile;
  numerology?: NumerologyProfile;
  chart?: FullChart;
  aspects?: Aspect[];
  humanDesign?: HumanDesignProfile;
  elements?: ElementBalance;
  morals?: MoralCompass;
  themes?: CodexThemes;
  timeline?: TimelineProfile;
  dailyCard?: DailyCard;
  synthesis?: CodexSynthesis;
};
