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

test("withheld systems cannot alter primary verified synthesis", () => {
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

  assert.deepEqual(first, second);

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
  assert.doesNotMatch(primaryOutput, /House [1-9]|House 1[0-2]/);
  assert.doesNotMatch(primaryOutput, /Midheaven|North Node|South Node|Chiron/);
  assert.equal(
    first.depthInterpretation.evidence.some((entry) =>
      /midheaven|node|chiron|house/i.test(`${entry.id} ${entry.field}`),
    ),
    false,
  );
  assert.match(
    first.depthInterpretation.missingData.join(" "),
    /remain withheld from primary synthesis/i,
  );
});

