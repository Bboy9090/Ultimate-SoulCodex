import assert from "node:assert/strict";
import test from "node:test";
import { projectProfileResponseForTier } from "../server/lib/profile-response-access.ts";

const profile = {
  id: "profile-1",
  name: "Bobby",
  astrologyData: {},
  personalityData: {},
  archetypeData: { title: "Stored Plus Archetype", description: "stored plus description", guidance: "stored plus guidance", shadows: ["stored shadow"] },
  biography: "stored plus biography secret",
  dailyGuidance: "stored plus guidance secret",
  depthInterpretation: { secret: "paid depth" },
  synthesis: { secret: "paid synthesis" },
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


test("Free profile response regenerates shallow prose from allowed projected inputs", () => {
  const out = projectProfileResponseForTier(profile, "free");
  assert.notEqual(out.biography, "stored plus biography secret");
  assert.notEqual(out.dailyGuidance, "stored plus guidance secret");
  assert.equal(out.depthInterpretation, null);
  assert.equal(out.synthesis, null);
  assert.deepEqual(out.archetypeData.shadows, []);
  assert.doesNotMatch(JSON.stringify(out.archetypeData), /stored shadow|Stored Plus Archetype|paid depth|paid synthesis/);
});

test("Plus profile response preserves stored interpretation depth", () => {
  const out = projectProfileResponseForTier(profile, "plus");
  assert.equal(out.biography, "stored plus biography secret");
  assert.equal(out.dailyGuidance, "stored plus guidance secret");
  assert.deepEqual(out.depthInterpretation, { secret: "paid depth" });
  assert.deepEqual(out.synthesis, { secret: "paid synthesis" });
});
