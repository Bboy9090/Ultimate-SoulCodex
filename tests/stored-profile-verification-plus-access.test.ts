import assert from "node:assert/strict";
import test from "node:test";
import { storedProfileVerificationHandler } from "../server/routes/stored-profile-verification";

test("Plus verification may narrate and return qualified HD and full-name numerology", async () => {
  let stored: any = {
    id: "plus-profile",
    userId: "plus-owner",
    sessionId: null,
    name: "Plus profile",
    fullBirthName: "Plus Full Name",
    birthDate: new Date("1990-09-17T00:00:00.000Z"),
    birthTime: "11:11",
    timezone: "America/New_York",
    latitude: "40.8448",
    longitude: "-73.8648",
    numerologyData: { lifePath: 4 },
    personalityData: {},
    archetypeData: {},
  };

  const handler = storedProfileVerificationHandler({
    storage: {
      getProfile: async () => stored,
      updateProfile: async (_id, updates) => { stored = { ...stored, ...updates }; return stored; },
      getUser: async () => ({ id: "plus-owner" } as any),
      getLatestEntitlementGrant: async () => ({
        capability: "soul_codex_plus",
        status: "active",
        effectiveAt: new Date("2026-10-01T00:00:00.000Z"),
        expiresAt: new Date("2026-11-01T00:00:00.000Z"),
        revokedAt: null,
        sourceProvider: "apple",
        plan: "monthly",
        lastVerifiedAt: new Date("2026-10-11T18:00:00.000Z"),
      } as any),
    },
    requireDurableFeature: () => true,
    calculateAstrology: async () => ({} as any),
  });

  const response: any = {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(key: string, value: string) { this.headers[key] = value; },
    status(code: number) { this.statusCode = code; return this; },
    json(value: unknown) { this.body = value; return this; },
  };

  await handler({ params: { id: "plus-profile" }, session: { userId: "plus-owner" }, body: {} } as any, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.humanDesignData.status, "verified");
  assert.equal(response.body.humanDesignData.type, "Reflector");
  assert.equal(response.body.humanDesignData.profile, "2/5");
  assert.equal(typeof response.body.numerologyData.expression, "number");
  assert.match(response.body.biography, /Reflector/);
  assert.match(response.body.dailyGuidance, /Lunar Authority/);
});
