import assert from "node:assert/strict";
import test from "node:test";
import { hasCompleteMinuteRangeEvidence } from "../packages/core/placement/types";
import { getSynthesisPlacement } from "../client/src/lib/placementVerification";
import { getSynthesisAstrologySign } from "../client/src/lib/profileVerificationReconciliation";

const base = {
  resolutionMinutes: 1,
  rangeStartLocal: "2023-03-12T00:00",
  rangeEndLocal: "2023-03-12T23:59",
};
const spring = {
  ...base, timezone: "America/New_York",
  expectedValues: 1380, testedValues: 1380,
  validLocalMinutes: 1380, nonexistentLocalMinutes: 60,
  ambiguousLocalMinutes: 0, invalidLocalMinutes: 0,
};
const fall = {
  ...base, rangeStartLocal: "2023-11-05T00:00",
  rangeEndLocal: "2023-11-05T23:59",
  expectedValues: 1500, testedValues: 1500,
  validLocalMinutes: 1440, nonexistentLocalMinutes: 0,
  ambiguousLocalMinutes: 60, invalidLocalMinutes: 0,
};
const legacy = { ...base, testedValues: 1440 };

test("full 23-hour, 25-hour, and legacy 24-hour evidence remains eligible", () => {
  for (const range of [spring, fall, legacy]) {
    assert.equal(hasCompleteMinuteRangeEvidence(range), true);
    const placement = {
      sign: "Pisces",
      verificationStatus: "calculated",
      evidenceState: "stable_across_range" as const,
      rangeEvidence: range,
    };
    assert.equal(getSynthesisPlacement(placement)?.sign, "Pisces");
    assert.equal(getSynthesisAstrologySign({ sun: placement } as any, "sun"), "Pisces");
  }
});

test("incomplete or forged range evidence cannot enter synthesis", () => {
  for (const range of [
    { ...spring, testedValues: 1379 },
    { ...spring, expectedValues: 1440 },
    { ...spring, invalidLocalMinutes: 1 },
    { ...spring, nonexistentLocalMinutes: 59 },
    { ...fall, ambiguousLocalMinutes: 59 },
    { ...base, testedValues: 1380 },
    { ...base, testedValues: 1500 },
    { ...base, timezone: "America/New_York", testedValues: 1440 },
    { ...fall, expectedValues: undefined, testedValues: 1440 },
    { ...base, testedValues: 1440, resolutionMinutes: 15 },
  ]) {
    assert.equal(hasCompleteMinuteRangeEvidence(range), false);
    const placement = {
      sign: "Pisces",
      verificationStatus: "calculated",
      evidenceState: "stable_across_range" as const,
      rangeEvidence: range,
    };
    assert.equal(getSynthesisPlacement(placement), null);
    assert.equal(getSynthesisAstrologySign({ sun: placement } as any, "sun"), null);
  }
});

test("ordinary legacy receipts with an IANA timezone remain compatible", () => {
  const ordinary = {
    resolutionMinutes: 1,
    rangeStartLocal: "2023-02-15T00:00",
    rangeEndLocal: "2023-02-15T23:59",
    timezone: "America/New_York",
    testedValues: 1440,
  };
  assert.equal(hasCompleteMinuteRangeEvidence(ordinary), true);
});
