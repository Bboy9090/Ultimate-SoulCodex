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
