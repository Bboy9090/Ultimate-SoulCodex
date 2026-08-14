import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const app = readFileSync("client/src/App.tsx", "utf8");
const profile = readFileSync("client/src/pages/profile.tsx", "utf8");
const offlineProfile = readFileSync("client/src/pages/offline-profile.tsx", "utf8");
const pricing = readFileSync("client/src/pages/PricingPage.tsx", "utf8");

const retiredRoutePatterns = [/\/palmistry\//i, /\/astrocartography\//i];

for (const [surface, source] of [
  ["App router", app],
  ["server-backed Profile", profile],
  ["local Profile", offlineProfile],
  ["Pricing", pricing],
] as const) {
  test(`${surface} does not expose retired simulated premium analysis routes`, () => {
    for (const pattern of retiredRoutePatterns) {
      assert.doesNotMatch(source, pattern);
    }
  });
}

test("local Profile never imports the legacy random cosmic chart", () => {
  assert.doesNotMatch(offlineProfile, /CosmicChart/);
  assert.match(offlineProfile, /local-astronomy-unresolved-panel/);
});
