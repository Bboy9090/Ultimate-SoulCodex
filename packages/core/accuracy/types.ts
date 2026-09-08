/**
 * Accuracy and Provenance Types
 *
 * Separates four distinct certainty levels:
 * 1. Input certainty (how well we know the birth data)
 * 2. Calculation certainty (whether the math is exact for declared inputs)
 * 3. Cross-provider agreement (do independent calculators match)
 * 4. Interpretive certainty (psychological meaning of the result)
 *
 * A perfect calculation from wrong birth data is mathematically exact but wrong in reality.
 * A person's Sun sign can be calculated to extreme precision, but the psychological
 * meaning remains interpretive, not proven biographical fact.
 */

/**
 * Result status labels replace uncalibrated percentages.
 * Each status has defensible meaning grounded in the data and methods.
 */
export type ResultStatus =
  | 'verified-input-matched-calculation'  // Exact recorded input + independent provider agreement
  | 'exact-for-entered-input'              // Calculation is deterministic; birth data not independently verified
  | 'stable-across-uncertainty-window'     // Result unchanged across all candidate times tested
  | 'variable-across-uncertainty-window'   // Result changes depending on unknown time
  | 'unavailable'                          // Required input is missing
  | 'conflict';                            // Independent providers disagree beyond tolerance

/**
 * How certain is the birth time itself?
 */
export type InputVerificationStatus =
  | 'recorded'              // Birth certificate or official record
  | 'user-recalled'         // Person's memory or family recollection (unverified)
  | 'estimated'             // Reconstructed or approximated
  | 'unknown';              // Not provided

/**
 * Which method was used to convert local time to UTC?
 */
export type TimezoneConversionMethod =
  | 'standard-iana-tzdb'    // IANA timezone database, pinned version
  | 'daylight-offset'       // Assumed DST rules for the date
  | 'historical-offset'     // Researched historical UTC offset (requires source)
  | 'unknown';              // Cannot determine

/**
 * Coordinate mode for ephemeris calculation.
 */
export type CoordinateMode = 'geocentric' | 'topocentric' | 'unknown';

/**
 * Zodiac system for astrological calculations.
 */
export type ZodiacSystem = 'tropical' | 'sidereal' | 'unknown';

/**
 * House system for calculating houses and ascendant.
 */
export type HouseSystem =
  | 'placidus'
  | 'koch'
  | 'whole-sign'
  | 'equal'
  | 'regiomontanus'
  | 'campanus'
  | 'unknown';

/**
 * Exact specification of birth input data.
 * No hidden conversions, no developer improvisation.
 */
export interface ExactBirthInput {
  recordedLocalTime: string;           // ISO 8601: YYYY-MM-DDTHH:MM:SS
  birthDate: string;                   // ISO 8601: YYYY-MM-DD
  birthTime?: string;                  // ISO 8601: HH:MM:SS (optional if unknown)
  birthplace: {
    city: string | null;
    region: string | null;
    country: string | null;
    latitude: number | null;           // Decimal degrees
    longitude: number | null;          // Decimal degrees
  };
  timezone: {
    identifier: string | null;         // IANA timezone ID (e.g., "America/New_York")
    appliedUtcOffset: string | null;   // ISO 8601: ±HH:MM (e.g., "-05:00")
    conversionMethod: TimezoneConversionMethod;
    tzDatabaseVersion: string | null;  // IANA tzdb version (e.g., "2026c")
  };
  inputVerificationStatus: InputVerificationStatus;
}

/**
 * Ephemeris and calculation engine specification.
 * Pinned versions ensure reproducibility.
 */
export interface CalculationMethodology {
  ephemerisProvider: string | null;           // e.g., "Swiss Ephemeris"
  ephemerisProviderVersion: string | null;    // Pinned release version
  ephemerisDataset: string | null;            // e.g., "DE441" (NASA JPL)
  zodiacSystem: ZodiacSystem;                 // Tropical or sidereal
  coordinateMode: CoordinateMode;             // Geocentric or topocentric
  houseSystem: HouseSystem;
  nodeMode: 'true' | 'mean' | null;          // True or mean lunar node
  ayanamsha: string | null;                   // Sidereal ayanamsha if applicable
}

/**
 * Normalized UTC timestamp after timezone conversion.
 * This is what actually gets fed to the ephemeris engine.
 */
export interface NormalizedUTCTimestamp {
  utcTime: string;                    // ISO 8601: YYYY-MM-DDTHH:MM:SSZ
  calculatedFrom: ExactBirthInput;
  conversionSteps: Array<{
    step: string;
    input: string;
    output: string;
    method: string;
    source: string | null;            // Citation or null if algorithm
  }>;
}

/**
 * Cross-provider comparison result.
 */
export interface ProviderComparison {
  primaryProvider: string;
  primaryVersion: string;
  primaryResult: {
    sunLongitude: number | null;      // Decimal degrees
    moonLongitude: number | null;
    ascendantLongitude: number | null;
    [key: string]: any;
  };
  referenceProvider: string;
  referenceVersion: string;
  referenceResult: {
    sunLongitude: number | null;
    moonLongitude: number | null;
    ascendantLongitude: number | null;
    [key: string]: any;
  };
  tolerances: {
    sunLongitudeDegrees: number;      // Max acceptable difference
    moonLongitudeDegrees: number;
    ascendantLongitudeDegrees: number;
  };
  differences: {
    sunLongitudeDegrees: number;
    moonLongitudeDegrees: number;
    ascendantLongitudeDegrees: number;
  };
  status: 'matched' | 'within-tolerance' | 'exceeded-tolerance' | 'unavailable';
}

/**
 * Complete calculation receipt.
 * Every chart should be able to expose this.
 */
export interface ChartCalculationReceipt {
  chartId: string;
  calculatedAt: string;               // ISO 8601 timestamp

  // Input specification
  birthInput: ExactBirthInput;

  // Normalized UTC
  normalizedUTC: NormalizedUTCTimestamp;

  // Calculation methodology
  methodology: CalculationMethodology;

  // Calculation results (exact for the entered input)
  calculations: {
    sunLongitude: number | null;      // Decimal degrees
    moonLongitude: number | null;
    ascendantLongitude: number | null;
    moonLatitude: number | null;
    [key: string]: any;
  };

  // Cross-provider validation
  providerComparison?: ProviderComparison;

  // Uncertainty window analysis (if time is uncertain)
  uncertaintyWindow?: {
    startTime: string;                // ISO 8601
    endTime: string;
    moonSignRange: string[] | null;   // Which signs Moon occupies in window
    ascendantSignRange: string[] | null;
    variableFields: string[];         // Which fields change in the window
    stableFields: string[];           // Which fields don't change
  };

  // Final status
  status: ResultStatus;
  statusReason: string;               // Human-readable explanation
}

/**
 * Uncertainty window solver result.
 * When exact birth time is unknown, calculate all candidate times.
 */
export interface UncertaintyWindowAnalysis {
  inputTimeWindow: {
    startTime: string;                // ISO 8601
    endTime: string;
    reason: string;                   // "user-uncertain", "rectified", etc.
  };
  samplePoints: Array<{
    sampleTime: string;
    sunLongitude: number;
    moonLongitude: number;
    ascendantLongitude: number;
    sunSign: string;
    moonSign: string;
    ascendantSign: string;
  }>;
  conclusions: {
    moonSign: {
      status: 'stable' | 'variable';
      values: string[];               // If variable, list all possible values
      stableAcrossWindow: boolean;
    };
    ascendant: {
      status: 'stable' | 'variable';
      values: string[];
      stableAcrossWindow: boolean;
    };
    sunSign: {
      status: 'stable';               // Sun rarely changes in small windows
      value: string;
    };
  };
}
