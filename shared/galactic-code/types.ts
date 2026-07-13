/**
 * Galactic Code Types
 *
 * Deterministic fusion layer combining astrology, Human Design, numerology,
 * behavioral traits, and symbolic archetypes into a stable identity fingerprint.
 */

export type GalacticConfidence = 'verified' | 'partial' | 'unverified';
export type SourceConfidence = 'verified' | 'partial' | 'missing';

export interface GalacticAstrologyInput {
  sun?: string;
  moon?: string;
  rising?: string;
  mercury?: string;
  venus?: string;
  mars?: string;
  dominantElements?: string[];
  dominantModalities?: string[];
  houseEmphasis?: string[];
  majorAspects?: string[];
  confidence: SourceConfidence;
}

export interface GalacticHumanDesignInput {
  type?: string;
  strategy?: string;
  authority?: string;
  profile?: string;
  definition?: string;
  centers?: {
    defined: string[];
    undefined: string[];
  };
  channels?: string[];
  gates?: string[];
  incarnationCross?: string;
  confidence: SourceConfidence;
}

export interface GalacticNumerologyInput {
  lifePath?: number | string;
  birthdayNumber?: number | string;
  expressionNumber?: number | string;
  soulUrgeNumber?: number | string;
  personalityNumber?: number | string;
  maturityNumber?: number | string;
  confidence: SourceConfidence;
}

export interface GalacticBehaviorInput {
  traits: string[];
  decisionStyle?: string;
  stressPattern?: string;
  relationalPattern?: string;
  builderMode?: string;
  moralCompass?: string;
}

export interface GalacticSymbolicInput {
  animal?: string;
  archetype?: string;
  energyMode?: string;
  presenceType?: string;
  powerExpression?: string;
}

export interface GalacticCodeInput {
  profileId: string;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  astrology: GalacticAstrologyInput;
  humanDesign: GalacticHumanDesignInput;
  numerology: GalacticNumerologyInput;
  behavior: GalacticBehaviorInput;
  symbolic?: GalacticSymbolicInput;
}

export interface GalacticAxisScore {
  key: string;
  label: string;
  score: number;
  evidence: string[];
}

export interface SourceCoverageResult {
  astrology: SourceConfidence;
  humanDesign: SourceConfidence;
  numerology: SourceConfidence;
  behavioralTraitCount: number;
}

export interface GalacticCodeResult {
  profileId: string;
  version: 'galactic-code-v1';
  fingerprint: string;
  shortCode: string;
  confidence: GalacticConfidence;
  sourceCoverage: SourceCoverageResult;
  codename: string;
  designation: string;
  tagline: string;
  primaryFunction: string;
  secondaryFunction: string;
  legacyFunction: string;
  frequency: string;
  axes: GalacticAxisScore[];
  elementMatrix: Record<string, number>;
  behavioralSequence: string[];
  uniquenessKey: string;
  interpretation: {
    identity: string;
    decisionCode: string;
    stressMechanic: string;
    relationalCode: string;
    missionArc: string;
  };
  evidence: string[];
  generatedAt: string;
}

export interface NormalizedGalacticInput {
  profileId: string;
  birthDate: string | null;
  birthTime: string | null;
  birthLocation: string | null;
  astrology: {
    sun: string | null;
    moon: string | null;
    rising: string | null;
    mercury: string | null;
    venus: string | null;
    mars: string | null;
    dominantElements: string[];
    dominantModalities: string[];
    houseEmphasis: string[];
    majorAspects: string[];
    confidence: SourceConfidence;
  };
  humanDesign: {
    type: string | null;
    strategy: string | null;
    authority: string | null;
    profile: string | null;
    definition: string | null;
    definedCenters: string[];
    undefinedCenters: string[];
    channels: string[];
    gates: string[];
    incarnationCross: string | null;
    confidence: SourceConfidence;
  };
  numerology: {
    lifePath: string | null;
    birthdayNumber: string | null;
    expressionNumber: string | null;
    soulUrgeNumber: string | null;
    personalityNumber: string | null;
    maturityNumber: string | null;
    confidence: SourceConfidence;
  };
  behavior: {
    traits: string[];
    decisionStyle: string | null;
    stressPattern: string | null;
    relationalPattern: string | null;
    builderMode: string | null;
    moralCompass: string | null;
  };
  symbolic: {
    animal: string | null;
    archetype: string | null;
    energyMode: string | null;
    presenceType: string | null;
    powerExpression: string | null;
  };
}
