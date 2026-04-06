import { test } from "node:test";
import assert from "node:assert/strict";

import { generateTimeline, resolveTimelinePhase } from "../index";

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

