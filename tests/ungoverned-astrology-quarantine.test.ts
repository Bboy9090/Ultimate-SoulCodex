import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { registryEntry } from '../shared/system-registry';
import { calculateAsteroids as calculateServiceAsteroids } from '../services/asteroids';
import { calculateAsteroids as calculatePackageAsteroids } from '../packages/astrology/asteroids';
import { calculateChineseAstrology } from '../services/chinese-astrology';
import { calculateMayanAstrology } from '../services/mayan-astrology';
import { calculateKabbalah } from '../services/kabbalah';
import { calculateAyurveda } from '../services/ayurveda';
import { calculateArabicParts } from '../services/arabic-parts';
import { calculateFixedStars } from '../services/fixed-stars';

const routes = fs.readFileSync(new URL('../routes.ts', import.meta.url), 'utf8');

test('Vedic astrology remains quarantined from production profile generation', () => {
  const policy = registryEntry('vedic-astrology');
  assert.equal(policy?.state, 'unavailable');
  assert.equal(policy?.mayInfluenceUltimateCodex, false);
  assert.doesNotMatch(routes, /calculateVedicAstrology\(/);
  assert.match(routes, /vedicAstrologyData = null/);
});

test('returns and progressions remain unavailable until governed math exists', () => {
  const policy = registryEntry('returns-progressions');
  assert.equal(policy?.state, 'unavailable');
  assert.equal(policy?.mayInfluenceUltimateCodex, false);
  assert.doesNotMatch(routes, /calculateSolarReturn\(/);
  assert.doesNotMatch(routes, /calculateLunarReturn\(/);
  assert.doesNotMatch(routes, /calculateSecondaryProgressions\(/);
  assert.match(routes, /progressions_not_production_governed/);
});


test('approximate asteroid placements remain quarantined from production', () => {
  for (const calculateAsteroids of [
    calculateServiceAsteroids,
    calculatePackageAsteroids,
  ]) {
    assert.throws(
      () => calculateAsteroids(
        '1990-09-17',
        '11:11',
        'America/New_York',
        0,
      ),
      /asteroid_placements_not_production_ready/,
    );
  }
});


test('legacy symbolic identity calculators match their unavailable registry state', () => {
  assert.throws(
    () => calculateChineseAstrology('1990-09-17'),
    /chinese_astrology_unavailable/,
  );
  assert.throws(
    () => calculateMayanAstrology('1990-09-17'),
    /mayan_astrology_unavailable/,
  );
  assert.throws(
    () => calculateKabbalah('Bobby', '1990-09-17', 9),
    /kabbalah_unavailable/,
  );
  assert.throws(
    () => calculateAyurveda('1990-09-17', {}, {}),
    /ayurveda_unavailable/,
  );
});


test('Arabic Parts and fixed stars remain unavailable until their astronomy contracts are governed', () => {
  assert.throws(
    () => calculateArabicParts(0, 10, 20, 30, 40, 50, true),
    /arabic_parts_unavailable:governed_lot_convention_required/,
  );
  assert.throws(
    () => calculateFixedStars({ Sun: 150 }),
    /fixed_stars_unavailable:epoch_aware_governed_catalog_required/,
  );
});
