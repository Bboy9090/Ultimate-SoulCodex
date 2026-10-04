import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const cache = readFileSync(new URL("../client/src/lib/offlineEntitlementCache.ts", import.meta.url), "utf8");
const hook = readFileSync(new URL("../client/src/hooks/useProductAccess.ts", import.meta.url), "utf8");
const routes = readFileSync(new URL("../server/routes.ts", import.meta.url), "utf8");

test("offline Plus cache is memory-only and strictly bounded", () => {
  assert.match(cache, /OFFLINE_ENTITLEMENT_CACHE_TTL_MS = 15 \* 60 \* 1000/);
  assert.match(cache, /performance\.now/);
  assert.match(cache, /age < 0 \|\| age > OFFLINE_ENTITLEMENT_CACHE_TTL_MS/);
  assert.doesNotMatch(cache, /localStorage|sessionStorage|indexedDB/);
});

test("access hook periodically re-evaluates offline entitlement and fails closed", () => {
  assert.match(hook, /readBoundedOfflinePlus\(\) \?\? FREE_ACCESS/);
  assert.match(hook, /refetchInterval: 60_000/);
  assert.match(hook, /refetchIntervalInBackground: true/);
  assert.match(hook, /networkMode: "always"/);
  assert.match(hook, /clearOfflineEntitlementCache\(\)/);
});

test("server stamps each authoritative entitlement resolution", () => {
  assert.match(routes, /resolvedAt: new Date\(\)\.toISOString\(\)/);
  assert.match(routes, /Cache-Control", "private, no-store, max-age=0"/);
});
