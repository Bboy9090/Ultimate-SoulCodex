/**
 * Accuracy and Calculation Receipt System
 *
 * Exposes calculation methodology, input certainty, and result status.
 * No fake percentages. Only defensible, transparent certainty levels.
 */

export type {
  ResultStatus,
  InputVerificationStatus,
  TimezoneConversionMethod,
  CoordinateMode,
  ZodiacSystem,
  HouseSystem,
  ExactBirthInput,
  CalculationMethodology,
  NormalizedUTCTimestamp,
  ProviderComparison,
  ChartCalculationReceipt,
  UncertaintyWindowAnalysis,
} from './types.js';

/**
 * Result status human descriptions.
 * Every status has a sentence that means something specific.
 */
export const STATUS_DESCRIPTIONS: Record<string, string> = {
  'verified-input-matched-calculation':
    'Exact recorded birth input with independent provider agreement.',
  'exact-for-entered-input':
    'Calculation is deterministic for the entered time, but birth data is not independently verified.',
  'stable-across-uncertainty-window':
    'Result remains unchanged across every candidate time tested.',
  'variable-across-uncertainty-window':
    'Result changes depending on the unknown birth time.',
  'unavailable':
    'Required input data is missing. Calculation cannot proceed.',
  'conflict':
    'Independent providers disagree beyond acceptable tolerance.',
};

/**
 * Determine if rising sign can be responsibly returned.
 */
export function canCalculateAscendant(input: {
  birthTimeProvided: boolean;
  birthplaceCoordinatesKnown: boolean;
  timezoneConversionSucceeded: boolean;
  inputVerificationStatus: string;
}): { can: boolean; reason?: string } {
  if (!input.birthTimeProvided) {
    return {
      can: false,
      reason: 'Birth time is required to calculate Rising sign.',
    };
  }
  if (!input.birthplaceCoordinatesKnown) {
    return {
      can: false,
      reason: 'Birthplace coordinates are required to calculate Rising sign.',
    };
  }
  if (!input.timezoneConversionSucceeded) {
    return {
      can: false,
      reason: 'Timezone conversion failed. UTC offset cannot be determined.',
    };
  }
  return { can: true };
}

/**
 * Determine Moon sign status given a time window.
 */
export function describeMoonSignUncertainty(analysis: {
  moonSignIsStableAcrossWindow: boolean;
  possibleSigns: string[];
  timeWindowDuration: number; // in minutes
}): string {
  if (analysis.moonSignIsStableAcrossWindow) {
    return `${analysis.possibleSigns[0]} Moon — stable across the ${analysis.timeWindowDuration}-minute window.`;
  }

  if (analysis.possibleSigns.length === 1) {
    return `${analysis.possibleSigns[0]} Moon.`;
  }

  return `Moon sign unresolved. Candidates: ${analysis.possibleSigns.join(
    ' or ',
  )}. Required: birth time narrower than ${analysis.timeWindowDuration} minutes.`;
}
