import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { MemStorage } from "../server/storage";
import {
  recordVerifiedBillingEvent,
  resolveProductEntitlementForUser,
  resolveSandboxBillingEntitlementForUser,
  SOUL_CODEX_PLUS_CAPABILITY,
} from "../server/lib/product-entitlement";

const now = new Date("2026-11-17T12:00:00Z");
const other = "22222222-2222-4222-8222-222222222222";

async function fixture() {
  const storage = new MemStorage();
  const user = await storage.getOrCreateAppleUser("sandbox-isolation", "tester@example.test");
  return { storage, user };
}
function event(userId: string, environment: "production" | "sandbox", eventId: string, overrides: Record<string, unknown> = {}) {
  return {
    userId, provider: "apple" as const, providerEventId: eventId,
    providerTransactionId: "txn_" + eventId, productId: "app.soulcodex.plus.monthly.renewing",
    plan: "monthly" as const, environment, eventType: "transaction_verified",
    occurredAt: new Date("2026-11-17T11:00:00Z"), verificationState: "verified" as const,
    accessStatus: "active" as const, purchasedAt: new Date("2026-11-17T11:00:00Z"),
    expiresAt: new Date("2026-12-17T11:00:00Z"), verifiedAt: new Date("2026-11-17T11:01:00Z"),
    evidenceDigest: eventId.charCodeAt(0).toString(16).padStart(2, "0").repeat(32),
    diagnosticMetadata: { source: "storekit2" }, ...overrides,
  };
}

async function withTester(userId: string, run: () => Promise<void>) {
  const saved = process.env.SOUL_CODEX_BILLING_QUALIFICATION_USER_IDS;
  process.env.SOUL_CODEX_BILLING_QUALIFICATION_USER_IDS = JSON.stringify([userId]);
  try { await run(); } finally {
    if (saved === undefined) delete process.env.SOUL_CODEX_BILLING_QUALIFICATION_USER_IDS;
    else process.env.SOUL_CODEX_BILLING_QUALIFICATION_USER_IDS = saved;
  }
}

test("sandbox purchase remains auditable but never grants ordinary production Plus", async () => {
  const { storage, user } = await fixture();
  await recordVerifiedBillingEvent(storage, event(user.id, "sandbox", "s1"));
  assert.equal((await storage.getLatestEntitlementGrant(user.id, SOUL_CODEX_PLUS_CAPABILITY))?.status, undefined);
  assert.equal((await storage.getLatestEntitlementGrant(user.id, SOUL_CODEX_PLUS_CAPABILITY, "sandbox"))?.status, "active");
  assert.equal((await resolveProductEntitlementForUser(storage, user.id, now)).tier, "free");
  assert.equal((await resolveSandboxBillingEntitlementForUser(storage, user.id, now)).tier, "free");
  await withTester(user.id, async () => {
    assert.equal((await resolveSandboxBillingEntitlementForUser(storage, user.id, now)).tier, "plus");
    // Re-login/restart through normal access must remain Free.
    assert.equal((await resolveProductEntitlementForUser(storage, user.id, now)).tier, "free");
  });
});

test("sandbox refund and expiry cannot override a valid production subscription", async () => {
  const { storage, user } = await fixture();
  await recordVerifiedBillingEvent(storage, event(user.id, "production", "p1"));
  await recordVerifiedBillingEvent(storage, event(user.id, "sandbox", "s2", {
    occurredAt: new Date("2026-11-17T11:10:00Z"),
    verifiedAt: new Date("2026-11-17T11:11:00Z"),
    accessStatus: "refunded",
  }));
  assert.equal((await resolveProductEntitlementForUser(storage, user.id, now)).tier, "plus");
  await withTester(user.id, async () => {
    assert.equal((await resolveSandboxBillingEntitlementForUser(storage, user.id, now)).tier, "free");
  });
});

test("newer sandbox active event never masks a production revocation", async () => {
  const { storage, user } = await fixture();
  await recordVerifiedBillingEvent(storage, event(user.id, "production", "p3", {
    accessStatus: "revoked",
  }));
  await recordVerifiedBillingEvent(storage, event(user.id, "sandbox", "s4", {
    occurredAt: new Date("2026-11-17T11:20:00Z"),
    verifiedAt: new Date("2026-11-17T11:21:00Z"),
  }));
  assert.equal((await resolveProductEntitlementForUser(storage, user.id, now)).tier, "free");
  await withTester(user.id, async () => {
    assert.equal((await resolveSandboxBillingEntitlementForUser(storage, user.id, now)).tier, "plus");
  });
});

test("sandbox preview rejects users outside explicit test allowlist, even with verified evidence", async () => {
  const { storage, user } = await fixture();
  await recordVerifiedBillingEvent(storage, event(user.id, "sandbox", "s5"));
  await withTester(other, async () => {
    assert.equal((await resolveSandboxBillingEntitlementForUser(storage, user.id, now)).tier, "free");
  });
  await storage.deleteUserAccount(user.id);
  await withTester(user.id, async () => {
    assert.equal((await resolveSandboxBillingEntitlementForUser(storage, user.id, now)).tier, "free");
  });
});

test("production storage joins entitlement grants to verified transaction environment", () => {
  const storage = readFileSync(new URL("../server/storage.ts", import.meta.url), "utf8");
  const billing = readFileSync(new URL("../server/billing.ts", import.meta.url), "utf8");
  assert.match(storage, /innerJoin\(billingTransactionEvents, eq\(entitlementGrants\.sourceTransactionEventId, billingTransactionEvents\.id\)\)/);
  assert.match(storage, /eq\(billingTransactionEvents\.environment, environment\)/);
  assert.match(billing, /qualificationEnabled\s*\? await resolveSandboxBillingEntitlementForUser\(storage, userId\)/);
});
