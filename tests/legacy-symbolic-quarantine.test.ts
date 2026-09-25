import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateChineseAstrology as packageChinese } from '../packages/astrology/chinese-astrology';
import { calculateChineseAstrology as legacyChinese } from '../services/chinese-astrology';
import { calculateIChing as packageIChing } from '../packages/astrology/i-ching';
import { calculateIChing as legacyIChing } from '../services/i-ching';
import { generatePalmReading as packagePalm } from '../packages/astrology/palmistry';
import { generatePalmReading as legacyPalm } from '../services/palmistry';

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
