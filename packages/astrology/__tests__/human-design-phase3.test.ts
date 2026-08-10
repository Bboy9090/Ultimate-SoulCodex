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
      it('should resolve empty timezone with coordinate lookup', () => {
        // Empty timezone + valid coordinates = coordinate lookup (new policy)
        const result = calculateHumanDesign({
          name: 'Test Person',
          birthDate: '1990-08-15',
          birthTime: '14:30',
          birthLocation: 'New York, NY',
          latitude: '40.7128',
          longitude: '-74.0060',
          timezone: '',
        });

        assert.strictEqual(result.status, 'resolved');
        // Coordinates should resolve via geo-tz lookup
      });

      it('should reject bogus timezone abbreviation', () => {
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

    it('should reject bogus slash timezone (Mars/Olympus)', () => {
      const result = calculateHumanDesign({
        name: 'Test Person',
        birthDate: '1990-08-15',
        birthTime: '14:30',
        birthLocation: 'Mars',
        latitude: '0',
        longitude: '0',
        timezone: 'Mars/Olympus',
      });

      assert.strictEqual(result.status, 'unresolved');
      assert.strictEqual(result.reason, 'invalid_timezone');
    });

    it('should reject bogus slash timezone (Foo/Bar)', () => {
      const result = calculateHumanDesign({
        name: 'Test Person',
        birthDate: '1990-08-15',
        birthTime: '14:30',
        birthLocation: 'Imaginary',
        latitude: '0',
        longitude: '0',
        timezone: 'Foo/Bar',
      });

      assert.strictEqual(result.status, 'unresolved');
      assert.strictEqual(result.reason, 'invalid_timezone');
    });

    it('should accept valid IANA timezone (America/New_York)', () => {
      const result = calculateHumanDesign({
        name: 'Test Person',
        birthDate: '1879-03-14',
        birthTime: '11:30',
        birthLocation: 'Ulm, Germany',
        latitude: '48.4008',
        longitude: '9.9876',
        timezone: 'America/New_York',
      });

      assert.strictEqual(result.status, 'resolved');
    });

    it('should accept valid IANA timezone (Europe/Berlin)', () => {
      const result = calculateHumanDesign({
        name: 'Test Person',
        birthDate: '1879-03-14',
        birthTime: '11:30',
        birthLocation: 'Ulm, Germany',
        latitude: '48.4008',
        longitude: '9.9876',
        timezone: 'Europe/Berlin',
      });

      assert.strictEqual(result.status, 'resolved');
    });
  });

  describe('Timezone Resolution Source Tracking', () => {
    it('should track timezone resolution source for supplied IANA', () => {
      const result = calculateHumanDesignWithEvidence({
        name: 'Test Person',
        birthDate: '1879-03-14',
        birthTime: '11:30',
        birthLocation: 'Ulm, Germany',
        latitude: '48.4008',
        longitude: '9.9876',
        timezone: 'Europe/Berlin',
      });

      assert.strictEqual(result.result?.status, 'resolved');

      // Find activations evidence entry
      const activationsEntry = result.evidence.find(e =>
        e.name === 'Human Design Activations (88° Solar Arc)'
      );

      assert.ok(activationsEntry);
      assert.ok(activationsEntry.metadata?.solar_arc_receipt);
      assert.ok(activationsEntry.metadata?.solar_arc_receipt?.timezoneResolutionSource);
      assert.strictEqual(
        activationsEntry.metadata?.solar_arc_receipt?.timezoneResolutionSource,
        'supplied_iana'
      );
    });

    it('should track timezone resolution source for abbreviation mapping', () => {
      const result = calculateHumanDesignWithEvidence({
        name: 'Test Person',
        birthDate: '1879-03-14',
        birthTime: '11:30',
        birthLocation: 'New York, NY',
        latitude: '40.7128',
        longitude: '-74.0060',
        timezone: 'EST',
      });

      assert.strictEqual(result.result?.status, 'resolved');

      // Find activations evidence entry
      const activationsEntry = result.evidence.find(e =>
        e.name === 'Human Design Activations (88° Solar Arc)'
      );

      assert.ok(activationsEntry);
      assert.ok(activationsEntry.metadata?.solar_arc_receipt);
      assert.strictEqual(
        activationsEntry.metadata?.solar_arc_receipt?.timezoneResolutionSource,
        'abbreviation_mapping'
      );
    });

    it('should track timezone resolution source for coordinate lookup', () => {
      // Empty timezone + valid coordinates = coordinate lookup
      const result = calculateHumanDesignWithEvidence({
        name: 'Test Person',
        birthDate: '1879-03-14',
        birthTime: '11:30',
        birthLocation: 'New York, NY',
        latitude: '40.7128',
        longitude: '-74.0060',
        timezone: '', // Empty timezone triggers coordinate lookup
      });

      assert.strictEqual(result.result?.status, 'resolved');

      // Find activations evidence entry
      const activationsEntry = result.evidence.find(e =>
        e.name === 'Human Design Activations (88° Solar Arc)'
      );

      assert.ok(activationsEntry);
      assert.ok(activationsEntry.metadata?.solar_arc_receipt);
      assert.strictEqual(
        activationsEntry.metadata?.solar_arc_receipt?.timezoneResolutionSource,
        'coordinate_lookup'
      );
    });

    it('should reject bogus timezone even with valid coordinates', () => {
      // Bogus timezone like Mars/Olympus should fail even with good coordinates
      const result = calculateHumanDesign({
        name: 'Test Person',
        birthDate: '1879-03-14',
        birthTime: '11:30',
        birthLocation: 'Mars',
        latitude: '40.7128',
        longitude: '-74.0060',
        timezone: 'Mars/Olympus',
      });

      assert.strictEqual(result.status, 'unresolved');
      assert.strictEqual(result.reason, 'invalid_timezone');
    });
  });

  describe('Solar Arc Evidence Receipt (88° Forensics)', () => {
    it('should include structured solar arc receipt in activations evidence', () => {
      const result = calculateHumanDesignWithEvidence({
        name: 'Albert Einstein',
        birthDate: '1879-03-14',
        birthTime: '11:30',
        birthLocation: 'Ulm, Germany',
        latitude: '48.4008',
        longitude: '9.9876',
        timezone: 'Europe/Berlin',
      });

      assert.strictEqual(result.result?.status, 'resolved');

      // Find activations evidence entry
      const activationsEntry = result.evidence.find(e =>
        e.name === 'Human Design Activations (88° Solar Arc)'
      );

      assert.ok(activationsEntry);
      assert.ok(activationsEntry.metadata?.solar_arc_receipt);

      const receipt = activationsEntry.metadata?.solar_arc_receipt;

      // Check all required fields are present
      assert.ok(typeof receipt?.configuredSolarArc === 'number');
      assert.ok(typeof receipt?.actualSolarArc === 'number');
      assert.ok(typeof receipt?.iterationCount === 'number');
      assert.ok(typeof receipt?.finalSearchWindowDays === 'number');
      assert.ok(typeof receipt?.finalToleranceDays === 'number');
      assert.ok(typeof receipt?.resolvedTimezone === 'string');
      assert.ok(typeof receipt?.timezoneResolutionSource === 'string');
      assert.ok(typeof receipt?.algorithmId === 'string');
      assert.ok(typeof receipt?.algorithmVersion === 'string');
    });

    it('should have configured arc equal to 87.975', () => {
      const result = calculateHumanDesignWithEvidence({
        name: 'Albert Einstein',
        birthDate: '1879-03-14',
        birthTime: '11:30',
        birthLocation: 'Ulm, Germany',
        latitude: '48.4008',
        longitude: '9.9876',
        timezone: 'Europe/Berlin',
      });

      const activationsEntry = result.evidence.find(e =>
        e.name === 'Human Design Activations (88° Solar Arc)'
      );

      const receipt = activationsEntry?.metadata?.solar_arc_receipt;
      assert.strictEqual(receipt?.configuredSolarArc, 87.975);
    });

    it('should have actual arc within tolerance', () => {
      const result = calculateHumanDesignWithEvidence({
        name: 'Albert Einstein',
        birthDate: '1879-03-14',
        birthTime: '11:30',
        birthLocation: 'Ulm, Germany',
        latitude: '48.4008',
        longitude: '9.9876',
        timezone: 'Europe/Berlin',
      });

      const activationsEntry = result.evidence.find(e =>
        e.name === 'Human Design Activations (88° Solar Arc)'
      );

      const receipt = activationsEntry?.metadata?.solar_arc_receipt;

      // Actual arc should be close to configured (87.975)
      assert.ok(receipt?.actualSolarArc !== undefined);
      const difference = Math.abs((receipt?.actualSolarArc || 0) - 87.975);
      assert.ok(difference < 1, `Arc difference ${difference} should be less than 1 degree`);
    });

    it('should have iteration count within bounds', () => {
      const result = calculateHumanDesignWithEvidence({
        name: 'Albert Einstein',
        birthDate: '1879-03-14',
        birthTime: '11:30',
        birthLocation: 'Ulm, Germany',
        latitude: '48.4008',
        longitude: '9.9876',
        timezone: 'Europe/Berlin',
      });

      const activationsEntry = result.evidence.find(e =>
        e.name === 'Human Design Activations (88° Solar Arc)'
      );

      const receipt = activationsEntry?.metadata?.solar_arc_receipt;

      // Iteration count should be positive and less than max iterations (20)
      assert.ok((receipt?.iterationCount ?? 0) > 0);
      assert.ok((receipt?.iterationCount ?? 0) < 20);
    });

    it('should have positive search window and tolerance', () => {
      const result = calculateHumanDesignWithEvidence({
        name: 'Albert Einstein',
        birthDate: '1879-03-14',
        birthTime: '11:30',
        birthLocation: 'Ulm, Germany',
        latitude: '48.4008',
        longitude: '9.9876',
        timezone: 'Europe/Berlin',
      });

      const activationsEntry = result.evidence.find(e =>
        e.name === 'Human Design Activations (88° Solar Arc)'
      );

      const receipt = activationsEntry?.metadata?.solar_arc_receipt;

      // Search window should be positive
      assert.ok((receipt?.finalSearchWindowDays ?? 0) > 0);
      // Tolerance should be positive and less than window
      assert.ok((receipt?.finalToleranceDays ?? 0) > 0);
      assert.ok(
        (receipt?.finalToleranceDays ?? 0) <= (receipt?.finalSearchWindowDays ?? 0),
        'Tolerance should not exceed search window'
      );
    });

    it('should have correct algorithm metadata', () => {
      const result = calculateHumanDesignWithEvidence({
        name: 'Albert Einstein',
        birthDate: '1879-03-14',
        birthTime: '11:30',
        birthLocation: 'Ulm, Germany',
        latitude: '48.4008',
        longitude: '9.9876',
        timezone: 'Europe/Berlin',
      });

      const activationsEntry = result.evidence.find(e =>
        e.name === 'Human Design Activations (88° Solar Arc)'
      );

      const receipt = activationsEntry?.metadata?.solar_arc_receipt;

      assert.strictEqual(receipt?.algorithmId, 'human-design.design-solar-arc');
      assert.strictEqual(receipt?.algorithmVersion, '1.0.0');
    });

    it('should have resolved timezone in receipt', () => {
      const result = calculateHumanDesignWithEvidence({
        name: 'Albert Einstein',
        birthDate: '1879-03-14',
        birthTime: '11:30',
        birthLocation: 'Ulm, Germany',
        latitude: '48.4008',
        longitude: '9.9876',
        timezone: 'Europe/Berlin',
      });

      const activationsEntry = result.evidence.find(e =>
        e.name === 'Human Design Activations (88° Solar Arc)'
      );

      const receipt = activationsEntry?.metadata?.solar_arc_receipt;

      assert.strictEqual(receipt?.resolvedTimezone, 'Europe/Berlin');
    });
  });
});
