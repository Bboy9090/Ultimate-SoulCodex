import assert from "node:assert/strict";
import test from "node:test";
import { trustedGalacticInputFromProfile } from "../server/services/galactic-code-trusted-input";

const profile = {
  id: "p1", userId: "owner", sessionId: null,
  birthDate: new Date("1990-09-17T00:00:00Z"),
  birthTime: null, timezone: null, latitude: null, longitude: null,
  fullBirthName: "Test Person",
  astrologyData: { sun: { sign: "Virgo", verificationStatus: "verified", evidence: { forged: true } },
    rising: { sign: "Scorpio", verificationStatus: "verified", evidence: { forged: true } } },
  humanDesignData: { status: "verified", type: "Reflector", authority: "Lunar" },
  numerologyData: { status: "resolved", lifePath: 999 },
  personalityData: { traits: ["unattested"] },
} as any;

test("non-owner and ownerless profiles fail closed before calculating", async () => {
  assert.equal(await trustedGalacticInputFromProfile(profile, { userId: "stranger" }), null);
  assert.equal(await trustedGalacticInputFromProfile({ ...profile, userId: null }, { userId: "owner" }), null);
});

test("recomputed astrology ignores forged stored signs and birth-time-dependent claims", async () => {
  const result = await trustedGalacticInputFromProfile(profile, { userId: "owner" });
  assert.ok(result);
  assert.equal(result.astrology.rising, undefined);
  assert.equal(result.humanDesign.coverage, "missing");
  assert.deepEqual(result.behavior.traits, []);
  assert.notEqual(String(result.numerology.lifePath), "999");
});

test("a fabricated stored astrology result cannot promote the Sun when calculation is unresolved", async () => {
  const result = await trustedGalacticInputFromProfile({ ...profile, birthDate: new Date("1890-09-17T00:00:00Z") }, { userId: "owner" });
  assert.ok(result);
  assert.notEqual(result.astrology.sun, "Scorpio");
});

test("anonymous session ownership is supported without exposing user-owned records", async () => {
  const guest = { ...profile, userId: null, sessionId: "session-a" };
  assert.equal(await trustedGalacticInputFromProfile(guest, { sessionId: "session-b" }), null);
  const result = await trustedGalacticInputFromProfile(guest, { sessionId: "session-a" });
  assert.ok(result);
  assert.equal(result.profileId, "p1");
});

test("invalid birth dates fail closed instead of producing fingerprints", async () => {
  assert.equal(await trustedGalacticInputFromProfile(
    { ...profile, birthDate: new Date("invalid") }, { userId: "owner" },
  ), null);
});

test("invalid coordinates cannot qualify stored Human Design assertions", async () => {
  const result = await trustedGalacticInputFromProfile(
    { ...profile, birthTime: "11:11", timezone: "America/New_York", latitude: "999", longitude: "-999" },
    { userId: "owner" },
  );
  assert.ok(result);
  assert.equal(result.humanDesign.coverage, "missing");
});
