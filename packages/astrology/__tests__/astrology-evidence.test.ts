import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { calculateAstrology } from '../astrology';
import type { BirthData } from '@soulcodex/core';

describe('Astrology Evidence Integration - Phase 1', () => {
  describe('Evidence Population', () => {
    const birthDataComplete: BirthData = {
      name: 'Test Person',
      birthDate: '1990-05-15',
      birthTime: '14:30',
      timezone: 'America/New_York',
      latitude: 40.7128,
      longitude: -74.0060,
    };

    test('should populate evidence for all three placements (sun, moon, rising)', () => {
      const result = calculateAstrology(birthDataComplete);

      assert.ok(result.evidence, 'evidence should be defined');
      assert.ok(result.evidence?.sun, 'sun evidence should be defined');
      assert.ok(result.evidence?.moon, 'moon evidence should be defined');
      assert.ok(result.evidence?.rising, 'rising evidence should be defined');
    });

    test('should set sun sign correctly with evidence', () => {
      const result = calculateAstrology(birthDataComplete);

      assert.ok(result.sunSign, 'sunSign should be defined');
      assert.equal(result.evidence?.sun?.sign, result.sunSign, 'evidence sun sign should match result sun sign');
      assert.equal(result.evidence?.sun?.verificationStatus, 'unresolved', 'verification status should be unresolved');
      assert.equal(result.evidence?.sun?.calculationStatus, 'deterministic', 'calculation status should be deterministic');
    });

    test('should set moon sign correctly with evidence', () => {
      const result = calculateAstrology(birthDataComplete);

      assert.ok(result.moonSign, 'moonSign should be defined');
      assert.equal(result.evidence?.moon?.sign, result.moonSign, 'evidence moon sign should match result moon sign');
      assert.equal(result.evidence?.moon?.verificationStatus, 'unresolved', 'verification status should be unresolved');
      assert.equal(result.evidence?.moon?.calculationStatus, 'deterministic', 'calculation status should be deterministic');
    });

    test('should set rising sign correctly with evidence', () => {
      const result = calculateAstrology(birthDataComplete);

      assert.ok(result.risingSign, 'risingSign should be defined');
      assert.equal(result.evidence?.rising?.sign, result.risingSign, 'evidence rising sign should match result rising sign');
      assert.equal(result.evidence?.rising?.verificationStatus, 'unresolved', 'verification status should be unresolved');
      assert.equal(result.evidence?.rising?.calculationStatus, 'deterministic', 'calculation status should be deterministic');
    });
  });

  describe('Time Sensitivity', () => {
    const birthDataComplete: BirthData = {
      name: 'Test Person',
      birthDate: '1990-05-15',
      birthTime: '14:30',
      timezone: 'America/New_York',
      latitude: 40.7128,
      longitude: -74.0060,
    };

    test('sun should not be time-sensitive', () => {
      const result = calculateAstrology(birthDataComplete);
      assert.equal(result.evidence?.sun?.timeSensitive, false, 'sun should not be time-sensitive');
    });

    test('moon should be time-sensitive', () => {
      const result = calculateAstrology(birthDataComplete);
      assert.equal(result.evidence?.moon?.timeSensitive, true, 'moon should be time-sensitive');
    });

    test('rising should be time-sensitive', () => {
      const result = calculateAstrology(birthDataComplete);
      assert.equal(result.evidence?.rising?.timeSensitive, true, 'rising should be time-sensitive');
    });
  });

  describe('Confidence Levels', () => {
    test('should have HIGH confidence with complete birth data (time + location)', () => {
      const birthData: BirthData = {
        name: 'Test Person',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        timezone: 'America/New_York',
        latitude: 40.7128,
        longitude: -74.0060,
      };

      const result = calculateAstrology(birthData);

      assert.equal(result.evidence?.sun?.confidence, 'high', 'sun confidence should be high');
      assert.equal(result.evidence?.moon?.confidence, 'high', 'moon confidence should be high');
      assert.equal(result.evidence?.rising?.confidence, 'high', 'rising confidence should be high');
    });

    test('should have MODERATE confidence without exact birth time', () => {
      const birthData: BirthData = {
        name: 'Test Person',
        birthDate: '1990-05-15',
        birthTime: undefined,
        timezone: 'America/New_York',
        latitude: 40.7128,
        longitude: -74.0060,
      };

      const result = calculateAstrology(birthData);

      assert.equal(result.evidence?.sun?.confidence, 'moderate', 'sun confidence should be moderate');
      assert.equal(result.evidence?.moon?.confidence, 'moderate', 'moon confidence should be moderate');
      assert.equal(result.evidence?.rising?.confidence, 'moderate', 'rising confidence should be moderate');
    });

    test('should have MODERATE confidence with location but no exact time', () => {
      const birthData: BirthData = {
        name: 'Test',
        birthDate: '1990-05-15',
        birthTime: undefined,
        timezone: 'UTC',
        latitude: 0,
        longitude: 0,
      };

      const result = calculateAstrology(birthData);

      assert.equal(result.evidence?.sun?.confidence, 'moderate', 'sun confidence should be moderate');
      assert.equal(result.evidence?.moon?.confidence, 'moderate', 'moon confidence should be moderate');
      assert.equal(result.evidence?.rising?.confidence, 'moderate', 'rising confidence should be moderate');
    });
  });

  describe('Unresolved Reason Population', () => {
    test('should not set unresolvedReason when time is provided', () => {
      const birthData: BirthData = {
        name: 'Test Person',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        timezone: 'America/New_York',
        latitude: 40.7128,
        longitude: -74.0060,
      };

      const result = calculateAstrology(birthData);

      assert.equal(result.evidence?.sun?.evidence?.unresolvedReason, undefined, 'sun unresolvedReason should be undefined');
      assert.equal(result.evidence?.moon?.evidence?.unresolvedReason, undefined, 'moon unresolvedReason should be undefined');
      assert.equal(result.evidence?.rising?.evidence?.unresolvedReason, undefined, 'rising unresolvedReason should be undefined');
    });

    test('should set unresolvedReason when time is missing', () => {
      const birthData: BirthData = {
        name: 'Test Person',
        birthDate: '1990-05-15',
        birthTime: undefined,
        timezone: 'America/New_York',
        latitude: 40.7128,
        longitude: -74.0060,
      };

      const result = calculateAstrology(birthData);

      assert.equal(result.evidence?.sun?.evidence?.unresolvedReason, 'requires_verified_birth_time', 'sun unresolvedReason should be set');
      assert.equal(result.evidence?.moon?.evidence?.unresolvedReason, 'requires_verified_birth_time', 'moon unresolvedReason should be set');
      assert.equal(result.evidence?.rising?.evidence?.unresolvedReason, 'requires_verified_birth_time', 'rising unresolvedReason should be set');
    });
  });

  describe('Engine Metadata', () => {
    const birthData: BirthData = {
      name: 'Test Person',
      birthDate: '1990-05-15',
      birthTime: '14:30',
      timezone: 'America/New_York',
      latitude: 40.7128,
      longitude: -74.0060,
    };

    test('should record engine information', () => {
      const result = calculateAstrology(birthData);

      assert.equal(result.evidence?.sun?.evidence?.engine, 'astronomy-engine', 'sun engine should be astronomy-engine');
      assert.ok(result.evidence?.sun?.evidence?.engineVersion, 'sun engineVersion should be defined');
      assert.equal(result.evidence?.moon?.evidence?.engine, 'astronomy-engine', 'moon engine should be astronomy-engine');
      assert.equal(result.evidence?.rising?.evidence?.engine, 'astronomy-engine', 'rising engine should be astronomy-engine');
    });

    test('should record calculation timestamp', () => {
      const beforeCalc = new Date();
      const result = calculateAstrology(birthData);
      const afterCalc = new Date();

      const sunTime = result.evidence?.sun?.evidence?.calculatedAt;
      assert.ok(sunTime, 'sunTime should be defined');

      if (sunTime) {
        const calcTime = new Date(sunTime);
        assert.ok(calcTime.getTime() >= beforeCalc.getTime(), 'calcTime should be >= beforeCalc');
        assert.ok(calcTime.getTime() <= afterCalc.getTime(), 'calcTime should be <= afterCalc');
      }
    });

    test('should record data source', () => {
      const result = calculateAstrology(birthData);

      assert.equal(result.evidence?.sun?.evidence?.source, 'user-provided-birth-data', 'sun source should be user-provided-birth-data');
      assert.equal(result.evidence?.moon?.evidence?.source, 'user-provided-birth-data', 'moon source should be user-provided-birth-data');
      assert.equal(result.evidence?.rising?.evidence?.source, 'user-provided-birth-data', 'rising source should be user-provided-birth-data');
    });
  });

  describe('Determinism and Reproducibility', () => {
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

    test('same input should produce same calculation status', () => {
      const result1 = calculateAstrology(birthData);
      const result2 = calculateAstrology(birthData);

      assert.equal(result1.evidence?.sun?.calculationStatus, result2.evidence?.sun?.calculationStatus, 'sun calculationStatus should be same');
      assert.equal(result1.evidence?.moon?.calculationStatus, result2.evidence?.moon?.calculationStatus, 'moon calculationStatus should be same');
      assert.equal(result1.evidence?.rising?.calculationStatus, result2.evidence?.rising?.calculationStatus, 'rising calculationStatus should be same');
    });

    test('should always mark as deterministic for now (not yet independently verified)', () => {
      const result = calculateAstrology(birthData);

      assert.equal(result.evidence?.sun?.calculationStatus, 'deterministic', 'sun calculationStatus should be deterministic');
      assert.equal(result.evidence?.moon?.calculationStatus, 'deterministic', 'moon calculationStatus should be deterministic');
      assert.equal(result.evidence?.rising?.calculationStatus, 'deterministic', 'rising calculationStatus should be deterministic');
    });
  });
});
