import { test } from "node:test";
import assert from "node:assert/strict";

import { generateTimeline, resolveTimelinePhase, timelinePersonalYearRuleKey } from "../index.js";

test("timeline: Partial confidence softens astrology but still resolves a phase", () => {
  const out = generateTimeline({
    profile: {
      birthDate: "1990-06-21",
      birthTime: "", // unknown time triggers Partial
      confidenceLabel: "partial",
      topThemes: [{ tag: "discipline", score: 0.9 }],
    },
    fullChart: null,
    currentDateISO: "2026-04-05T00:00:00.000Z",
  });

  assert.ok(out.phase);
  assert.equal(out.confidence.badge, "partial");
  assert.ok(out.reasons.length > 0);
});

test("timeline: Unverified confidence can ignore weak astrology signals", () => {
  const resolved = resolveTimelinePhase({
    personalYear: 4,
    astrologyCycles: ["neptune_hard"], // contains a +2 for Refinement which should be ignored when Unverified (<3)
    themeTags: [],
    confidence: "Unverified",
  });

  assert.ok(resolved.reasons.some((r) => r.includes("ignored (Unverified, below threshold)")));
});



test("timeline: master Personal Years use explicit phase-rule roots without changing stored value", () => {
  assert.equal(timelinePersonalYearRuleKey(11), 2);
  assert.equal(timelinePersonalYearRuleKey(22), 4);
  assert.equal(timelinePersonalYearRuleKey(33), 6);

  const resolved = resolveTimelinePhase({
    personalYear: 22,
    astrologyCycles: [],
    themeTags: [],
    confidence: "Partial",
  });
  assert.ok(resolved.reasons.some((reason) => reason.includes("Personal Year 22 (phase rule 4)")));
});

test("timeline: missing birth date does not invent Personal Year 1", () => {
  const out = generateTimeline({
    profile: {
      birthTime: "",
      confidenceLabel: "partial",
      topThemes: [{ tag: "discipline", score: 0.9 }],
    },
    fullChart: null,
    currentDateISO: "2026-04-05T00:00:00.000Z",
  });

  assert.ok(out.reasons.every((reason) => !reason.includes("Personal Year 1")));
});

test("timeline: invalid Personal Year values fail closed", () => {
  assert.throws(
    () => resolveTimelinePhase({
      personalYear: 12,
      astrologyCycles: [],
      themeTags: [],
      confidence: "Partial",
    }),
    /Timeline Personal Year/,
  );
});
