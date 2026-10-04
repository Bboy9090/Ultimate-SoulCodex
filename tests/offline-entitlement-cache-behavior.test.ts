import assert from "node:assert/strict";
import test from "node:test";
import {
  __setOfflineCacheForTest,
  clearOfflineEntitlementCache,
  OFFLINE_ENTITLEMENT_CACHE_TTL_MS,
  readBoundedOfflinePlus,
} from "../client/src/lib/offlineEntitlementCache";

const plus = {
  tier: "plus" as const,
  source: "apple" as const,
  verified: true,
  plan: "monthly" as const,
  status: "active",
  expiresAt: "2099-11-01T12:00:00.000Z",
  lastVerifiedAt: "2026-10-04T03:00:00.000Z",
  resolvedAt: "2026-10-04T03:00:00.000Z",
  offlineCache: false,
};

test("verified Plus survives only inside the bounded monotonic offline window", () => {
  __setOfflineCacheForTest(plus, 1_000);
  const cached = readBoundedOfflinePlus(1_000 + OFFLINE_ENTITLEMENT_CACHE_TTL_MS - 1);
  assert.equal(cached?.tier, "plus");
  assert.equal(cached?.offlineCache, true);

  const expired = readBoundedOfflinePlus(1_000 + OFFLINE_ENTITLEMENT_CACHE_TTL_MS + 1);
  assert.equal(expired, null);
});

test("monotonic rollback fails closed instead of extending offline Plus", () => {
  __setOfflineCacheForTest(plus, 5_000);
  assert.equal(readBoundedOfflinePlus(4_999), null);
});

test("clear removes cached Plus immediately", () => {
  __setOfflineCacheForTest(plus, 1_000);
  clearOfflineEntitlementCache();
  assert.equal(readBoundedOfflinePlus(1_001), null);
});
