import assert from "node:assert/strict";
import test from "node:test";
import type { GalacticCodeResult } from "../shared/galactic-code/types";
import { getOrGenerateEntitledGalacticCode } from "../server/services/galactic-code-cache";
import { galacticProfileRevision } from "../server/services/galactic-code-revision";

const profile = {
  id: "p1",
  userId: "owner",
  sessionId: null,
  birthDate: new Date("1990-09-17T00:00:00.000Z"),
  birthTime: null,
  timezone: null,
  latitude: null,
  longitude: null,
  fullBirthName: "Test Person",
} as any;

const profileRevision = galacticProfileRevision(profile);

const fullResult: GalacticCodeResult = {
  profileId: "p1",
  version: "galactic-code-v1",
  fingerprint: "secret-fingerprint",
  shortCode: "SCX-GC-TEST",
  coverage: "partial",
  sourceCoverage: { astrology: "partial", humanDesign: "missing", numerology: "partial", behavioralTraitCount: 0 },
  codename: "The Prism",
  designation: "Integrator",
  tagline: "Build with signal",
  primaryFunction: "Synthesis",
  secondaryFunction: "Structure",
  legacyFunction: "Integration",
  frequency: "test",
  axes: [{ key: "x", label: "Synthesis", score: 1, evidence: ["verified"] }],
  elementMatrix: {},
  behavioralSequence: ["one", "two", "three", "four", "five"],
  uniquenessKey: "private",
  interpretation: {
    identity: "id",
    decisionCode: "decision",
    stressMechanic: "stress",
    relationalCode: "relational",
    missionArc: "mission",
  },
  evidence: ["verified"],
  generatedAt: "2026-10-24T12:00:00.000Z",
};

function baseStorage(record?: any) {
  let entitlementReads = 0;
  let upserts = 0;
  return {
    storage: {
      getProfile: async () => profile,
      getGalacticCodeRecord: async () => record,
      upsertGalacticCodeRecord: async (input: any) => { upserts++; return { id: "r1", createdAt: new Date(), updatedAt: new Date(), ...input }; },
      getUser: async () => { entitlementReads++; return undefined; },
      getLatestEntitlementGrant: async () => { entitlementReads++; return undefined; },
    } as any,
    counts: () => ({ entitlementReads, upserts }),
  };
}

test("fresh owned persisted result is replayed and re-projected for free tier", async () => {
  const { storage, counts } = baseStorage({
    profileId: "p1",
    userId: "owner",
    sessionId: null,
    revision: profileRevision,
    version: "galactic-code-v1",
    result: fullResult,
  });
  const result = await getOrGenerateEntitledGalacticCode("p1", { userId: "owner" }, storage);
  assert.equal(result.status, "ready");
  if (result.status === "ready") {
    assert.equal(result.tier, "free");
    assert.equal("fingerprint" in result.result, false);
  }
  assert.equal(counts().upserts, 0);
});

test("cross-owner request is rejected before cache or entitlement reads", async () => {
  let cacheReads = 0;
  let entitlementReads = 0;
  const result = await getOrGenerateEntitledGalacticCode("p1", { userId: "intruder" }, {
    getProfile: async () => profile,
    getGalacticCodeRecord: async () => { cacheReads++; return undefined; },
    upsertGalacticCodeRecord: async () => { throw new Error("unexpected"); },
    getUser: async () => { entitlementReads++; return undefined; },
    getLatestEntitlementGrant: async () => { entitlementReads++; return undefined; },
  } as any);
  assert.deepEqual(result, { status: "not_found" });
  assert.equal(cacheReads, 0);
  assert.equal(entitlementReads, 0);
});

test("record owned by a different principal is never replayed", async () => {
  const { storage } = baseStorage({
    profileId: "p1",
    userId: "other",
    sessionId: null,
    revision: profileRevision,
    version: "galactic-code-v1",
    result: fullResult,
  });
  const result = await getOrGenerateEntitledGalacticCode("p1", { userId: "owner" }, storage);
  assert.notEqual(result.status, "ready");
});

test("malformed persisted result is never projected as trusted output", async () => {
  const { storage } = baseStorage({
    profileId: "p1",
    userId: "owner",
    sessionId: null,
    revision: profileRevision,
    version: "galactic-code-v1",
    result: { version: "galactic-code-v1", profileId: "p1", fingerprint: "leak" },
  });
  const result = await getOrGenerateEntitledGalacticCode("p1", { userId: "owner" }, storage);
  assert.notEqual(result.status, "ready");
});

test("anonymous session never inherits account entitlement", async () => {
  let billingReads = 0;
  const guestProfile = { ...profile, userId: null, sessionId: "guest-a" };
  const revision = galacticProfileRevision(guestProfile);
  const result = await getOrGenerateEntitledGalacticCode("p1", { sessionId: "guest-a" }, {
    getProfile: async () => guestProfile,
    getGalacticCodeRecord: async () => ({
      profileId: "p1", userId: null, sessionId: "guest-a", revision, version: "galactic-code-v1", result: fullResult,
    }),
    upsertGalacticCodeRecord: async () => { throw new Error("unexpected"); },
    getUser: async () => { billingReads++; return { id: "owner" }; },
    getLatestEntitlementGrant: async () => { billingReads++; return undefined; },
  } as any);
  assert.equal(result.status, "ready");
  if (result.status === "ready") assert.equal(result.tier, "free");
  assert.equal(billingReads, 0);
});


test("stale persisted revision is never replayed when current evidence cannot requalify", async () => {
  let upserted = false;
  let entitlementReads = 0;
  const result = await getOrGenerateEntitledGalacticCode("p1", { userId: "owner" }, {
    getProfile: async () => profile,
    getGalacticCodeRecord: async () => ({
      profileId: "p1",
      userId: "owner",
      sessionId: null,
      revision: "0".repeat(64),
      version: "galactic-code-v1",
      result: fullResult,
    }),
    upsertGalacticCodeRecord: async () => {
      upserted = true;
      throw new Error("unqualified regeneration must not persist");
    },
    getUser: async () => { entitlementReads++; return { id: "owner" }; },
    getLatestEntitlementGrant: async () => { entitlementReads++; return plusGrant(); },
  } as any);

  assert.deepEqual(result, { status: "insufficient_verified_evidence" });
  assert.equal(upserted, false);
  assert.equal(entitlementReads, 0);
});

function plusGrant(overrides: Record<string, unknown> = {}) {
  const now = Date.now();
  return {
    capability: "soul_codex_plus",
    status: "active",
    plan: "monthly",
    sourceProvider: "stripe",
    effectiveAt: new Date(now - 60_000),
    expiresAt: new Date(now + 86_400_000),
    revokedAt: null,
    lastVerifiedAt: new Date(now - 1_000),
    ...overrides,
  } as any;
}

function storedCurrentResult() {
  return {
    profileId: "p1",
    userId: "owner",
    sessionId: null,
    revision: profileRevision,
    version: "galactic-code-v1",
    result: fullResult,
  };
}

test("current Plus entitlement re-projects the same stored result to full depth", async () => {
  const result = await getOrGenerateEntitledGalacticCode("p1", { userId: "owner" }, {
    getProfile: async () => profile,
    getGalacticCodeRecord: async () => storedCurrentResult(),
    upsertGalacticCodeRecord: async () => { throw new Error("fresh cache should not be rewritten"); },
    getUser: async () => ({ id: "owner" }),
    getLatestEntitlementGrant: async () => plusGrant(),
  } as any);

  assert.equal(result.status, "ready");
  if (result.status === "ready") {
    assert.equal(result.tier, "plus");
    assert.equal("fingerprint" in result.result, true);
    assert.equal((result.result as GalacticCodeResult).fingerprint, fullResult.fingerprint);
  }
});

test("expired Plus entitlement immediately downgrades the same cache replay to the Free brief", async () => {
  const result = await getOrGenerateEntitledGalacticCode("p1", { userId: "owner" }, {
    getProfile: async () => profile,
    getGalacticCodeRecord: async () => storedCurrentResult(),
    upsertGalacticCodeRecord: async () => { throw new Error("fresh cache should not be rewritten"); },
    getUser: async () => ({ id: "owner" }),
    getLatestEntitlementGrant: async () => plusGrant({
      status: "expired",
      expiresAt: new Date(Date.now() - 1_000),
    }),
  } as any);

  assert.equal(result.status, "ready");
  if (result.status === "ready") {
    assert.equal(result.tier, "free");
    assert.equal("fingerprint" in result.result, false);
    assert.equal("axes" in result.result, false);
  }
});

test("revoked Plus entitlement cannot replay full-depth cached output", async () => {
  const result = await getOrGenerateEntitledGalacticCode("p1", { userId: "owner" }, {
    getProfile: async () => profile,
    getGalacticCodeRecord: async () => storedCurrentResult(),
    upsertGalacticCodeRecord: async () => { throw new Error("fresh cache should not be rewritten"); },
    getUser: async () => ({ id: "owner" }),
    getLatestEntitlementGrant: async () => plusGrant({
      status: "revoked",
      revokedAt: new Date(Date.now() - 1_000),
    }),
  } as any);

  assert.equal(result.status, "ready");
  if (result.status === "ready") {
    assert.equal(result.tier, "free");
    assert.equal("fingerprint" in result.result, false);
  }
});
