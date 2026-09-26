import assert from "node:assert/strict";
import test from "node:test";
import { PERSONAL_ATLAS_HOUSE_CONTRACT, personalAtlasPlacements, verifiedHouseCusps } from "../client/src/lib/personalAstrologyAtlas";

const provenance = {
  source: "Independent atlas fixture",
  engine: "test-independent-engine",
  calculatedAt: "2026-09-26T00:00:00.000Z",
};

function chart() {
  const houses = Array.from({ length: 12 }, (_, index) => ({
    house: index + 1,
    sign: "Aries",
    verificationStatus: "verified",
    policyId: "ASTRO-EQUAL-HOUSE-v1",
    evidenceArtifactId: "equal-house-fixture",
    longitude: 0,
    degree: 0,
  }));
  const planets = Object.fromEntries(["sun","moon","mercury","venus","mars","jupiter","saturn","uranus","neptune","pluto"].map(key => [key, { sign: "Virgo", verificationStatus: "verified", evidence: provenance }]));
  const planetaryHouses = Object.fromEntries(Object.keys(planets).map((key, index) => [key, index + 1]));
  return {
    houseSystem: "equal",
    houses,
    planets,
    planetaryHouses,
    rising: { sign: "Scorpio", verificationStatus: "verified", evidence: provenance },
    midheaven: {
      sign: "Leo",
      verificationStatus: "verified",
      evidence: provenance,
      policyId: "ASTRO-EQUAL-HOUSE-v1",
      evidenceArtifactId: "equal-house-fixture",
    },
    northNode: {
      sign: "Aquarius",
      house: 4,
      verificationStatus: "verified",
      evidence: provenance,
      mode: "mean",
      policyId: "ASTRO-MEAN-NODE-v1",
      evidenceArtifactId: "mean-node-fixture",
    },
    southNode: {
      sign: "Leo",
      house: 10,
      verificationStatus: "verified",
      evidence: provenance,
      mode: "mean",
      policyId: "ASTRO-MEAN-NODE-v1",
      evidenceArtifactId: "mean-node-fixture",
    },
    chiron: {
      sign: "Cancer",
      house: 9,
      verificationStatus: "verified",
      evidence: provenance,
      policyId: "ASTRO-CHIRON-v1",
      evidenceArtifactId: "chiron-fixture",
      qualificationMethod: "live-jpl-qualified-against-swiss",
    },
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


test("status-only placements without provenance never appear in the atlas", () => {
  const input = chart();
  delete input.planets.sun.evidence;
  delete input.rising.evidence;
  const placements = personalAtlasPlacements(input);
  assert.equal(placements.some(row => row.key === "sun"), false);
  assert.equal(placements.some(row => row.key === "rising"), false);
});


test("verified-status house geometry without policy evidence fails closed", () => {
  const missingPolicy = chart();
  delete missingPolicy.houses[0].policyId;
  assert.deepEqual(personalAtlasPlacements(missingPolicy), []);
  assert.deepEqual(verifiedHouseCusps(missingPolicy), []);

  const missingArtifact = chart();
  missingArtifact.houses[0].evidenceArtifactId = "";
  assert.deepEqual(personalAtlasPlacements(missingArtifact), []);
  assert.deepEqual(verifiedHouseCusps(missingArtifact), []);
});
