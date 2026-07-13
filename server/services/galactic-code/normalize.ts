/**
 * Galactic Code Normalization
 *
 * Normalize all values before hashing to ensure fingerprint stability.
 * - lowercase
 * - trim whitespace
 * - sort arrays alphabetically
 * - remove duplicates
 * - convert missing values to null
 */

import type { GalacticCodeInput, NormalizedGalacticInput, SourceConfidence } from '../../../shared/galactic-code/types';

function normalizeText(value?: string): string | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function normalizeArray(values?: string[]): string[] {
  return [...new Set(
    (values || [])
      .map(v => normalizeText(v))
      .filter((v): v is string => v !== null)
  )].sort();
}

function normalizeConfidence(confidence?: SourceConfidence): SourceConfidence {
  if (!confidence || !['verified', 'partial', 'missing'].includes(confidence)) {
    return 'missing';
  }
  return confidence;
}

export function normalizeGalacticInput(input: GalacticCodeInput): NormalizedGalacticInput {
  return {
    profileId: input.profileId.trim(),
    birthDate: normalizeText(input.birthDate),
    birthTime: normalizeText(input.birthTime),
    birthLocation: normalizeText(input.birthLocation),
    astrology: {
      sun: normalizeText(input.astrology.sun),
      moon: normalizeText(input.astrology.moon),
      rising: normalizeText(input.astrology.rising),
      mercury: normalizeText(input.astrology.mercury),
      venus: normalizeText(input.astrology.venus),
      mars: normalizeText(input.astrology.mars),
      dominantElements: normalizeArray(input.astrology.dominantElements),
      dominantModalities: normalizeArray(input.astrology.dominantModalities),
      houseEmphasis: normalizeArray(input.astrology.houseEmphasis),
      majorAspects: normalizeArray(input.astrology.majorAspects),
      confidence: normalizeConfidence(input.astrology.confidence),
    },
    humanDesign: {
      type: normalizeText(input.humanDesign.type),
      strategy: normalizeText(input.humanDesign.strategy),
      authority: normalizeText(input.humanDesign.authority),
      profile: normalizeText(input.humanDesign.profile),
      definition: normalizeText(input.humanDesign.definition),
      definedCenters: normalizeArray(input.humanDesign.centers?.defined),
      undefinedCenters: normalizeArray(input.humanDesign.centers?.undefined),
      channels: normalizeArray(input.humanDesign.channels),
      gates: normalizeArray(input.humanDesign.gates),
      incarnationCross: normalizeText(input.humanDesign.incarnationCross),
      confidence: normalizeConfidence(input.humanDesign.confidence),
    },
    numerology: {
      lifePath: normalizeText(String(input.numerology.lifePath ?? '')),
      birthdayNumber: normalizeText(String(input.numerology.birthdayNumber ?? '')),
      expressionNumber: normalizeText(String(input.numerology.expressionNumber ?? '')),
      soulUrgeNumber: normalizeText(String(input.numerology.soulUrgeNumber ?? '')),
      personalityNumber: normalizeText(String(input.numerology.personalityNumber ?? '')),
      maturityNumber: normalizeText(String(input.numerology.maturityNumber ?? '')),
      confidence: normalizeConfidence(input.numerology.confidence),
    },
    behavior: {
      traits: normalizeArray(input.behavior.traits),
      decisionStyle: normalizeText(input.behavior.decisionStyle),
      stressPattern: normalizeText(input.behavior.stressPattern),
      relationalPattern: normalizeText(input.behavior.relationalPattern),
      builderMode: normalizeText(input.behavior.builderMode),
      moralCompass: normalizeText(input.behavior.moralCompass),
    },
    symbolic: {
      animal: normalizeText(input.symbolic?.animal),
      archetype: normalizeText(input.symbolic?.archetype),
      energyMode: normalizeText(input.symbolic?.energyMode),
      presenceType: normalizeText(input.symbolic?.presenceType),
      powerExpression: normalizeText(input.symbolic?.powerExpression),
    },
  };
}

export function extractHashableInput(normalized: NormalizedGalacticInput): unknown {
  return {
    profileId: normalized.profileId,
    birthDate: normalized.birthDate,
    astrology: {
      sun: normalized.astrology.sun,
      moon: normalized.astrology.moon,
      rising: normalized.astrology.rising,
      mercury: normalized.astrology.mercury,
      venus: normalized.astrology.venus,
      mars: normalized.astrology.mars,
      dominantElements: normalized.astrology.dominantElements,
      dominantModalities: normalized.astrology.dominantModalities,
    },
    humanDesign: {
      type: normalized.humanDesign.type,
      strategy: normalized.humanDesign.strategy,
      authority: normalized.humanDesign.authority,
      profile: normalized.humanDesign.profile,
      definedCenters: normalized.humanDesign.definedCenters,
      channels: normalized.humanDesign.channels,
      incarnationCross: normalized.humanDesign.incarnationCross,
    },
    numerology: {
      lifePath: normalized.numerology.lifePath,
      birthdayNumber: normalized.numerology.birthdayNumber,
      expressionNumber: normalized.numerology.expressionNumber,
    },
    behavior: {
      traits: normalized.behavior.traits,
      decisionStyle: normalized.behavior.decisionStyle,
      stressPattern: normalized.behavior.stressPattern,
      builderMode: normalized.behavior.builderMode,
    },
  };
}
