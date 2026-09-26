import test from 'node:test';
import assert from 'node:assert/strict';
import {
  verifyAgainstIndependentReference,
  type EphemerisCandidate,
  type IndependentEphemerisReference,
  type VerificationPolicy,
} from '../server/services/astrology-verification';

const policy: VerificationPolicy = {
  status: 'approved',
  policyId: 'BOUNDARY-REGRESSION',
  maximumLongitudeDeltaDegrees: 0.001,
  approvedAt: '2026-09-24T00:00:00.000Z',
};

function candidate(longitude: number, sign = 'Aries'): EphemerisCandidate {
  return {
    body: 'Sun',
    sign,
    longitude,
    source: 'candidate-source',
    engine: 'candidate-engine',
    calculatedAt: '2026-09-24T00:00:00.000Z',
    inputTimestamp: '2000-01-01T12:00:00.000Z',
  };
}

function reference(longitude: number, sign = 'Aries'): IndependentEphemerisReference {
  return {
    body: 'Sun',
    sign,
    longitude,
    source: 'reference-source',
    engine: 'reference-engine',
    calculatedAt: '2026-09-24T00:00:01.000Z',
    inputTimestamp: '2000-01-01T12:00:00.000Z',
  };
}

test('verification fails closed when agreeing engines sit inside the sign-boundary tolerance', () => {
  const result = verifyAgainstIndependentReference(
    candidate(29.9995),
    reference(29.9996),
    policy,
  );

  assert.equal(result.status, 'rejected');
  if (result.status === 'rejected') {
    assert.equal(result.reason, 'sign_boundary_within_tolerance');
  }
});

test('verification still promotes placements safely away from a sign boundary', () => {
  const result = verifyAgainstIndependentReference(
    candidate(15.0001),
    reference(15.0002),
    policy,
  );

  assert.equal(result.status, 'verified');
});

test('cross-boundary sign disagreement remains a stronger rejection', () => {
  const result = verifyAgainstIndependentReference(
    candidate(29.9998, 'Aries'),
    reference(30.0001, 'Taurus'),
    policy,
  );

  assert.equal(result.status, 'rejected');
  if (result.status === 'rejected') {
    assert.equal(result.reason, 'sign_disagreement');
  }
});


test('verification rejects matching sign labels that contradict longitude', () => {
  const result = verifyAgainstIndependentReference(
    candidate(44.5, 'Aries'),
    reference(44.5002, 'Aries'),
    policy,
  );

  assert.equal(result.status, 'rejected');
  if (result.status === 'rejected') {
    assert.equal(result.reason, 'sign_longitude_mismatch');
  }
});

test('longitude-derived sign integrity holds across all twelve zodiac sectors', () => {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];

  for (let index = 0; index < signs.length; index += 1) {
    const longitude = index * 30 + 15;
    const result = verifyAgainstIndependentReference(
      candidate(longitude, signs[index]),
      reference(longitude + 0.0002, signs[index]),
      policy,
    );

    assert.equal(result.status, 'verified', signs[index]);
  }
});

test('each zodiac boundary rejects a stale sign label immediately after crossing', () => {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];

  for (let index = 0; index < signs.length; index += 1) {
    const nextIndex = (index + 1) % signs.length;
    const boundary = (index + 1) * 30;
    const longitude = boundary >= 360 ? 0.01 : boundary + 0.01;

    const result = verifyAgainstIndependentReference(
      candidate(longitude, signs[index]),
      reference(longitude + 0.0002, signs[index]),
      policy,
    );

    assert.equal(result.status, 'rejected', `${signs[index]} -> ${signs[nextIndex]}`);
    if (result.status === 'rejected') {
      assert.equal(result.reason, 'sign_longitude_mismatch');
    }
  }
});
