import assert from "node:assert/strict";
import test from "node:test";
import { birthDataSchema } from "../shared/schema.ts";
import { profileVerificationRequestSchema } from "../server/routes/profile-verification.ts";
import { generateOfflineCodexProfile } from "../packages/core/offline-codex/index.ts";
import {
  CURRENT_ASTROLOGY_VERIFICATION_VERSION,
  getVerifiedAstrologySign,
  hasVerifiedBigThree,
  hasVerifiedFullNatalChart,
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

const placementEvidence = {
  source: "Independent verification fixture",
  engine: "test-independent-engine",
  calculatedAt: "2026-09-26T00:00:00.000Z",
};

const verifiedPlanets = {
  sun: { verificationStatus: "verified", sign: "Virgo", evidence: placementEvidence },
  moon: { verificationStatus: "verified", sign: "Virgo", evidence: placementEvidence },
  mercury: { verificationStatus: "verified", sign: "Virgo", evidence: placementEvidence },
  venus: { verificationStatus: "verified", sign: "Virgo", evidence: placementEvidence },
  mars: { verificationStatus: "verified", sign: "Gemini", evidence: placementEvidence },
  jupiter: { verificationStatus: "verified", sign: "Leo", evidence: placementEvidence },
  saturn: { verificationStatus: "verified", sign: "Capricorn", evidence: placementEvidence },
  uranus: { verificationStatus: "verified", sign: "Capricorn", evidence: placementEvidence },
  neptune: { verificationStatus: "verified", sign: "Capricorn", evidence: placementEvidence },
  pluto: { verificationStatus: "verified", sign: "Scorpio", evidence: placementEvidence },
};

const zodiacSigns = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const verifiedRemote = {
  id: "remote-robert",
  name: "Robert Example",
  humanDesignData: {
    status: "verified",
    type: "Reflector",
    strategy: "Wait a lunar cycle",
    authority: "Lunar Authority",
    profile: "2/5",
    verificationReceiptId: "35474994858:human-design-repair-audit",
    independentSource: "free-human-design@1.0.1 differential verifier",
    verifiedAt: "2026-09-19T23:03:08.000Z",
  },
  astrologyData: {
    sun: { verificationStatus: "verified", sign: "Virgo", evidence: placementEvidence },
    moon: { verificationStatus: "verified", sign: "Virgo", evidence: placementEvidence },
    rising: { verificationStatus: "verified", sign: "Scorpio", evidence: placementEvidence },
    planets: verifiedPlanets,
    houseSystem: "equal",
    houses: Array.from({ length: 12 }, (_, index) => ({
      ...(() => {
        const longitude = (227.3 + index * 30) % 360;
        return {
          sign: zodiacSigns[Math.floor(longitude / 30)],
          degree: longitude % 30,
          longitude,
        };
      })(),
      house: index + 1,
      verificationStatus: "verified",
      policyId: "ASTRO-EQUAL-HOUSE-v1",
      evidenceArtifactId: "equal-house-fixture",
    })),
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
      qualificationMethod: "live-jpl-qualified-against-swiss",
      evidenceArtifactId: "chiron-fixture",
    },
    // Legacy aliases cannot bypass the nested verification state.
    sunSign: "Aries",
    moonSign: "Gemini",
    risingSign: "Capricorn",
    verification: {
      verifiedBodies: [
        "Sun", "Moon", "Mercury", "Venus", "Mars",
        "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Ascendant",
      ],
      policyId:
        "ASTRO-LONGITUDE-v1 + ASTRO-PLANET-LONGITUDE-v1 + ASTRO-ASCENDANT-v1 + ASTRO-EQUAL-HOUSE-v1 + ASTRO-ASPECT-MAJOR-v1 + ASTRO-MEAN-NODE-v1 + ASTRO-CHIRON-v1",
    },
  },
  numerologyData: local.numerologyData,
  archetypeData: {
    ...local.archetypeData,
    title: "Evidence-Cleared Guardian",
  },
};

const bigThreeOnlyRemote = {
  ...verifiedRemote,
  astrologyData: {
    sun: verifiedRemote.astrologyData.sun,
    moon: verifiedRemote.astrologyData.moon,
    rising: verifiedRemote.astrologyData.rising,
    sunSign: "Virgo",
    moonSign: "Virgo",
    risingSign: "Scorpio",
    verification: {
      verifiedBodies: ["Sun", "Moon", "Ascendant"],
      policyId: "ASTRO-LONGITUDE-v1 + ASTRO-ASCENDANT-v1",
    },
  },
};

const preAscendantRemote = {
  ...verifiedRemote,
  astrologyData: {
    ...verifiedRemote.astrologyData,
    rising: { verificationStatus: "pending_ephemeris", sign: null },
    verification: {
      verifiedBodies: ["Sun", "Moon"],
      policyId: "ASTRO-LONGITUDE-v1",
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
});

test("offline profile keeps its local symbolic chart while carrying a separate verified full-natal overlay", () => {
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
  assert.equal(hydrated.remoteSync?.remoteId, "remote-robert");
  assert.equal(hydrated.remoteSync?.status, "verified-online");
  assert.equal(
    hydrated.remoteSync?.verificationVersion,
    CURRENT_ASTROLOGY_VERIFICATION_VERSION,
  );
  assert.notEqual(hydrated.biography, local.biography);
  assert.match(hydrated.biography, /Virgo Moon/);
  assert.match(hydrated.biography, /Scorpio Rising/);
  assert.match(hydrated.biography, /Mercury in Virgo/);
  assert.match(hydrated.biography, /House 10/);
  assert.match(hydrated.biography, /Verified Human Design core: Reflector/);
  assert.ok(
    hydrated.depthInterpretation.evidence.some(
      (item) => item.id === "verified.astrology.moon" && item.provenanceStatus === "externally-verified",
    ),
  );
  assert.equal(
    hydrated.depthInterpretation.evidence.some(
      (item) => item.id === "verified.astrology.chiron",
    ),
    true,
  );
  assert.equal(
    hydrated.depthInterpretation.evidence.some(
      (item) => item.id === "verified.human-design.core",
    ),
    true,
  );
  assert.equal(
    hydrated.depthInterpretation.evidence.some(
      (item) => item.id === "offline.astrology.moon" || item.id === "offline.astrology.rising",
    ),
    false,
  );
  assert.equal(hasVerifiedBigThree(hydrated.verifiedAstrologyData), true);
  assert.equal(hasVerifiedFullNatalChart(hydrated.verifiedAstrologyData), true);
  assert.equal(profileNeedsOnlineVerification(hydrated), false);
});

test("a Big Three-only snapshot refreshes when exact inputs can support the full natal contract", () => {
  const legacyHydrated = {
    ...local,
    verifiedAstrologyData: bigThreeOnlyRemote.astrologyData,
    remoteSync: {
      remoteId: "remote-robert",
      syncedAt: "2026-09-18T23:00:00.000Z",
      status: "verified-online" as const,
      verificationVersion: 2,
    },
  } satisfies ReconciledOfflineProfile;

  assert.equal(hasVerifiedBigThree(legacyHydrated.verifiedAstrologyData), true);
  assert.equal(hasVerifiedFullNatalChart(legacyHydrated.verifiedAstrologyData), false);
  assert.equal(profileNeedsOnlineVerification(legacyHydrated), true);

  const migrated = reconcileOfflineProfile(
    legacyHydrated,
    verifiedRemote,
    "2026-09-19T15:06:00.000Z",
  );
  assert.equal(hasVerifiedFullNatalChart(migrated.verifiedAstrologyData), true);
  assert.equal(migrated.remoteSync?.verificationVersion, CURRENT_ASTROLOGY_VERIFICATION_VERSION);
  assert.equal(profileNeedsOnlineVerification(migrated), false);
});

test("a v3 full natal snapshot without Mean Nodes refreshes once for the v4 contract", () => {
  const { northNode: _northNode, southNode: _southNode, ...withoutNodes } =
    verifiedRemote.astrologyData;
  const legacyHydrated = {
    ...local,
    verifiedAstrologyData: withoutNodes,
    remoteSync: {
      remoteId: "remote-robert",
      syncedAt: "2026-09-19T18:00:00.000Z",
      status: "verified-online" as const,
      verificationVersion: 3,
    },
  } satisfies ReconciledOfflineProfile;

  assert.equal(hasVerifiedBigThree(legacyHydrated.verifiedAstrologyData), true);
  assert.equal(hasVerifiedFullNatalChart(legacyHydrated.verifiedAstrologyData), false);
  assert.equal(profileNeedsOnlineVerification(legacyHydrated), true);

  const migrated = reconcileOfflineProfile(
    legacyHydrated,
    verifiedRemote,
    "2026-09-19T19:20:00.000Z",
  );
  assert.equal(hasVerifiedFullNatalChart(migrated.verifiedAstrologyData), true);
  assert.equal(migrated.remoteSync?.verificationVersion, CURRENT_ASTROLOGY_VERIFICATION_VERSION);
  assert.equal(profileNeedsOnlineVerification(migrated), false);
});

test("a v4 full natal snapshot without Chiron refreshes once for the v5 contract", () => {
  const { chiron: _chiron, ...withoutChiron } = verifiedRemote.astrologyData;
  const legacyHydrated = {
    ...local,
    verifiedAstrologyData: withoutChiron,
    remoteSync: {
      remoteId: "remote-robert",
      syncedAt: "2026-09-19T21:00:00.000Z",
      status: "verified-online" as const,
      verificationVersion: 4,
    },
  } satisfies ReconciledOfflineProfile;

  assert.equal(hasVerifiedBigThree(legacyHydrated.verifiedAstrologyData), true);
  assert.equal(hasVerifiedFullNatalChart(legacyHydrated.verifiedAstrologyData), false);
  assert.equal(profileNeedsOnlineVerification(legacyHydrated), true);

  const migrated = reconcileOfflineProfile(
    legacyHydrated,
    verifiedRemote,
    "2026-09-19T22:55:00.000Z",
  );
  assert.equal(hasVerifiedFullNatalChart(migrated.verifiedAstrologyData), true);
  assert.equal(migrated.remoteSync?.verificationVersion, CURRENT_ASTROLOGY_VERIFICATION_VERSION);
  assert.equal(profileNeedsOnlineVerification(migrated), false);
});

test("a profile synchronized before Ascendant support refreshes exactly once when raw inputs exist", () => {
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

test("missing exact Ascendant inputs do not create an endless migration loop", () => {
  const legacyWithoutCoordinates = {
    ...local,
    latitude: null,
    longitude: null,
    verifiedAstrologyData: preAscendantRemote.astrologyData,
    remoteSync: {
      remoteId: "remote-robert",
      syncedAt: "2026-08-03T23:00:00.000Z",
      status: "verified-online" as const,
    },
  } satisfies ReconciledOfflineProfile;

  assert.equal(hasVerifiedSunAndMoon(legacyWithoutCoordinates.verifiedAstrologyData), true);
  assert.equal(profileNeedsOnlineVerification(legacyWithoutCoordinates), false);
});

test("verified Human Design is reconciled into active and offline profiles", () => {
  const remoteWithHumanDesign = {
    ...verifiedRemote,
    humanDesignData: {
      status: "verified",
      type: "Reflector",
      strategy: "Wait a lunar cycle",
      authority: "Lunar Authority",
      profile: "2/5",
      verificationReceiptId: "35474994858:human-design-repair-audit",
      independentSource: "free-human-design@1.0.1 differential verifier",
      verifiedAt: "2026-09-19T23:03:08.000Z",
    },
  };

  const active = reconcileActiveProfile(
    { id: local.id, name: local.name },
    remoteWithHumanDesign,
    "2026-09-21T01:00:00.000Z",
  );
  assert.equal(active.humanDesignType, "Reflector");
  assert.equal(active.humanDesignData?.status, "verified");

  const offline = reconcileOfflineProfile(
    local,
    remoteWithHumanDesign,
    "2026-09-21T01:00:00.000Z",
  );
  assert.equal(offline.humanDesignData?.type, "Reflector");
  assert.equal(
    offline.depthInterpretation.evidence.some(
      (entry) => entry.id === "verified.human-design.core",
    ),
    true,
  );
});


test("birth input schemas reject impossible calendar and clock values before calculation", () => {
  const base = {
    name: "Input Boundary",
    birthDate: "2000-02-29",
    birthTime: "23:59",
    birthLocation: "New York, NY",
    timezone: "America/New_York",
    latitude: "40.7128",
    longitude: "-74.0060",
  };

  assert.equal(birthDataSchema.safeParse(base).success, true);
  assert.equal(
    birthDataSchema.safeParse({ ...base, birthDate: "2001-02-29" }).success,
    false,
  );
  assert.equal(
    birthDataSchema.safeParse({ ...base, birthDate: "2000-04-31" }).success,
    false,
  );
  assert.equal(
    birthDataSchema.safeParse({ ...base, birthTime: "24:00" }).success,
    false,
  );
  assert.equal(
    birthDataSchema.safeParse({ ...base, birthTime: "14:60" }).success,
    false,
  );
  assert.equal(
    birthDataSchema.safeParse({ ...base, timezone: "EST" }).success,
    false,
  );
  assert.equal(
    birthDataSchema.safeParse({ ...base, longitude: undefined }).success,
    false,
  );
});

test("minimal verification schema shares the same strict birth input domain", () => {
  const base = {
    birthDate: "2000-02-29",
    birthTime: "23:59",
    timezone: "America/New_York",
    latitude: 40.7128,
    longitude: -74.006,
  };

  assert.equal(profileVerificationRequestSchema.safeParse(base).success, true);
  assert.equal(
    profileVerificationRequestSchema.safeParse({
      ...base,
      birthDate: "2000-02-30",
    }).success,
    false,
  );
  assert.equal(
    profileVerificationRequestSchema.safeParse({
      ...base,
      birthTime: "99:99",
    }).success,
    false,
  );
  assert.equal(
    profileVerificationRequestSchema.safeParse({
      ...base,
      timezone: "New York",
    }).success,
    false,
  );
  assert.equal(
    profileVerificationRequestSchema.safeParse({
      ...base,
      longitude: undefined,
    }).success,
    false,
  );
});


test("verified labels without placement provenance cannot reconcile as verified astrology", () => {
  const astrology = {
    sun: { verificationStatus: "verified", sign: "Virgo" },
    moon: { verificationStatus: "verified", sign: "Virgo" },
    rising: { verificationStatus: "verified", sign: "Scorpio" },
  };
  assert.equal(getVerifiedAstrologySign(astrology, "sun"), null);
  assert.equal(hasVerifiedSunAndMoon(astrology), false);
  assert.equal(hasVerifiedBigThree(astrology), false);
});


test("status-only remote Human Design is not promoted during reconciliation", () => {
  const untrustedRemote = {
    ...verifiedRemote,
    humanDesignData: {
      status: "verified",
      type: "Reflector",
      strategy: "Wait a lunar cycle",
      authority: "Lunar Authority",
      profile: "2/5",
    },
  };

  const active = reconcileActiveProfile(
    { id: local.id, name: local.name, humanDesignType: "Generator" },
    untrustedRemote,
    "2026-09-26T08:00:00.000Z",
  );
  assert.equal(active.humanDesignType, "Generator");
  assert.notEqual(active.humanDesignData?.status, "verified");

  const offline = reconcileOfflineProfile(
    local,
    untrustedRemote,
    "2026-09-26T08:00:00.000Z",
  );
  assert.notEqual(offline.humanDesignData?.status, "verified");
  assert.equal(profileNeedsOnlineVerification(offline), true);
});


test("canonical angle validation tolerates harmless floating-point roundoff", () => {
  const noisyRemote = structuredClone(verifiedRemote);
  const nodeLongitude = 304.71;
  noisyRemote.astrologyData.northNode.longitude =
    ((nodeLongitude % 360) + 360) % 360;
  noisyRemote.astrologyData.northNode.degree =
    noisyRemote.astrologyData.northNode.longitude % 30;

  assert.equal(
    hasVerifiedFullNatalChart(noisyRemote.astrologyData),
    true,
  );
});
