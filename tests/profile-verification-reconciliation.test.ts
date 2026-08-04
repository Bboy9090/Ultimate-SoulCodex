import assert from "node:assert/strict";
import test from "node:test";
import { generateOfflineCodexProfile } from "../packages/core/offline-codex/index.ts";
import {
  getVerifiedAstrologySign,
  hasVerifiedSunAndMoon,
  profileNeedsOnlineVerification,
  reconcileActiveProfile,
  reconcileOfflineProfile,
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

const verifiedRemote = {
  id: "remote-robert",
  name: "Robert Example",
  astrologyData: {
    sun: { status: "verified", sign: "Virgo" },
    moon: { status: "verified", sign: "Scorpio" },
    rising: { status: "pending_ephemeris", sign: null },
    // Legacy aliases cannot bypass the nested verification state.
    sunSign: "Aries",
    moonSign: "Gemini",
    risingSign: "Capricorn",
    verification: {
      verifiedBodies: ["Sun", "Moon"],
      policyId: "ASTRO-LONGITUDE-v1",
    },
  },
  numerologyData: local.numerologyData,
  archetypeData: {
    ...local.archetypeData,
    title: "Evidence-Cleared Guardian",
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
    "2026-08-03T23:00:00.000Z",
  );

  assert.equal(active.id, "local-robert");
  assert.equal(active.remoteId, "remote-robert");
  assert.equal(active.sunSign, "Virgo");
  assert.equal(active.moonSign, "Scorpio");
  assert.equal(active.risingSign, null);
  assert.equal(active.timezone, "America/New_York");
  assert.equal(active.archetype, "Evidence-Cleared Guardian");
});

test("unverified nested placements never inherit populated legacy aliases", () => {
  const astrology = {
    sun: { status: "calculated_pending_independent_verification", sign: null },
    moon: { status: "requires_verified_birth_time", sign: null },
    rising: { status: "pending_ephemeris", sign: null },
    sunSign: "Virgo",
    moonSign: "Scorpio",
    risingSign: "Capricorn",
  };

  assert.equal(getVerifiedAstrologySign(astrology, "sun"), null);
  assert.equal(getVerifiedAstrologySign(astrology, "moon"), null);
  assert.equal(hasVerifiedSunAndMoon(astrology), false);
});

test("offline profile keeps its local chart while carrying a separate verified overlay", () => {
  const hydrated = reconcileOfflineProfile(
    local,
    verifiedRemote,
    "2026-08-03T23:00:00.000Z",
  );

  assert.equal(hydrated.astrologyData.sunSign, local.astrologyData.sunSign);
  assert.equal(hydrated.verifiedAstrologyData?.sun?.status, "verified");
  assert.equal(hydrated.verifiedAstrologyData?.moon?.status, "verified");
  assert.equal(hydrated.remoteSync?.remoteId, "remote-robert");
  assert.equal(hydrated.remoteSync?.status, "verified-online");
  assert.equal(hydrated.archetypeData.title, "Evidence-Cleared Guardian");
  assert.equal(profileNeedsOnlineVerification(hydrated), false);
});
