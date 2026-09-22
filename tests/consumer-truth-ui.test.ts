import assert from "node:assert/strict";
import test from "node:test";
import type { DailyPulseEntry } from "../client/src/lib/dailyPulseStorage.ts";
import {
  buildTimelineLivedSignals,
  TIMELINE_LOOKBACK_ENTRIES,
  trackingDepth,
} from "../client/src/lib/timelineIntelligenceViewModel.ts";
import {
  shouldOfferVerification,
  verificationOutcome,
} from "../client/src/lib/profileVerificationUi.ts";

function pulse(
  day: number,
  mood: DailyPulseEntry["mood"],
  energy: DailyPulseEntry["energy"],
  alignment: DailyPulseEntry["alignment"],
): DailyPulseEntry {
  const date = `2026-09-${String(day).padStart(2, "0")}`;
  return {
    version: 1,
    date,
    mood,
    energy,
    alignment,
    createdAt: `${date}T12:00:00.000Z`,
    updatedAt: `${date}T12:00:00.000Z`,
  };
}

test("a partial verification response remains retryable", () => {
  const attempt = verificationOutcome(true);
  assert.equal(attempt, "partial");
  assert.equal(shouldOfferVerification(true, attempt), true);
  assert.equal(shouldOfferVerification(true, "running"), true);
});

test("a complete verification response does not offer another request", () => {
  const attempt = verificationOutcome(false);
  assert.equal(attempt, "complete");
  assert.equal(shouldOfferVerification(false, attempt), false);
});

test("Timeline lived metrics come from the analyzed entries", () => {
  const entries = [
    pulse(10, "clear", 5, 4),
    pulse(9, "clear", 3, 2),
    pulse(8, "steady", 4, 3),
    pulse(7, "clear", 2, 5),
  ];
  const signals = buildTimelineLivedSignals(entries);

  assert.equal(signals.find((signal) => signal.metric === "energy")?.value, 3.5);
  assert.equal(signals.find((signal) => signal.metric === "alignment")?.value, 3.5);
  assert.deepEqual(signals.find((signal) => signal.metric === "mood"), {
    dateRange: { start: "2026-09-07", end: "2026-09-10" },
    metric: "mood",
    value: "clear",
    frequency: 3,
    percentage: 75,
  });
});

test("tracking depth is capped against the declared 30-entry analysis window", () => {
  assert.equal(TIMELINE_LOOKBACK_ENTRIES, 30);
  assert.equal(trackingDepth(0), 0);
  assert.equal(trackingDepth(15), 0.5);
  assert.equal(trackingDepth(30), 1);
  assert.equal(trackingDepth(45), 1);
});
