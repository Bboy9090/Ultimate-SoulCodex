export type Attachment = "secure" | "anxious" | "avoidant" | "disorganized";
export type LoveLanguage = "words" | "touch" | "gifts" | "service" | "time";

export interface Psych {
  attachment?: Attachment;
  loveLanguages?: LoveLanguage[];
}

export interface PersonInput {
  fullName?: string;
  dob?: string; // ISO "YYYY-MM-DD"
  tob?: string | null; // "HH:MM", optional
  place?: string | null; // location string
  psych?: Psych;
}

export type Pillar = "attraction" | "emotional" | "lifestyle" | "longTerm" | "timing";

export interface PillarScore {
  value: number;
  error: number; // ±N
}

export type Scores = Record<Pillar | "overall", PillarScore>;

export interface DetailedAspects {
  sex: number;
  communication: number;
  trust: number;
  friendship: number;
  overall: number;
  relationship: number;
  colleagues: number;
  marriage: number;
  emotionalConnection: number;
  intimacy: number;
  commonValues: number;
}

export interface RelationshipCategory {
  label: "Best Friends" | "Soulmate" | "Karmic Lesson" | "Great Match" | "Compatible" | "Challenging";
  rationale: string;
  dominantPillars: Pillar[];
  strength: number;
}

export interface SynastryAspect {
  person1Planet: string;
  person2Planet: string;
  aspect: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  orb: number;
  tier: 'golden' | 'diamond' | 'fated' | 'standard';
  description: string;
  impact: 'harmony' | 'tension' | 'growth';
  score: number;
}

export interface HouseOverlay {
  planet: string;
  house: number;
  significance: string;
  impact: 'profound' | 'moderate' | 'light';
}

export interface SynastryData {
  overallScore: number;
  goldenAspects: SynastryAspect[];
  diamondAspects: SynastryAspect[];
  fatedAspects: SynastryAspect[];
  otherAspects: SynastryAspect[];
  houseOverlays: {
    person1Planets: HouseOverlay[];
    person2Planets: HouseOverlay[];
  };
  chemistry: {
    score: number;
    description: string;
  };
  commitment: {
    score: number;
    description: string;
  };
  growth: {
    score: number;
    description: string;
  };
  summary: {
    strengths: string[];
    challenges: string[];
    soulMateIndicators: string[];
    relationshipType: string;
  };
}

export interface CompatResult {
  scores: Scores;
  flags: string[];
  version: string;
  confidence: "high" | "medium" | "low";
  nudges: string[];
  detailedAspects: DetailedAspects;
  relationshipCategories: RelationshipCategory[];
  synastry?: SynastryData;
}

export interface InputsAvailable {
  dob: boolean;
  birthTime: boolean;
  birthPlace: boolean;
  fullName: boolean;
  psych: boolean;
  venusMars: boolean;
  moonConfident: boolean;
  saturn: boolean;
  personalYear: boolean;
}
