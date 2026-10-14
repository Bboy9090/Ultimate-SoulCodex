import assert from "node:assert/strict";
import test from "node:test";
import { generateEntitledGalacticCode } from "../server/services/galactic-code-entitled";

const profile = {
  id: "profile-a", userId: "owner-a", sessionId: null,
  birthDate: new Date("1990-09-17T00:00:00Z"),
  birthTime: null, timezone: null, latitude: null, longitude: null,
  fullBirthName: "Test Person",
} as any;

test("unauthorized Galactic Code lookup never reads billing entitlement", async () => {
  let billingReads = 0;
  const storage = {
    getProfile: async () => profile,
    getUser: async () => { billingReads++; return null; },
    getLatestEntitlementGrant: async () => { billingReads++; return null; },
  } as any;
  const result = await generateEntitledGalacticCode("profile-a", { userId: "intruder" }, storage);
  assert.deepEqual(result, { status: "not_found" });
  assert.equal(billingReads, 0);
});

test("anonymous session access does not inherit a paid account entitlement", async () => {
  let billingReads = 0;
  const storage = {
    getProfile: async () => ({ ...profile, userId: null, sessionId: "guest-a" }),
    getUser: async () => { billingReads++; return { id: "owner-a" }; },
    getLatestEntitlementGrant: async () => { billingReads++; throw Error("unexpected billing read"); },
  } as any;
  const result = await generateEntitledGalacticCode("profile-a", { sessionId: "guest-a" }, storage);
  assert.notEqual(result.status, "not_found");
  assert.equal(billingReads, 0);
  if (result.status === "ready") assert.equal(result.tier, "free");
});

test("unqualified evidence never triggers entitlement lookup", async () => {
  let billingReads = 0;
  const storage = {
    getProfile: async () => ({ ...profile, birthDate: new Date("invalid") }),
    getUser: async () => { billingReads++; return null; },
    getLatestEntitlementGrant: async () => { billingReads++; return null; },
  } as any;
  const result = await generateEntitledGalacticCode("profile-a", { userId: "owner-a" }, storage);
  assert.deepEqual(result, { status: "insufficient_verified_evidence" });
  assert.equal(billingReads, 0);
});
