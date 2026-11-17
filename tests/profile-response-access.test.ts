import assert from "node:assert/strict";
import test from "node:test";
import { projectProfileResponseForTier } from "../server/lib/profile-response-access.ts";
import { buildStoredBirthEvidenceInput } from "../server/lib/profile-birth-evidence-integrity.ts";

const binding = buildStoredBirthEvidenceInput({ birthDate: "1990-09-17", birthTime: "11:11", timezone: "America/New_York", latitude: "40.8448", longitude: "-73.8648" });
const profile = {
  birthDate: new Date("1990-09-17T00:00:00.000Z"), birthTime: "11:11", timezone: "America/New_York", latitude: "40.8448", longitude: "-73.8648",
  id: "profile-1",
  name: "Bobby",
  astrologyData: { birthEvidenceInput: binding },
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
    birthEvidenceInput: binding,
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

test("Free profile response keeps verified Human Design core while withholding deeper bodygraph values", () => {
  const out = projectProfileResponseForTier(profile, "free");
  assert.equal(out.humanDesignData.status, "verified");
  assert.equal(out.humanDesignData.engine, "soulcodex-hd-geocentric-v1");
  assert.equal(out.humanDesignData.verificationReceiptId, "receipt");
  assert.equal(out.humanDesignData.type, "Reflector");
  assert.equal(out.humanDesignData.strategy, "Wait a lunar cycle");
  assert.equal(out.humanDesignData.authority, "Lunar Authority");
  assert.equal(out.humanDesignData.profile, "2/5");
  for (const key of ["definition", "centers", "channels", "activatedGates"]) {
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


test("unbound saved Aries evidence cannot leak through free or Plus profile projection", () => {
  const stale = { ...profile, astrologyData: { rising: { sign: "Aries", verificationStatus: "verified" } },
    humanDesignData: { ...profile.humanDesignData, birthEvidenceInput: undefined },
    archetypeData: { title: "Old Aries", description: "Old Aries chart" }, biography: "Old Aries story", dailyGuidance: "Old Aries guidance" };
  for (const tier of ["free", "plus"] as const) {
    const result = projectProfileResponseForTier(stale, tier);
    assert.deepEqual(result.astrologyData, {});
    assert.equal((result as any).risingSign, null);
    assert.notEqual(result.humanDesignData.status, "verified");
    assert.doesNotMatch(JSON.stringify([result.archetypeData, result.biography, result.dailyGuidance, result.synthesis]), /Old Aries/);
    assert.equal((result as any).birthEvidenceInvalidation.reason, "stored_birth_evidence_unbound");
  }
});

test("birth-time mismatch clears stored chart claims without changing saved identity", () => {
  const changed = { ...profile, birthTime: "12:11", astrologyData: { birthEvidenceInput: binding, rising: { sign: "Aries", verificationStatus: "verified" } } };
  const projected = projectProfileResponseForTier(changed, "plus");
  assert.equal(projected.id, profile.id);
  assert.deepEqual(projected.astrologyData, {});
  assert.equal(projected.birthTime, "12:11");
});
