import assert from "node:assert/strict";
import test from "node:test";
import { PERSONAL_ATLAS_HOUSE_CONTRACT, personalAtlasPlacements, verifiedHouseCusps } from "../client/src/lib/personalAstrologyAtlas";

const placementEvidence = {
  source: "independent ephemeris comparison",
  engine: "atlas-test-reference@1",
  calculatedAt: "2026-09-26T18:00:00.000Z",
};

function chart() {
  const houses = Array.from({ length: 12 }, (_, index) => ({
    house: index + 1,
    sign: "Aries",
    verificationStatus: "verified",
    policyId: "ASTRO-EQUAL-HOUSE-v1",
    evidenceArtifactId: "equal-house-atlas-test",
  }));
  const planets = Object.fromEntries(["sun","moon","mercury","venus","mars","jupiter","saturn","uranus","neptune","pluto"].map(key => [key, { sign: "Virgo", verificationStatus: "verified", evidence: placementEvidence }]));
  const planetaryHouses = Object.fromEntries(Object.keys(planets).map((key, index) => [key, index + 1]));
  return {
    houseSystem: "equal",
    houses,
    planets,
    planetaryHouses,
    rising: { sign: "Scorpio", verificationStatus: "verified", evidence: placementEvidence },
    midheaven: { sign: "Leo", verificationStatus: "verified", policyId: "ASTRO-EQUAL-HOUSE-v1", evidenceArtifactId: "equal-house-atlas-test" },
    northNode: { sign: "Aquarius", house: 4, mode: "mean", verificationStatus: "verified", policyId: "ASTRO-MEAN-NODE-v1", evidenceArtifactId: "mean-node-atlas-test" },
    southNode: { sign: "Leo", house: 10, mode: "mean", verificationStatus: "verified", policyId: "ASTRO-MEAN-NODE-v1", evidenceArtifactId: "mean-node-atlas-test" },
    chiron: { sign: "Cancer", house: 9, verificationStatus: "verified", policyId: "ASTRO-CHIRON-v1", evidenceArtifactId: "chiron-atlas-test", qualificationMethod: "live-jpl-qualified-against-swiss" },
  };
}

test("verified Equal-house records populate a personal atlas", () => {
  const placements = personalAtlasPlacements(chart());
  assert.equal(placements.length, 15);
  assert.deepEqual(placements[0], { key: "sun", label: "Sun", sign: "Virgo", house: 1, kind: "planet" });
  assert.deepEqual(placements.find(row => row.key === "rising"), { key: "rising", label: "Ascendant / Rising", sign: "Scorpio", kind: "angle" });
  assert.deepEqual(placements.find(row => row.key === "midheaven"), { key: "midheaven", label: "Midheaven", sign: "Leo", kind: "angle" });
  assert.equal(PERSONAL_ATLAS_HOUSE_CONTRACT, "ASTRO-EQUAL-HOUSE-v1");
  assert.equal(verifiedHouseCusps(chart()).length, 12);
});

test("label-only verified placements never enter the personal atlas", () => {
  const input = chart();
  input.planets.sun = { sign: "Virgo", verificationStatus: "verified" } as any;
  input.rising = { sign: "Scorpio", verificationStatus: "verified" } as any;
  const placements = personalAtlasPlacements(input);
  assert.equal(placements.some(row => row.key === "sun"), false);
  assert.equal(placements.some(row => row.key === "rising"), false);
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

test("verified records with unsupported sign labels fail closed", () => {
  const invalidPlanet = chart();
  invalidPlanet.planets.sun.sign = "Not a sign";
  assert.equal(personalAtlasPlacements(invalidPlanet).some(row => row.key === "sun"), false);

  const invalidCusp = chart();
  invalidCusp.houses[3].sign = "Ophiuchus";
  assert.deepEqual(personalAtlasPlacements(invalidCusp), []);
  assert.deepEqual(verifiedHouseCusps(invalidCusp), []);
});
