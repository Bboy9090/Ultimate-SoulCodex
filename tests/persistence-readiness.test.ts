import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { checkPersistenceReadiness } from "../server/lib/persistence-readiness";

test("development memory mode remains ready for local-first use", async () => {
  assert.deepEqual(
    await checkPersistenceReadiness({ NODE_ENV: "development" }),
    {
      mode: "memory",
      durable: false,
      connected: null,
      ready: true,
    },
  );
});

test("production memory mode is live but not ready for durable service", async () => {
  assert.deepEqual(
    await checkPersistenceReadiness({ NODE_ENV: "production" }),
    {
      mode: "memory",
      durable: false,
      connected: null,
      ready: false,
    },
  );
});

test("production Postgres readiness requires a successful live probe", async () => {
  const env = {
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://example.invalid/soulcodex",
    DEMO_MODE: "false",
  };
  const ready = await checkPersistenceReadiness(env, async () => undefined);
  assert.deepEqual(ready, {
    mode: "postgres",
    durable: true,
    connected: true,
    ready: true,
  });

  const failed = await checkPersistenceReadiness(env, async () => {
    throw new Error("connection refused");
  });
  assert.deepEqual(failed, {
    mode: "postgres",
    durable: true,
    connected: false,
    ready: false,
  });
});

test("database readiness times out closed instead of hanging deployment health", async () => {
  const env = {
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://example.invalid/soulcodex",
  };
  const started = Date.now();
  const readiness = await checkPersistenceReadiness(
    env,
    () => new Promise<void>(() => undefined),
    20,
  );
  assert.equal(readiness.ready, false);
  assert.equal(readiness.connected, false);
  assert.ok(Date.now() - started < 500);
});

test("server keeps liveness separate from database-aware readiness", async () => {
  const source = await readFile(new URL("../server/index.ts", import.meta.url), "utf8");
  assert.match(source, /app\.get\("\/health"[\s\S]*?status\(200\)\.json\(resolveReleaseIdentity\(\)\)/);
  assert.match(source, /app\.get\("\/ready"/);
  assert.match(source, /checkPersistenceReadiness\(\)/);
  assert.match(source, /res\.status\(persistence\.ready \? 200 : 503\)/);
  assert.match(source, /req\.path === "\/ready"/);
});

test("Railway promotes only when the database-aware readiness endpoint passes", async () => {
  const config = JSON.parse(
    await readFile(new URL("../railway.json", import.meta.url), "utf8"),
  );
  assert.equal(config.deploy.healthcheckPath, "/ready");
});
