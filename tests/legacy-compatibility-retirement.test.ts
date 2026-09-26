import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../routes.ts', import.meta.url), 'utf8');

test('root router does not import the retired aggregate compatibility engine', () => {
  assert.doesNotMatch(source, /from "\.\/services\/compatibility"/);
  assert.doesNotMatch(source, /calculateCompatibility\(/);
});

test('legacy aggregate compatibility endpoints stay retired', () => {
  assert.match(source, /app\.post\("\/api\/compatibility"[\s\S]*legacy_compatibility_retired/);
  assert.match(source, /app\.get\("\/api\/compatibility\/:profile1Id\/:profile2Id"[\s\S]*legacy_compatibility_retired/);
  assert.match(source, /app\.get\("\/api\/compatibility\/:profileId"[\s\S]*legacy_compatibility_retired/);
  assert.match(source, /app\.post\("\/api\/pdf\/compatibility"[\s\S]*legacy_compatibility_pdf_retired/);
});
