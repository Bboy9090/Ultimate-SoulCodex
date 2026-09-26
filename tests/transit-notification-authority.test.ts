import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('server transit notifications delegate to the governed package implementation', () => {
  const source = readFileSync('services/transit-notifications.ts', 'utf8');
  assert.match(
    source,
    /export * from ['"]../packages/astrology/transit-notifications['"]/,
  );
  assert.match(
    source,
    /export { default } from ['"]../packages/astrology/transit-notifications['"]/,
  );
  assert.doesNotMatch(source, /Transformation Transit|Mastery Challenge|Spiritual Awakening/);
});
