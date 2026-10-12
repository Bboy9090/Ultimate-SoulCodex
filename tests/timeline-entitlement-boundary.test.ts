import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const timeline = readFileSync(new URL("../client/src/pages/TimelinePage.tsx", import.meta.url), "utf8");

test("Timeline admits verified Human Design core on Free", () => {
  assert.match(timeline, /tierAllowsCapability\(tier, "human_design_core"\)/);
  assert.match(timeline, /hdVerified = canSeeHumanDesignCore && hasVerifiedHumanDesignTrust\(humanDesign\)/);
  assert.match(timeline, /\[profile, canSeeHumanDesignCore\]/);
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
