import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const chart = readFileSync(new URL("../client/src/components/VerifiedNatalChart.tsx", import.meta.url), "utf8");
const offline = readFileSync(new URL("../client/src/pages/offline-profile.tsx", import.meta.url), "utf8");

test("verified natal geometry stays available independent of interpretation depth", () => {
  assert.match(chart, /verified geometry/);
  assert.match(chart, /synthesis\.placements\.map/);
  assert.match(chart, /synthesis\.houseCusps\.map/);
  assert.match(chart, /synthesis\.aspects/);
  assert.match(chart, /interpretationDepth = false/);
});

test("deeper natal interpretation is gated while core meanings remain visible", () => {
  assert.match(chart, /meaning\.headline/);
  assert.match(chart, /meaning\.synthesis/);
  assert.match(chart, /meaning\.meaning/);
  assert.match(chart, /interpretationDepth \? <>/);
  assert.match(chart, /natal-interpretation-plus-gate/);
  assert.match(chart, /The verified chart fact and core meaning stay visible on Free/);
  assert.match(chart, /Open deeper interpretation/);
});

test("offline profile passes the shared interpretation-depth capability into the natal chart", () => {
  assert.match(offline, /interpretationDepth=\{canSeeInterpretationDepth\}/);
  assert.match(offline, /tierAllowsCapability\(tier, "interpretation_depth"\)/);
});
