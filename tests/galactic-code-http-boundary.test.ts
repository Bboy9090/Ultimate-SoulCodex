import assert from "node:assert/strict";
import test from "node:test";
import { galacticCodeHandler } from "../server/routes/galactic-code-entitled";

function responseDouble() {
  const headers = new Map<string, string>();
  const state: { status?: number; body?: any } = {};
  const res = {
    setHeader(name: string, value: string) { headers.set(name, value); return res; },
    status(code: number) { state.status = code; return res; },
    json(body: any) { state.body = body; return res; },
  } as any;
  return { res, headers, state };
}

const storage = {
  getProfile: async () => undefined,
  getUser: async () => undefined,
  getLatestEntitlementGrant: async () => undefined,
} as any;

test("Galactic HTTP boundary requires durable storage and marks responses private/no-store", async () => {
  let generated = false;
  const { res, headers } = responseDouble();
  const handler = galacticCodeHandler({
    storage,
    requireDurableFeature: () => false,
    generate: async () => { generated = true; return { status: "not_found" } as any; },
  });
  await handler({ params: { id: "p1" }, body: {}, session: {}, sessionID: "s1" } as any, res);
  assert.equal(generated, false);
  assert.equal(headers.get("Cache-Control"), "private, no-store, max-age=0");
});

test("Galactic HTTP boundary rejects caller-supplied evidence overrides", async () => {
  let generated = false;
  const { res, state } = responseDouble();
  const handler = galacticCodeHandler({
    storage,
    requireDurableFeature: () => true,
    generate: async () => { generated = true; return { status: "not_found" } as any; },
  });
  await handler({
    params: { id: "p1" },
    body: { astrology: { evidenceState: "verified" } },
    session: { userId: "owner" },
    sessionID: "s1",
  } as any, res);
  assert.equal(generated, false);
  assert.equal(state.status, 400);
  assert.match(state.body.message, /saved profile only/i);
});

test("Galactic HTTP boundary derives actor identity from the server session", async () => {
  const { res, state } = responseDouble();
  let capturedActor: any;
  const handler = galacticCodeHandler({
    storage,
    requireDurableFeature: () => true,
    generate: async (_profileId, actor) => {
      capturedActor = actor;
      return { status: "not_found" } as any;
    },
  });
  await handler({
    params: { id: "p1" },
    body: {},
    session: { userId: "owner" },
    sessionID: "session-a",
  } as any, res);
  assert.deepEqual(capturedActor, { userId: "owner", sessionId: "session-a" });
  assert.equal(state.status, 404);
  assert.deepEqual(state.body, { message: "Profile not found" });
});

test("Galactic HTTP boundary exposes only stable insufficient-evidence semantics", async () => {
  const { res, state } = responseDouble();
  const handler = galacticCodeHandler({
    storage,
    requireDurableFeature: () => true,
    generate: async () => ({ status: "insufficient_verified_evidence" }) as any,
  });
  await handler({ params: { id: "p1" }, body: {}, session: {}, sessionID: "s1" } as any, res);
  assert.equal(state.status, 422);
  assert.equal(state.body.code, "insufficient_verified_evidence");
  assert.equal(JSON.stringify(state.body).includes("fingerprint"), false);
});

test("Galactic HTTP boundary returns the existing entitlement-projected result unchanged", async () => {
  const projected = {
    version: "galactic-code-v1",
    coverage: "partial",
    codename: "Prism",
    designation: "Integrator",
    tagline: "Test",
    primaryFunction: "Synthesis",
    sourceCoverage: { astrology: "partial", humanDesign: "missing", numerology: "partial", behavioralTraitCount: 0 },
  };
  const { res, state } = responseDouble();
  const handler = galacticCodeHandler({
    storage,
    requireDurableFeature: () => true,
    generate: async () => ({
      status: "ready",
      revision: "a".repeat(64),
      tier: "free",
      result: projected,
    }) as any,
  });
  await handler({ params: { id: "p1" }, body: {}, session: { userId: "owner" }, sessionID: "s1" } as any, res);
  assert.equal(state.status, 200);
  assert.equal(state.body.tier, "free");
  assert.deepEqual(state.body.result, projected);
  assert.equal("fingerprint" in state.body.result, false);
});

test("Galactic HTTP boundary fails closed on unexpected service errors", async () => {
  const { res, state } = responseDouble();
  const handler = galacticCodeHandler({
    storage,
    requireDurableFeature: () => true,
    generate: async () => { throw new Error("sensitive internal detail"); },
  });
  await handler({ params: { id: "p1" }, body: {}, session: {}, sessionID: "s1" } as any, res);
  assert.equal(state.status, 503);
  assert.equal(JSON.stringify(state.body).includes("sensitive internal detail"), false);
});
