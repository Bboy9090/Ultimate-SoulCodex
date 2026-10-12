import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const systems = readFileSync(new URL("../client/src/pages/SystemsDetailsPage.tsx", import.meta.url), "utf8");
const offline = readFileSync(new URL("../client/src/pages/offline-profile.tsx", import.meta.url), "utf8");

test("Systems inspector passes current entitlement into combined synthesis", () => {
  assert.match(systems, /useProductAccess\(\)/);
  assert.match(systems, /tierAllowsCapability\(tier, "full_name_numerology"\)/);
  assert.match(systems, /tierAllowsCapability\(tier, "human_design_depth"\)/);
  assert.match(systems, /buildUltimateCodexSynthesis\(profile, \{[\s\S]*fullNameNumerology: canSeeFullNumerology[\s\S]*humanDesignCore: canSeeHumanDesignDepth/);
  assert.match(systems, /canSeeFullNumerology \? numerology\.expression : "Soul Codex\+"/);
  assert.match(systems, /humanDesignVerified && canSeeHumanDesignDepth/);
});

test("Offline profile passes current entitlement into cached-profile synthesis", () => {
  assert.match(offline, /useProductAccess\(\)/);
  assert.match(offline, /tierAllowsCapability\(tier, "full_name_numerology"\)/);
  assert.match(offline, /tierAllowsCapability\(tier, "human_design_depth"\)/);
  assert.match(offline, /buildUltimateCodexSynthesis\(reconciledProfile \?\? \{\}, \{[\s\S]*fullNameNumerology: canSeeFullNumerology[\s\S]*humanDesignCore: canSeeHumanDesignDepth/);
  assert.match(offline, /canSeeFullNumerology \? numerology\.expression : "Soul Codex\+"/);
});


test("Offline profile projects legacy cached biography and guidance by interpretation tier", () => {
  assert.match(offline, /canSeeInterpretationDepth/);
  assert.match(offline, /visibleDailyGuidance = canSeeInterpretationDepth \? profile\.dailyGuidance : freeGuidance/);
  assert.match(offline, /visibleBiography = canSeeInterpretationDepth[\s\S]*profile\.biography[\s\S]*ultimateCodex\.identitySignature/);
  assert.match(offline, /\{visibleBiography\}/);
  assert.doesNotMatch(offline, />\{profile\.biography\}<\/p>/);
});


test("Free offline profile does not render cached Plus depth interpretation", () => {
  assert.match(offline, /canSeeInterpretationDepth \? \(/);
  assert.match(offline, /<DepthSoulGuide interpretation=\{profile\.depthInterpretation\} \/>/);
  assert.match(offline, /data-testid="free-offline-diamond-clarity"/);
  assert.match(offline, /Open the full Free reading/);
  assert.match(offline, /\{ultimateCodex\.identitySignature\}/);
  assert.match(offline, /\{freeGuidance\}/);
});


test("Systems Plus Human Design surface is limited to the qualified core", () => {
  assert.match(systems, /NumberRow label="Type"/);
  assert.match(systems, /NumberRow label="Strategy"/);
  assert.match(systems, /NumberRow label="Authority"/);
  assert.match(systems, /NumberRow label="Profile"/);
  assert.doesNotMatch(systems, /NumberRow label="Definition"/);
  assert.doesNotMatch(systems, />Centers</);
  assert.doesNotMatch(systems, /Channels:/);
  assert.doesNotMatch(systems, /Activated gates:/);
  assert.match(systems, /not part of the current Soul Codex\+ promise yet/);
});


test("Offline Profile withholds unqualified Human Design bodygraph detail", () => {
  assert.doesNotMatch(offline, /<HumanDesignBodygraph/);
  assert.match(offline, /human-design-bodygraph-deferred/);
  assert.match(offline, /Definition, Centers, Channels, Gates, and activation detail are intentionally withheld/);
});
