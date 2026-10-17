import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  normalizedVerifiedLongitude,
  verifiedAscendantLongitude,
} from "../client/src/lib/natalWheelGeometry";

test("governed House 1 cusp is the only allowed natal wheel orientation", () => {
  const cusps = [
    { house: 2, longitude: 180 },
    { house: 1, longitude: 121.25 },
    { house: 3, longitude: 210 },
  ];
  assert.equal(verifiedAscendantLongitude(cusps), 121.25);
  assert.equal(verifiedAscendantLongitude([{ house: 2, longitude: 180 }]), null);
  assert.equal(verifiedAscendantLongitude([]), null);
  assert.equal(verifiedAscendantLongitude(null), null);
});

test("null, missing, strings, NaN and infinity cannot become fabricated 0-degree angles", () => {
  for (const value of [null, undefined, "", "0", "120", NaN, Infinity, -Infinity, {}]) {
    assert.equal(normalizedVerifiedLongitude(value), null);
  }
  assert.equal(normalizedVerifiedLongitude(0), 0);
  assert.equal(normalizedVerifiedLongitude(360), 0);
  assert.equal(normalizedVerifiedLongitude(-30), 330);
});

test("detailed natal wheel does not fall back to an internal unverified Rising candidate", () => {
  const chart = readFileSync("client/src/components/VerifiedNatalChart.tsx", "utf8");
  assert.match(chart, /verifiedAscendantLongitude\(synthesis\.houseCusps\)/);
  assert.doesNotMatch(chart, /rising\?\.internalCandidate\?\.longitude/);
  assert.match(chart, /verified-natal-chart-unavailable/);
});
