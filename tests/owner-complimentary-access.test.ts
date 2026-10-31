import assert from "node:assert/strict";
import test from "node:test";
import { MemStorage } from "../server/storage";
import { resolveProductEntitlementForUser, grantAllowsPlus } from "../server/lib/durable-entitlements";
import { verifiedProductTier } from "../shared/product-access";

test("approved existing owner gets permanent Plus without payment; others do not", async () => {
  const previous = process.env.SOUL_CODEX_OWNER_USER_IDS;
  const storage = new MemStorage();
  const owner = await storage.getOrCreateAppleUser("verified-owner-subject", "owner@example.test");
  const other = await storage.getOrCreateAppleUser("another-subject", "owner@example.test");
  try {
    process.env.SOUL_CODEX_OWNER_USER_IDS = JSON.stringify([owner.id]);
    const access = await resolveProductEntitlementForUser(storage, owner.id);
    assert.equal(access.tier, "plus");
    assert.equal(access.source, "owner");
    assert.equal(access.status, "complimentary_lifetime");
    assert.equal(access.expiresAt, null);
    assert.equal(access.plan, null);
    assert.equal(verifiedProductTier(access), "plus");
    assert.equal((await resolveProductEntitlementForUser(storage, owner.id, new Date("2040-01-01"))).tier, "plus");
    assert.equal((await resolveProductEntitlementForUser(storage, other.id)).tier, "free");
    assert.equal((await resolveProductEntitlementForUser(storage, null)).tier, "free");
    await storage.deleteUserAccount(owner.id);
    assert.equal((await resolveProductEntitlementForUser(storage, owner.id)).tier, "free");
  } finally {
    if (previous === undefined) delete process.env.SOUL_CODEX_OWNER_USER_IDS;
    else process.env.SOUL_CODEX_OWNER_USER_IDS = previous;
  }
});

test("malformed/wildcard owner configuration fails closed and subscription rules remain intact", async () => {
  const previous = process.env.SOUL_CODEX_OWNER_USER_IDS;
  const storage = new MemStorage();
  const user = await storage.getOrCreateAppleUser("not-an-approved-owner", "owner@example.test");
  try {
    for (const invalid of ["*", '["*"]', '["owner@example.test"]', '{"all":true}', "[]"]) {
      process.env.SOUL_CODEX_OWNER_USER_IDS = invalid;
      assert.equal((await resolveProductEntitlementForUser(storage, user.id)).tier, "free");
    }
    assert.equal(grantAllowsPlus({ capability: "soul_codex_plus", status: "active", expiresAt: null } as any), false);
    assert.equal(verifiedProductTier({ tier: "plus", source: "owner", verified: false }), "free");
  } finally {
    if (previous === undefined) delete process.env.SOUL_CODEX_OWNER_USER_IDS;
    else process.env.SOUL_CODEX_OWNER_USER_IDS = previous;
  }
});
