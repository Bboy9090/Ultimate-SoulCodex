import assert from 'node:assert/strict';
import test from 'node:test';
import { calcLifePath } from '../compute/numerology.js';
import { calcPersonalYear } from '../compute/personal-numbers.js';
import { calcLifePathWithEvidence } from '../evidence-ledger/integrations.js';

test('Bobby fixture resolves Life Path 9 in every host timezone', () => {
  const originalTimezone = process.env.TZ;

  try {
    for (const timezone of ['UTC', 'America/New_York', 'Pacific/Honolulu', 'Asia/Tokyo']) {
      process.env.TZ = timezone;
      assert.equal(calcLifePath('1990-09-17'), 9, timezone);
      assert.equal(calcPersonalYear('1990-09-17', 2026), 9, timezone);
    }
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  }
});

test('Life Path evidence preserves the entered calendar date', () => {
  const result = calcLifePathWithEvidence('1990-09-17');

  assert.equal(result.value, 9);
  assert.deepEqual(result.evidence.inputsUsed, [
    'birth_month_9',
    'birth_day_17',
    'birth_year_1990',
  ]);
});

test('date-only numerology rejects impossible calendar dates', () => {
  assert.throws(() => calcLifePath('1990-02-30'), /real calendar date/);
});
