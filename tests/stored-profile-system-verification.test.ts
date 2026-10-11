import assert from "node:assert/strict";
import test from "node:test";
import { storedProfileVerificationHandler } from "../server/routes/stored-profile-verification";

test("explicit stored verification checks ownership and updates the same existing profile with actual HD", async () => {
  let writes = 0;
  let calculations = 0;
  let stored: any = {
    id: "owned-profile", userId: "owner", sessionId: null, name: "Existing profile",
    birthDate: new Date("1990-09-17T00:00:00.000Z"), birthTime: "11:11",
    timezone: "America/New_York", latitude: "40.8448", longitude: "-73.8648",
    numerologyData: { lifePath: 4 }, personalityData: { enneagram: { type: 9, description: "Saved assessed peacemaker tendency" } }, archetypeData: {},
  };
  const handler = storedProfileVerificationHandler({
    storage: {
      getProfile: async (id) => id === stored.id ? stored : undefined,
      updateProfile: async (id, updates) => { assert.equal(id, "owned-profile"); writes++; stored = { ...stored, ...updates }; return stored; },
    },
    requireDurableFeature: () => true,
    // External astronomy is isolated here; actual HD and trust are calculated.
    calculateAstrology: async () => { calculations++; return {} as any; },
  });
  async function request(userId: string, body: any = {}) {
    const response: any = { statusCode: 200, headers: {}, body: undefined,
      setHeader(key: string, value: string) { this.headers[key] = value; },
      status(status: number) { this.statusCode = status; return this; },
      json(value: unknown) { this.body = value; return this; },
    };
    await handler({ params: { id: "owned-profile" }, session: { userId }, body } as any, response);
    return response;
  }
  const stranger = await request("stranger");
  assert.equal(stranger.statusCode, 404);
  assert.equal(writes, 0);
  assert.equal(calculations, 0);
  const override = await request("owner", { birthTime: "12:00" });
  assert.equal(override.statusCode, 400);
  assert.equal(writes, 0);
  const verified = await request("owner");
  assert.equal(verified.statusCode, 200);
  assert.equal(verified.body.id, "owned-profile");
  assert.equal(verified.body.humanDesignData.status, "verified");
  assert.equal(verified.body.humanDesignData.type, "Reflector");
  assert.equal(verified.body.humanDesignData.profile, "2/5");
  assert.equal(verified.body.numerologyData.lifePath, 9);
  assert.match(verified.body.archetypeData.description, /Saved assessed peacemaker tendency/);
  assert.equal(writes, 1);
  assert.match(verified.body.biography, /Reflector/);
  assert.match(verified.body.dailyGuidance, /Lunar Authority/);
  assert.match(verified.headers["Cache-Control"], /no-store/);
});

test("assessment edits during verification cause conflict instead of stale narrative overwrite", async () => {
  const profile: any = { id: "profile", userId: "owner", name: "Profile", birthDate: new Date("1990-09-17"), birthTime: "11:11", timezone: "America/New_York", latitude: "40.8", longitude: "-73.8", personalityData: {}, numerologyData: {}, archetypeData: {} };
  let reads = 0;
  let writes = 0;
  const handler = storedProfileVerificationHandler({
    storage: { getProfile: async () => ++reads === 1 ? profile : { ...profile, personalityData: { mbti: { type: "INTJ" } } }, updateProfile: async () => { writes++; return profile; } },
    requireDurableFeature: () => true, calculateAstrology: async () => ({} as any),
  });
  const response: any = { setHeader() {}, status(code: number) { this.code = code; return this; }, json() {} };
  await handler({ params: { id: "profile" }, session: { userId: "owner" }, body: {} } as any, response);
  assert.equal(response.code, 409);
  assert.equal(writes, 0);
});

test("durable storage refusal prevents verification or write", async () => {
  const handler = storedProfileVerificationHandler({
    storage: { getProfile: async () => { throw new Error("must not read"); }, updateProfile: async () => { throw new Error("must not write"); } },
    requireDurableFeature: (res) => { res.status(503).json({ message: "Durable storage required" }); return false; },
  });
  const response: any = { setHeader() {}, status(code: number) { this.code = code; return this; }, json() {} };
  await handler({ params: { id: "owned-profile" }, body: {} } as any, response);
  assert.equal(response.code, 503);
});
