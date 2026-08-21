/**
 * Galactic Code Types
 *
 * Deterministic fusion layer combining astrology, Human Design, numerology,
 * behavioral traits, and symbolic archetypes into a stable identity fingerprint.
 */

import type { SoulCodexEvidenceState } from '../system-visibility';

/**
 * Coverage states represent data completeness, not verification status.
 * Complete data ≠ verified data (Diamond Doctrine principle).
 */
export type SourceCoverageState = 'complete' | 'partial' | 'missing';
export type GalacticCoverageState = 'high' | 'partial' | 'insufficient';

export interface GalacticAstrologyInput {
  evidenceState?: SoulCodexEvidenceState;
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
  coverage: SourceCoverageState;
}

export interface GalacticHumanDesignInput {
  evidenceState?: SoulCodexEvidenceState;
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
  coverage: SourceCoverageState;
}

export interface GalacticNumerologyInput {
  evidenceState?: SoulCodexEvidenceState;
  lifePath?: number | string;
  birthdayNumber?: number | string;
  expressionNumber?: number | string;
  soulUrgeNumber?: number | string;
  personalityNumber?: number | string;
  maturityNumber?: number | string;
  coverage: SourceCoverageState;
}

export interface GalacticBehaviorInput {
  evidenceState?: SoulCodexEvidenceState;
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
  astrology: SourceCoverageState;
  humanDesign: SourceCoverageState;
  numerology: SourceCoverageState;
  behavioralTraitCount: number;
}

export interface GalacticCodeResult {
  profileId: string;
  version: 'galactic-code-v1';
  fingerprint: string;
  shortCode: string;
  coverage: GalacticCoverageState;
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
    evidenceState: SoulCodexEvidenceState;
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
    coverage: SourceCoverageState;
  };
  humanDesign: {
    evidenceState: SoulCodexEvidenceState;
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
    coverage: SourceCoverageState;
  };
  numerology: {
    evidenceState: SoulCodexEvidenceState;
    lifePath: string | null;
    birthdayNumber: string | null;
    expressionNumber: string | null;
    soulUrgeNumber: string | null;
    personalityNumber: string | null;
    maturityNumber: string | null;
    coverage: SourceCoverageState;
  };
  behavior: {
    evidenceState: SoulCodexEvidenceState;
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
