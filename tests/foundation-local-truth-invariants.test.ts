import assert from "node:assert/strict";
import test from "node:test";
import { birthDataSchema } from "../shared/schema";
import { generateFoundationOfflineCodexProfile } from "../client/src/lib/foundationOfflineCodex";

const base = {
  name: "Truth boundary", birthDate: "1990-09-17", birthLocation: "Bronx, New York",
  timezone: "America/New_York", latitude: "40.8448", longitude: "-73.8648",
};

test("complete local inputs never manufacture verified astronomy or Human Design", () => {
  for (const birthTime of ["", "00:00", "11:11", "23:59"]) {
    const profile = generateFoundationOfflineCodexProfile({ ...base, birthTime });
    assert.equal(profile.astrologyData.moonSign, "");
    assert.equal(profile.astrologyData.risingSign, "");
    assert.deepEqual(profile.astrologyData.planets, {});
    assert.deepEqual(profile.astrologyData.houses, []);
    assert.deepEqual(profile.astrologyData.aspects, []);
    assert.equal(profile.depthInterpretation.evidence.some((entry) => entry.system === "astrology" || entry.system === "human-design"), false);
    assert.equal(profile.depthInterpretation.evidence.some((entry) => entry.id.includes("sun")), false);
  }
});

test("unknown time remains explicit from schema through generated narrative", () => {
  const input = birthDataSchema.parse({ ...base, birthTime: "" });
  const profile = generateFoundationOfflineCodexProfile(input);
  assert.equal(profile.birthTime, null);
  assert.equal(profile.birthTimeStatus, "unknown");
  assert.match(profile.depthInterpretation.missingData.join(" "), /Rising.*exact birth time/i);
  assert.equal(profile.astrologyData.risingSign, "");
});
