import assert from "node:assert/strict";
import test from "node:test";
import { MemStorage } from "../server/storage.ts";
import {
  entitlementIsActive,
  resolveNativeProductCatalog,
  PREMIUM_LIFETIME_CAPABILITY,
} from "../shared/billing-entitlements.ts";

test("native catalog ignores missing and malformed store IDs", () => {
  const previousApple = process.env.APPLE_PREMIUM_LIFETIME_PRODUCT_ID;
  const previousGoogle = process.env.GOOGLE_PREMIUM_LIFETIME_PRODUCT_ID;
  try {
    process.env.APPLE_PREMIUM_LIFETIME_PRODUCT_ID = "premium.lifetime";
    process.env.GOOGLE_PREMIUM_LIFETIME_PRODUCT_ID = "Bad Google ID";
    assert.deepEqual(resolveNativeProductCatalog(process.env), [
      { provider: "apple_app_store", productId: "premium.lifetime", capability: PREMIUM_LIFETIME_CAPABILITY },
    ]);
  } finally {
    if (previousApple === undefined) delete process.env.APPLE_PREMIUM_LIFETIME_PRODUCT_ID;
    else process.env.APPLE_PREMIUM_LIFETIME_PRODUCT_ID = previousApple;
    if (previousGoogle === undefined) delete process.env.GOOGLE_PREMIUM_LIFETIME_PRODUCT_ID;
    else process.env.GOOGLE_PREMIUM_LIFETIME_PRODUCT_ID = previousGoogle;
  }
});

test("entitlement activity fails closed for future, expired, revoked, and unverified grants", () => {
  const now = new Date("2026-09-22T00:00:00Z");
  const base = {
    status: "active" as const,
    startsAt: new Date("2026-09-01T00:00:00Z"),
    endsAt: null,
    revokedAt: null,
    lastVerifiedAt: new Date("2026-09-21T00:00:00Z"),
  };
  assert.equal(entitlementIsActive(base, now), true);
  assert.equal(entitlementIsActive({ ...base, startsAt: new Date("2026-10-01T00:00:00Z") }, now), false);
  assert.equal(entitlementIsActive({ ...base, endsAt: new Date("2026-09-21T00:00:00Z") }, now), false);
  assert.equal(entitlementIsActive({ ...base, revokedAt: now }, now), false);
  assert.equal(entitlementIsActive({ ...base, lastVerifiedAt: new Date("invalid") }, now), false);
});

test("memory entitlement fulfillment is idempotent and rejects replay mutation", async () => {
  const storage = new MemStorage();
  const input = {
    userId: "user-entitlement-test",
    provider: "stripe_checkout" as const,
    environment: "sandbox" as const,
    externalTransactionId: "cs_test_001",
    originalTransactionId: "pi_test_001",
    productId: "price_test_001",
    providerEventId: "evt_test_001",
    eventType: "checkout.session.completed",
    capability: PREMIUM_LIFETIME_CAPABILITY,
    purchasedAt: new Date("2026-09-22T00:00:00Z"),
    expiresAt: null,
    payloadDigest: "digest-a",
    verifier: "test",
  };
  const first = await storage.recordVerifiedEntitlement(input);
  const retry = await storage.recordVerifiedEntitlement(input);
  assert.equal(retry.id, first.id);
  assert.equal((await storage.getEntitlementForUser(input.userId, PREMIUM_LIFETIME_CAPABILITY))?.id, first.id);
  await assert.rejects(
    storage.recordVerifiedEntitlement({ ...input, payloadDigest: "digest-tampered" }),
    /replay_mismatch/,
  );
});
