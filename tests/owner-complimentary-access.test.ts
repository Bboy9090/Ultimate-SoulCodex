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

test("complimentary grants unlock ordinary accounts only inside their exact bounded window", async () => {
  const previous = process.env.SOUL_CODEX_COMPLIMENTARY_GRANTS;
  const storage = new MemStorage();
  const user = await storage.getOrCreateAppleUser("complimentary-user", "review@example.test");
  const other = await storage.getOrCreateAppleUser("unapproved-user", "review@example.test");
  const startsAt = "2030-01-01T00:00:00.000Z";
  const expiresAt = "2030-02-01T00:00:00.000Z";
  try {
    process.env.SOUL_CODEX_COMPLIMENTARY_GRANTS = JSON.stringify([{userId:user.id, startsAt, expiresAt}]);
    const access = await resolveProductEntitlementForUser(storage, user.id, new Date(startsAt));
    assert.equal(access.tier, "plus");
    assert.equal(access.source, "complimentary");
    assert.equal(access.status, "complimentary_time_limited");
    assert.equal(access.plan, null);
    assert.equal(access.expiresAt, expiresAt);
    assert.equal((await resolveProductEntitlementForUser(storage, user.id, new Date("2029-12-31T23:59:59Z"))).tier, "free");
    assert.equal((await resolveProductEntitlementForUser(storage, user.id, new Date(expiresAt))).tier, "free");
    assert.equal((await resolveProductEntitlementForUser(storage, other.id, new Date(startsAt))).tier, "free");
    assert.equal((await resolveProductEntitlementForUser(storage, null, new Date(startsAt))).tier, "free");
    await storage.deleteUserAccount(user.id);
    assert.equal((await resolveProductEntitlementForUser(storage, user.id, new Date(startsAt))).tier, "free");
  } finally {
    if (previous === undefined) delete process.env.SOUL_CODEX_COMPLIMENTARY_GRANTS;
    else process.env.SOUL_CODEX_COMPLIMENTARY_GRANTS = previous;
  }
});

test("malformed, wildcard, oversized, duplicate or unbounded complimentary grants fail closed", async () => {
  const previous = process.env.SOUL_CODEX_COMPLIMENTARY_GRANTS;
  const storage = new MemStorage();
  const user = await storage.getOrCreateAppleUser("grant-boundary-user", "review@example.test");
  const valid = {userId:user.id, startsAt:"2030-01-01T00:00:00.000Z", expiresAt:"2030-02-01T00:00:00.000Z"};
  try {
    for (const value of ["*", [ {...valid,userId:"*"} ], [{...valid,userId:user.email}], [ {...valid,expiresAt:null} ],
      [{...valid,expiresAt:"invalid"}], [{...valid,expiresAt:valid.startsAt}],
      [{...valid,expiresAt:"2031-01-01T00:00:00.000Z"}], [{...valid,admin:true}],
      [valid,valid], Array.from({length:21},()=>valid)]) {
      process.env.SOUL_CODEX_COMPLIMENTARY_GRANTS = typeof value === "string" ? value : JSON.stringify(value);
      assert.equal((await resolveProductEntitlementForUser(storage, user.id, new Date(valid.startsAt))).tier, "free");
    }
    process.env.SOUL_CODEX_COMPLIMENTARY_GRANTS = "[]";
    assert.equal((await resolveProductEntitlementForUser(storage, user.id, new Date(valid.startsAt))).tier, "free");
    const future = new Date(Date.now()+86400000).toISOString();
    const accepted = {tier:"plus",verified:true,source:"complimentary",status:"complimentary_time_limited",expiresAt:future};
    assert.equal(verifiedProductTier(accepted), "plus");
    assert.equal(verifiedProductTier({...accepted,verified:false}), "free");
    assert.equal(verifiedProductTier({...accepted,status:"active"}), "free");
    assert.equal(verifiedProductTier({...accepted,expiresAt:null}), "free");
    assert.equal(verifiedProductTier({...accepted,expiresAt:"invalid"}), "free");
    assert.equal(verifiedProductTier({...accepted,expiresAt:"2000-01-01T00:00:00Z"}), "free");
  } finally {
    if (previous === undefined) delete process.env.SOUL_CODEX_COMPLIMENTARY_GRANTS;
    else process.env.SOUL_CODEX_COMPLIMENTARY_GRANTS = previous;
  }
});
