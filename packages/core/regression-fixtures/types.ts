/**
 * Regression Fixture Types
 *
 * Canonical test data for ensuring Soul Codex calculations remain stable.
 * Each fixture represents a verified, historical chart used to detect regressions.
 */

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
  timeVerified: 'exact' | 'estimated' | 'unknown';
  source: string; // Where this data came from (verified source)
  notes: string; // Context for this fixture

  // Expected outputs (locked in as "correct")
  expected: {
    personalNumbers: PersonalNumbers;
    astrology: AstrologyData;
    humanDesign: HumanDesignData;
    // Additional fields can be added as engines expand
  };

  // Metadata
  createdAt: string; // When this fixture was created
  lastVerified: string; // When this fixture was last confirmed correct
  engine_versions: {
    [key: string]: string; // Engine name -> version that produced this output
  };
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
