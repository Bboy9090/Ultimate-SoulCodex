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
  astrologyData: {},
  archetypeData: {
    title: "Premium Reflector Architect",
    description: "Premium archetype description using paid layers.",
    strengths: ["Premium strength"],
    shadows: ["Premium shadow"],
    themes: ["Premium theme"],
    guidance: "Premium archetype guidance.",
    tarotCards: ["legacy-card"],
  },
  biography: "Premium biography mentions Reflector 2/5 and Expression 4.",
  dailyGuidance: "Premium daily guidance mentions Lunar Authority.",
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


test("Free profile response replaces stored Plus prose with a Free-safe synthesis", () => {
  const out = projectProfileResponseForTier(profile, "free");
  assert.notEqual(out.biography, profile.biography);
  assert.notEqual(out.dailyGuidance, profile.dailyGuidance);
  assert.notEqual(out.archetypeData.title, profile.archetypeData.title);
  assert.doesNotMatch(out.biography, /Reflector|2\/5|Expression 4|Premium/i);
  assert.doesNotMatch(out.dailyGuidance, /Lunar Authority|Premium/i);
  assert.doesNotMatch(JSON.stringify(out.archetypeData), /Premium|legacy-card|Reflector|2\/5/i);\n  assert.deepEqual(out.archetypeData.shadows, []);
  assert.match(out.biography, /Life Path 9|symbolic reflection profile/i);
});

test("Plus profile response preserves stored deeper prose", () => {
  const out = projectProfileResponseForTier(profile, "plus");
  assert.equal(out.biography, profile.biography);
  assert.equal(out.dailyGuidance, profile.dailyGuidance);
  assert.equal(out.archetypeData.title, profile.archetypeData.title);
  assert.deepEqual(out.archetypeData.tarotCards, ["legacy-card"]);
});

test("Free prose projection does not mutate stored deeper prose", () => {
  projectProfileResponseForTier(profile, "free");
  assert.equal(profile.biography, "Premium biography mentions Reflector 2/5 and Expression 4.");
  assert.equal(profile.dailyGuidance, "Premium daily guidance mentions Lunar Authority.");
  assert.equal(profile.archetypeData.title, "Premium Reflector Architect");
  assert.deepEqual(profile.archetypeData.tarotCards, ["legacy-card"]);
});
