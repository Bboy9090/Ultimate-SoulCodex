import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { calculateAstrology } from '../astrology';
import { getVerifiedPlacement } from '../../../client/src/lib/placementVerification';
import type { BirthData } from '@soulcodex/core';
import type { VerificationState } from '../../../client/src/lib/placementVerification';

describe('Astrology Evidence Integration - Phase 1', () => {
  describe('Placement Creation (Canonical Types)', () => {
    const birthDataComplete: BirthData = {
      name: 'Test Person',
      birthDate: '1990-05-15',
      birthTime: '14:30',
      timezone: 'America/New_York',
      latitude: 40.7128,
      longitude: -74.0060,
    };

    test('should create placements with canonical VerificationState', () => {
      const result = calculateAstrology(birthDataComplete);

      assert.ok(result.placements, 'placements should be defined');
      assert.ok(result.placements?.sun, 'sun placement should be defined');
      assert.ok(result.placements?.moon, 'moon placement should be defined');
      assert.ok(result.placements?.rising, 'rising placement should be defined');
    });

    test('should set sun sign and verification state', () => {
      const result = calculateAstrology(birthDataComplete);
      const sunPlacement = result.placements?.sun;

      assert.equal(sunPlacement?.sign, result.sunSign, 'placement sign should match result sunSign');
      assert.equal(sunPlacement?.verificationStatus, 'calculated', 'sun verification state should be calculated');
    });

    test('should set moon sign and verification state', () => {
      const result = calculateAstrology(birthDataComplete);
      const moonPlacement = result.placements?.moon;

      assert.equal(moonPlacement?.sign, result.moonSign, 'placement sign should match result moonSign');
      assert.equal(moonPlacement?.verificationStatus, 'calculated', 'moon verification state should be calculated');
    });

    test('should set rising sign and verification state', () => {
      const result = calculateAstrology(birthDataComplete);
      const risingPlacement = result.placements?.rising;

      assert.equal(risingPlacement?.sign, result.risingSign, 'placement sign should match result risingSign');
      assert.equal(risingPlacement?.verificationStatus, 'calculated', 'rising verification state should be calculated');
    });
  });

  describe('Astrology Semantics: Sun Placement', () => {
    test('sun requires only birth date (no time dependency)', () => {
      const birthDataNoTime: BirthData = {
        name: 'Test Person',
        birthDate: '1990-05-15',
        birthTime: undefined,
        timezone: 'America/New_York',
        latitude: 40.7128,
        longitude: -74.0060,
      };

      const result = calculateAstrology(birthDataNoTime);
      const sunPlacement = result.placements?.sun;

      assert.equal(sunPlacement?.verificationStatus, 'calculated', 'sun should be calculated even without birth time');
      assert.ok(sunPlacement?.sign, 'sun sign should be calculated');
    });

    test('sun never sets requires_verified_birth_time', () => {
      const birthDataNoTime: BirthData = {
        name: 'Test Person',
        birthDate: '1990-05-15',
        birthTime: undefined,
        timezone: 'America/New_York',
        latitude: 40.7128,
        longitude: -74.0060,
      };

      const result = calculateAstrology(birthDataNoTime);
      const sunPlacement = result.placements?.sun;

      assert.notEqual(sunPlacement?.verificationStatus, 'requires_verified_birth_time', 'sun should never require birth time');
    });
  });

  describe('Astrology Semantics: Moon Placement', () => {
    test('moon requires exact birth time', () => {
      const birthDataNoTime: BirthData = {
        name: 'Test Person',
        birthDate: '1990-05-15',
        birthTime: undefined,
        timezone: 'America/New_York',
        latitude: 40.7128,
        longitude: -74.0060,
      };

      const result = calculateAstrology(birthDataNoTime);
      const moonPlacement = result.placements?.moon;

      assert.equal(moonPlacement?.verificationStatus, 'requires_verified_birth_time', 'moon should require verified birth time when time missing');
    });

    test('moon is calculated when exact time provided', () => {
      const birthDataComplete: BirthData = {
        name: 'Test Person',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        timezone: 'America/New_York',
        latitude: 40.7128,
        longitude: -74.0060,
      };

      const result = calculateAstrology(birthDataComplete);
      const moonPlacement = result.placements?.moon;

      assert.equal(moonPlacement?.verificationStatus, 'calculated', 'moon should be calculated with exact time');
    });

    test('moon location is optional', () => {
      const birthDataNoLocation: BirthData = {
        name: 'Test Person',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        timezone: 'America/New_York',
        latitude: undefined,
        longitude: undefined,
      };

      const result = calculateAstrology(birthDataNoLocation);
      const moonPlacement = result.placements?.moon;

      assert.equal(moonPlacement?.verificationStatus, 'calculated', 'moon should be calculated even without location if time is available');
    });
  });

  describe('Astrology Semantics: Rising (Ascendant) Placement', () => {
    test('rising requires both exact birth time and location', () => {
      const birthDataNoTime: BirthData = {
        name: 'Test Person',
        birthDate: '1990-05-15',
        birthTime: undefined,
        timezone: 'America/New_York',
        latitude: 40.7128,
        longitude: -74.0060,
      };

      const result = calculateAstrology(birthDataNoTime);
      const risingPlacement = result.placements?.rising;

      assert.equal(risingPlacement?.verificationStatus, 'requires_verified_birth_time', 'rising should require verified birth time when time missing');
    });

    test('rising requires location when time provided', () => {
      const birthDataNoLocation: BirthData = {
        name: 'Test Person',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        timezone: 'America/New_York',
        latitude: undefined,
        longitude: undefined,
      };

      const result = calculateAstrology(birthDataNoLocation);
      const risingPlacement = result.placements?.rising;

      assert.equal(risingPlacement?.verificationStatus, 'requires_location', 'rising should require location when time available but location missing');
    });

    test('rising is calculated with complete data (time + location)', () => {
      const birthDataComplete: BirthData = {
        name: 'Test Person',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        timezone: 'America/New_York',
        latitude: 40.7128,
        longitude: -74.0060,
      };

      const result = calculateAstrology(birthDataComplete);
      const risingPlacement = result.placements?.rising;

      assert.equal(risingPlacement?.verificationStatus, 'calculated', 'rising should be calculated with time and location');
    });
  });

  describe('Evidence Structure (Canonical PlacementEvidence)', () => {
    const birthDataComplete: BirthData = {
      name: 'Test Person',
      birthDate: '1990-05-15',
      birthTime: '14:30',
      timezone: 'America/New_York',
      latitude: 40.7128,
      longitude: -74.0060,
    };

    test('should record engine information in evidence', () => {
      const result = calculateAstrology(birthDataComplete);
      const sunEvidence = result.placements?.sun?.evidence;

      assert.equal(sunEvidence?.source, 'user-provided-birth-data', 'source should be user-provided-birth-data');
      assert.equal(sunEvidence?.engine, 'astronomy-engine', 'engine should be astronomy-engine');
      assert.ok(sunEvidence?.calculatedAt, 'calculatedAt should be defined');
    });

    test('should record calculation timestamp', () => {
      const beforeCalc = new Date();
      const result = calculateAstrology(birthDataComplete);
      const afterCalc = new Date();

      const moonEvidence = result.placements?.moon?.evidence;
      assert.ok(moonEvidence?.calculatedAt, 'calculatedAt should be defined');

      if (moonEvidence?.calculatedAt) {
        const calcTime = new Date(moonEvidence.calculatedAt);
        assert.ok(calcTime.getTime() >= beforeCalc.getTime(), 'calcTime should be >= beforeCalc');
        assert.ok(calcTime.getTime() <= afterCalc.getTime(), 'calcTime should be <= afterCalc');
      }
    });

    test('should have optional confidence (not mandatory)', () => {
      const result = calculateAstrology(birthDataComplete);
      const sunEvidence = result.placements?.sun?.evidence;

      // Confidence is optional per canonical type
      // It should not be present at placement level
      assert.equal(sunEvidence?.confidence, undefined, 'confidence should be optional and undefined at placement level');
    });
  });

  describe('Verification Boundary (getVerifiedPlacement)', () => {
    const birthDataComplete: BirthData = {
      name: 'Test Person',
      birthDate: '1990-05-15',
      birthTime: '14:30',
      timezone: 'America/New_York',
      latitude: 40.7128,
      longitude: -74.0060,
    };

    test('getVerifiedPlacement rejects calculated state', () => {
      const result = calculateAstrology(birthDataComplete);
      const sunPlacement = result.placements?.sun;

      assert.equal(sunPlacement?.verificationStatus, 'calculated', 'sun should be in calculated state');
      const verifiedPlacement = getVerifiedPlacement(sunPlacement);
      assert.equal(verifiedPlacement, null, 'getVerifiedPlacement should reject calculated state');
    });

    test('getVerifiedPlacement accepts only verified state', () => {
      const verifiedPlacement = getVerifiedPlacement({
        sign: 'Taurus',
        verificationStatus: 'verified',
        evidence: {
          source: 'user-provided-birth-data',
          engine: 'astronomy-engine',
          calculatedAt: new Date().toISOString(),
        },
      });

      assert.ok(verifiedPlacement, 'getVerifiedPlacement should accept verified state with evidence');
      assert.equal(verifiedPlacement?.sign, 'Taurus', 'verified placement should have correct sign');
    });
  });

  describe('Reproducibility (Determinism)', () => {
    const birthData: BirthData = {
      name: 'Test Person',
      birthDate: '1990-05-15',
      birthTime: '14:30',
      timezone: 'America/New_York',
      latitude: 40.7128,
      longitude: -74.0060,
    };

    test('same input should produce same zodiac signs', () => {
      const result1 = calculateAstrology(birthData);
      const result2 = calculateAstrology(birthData);

      assert.equal(result1.sunSign, result2.sunSign, 'sunSign should be same');
      assert.equal(result1.moonSign, result2.moonSign, 'moonSign should be same');
      assert.equal(result1.risingSign, result2.risingSign, 'risingSign should be same');
    });

    test('same input should produce same verification states', () => {
      const result1 = calculateAstrology(birthData);
      const result2 = calculateAstrology(birthData);

      assert.equal(result1.placements?.sun?.verificationStatus, result2.placements?.sun?.verificationStatus, 'sun verificationStatus should be same');
      assert.equal(result1.placements?.moon?.verificationStatus, result2.placements?.moon?.verificationStatus, 'moon verificationStatus should be same');
      assert.equal(result1.placements?.rising?.verificationStatus, result2.placements?.rising?.verificationStatus, 'rising verificationStatus should be same');
    });
  });

  describe('Storage Integration (Round-trip)', () => {
    const birthDataComplete: BirthData = {
      name: 'Test Person',
      birthDate: '1990-05-15',
      birthTime: '14:30',
      timezone: 'America/New_York',
      latitude: 40.7128,
      longitude: -74.0060,
    };

    test('placements should survive serialization/deserialization', () => {
      const result = calculateAstrology(birthDataComplete);
      const placements = result.placements;

      // Simulate storage round-trip
      const serialized = JSON.stringify(placements);
      const deserialized = JSON.parse(serialized);

      assert.equal(deserialized.sun?.sign, placements?.sun?.sign, 'sun sign should survive round-trip');
      assert.equal(deserialized.sun?.verificationStatus, placements?.sun?.verificationStatus, 'sun state should survive round-trip');
      assert.equal(deserialized.moon?.sign, placements?.moon?.sign, 'moon sign should survive round-trip');
      assert.equal(deserialized.rising?.sign, placements?.rising?.sign, 'rising sign should survive round-trip');
    });

    test('verification state must not be promoted during load', () => {
      const result = calculateAstrology(birthDataComplete);
      const sunPlacement = result.placements?.sun;

      // Simulate loading from storage
      const storedPlacement = JSON.parse(JSON.stringify(sunPlacement));

      // State should remain calculated, not become verified
      assert.equal(storedPlacement.verificationStatus, 'calculated', 'calculated state should not be promoted at load time');
    });
  });
});
