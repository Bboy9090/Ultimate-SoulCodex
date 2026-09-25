import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('public Galactic Code route cannot trust caller-declared evidence states', () => {
  const source = readFileSync(
    new URL('../server/routes/galactic-code.ts', import.meta.url),
    'utf8',
  );

  assert.match(source, /server-attested evidence/i);
  assert.match(source, /server_attested_evidence_required/);
  assert.doesNotMatch(source, /generateGalacticCode\(input\)/);
});

test('Galactic Code generator remains available only as an internal trusted construction primitive', () => {
  const source = readFileSync(
    new URL('../server/services/galactic-code/generator.ts', import.meta.url),
    'utf8',
  );

  assert.match(source, /maySystemInfluenceSynthesis/);
  assert.match(source, /function synthesisEligibleInput/);
});
