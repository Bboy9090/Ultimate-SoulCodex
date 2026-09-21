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

const verifiedPlanets = {
  sun: { verificationStatus: "verified", sign: "Virgo" },
  moon: { verificationStatus: "verified", sign: "Virgo" },
  mercury: { verificationStatus: "verified", sign: "Libra" },
  venus: { verificationStatus: "verified", sign: "Leo" },
  mars: { verificationStatus: "verified", sign: "Gemini" },
  jupiter: { verificationStatus: "verified", sign: "Cancer" },
  saturn: { verificationStatus: "verified", sign: "Capricorn" },
  uranus: { verificationStatus: "verified", sign: "Capricorn" },
  neptune: { verificationStatus: "verified", sign: "Capricorn" },
  pluto: { verificationStatus: "verified", sign: "Scorpio" },
} satisfies NonNullable<VerifiedAstrologyForSynthesis["planets"]>;

function chart(variant: "first" | "second"): VerifiedAstrologyForSynthesis {
  const first = variant === "first";
  return {
    sun: verifiedPlanets.sun,
    moon: verifiedPlanets.moon,
    rising: { verificationStatus: "verified", sign: "Scorpio" },
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
    },
    northNode: {
      verificationStatus: "verified",
      sign: first ? "Aries" : "Libra",
      house: first ? 1 : 7,
      mode: "mean",
    },
    southNode: {
      verificationStatus: "verified",
      sign: first ? "Libra" : "Aries",
      house: first ? 7 : 1,
      mode: "mean",
    },
    chiron: {
      verificationStatus: "verified",
      sign: first ? "Cancer" : "Capricorn",
      house: first ? 4 : 10,
      qualificationMethod: "live-jpl-qualified-against-swiss",
    },
    aspects: [
      { planet1: "sun", planet2: "moon", aspect: "conjunction", orb: 1.25 },
      { planet1: "venus", planet2: "mars", aspect: "sextile", orb: 2.1 },
    ],
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
