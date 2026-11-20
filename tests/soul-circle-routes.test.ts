import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import type { Profile } from "@shared/schema";
import { buildStoredBirthEvidenceInput } from "../server/lib/profile-birth-evidence-integrity";
import { hashSoulCircleInviteToken } from "../server/lib/soul-circle";
import { createSoulCircleHandlers } from "../server/routes/soul-circle";
import { MemStorage, PostgresStorage, type IStorage } from "../server/storage";

/*
 * Behavior contract for Soul Circle. The same scenarios run against MemStorage
 * always, and against PostgresStorage whenever DATABASE_URL points at a database
 * with the Soul Codex schema (scripts/ensure-public-share-schema.mjs).
 */

const verified = (sign: string) => ({
  sign,
  verificationStatus: "verified",
  provenance: { source: "test-fixture", engine: "independent-engine", calculatedAt: "2026-09-27T12:00:00.000Z" },
});
const binding = buildStoredBirthEvidenceInput({ birthDate: "1990-09-17", birthTime: "11:11", timezone: "America/New_York", latitude: "40.8448", longitude: "-73.8648" });

type Reply = { status: number; body: any; headers: Record<string, string>; ended: boolean };

function makeHarness(storage: IStorage, clock: { now: Date }) {
  const handlers = createSoulCircleHandlers({ storage, requireDurableFeature: () => true, now: () => clock.now });
  async function call(name: keyof typeof handlers, input: { userId?: string | null; params?: Record<string, string>; body?: unknown } = {}): Promise<Reply> {
    const reply: Reply = { status: 200, body: undefined, headers: {}, ended: false };
    const res: any = {
      setHeader(key: string, value: string) { reply.headers[key.toLowerCase()] = value; },
      status(code: number) { reply.status = code; return this; },
      json(value: unknown) { reply.body = value; return this; },
      end() { reply.ended = true; return this; },
    };
    const req: any = { session: input.userId === null ? {} : { userId: input.userId }, params: input.params ?? {}, body: input.body ?? {} };
    await (handlers[name] as any)(req, res);
    return reply;
  }
  return { call };
}

async function makeUser(storage: IStorage, firstName: string) {
  // Same path real sign-in uses, so the display name is persisted by both storage backends.
  const user = await storage.getOrCreateAppleUser(`sc-${randomUUID()}`, null, firstName, null);
  return user.id;
}

async function makeVerifiedProfile(storage: IStorage, userId: string, name: string) {
  return storage.createProfile({
    userId,
    name,
    birthDate: new Date("1990-09-17T00:00:00.000Z"),
    birthTime: "11:11",
    birthLocation: "Bronx, New York",
    timezone: "America/New_York",
    latitude: "40.8448",
    longitude: "-73.8648",
    astrologyData: { birthEvidenceInput: binding, sun: verified("Virgo"), moon: verified("Leo"), rising: verified("Scorpio") },
    numerologyData: { lifePath: 9 },
    archetypeData: { title: "The Builder" },
  } as any);
}

async function pair(storage: IStorage, h: ReturnType<typeof makeHarness>, aId: string, bId: string) {
  const invite = await h.call("createInvite", { userId: aId });
  assert.equal(invite.status, 201);
  const accepted = await h.call("acceptInvite", { userId: bId, body: { token: invite.body.token } });
  assert.equal(accepted.status, 200);
  return { token: invite.body.token as string, linkId: accepted.body.id as string };
}

const backends: Array<[string, () => IStorage]> = [["MemStorage", () => new MemStorage()]];
if (process.env.DATABASE_URL) backends.push(["PostgresStorage", () => new PostgresStorage()]);

for (const [label, makeStorage] of backends) {
  const t = (name: string, fn: () => Promise<void>) => test(`${label}: ${name}`, fn);

  t("every endpoint requires a signed-in user", async () => {
    const h = makeHarness(makeStorage(), { now: new Date("2026-11-20T00:00:00Z") });
    for (const name of ["createInvite", "listInvites", "revokeInvite", "previewInvite", "acceptInvite", "listFriends", "getFriend", "setShare", "revokeShare", "removeFriend", "blockFriend", "listBlocks", "unblock"] as const) {
      const reply = await h.call(name, { userId: null, params: { id: "x", token: "x" } });
      assert.equal(reply.status, 401, `${name} must reject anonymous callers`);
      assert.equal(reply.headers["cache-control"], "private, no-store, max-age=0");
    }
  });

  t("invites are single-use secrets that are stored only as a hash", async () => {
    const storage = makeStorage();
    const h = makeHarness(storage, { now: new Date("2026-11-20T00:00:00Z") });
    const [a, b, c] = [await makeUser(storage, "Ada"), await makeUser(storage, "Bo"), await makeUser(storage, "Cy")];

    const invite = await h.call("createInvite", { userId: a, body: { displayName: "Ada" } });
    assert.equal(invite.status, 201);
    assert.match(invite.body.path, /^\/circle\/join\//);
    assert.equal(await storage.getSoulCircleInviteByTokenHash(invite.body.token), undefined, "the raw token must not be a lookup key");
    const row = await storage.getSoulCircleInviteByTokenHash(hashSoulCircleInviteToken(invite.body.token));
    assert.ok(row);
    assert.ok(!JSON.stringify(row).includes(invite.body.token), "the raw token must never be stored");

    const preview = await h.call("previewInvite", { userId: b, params: { token: invite.body.token } });
    assert.equal(preview.status, 200);
    assert.equal(preview.body.inviterName, "Ada");
    assert.equal((await h.call("previewInvite", { userId: a, params: { token: invite.body.token } })).status, 400, "own invite");

    assert.equal((await h.call("acceptInvite", { userId: a, body: { token: invite.body.token } })).status, 400, "cannot accept own invite");
    assert.equal((await h.call("acceptInvite", { userId: b, body: { token: invite.body.token } })).status, 200);
    assert.equal((await h.call("acceptInvite", { userId: c, body: { token: invite.body.token } })).status, 410, "single use");
    assert.equal((await h.call("acceptInvite", { userId: c, body: { token: "not-a-real-token-not-a-real-token-xx" } })).status, 410);
    assert.equal((await h.call("acceptInvite", { userId: c, body: { token: "short" } })).status, 410);
  });

  t("two people racing for one invite produce exactly one link", async () => {
    const storage = makeStorage();
    const h = makeHarness(storage, { now: new Date("2026-11-20T00:00:00Z") });
    const [a, b, c] = [await makeUser(storage, "Ada"), await makeUser(storage, "Bo"), await makeUser(storage, "Cy")];
    const invite = await h.call("createInvite", { userId: a });
    const results = await Promise.all([
      h.call("acceptInvite", { userId: b, body: { token: invite.body.token } }),
      h.call("acceptInvite", { userId: c, body: { token: invite.body.token } }),
    ]);
    assert.deepEqual(results.map((r) => r.status).sort(), [200, 410]);
    assert.equal((await storage.listSoulCircleLinksForUser(a)).length, 1);
  });

  t("joining shares nothing; a friend sees only what was consented to and only verified data", async () => {
    const storage = makeStorage();
    const h = makeHarness(storage, { now: new Date("2026-11-20T00:00:00Z") });
    const [a, b] = [await makeUser(storage, "Ada"), await makeUser(storage, "Bo")];
    await makeVerifiedProfile(storage, a, "Ada Private Legal Name");
    const { linkId } = await pair(storage, h, a, b);

    // Both are friends, but nothing is shared yet.
    const before = await h.call("getFriend", { userId: b, params: { id: linkId } });
    assert.equal(before.body.theirChartStatus, "not_shared");
    assert.equal(before.body.theirChart, null);
    assert.equal(before.body.displayName, "Soul Circle friend", "no name until the friend chooses one");

    const consent = await h.call("setShare", { userId: a, params: { id: linkId }, body: { fields: ["sunSign", "risingSign", "lifePath"] } });
    assert.equal(consent.status, 200);
    assert.deepEqual(consent.body.preview, { sunSign: "Virgo", risingSign: "Scorpio", lifePath: 9 });

    const after = await h.call("getFriend", { userId: b, params: { id: linkId } });
    assert.equal(after.body.theirChartStatus, "shared");
    assert.deepEqual(after.body.theirChart, { sunSign: "Virgo", risingSign: "Scorpio", lifePath: 9 });
    const wire = JSON.stringify(after.body);
    for (const secret of ["Leo", "The Builder", "Private Legal Name", "11:11", "Bronx", "40.8448", a]) {
      assert.ok(!wire.includes(secret), `friend response must not contain ${secret}`);
    }

    // Consent is one-directional: Bo shared nothing, so Ada sees nothing of Bo.
    const reverse = await h.call("getFriend", { userId: a, params: { id: linkId } });
    assert.equal(reverse.body.theirChartStatus, "not_shared");
    assert.deepEqual(reverse.body.iShare.fields, ["sunSign", "risingSign", "lifePath"]);
  });

  t("sharing requires a profile and independently verified fields", async () => {
    const storage = makeStorage();
    const h = makeHarness(storage, { now: new Date("2026-11-20T00:00:00Z") });
    const [a, b, d] = [await makeUser(storage, "Ada"), await makeUser(storage, "Bo"), await makeUser(storage, "Di")];
    const { linkId } = await pair(storage, h, a, b);

    const noProfile = await h.call("setShare", { userId: a, params: { id: linkId }, body: { fields: ["sunSign"] } });
    assert.equal(noProfile.status, 409);
    assert.equal(noProfile.body.code, "verified_profile_required");

    // A profile whose Sun is merely user-supplied, not verified, has nothing shareable.
    await storage.createProfile({
      userId: a, name: "Ada", birthDate: new Date("1990-09-17T00:00:00.000Z"),
      astrologyData: { sunSign: "Virgo", sun: { sign: "Virgo" } },
    } as any);
    const unverified = await h.call("setShare", { userId: a, params: { id: linkId }, body: { fields: ["sunSign"] } });
    assert.equal(unverified.status, 422);
    assert.equal(unverified.body.code, "no_verified_fields");

    const bad = await h.call("setShare", { userId: a, params: { id: linkId }, body: { fields: ["humanDesign"] } });
    assert.equal(bad.status, 400);
    assert.equal((await h.call("setShare", { userId: d, params: { id: linkId }, body: { fields: ["sunSign"] } })).status, 404, "non-member");
  });

  t("revoking and expiry both cut access immediately", async () => {
    const storage = makeStorage();
    const clock = { now: new Date("2026-11-20T00:00:00Z") };
    const h = makeHarness(storage, clock);
    const [a, b] = [await makeUser(storage, "Ada"), await makeUser(storage, "Bo")];
    await makeVerifiedProfile(storage, a, "Ada");
    const { linkId } = await pair(storage, h, a, b);

    await h.call("setShare", { userId: a, params: { id: linkId }, body: { fields: ["sunSign"] } });
    assert.equal((await h.call("getFriend", { userId: b, params: { id: linkId } })).body.theirChartStatus, "shared");
    assert.equal((await h.call("revokeShare", { userId: a, params: { id: linkId } })).status, 204);
    assert.equal((await h.call("getFriend", { userId: b, params: { id: linkId } })).body.theirChartStatus, "not_shared");

    // Re-consenting restores it; sharing then lapses on its own after 180 days.
    await h.call("setShare", { userId: a, params: { id: linkId }, body: { fields: ["sunSign"] } });
    assert.equal((await h.call("getFriend", { userId: b, params: { id: linkId } })).body.theirChartStatus, "shared");
    clock.now = new Date("2027-06-01T00:00:00Z");
    assert.equal((await h.call("getFriend", { userId: b, params: { id: linkId } })).body.theirChartStatus, "not_shared");
  });

  t("expired invites cannot be used and open invites are capped", async () => {
    const storage = makeStorage();
    const clock = { now: new Date("2026-11-20T00:00:00Z") };
    const h = makeHarness(storage, clock);
    const [a, b] = [await makeUser(storage, "Ada"), await makeUser(storage, "Bo")];
    const invite = await h.call("createInvite", { userId: a });
    clock.now = new Date("2026-11-28T00:00:00Z");
    assert.equal((await h.call("acceptInvite", { userId: b, body: { token: invite.body.token } })).status, 410);

    const capped = makeStorage();
    const h2 = makeHarness(capped, { now: new Date("2026-11-20T00:00:00Z") });
    const owner = await makeUser(capped, "Cap");
    for (let i = 0; i < 10; i++) assert.equal((await h2.call("createInvite", { userId: owner })).status, 201);
    const eleventh = await h2.call("createInvite", { userId: owner });
    assert.equal(eleventh.status, 409);
    assert.equal(eleventh.body.code, "soul_circle_invite_limit");
    const open = (await h2.call("listInvites", { userId: owner })).body;
    assert.ok(open.every((invite: any) => !("token" in invite) && !("tokenHash" in invite)), "listing must never expose tokens");
    assert.equal((await h2.call("revokeInvite", { userId: owner, params: { id: open[0].id } })).status, 204);
    assert.equal((await h2.call("createInvite", { userId: owner })).status, 201);
  });

  t("a stranger cannot read or change anyone else's link", async () => {
    const storage = makeStorage();
    const h = makeHarness(storage, { now: new Date("2026-11-20T00:00:00Z") });
    const [a, b, e] = [await makeUser(storage, "Ada"), await makeUser(storage, "Bo"), await makeUser(storage, "Eve")];
    await makeVerifiedProfile(storage, a, "Ada");
    const { linkId } = await pair(storage, h, a, b);
    await h.call("setShare", { userId: a, params: { id: linkId }, body: { fields: ["sunSign"] } });

    for (const name of ["getFriend", "revokeShare", "removeFriend", "blockFriend"] as const) {
      assert.equal((await h.call(name, { userId: e, params: { id: linkId } })).status, 404, `${name} must not work for a non-member`);
    }
    assert.equal((await h.call("setShare", { userId: e, params: { id: linkId }, body: { fields: ["sunSign"] } })).status, 404);
    assert.equal((await h.call("unblock", { userId: e, params: { id: linkId } })).status, 404);
    assert.equal((await h.call("listFriends", { userId: e })).body.length, 0);
    // Nothing changed for the real members.
    assert.equal((await h.call("getFriend", { userId: b, params: { id: linkId } })).body.theirChartStatus, "shared");
  });

  t("blocking ends sharing both ways, is invisible to the blocked person, and can be lifted only by the blocker", async () => {
    const storage = makeStorage();
    const h = makeHarness(storage, { now: new Date("2026-11-20T00:00:00Z") });
    const [a, b] = [await makeUser(storage, "Ada"), await makeUser(storage, "Bo")];
    await makeVerifiedProfile(storage, a, "Ada");
    await makeVerifiedProfile(storage, b, "Bo");
    const { linkId } = await pair(storage, h, a, b);
    await h.call("setShare", { userId: a, params: { id: linkId }, body: { fields: ["sunSign"] } });
    await h.call("setShare", { userId: b, params: { id: linkId }, body: { fields: ["sunSign"] } });

    assert.equal((await h.call("blockFriend", { userId: b, params: { id: linkId } })).status, 204);
    assert.equal((await h.call("listFriends", { userId: a })).body.length, 0);
    assert.equal((await h.call("listFriends", { userId: b })).body.length, 0);
    assert.equal(await storage.getSoulCircleShare(a, b), undefined);
    assert.equal(await storage.getSoulCircleShare(b, a), undefined);
    assert.equal((await h.call("getFriend", { userId: a, params: { id: linkId } })).status, 404);

    // Ada cannot get back in with a fresh invite, and cannot tell why.
    const retry = await h.call("createInvite", { userId: a });
    assert.equal((await h.call("acceptInvite", { userId: b, body: { token: retry.body.token } })).status, 410);

    assert.deepEqual((await h.call("listBlocks", { userId: b })).body.map((row: any) => row.displayName), ["Soul Circle friend"]);
    assert.equal((await h.call("listBlocks", { userId: a })).body.length, 0);
    assert.equal((await h.call("unblock", { userId: a, params: { id: linkId } })).status, 404, "the blocked person cannot unblock");
    assert.equal((await h.call("unblock", { userId: b, params: { id: linkId } })).status, 204);

    // Unblocking restores nothing: they must be invited again and consent again.
    assert.equal((await h.call("listFriends", { userId: b })).body.length, 0);
    const again = await pair(storage, h, a, b);
    assert.equal((await h.call("getFriend", { userId: b, params: { id: again.linkId } })).body.theirChartStatus, "not_shared");
  });

  t("removing a friend deletes the link and both consents", async () => {
    const storage = makeStorage();
    const h = makeHarness(storage, { now: new Date("2026-11-20T00:00:00Z") });
    const [a, b] = [await makeUser(storage, "Ada"), await makeUser(storage, "Bo")];
    await makeVerifiedProfile(storage, a, "Ada");
    await makeVerifiedProfile(storage, b, "Bo");
    const { linkId } = await pair(storage, h, a, b);
    await h.call("setShare", { userId: a, params: { id: linkId }, body: { fields: ["sunSign"] } });
    await h.call("setShare", { userId: b, params: { id: linkId }, body: { fields: ["sunSign"] } });

    assert.equal((await h.call("removeFriend", { userId: a, params: { id: linkId } })).status, 204);
    assert.equal((await h.call("getFriend", { userId: b, params: { id: linkId } })).status, 404);
    assert.equal(await storage.getSoulCircleShare(a, b), undefined);
    assert.equal(await storage.getSoulCircleShare(b, a), undefined);
    assert.equal((await h.call("listFriends", { userId: b })).body.length, 0);
  });

  t("a chosen display name is shown only when the sharer consented to it", async () => {
    const storage = makeStorage();
    const h = makeHarness(storage, { now: new Date("2026-11-20T00:00:00Z") });
    const [a, b] = [await makeUser(storage, "Ada"), await makeUser(storage, "Bo")];
    await makeVerifiedProfile(storage, a, "Ada");
    const { linkId } = await pair(storage, h, a, b);
    await h.call("setShare", { userId: a, params: { id: linkId }, body: { fields: ["displayName", "sunSign"], displayName: "Ada from Bronx" } });
    const view = await h.call("getFriend", { userId: b, params: { id: linkId } });
    assert.equal(view.body.displayName, "Ada from Bronx");
    assert.equal(view.body.theirChart.displayName, "Ada from Bronx");
  });

  t("deleting an account removes every invite, link and consent that involves it", async () => {
    const storage = makeStorage();
    const h = makeHarness(storage, { now: new Date("2026-11-20T00:00:00Z") });
    const [a, b] = [await makeUser(storage, "Ada"), await makeUser(storage, "Bo")];
    await makeVerifiedProfile(storage, a, "Ada");
    const { linkId } = await pair(storage, h, a, b);
    await h.call("setShare", { userId: a, params: { id: linkId }, body: { fields: ["sunSign"] } });
    await h.call("createInvite", { userId: a });

    await storage.deleteUserAccount(a);
    assert.equal(await storage.getSoulCircleLinkById(linkId), undefined);
    assert.equal(await storage.getSoulCircleShare(a, b), undefined);
    assert.equal((await storage.listSoulCircleInvites(a)).length, 0);
    assert.equal((await h.call("listFriends", { userId: b })).body.length, 0);
  });

  t("account names from a sign-in provider are never shown unless chosen for this friend", async () => {
    const storage = makeStorage();
    const h = makeHarness(storage, { now: new Date("2026-11-20T00:00:00Z") });
    // Google sign-in stores the provider's full display name as firstName.
    const fullName = "Adaline Marie Lovelace-Quillfeather";
    const google = await storage.getOrCreateGoogleUser(`sc-${randomUUID()}`, "private@example.com", fullName);
    const b = await makeUser(storage, "Bo");
    await makeVerifiedProfile(storage, google.id, "Ada");
    await makeVerifiedProfile(storage, b, "Bo");

    const invite = await h.call("createInvite", { userId: google.id });
    const preview = await h.call("previewInvite", { userId: b, params: { token: invite.body.token } });
    assert.equal(preview.body.inviterName, "Soul Circle friend");
    const linkId = (await h.call("acceptInvite", { userId: b, body: { token: invite.body.token } })).body.id;

    const everything = async () => JSON.stringify([
      preview.body,
      (await h.call("listFriends", { userId: b })).body,
      (await h.call("getFriend", { userId: b, params: { id: linkId } })).body,
      (await h.call("listFriends", { userId: google.id })).body,
      (await h.call("listBlocks", { userId: b })).body,
    ]);
    // Even after sharing chart fields (but not a name), the account name must not appear.
    await h.call("setShare", { userId: google.id, params: { id: linkId }, body: { fields: ["sunSign"] } });
    for (const leak of [fullName, "Lovelace", "Quillfeather", "private@example.com"]) {
      assert.ok(!(await everything()).includes(leak), `${leak} must not be exposed`);
    }
    await h.call("blockFriend", { userId: b, params: { id: linkId } });
    for (const leak of [fullName, "Lovelace"]) assert.ok(!(await everything()).includes(leak), `${leak} must not be exposed in the block list`);
  });

  t("a consent write that was authorized before the friendship ended cannot outlive it", async () => {
    const storage = makeStorage();
    const h = makeHarness(storage, { now: new Date("2026-11-20T00:00:00Z") });
    const [a, b] = [await makeUser(storage, "Ada"), await makeUser(storage, "Bo")];
    await makeVerifiedProfile(storage, a, "Ada");
    const { linkId } = await pair(storage, h, a, b);

    // Hold the share request after it passed the membership check, at the profile lookup.
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const slow: IStorage = Object.create(storage);
    slow.getProfileByUserId = async (userId: string) => { await gate; return storage.getProfileByUserId(userId); };
    const slowHarness = makeHarness(slow, { now: new Date("2026-11-20T00:00:00Z") });

    const pendingShare = slowHarness.call("setShare", { userId: a, params: { id: linkId }, body: { fields: ["sunSign"] } });
    await new Promise((resolve) => setTimeout(resolve, 25));
    assert.equal((await h.call("removeFriend", { userId: b, params: { id: linkId } })).status, 204);
    release();
    assert.equal((await pendingShare).status, 404, "the delayed share must be refused");
    assert.equal(await storage.getSoulCircleShare(a, b), undefined, "no consent may be left behind");

    // Becoming friends again starts private: nothing carried over.
    const again = await pair(storage, h, a, b);
    const view = await h.call("getFriend", { userId: b, params: { id: again.linkId } });
    assert.equal(view.body.theirChartStatus, "not_shared");
    assert.equal(view.body.theirChart, null);
  });
}
