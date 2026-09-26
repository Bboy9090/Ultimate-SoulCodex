import assert from "node:assert/strict";
import test from "node:test";
import { generateOfflineCodexProfile } from "../packages/core/offline-codex/index.ts";
import {
  CURRENT_ASTROLOGY_VERIFICATION_VERSION,
  profileNeedsOnlineVerification,
  type ReconciledOfflineProfile,
} from "../client/src/lib/profileVerificationReconciliation.ts";

const placementEvidence = {
  source: "Independent verification fixture",
  engine: "test-independent-engine",
  calculatedAt: "2026-09-26T00:00:00.000Z",
};

function exactProfile(): ReconciledOfflineProfile {
  const local = generateOfflineCodexProfile(
    {
      name: "Retry Example",
      birthDate: "1990-09-17",
      birthTime: "11:11",
      birthLocation: "Bronx, New York",
      timezone: "America/New_York",
      latitude: "40.8448",
      longitude: "-73.8648",
    },
    { id: "local-retry", generatedAt: "2026-08-20T12:00:00.000Z", currentYear: 2026 },
  );

  return {
    ...local,
    verifiedAstrologyData: {
      sun: { verificationStatus: "verified", sign: "Virgo", evidence: placementEvidence },
      moon: { verificationStatus: "verified", sign: "Virgo", evidence: placementEvidence },
      rising: {
        verificationStatus: "pending_independent_verification",
        sign: null,
      },
      verification: {
        verifiedBodies: ["Sun", "Moon"],
        unresolvedBodies: ["Ascendant"],
      },
    },
    remoteSync: {
      remoteId: "local-retry",
      syncedAt: "2026-08-20T12:01:00.000Z",
      status: "verified-online",
      verificationVersion: CURRENT_ASTROLOGY_VERIFICATION_VERSION,
    },
  };
}

test("current verification version does not hide retry while exact-input Rising is unresolved", () => {
  const profile = exactProfile();
  assert.equal(profile.remoteSync?.verificationVersion, CURRENT_ASTROLOGY_VERIFICATION_VERSION);
  assert.equal(profileNeedsOnlineVerification(profile), true);
});

test("verified Rising alone still refreshes when the full natal contract is available", () => {
  const profile = exactProfile();
  profile.verifiedAstrologyData = {
    ...profile.verifiedAstrologyData,
    rising: { verificationStatus: "verified", sign: "Scorpio", evidence: placementEvidence },
  };
  assert.equal(profileNeedsOnlineVerification(profile), true);
});

test("verified full natal chart and Human Design complete the exact-input verification requirement", () => {
  const profile = exactProfile();
  const verified = (sign: string) => ({
    verificationStatus: "verified",
    sign,
    evidence: placementEvidence,
  });
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ] as const;
  profile.verifiedAstrologyData = {
    sun: verified("Virgo"),
    moon: verified("Virgo"),
    rising: verified("Scorpio"),
    planets: {
      sun: verified("Virgo"),
      moon: verified("Virgo"),
      mercury: verified("Virgo"),
      venus: verified("Virgo"),
      mars: verified("Gemini"),
      jupiter: verified("Leo"),
      saturn: verified("Capricorn"),
      uranus: verified("Capricorn"),
      neptune: verified("Capricorn"),
      pluto: verified("Scorpio"),
    },
    houseSystem: "equal",
    houses: Array.from({ length: 12 }, (_, index) => {
      const longitude = (227.3 + index * 30) % 360;
      return {
        house: index + 1,
        sign: signs[Math.floor(longitude / 30)],
        longitude,
        degree: longitude % 30,
        verificationStatus: "verified",
        policyId: "ASTRO-EQUAL-HOUSE-v1",
        evidenceArtifactId: "equal-house-fixture",
      };
    }),
    midheaven: {
      verificationStatus: "verified",
      sign: "Leo",
      longitude: 148,
      degree: 28,
      policyId: "ASTRO-EQUAL-HOUSE-v1",
      evidenceArtifactId: "equal-house-fixture",
    },
    planetaryHouses: {
      sun: 11,
      moon: 10,
      mercury: 10,
      venus: 10,
      mars: 7,
      jupiter: 9,
      saturn: 3,
      uranus: 2,
      neptune: 2,
      pluto: 12,
    },
    aspects: [],
    northNode: {
      verificationStatus: "verified",
      mode: "mean",
      sign: "Aquarius",
      house: 3,
      longitude: 304.71,
      degree: 4.71,
      policyId: "ASTRO-MEAN-NODE-v1",
      evidenceArtifactId: "mean-node-fixture",
    },
    southNode: {
      verificationStatus: "verified",
      mode: "mean",
      sign: "Leo",
      house: 9,
      longitude: 124.71,
      degree: 4.71,
      policyId: "ASTRO-MEAN-NODE-v1",
      evidenceArtifactId: "mean-node-fixture",
    },
    chiron: {
      verificationStatus: "verified",
      sign: "Cancer",
      house: 9,
      longitude: 115.35,
      degree: 25.35,
      policyId: "ASTRO-CHIRON-v1",
      evidenceArtifactId: "chiron-fixture",
      qualificationMethod: "live-jpl-qualified-against-swiss",
    },
    verification: {
      verifiedBodies: [
        "Sun", "Moon", "Mercury", "Venus", "Mars",
        "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Ascendant",
      ],
      unresolvedBodies: [],
      policyId:
        "ASTRO-LONGITUDE-v1 + ASTRO-PLANET-LONGITUDE-v1 + ASTRO-ASCENDANT-v1 + ASTRO-EQUAL-HOUSE-v1 + ASTRO-ASPECT-MAJOR-v1 + ASTRO-MEAN-NODE-v1 + ASTRO-CHIRON-v1",
    },
  };
  profile.humanDesignData = {
    status: "verified",
    type: "Generator",
    strategy: "To Respond",
    authority: "Sacral",
    profile: "4/6",
  };
  assert.equal(profileNeedsOnlineVerification(profile), false);
});

test("missing exact Ascendant coordinates do not create an endless retry loop", () => {
  const profile = exactProfile();
  profile.latitude = null;
  profile.longitude = null;
  assert.equal(profileNeedsOnlineVerification(profile), false);
});
