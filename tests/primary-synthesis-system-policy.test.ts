import assert from "node:assert/strict";
import test from "node:test";
import {
  generateFoundationOfflineCodexProfile,
  synthesizeVerifiedFoundationProfile,
  type VerifiedAstrologyForSynthesis,
} from "../client/src/lib/foundationOfflineCodex";

const local = generateFoundationOfflineCodexProfile(
  {
    name: "Policy Boundary",
    birthDate: "1990-09-17",
    birthTime: "11:11",
    birthLocation: "Bronx, New York",
    timezone: "America/New_York",
    latitude: "40.8448",
    longitude: "-73.8648",
  },
  {
    id: "policy-boundary",
    generatedAt: "2026-09-20T20:00:00.000Z",
    currentYear: 2026,
  },
);

const placementEvidence = {
  source: "Independent synthesis fixture",
  engine: "test-independent-engine",
  calculatedAt: "2026-09-26T00:00:00.000Z",
};

const verifiedPlanets = {
  sun: { verificationStatus: "verified", sign: "Virgo", evidence: placementEvidence },
  moon: { verificationStatus: "verified", sign: "Virgo", evidence: placementEvidence },
  mercury: { verificationStatus: "verified", sign: "Libra", evidence: placementEvidence },
  venus: { verificationStatus: "verified", sign: "Leo", evidence: placementEvidence },
  mars: { verificationStatus: "verified", sign: "Gemini", evidence: placementEvidence },
  jupiter: { verificationStatus: "verified", sign: "Cancer", evidence: placementEvidence },
  saturn: { verificationStatus: "verified", sign: "Capricorn", evidence: placementEvidence },
  uranus: { verificationStatus: "verified", sign: "Capricorn", evidence: placementEvidence },
  neptune: { verificationStatus: "verified", sign: "Capricorn", evidence: placementEvidence },
  pluto: { verificationStatus: "verified", sign: "Scorpio", evidence: placementEvidence },
} satisfies NonNullable<VerifiedAstrologyForSynthesis["planets"]>;

function chart(variant: "first" | "second"): VerifiedAstrologyForSynthesis {
  const first = variant === "first";
  return {
    sun: verifiedPlanets.sun,
    moon: verifiedPlanets.moon,
    rising: { verificationStatus: "verified", sign: "Scorpio", evidence: placementEvidence },
    planets: verifiedPlanets,
    planetaryHouses: Object.fromEntries(
      Object.keys(verifiedPlanets).map((key, index) => [
        key,
        first ? (index % 12) + 1 : ((index + 6) % 12) + 1,
      ]),
    ) as VerifiedAstrologyForSynthesis["planetaryHouses"],
    midheaven: {
      verificationStatus: "verified",
      sign: first ? "Leo" : "Aquarius",
      evidence: placementEvidence,
      policyId: "ASTRO-EQUAL-HOUSE-v1",
      evidenceArtifactId: "equal-house-fixture",
    },
    northNode: {
      verificationStatus: "verified",
      sign: first ? "Aries" : "Libra",
      house: first ? 1 : 7,
      mode: "mean",
      evidence: placementEvidence,
      policyId: "ASTRO-MEAN-NODE-v1",
      evidenceArtifactId: "mean-node-fixture",
    },
    southNode: {
      verificationStatus: "verified",
      sign: first ? "Libra" : "Aries",
      house: first ? 7 : 1,
      mode: "mean",
      evidence: placementEvidence,
      policyId: "ASTRO-MEAN-NODE-v1",
      evidenceArtifactId: "mean-node-fixture",
    },
    chiron: {
      verificationStatus: "verified",
      sign: first ? "Cancer" : "Capricorn",
      house: first ? 4 : 10,
      qualificationMethod: "live-jpl-qualified-against-swiss",
      evidence: placementEvidence,
      policyId: "ASTRO-CHIRON-v1",
      evidenceArtifactId: "chiron-fixture",
    },
    aspects: [
      { planet1: "sun", planet2: "moon", aspect: "conjunction", orb: 1.25, policyId: "ASTRO-ASPECT-MAJOR-v1", evidenceArtifactId: "aspect-fixture" },
      { planet1: "venus", planet2: "mars", aspect: "sextile", orb: 2.1, policyId: "ASTRO-ASPECT-MAJOR-v1", evidenceArtifactId: "aspect-fixture" },
    ],
    verification: {
      policyId: "ASTRO-EQUAL-HOUSE-v1 + ASTRO-ASPECT-MAJOR-v1 + ASTRO-MEAN-NODE-v1 + ASTRO-CHIRON-v1",
    },
  };
}

test("verified house, angle, Node, and Chiron contracts alter supporting synthesis", () => {
  const first = synthesizeVerifiedFoundationProfile(
    local,
    chart("first"),
    "2026-09-20T20:00:00.000Z",
  );
  const second = synthesizeVerifiedFoundationProfile(
    local,
    chart("second"),
    "2026-09-20T20:00:00.000Z",
  );

  assert.notDeepEqual(first, second);

  const primaryOutput = JSON.stringify({
    biography: first.biography,
    dailyGuidance: first.dailyGuidance,
    archetypeData: first.archetypeData,
    layers: Object.fromEntries(
      Object.entries(first.depthInterpretation)
        .filter(([key]) => key !== "missingData" && key !== "evidence"),
    ),
    evidence: first.depthInterpretation.evidence,
  });
  assert.match(primaryOutput, /House [1-9]|House 1[0-2]/);
  assert.match(primaryOutput, /Midheaven|North Node|South Node|Chiron/);
  assert.equal(
    first.depthInterpretation.evidence.some((entry) =>
      /midheaven|node|chiron|house/i.test(`${entry.id} ${entry.field}`),
    ),
    true,
  );
  assert.doesNotMatch(
    first.depthInterpretation.missingData.join(" "),
    /Houses, Midheaven, and planetary-house interpretation remain withheld/i,
  );
});

test("verified Human Design core fills supported reading layers", () => {
  const result = synthesizeVerifiedFoundationProfile(
    local,
    chart("first"),
    "2026-09-20T20:00:00.000Z",
    {
      status: "verified",
      type: "Reflector",
      strategy: "Wait a lunar cycle",
      authority: "Lunar Authority",
      profile: "2/5",
      definition: "Single Definition",
      centers: { defined: ["Head", "Ajna"], undefined: ["Root"] },
      channels: ["64-47"],
      activatedGates: [64, 47],
      verificationReceiptId: "hd-synthesis-fixture",
      independentSource: "independent-hd-fixture",
      verifiedAt: "2026-09-26T00:00:00.000Z",
    },
  );

  assert.equal(
    result.depthInterpretation.evidence.some(
      (entry) => entry.id === "verified.human-design.core",
    ),
    true,
  );
  assert.doesNotMatch(
    result.depthInterpretation.missingData.join(" "),
    /Human Design core can only be included/i,
  );
  assert.match(
    JSON.stringify(result.depthInterpretation),
    /Reflector|Lunar Authority|Wait a lunar cycle|Single Definition|64-47/,
  );
});

test("unverified Human Design never changes primary synthesis", () => {
  const baseline = synthesizeVerifiedFoundationProfile(
    local,
    chart("first"),
    "2026-09-20T20:00:00.000Z",
  );
  const candidate = synthesizeVerifiedFoundationProfile(
    local,
    chart("first"),
    "2026-09-20T20:00:00.000Z",
    {
      status: "calculated_unverified",
      type: "Manifestor",
      strategy: "Inform",
      authority: "Ego Authority",
      profile: "1/3",
    },
  );

  assert.deepEqual(candidate, baseline);
});


test("malformed legacy numerology never masquerades as Life Path 9", () => {
  const legacy = {
    ...local,
    numerologyData: {
      ...local.numerologyData,
      lifePath: 0,
      expression: 0,
      soulUrge: 0,
    },
    archetypeData: {
      ...local.archetypeData,
      description: "Legacy contaminated archetype.",
      strengths: ["humanitarian perspective"],
      shadows: ["overextending for the larger mission"],
      themes: ["Life Path 9", "completion and legacy"],
      guidance: "Finish one cycle before volunteering for another.",
    },
  };

  const result = synthesizeVerifiedFoundationProfile(
    legacy,
    chart("first"),
    "2026-09-20T20:00:00.000Z",
  );

  const primaryOutput = JSON.stringify({
    biography: result.biography,
    dailyGuidance: result.dailyGuidance,
    archetypeData: result.archetypeData,
    depthInterpretation: result.depthInterpretation,
  });

  assert.doesNotMatch(
    primaryOutput,
    /Life Path 9|completion and legacy|humanitarian perspective|overextending for the larger mission|Finish one cycle before volunteering for another/i,
  );
  assert.equal(
    result.depthInterpretation.evidence.some((entry) =>
      entry.id.startsWith("verified.numerology."),
    ),
    false,
  );
  assert.match(
    result.archetypeData.description,
    /excluded from interpretive synthesis/i,
  );
});

test("unsupported verified signs fail closed instead of inheriting Virgo language", () => {
  const invalid = chart("first");
  invalid.moon = { verificationStatus: "verified", sign: "Ophiuchus" };

  const result = synthesizeVerifiedFoundationProfile(
    local,
    invalid,
    "2026-09-20T20:00:00.000Z",
  );

  assert.deepEqual(result, {
    biography: local.biography,
    dailyGuidance: local.dailyGuidance,
    depthInterpretation: local.depthInterpretation,
    archetypeData: local.archetypeData,
  });
});
