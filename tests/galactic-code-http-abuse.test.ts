import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import {
  GALACTIC_CODE_RATE_LIMIT_PER_MINUTE,
  registerProfileGalacticCodeRoute,
} from "../server/routes/galactic-code-production";

function fakeStorage(profile?: any) {
  return {
    getProfile: async () => profile,
    getGalacticCodeRecord: async () => undefined,
    upsertGalacticCodeRecord: async () => { throw new Error("unexpected upsert"); },
    getUser: async () => undefined,
    getLatestEntitlementGrant: async () => undefined,
  } as any;
}

async function withServer(
  storage: any,
  run: (base: string) => Promise<void>,
  session: { userId?: string | null; sessionId?: string | null } = {},
) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as any).session = { userId: session.userId ?? null };
    (req as any).sessionID = session.sessionId ?? "test-session";
    next();
  });
  registerProfileGalacticCodeRoute(app, {
    storage,
    requireDurableFeature: () => true,
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => error ? reject(error) : resolve()),
    );
  }
}

test("production Galactic route rejects caller birth/evidence overrides over HTTP", async () => {
  await withServer(fakeStorage(), async (base) => {
    const response = await fetch(`${base}/api/profiles/p1/galactic-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthDate: "1990-09-17",
        astrology: { evidenceState: "verified", sun: "Virgo" },
      }),
    });
    assert.equal(response.status, 400);
    assert.match((await response.json()).message, /saved profile only/i);
    assert.equal(response.headers.get("cache-control"), "private, no-store, max-age=0");
  }, { userId: "owner" });
});

test("production Galactic route returns indistinguishable 404 for cross-owner profile", async () => {
  const otherUserProfile = {
    id: "p1",
    userId: "other-user",
    sessionId: null,
  };
  await withServer(fakeStorage(otherUserProfile), async (base) => {
    const response = await fetch(`${base}/api/profiles/p1/galactic-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { message: "Profile not found" });
    assert.equal(response.headers.get("cache-control"), "private, no-store, max-age=0");
  }, { userId: "owner" });
});

test("production Galactic route enforces its dedicated per-minute limiter", async () => {
  await withServer(fakeStorage(), async (base) => {
    const statuses: number[] = [];
    for (let i = 0; i < GALACTIC_CODE_RATE_LIMIT_PER_MINUTE + 1; i += 1) {
      const response = await fetch(`${base}/api/profiles/missing/galactic-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      statuses.push(response.status);
      if (i === GALACTIC_CODE_RATE_LIMIT_PER_MINUTE) {
        assert.deepEqual(await response.json(), {
          message: "Too many Galactic Code requests. Please try again later.",
          code: "galactic_code_rate_limited",
        });
      } else {
        await response.arrayBuffer();
      }
    }
    assert.deepEqual(
      statuses.slice(0, GALACTIC_CODE_RATE_LIMIT_PER_MINUTE),
      Array(GALACTIC_CODE_RATE_LIMIT_PER_MINUTE).fill(404),
    );
    assert.equal(statuses.at(-1), 429);
  });
});
