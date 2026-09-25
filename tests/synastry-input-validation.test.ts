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
