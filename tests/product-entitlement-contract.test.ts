import assert from "node:assert/strict";
import test from "node:test";
import { MemStorage } from "../server/storage";
import {
  recordVerifiedBillingEvent,
  resolveProductEntitlementForUser,
} from "../server/lib/product-entitlement";

const digestA = "a".repeat(64);
const digestB = "b".repeat(64);

async function testUser(storage: MemStorage, suffix: string) {
  return storage.getOrCreateAppleUser(
    `billing-test-${suffix}`,
    `billing-${suffix}@example.test`,
  );
}

function event(userId: string, overrides: Record<string, unknown> = {}) {
  return {
    userId,
    provider: "stripe" as const,
    providerEventId: "evt_1",
    providerTransactionId: "sub_1",
    productId: "soul_codex_plus_monthly",
    plan: "monthly" as const,
    environment: "sandbox" as const,
    eventType: "subscription_created",
    occurredAt: new Date("2026-10-01T12:00:00Z"),
    verificationState: "verified" as const,
    accessStatus: "active" as const,
    purchasedAt: new Date("2026-10-01T12:00:00Z"),
    expiresAt: new Date("2026-11-01T12:00:00Z"),
    verifiedAt: new Date("2026-10-01T12:01:00Z"),
    evidenceDigest: digestA,
    diagnosticMetadata: { webhookType: "checkout.session.completed" },
    ...overrides,
  };
}

test("anonymous and users without a durable grant are Free", async () => {
  const storage = new MemStorage();
  const user = await testUser(storage, "free");
  assert.equal((await resolveProductEntitlementForUser(storage, null)).tier, "free");
  assert.equal((await resolveProductEntitlementForUser(storage, user.id)).tier, "free");
});

test("verified billing events require an existing account", async () => {
  const storage = new MemStorage();
  await assert.rejects(
    () => recordVerifiedBillingEvent(storage, event("missing-user")),
    /billing_subject_user_not_found/,
  );
});

test("verified active durable grant enables Soul Codex Plus", async () => {
  const storage = new MemStorage();
  const user = await testUser(storage, "active");
  await recordVerifiedBillingEvent(storage, event(user.id));

  const entitlement = await resolveProductEntitlementForUser(
    storage,
    user.id,
    new Date("2026-10-03T12:00:00Z"),
  );

  assert.equal(entitlement.tier, "plus");
  assert.equal(entitlement.source, "stripe");
  assert.equal(entitlement.plan, "monthly");
  assert.equal(entitlement.status, "active");
  assert.equal(entitlement.verified, true);
});

test("canceled pending expiry retains access through the paid period", async () => {
  const storage = new MemStorage();
  const user = await testUser(storage, "cancel");
  await recordVerifiedBillingEvent(storage, event(user.id));
  await recordVerifiedBillingEvent(storage, event(user.id, {
    providerEventId: "evt_cancel",
    eventType: "subscription_cancel_scheduled",
    occurredAt: new Date("2026-10-10T11:59:00Z"),
    accessStatus: "canceled_pending_expiry",
    verifiedAt: new Date("2026-10-10T12:00:00Z"),
    evidenceDigest: digestB,
  }));

  const entitlement = await resolveProductEntitlementForUser(
    storage,
    user.id,
    new Date("2026-10-20T12:00:00Z"),
  );
  assert.equal(entitlement.tier, "plus");
  assert.equal(entitlement.status, "canceled_pending_expiry");
});

test("expiration event fails closed to Free", async () => {
  const storage = new MemStorage();
  const user = await testUser(storage, "expire");
  await recordVerifiedBillingEvent(storage, event(user.id));
  await recordVerifiedBillingEvent(storage, event(user.id, {
    providerEventId: "evt_expired",
    eventType: "subscription_expired",
    occurredAt: new Date("2026-11-01T12:00:00Z"),
    accessStatus: "expired",
    expiresAt: new Date("2026-11-01T12:00:00Z"),
    verifiedAt: new Date("2026-11-01T12:01:00Z"),
    evidenceDigest: digestB,
  }));

  const entitlement = await resolveProductEntitlementForUser(
    storage,
    user.id,
    new Date("2026-11-02T12:00:00Z"),
  );
  assert.equal(entitlement.tier, "free");
  assert.equal(entitlement.status, "expired");
});

test("revocation immediately removes Plus", async () => {
  const storage = new MemStorage();
  const user = await testUser(storage, "refund");
  await recordVerifiedBillingEvent(storage, event(user.id));
  await recordVerifiedBillingEvent(storage, event(user.id, {
    providerEventId: "evt_refund",
    eventType: "refund",
    occurredAt: new Date("2026-10-15T11:59:00Z"),
    accessStatus: "refunded",
    verifiedAt: new Date("2026-10-15T12:00:00Z"),
    evidenceDigest: digestB,
  }));

  const entitlement = await resolveProductEntitlementForUser(
    storage,
    user.id,
    new Date("2026-10-15T12:01:00Z"),
  );
  assert.equal(entitlement.tier, "free");
  assert.equal(entitlement.status, "refunded");
});

test("same verified provider event is idempotent", async () => {
  const storage = new MemStorage();
  const user = await testUser(storage, "idempotent");
  const first = await recordVerifiedBillingEvent(storage, event(user.id));
  const second = await recordVerifiedBillingEvent(storage, event(user.id));

  assert.equal(first.transaction.id, second.transaction.id);
  assert.equal(first.receipt.id, second.receipt.id);
  assert.equal(first.grant.id, second.grant.id);
});

test("provider event replay with different evidence is rejected", async () => {
  const storage = new MemStorage();
  const user = await testUser(storage, "replay");
  await recordVerifiedBillingEvent(storage, event(user.id));

  await assert.rejects(
    () => recordVerifiedBillingEvent(storage, event(user.id, { evidenceDigest: digestB })),
    /billing_event_replay_mismatch/,
  );
});

test("raw signed payloads and secrets cannot enter diagnostic metadata", async () => {
  const storage = new MemStorage();
  const user = await testUser(storage, "metadata");
  await assert.rejects(
    () => recordVerifiedBillingEvent(storage, event(user.id, {
      diagnosticMetadata: { signedPayload: "do-not-store-this" },
    })),
    /not allowed/,
  );
});

test("out-of-order older provider event cannot override newer entitlement state", async () => {
  const storage = new MemStorage();
  const user = await testUser(storage, "ordering");

  await recordVerifiedBillingEvent(storage, event(user.id, {
    providerEventId: "evt_newer_expired",
    eventType: "subscription_expired",
    occurredAt: new Date("2026-11-01T12:00:00Z"),
    accessStatus: "expired",
    expiresAt: new Date("2026-11-01T12:00:00Z"),
    verifiedAt: new Date("2026-11-01T12:01:00Z"),
    evidenceDigest: digestB,
  }));

  await recordVerifiedBillingEvent(storage, event(user.id, {
    providerEventId: "evt_older_active_delayed",
    occurredAt: new Date("2026-10-20T12:00:00Z"),
    accessStatus: "active",
    expiresAt: new Date("2026-11-20T12:00:00Z"),
    verifiedAt: new Date("2026-11-02T12:00:00Z"),
    evidenceDigest: "c".repeat(64),
  }));

  const entitlement = await resolveProductEntitlementForUser(
    storage,
    user.id,
    new Date("2026-11-02T12:01:00Z"),
  );

  assert.equal(entitlement.tier, "free");
  assert.equal(entitlement.status, "expired");
});

test("deleting the account disables access even if immutable billing audit records remain", async () => {
  const storage = new MemStorage();
  const user = await testUser(storage, "delete");
  await recordVerifiedBillingEvent(storage, event(user.id));

  assert.equal(
    (await resolveProductEntitlementForUser(storage, user.id, new Date("2026-10-03T12:00:00Z"))).tier,
    "plus",
  );

  await storage.deleteUserAccount(user.id);

  assert.equal(
    (await resolveProductEntitlementForUser(storage, user.id, new Date("2026-10-03T12:01:00Z"))).tier,
    "free",
  );
});
