import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
  test(`${label} transit engine fails closed with no governed natal evidence`, () => {
    assert.throws(
      () => calculate({}, new Date('2026-09-25T12:00:00Z')),
      /transit_verified_natal_positions_required/,
    );
  });
}

test('transit interpretation copy separates measured geometry from symbolic meaning', () => {
  const source = readFileSync('transits.ts', 'utf8');

  assert.match(source, /Reflection prompt:/);
  assert.match(source, /not a measured physical, psychological, or predictive intensity/);
  assert.doesNotMatch(
    source,
    /Expansion and abundance arrive|Intuition is heightened|Your authentic self emerges effortlessly|Deep healing happens without force|Your efforts are rewarded/,
  );
}
