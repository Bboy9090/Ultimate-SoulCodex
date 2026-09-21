import assert from "node:assert/strict";
import test from "node:test";
import { personalAtlasPlacements, verifiedHouseCusps } from "../client/src/lib/personalAstrologyAtlas";

function chart() {
  const houses = Array.from({ length: 12 }, (_, index) => ({ house: index + 1, sign: "Aries", verificationStatus: "verified" }));
  const planets = Object.fromEntries(["sun","moon","mercury","venus","mars","jupiter","saturn","uranus","neptune","pluto"].map(key => [key, { sign: "Virgo", verificationStatus: "verified" }]));
  const planetaryHouses = Object.fromEntries(Object.keys(planets).map((key, index) => [key, index + 1]));
  return { houseSystem: "equal", houses, planets, planetaryHouses, midheaven: { sign: "Leo", verificationStatus: "verified" }, northNode: { sign: "Aquarius", house: 4, verificationStatus: "verified" }, southNode: { sign: "Leo", house: 10, verificationStatus: "verified" }, chiron: { sign: "Cancer", house: 9, verificationStatus: "verified", qualificationMethod: "live-jpl-qualified-against-swiss" } };
}

test("verified Equal-house records populate a personal atlas", () => {
  const placements = personalAtlasPlacements(chart());
  assert.equal(placements.length, 14);
  assert.deepEqual(placements[0], { key: "sun", label: "Sun", sign: "Virgo", house: 1, kind: "planet" });
  assert.equal(verifiedHouseCusps(chart()).length, 12);
});

test("partial, legacy, or differently governed charts fail closed", () => {
  assert.deepEqual(personalAtlasPlacements({ ...chart(), houseSystem: "porphyry" }), []);
  const incomplete = chart(); incomplete.houses.pop();
  assert.deepEqual(personalAtlasPlacements(incomplete), []);
  const unverified = chart(); unverified.houses[2].verificationStatus = "candidate";
  assert.deepEqual(personalAtlasPlacements(unverified), []);
});

test("unverified placements and unqualified Chiron never appear", () => {
  const input = chart();
  input.planets.moon.verificationStatus = "candidate";
  input.chiron.qualificationMethod = "calculated-only";
  const placements = personalAtlasPlacements(input);
  assert.equal(placements.some(row => row.key === "moon"), false);
  assert.equal(placements.some(row => row.key === "chiron"), false);
});
