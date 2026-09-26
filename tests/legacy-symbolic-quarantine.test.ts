import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateChineseAstrology as packageChinese } from '../packages/astrology/chinese-astrology';
import { calculateChineseAstrology as legacyChinese } from '../services/chinese-astrology';
import { calculateIChing as packageIChing } from '../packages/astrology/i-ching';
import { calculateIChing as legacyIChing } from '../services/i-ching';
import { generatePalmReading as packagePalm } from '../packages/astrology/palmistry';
import { generatePalmReading as legacyPalm } from '../services/palmistry';
import { calculateGeneKeys as packageGeneKeys } from '../packages/astrology/gene-keys';
import { calculateGeneKeys as legacyGeneKeys } from '../services/gene-keys';
import { calculateSabianSymbols as packageSabianSymbols } from '../packages/astrology/sabian-symbols';
import { calculateSabianSymbols as legacySabianSymbols } from '../services/sabian-symbols';
import { calculateChakraSystem } from '../services/chakra-system';
import { calculateSacredGeometry } from '../services/sacred-geometry';

test('legacy pseudo-BaZi remains quarantined until a governed Four Pillars engine exists', () => {
  for (const calculate of [packageChinese, legacyChinese]) {
    assert.throws(
      () => calculate('1990-09-17'),
      /chinese_astrology_unavailable:no_governed_bazi_four_pillars_engine/,
    );
  }
});

test('incomplete I-Ching prototype remains unavailable', () => {
  for (const calculate of [packageIChing, legacyIChing]) {
    assert.throws(
      () => calculate('1990-09-17'),
      /i_ching_unavailable:incomplete_hexagram_corpus_and_no_governed_divination_method/,
    );
  }
});

test('palmistry requires actual palm evidence instead of birth-date fabrication', () => {
  for (const calculate of [packagePalm, legacyPalm]) {
    assert.throws(
      () => calculate('1990-09-17', 9),
      /palmistry_unavailable:palm_observation_or_image_required/,
    );
  }
});


test('incomplete Gene Keys engine remains unavailable instead of fabricating fallback keys', () => {
  for (const calculate of [packageGeneKeys, legacyGeneKeys]) {
    assert.throws(
      () => calculate(11, 12, 13, {}),
      /gene_keys_unavailable:complete_governed_corpus_required/,
    );
  }
});

test('Sabian symbols are not AI-fabricated for missing degree corpus entries', async () => {
  for (const calculate of [packageSabianSymbols, legacySabianSymbols]) {
    await assert.rejects(
      () => calculate(15, 125, 245),
      /sabian_symbols_unavailable:governed_360_degree_corpus_required/,
    );
  }
});


test('chakra and sacred-geometry identity calculators remain unavailable', () => {
  assert.throws(
    () => calculateChakraSystem({}, {}, {}),
    /chakra_system_unavailable:explicit_governed_assessment_required/,
  );
  assert.throws(
    () => calculateSacredGeometry('1990-09-17', 9, 'Bobby'),
    /sacred_geometry_unavailable:no_governed_identity_calculation/,
  );
});
