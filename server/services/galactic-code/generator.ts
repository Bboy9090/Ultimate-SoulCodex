/**
 * Galactic Code Generator
 *
 * Main orchestrator: validate → normalize → fingerprint → score → generate
 */

import type {
  GalacticCodeInput,
  GalacticCodeResult,
  GalacticCoverageState,
  SourceCoverageResult,
  GalacticAstrologyField,
} from '../../../shared/galactic-code/types';
import { normalizeGalacticInput, extractHashableInput } from './normalize';
import { createGalacticFingerprint } from './fingerprint';
import { scoreAxes, getTopAxes } from './scoring';
import { createDeterministicInterpretation } from './prompts';
import { maySystemInfluenceSynthesis } from '../../../shared/system-visibility';
import { isValidClockTime, isValidDateOnly } from '../../../shared/schema';

function verifiedAstrologyField(
  input: GalacticCodeInput['astrology'],
  field: GalacticAstrologyField,
): boolean {
  return input.fieldEvidence?.[field] === 'verified';
}

const GOVERNED_SIGNS = new Set([
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
]);

const GOVERNED_HD_CORE = {
  manifestor: {
    type: 'Manifestor',
    strategy: 'To Inform',
    authorities: ['Emotional Authority', 'Splenic Authority', 'Ego Authority'],
  },
  generator: {
    type: 'Generator',
    strategy: 'To Respond',
    authorities: ['Emotional Authority', 'Sacral Authority'],
  },
  'manifesting generator': {
    type: 'Manifesting Generator',
    strategy: 'To Respond & Inform',
    authorities: ['Emotional Authority', 'Sacral Authority'],
  },
  projector: {
    type: 'Projector',
    strategy: 'To Wait for Invitation',
    authorities: [
      'Emotional Authority',
      'Splenic Authority',
      'Ego Authority',
      'Self-Projected Authority',
      'Mental Authority',
    ],
  },
  reflector: {
    type: 'Reflector',
    strategy: 'To Wait a Lunar Cycle',
    authorities: ['Lunar Authority'],
  },
} as const;

const GOVERNED_NUMEROLOGY_VALUES = new Set([
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '11', '22', '33',
]);

function governedSign(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  return GOVERNED_SIGNS.has(normalized) ? value : undefined;
}

function governedHumanDesignCore(
  input: GalacticCodeInput['humanDesign'],
): Pick<GalacticCodeInput['humanDesign'], 'type' | 'strategy' | 'authority' | 'profile'> | null {
  const typeKey = input.type?.trim().toLowerCase() as keyof typeof GOVERNED_HD_CORE | undefined;
  if (!typeKey) return null;

  const policy = GOVERNED_HD_CORE[typeKey];
  if (!policy) return null;

  const strategy = input.strategy?.trim();
  const authority = input.authority?.trim();
  const profile = input.profile?.trim();

  if (!strategy || strategy.toLowerCase() !== policy.strategy.toLowerCase()) return null;
  if (!authority) return null;

  const canonicalAuthority = policy.authorities.find(
    (value) => value.toLowerCase() === authority.toLowerCase(),
  );
  if (!canonicalAuthority) return null;
  if (!profile || !/^[1-6]\/([1-6])$/.test(profile)) return null;

  return {
    type: policy.type,
    strategy: policy.strategy,
    authority: canonicalAuthority,
    profile,
  };
}

function governedNumerologyValue(
  value: number | string | undefined,
): number | string | undefined {
  if (value === undefined || value === null) return undefined;
  const normalized = String(value).trim();
  return GOVERNED_NUMEROLOGY_VALUES.has(normalized) ? value : undefined;
}

function synthesisEligibleInput(input: GalacticCodeInput): GalacticCodeInput {
  const astrologyAllowed = maySystemInfluenceSynthesis(
    'astrologyCore',
    input.astrology.evidenceState || 'candidate',
  );
  const humanDesignAllowed = maySystemInfluenceSynthesis(
    'humanDesign',
    input.humanDesign.evidenceState || 'candidate',
  );
  const numerologyAllowed = maySystemInfluenceSynthesis(
    'numerology',
    input.numerology.evidenceState || 'candidate',
  );
  const behaviorAllowed = maySystemInfluenceSynthesis(
    'personalityAssessments',
    input.behavior.evidenceState || 'candidate',
  );
  const humanDesignCore = humanDesignAllowed
    ? governedHumanDesignCore(input.humanDesign)
    : null;

  return {
    ...input,
    astrology: astrologyAllowed
      ? {
          ...input.astrology,
          sun: verifiedAstrologyField(input.astrology, 'sun') ? governedSign(input.astrology.sun) : undefined,
          moon: verifiedAstrologyField(input.astrology, 'moon') ? governedSign(input.astrology.moon) : undefined,
          rising: verifiedAstrologyField(input.astrology, 'rising') ? governedSign(input.astrology.rising) : undefined,
          mercury: verifiedAstrologyField(input.astrology, 'mercury') ? governedSign(input.astrology.mercury) : undefined,
          venus: verifiedAstrologyField(input.astrology, 'venus') ? governedSign(input.astrology.venus) : undefined,
          mars: verifiedAstrologyField(input.astrology, 'mars') ? governedSign(input.astrology.mars) : undefined,
          dominantElements: verifiedAstrologyField(input.astrology, 'dominantElements') ? input.astrology.dominantElements : undefined,
          dominantModalities: verifiedAstrologyField(input.astrology, 'dominantModalities') ? input.astrology.dominantModalities : undefined,
          houseEmphasis: verifiedAstrologyField(input.astrology, 'houseEmphasis') ? input.astrology.houseEmphasis : undefined,
          majorAspects: verifiedAstrologyField(input.astrology, 'majorAspects') ? input.astrology.majorAspects : undefined,
        }
      : { coverage: 'missing', evidenceState: input.astrology.evidenceState || 'candidate' },
    humanDesign: humanDesignCore
      ? {
          ...input.humanDesign,
          ...humanDesignCore,
        }
      : { coverage: 'missing', evidenceState: input.humanDesign.evidenceState || 'candidate' },
    numerology: numerologyAllowed
      ? {
          ...input.numerology,
          lifePath: governedNumerologyValue(input.numerology.lifePath),
          birthdayNumber: governedNumerologyValue(input.numerology.birthdayNumber),
          expressionNumber: governedNumerologyValue(input.numerology.expressionNumber),
          soulUrgeNumber: governedNumerologyValue(input.numerology.soulUrgeNumber),
          personalityNumber: governedNumerologyValue(input.numerology.personalityNumber),
          maturityNumber: governedNumerologyValue(input.numerology.maturityNumber),
        }
      : { coverage: 'missing', evidenceState: input.numerology.evidenceState || 'candidate' },
    behavior: behaviorAllowed
      ? input.behavior
      : { traits: [], evidenceState: input.behavior.evidenceState || 'candidate' },
  };
}

const SIGN_TEXTURE: Record<string, string> = {
  aries: 'Ember',
  taurus: 'Stone',
  gemini: 'Mercury',
  cancer: 'Tide',
  leo: 'Solar',
  virgo: 'Prism',
  libra: 'Aerial',
  scorpio: 'Obsidian',
  sagittarius: 'Comet',
  capricorn: 'Summit',
  aquarius: 'Signal',
  pisces: 'Oceanic',
};

const LIFE_PATH_LEGACY: Record<string, string> = {
  '1': 'Independent Initiation',
  '2': 'Cooperative Connection',
  '3': 'Creative Expression',
  '4': 'Durable Structure',
  '5': 'Adaptive Exploration',
  '6': 'Responsible Stewardship',
  '7': 'Investigation & Understanding',
  '8': 'Material Leadership',
  '9': 'Integration & Completion',
  '11': 'Visionary Translation',
  '22': 'Master Building',
  '33': 'Teaching Through Service',
};

export interface GalacticCodeGenerationOptions {
  trustedEvidenceContext?: boolean;
}

export function generateGalacticCode(
  input: GalacticCodeInput,
  options: GalacticCodeGenerationOptions = {},
): GalacticCodeResult {
  if (!options.trustedEvidenceContext) {
    throw new Error('trusted_evidence_context_required');
  }

  if (input.birthDate !== undefined && !isValidDateOnly(input.birthDate)) {
    throw new Error('galactic_birth_date_invalid');
  }
  if (
    input.birthTime !== undefined &&
    input.birthTime.trim() !== '' &&
    !isValidClockTime(input.birthTime)
  ) {
    throw new Error('galactic_birth_time_invalid');
  }
  if (input.birthTime?.trim() && !input.birthDate) {
    throw new Error('galactic_birth_time_requires_birth_date');
  }

  const eligibleInput = synthesisEligibleInput(input);

  // Step 1: Validate minimum system coverage
  const hasAstrology = eligibleInput.astrology.coverage !== 'missing' && eligibleInput.astrology.sun;
  const hasHD = Boolean(
    eligibleInput.humanDesign.coverage !== 'missing' &&
    eligibleInput.humanDesign.type &&
    eligibleInput.humanDesign.authority &&
    eligibleInput.humanDesign.profile,
  );
  const hasNumerology = Boolean(
    eligibleInput.numerology.coverage !== 'missing' &&
    eligibleInput.numerology.lifePath,
  );
  const traitCount = (eligibleInput.behavior.traits || []).length;

  const systemCount = [hasAstrology, hasHD, hasNumerology].filter(Boolean).length;

  if (systemCount < 2) {
    throw new Error('Galactic Code requires at least 2 of 3 systems (astrology + numerology, astrology + HD, numerology + HD)');
  }

  // Step 2: Normalize
  const normalized = normalizeGalacticInput(eligibleInput);

  // Step 3: Fingerprint
  const hashableInput = extractHashableInput(normalized);
  const { fingerprint, shortCode, uniquenessKey } = createGalacticFingerprint(hashableInput);

  // Step 4: Calculate source coverage and galactic coverage
  const sourceCoverage = calculateSourceCoverage(normalized, traitCount);
  const coverage = calculateCoverage(sourceCoverage, systemCount);

  // Step 5: Score axes
  const allAxes = scoreAxes(normalized);
  const supportedAxes = allAxes.filter((axis) => axis.score > 0 && axis.evidence.length > 0);
  const topThreeAxes = getTopAxes(supportedAxes, 3);

  if (topThreeAxes.length < 2) {
    throw new Error('Galactic Code cannot derive two identity axes from the governed evidence; no fallback archetype is permitted');
  }

  // Step 6: Derive functions and codename only from supported evidence
  const primaryFunction = topThreeAxes[0].label;
  const secondaryFunction = topThreeAxes[1].label;
  const legacyFunction = determineLegacyFunction(
    normalized.numerology.lifePath,
    normalized.behavior.builderMode,
    primaryFunction,
  );

  const codename = selectCodename(
    normalized.astrology.moon || normalized.astrology.rising,
    primaryFunction,
    fingerprint,
  );
  const designation = createDesignation(primaryFunction, secondaryFunction);
  const tagline = createTagline(topThreeAxes);

  // Step 7: Create frequency
  const frequency = createFrequency(
    eligibleInput.birthDate,
    eligibleInput.birthTime,
    eligibleInput.numerology.lifePath?.toString()
  );

  // Step 8: Element matrix
  const elementMatrix = createElementMatrix(normalized.astrology.dominantElements);

  // Step 9: Behavioral sequence
  const behavioralSequence = createBehavioralSequence(topThreeAxes);

  // Step 10: Generate interpretation
  const interpretation = createDeterministicInterpretation(
    codename,
    primaryFunction,
    secondaryFunction,
    topThreeAxes[0].label,
    [
      normalized.astrology.sun && `Sun ${normalized.astrology.sun}`,
      normalized.humanDesign.type && `HD ${normalized.humanDesign.type}`,
      normalized.numerology.lifePath && `Life Path ${normalized.numerology.lifePath}`,
    ].filter(Boolean) as string[]
  );

  // Step 11: Collect evidence
  const evidence = collectEvidence(allAxes);

  // Step 12: Return result
  return {
    profileId: input.profileId,
    version: 'galactic-code-v1',
    fingerprint,
    shortCode,
    coverage,
    sourceCoverage,
    codename,
    designation,
    tagline,
    primaryFunction,
    secondaryFunction,
    legacyFunction,
    frequency,
    axes: topThreeAxes,
    elementMatrix,
    behavioralSequence,
    uniquenessKey,
    interpretation,
    evidence,
    generatedAt: new Date().toISOString(),
  };
}

function calculateSourceCoverage(
  normalized: any,
  traitCount: number
): SourceCoverageResult {
  // Astrology coverage: complete when all three bodies are present (Sun/Moon/Rising)
  const astrologyCoverage =
    normalized.astrology.sun &&
    normalized.astrology.moon &&
    normalized.astrology.rising
      ? 'complete'
      : normalized.astrology.sun
        ? 'partial'
        : 'missing';

  // Human Design coverage: complete when core fields are present (type/authority/profile)
  const hdCoverage =
    normalized.humanDesign.type &&
    normalized.humanDesign.authority &&
    normalized.humanDesign.profile
      ? 'complete'
      : normalized.humanDesign.type
        ? 'partial'
        : 'missing';

  // Numerology coverage: complete when all six fields are present, partial if some are present
  const numerologyFieldsPresent = [
    normalized.numerology.lifePath,
    normalized.numerology.birthdayNumber,
    normalized.numerology.expressionNumber,
    normalized.numerology.soulUrgeNumber,
    normalized.numerology.personalityNumber,
    normalized.numerology.maturityNumber,
  ].filter(Boolean).length;

  const numerologyCoverage =
    numerologyFieldsPresent === 6 ? 'complete' :
    numerologyFieldsPresent > 0 ? 'partial' :
    'missing';

  return {
    astrology: astrologyCoverage,
    humanDesign: hdCoverage,
    numerology: numerologyCoverage,
    behavioralTraitCount: traitCount,
  };
}

function calculateCoverage(sourceCoverage: SourceCoverageResult, systemCount: number): GalacticCoverageState {
  // Count how many systems have complete data (not including 'partial')
  const completeCount = [
    sourceCoverage.astrology === 'complete' ? 1 : 0,
    sourceCoverage.humanDesign === 'complete' ? 1 : 0,
    sourceCoverage.numerology === 'complete' ? 1 : 0,
  ].reduce((a, b) => a + b);

  const hasBehavior = sourceCoverage.behavioralTraitCount >= 5;

  // High coverage: at least 2 complete governed systems plus behavioral traits
  if (completeCount >= 2 && hasBehavior) {
    return 'high';
  }

  // High/Partial boundary: at least 2 complete systems but insufficient behavioral traits
  if (completeCount >= 2) {
    return 'partial';
  }

  // Partial coverage: 2+ systems present, even if not complete
  if (systemCount >= 2) {
    return 'partial';
  }

  // Insufficient: less than 2 systems or insufficient data
  return 'insufficient';
}

function determineLegacyFunction(
  lifePathStr: string | null,
  builderMode: string | null,
  primaryFunction: string,
): string {
  if (builderMode) return `Legacy: ${builderMode}`;
  if (lifePathStr && LIFE_PATH_LEGACY[lifePathStr]) {
    return `Legacy: ${LIFE_PATH_LEGACY[lifePathStr]}`;
  }
  return `Legacy axis: ${primaryFunction} (derived from supported evidence)`;
}

function selectCodename(
  moonOrRising: string | null,
  primaryFunction: string,
  fingerprint: string,
): string {
  const texture = moonOrRising ? SIGN_TEXTURE[moonOrRising] : null;
  const identityStem = texture ? `${texture} ${primaryFunction}` : primaryFunction;
  return `${identityStem} · ${fingerprint.slice(0, 4).toUpperCase()}`;
}

function createDesignation(primary: string, secondary: string): string {
  return `The ${primary} × ${secondary}`;
}

function createTagline(topAxes: Array<{ label: string; score: number }>): string {
  const [primary, secondary] = topAxes;
  if (!primary || !secondary) {
    throw new Error('Galactic Code tagline requires two supported axes');
  }
  return `${primary.label} (${primary.score}) and ${secondary.label} (${secondary.score}) are the two strongest governed synthesis axes.`;
}

function createFrequency(birthDate?: string, birthTime?: string, lifePathStr?: string): string {
  if (!birthDate) return 'Frequency unavailable: birth date missing';

  const [, month, day] = birthDate.split('-');
  const dateStem = `${month}${day}`;
  const timeStem = birthTime ? `-${birthTime.replace(':', '')}` : '';
  const lifePathStem = lifePathStr ? `-LP${lifePathStr}` : '';
  return `${dateStem}${timeStem}${lifePathStem}`;
}

function createElementMatrix(dominantElements?: string[]): Record<string, number> {
  const matrix: Record<string, number> = {
    fire: 0,
    earth: 0,
    air: 0,
    water: 0,
  };

  if (!dominantElements) return matrix;

  for (const element of dominantElements) {
    const normalized = element.toLowerCase();
    if (matrix.hasOwnProperty(normalized)) {
      matrix[normalized]++;
    }
  }

  return matrix;
}

function createBehavioralSequence(topAxes: any[]): string[] {
  const axisLabels = topAxes.slice(0, 3).map(a => a.label);

  const sequenceMap: Record<string, string[]> = {
    Observer: ['Observe', 'Analyze', 'Refine'],
    Builder: ['Build', 'Test', 'Optimize'],
    Strategist: ['Decode', 'Plan', 'Execute'],
    Initiator: ['Initiate', 'Adapt', 'Lead'],
    Transformer: ['Transform', 'Integrate', 'Evolve'],
    Connector: ['Connect', 'Align', 'Strengthen'],
    Protector: ['Protect', 'Stabilize', 'Guide'],
    Teacher: ['Teach', 'Clarify', 'Empower'],
    Explorer: ['Explore', 'Discover', 'Expand'],
    Stabilizer: ['Stabilize', 'Ground', 'Sustain'],
  };

  const unsupported = axisLabels.filter((label) => !sequenceMap[label]);
  if (unsupported.length > 0) {
    throw new Error(`No governed behavioral sequence exists for axis: ${unsupported.join(', ')}`);
  }

  const sequences = axisLabels
    .flatMap((label) => sequenceMap[label])
    .slice(0, 5);

  if (sequences.length < 5) {
    throw new Error('Galactic Code needs enough supported axes to derive a five-step behavioral sequence');
  }
  return sequences;
}

function collectEvidence(allAxes: any[]): string[] {
  const evidence: Set<string> = new Set();

  for (const axis of allAxes.slice(0, 5)) {
    if (axis.evidence && Array.isArray(axis.evidence)) {
      axis.evidence.slice(0, 2).forEach((e: string) => evidence.add(e));
    }
  }

  return Array.from(evidence).slice(0, 10);
}
