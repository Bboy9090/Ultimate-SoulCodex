import assert from "node:assert/strict";
import test from "node:test";
import { buildClarityReadingModel } from "../client/src/lib/clarityReadingModel.ts";

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

function verifiedChart() {
  const houses = Array.from({ length: 12 }, (_, index) => ({
    house: index + 1,
    sign: SIGNS[index],
    longitude: index * 30,
    degree: 0,
    verificationStatus: "verified",
    policyId: "ASTRO-EQUAL-HOUSE-v1",
  }));
  return {
    verification: { policyId: "ASTRO-LONGITUDE-v1 + ASTRO-EQUAL-HOUSE-v1" },
    houseSystem: "equal",
    houses,
    sun: { sign: "Virgo", verificationStatus: "verified" },
    moon: { sign: "Cancer", verificationStatus: "verified" },
    rising: { sign: "Scorpio", verificationStatus: "verified" },
    planets: {
      sun: { sign: "Virgo", verificationStatus: "verified" },
    },
    planetaryHouses: { sun: 11 },
    midheaven: {
      sign: "Leo",
      verificationStatus: "verified",
      policyId: "ASTRO-EQUAL-HOUSE-v1",
    },
    northNode: {
      sign: "Aquarius",
      house: 3,
      mode: "mean",
      policyId: "ASTRO-MEAN-NODE-v1",
      verificationStatus: "verified",
    },
    southNode: {
      sign: "Leo",
      house: 9,
      mode: "mean",
      policyId: "ASTRO-MEAN-NODE-v1",
      verificationStatus: "verified",
    },
    chiron: {
      sign: "Cancer",
      house: 9,
      policyId: "ASTRO-CHIRON-v1",
      qualificationMethod: "live-jpl-qualified-against-swiss",
      verificationStatus: "verified",
    },
  };
}

test("a separate overlay cannot promote status-only or malformed astrology", () => {
  const model = buildClarityReadingModel({
    verifiedAstrologyData: {
      sun: { sign: "Virgo" },
      moon: { sign: "NotASign", verificationStatus: "verified" },
      rising: { sign: "Scorpio", verificationStatus: "candidate" },
      houseSystem: "equal",
      houses: Array.from({ length: 12 }, (_, index) => ({
        house: index + 1,
        sign: "Virgo",
        verificationStatus: "verified",
      })),
    },
  });

  assert.equal(model.signals.some((signal) => signal.confidence === "verified"), false);
  assert.equal(model.signals.some((signal) => signal.id === "houses"), false);
});

test("complete policy-bearing evidence reaches the clarity inspector", () => {
  const model = buildClarityReadingModel({
    verifiedAstrologyData: verifiedChart(),
    humanDesignData: {
      status: "verified",
      type: "Reflector",
      strategy: "Wait a lunar cycle",
      authority: "Lunar Authority",
      profile: "2/5",
    },
  });

  for (const id of [
    "sun", "moon", "rising", "houses", "midheaven", "placement-sun",
    "north-node", "south-node", "chiron", "hd-type", "hd-authority",
  ]) {
    assert.equal(model.signals.some((signal) => signal.id === id), true, id);
  }
});

test("an incomplete Human Design object is never labeled verified", () => {
  const model = buildClarityReadingModel({
    humanDesignData: { status: "verified", type: "Reflector" },
  });
  assert.equal(model.signals.some((signal) => signal.id.startsWith("hd-")), false);
});
