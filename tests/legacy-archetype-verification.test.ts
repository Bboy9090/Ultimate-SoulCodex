import assert from "node:assert/strict";
import test from "node:test";
import { synthesizeArchetype as synthesizeLegacyArchetype } from "../services/archetype";
import { synthesizeArchetype as synthesizePackageArchetype } from "../packages/astrology/archetype";
import { synthesizeArchetype as synthesizeServerArchetype } from "../server/services/archetype";

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


test("master Life Path 11 never substring-matches Life Path 1 archetype rules", () => {
  const numerology = {
    status: "resolved",
    lifePath: 11,
    birthday: 2,
    expression: 11,
    soulUrge: 2,
    personality: 7,
    maturity: 4,
    personalYear: 11,
  };

  const governed = synthesizeLegacyArchetype({}, numerology, {});
  const server = synthesizeServerArchetype({}, numerology, {});

  assert.equal(governed.title, server.title);
  assert.match(governed.title, /LP11|Visionary|11/i);
  assert.doesNotMatch(
    JSON.stringify(governed),
    /LP1\b|Natural Leader|Effortless Authority|born to lead/i,
  );

  const packageResult = synthesizePackageArchetype({}, numerology, {});
  assert.doesNotMatch(
    JSON.stringify(packageResult),
    /LP1\b|Natural Leader|Effortless Authority|born to lead/i,
  );
});

test("unmatched personality-only evidence never receives the first archetype as a silent default", () => {
  const personality = { mbti: { type: "ISTJ" } };

  for (const synthesize of [synthesizeLegacyArchetype, synthesizePackageArchetype]) {
    const result = synthesize({}, {}, personality);
    assert.equal(result.title, "Archetype unresolved");
    assert.match(result.description, /does not match a declared archetype rule/i);
    assert.deepEqual(result.themes, []);
  }
});


test("root archetype selection matches the governed server authority", () => {
  const fixtures = [
    [verifiedSunAstrology, {}, {}],
    [{}, { status: "resolved", lifePath: 9, expression: 3, soulUrge: 6 }, {}],
    [rawLegacyAstrology, {}, {}],
  ] as const;

  for (const [astrology, numerology, personality] of fixtures) {
    const root = synthesizeLegacyArchetype(astrology, numerology, personality);
    const server = synthesizeServerArchetype(astrology, numerology, personality);

    assert.equal(root.title, server.title);
    assert.equal(root.description, server.description);
    assert.deepEqual(root.strengths, server.strengths);
    assert.deepEqual(root.shadows, server.shadows);
    assert.deepEqual(root.themes, server.themes);
    assert.equal(root.guidance, server.guidance);
  }
});
