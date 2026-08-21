import assert from "node:assert/strict";
import test from "node:test";
import { generateOfflineCodexProfile } from "../packages/core/offline-codex/index.ts";
import {
  CURRENT_ASTROLOGY_VERIFICATION_VERSION,
  profileNeedsOnlineVerification,
  type ReconciledOfflineProfile,
} from "../client/src/lib/profileVerificationReconciliation.ts";

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
      sun: { verificationStatus: "verified", sign: "Virgo" },
      moon: { verificationStatus: "verified", sign: "Virgo" },
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

test("verified Rising completes the exact-input verification requirement", () => {
  const profile = exactProfile();
  profile.verifiedAstrologyData = {
    ...profile.verifiedAstrologyData,
    rising: { verificationStatus: "verified", sign: "Scorpio" },
  };
  assert.equal(profileNeedsOnlineVerification(profile), false);
});

test("missing exact Ascendant coordinates do not create an endless retry loop", () => {
  const profile = exactProfile();
  profile.latitude = null;
  profile.longitude = null;
  assert.equal(profileNeedsOnlineVerification(profile), false);
});
