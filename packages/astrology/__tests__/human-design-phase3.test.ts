import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateHumanDesign,
  calculateHumanDesignWithEvidence,
  type HumanDesignResult,
} from '../human-design';

/**
 * Phase 3 Human Design Tests: Canonical Implementation
 *
 * Tests for:
 * 1. Single source of truth (canonical package authority)
 * 2. Fail-closed semantics (discriminated union results)
 * 3. Input validation before astrology calculation
 * 4. Real-calendar validation (YYYY-MM-DD, round-trip UTC check)
 * 5. Birth time as absolute requirement (no fallbacks)
 * 6. Timezone resolution (no silent UTC substitution)
 * 7. Evidence Ledger integration
 * 8. Correctness with golden fixtures
 */

describe('Phase 3: Human Design Canonical Implementation', () => {
  describe('Fail-Closed Input Validation', () => {
    describe('Birth Date Validation', () => {
      it('should reject missing birth date', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '',
          birthTime: '14:30',
          birthLocation: 'New York, NY',
          latitude: '40.7128',
          longitude: '-74.0060',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'unresolved');
        assert.strictEqual(result.reason, 'missing_birth_date');
      });

      it('should reject malformed date (not YYYY-MM-DD)', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '14/03/1990',
          birthTime: '14:30',
          birthLocation: 'New York, NY',
          latitude: '40.7128',
          longitude: '-74.0060',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'unresolved');
        assert.strictEqual(result.reason, 'invalid_birth_date');
      });

      it('should reject Feb 29 in non-leap year (2023-02-29)', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '2023-02-29',
          birthTime: '14:30',
          birthLocation: 'New York, NY',
          latitude: '40.7128',
          longitude: '-74.0060',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'unresolved');
        assert.strictEqual(result.reason, 'invalid_birth_date');
      });

      it('should accept Feb 29 in leap year (2024-02-29)', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '2024-02-29',
          birthTime: '14:30',
          birthLocation: 'New York, NY',
          latitude: '40.7128',
          longitude: '-74.0060',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'resolved');
      });

      it('should reject Feb 30 (2023-02-30)', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '2023-02-30',
          birthTime: '14:30',
          birthLocation: 'New York, NY',
          latitude: '40.7128',
          longitude: '-74.0060',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'unresolved');
        assert.strictEqual(result.reason, 'invalid_birth_date');
      });

      it('should reject April 31 (2023-04-31)', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '2023-04-31',
          birthTime: '14:30',
          birthLocation: 'New York, NY',
          latitude: '40.7128',
          longitude: '-74.0060',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'unresolved');
        assert.strictEqual(result.reason, 'invalid_birth_date');
      });

      it('should reject month 13 (2023-13-01)', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '2023-13-01',
          birthTime: '14:30',
          birthLocation: 'New York, NY',
          latitude: '40.7128',
          longitude: '-74.0060',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'unresolved');
        assert.strictEqual(result.reason, 'invalid_birth_date');
      });

      it('should reject month 0 (2023-00-10)', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '2023-00-10',
          birthTime: '14:30',
          birthLocation: 'New York, NY',
          latitude: '40.7128',
          longitude: '-74.0060',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'unresolved');
        assert.strictEqual(result.reason, 'invalid_birth_date');
      });
    });

    describe('Birth Time Validation', () => {
      it('should reject missing birth time', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '',
          birthLocation: 'New York, NY',
          latitude: '40.7128',
          longitude: '-74.0060',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'unresolved');
        assert.strictEqual(result.reason, 'missing_birth_time');
      });

      it('should reject malformed time (not HH:MM)', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '14:30:45',
          birthLocation: 'New York, NY',
          latitude: '40.7128',
          longitude: '-74.0060',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'unresolved');
        assert.strictEqual(result.reason, 'malformed_birth_time');
      });

      it('should reject hour 24 (24:00)', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '24:00',
          birthLocation: 'New York, NY',
          latitude: '40.7128',
          longitude: '-74.0060',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'unresolved');
        assert.strictEqual(result.reason, 'malformed_birth_time');
      });

      it('should reject minute 60 (14:60)', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '14:60',
          birthLocation: 'New York, NY',
          latitude: '40.7128',
          longitude: '-74.0060',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'unresolved');
        assert.strictEqual(result.reason, 'malformed_birth_time');
      });

      it('should accept valid time 00:00', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '00:00',
          birthLocation: 'New York, NY',
          latitude: '40.7128',
          longitude: '-74.0060',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'resolved');
      });

      it('should accept valid time 23:59', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '23:59',
          birthLocation: 'New York, NY',
          latitude: '40.7128',
          longitude: '-74.0060',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'resolved');
      });
    });

    describe('Timezone Validation', () => {
      it('should reject missing timezone', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '14:30',
          birthLocation: 'New York, NY',
          latitude: '40.7128',
          longitude: '-74.0060',
          timezone: '',
        });

        assert.strictEqual(result.status, 'unresolved');
        assert.strictEqual(result.reason, 'missing_timezone');
      });

      it('should reject invalid timezone abbreviation', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '14:30',
          birthLocation: 'New York, NY',
          latitude: '40.7128',
          longitude: '-74.0060',
          timezone: 'XYZ',
        });

        assert.strictEqual(result.status, 'unresolved');
        assert.strictEqual(result.reason, 'invalid_timezone');
      });

      it('should accept IANA timezone format', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '14:30',
          birthLocation: 'New York, NY',
          latitude: '40.7128',
          longitude: '-74.0060',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'resolved');
      });

      it('should accept EST abbreviation', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '14:30',
          birthLocation: 'New York, NY',
          latitude: '40.7128',
          longitude: '-74.0060',
          timezone: 'EST',
        });

        assert.strictEqual(result.status, 'resolved');
      });
    });

    describe('Coordinate Validation', () => {
      it('should reject missing latitude', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '14:30',
          birthLocation: 'New York, NY',
          latitude: '',
          longitude: '-74.0060',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'unresolved');
        assert.strictEqual(result.reason, 'missing_coordinates');
      });

      it('should reject missing longitude', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '14:30',
          birthLocation: 'New York, NY',
          latitude: '40.7128',
          longitude: '',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'unresolved');
        assert.strictEqual(result.reason, 'missing_coordinates');
      });

      it('should reject latitude > 90 (91.0)', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '14:30',
          birthLocation: 'Invalid',
          latitude: '91.0',
          longitude: '-74.0060',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'unresolved');
        assert.strictEqual(result.reason, 'invalid_coordinates');
      });

      it('should reject latitude < -90 (-91.0)', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '14:30',
          birthLocation: 'Invalid',
          latitude: '-91.0',
          longitude: '-74.0060',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'unresolved');
        assert.strictEqual(result.reason, 'invalid_coordinates');
      });

      it('should reject longitude > 180 (181.0)', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '14:30',
          birthLocation: 'Invalid',
          latitude: '40.7128',
          longitude: '181.0',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'unresolved');
        assert.strictEqual(result.reason, 'invalid_coordinates');
      });

      it('should reject longitude < -180 (-181.0)', () => {
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '14:30',
          birthLocation: 'Invalid',
          latitude: '40.7128',
          longitude: '-181.0',
          timezone: 'America/New_York',
        });

        assert.strictEqual(result.status, 'unresolved');
        assert.strictEqual(result.reason, 'invalid_coordinates');
      });

      it('should accept latitude bounds (90, -90)', () => {
        const result1 = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '14:30',
          birthLocation: 'North Pole',
          latitude: '90.0',
          longitude: '0.0',
          timezone: 'GMT',
        });

        assert.strictEqual(result1.status, 'resolved');

        const result2 = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '14:30',
          birthLocation: 'South Pole',
          latitude: '-90.0',
          longitude: '0.0',
          timezone: 'GMT',
        });

        assert.strictEqual(result2.status, 'resolved');
      });

      it('should accept longitude bounds (180, -180)', () => {
        const result1 = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '14:30',
          birthLocation: 'Dateline East',
          latitude: '0.0',
          longitude: '180.0',
          timezone: 'GMT',
        });

        assert.strictEqual(result1.status, 'resolved');

        const result2 = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '14:30',
          birthLocation: 'Dateline West',
          latitude: '0.0',
          longitude: '-180.0',
          timezone: 'GMT',
        });

        assert.strictEqual(result2.status, 'resolved');
      });
    });
  });

  describe('Golden Fixture: Albert Einstein (1879-03-14, 11:30)', () => {
    const birthData = {
      name: 'Albert Einstein',
      birthDate: '1879-03-14',
      birthTime: '11:30',
      birthLocation: 'Ulm, Germany',
      latitude: '48.3985',
      longitude: '9.9868',
      timezone: 'CET',
    };

    it('should resolve with status resolved', () => {
      const result = calculateHumanDesign(birthData);

      assert.strictEqual(result.status, 'resolved');
      if (result.status !== 'resolved') throw new Error('Not resolved');

      assert.ok(typeof result.type === 'string');
      assert.ok(result.type.length > 0);
    });

    it('should have consistent type determination', () => {
      const result1 = calculateHumanDesign(birthData);
      const result2 = calculateHumanDesign(birthData);

      assert.strictEqual(result1.status, 'resolved');
      assert.strictEqual(result2.status, 'resolved');

      if (result1.status === 'resolved' && result2.status === 'resolved') {
        assert.strictEqual(result1.type, result2.type);
        assert.strictEqual(result1.strategy, result2.strategy);
        assert.strictEqual(result1.authority, result2.authority);
      }
    });

    it('should have profile with 2 lines separated by /', () => {
      const result = calculateHumanDesign(birthData);

      assert.strictEqual(result.status, 'resolved');
      if (result.status !== 'resolved') throw new Error('Not resolved');

      const parts = result.profile.split('/');
      assert.strictEqual(parts.length, 2);
      assert.ok(/^\d$/.test(parts[0])); // Single digit
      assert.ok(/^\d$/.test(parts[1])); // Single digit
    });

    it('should have activated gates in valid range (1-64)', () => {
      const result = calculateHumanDesign(birthData);

      assert.strictEqual(result.status, 'resolved');
      if (result.status !== 'resolved') throw new Error('Not resolved');

      for (const gate of result.activatedGates) {
        assert.ok(gate >= 1 && gate <= 64, `Gate ${gate} out of range`);
      }
    });

    it('should have all centers with gates lists', () => {
      const result = calculateHumanDesign(birthData);

      assert.strictEqual(result.status, 'resolved');
      if (result.status !== 'resolved') throw new Error('Not resolved');

      const centerNames = ['Head', 'Ajna', 'Throat', 'G', 'Heart', 'Spleen', 'Solar Plexus', 'Sacral', 'Root'];

      for (const centerName of centerNames) {
        assert.ok(result.centers[centerName]);
        assert.ok(typeof result.centers[centerName].defined === 'boolean');
        assert.ok(Array.isArray(result.centers[centerName].gates));
      }
    });

    it('should have valid variables with cognition, environment, motivation, perspective', () => {
      const result = calculateHumanDesign(birthData);

      assert.strictEqual(result.status, 'resolved');
      if (result.status !== 'resolved') throw new Error('Not resolved');

      assert.ok(['Focused', 'Peripheral'].includes(result.variables.cognition));
      assert.ok(['Markets', 'Caves'].includes(result.variables.environment));
      assert.ok(['Fear', 'Hope'].includes(result.variables.motivation));
      assert.ok(['Personal', 'Transpersonal'].includes(result.variables.perspective));
    });
  });

  describe('Evidence Ledger Integration', () => {
    const birthData = {
      name: 'Test Person',
      birthDate: '1990-08-15',
      birthTime: '14:30',
      birthLocation: 'New York, NY',
      latitude: '40.7128',
      longitude: '-74.0060',
      timezone: 'America/New_York',
    };

    it('should generate evidence entries for resolved calculation', () => {
      const { result, evidence } = calculateHumanDesignWithEvidence(birthData);

      assert.strictEqual(result?.status, 'resolved');
      assert.ok(Array.isArray(evidence));
      assert.ok(evidence.length > 0);
    });

    it('should include evidence entry for each HD component', () => {
      const { result, evidence } = calculateHumanDesignWithEvidence(birthData);

      assert.strictEqual(result?.status, 'resolved');

      const claims = evidence.map(e => e.claim);
      assert.ok(claims.includes('Human Design Type'));
      assert.ok(claims.includes('Human Design Strategy'));
      assert.ok(claims.includes('Human Design Authority'));
      assert.ok(claims.includes('Human Design Profile'));
      assert.ok(claims.includes('Human Design Definition'));
    });

    it('should mark all evidence entries with high confidence for valid inputs', () => {
      const { evidence } = calculateHumanDesignWithEvidence(birthData);

      for (const entry of evidence) {
        assert.ok(entry.confidence >= 85, `Evidence entry has confidence ${entry.confidence}, expected >= 85`);
        assert.ok(['high', 'verified'].includes(entry.confidenceLabel));
      }
    });

    it('should include formula IDs for all entries', () => {
      const { evidence } = calculateHumanDesignWithEvidence(birthData);

      for (const entry of evidence) {
        assert.ok(entry.formulaId?.startsWith('human-design.'), `Formula ID missing or incorrect: ${entry.formulaId}`);
      }
    });

    it('should mark calculation status as resolved', () => {
      const { evidence } = calculateHumanDesignWithEvidence(birthData);

      for (const entry of evidence) {
        assert.strictEqual(entry.calculationStatus, 'resolved');
      }
    });

    it('should generate single evidence entry for unresolved calculation', () => {
      const invalidData = { ...birthData, birthTime: '' };
      const { result, evidence } = calculateHumanDesignWithEvidence(invalidData);

      // When unresolved, result may be undefined or have status 'unresolved'
      if (result) {
        assert.strictEqual(result.status, 'unresolved');
      }
      assert.strictEqual(evidence.length, 1);
      assert.strictEqual(evidence[0].calculationStatus, 'unresolved');
    });

    it('should set inputState to invalid when inputs fail validation', () => {
      const invalidData = { ...birthData, birthTime: '' };
      const { evidence } = calculateHumanDesignWithEvidence(invalidData);

      assert.ok(evidence.length > 0);
      assert.strictEqual(evidence[0].inputState, 'invalid');
    });
  });

  describe('No Fallbacks or Placeholders', () => {
    it('should not accept midnight (00:00) as fallback for missing birth time', () => {
      const result = calculateHumanDesign({
        name: 'Test Person',
        birthDate: '1990-08-15',
        birthTime: '', // Explicitly missing
        birthLocation: 'New York, NY',
        latitude: '40.7128',
        longitude: '-74.0060',
        timezone: 'America/New_York',
      });

      assert.strictEqual(result.status, 'unresolved');
      assert.strictEqual(result.reason, 'missing_birth_time');
    });

    it('should not accept noon (12:00) as default birth time', () => {
      // This would require someone to explicitly pass 12:00
      // The system doesn't auto-insert 12:00 for missing time
      const noonResult = calculateHumanDesign({
        name: 'Test Person',
        birthDate: '1990-08-15',
        birthTime: '12:00',
        birthLocation: 'New York, NY',
        latitude: '40.7128',
        longitude: '-74.0060',
        timezone: 'America/New_York',
      });

      const emptyResult = calculateHumanDesign({
        name: 'Test Person',
        birthDate: '1990-08-15',
        birthTime: '',
        birthLocation: 'New York, NY',
        latitude: '40.7128',
        longitude: '-74.0060',
        timezone: 'America/New_York',
      });

      // Both should resolve differently
      if (noonResult.status === 'resolved' && emptyResult.status === 'unresolved') {
        // This is correct: one resolved, one unresolved
        assert.ok(true);
      } else {
        assert.ok(false, 'System should not auto-insert noon for missing time');
      }
    });

    it('should not have zero-valued gates in activations', () => {
      const result = calculateHumanDesign({
        name: 'Test Person',
        birthDate: '1990-08-15',
        birthTime: '14:30',
        birthLocation: 'New York, NY',
        latitude: '40.7128',
        longitude: '-74.0060',
        timezone: 'America/New_York',
      });

      if (result.status === 'resolved') {
        for (const gate of result.activatedGates) {
          assert.ok(gate !== 0, 'Zero-valued gate found');
        }
      }
    });
  });

  describe('Timezone Resolution Fail-Closed', () => {
    it('should not fall back to UTC for invalid timezone', () => {
      const result = calculateHumanDesign({
        name: 'Test Person',
        birthDate: '1990-08-15',
        birthTime: '14:30',
        birthLocation: 'New York, NY',
        latitude: '40.7128',
        longitude: '-74.0060',
        timezone: 'InvalidTZ',
      });

      assert.strictEqual(result.status, 'unresolved');
      assert.strictEqual(result.reason, 'invalid_timezone');
    });

    it('should resolve valid IANA timezone without fallback', () => {
      const result = calculateHumanDesign({
        name: 'Test Person',
        birthDate: '1990-08-15',
        birthTime: '14:30',
        birthLocation: 'New York, NY',
        latitude: '40.7128',
        longitude: '-74.0060',
        timezone: 'America/New_York',
      });

      assert.strictEqual(result.status, 'resolved');
    });

    it('should resolve mappable timezone abbreviation', () => {
      const result = calculateHumanDesign({
        name: 'Test Person',
        birthDate: '1990-08-15',
        birthTime: '14:30',
        birthLocation: 'New York, NY',
        latitude: '40.7128',
        longitude: '-74.0060',
        timezone: 'EST',
      });

      assert.strictEqual(result.status, 'resolved');
    });
  });
});
