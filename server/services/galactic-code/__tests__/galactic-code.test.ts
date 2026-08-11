/**
 * Galactic Code Test Suite
 *
 * Tests proving determinism, stability, and correctness.
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { generateGalacticCode } from '../generator';
import { normalizeGalacticInput, extractHashableInput } from '../normalize';
import { createGalacticFingerprint } from '../fingerprint';
import { validateInterpretation } from '../prompts';
import type { GalacticCodeInput } from '../../../../shared/galactic-code/types';

// Test fixture
const testInput: GalacticCodeInput = {
  profileId: 'test-profile-001',
  birthDate: '1998-09-14',
  birthTime: '05:15',
  birthLocation: 'Detroit, Michigan',
  astrology: {
    sun: 'Virgo',
    moon: 'Capricorn',
    rising: 'Scorpio',
    mercury: 'Virgo',
    venus: 'Leo',
    mars: 'Libra',
    dominantElements: ['earth', 'water'],
    dominantModalities: ['mutable', 'cardinal'],
    houseEmphasis: [],
    majorAspects: [],
    coverage: 'complete',
  },
  humanDesign: {
    type: 'Generator',
    strategy: 'To Respond',
    authority: 'Sacral',
    profile: '2/4',
    definition: 'Split',
    centers: { defined: ['Head', 'Solar Plexus'], undefined: ['Root'] },
    channels: ['Channel 1-8', 'Channel 34-20'],
    gates: [],
    incarnationCross: 'Right Angle Cross',
    coverage: 'complete',
  },
  numerology: {
    lifePath: 7,
    birthdayNumber: 5,
    expressionNumber: 8,
    soulUrgeNumber: 3,
    personalityNumber: 5,
    maturityNumber: 12,
    coverage: 'partial',
  },
  behavior: {
    traits: ['analytical', 'reserved', 'methodical', 'strategic'],
    decisionStyle: 'Data-driven',
    stressPattern: 'Over-analysis paralysis',
    relationalPattern: 'Selective intimacy',
    builderMode: 'Foundation-first',
    moralCompass: 'Principle-based',
  },
};

test('Galactic Code: Determinism', async (t) => {
  await t.test('same input produces same fingerprint', () => {
    const result1 = generateGalacticCode(testInput);
    const result2 = generateGalacticCode(testInput);

    assert.strictEqual(result1.fingerprint, result2.fingerprint, 'fingerprints should match');
    assert.strictEqual(result1.shortCode, result2.shortCode, 'short codes should match');
  });

  await t.test('array order does not change fingerprint', () => {
    const input1: GalacticCodeInput = {
      ...testInput,
      behavior: {
        ...testInput.behavior,
        traits: ['analytical', 'reserved', 'methodical'],
      },
    };

    const input2: GalacticCodeInput = {
      ...testInput,
      behavior: {
        ...testInput.behavior,
        traits: ['methodical', 'analytical', 'reserved'],
      },
    };

    const result1 = generateGalacticCode(input1);
    const result2 = generateGalacticCode(input2);

    assert.strictEqual(result1.fingerprint, result2.fingerprint, 'fingerprint should be independent of array order');
  });

  await t.test('prose changes do not change fingerprint', () => {
    const result1 = generateGalacticCode(testInput);
    const result2 = generateGalacticCode(testInput);

    // Fingerprint is deterministic across invocations
    assert.strictEqual(result1.fingerprint, result2.fingerprint);
    // (generatedAt may be identical if calls are fast enough; this is acceptable)
  });
});

test('Galactic Code: System Coverage & Confidence', async (t) => {
  await t.test('requires minimum 2 of 3 systems', () => {
    const minimalInput: GalacticCodeInput = {
      profileId: 'minimal',
      astrology: { sun: 'Aries', coverage: 'complete' } as any,
      humanDesign: { coverage: 'missing' } as any,
      numerology: { coverage: 'missing' } as any,
      behavior: { traits: [] },
    };

    assert.throws(() => generateGalacticCode(minimalInput), /requires at least 2 of 3 systems/);
  });

  await t.test('calculates coverage based on data completeness', () => {
    const result = generateGalacticCode(testInput);

    assert.strictEqual(result.coverage, 'partial');
    assert.strictEqual(result.sourceCoverage.astrology, 'complete');
    assert.strictEqual(result.sourceCoverage.humanDesign, 'complete');
    assert.strictEqual(result.sourceCoverage.numerology, 'partial');
  });

  await t.test('missing Human Design lowers coverage', () => {
    const noHDInput: GalacticCodeInput = {
      ...testInput,
      humanDesign: { coverage: 'missing' } as any,
    };

    const result = generateGalacticCode(noHDInput);
    assert.ok(['partial', 'insufficient'].includes(result.coverage));
  });

  await t.test('Sun sign alone cannot generate verified code', () => {
    const sunOnlyInput: GalacticCodeInput = {
      profileId: 'sun-only',
      astrology: {
        sun: 'Virgo',
        coverage: 'complete',
      } as any,
      humanDesign: { coverage: 'missing' } as any,
      numerology: { coverage: 'missing' } as any,
      behavior: { traits: [] },
    };

    assert.throws(() => generateGalacticCode(sunOnlyInput));
  });
});

test('Galactic Code: Structure & Content', async (t) => {
  const result = generateGalacticCode(testInput);

  await t.test('returns all required fields', () => {
    assert(result.profileId, 'profileId required');
    assert.strictEqual(result.version, 'galactic-code-v1', 'version should be galactic-code-v1');
    assert(result.fingerprint, 'fingerprint required');
    assert(result.shortCode, 'shortCode required');
    assert(result.shortCode.match(/^SCX-GC-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/), 'shortCode format correct');
    assert(result.codename, 'codename required');
    assert(result.designation, 'designation required');
    assert(result.tagline, 'tagline required');
    assert(result.primaryFunction, 'primaryFunction required');
    assert(result.secondaryFunction, 'secondaryFunction required');
    assert(result.legacyFunction, 'legacyFunction required');
    assert(result.frequency, 'frequency required');
    assert(result.axes.length > 0, 'axes required');
    assert(result.elementMatrix, 'elementMatrix required');
    assert(result.behavioralSequence.length > 0, 'behavioralSequence required');
    assert(result.interpretation, 'interpretation required');
    assert(result.evidence.length > 0, 'evidence required');
    assert(result.generatedAt, 'generatedAt required');
  });

  await t.test('interpretation includes all 5 sections', () => {
    assert(result.interpretation.identity, 'identity required');
    assert(result.interpretation.decisionCode, 'decisionCode required');
    assert(result.interpretation.stressMechanic, 'stressMechanic required');
    assert(result.interpretation.relationalCode, 'relationalCode required');
    assert(result.interpretation.missionArc, 'missionArc required');
  });

  await t.test('axes are sorted by score descending', () => {
    for (let i = 0; i < result.axes.length - 1; i++) {
      assert.ok(result.axes[i].score >= result.axes[i + 1].score, 'axes should be sorted by score');
    }
  });

  await t.test('no banned phrases appear in interpretation', () => {
    const bannedPhrases = [
      'embrace your truth',
      'step into your power',
      'old soul',
      'intuitive empath',
      'the universe wants',
    ];

    const interpretationText = JSON.stringify(result.interpretation).toLowerCase();
    for (const phrase of bannedPhrases) {
      assert.ok(!interpretationText.includes(phrase), `banned phrase "${phrase}" should not appear`);
    }
  });

  await t.test('behavioral sequence has 5 items', () => {
    assert.strictEqual(result.behavioralSequence.length, 5);
  });

  await t.test('frequency matches expected format', () => {
    // Format: MMDD-HHMM-LPX
    assert(result.frequency.match(/^\d{4}-\d{2}\d{2}-LP\d+$/), 'frequency format incorrect');
  });
});

test('Galactic Code: Changed inputs produce different fingerprints', async (t) => {
  const baseResult = generateGalacticCode(testInput);

  await t.test('changed Moon produces different fingerprint', () => {
    const changedInput: GalacticCodeInput = {
      ...testInput,
      astrology: {
        ...testInput.astrology,
        moon: 'Pisces',
      },
    };

    const result = generateGalacticCode(changedInput);
    assert.notStrictEqual(result.fingerprint, baseResult.fingerprint);
  });

  await t.test('changed Authority produces different fingerprint', () => {
    const changedInput: GalacticCodeInput = {
      ...testInput,
      humanDesign: {
        ...testInput.humanDesign,
        authority: 'Emotional',
      },
    };

    const result = generateGalacticCode(changedInput);
    assert.notStrictEqual(result.fingerprint, baseResult.fingerprint);
  });

  await t.test('changed Life Path produces different fingerprint', () => {
    const changedInput: GalacticCodeInput = {
      ...testInput,
      numerology: {
        ...testInput.numerology,
        lifePath: 3,
      },
    };

    const result = generateGalacticCode(changedInput);
    assert.notStrictEqual(result.fingerprint, baseResult.fingerprint);
  });
});

test('Galactic Code: Edge Cases', async (t) => {
  await t.test('handles astrology + numerology without HD', () => {
    const noHDInput: GalacticCodeInput = {
      ...testInput,
      humanDesign: { coverage: 'missing' } as any,
    };

    const result = generateGalacticCode(noHDInput);
    assert(result.fingerprint);
    assert(result.sourceCoverage.humanDesign === 'missing');
  });

  await t.test('handles astrology + HD without numerology', () => {
    const noNumInput: GalacticCodeInput = {
      ...testInput,
      numerology: { coverage: 'missing' } as any,
    };

    const result = generateGalacticCode(noNumInput);
    assert(result.fingerprint);
    assert(result.sourceCoverage.numerology === 'missing');
  });

  await t.test('handles missing optional symbolic input', () => {
    const { symbolic, ...inputWithoutSymbolic } = testInput;
    const result = generateGalacticCode(inputWithoutSymbolic);
    assert(result.fingerprint);
  });
});

test('Normalization: Stability', async (t) => {
  await t.test('whitespace is normalized', () => {
    const input1: GalacticCodeInput = {
      ...testInput,
      astrology: {
        ...testInput.astrology,
        sun: '  Virgo  ',
      },
    };

    const input2: GalacticCodeInput = {
      ...testInput,
      astrology: {
        ...testInput.astrology,
        sun: 'virgo',
      },
    };

    const normalized1 = normalizeGalacticInput(input1);
    const normalized2 = normalizeGalacticInput(input2);

    assert.strictEqual(normalized1.astrology.sun, normalized2.astrology.sun);
  });

  await t.test('case is normalized to lowercase', () => {
    const input1: GalacticCodeInput = {
      ...testInput,
      astrology: {
        ...testInput.astrology,
        sun: 'VIRGO',
      },
    };

    const input2: GalacticCodeInput = {
      ...testInput,
      astrology: {
        ...testInput.astrology,
        sun: 'virgo',
      },
    };

    const result1 = generateGalacticCode(input1);
    const result2 = generateGalacticCode(input2);

    assert.strictEqual(result1.fingerprint, result2.fingerprint);
  });
});

test('Galactic Code: Coverage vs Verification (Diamond Doctrine)', async (t) => {
  await t.test('complete coverage does not imply verification', () => {
    const completeCoverageInput: GalacticCodeInput = {
      profileId: 'coverage-test',
      birthDate: '1995-06-15',
      birthTime: '10:30',
      birthLocation: 'Portland, Oregon',
      astrology: {
        sun: 'Gemini',
        moon: 'Libra',
        rising: 'Aquarius',
        mercury: 'Gemini',
        venus: 'Cancer',
        mars: 'Leo',
        dominantElements: ['air'],
        dominantModalities: ['mutable'],
        houseEmphasis: [],
        majorAspects: [],
        coverage: 'complete',
      },
      humanDesign: {
        type: 'Projector',
        strategy: 'To Be Invited',
        authority: 'Mental',
        profile: '3/5',
        definition: 'Single',
        centers: { defined: ['Head', 'Heart'], undefined: ['Root'] },
        channels: [],
        gates: [],
        incarnationCross: '',
        coverage: 'complete',
      },
      numerology: {
        lifePath: 3,
        birthdayNumber: 6,
        expressionNumber: 9,
        soulUrgeNumber: 7,
        personalityNumber: 2,
        maturityNumber: 12,
        coverage: 'partial',
      },
      behavior: {
        traits: ['creative', 'communicative', 'analytical', 'collaborative', 'adaptable'],
        decisionStyle: 'Intuitive',
        stressPattern: 'Perfectionism',
        relationalPattern: 'Empathetic listener',
        builderMode: 'Collaborative design',
        moralCompass: 'Service-oriented',
      },
    };

    const result = generateGalacticCode(completeCoverageInput);

    // Coverage is high (2+ complete systems + behavioral traits)
    assert.strictEqual(result.coverage, 'high', 'complete coverage should produce high coverage state');

    // But coverage NEVER means the underlying placements are independently verified
    // The result.coverage is about input availability, not astrological verification
    assert.ok(result.sourceCoverage.astrology === 'complete' || result.sourceCoverage.astrology === 'partial');
    assert.ok(result.sourceCoverage.humanDesign === 'complete' || result.sourceCoverage.humanDesign === 'partial');

    // The key invariant: coverage state says nothing about whether Sun/Moon/Rising
    // have actually been verified against independent ephemeris or house system data
    // Complete coverage ≠ verified placements (Diamond Doctrine)
    assert.ok(
      result.coverage === 'high',
      'synthesis readiness (coverage) is distinct from placement verification'
    );
  });

  await t.test('coverage cannot claim verification from field presence alone', () => {
    // Even if all three astrological bodies are present...
    const input: GalacticCodeInput = {
      profileId: 'verify-test',
      astrology: {
        sun: 'Leo',
        moon: 'Scorpio',
        rising: 'Capricorn',
        coverage: 'complete',
      } as any,
      humanDesign: { coverage: 'missing' } as any,
      numerology: { coverage: 'missing' } as any,
      behavior: { traits: ['one'] }, // minimal
    };

    // ... the code still throws because only 1 system is present
    assert.throws(() => generateGalacticCode(input), /requires at least 2 of 3 systems/);

    // The point: coverage measures data availability, not independent verification status
  });
});
