import assert from 'node:assert/strict';
import test from 'node:test';
import { ATLAS_SIGNS, PLANET_FUNCTIONS, atlasEntry, birthInputGuidance, personalAngleMeaning, personalPlacementMeaning } from '../client/src/lib/astrologyAtlas';
test('all 144 combinations have distinct domain-aware content', () => {
  const entries = ATLAS_SIGNS.flatMap(sign => Array.from({length:12}, (_,i) => atlasEntry(sign,i+1)));
  assert.equal(new Set(entries.map(x => x.meaning)).size,144);
  assert.equal(new Set(entries.map(x => x.practice)).size,144);
  for (const e of entries) for (const value of Object.values(e)) assert.ok(value.length > 5);
  assert.throws(() => atlasEntry('Aries',1.5),RangeError);
  assert.throws(() => atlasEntry('Aries',0),RangeError);
  assert.throws(() => atlasEntry('Aries',13),RangeError);
});
test('planet-sign-house explanations keep what, how, and where distinct', () => {
  const meaning = personalPlacementMeaning('moon','Virgo',10);
  assert.match(meaning.what,/emotional needs/);
  assert.match(meaning.how,/Virgo/);
  assert.match(meaning.where,/House 10/);
  assert.match(meaning.synthesis,/Moon in Virgo in House 10/);
  assert.throws(() => personalPlacementMeaning('fortune','Virgo',10),RangeError);
});
test('every supported planet or point can explain every sign-house placement', () => {
  for (const body of Object.keys(PLANET_FUNCTIONS).filter(body => body !== 'rising' && body !== 'midheaven')) {
    for (const sign of ATLAS_SIGNS) {
      for (let house = 1; house <= 12; house += 1) {
        const meaning = personalPlacementMeaning(body, sign, house);
        assert.match(meaning.how, new RegExp(sign));
        assert.match(meaning.where, new RegExp(`House ${house}`));
        assert.match(meaning.synthesis, new RegExp(`${sign} in House ${house}`));
        assert.ok(meaning.practice.length > 20);
      }
    }
  }
});
test('verified angles have dedicated sign meanings and never masquerade as house placements', () => {
  for (const body of ['rising','midheaven'] as const) {
    for (const sign of ATLAS_SIGNS) {
      const meaning = personalAngleMeaning(body, sign);
      assert.match(meaning.how, new RegExp(sign));
      assert.match(meaning.where, /angle/i);
      assert.doesNotMatch(meaning.where, /House \d+/);
      assert.match(meaning.synthesis, /angle interpretation|Ascendant|Midheaven/i);
      assert.ok(meaning.practice.length > 20);
    }
  }
});

test('different chart signatures do not collapse into the same placement profile', () => {
  const virgoSignature = [
    personalPlacementMeaning('sun','Virgo',1).synthesis,
    personalPlacementMeaning('moon','Virgo',4).synthesis,
    personalPlacementMeaning('mars','Capricorn',10).synthesis,
  ].join('\n');
  const geminiSagittariusSignature = [
    personalPlacementMeaning('sun','Gemini',1).synthesis,
    personalPlacementMeaning('moon','Sagittarius',4).synthesis,
    personalPlacementMeaning('mars','Virgo',10).synthesis,
  ].join('\n');
  assert.notEqual(virgoSignature, geminiSagittariusSignature);
  assert.match(virgoSignature,/Sun in Virgo in House 1/);
  assert.match(geminiSagittariusSignature,/Moon in Sagittarius in House 4/);
});
test('unknown time overrides a stored default and never blocks educational exploration', () => {
  const profile = {birthDate:'1990-09-17',birthTime:'12:00',birthTimeStatus:'unknown'};
  const snapshot = JSON.stringify(profile);
  assert.match(birthInputGuidance(profile).title,/stay unknown/);
  assert.match(birthInputGuidance(profile).detail,/do not substitute noon/);
  assert.equal(JSON.stringify(profile),snapshot);
  assert.match(birthInputGuidance(null).detail,/144/);
  assert.match(birthInputGuidance({birthDate:'1990-09-17',birthTime:'25:90'}).title,/unknown/);
});
test('valid time needs a birthplace timezone and house conventions remain explicit', () => {
  assert.match(birthInputGuidance({birthDate:'1990-09-17',birthTime:'11:11'}).title,/timezone/);
  assert.match(birthInputGuidance({birthDate:'1990-09-17',birthTime:'11:11',timezone:'America/New_York'}).detail,/Porphyry/);
});
