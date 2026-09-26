import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDetailedSynastry as calculatePackageSynastry } from '../packages/astrology/synastry';
import { calculateDetailedSynastry as calculateServiceSynastry } from '../services/synastry';

function chart(overrides: Record<string, unknown> = {}) {
  const planet = { sign: 'Aries', degree: 10 };
  return {
    sunSign: 'Aries',
    moonSign: 'Taurus',
    risingSign: 'Gemini',
    planets: {
      sun: { ...planet },
      moon: { ...planet, sign: 'Taurus' },
      mercury: { ...planet, sign: 'Gemini' },
      venus: { ...planet, sign: 'Cancer' },
      mars: { ...planet, sign: 'Leo' },
      jupiter: { ...planet, sign: 'Virgo' },
      saturn: { ...planet, sign: 'Libra' },
      uranus: { ...planet, sign: 'Scorpio' },
      neptune: { ...planet, sign: 'Sagittarius' },
      pluto: { ...planet, sign: 'Capricorn' },
    },
    ...overrides,
  } as any;
}

for (const [label, calculate] of [
  ['package', calculatePackageSynastry],
  ['service', calculateServiceSynastry],
] as const) {
  test(`${label} synastry rejects unsupported zodiac signs instead of mapping them to Aries`, () => {
    const invalid = chart({
      planets: {
        ...chart().planets,
        sun: { sign: 'Unknown', degree: 10 },
      },
    });

    assert.throws(
      () => calculate(invalid, chart()),
      /Unsupported zodiac sign/,
    );
  });

  test(`${label} synastry rejects degrees outside [0, 30)`, () => {
    const invalid = chart({
      planets: {
        ...chart().planets,
        moon: { sign: 'Taurus', degree: 30 },
      },
    });

    assert.throws(
      () => calculate(invalid, chart()),
      /Degree within sign must be finite and in \[0, 30\)/,
    );
  });
}


test('synastry rendered guidance remains symbolic and agency-safe', () => {
  const houses = Array.from({ length: 12 }, (_, index) => index * 30);
  const first = chart({
    northNode: { sign: 'Aries', degree: 10 },
    southNode: { sign: 'Libra', degree: 10 },
    vertex: { sign: 'Aries', degree: 10 },
    ascendant: { sign: 'Aries', degree: 10 },
    houses,
  });
  const second = chart({
    northNode: { sign: 'Aries', degree: 10 },
    southNode: { sign: 'Libra', degree: 10 },
    vertex: { sign: 'Aries', degree: 10 },
    ascendant: { sign: 'Aries', degree: 10 },
    houses,
  });

  const result = calculatePackageSynastry(first, second);
  const rendered = [
    ...result.goldenAspects.map((aspect) => aspect.description),
    ...result.diamondAspects.map((aspect) => aspect.description),
    ...result.fatedAspects.map((aspect) => aspect.description),
    ...result.otherAspects.map((aspect) => aspect.description),
    ...result.houseOverlays.person1Planets.map((overlay) => overlay.significance),
    ...result.houseOverlays.person2Planets.map((overlay) => overlay.significance),
    result.chemistry.description,
    result.commitment.description,
    result.growth.description,
    ...result.summary.strengths,
    ...result.summary.challenges,
    ...result.summary.soulMateIndicators,
    result.summary.relationshipType,
  ].join(' ');

  assert.doesNotMatch(
    rendered,
    /destined|meant to happen|telepathic|ultimate soul mate|divine, unconditional love|marriage energy|fated encounter|#1 passion indicator|guaranteed longevity/i,
  );
  assert.match(rendered, /symbolic|traditionally|developmental/i);
});

test('synastry fails closed on malformed house cusp geometry', () => {
  const invalidHouses = [
    0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, Number.NaN,
  ];

  assert.throws(
    () =>
      calculatePackageSynastry(
        chart(),
        chart({ houses: invalidHouses }),
      ),
    /House cusps must contain exactly 12 finite longitudes/,
  );
});

test('synastry house overlays are invariant under full-circle cusp shifts', () => {
  const houses = Array.from({ length: 12 }, (_, index) => index * 30);
  const shifted = houses.map((longitude) => longitude + 720);

  const base = calculatePackageSynastry(
    chart({ houses }),
    chart({ houses }),
  );
  const rotated = calculatePackageSynastry(
    chart({ houses: shifted }),
    chart({ houses: shifted }),
  );

  assert.deepEqual(rotated.houseOverlays, base.houseOverlays);
});
