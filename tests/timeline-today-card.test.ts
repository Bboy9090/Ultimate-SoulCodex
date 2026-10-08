import assert from "node:assert/strict";
import test from "node:test";
import { localTimelineDate, readTimelineTodayCard } from "../client/src/lib/timelineTodayCard";

const now = new Date(2026, 9, 7, 23, 30);
const date = localTimelineDate(now);
const saved = (overrides: Record<string, unknown> = {}) => JSON.stringify({
  profileId: "profile-a", date, personalDayNumber: 4, moonPhase: "Waxing Crescent", ...overrides,
});

test("Timeline accepts only the active person's current local-day card", () => {
  assert.deepEqual(readTimelineTodayCard(saved(), "profile-a", now), {
    profileId: "profile-a", date, personalDayNumber: 4, moonPhase: "Waxing Crescent",
  });
  assert.equal(date, "2026-10-07");
});

test("switching profiles cannot reuse another person's daily signal", () => {
  assert.equal(readTimelineTodayCard(saved(), "profile-b", now), null);
  assert.equal(readTimelineTodayCard(saved(), undefined, now), null);
  assert.equal(readTimelineTodayCard(saved({ profileId: undefined }), "profile-a", now), null);
});

test("Timeline rejects stale, future, and unscoped legacy cards", () => {
  for (const value of ["2026-10-06", "2026-10-08", undefined]) {
    assert.equal(readTimelineTodayCard(saved({ date: value }), "profile-a", now), null);
  }
  assert.equal(readTimelineTodayCard(JSON.stringify({ personalDayNumber: 9 }), "profile-a", now), null);
});

test("malformed cache content cannot supply a personal-day fallback", () => {
  for (const raw of [null, "not-json", "null", "[]", "9"]) {
    assert.equal(readTimelineTodayCard(raw, "profile-a", now), null);
  }
  for (const value of [0, 10, "9", 1.5]) {
    assert.equal(readTimelineTodayCard(saved({ personalDayNumber: value, moonPhase: undefined }), "profile-a", now), null);
  }
  assert.equal(readTimelineTodayCard(saved(), "profile-a", new Date(NaN)), null);
});
