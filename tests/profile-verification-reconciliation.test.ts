import assert from "node:assert/strict";
import test from "node:test";
import { generateOfflineCodexProfile } from "../packages/core/offline-codex/index.ts";
import {
  CURRENT_ASTROLOGY_VERIFICATION_VERSION,
  getVerifiedAstrologySign,
  hasVerifiedBigThree,
  hasVerifiedMajorPlanets,
  hasVerifiedSunAndMoon,
  profileNeedsOnlineVerification,
  reconcileActiveProfile,
  reconcileOfflineProfile,
  type ReconciledOfflineProfile,
} from "../client/src/lib/profileVerificationReconciliation.ts";

const local = generateOfflineCodexProfile(
  {
    name: "Robert Example",
    birthDate: "1990-09-17",
    birthTime: "11:11",
    birthLocation: "Bronx, New York",
    timezone: "America/New_York",
    latitude: "40.8448",
    longitude: "-73.8648",
  },
  {
    id: "local-robert",
    generatedAt: "2026-08-03T22:48:00.000Z",
    currentYear: 2026,
  },
);

const verifiedPlanets = {
  mercury: { verificationStatus: "verified", sign: "Virgo" },
  venus: { verificationStatus: "verified", sign: "Leo" },
  mars: { verificationStatus: "verified", sign: "Gemini" },
  jupiter: { verificationStatus: "verified", sign: "Leo" },
  saturn: { verificationStatus: "verified", sign: "Capricorn" },
  uranus: { verificationStatus: "verified", sign: "Capricorn" },
  neptune: { verificationStatus: "verified", sign: "Capricorn" },
  pluto: { verificationStatus: "verified", sign: "Scorpio" },
};

const verifiedRemote = {
  id: "remote-robert",
  name: "Robert Example",
  astrologyData: {
    sun: { verificationStatus: "verified", sign: "Virgo" },
    moon: { verificationStatus: "verified", sign: "Virgo" },
    rising: { verificationStatus: "verified", sign: "Scorpio" },
    planets: verifiedPlanets,
    // Legacy aliases cannot bypass the nested verification state.
    sunSign: "Aries",
    moonSign: "Gemini",
    risingSign: "Capricorn",
    verification: {
      verifiedBodies: [
        "Sun",
        "Moon",
        "Ascendant",
        "Mercury",
        "Venus",
        "Mars",
        "Jupiter",
        "Saturn",
        "Uranus",
        "Neptune",
        "Pluto",
      ],
      policyId: "ASTRO-LONGITUDE-v1 + ASTRO-ASCENDANT-v1 + ASTRO-PLANETARY-LONGITUDE-v1",
    },
  },
  numerologyData: local.numerologyData,
  archetypeData: {
    ...local.archetypeData,
    title: "Evidence-Cleared Guardian",
  },
};

const preAscendantRemote = {
  ...verifiedRemote,
  astrologyData: {
    ...verifiedRemote.astrologyData,
    rising: { verificationStatus: "pending_ephemeris", sign: null },
    verification: {
      verifiedBodies: ["Sun", "Moon", ...Object.keys(verifiedPlanets)],
      policyId: "ASTRO-LONGITUDE-v1 + ASTRO-PLANETARY-LONGITUDE-v1",
    },
  },
};

const bigThreeOnlyRemote = {
  ...verifiedRemote,
  astrologyData: {
    ...verifiedRemote.astrologyData,
    planets: undefined,
    verification: {
      verifiedBodies: ["Sun", "Moon", "Ascendant"],
      policyId: "ASTRO-LONGITUDE-v1 + ASTRO-ASCENDANT-v1",
    },
  },
};

test("verified remote placements replace legacy active aliases without changing local identity", () => {
  const active = reconcileActiveProfile(
    {
      id: local.id,
      name: local.name,
      birthDate: local.birthDate,
      birthTime: local.birthTime ?? undefined,
      birthLocation: local.birthLocation,
      timezone: local.timezone,
      latitude: local.latitude ?? undefined,
      longitude: local.longitude ?? undefined,
      sunSign: local.astrologyData.sunSign,
      moonSign: local.astrologyData.moonSign,
      risingSign: local.astrologyData.risingSign,
      astrologyData: local.astrologyData,
      archetype: local.archetypeData.title,
    },
    verifiedRemote,
    "2026-08-04T04:30:00.000Z",
  );

  assert.equal(active.id, "local-robert");
  assert.equal(active.remoteId, "remote-robert");
  assert.equal(active.sunSign, "Virgo");
  assert.equal(active.moonSign, "Virgo");
  assert.equal(active.risingSign, "Scorpio");
  assert.equal(active.timezone, "America/New_York");
  assert.equal(active.archetype, "Evidence-Cleared Guardian");
  assert.equal(active.astrologyData?.planets?.pluto?.sign, "Scorpio");
  assert.equal(
    (active.confidence as Record<string, unknown>).astrologyVerificationVersion,
    CURRENT_ASTROLOGY_VERIFICATION_VERSION,
  );
});

test("unverified nested placements never inherit populated legacy aliases", () => {
  const astrology = {
    sun: { verificationStatus: "pending_independent_verification", sign: null },
    moon: { verificationStatus: "requires_verified_birth_time", sign: null },
    rising: { verificationStatus: "pending_ephemeris", sign: null },
    sunSign: "Virgo",
    moonSign: "Scorpio",
    risingSign: "Capricorn",
  };

  assert.equal(getVerifiedAstrologySign(astrology, "sun"), null);
  assert.equal(getVerifiedAstrologySign(astrology, "moon"), null);
  assert.equal(getVerifiedAstrologySign(astrology, "rising"), null);
  assert.equal(hasVerifiedSunAndMoon(astrology), false);
  assert.equal(hasVerifiedBigThree(astrology), false);
  assert.equal(hasVerifiedMajorPlanets(astrology), false);
});

test("offline profile keeps its local chart while carrying a separate verified full-chart overlay", () => {
  const hydrated = reconcileOfflineProfile(
    local,
    verifiedRemote,
    "2026-08-04T04:30:00.000Z",
  );

  assert.equal(hydrated.astrologyData.sunSign, local.astrologyData.sunSign);
  assert.equal(hydrated.verifiedAstrologyData?.sun?.verificationStatus, "verified");
  assert.equal(hydrated.verifiedAstrologyData?.moon?.verificationStatus, "verified");
  assert.equal(hydrated.verifiedAstrologyData?.moon?.sign, "Virgo");
  assert.equal(hydrated.verifiedAstrologyData?.rising?.verificationStatus, "verified");
  assert.equal(hydrated.verifiedAstrologyData?.rising?.sign, "Scorpio");
  assert.equal(hydrated.verifiedAstrologyData?.planets?.mercury?.sign, "Virgo");
  assert.equal(hydrated.verifiedAstrologyData?.planets?.pluto?.sign, "Scorpio");
  assert.equal(hydrated.remoteSync?.remoteId, "remote-robert");
  assert.equal(hydrated.remoteSync?.status, "verified-online");
  assert.equal(
    hydrated.remoteSync?.verificationVersion,
    CURRENT_ASTROLOGY_VERIFICATION_VERSION,
  );
  assert.equal(hydrated.archetypeData.title, "Evidence-Cleared Guardian");
  assert.equal(hasVerifiedBigThree(hydrated.verifiedAstrologyData), true);
  assert.equal(hasVerifiedMajorPlanets(hydrated.verifiedAstrologyData), true);
  assert.equal(profileNeedsOnlineVerification(hydrated), false);
});

test("a profile synchronized before Ascendant support refreshes while raw inputs exist", () => {
  const legacyHydrated = {
    ...local,
    verifiedAstrologyData: preAscendantRemote.astrologyData,
    remoteSync: {
      remoteId: "remote-robert",
      syncedAt: "2026-08-03T23:00:00.000Z",
      status: "verified-online" as const,
    },
  } satisfies ReconciledOfflineProfile;

  assert.equal(hasVerifiedSunAndMoon(legacyHydrated.verifiedAstrologyData), true);
  assert.equal(hasVerifiedBigThree(legacyHydrated.verifiedAstrologyData), false);
  assert.equal(hasVerifiedMajorPlanets(legacyHydrated.verifiedAstrologyData), true);
  assert.equal(profileNeedsOnlineVerification(legacyHydrated), true);

  const migrated = reconcileOfflineProfile(
    legacyHydrated,
    verifiedRemote,
    "2026-08-04T04:30:00.000Z",
  );

  assert.equal(migrated.verifiedAstrologyData?.moon?.sign, "Virgo");
  assert.equal(migrated.verifiedAstrologyData?.rising?.sign, "Scorpio");
  assert.equal(
    migrated.remoteSync?.verificationVersion,
    CURRENT_ASTROLOGY_VERIFICATION_VERSION,
  );
  assert.equal(profileNeedsOnlineVerification(migrated), false);
});

test("a Big-Three-only timed profile remains eligible for the new major-planet verification contract", () => {
  const oldHydrated = {
    ...local,
    verifiedAstrologyData: bigThreeOnlyRemote.astrologyData,
    remoteSync: {
      remoteId: "remote-robert",
      syncedAt: "2026-08-20T12:00:00.000Z",
      status: "verified-online" as const,
      verificationVersion: 2,
    },
  } satisfies ReconciledOfflineProfile;

  assert.equal(hasVerifiedBigThree(oldHydrated.verifiedAstrologyData), true);
  assert.equal(hasVerifiedMajorPlanets(oldHydrated.verifiedAstrologyData), false);
  assert.equal(profileNeedsOnlineVerification(oldHydrated), true);

  const migrated = reconcileOfflineProfile(
    oldHydrated,
    verifiedRemote,
    "2026-08-22T02:20:00.000Z",
  );
  assert.equal(migrated.remoteSync?.verificationVersion, 3);
  assert.equal(hasVerifiedMajorPlanets(migrated.verifiedAstrologyData), true);
  assert.equal(profileNeedsOnlineVerification(migrated), false);
});

test("missing exact timed inputs do not create an endless full-chart migration loop", () => {
  const legacyWithoutCoordinates = {
    ...local,
    latitude: null,
    longitude: null,
    verifiedAstrologyData: bigThreeOnlyRemote.astrologyData,
    remoteSync: {
      remoteId: "remote-robert",
      syncedAt: "2026-08-03T23:00:00.000Z",
      status: "verified-online" as const,
      verificationVersion: 2,
    },
  } satisfies ReconciledOfflineProfile;

  assert.equal(hasVerifiedSunAndMoon(legacyWithoutCoordinates.verifiedAstrologyData), true);
  assert.equal(profileNeedsOnlineVerification(legacyWithoutCoordinates), false);
});
