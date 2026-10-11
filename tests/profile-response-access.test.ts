import assert from "node:assert/strict";
import test from "node:test";
import { projectProfileResponseForTier } from "../server/lib/profile-response-access.ts";

const profile = {
  id: "profile-1",
  name: "Bobby",
  numerologyData: {
    status: "resolved",
    lifePath: 9,
    birthday: 17,
    personalYear: 8,
    expression: 4,
    soulUrge: 5,
    personality: 8,
    maturity: 4,
    interpretations: {
      lifePath: "life",
      birthday: "birthday",
      personalYear: "year",
      expression: "expression",
      soulUrge: "soul",
      personality: "personality",
      maturity: "maturity",
    },
  },
  humanDesignData: {
    status: "verified",
    type: "Reflector",
    strategy: "Wait a lunar cycle",
    authority: "Lunar Authority",
    profile: "2/5",
    definition: "No Definition",
    centers: { defined: [], undefined: ["Head"] },
    channels: ["1-8"],
    activatedGates: [1, 8],
    engine: "soulcodex-hd-geocentric-v1",
    source: "verified source",
    calculatedAt: "2026-09-26T18:00:00.000Z",
    inputTimestampUtc: "1990-09-17T15:11:00.000Z",
    verificationReceiptId: "receipt",
    independentSource: "independent",
    verifiedAt: "2026-09-19T23:03:08.000Z",
  },
};

test("Free profile response preserves date numerology while withholding paid name numerology", () => {
  const out = projectProfileResponseForTier(profile, "free");
  assert.equal(out.numerologyData.lifePath, 9);
  assert.equal(out.numerologyData.birthday, 17);
  assert.equal(out.numerologyData.personalYear, 8);
  assert.equal(out.numerologyData.expression, undefined);
  assert.equal(out.numerologyData.soulUrge, undefined);
  assert.equal(out.numerologyData.personality, undefined);
  assert.equal(out.numerologyData.maturity, undefined);
  assert.deepEqual(Object.keys(out.numerologyData.interpretations).sort(), ["birthday", "lifePath", "personalYear"]);
});

test("Free profile response keeps Human Design provenance but withholds interpretive values", () => {
  const out = projectProfileResponseForTier(profile, "free");
  assert.equal(out.humanDesignData.status, "verified_locked");
  assert.equal(out.humanDesignData.engine, "soulcodex-hd-geocentric-v1");
  assert.equal(out.humanDesignData.verificationReceiptId, "receipt");
  for (const key of ["type", "strategy", "authority", "profile", "definition", "centers", "channels", "activatedGates"]) {
    assert.equal(out.humanDesignData[key], undefined, key);
  }
});

test("Plus profile response preserves qualified stored fields", () => {
  const out = projectProfileResponseForTier(profile, "plus");
  assert.equal(out.numerologyData.expression, 4);
  assert.equal(out.numerologyData.soulUrge, 5);
  assert.equal(out.humanDesignData.type, "Reflector");
  assert.equal(out.humanDesignData.authority, "Lunar Authority");
});

test("projection does not mutate the stored profile object", () => {
  projectProfileResponseForTier(profile, "free");
  assert.equal(profile.numerologyData.expression, 4);
  assert.equal(profile.humanDesignData.type, "Reflector");
  assert.equal(profile.humanDesignData.status, "verified");
});
