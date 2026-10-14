import assert from "node:assert/strict";
import test from "node:test";
import { generatePrivateGalacticCode } from "../server/services/galactic-code-private";

const fakeProfile = {
  id: "private-1", userId: "owner-1", sessionId: null,
  birthDate: new Date("1990-09-17T00:00:00Z"),
  birthTime: null, timezone: null, latitude: null, longitude: null,
  fullBirthName: "Test Person", astrologyData: null,
  humanDesignData: null, numerologyData: null, personalityData: null,
} as any;

test("unknown and malformed profile IDs are rejected without storage access", async () => {
  let calls = 0;
  const storage = { getProfile: async () => { calls++; return fakeProfile; } };
  assert.deepEqual(await generatePrivateGalacticCode("", { userId: "owner-1" }, storage), { status: "not_found" });
  assert.deepEqual(await generatePrivateGalacticCode("x".repeat(129), { userId: "owner-1" }, storage), { status: "not_found" });
  assert.equal(calls, 0);
});

test("other users and ownerless records return indistinguishable not-found responses", async () => {
  const storage = { getProfile: async () => fakeProfile };
  assert.deepEqual(await generatePrivateGalacticCode("private-1", { userId: "intruder" }, storage), { status: "not_found" });
  assert.deepEqual(await generatePrivateGalacticCode("private-1", {}, {
    getProfile: async () => ({ ...fakeProfile, userId: null, sessionId: null }),
  }), { status: "not_found" });
});

test("authorized owner cannot receive caller-forged fingerprint data", async () => {
  const result = await generatePrivateGalacticCode("private-1", { userId: "owner-1" }, {
    getProfile: async () => ({ ...fakeProfile, astrologyData: {
      sun: { sign: "Scorpio", verificationStatus: "verified", evidence: { forged: true } },
    } }),
  });
  assert.notEqual(result.status, "not_found");
  if (result.status === "ready") {
    assert.equal(typeof result.result, "object");
    assert.equal(JSON.stringify(result.result).includes('"forged":true'), false);
  }
});

test("a successful private generation is revision-bound and does not trust stored revision", async () => {
  const result = await generatePrivateGalacticCode("private-1", { userId: "owner-1" }, {
    getProfile: async () => ({ ...fakeProfile, galacticRevision: "attacker-forged-revision" }),
  });
  if (result.status === "ready") {
    assert.match(result.revision, /^[a-f0-9]{64}$/);
    assert.notEqual(result.revision, "attacker-forged-revision");
  } else {
    assert.equal(result.status, "insufficient_verified_evidence");
  }
});
