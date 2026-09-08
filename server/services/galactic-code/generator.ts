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
} from '../../../shared/galactic-code/types';
import { normalizeGalacticInput, extractHashableInput } from './normalize';
import { createGalacticFingerprint } from './fingerprint';
import { scoreAxes, getTopAxes } from './scoring';
import { createDeterministicInterpretation } from './prompts';
import { maySystemInfluenceSynthesis } from '../../../shared/system-visibility';

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

  return {
    ...input,
    astrology: astrologyAllowed
      ? input.astrology
      : { coverage: 'missing', evidenceState: input.astrology.evidenceState || 'candidate' },
    humanDesign: humanDesignAllowed
      ? input.humanDesign
      : { coverage: 'missing', evidenceState: input.humanDesign.evidenceState || 'candidate' },
    numerology: numerologyAllowed
      ? input.numerology
      : { coverage: 'missing', evidenceState: input.numerology.evidenceState || 'candidate' },
    behavior: behaviorAllowed
      ? input.behavior
      : { traits: [], evidenceState: input.behavior.evidenceState || 'candidate' },
  };
}

const TEXTURE_WORDS = [
  'Obsidian',
  'Velvet',
  'Silver',
  'Iron',
  'Lunar',
  'Ember',
  'Tide',
  'Quiet',
  'Prism',
  'Storm',
  'Golden',
  'Shadow',
];

const FUNCTION_WORDS = [
  'Architect',
  'Guardian',
  'Oracle',
  'Strategist',
  'Catalyst',
  'Builder',
  'Navigator',
  'Witness',
  'Diplomat',
  'Reformer',
  'Sentinel',
];

export function generateGalacticCode(input: GalacticCodeInput): GalacticCodeResult {
  const eligibleInput = synthesisEligibleInput(input);

  // Step 1: Validate minimum system coverage
  const hasAstrology = eligibleInput.astrology.coverage !== 'missing' && eligibleInput.astrology.sun;
  const hasHD = eligibleInput.humanDesign.coverage !== 'missing' && eligibleInput.humanDesign.type;
  const hasNumerology = eligibleInput.numerology.coverage !== 'missing' && eligibleInput.numerology.lifePath;
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
  const topThreeAxes = getTopAxes(allAxes, 3);

  // Step 6: Select functions and codename
  const primaryFunction = topThreeAxes[0]?.label || 'Architect';
  const secondaryFunction = topThreeAxes[1]?.label || 'Guardian';
  const legacyFunction = determineLegacyFunction(
    eligibleInput.numerology.lifePath?.toString(),
    normalized.behavior.builderMode
  );

  const codename = selectCodename(
    normalized.astrology.moon || normalized.astrology.rising,
    primaryFunction
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
    topThreeAxes[0]?.label || 'Observer',
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
  ].reduce((a, b) => a + b);

  const hasBehavior = sourceCoverage.behavioralTraitCount >= 5;

  // High coverage: at least 2 complete systems (astrology + HD) plus behavioral traits
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

function determineLegacyFunction(lifePathStr?: string, builderMode?: string | null): string {
  if (builderMode) {
    return `Legacy: ${builderMode}`;
  }
  if (lifePathStr === '9') {
    return 'Legacy: Integration & Teaching';
  }
  if (lifePathStr === '22') {
    return 'Legacy: Master Building';
  }
  return 'Legacy: Progressive Impact';
}

function selectCodename(moonOrRising?: string | null, primaryFunction?: string): string {
  const textureIndex =
    (moonOrRising?.charCodeAt(0) ?? 0) % TEXTURE_WORDS.length;
  const texture = TEXTURE_WORDS[textureIndex];

  const functionIndex = (primaryFunction?.charCodeAt(0) ?? 0) % FUNCTION_WORDS.length;
  const func = FUNCTION_WORDS[functionIndex];

  return `${texture} ${func}`;
}

function createDesignation(primary: string, secondary: string): string {
  return `The ${primary} ${secondary}`;
}

function createTagline(topAxes: any[]): string {
  const primary = topAxes[0]?.label || 'Observer';
  const secondary = topAxes[1]?.label || 'Builder';
  return `Fusing ${primary} and ${secondary} into coherent systems.`;
}

function createFrequency(birthDate?: string, birthTime?: string, lifePathStr?: string): string {
  if (!birthDate) {
    return 'Frequency data incomplete';
  }

  const [year, month, day] = birthDate.split('-');
  const monthDay = `${month}${day}`;

  if (birthTime) {
    const [hours, minutes] = birthTime.split(':');
    return `${monthDay}-${hours}${minutes}-LP${lifePathStr || '?'}`;
  }

  return `${monthDay}--LP${lifePathStr || '?'}`;
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

  const sequences = axisLabels
    .map(label => sequenceMap[label] || ['Act', 'Learn', 'Adapt'])
    .flat()
    .slice(0, 5);

  return sequences.length > 0 ? sequences : ['Observe', 'Decode', 'Refine', 'Build', 'Teach'];
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
