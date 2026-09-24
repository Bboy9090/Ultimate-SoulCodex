import assert from "node:assert/strict";
import test from "node:test";
import { resolveUniqueZonedBirthTime } from "../compute/zoned-birth-time.ts";

test("resolves an ordinary local birth time to one UTC instant", () => {
  const result = resolveUniqueZonedBirthTime({
    birthDate: "1990-09-17",
    birthTime: "11:11",
    timezone: "America/New_York",
  });

  assert.equal(result.status, "resolved");
  if (result.status !== "resolved") return;
  assert.equal(result.iso, "1990-09-17T15:11:00.000Z");
});

test("rejects impossible dates, clock times, and timezones", () => {
  assert.deepEqual(
    resolveUniqueZonedBirthTime({
      birthDate: "1990-02-30",
      birthTime: "11:11",
      timezone: "America/New_York",
    }),
    { status: "unresolved", reason: "invalid_date" },
  );

  assert.deepEqual(
    resolveUniqueZonedBirthTime({
      birthDate: "1990-09-17",
      birthTime: "24:00",
      timezone: "America/New_York",
    }),
    { status: "unresolved", reason: "invalid_time" },
  );

  assert.deepEqual(
    resolveUniqueZonedBirthTime({
      birthDate: "1990-09-17",
      birthTime: "11:11",
      timezone: "Mars/Olympus",
    }),
    { status: "unresolved", reason: "invalid_timezone" },
  );
});

test("rejects DST gaps and repeated wall times", () => {
  assert.deepEqual(
    resolveUniqueZonedBirthTime({
      birthDate: "2026-03-08",
      birthTime: "02:30",
      timezone: "America/New_York",
    }),
    { status: "unresolved", reason: "nonexistent_local_time" },
  );

  assert.deepEqual(
    resolveUniqueZonedBirthTime({
      birthDate: "2026-11-01",
      birthTime: "01:30",
      timezone: "America/New_York",
    }),
    { status: "unresolved", reason: "ambiguous_local_time" },
  );
});
