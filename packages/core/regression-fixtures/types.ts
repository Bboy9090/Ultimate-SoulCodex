/**
 * Regression Fixture Types
 *
 * Canonical test datasets for ensuring Soul Codex calculations remain stable.
 * Fixtures have varying provenance status: some partially-verified, others unverified.
 * Passing regression tests establish consistent behavior, not historical accuracy.
 */

import type { FixtureProvenance } from './provenance.js';

export interface PersonalNumbers {
  day: number;
  month: number;
  year: number;
}

export interface AstrologyData {
  sunSign: string;
  moonSign: string;
  risingSign: string;
}

export interface HumanDesignData {
  type: string;
  strategy: string;
  authority: string;
  profile: string;
}

export interface GoldenFixture {
  id: string;
  name: string;
  birthDate: string; // ISO 8601: YYYY-MM-DD
  birthTime?: string; // Optional: HH:MM for astrology/HD
  timeVerified: 'exact' | 'estimated' | 'unknown'; // Regression metadata: confidence in recorded birth time value, not historical verification
  source: string; // Regression metadata: source identification for regression tracking (not external verification claim)
  notes: string; // Regression metadata: context for test fixture

  // Expected outputs (locked in as "correct" for regression testing)
  expected: {
    personalNumbers: PersonalNumbers;
    astrology: AstrologyData;
    humanDesign: HumanDesignData;
    // Additional fields can be added as engines expand
  };

  // Regression Metadata (do not interpret as external verification)
  createdAt: string; // When this fixture was created for regression testing
  lastVerified: string; // When fixture output was last confirmed stable (regression consistency only, not historical accuracy)
  engine_versions: {
    [key: string]: string; // Engine name -> version that produced this output
  };

  // Structured provenance metadata (separate layer documenting source, verification status, and limitations)
  // numerologyConvention is repository-level behavior (documented in PROVENANCE.md) unless explicitly populated here
  provenance?: FixtureProvenance;
}

export interface RegressionTestResult {
  fixtureId: string;
  fixtureName: string;
  engine: string;
  test: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  message?: string;
  timestamp: string;
}

export interface RegressionSummary {
  totalFixtures: number;
  totalTests: number;
  passed: number;
  failed: number;
  passRate: number; // 0-100
  failures: RegressionTestResult[];
  timestamp: string;
}
