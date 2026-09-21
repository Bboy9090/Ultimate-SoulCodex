import assert from 'node:assert/strict';
import test from 'node:test';
import { ATLAS_SIGNS, atlasEntry, birthInputGuidance } from '../client/src/lib/astrologyAtlas';
test('all 144 combinations have distinct domain-aware content', () => {
  const entries = ATLAS_SIGNS.flatMap(sign => Array.from({length:12}, (_,i) => atlasEntry(sign,i+1)));
  assert.equal(new Set(entries.map(x => x.meaning)).size,144);
  assert.equal(new Set(entries.map(x => x.practice)).size,144);
  for (const e of entries) for (const value of Object.values(e)) assert.ok(value.length > 5);
  assert.throws(() => atlasEntry('Aries',1.5),RangeError);
  assert.throws(() => atlasEntry('Aries',0),RangeError);
  assert.throws(() => atlasEntry('Aries',13),RangeError);
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
