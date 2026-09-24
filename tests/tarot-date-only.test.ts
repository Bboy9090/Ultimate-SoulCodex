import assert from "node:assert/strict";
import test from "node:test";
import { getTarotBirthCards } from "../server/services/astrology.ts";

test("tarot birth-card arithmetic is stable across host timezones", () => {
  const originalTimezone = process.env.TZ;

  try {
    const results = ["UTC", "America/New_York", "Pacific/Honolulu", "Asia/Tokyo"].map(
      (timezone) => {
        process.env.TZ = timezone;
        return getTarotBirthCards("1990-09-17");
      },
    );

    for (const result of results.slice(1)) {
      assert.deepEqual(result, results[0]);
    }
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  }
});

test("tarot birth-card arithmetic rejects impossible calendar dates", () => {
  assert.throws(() => getTarotBirthCards("1990-02-30"), /real calendar date/);
  assert.throws(() => getTarotBirthCards("not-a-date"), /YYYY-MM-DD/);
});
