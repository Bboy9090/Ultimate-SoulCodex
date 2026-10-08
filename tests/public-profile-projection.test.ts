import assert from "node:assert/strict";
import test from "node:test";
import { buildPublicProfileProjection } from "../server/lib/public-profile-projection";
import type { Profile } from "@shared/schema";

const verified = (sign: string) => ({
  sign,
  verificationStatus: "verified",
  provenance: {
    source: "test-fixture",
    engine: "independent-engine",
    calculatedAt: "2026-09-27T12:00:00.000Z",
  },
});

const profile = {
  id: "private-profile-id",
  userId: "private-user-id",
  sessionId: "private-session-id",
  name: "Private Legal Name",
  birthDate: new Date("1990-09-17T00:00:00.000Z"),
  birthTime: "11:11",
  birthLocation: "Bronx, New York",
  timezone: "America/New_York",
  latitude: "40.8448",
  longitude: "-73.8648",
  isPremium: true,
  astrologyData: {
    sun: verified("Virgo"),
    moon: verified("Virgo"),
    rising: verified("Scorpio"),
    rawEvidence: { secret: "must never escape" },
  },
  numerologyData: { lifePath: 9, expression: 7, soulUrge: 4 },
  personalityData: { mbti: { type: "INTJ", responses: ["private"] } },
  archetypeData: { title: "The Builder", privatePrompt: "hidden" },
  humanDesignData: { type: "Reflector", rawActivations: ["private"] },
  vedicAstrologyData: null,
  geneKeysData: null,
  iChingData: null,
  chineseAstrologyData: null,
  kabbalahData: null,
  mayanAstrologyData: null,
  chakraData: null,
  sacredGeometryData: null,
  runesData: null,
  sabianSymbolsData: null,
  ayurvedaData: null,
  biorhythmsData: null,
  asteroidsData: null,
  arabicPartsData: null,
  fixedStarsData: null,
  purposeStatement: "private",
  biography: "private",
  dailyGuidance: "private",
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies Profile;

test("public projection emits only explicitly selected safe fields", () => {
  const projection = buildPublicProfileProjection(profile, {
    fields: ["displayName", "sunSign", "lifePath", "archetypeTitle"],
    displayName: "Bobby",
  });

  assert.deepEqual(projection, {
    version: 1,
    fields: {
      displayName: "Bobby",
      sunSign: "Virgo",
      lifePath: 9,
      archetypeTitle: "The Builder",
    },
  });
});

test("public projection structurally excludes private profile material", () => {
  const projection = buildPublicProfileProjection(profile, {
    fields: ["displayName", "sunSign", "moonSign", "risingSign", "lifePath", "archetypeTitle"],
    displayName: "Bobby",
  });
  const serialized = JSON.stringify(projection);

  for (const forbidden of [
    "private-profile-id",
    "private-user-id",
    "private-session-id",
    "Private Legal Name",
    "1990-09-17",
    "11:11",
    "Bronx",
    "America/New_York",
    "40.8448",
    "-73.8648",
    "responses",
    "rawEvidence",
    "rawActivations",
    "privatePrompt",
    "biography",
    "dailyGuidance",
  ]) {
    assert.equal(serialized.includes(forbidden), false, `projection leaked forbidden value: ${forbidden}`);
  }
});

test("unverified astrology never enters a public projection", () => {
  const unsafe = {
    ...profile,
    astrologyData: {
      sun: { sign: "Aries", verificationStatus: "unverified" },
      moon: { sign: "Taurus", verificationStatus: "verified", provenance: { source: "", engine: "", calculatedAt: "" } },
      rising: verified("Scorpio"),
    },
  } satisfies Profile;

  assert.deepEqual(
    buildPublicProfileProjection(unsafe, { fields: ["sunSign", "moonSign", "risingSign"] }),
    { version: 1, fields: { risingSign: "Scorpio" } },
  );
});

test("comparison chart shares only verified sign-and-house rows selected by the owner", () => {
  const comparisonProfile = {
    ...profile,
    astrologyData: {
      ...profile.astrologyData,
      planets: {
        sun: verified("Virgo"),
        moon: verified("Virgo"),
        mars: verified("Scorpio"),
        venus: { sign: "Libra", verificationStatus: "calculated" },
      },
      planetaryHouses: { sun: 10, moon: 10, mars: 1, venus: 11 },
      northNode: {
        sign: "Taurus", house: 7, verificationStatus: "verified", mode: "mean",
        policyId: "ASTRO-MEAN-NODE-v1", evidenceArtifactId: "node-receipt",
      },
      southNode: {
        sign: "Scorpio", house: 1, verificationStatus: "verified", mode: "mean",
        policyId: "ASTRO-MEAN-NODE-v1", evidenceArtifactId: "node-receipt",
      },
      chiron: {
        sign: "Cancer", house: 4, verificationStatus: "verified",
        policyId: "ASTRO-CHIRON-v1", evidenceArtifactId: "chiron-receipt",
        qualificationMethod: "live-jpl-qualified-against-swiss",
      },
    },
  } satisfies Profile;

  const projection = buildPublicProfileProjection(comparisonProfile, { fields: ["comparisonChart"] });
  assert.deepEqual(projection.fields.comparisonChart, [
    { key: "sun", sign: "Virgo", house: 10 },
    { key: "moon", sign: "Virgo", house: 10 },
    { key: "mars", sign: "Scorpio", house: 1 },
    { key: "northNode", sign: "Taurus", house: 7 },
    { key: "southNode", sign: "Scorpio", house: 1 },
    { key: "chiron", sign: "Cancer", house: 4 },
  ]);
  const serialized = JSON.stringify(projection);
  assert.doesNotMatch(serialized, /birthDate|birthTime|longitude|degree|evidenceArtifactId|rawEvidence/);
  assert.doesNotMatch(serialized, /venus/i);
});
