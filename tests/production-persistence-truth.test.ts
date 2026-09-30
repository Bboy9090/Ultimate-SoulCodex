import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  durableFeatureUnavailable,
  resolvePersistenceCapabilities,
} from "../server/lib/persistence-capabilities";

test("development memory mode remains available for local-first workflows", () => {
  assert.deepEqual(resolvePersistenceCapabilities({ NODE_ENV: "development" }), {
    mode: "memory",
    durable: false,
    production: false,
    durableFeaturesAvailable: true,
  });
  assert.equal(durableFeatureUnavailable({ NODE_ENV: "development" }), false);
});

test("production memory mode fails closed for features that promise durable state", () => {
  assert.deepEqual(resolvePersistenceCapabilities({ NODE_ENV: "production" }), {
    mode: "memory",
    durable: false,
    production: true,
    durableFeaturesAvailable: false,
  });
  assert.equal(durableFeatureUnavailable({ NODE_ENV: "production" }), true);
});

test("production Postgres enables durable features", () => {
  const env = {
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://example.invalid/soulcodex",
  };
  assert.equal(resolvePersistenceCapabilities(env).mode, "postgres");
  assert.equal(resolvePersistenceCapabilities(env).durable, true);
  assert.equal(durableFeatureUnavailable(env), false);
});

test("server routes gate durable profile and share mutations in ephemeral production mode", async () => {
  const [routes, auth] = await Promise.all([
    readFile(new URL("../server/routes.ts", import.meta.url), "utf8"),
    readFile(new URL("../server/routes/consumer-auth.ts", import.meta.url), "utf8"),
  ]);

  assert.match(routes, /function requireDurableFeature\(res: any\)/);
  assert.match(routes, /app\.post\("\/api\/profiles"[\s\S]*?!requireDurableFeature\(res\)/);
  assert.match(routes, /app\.post\("\/api\/profiles\/:id\/public-shares"[\s\S]*?!requireDurableFeature\(res\)/);
  assert.match(routes, /app\.delete\("\/api\/profiles\/:id\/public-shares\/:token"[\s\S]*?!requireDurableFeature\(res\)/);
  assert.match(auth, /app\.post\("\/api\/auth\/apple"[\s\S]*?durableFeatureUnavailable\(\)/);
  assert.match(auth, /DURABLE_STORAGE_UNAVAILABLE_RESPONSE/);
});
