import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('public Galactic Code route cannot trust caller-declared evidence states', () => {
  const source = readFileSync(
    new URL('../server/routes/galactic-code.ts', import.meta.url),
    'utf8',
  );

  assert.match(source, /trusted_evidence_required|server-attested evidence/i);
  assert.doesNotMatch(source, /generateGalacticCode\(input\)/);
});

test('Galactic Code generator retains governed synthesis gating internally', () => {
  const source = readFileSync(
    new URL('../server/services/galactic-code/generator.ts', import.meta.url),
    'utf8',
  );

  assert.match(source, /maySystemInfluenceSynthesis/);
  assert.match(source, /synthesisEligibleInput/);
});
