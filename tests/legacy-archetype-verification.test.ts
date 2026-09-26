import assert from "node:assert/strict";
import test from "node:test";
import { synthesizeArchetype as synthesizeLegacyArchetype } from "../services/archetype";
import { synthesizeArchetype as synthesizePackageArchetype } from "../packages/astrology/archetype";

const rawLegacyAstrology = {
  sunSign: "Virgo",
  moonSign: "Scorpio",
  risingSign: "Capricorn",
};

const verifiedSunAstrology = {
  sun: {
    sign: "Virgo",
    verificationStatus: "verified",
    evidence: {
      source: "Astronomy Engine plus independent reference",
      engine: "astronomy-engine@2.1.19 + reference@1",
      calculatedAt: "2026-09-25T12:00:00.000Z",
    },
  },
  moon: {
    sign: "Scorpio",
    verificationStatus: "pending_independent_verification",
  },
  rising: {
    sign: "Capricorn",
    verificationStatus: "pending_independent_verification",
  },
};

test("legacy archetype surfaces ignore raw astrology labels without verified evidence", () => {
  for (const synthesize of [synthesizeLegacyArchetype, synthesizePackageArchetype]) {
    const result = synthesize(rawLegacyAstrology, {}, {});
    assert.equal(result.title, "Archetype unresolved");
    assert.match(result.description, /No substitute archetype is assigned/i);
    assert.deepEqual(result.strengths, []);
    assert.deepEqual(result.themes, []);
  }
});

test("legacy archetype surfaces may use astrology only after verified placement provenance exists", () => {
  for (const synthesize of [synthesizeLegacyArchetype, synthesizePackageArchetype]) {
    const result = synthesize(verifiedSunAstrology, {}, {});
    assert.notEqual(result.title, "Archetype unresolved");
    assert.match(
      JSON.stringify(result).toLowerCase(),
      /virgo|earth|practical|discern|guardian/,
    );
    assert.doesNotMatch(JSON.stringify(result), /Scorpio|Capricorn/);
  }
});


test("legacy archetype partial verified astrology never renders missing placements as undefined", () => {
  const numerology = {
    status: "resolved",
    lifePath: 9,
    birthday: 8,
    expression: 3,
    soulUrge: 6,
    personality: 1,
    maturity: 3,
    personalYear: 9,
  };

  for (const synthesize of [synthesizeLegacyArchetype, synthesizePackageArchetype]) {
    const result = synthesize(verifiedSunAstrology, numerology, {});
    const text = JSON.stringify(result);

    assert.doesNotMatch(text, /undefined Moon|undefined Rising|Scorpio|Capricorn/);
    assert.match(text, /Verified-supported astrology currently includes Virgo Sun/);
    assert.match(text, /symbolic|reflection/i);
    assert.doesNotMatch(
      text,
      /soul's intended journey|mathematical blueprint of your soul|you're here to|Christ consciousness|predetermined mission/i,
    );
  }
});
