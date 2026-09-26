import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractNatalPositions as extractRootNatal,
  calculateActiveTransits as calculateRootTransits,
} from '../transits';
import {
  extractNatalPositions as extractPackageNatal,
  calculateActiveTransits as calculatePackageTransits,
} from '../packages/astrology/transits';

const mixed = {
  planets: {
    sun: {
      sign: 'Virgo',
      verificationStatus: 'verified',
      internalCandidate: { longitude: 174.42 },
    },
    moon: {
      sign: 'Cancer',
      verificationStatus: 'pending_independent_verification',
      internalCandidate: { longitude: 100.1 },
    },
  },
  rising: {
    sign: 'Scorpio',
    verificationStatus: 'verified',
    internalCandidate: { longitude: 227.3 },
  },
};

for (const [label, extract] of [
  ['root', extractRootNatal],
  ['package', extractPackageNatal],
] as const) {
  test(`${label} transit natal extraction admits verified placements only`, () => {
    const result = extract(mixed);
    assert.ok(result.Sun);
    assert.ok(result.Ascendant);
    assert.equal(result.Moon, undefined);
  });
}

for (const [label, calculate] of [
  ['root', calculateRootTransits],
  ['package', calculatePackageTransits],
] as const) {
  test(`${label} transit engine does not invent a theme with no governed natal evidence`, () => {
    const result = calculate({}, new Date('2026-09-25T12:00:00Z'));
    assert.deepEqual(result.transits, []);
    assert.equal(result.overallIntensity, 0);
    assert.equal(result.dominantTheme, 'No active governed major transit');
  });
}
