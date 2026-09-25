import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAscendantCandidate,
  verifyAscendant,
} from '../server/services/ascendant-verification';
import {
  calculateEqualHouseEvidence,
} from '../server/services/house-verification';

const timestamp = '2026-09-24T12:00:00.000Z';

test('Ascendant verification rejects exact geographic poles', () => {
  for (const latitude of [-90, 90]) {
    assert.throws(
      () => calculateAscendantCandidate({ inputTimestamp: timestamp, latitude, longitude: 0 }),
      /ascendant_input_invalid/,
    );

    const result = verifyAscendant({ inputTimestamp: timestamp, latitude, longitude: 0 });
    assert.equal(result.status, 'rejected');
    if (result.status === 'rejected') {
      assert.equal(result.reason, 'invalid_input');
    }
  }
});

test('Equal House evidence rejects exact geographic poles', () => {
  for (const latitude of [-90, 90]) {
    assert.throws(
      () => calculateEqualHouseEvidence({ inputTimestamp: timestamp, latitude, longitude: 0 }),
      /house_input_invalid/,
    );
  }
});

test('near-polar but finite latitude remains calculable', () => {
  const candidate = calculateAscendantCandidate({
    inputTimestamp: timestamp,
    latitude: 89.9,
    longitude: 0,
  });

  assert.ok(Number.isFinite(candidate.longitudeDegrees));
});
