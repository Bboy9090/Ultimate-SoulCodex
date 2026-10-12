import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const timeline = readFileSync(new URL("../client/src/pages/TimelinePage.tsx", import.meta.url), "utf8");

test("Timeline admits Human Design context only with current HD depth entitlement", () => {
  assert.match(timeline, /tierAllowsCapability\(tier, "human_design_depth"\)/);
  assert.match(timeline, /hdVerified = canSeeHumanDesignDepth && hasVerifiedHumanDesignTrust\(humanDesign\)/);
  assert.match(timeline, /\[profile, canSeeHumanDesignDepth\]/);
  assert.match(timeline, /if \(profileContext\.hdVerified\)/);
  assert.match(timeline, /profileContext\.hdVerified \? \(/);
});

test("Timeline advanced daily limit remains tier-driven", () => {
  assert.match(timeline, /DAILY_INFLUENCE_LIMIT\[tier\]/);
  assert.match(timeline, /tierAllowsCapability\(tier, "advanced_daily"\)/);
});


test("Timeline does not show a cached deeper archetype title on Free", () => {
  assert.match(timeline, /tierAllowsCapability\(tier, "interpretation_depth"\)/);
  assert.match(timeline, /canSeeInterpretationDepth && profile\?\.archetype/);
});
