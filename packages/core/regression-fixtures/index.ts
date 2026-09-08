/**
 * Regression Fixtures Module
 *
 * Exports golden fixtures, types, and provenance metadata.
 */

// Export all types
export type {
  PersonalNumbers,
  AstrologyData,
  HumanDesignData,
  GoldenFixture,
  RegressionTestResult,
  RegressionSummary,
} from './types.js';

// Export all provenance types
export type {
  FixtureProvenance,
  FixtureProvenanceSource,
  FixtureProvenanceBirthplace,
  FixtureProvenanceTimeHandling,
  FixtureProvenanceCalculation,
  FixtureProvenanceExpectedCoordinates,
  FixtureProvenanceTolerances,
  FixtureProvenanceVerification,
} from './provenance.js';

// Export provenance enums
export type {
  FixtureVerificationStatus,
  TimezoneMethod,
  ZodiacMode,
  CoordinateMode,
} from './provenance.js';

// Export fixtures and utility functions
export { GOLDEN_FIXTURES, getFixtureById, getAllFixtures, getFixturesByTimeVerification } from './fixtures.js';
