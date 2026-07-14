/**
 * Fixture Provenance Types and Metadata
 *
 * Structured provenance documentation for all canonical golden fixtures.
 *
 * This system separates deterministic regression behavior from historical or
 * externally verified accuracy. A passing regression test establishes consistent
 * behavior but does not automatically establish historical correctness or
 * scientific validity.
 */

export type FixtureVerificationStatus =
  | 'externally-verified'
  | 'partially-verified'
  | 'unverified';

export type TimezoneMethod =
  | 'standard-time'
  | 'daylight-time'
  | 'local-mean-time'
  | 'estimated'
  | 'unknown';

export type ZodiacMode =
  | 'tropical'
  | 'sidereal'
  | 'not-applicable';

export type CoordinateMode =
  | 'geocentric'
  | 'topocentric'
  | 'not-applicable';

export interface FixtureProvenanceSource {
  provider: string;
  reference: string | null;
  rating: string | null;
  accessedAt: string | null;
  notes?: string[];
}

export interface FixtureProvenanceBirthplace {
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface FixtureProvenanceTimeHandling {
  recordedLocalTime: string | null;
  utcOffset: string | null;
  timezoneMethod: TimezoneMethod;
  timezoneIdentifier: string | null;
  uncertaintyMinutes: number | null;
  notes?: string[];
}

export interface FixtureProvenanceCalculation {
  astrologyProvider: string | null;
  astrologyProviderVersion: string | null;
  ephemeris: string | null;
  ephemerisVersion: string | null;
  zodiac: ZodiacMode;
  coordinateMode: CoordinateMode;
  epochOrFrame: string | null;

  humanDesignProvider: string | null;
  humanDesignProviderVersion: string | null;
  humanDesignMethod: string | null;

  numerologyConvention: string;
}

export interface FixtureProvenanceExpectedCoordinates {
  sunLongitudeDegrees: number | null;
  moonLongitudeDegrees: number | null;
  ascendantLongitudeDegrees: number | null;
}

export interface FixtureProvenanceTolerances {
  sunLongitudeDegrees: number | null;
  moonLongitudeDegrees: number | null;
  ascendantLongitudeDegrees: number | null;
}

export interface FixtureProvenanceVerification {
  status: FixtureVerificationStatus;
  verifiedAt: string | null;
  verifiedBy: string | null;
  comparedAgainst: string[];
  limitations: string[];
}

export interface FixtureProvenance {
  source: FixtureProvenanceSource;
  birthplace: FixtureProvenanceBirthplace;
  timeHandling: FixtureProvenanceTimeHandling;
  calculation: FixtureProvenanceCalculation;
  expectedCoordinates: FixtureProvenanceExpectedCoordinates;
  tolerances: FixtureProvenanceTolerances;
  verification: FixtureProvenanceVerification;
}
