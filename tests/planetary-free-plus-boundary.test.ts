import assert from "node:assert/strict";
import test from "node:test";
import { chartPlacementReading } from "../client/src/lib/chartPlacementReading";
import { buildClarityReadingModel } from "../client/src/lib/clarityReadingModel";
import { verifiedProductTier } from "../shared/product-access";

test("Free retains a complete placement answer while Plus adds separate supported depth", () => {
  const free = chartPlacementReading("mercury", "Virgo", 11, "verified", false)!;
  const plus = chartPlacementReading("mercury", "Virgo", 11, "verified", true)!;
  assert.equal(free.depth, undefined);
  for (const key of ["title", "meaning", "gift", "tension", "action", "evidence"] as const) assert.equal(free[key], plus[key]);
  assert.match(plus.depth!.relationships, /Mercury in Virgo/);
  assert.match(plus.depth!.decisions, /perception, language, learning/);
  assert.match(plus.depth!.reflection, /How do I make sense of what I notice/);
  assert.doesNotMatch(JSON.stringify(chartPlacementReading("moon", "Aries", null, "stable", true)!.depth), /House \d/);
});

test("Free reading does not project Plus planetary depth from cached data", () => {
  const sun = { sign: "Virgo", verificationStatus: "verified", evidence: { source: "independent", engine: "qualified", calculatedAt: "2026-10-28T00:00:00Z" } };
  const profile = { birthDate: "1990-09-17", verifiedAstrologyData: { sun, planets: { sun } }, depthInterpretation: { summary: "Cached premium prose" } };
  const free = buildClarityReadingModel(profile, { fullNameNumerology: false, humanDesignCore: true, interpretationDepth: false });
  const plus = buildClarityReadingModel(profile, { fullNameNumerology: true, humanDesignCore: true, interpretationDepth: true });
  assert.ok(free.planetaryReadings?.[0].meaning);
  assert.equal(free.planetaryReadings?.[0].depth, undefined);
  assert.ok(plus.planetaryReadings?.[0].depth);
  assert.doesNotMatch(JSON.stringify(free), /Cached premium prose/);
});

test("an unverified or provider-free tier label cannot open Plus", () => {
  assert.equal(verifiedProductTier({ tier: "plus", verified: false, source: "apple" }), "free");
  assert.equal(verifiedProductTier({ tier: "plus", verified: true, source: "free" }), "free");
  assert.equal(verifiedProductTier({ tier: "plus", verified: true, source: "google_play" }), "plus");
  assert.equal(verifiedProductTier(undefined), "free");
});
