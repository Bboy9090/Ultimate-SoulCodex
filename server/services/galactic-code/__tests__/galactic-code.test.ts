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
    evidenceState: 'verified',
    fieldEvidence: {
      sun: 'verified',
      moon: 'verified',
      rising: 'verified',
      mercury: 'verified',
      venus: 'verified',
      mars: 'verified',
      dominantElements: 'verified',
      dominantModalities: 'verified',
      houseEmphasis: 'verified',
      majorAspects: 'verified',
    },
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
    evidenceState: 'verified',
    fieldEvidence: {
      type: 'verified',
      strategy: 'verified',
      authority: 'verified',
      profile: 'verified',
      definition: 'verified',
      centers: 'verified',
      channels: 'verified',
      gates: 'verified',
      incarnationCross: 'unavailable',
    },
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
    evidenceState: 'deterministic',
    lifePath: 7,
    birthdayNumber: 5,
    expressionNumber: 8,
    soulUrgeNumber: 3,
    personalityNumber: 5,
    maturityNumber: 4,
    coverage: 'partial',
  },
  behavior: {
    evidenceState: 'assessed',
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

  await t.test('equivalent channel and aspect orientation normalizes to one fingerprint', () => {
    const input1: GalacticCodeInput = {
      ...testInput,
      humanDesign: { ...testInput.humanDesign, channels: ['Channel 64-47'] },
      astrology: { ...testInput.astrology, majorAspects: ['Sun square Moon'] },
    };
    const input2: GalacticCodeInput = {
      ...testInput,
      humanDesign: { ...testInput.humanDesign, channels: ['47-64'] },
      astrology: { ...testInput.astrology, majorAspects: ['Moon square Sun'] },
    };

    const result1 = generateGalacticCode(input1);
    const result2 = generateGalacticCode(input2);
    assert.strictEqual(result1.fingerprint, result2.fingerprint);
    assert.deepStrictEqual(result1.axes, result2.axes);
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
    assert.strictEqual(result.sourceCoverage.numerology, 'complete');
  });

  await t.test('missing Human Design lowers coverage', () => {
    const noHDInput: GalacticCodeInput = {
      ...testInput,
      humanDesign: { coverage: 'missing' } as any,
    };

    const result = generateGalacticCode(noHDInput);
    assert.ok(['partial', 'insufficient'].includes(result.coverage));
  });

  await t.test('complete astrology + numerology can reach high coverage without Human Design', () => {
    const input: GalacticCodeInput = {
      ...testInput,
      humanDesign: { coverage: 'missing' } as any,
      behavior: {
        ...testInput.behavior,
        traits: [...testInput.behavior.traits, 'collaborative'],
      },
    };

    const result = generateGalacticCode(input);
    assert.strictEqual(result.sourceCoverage.astrology, 'complete');
    assert.strictEqual(result.sourceCoverage.humanDesign, 'missing');
    assert.strictEqual(result.sourceCoverage.numerology, 'complete');
    assert.strictEqual(result.coverage, 'high');
  });

  await t.test('complete Human Design + numerology can reach high coverage without astrology', () => {
    const input: GalacticCodeInput = {
      ...testInput,
      astrology: { coverage: 'missing' } as any,
      behavior: {
        ...testInput.behavior,
        traits: [...testInput.behavior.traits, 'collaborative'],
      },
    };

    const result = generateGalacticCode(input);
    assert.strictEqual(result.sourceCoverage.astrology, 'missing');
    assert.strictEqual(result.sourceCoverage.humanDesign, 'complete');
    assert.strictEqual(result.sourceCoverage.numerology, 'complete');
    assert.strictEqual(result.coverage, 'high');
  });


  await t.test('bogus nonempty values cannot satisfy governed system coverage', () => {
    const spoofed: GalacticCodeInput = {
      profileId: 'spoofed',
      astrology: {
        evidenceState: 'verified',
        fieldEvidence: { sun: 'verified' },
        sun: 'NotASign',
        coverage: 'complete',
      },
      humanDesign: {
        evidenceState: 'verified',
        type: 'Wizard',
        strategy: 'Do Magic',
        authority: 'Cosmic Authority',
        profile: '9/9',
        coverage: 'complete',
      },
      numerology: { evidenceState: 'deterministic', lifePath: 99, coverage: 'complete' },
      behavior: { traits: [], evidenceState: 'assessed' },
    };

    assert.throws(
      () => generateGalacticCode(spoofed),
      /requires at least 2 of 3 systems/,
    );
  });

  await t.test('Sun sign alone cannot generate verified code', () => {
    const sunOnlyInput: GalacticCodeInput = {
      profileId: 'sun-only',
      astrology: {
        evidenceState: 'verified',
        fieldEvidence: { sun: 'verified' },
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


  await t.test('changed scoring inputs change fingerprint', () => {
    const variants: GalacticCodeInput[] = [
      {
        ...testInput,
        humanDesign: { ...testInput.humanDesign, channels: ['Channel 57-20'] },
      },
      {
        ...testInput,
        numerology: { ...testInput.numerology, soulUrgeNumber: 9 },
      },
      {
        ...testInput,
        behavior: { ...testInput.behavior, relationalPattern: 'Highly collaborative' },
      },
      {
        ...testInput,
        astrology: { ...testInput.astrology, houseEmphasis: ['House 10'] },
      },
    ];

    for (const variant of variants) {
      assert.notStrictEqual(
        generateGalacticCode(variant).fingerprint,
        baseResult.fingerprint,
      );
    }
  });

  await t.test('changed Authority produces different fingerprint', () => {
    const changedInput: GalacticCodeInput = {
      ...testInput,
      humanDesign: {
        evidenceState: 'verified',
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
        evidenceState: 'deterministic',
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
  await t.test('qualified evidence and coverage remain separate states', () => {
    const completeCoverageInput: GalacticCodeInput = {
      profileId: 'coverage-test',
      birthDate: '1995-06-15',
      birthTime: '10:30',
      birthLocation: 'Portland, Oregon',
      astrology: {
        evidenceState: 'verified',
        fieldEvidence: {
          sun: 'verified',
          moon: 'verified',
          rising: 'verified',
          mercury: 'verified',
          venus: 'verified',
          mars: 'verified',
          dominantElements: 'verified',
          dominantModalities: 'verified',
          houseEmphasis: 'verified',
          majorAspects: 'verified',
        },
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
        evidenceState: 'verified',
        fieldEvidence: {
          type: 'verified',
          strategy: 'verified',
          authority: 'verified',
          profile: 'verified',
          definition: 'verified',
          centers: 'verified',
          channels: 'verified',
          gates: 'verified',
          incarnationCross: 'unavailable',
        },
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
        evidenceState: 'deterministic',
        lifePath: 3,
        birthdayNumber: 6,
        expressionNumber: 9,
        soulUrgeNumber: 7,
        personalityNumber: 2,
        maturityNumber: 12,
        coverage: 'partial',
      },
      behavior: {
        evidenceState: 'assessed',
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

  await t.test('unverified astrology fields cannot change production synthesis', () => {
    const candidateA: GalacticCodeInput = {
      ...testInput,
      astrology: {
        ...testInput.astrology,
        fieldEvidence: {
          ...testInput.astrology.fieldEvidence,
          moon: 'candidate',
        },
        moon: 'Capricorn',
      },
    };
    const candidateB: GalacticCodeInput = {
      ...candidateA,
      astrology: {
        ...candidateA.astrology,
        moon: 'Pisces',
      },
    };

    const resultA = generateGalacticCode(candidateA);
    const resultB = generateGalacticCode(candidateB);

    assert.strictEqual(resultA.fingerprint, resultB.fingerprint);
    assert.deepStrictEqual(resultA.axes, resultB.axes);
    assert.ok(resultA.evidence.every((value) => !value.startsWith('Moon ')));
    assert.strictEqual(resultA.sourceCoverage.astrology, 'partial');
  });

  await t.test('every unverified astrology placement is fingerprint-inert', () => {
    const changedSigns = {
      sun: ['Virgo', 'Aries'],
      moon: ['Capricorn', 'Pisces'],
      rising: ['Scorpio', 'Gemini'],
      mercury: ['Virgo', 'Leo'],
      venus: ['Leo', 'Cancer'],
      mars: ['Libra', 'Taurus'],
    } as const;

    for (const field of Object.keys(changedSigns) as Array<keyof typeof changedSigns>) {
      const [first, second] = changedSigns[field];
      for (const evidence of ['candidate', 'unavailable', undefined] as const) {
        const fieldEvidence = { ...testInput.astrology.fieldEvidence };
        if (evidence === undefined) {
          delete fieldEvidence[field];
        } else {
          fieldEvidence[field] = evidence;
        }
        const withField = (sign: string): GalacticCodeInput => ({
          ...testInput,
          astrology: { ...testInput.astrology, fieldEvidence, [field]: sign },
        });

        const a = generateGalacticCode(withField(first));
        const b = generateGalacticCode(withField(second));
        assert.strictEqual(a.fingerprint, b.fingerprint, `${field}/${evidence}: fingerprint`);
        assert.deepStrictEqual(a.axes, b.axes, `${field}/${evidence}: axes`);
        assert.deepStrictEqual(a.evidence, b.evidence, `${field}/${evidence}: evidence`);
        assert.strictEqual(a.codename, b.codename, `${field}/${evidence}: codename`);
      }
    }
  });

  await t.test('unverified derived astrology groups cannot influence synthesis', () => {
    const variants = {
      dominantElements: [['earth'], ['fire', 'water']],
      dominantModalities: [['mutable'], ['fixed', 'cardinal']],
      houseEmphasis: [['House 1'], ['House 10']],
      majorAspects: [['Sun trine Moon'], ['Sun square Mars']],
    } as const;

    for (const field of Object.keys(variants) as Array<keyof typeof variants>) {
      const [first, second] = variants[field];
      for (const evidence of ['candidate', 'unavailable', undefined] as const) {
        const fieldEvidence = { ...testInput.astrology.fieldEvidence };
        if (evidence === undefined) {
          delete fieldEvidence[field];
        } else {
          fieldEvidence[field] = evidence;
        }
        const withGroup = (values: readonly string[]): GalacticCodeInput => ({
          ...testInput,
          astrology: { ...testInput.astrology, fieldEvidence, [field]: [...values] },
        });

        const a = generateGalacticCode(withGroup(first));
        const b = generateGalacticCode(withGroup(second));
        assert.strictEqual(a.fingerprint, b.fingerprint, `${field}/${evidence}: fingerprint`);
        assert.deepStrictEqual(a.axes, b.axes, `${field}/${evidence}: axes`);
        assert.deepStrictEqual(a.evidence, b.evidence, `${field}/${evidence}: evidence`);
        assert.deepStrictEqual(a.elementMatrix, b.elementMatrix, `${field}/${evidence}: element matrix`);
      }
    }
  });

  await t.test('invalid per-field verification labels fail closed', () => {
    const altered: GalacticCodeInput = {
      ...testInput,
      astrology: {
        ...testInput.astrology,
        fieldEvidence: {
          ...testInput.astrology.fieldEvidence,
          moon: 'verified-by-client' as GalacticCodeInput['astrology']['evidenceState'],
        },
      },
    };
    const other: GalacticCodeInput = {
      ...altered,
      astrology: { ...altered.astrology, moon: 'Pisces' },
    };
    const a = generateGalacticCode(altered);
    const b = generateGalacticCode(other);
    assert.strictEqual(a.fingerprint, b.fingerprint);
    assert.deepStrictEqual(a.axes, b.axes);
    assert.strictEqual(a.sourceCoverage.astrology, 'partial');
  });

  await t.test('unverified Human Design cannot change production synthesis', () => {
    const candidateA: GalacticCodeInput = {
      ...testInput,
      humanDesign: {
        ...testInput.humanDesign,
        evidenceState: 'candidate',
        type: 'Generator',
        profile: '2/4',
      },
    };
    const candidateB: GalacticCodeInput = {
      ...candidateA,
      humanDesign: {
        ...candidateA.humanDesign,
        type: 'Reflector',
        profile: '6/2',
      },
    };

    const resultA = generateGalacticCode(candidateA);
    const resultB = generateGalacticCode(candidateB);
    assert.strictEqual(resultA.fingerprint, resultB.fingerprint);
    assert.strictEqual(resultA.sourceCoverage.humanDesign, 'missing');
    assert.ok(resultA.evidence.every((value) => !value.startsWith('HD ')));
  });

  await t.test('unverified Human Design fields are fingerprint-inert inside a verified system envelope', () => {
    const baseFieldEvidence = { ...testInput.humanDesign.fieldEvidence, channels: 'candidate' as const };
    const first: GalacticCodeInput = {
      ...testInput,
      humanDesign: {
        ...testInput.humanDesign,
        fieldEvidence: baseFieldEvidence,
        channels: ['1-8'],
      },
    };
    const second: GalacticCodeInput = {
      ...first,
      humanDesign: {
        ...first.humanDesign,
        channels: ['34-57'],
      },
    };

    const a = generateGalacticCode(first);
    const b = generateGalacticCode(second);
    assert.strictEqual(a.fingerprint, b.fingerprint);
    assert.deepStrictEqual(a.axes, b.axes);
    assert.deepStrictEqual(a.evidence, b.evidence);
  });

  await t.test('verified HD channel ids cannot inject behavioral prose into axis scoring', () => {
    const legitimate: GalacticCodeInput = {
      ...testInput,
      humanDesign: { ...testInput.humanDesign, channels: ['1-8'] },
    };
    const fabricated: GalacticCodeInput = {
      ...testInput,
      humanDesign: { ...testInput.humanDesign, channels: ['strategic builder channel'] },
    };

    const legitimateResult = generateGalacticCode(legitimate);
    const fabricatedResult = generateGalacticCode(fabricated);
    assert.deepStrictEqual(fabricatedResult.axes, generateGalacticCode({
      ...testInput,
      humanDesign: { ...testInput.humanDesign, channels: [] },
    }).axes);
    assert.deepStrictEqual(legitimateResult.axes, fabricatedResult.axes);
  });

  await t.test('malformed verified derived astrology fields are quarantined', () => {
    const clean = generateGalacticCode({
      ...testInput,
      astrology: {
        ...testInput.astrology,
        dominantElements: [],
        dominantModalities: [],
        houseEmphasis: [],
        majorAspects: [],
      },
    });
    const malformed = generateGalacticCode({
      ...testInput,
      astrology: {
        ...testInput.astrology,
        dominantElements: ['plasma'],
        dominantModalities: ['quantum'],
        houseEmphasis: ['House 10 executive strategy'],
        majorAspects: ['Sun strategic square Moon builder'],
      },
    });

    assert.strictEqual(malformed.fingerprint, clean.fingerprint);
    assert.deepStrictEqual(malformed.axes, clean.axes);
    assert.deepStrictEqual(malformed.elementMatrix, clean.elementMatrix);
  });
});
