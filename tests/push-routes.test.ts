import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { buildStoredBirthEvidenceInput } from "../server/lib/profile-birth-evidence-integrity";
import { hashPushToken, type PushService } from "../server/lib/push-delivery";
import { createSoulCircleHandlers } from "../server/routes/soul-circle";
import { MemStorage, PostgresStorage, type IStorage } from "../server/storage";

/*
 * Phone-push registration and triggers. Same scenarios against MemStorage always and against
 * PostgresStorage whenever DATABASE_URL points at a database with the Soul Codex schema.
 * Delivery itself is faked here; the real FCM transport is covered in push-delivery.test.ts and
 * remains unverified against Google until credentials exist.
 */

const verified = (sign: string) => ({
  sign, verificationStatus: "verified",
  provenance: { source: "test-fixture", engine: "independent-engine", calculatedAt: "2026-09-27T12:00:00.000Z" },
});
const binding = buildStoredBirthEvidenceInput({ birthDate: "1990-09-17", birthTime: "11:11", timezone: "America/New_York", latitude: "40.8448", longitude: "-73.8648" });

type Reply = { status: number; body: any };

function makeFakePush(available: boolean) {
  const notified: string[] = [];
  const service: PushService = {
    isAvailable: () => available,
    notifyUpdate: async (userId) => { notified.push(userId); return { sent: 1, removed: 0 }; },
  };
  return { service, notified };
}

function makeHarness(storage: IStorage, push: PushService | undefined) {
  const clock = { now: new Date("2026-11-20T00:00:00Z") };
  const handlers = createSoulCircleHandlers({ storage, requireDurableFeature: () => true, now: () => clock.now, push });
  async function call(name: keyof typeof handlers, input: { userId?: string | null; params?: Record<string, string>; body?: unknown } = {}): Promise<Reply> {
    const reply: Reply = { status: 200, body: undefined };
    const res: any = { setHeader() {}, status(code: number) { reply.status = code; return this; }, json(value: unknown) { reply.body = value; return this; }, end() { return this; } };
    const req: any = { session: input.userId === null ? {} : { userId: input.userId }, params: input.params ?? {}, body: input.body ?? {} };
    await (handlers[name] as any)(req, res);
    // Notifications are fire-and-forget; let them settle before assertions.
    await new Promise((resolve) => setImmediate(resolve));
    return reply;
  }
  return { call, clock };
}

async function makeUser(storage: IStorage, name: string) {
  return (await storage.getOrCreateAppleUser(`push-${randomUUID()}`, null, name, null)).id;
}
async function makeVerifiedProfile(storage: IStorage, userId: string) {
  return storage.createProfile({
    userId, name: "Fixture", birthDate: new Date("1990-09-17T00:00:00.000Z"), birthTime: "11:11", birthLocation: "Bronx, New York",
    timezone: "America/New_York", latitude: "40.8448", longitude: "-73.8648",
    astrologyData: { birthEvidenceInput: binding, sun: verified("Virgo"), moon: verified("Leo"), rising: verified("Scorpio") },
    numerologyData: { lifePath: 9 }, archetypeData: { title: "The Builder" },
  } as any);
}
const token = (label: string) => `${label}-${randomUUID()}`.replace(/[^A-Za-z0-9:_.\-]/g, "x").padEnd(30, "x");

const backends: Array<[string, () => IStorage]> = [["MemStorage", () => new MemStorage()]];
if (process.env.DATABASE_URL) backends.push(["PostgresStorage", () => new PostgresStorage()]);

for (const [label, makeStorage] of backends) {
  const t = (name: string, fn: () => Promise<void>) => test(`${label}: ${name}`, fn);

  t("push endpoints require sign-in", async () => {
    const h = makeHarness(makeStorage(), makeFakePush(true).service);
    for (const name of ["pushStatus", "registerPushDevice", "unregisterPushDevice"] as const) {
      assert.equal((await h.call(name, { userId: null })).status, 401, name);
    }
  });

  t("no token is accepted until delivery is available, and status says so", async () => {
    const storage = makeStorage();
    const userId = await makeUser(storage, "Ada");
    for (const push of [undefined, makeFakePush(false).service]) {
      const h = makeHarness(storage, push);
      assert.deepEqual((await h.call("pushStatus", { userId })).body, { available: false, registered: false, deviceCount: 0 });
      const reply = await h.call("registerPushDevice", { userId, body: { platform: "ios", token: token("a") } });
      assert.equal(reply.status, 409);
      assert.equal(reply.body.code, "push_unavailable");
      assert.equal((await storage.listPushDevices(userId)).length, 0);
    }
  });

  t("registration validates input, never returns a token, and unregister removes only the caller's token", async () => {
    const storage = makeStorage();
    const h = makeHarness(storage, makeFakePush(true).service);
    const [a, b] = [await makeUser(storage, "Ada"), await makeUser(storage, "Bo")];
    for (const body of [{}, { platform: "windows", token: token("a") }, { platform: "ios", token: "short" }, { platform: "ios", token: token("a"), extra: 1 }, { platform: "ios", token: "bad token with spaces".padEnd(30, "x") }]) {
      const reply = await h.call("registerPushDevice", { userId: a, body });
      assert.equal(reply.status, 400, JSON.stringify(body));
      assert.equal(reply.body.code, "invalid_device");
    }
    const tokenA = token("a");
    const registered = await h.call("registerPushDevice", { userId: a, body: { platform: "android", token: tokenA } });
    assert.deepEqual(registered.body, { registered: true });
    const status = await h.call("pushStatus", { userId: a });
    assert.deepEqual(status.body, { available: true, registered: true, deviceCount: 1 });
    assert.ok(!JSON.stringify(status.body).includes(tokenA), "a token is never returned");

    // Registering the same token twice keeps one row.
    await h.call("registerPushDevice", { userId: a, body: { platform: "android", token: tokenA } });
    assert.equal((await storage.listPushDevices(a)).length, 1);

    // Another account cannot remove it, even knowing the token.
    assert.deepEqual((await h.call("unregisterPushDevice", { userId: b, body: { token: tokenA } })).body, { removed: 0 });
    assert.equal((await storage.listPushDevices(a)).length, 1);
    assert.deepEqual((await h.call("unregisterPushDevice", { userId: a, body: { token: tokenA } })).body, { removed: 1 });
    assert.equal((await h.call("unregisterPushDevice", { userId: a, body: {} })).status, 400);
  });

  t("a token belongs to one account: registering it elsewhere moves it", async () => {
    const storage = makeStorage();
    const h = makeHarness(storage, makeFakePush(true).service);
    const [a, b] = [await makeUser(storage, "Ada"), await makeUser(storage, "Bo")];
    const shared = token("shared");
    await h.call("registerPushDevice", { userId: a, body: { platform: "ios", token: shared } });
    await h.call("registerPushDevice", { userId: b, body: { platform: "ios", token: shared } });
    assert.equal((await storage.listPushDevices(a)).length, 0, "the previous account no longer receives pushes for this phone");
    assert.equal((await storage.listPushDevices(b)).length, 1);
  });

  t("an account keeps at most ten devices, newest first, and can unregister all", async () => {
    const storage = makeStorage();
    const h = makeHarness(storage, makeFakePush(true).service);
    const userId = await makeUser(storage, "Ada");
    for (let i = 0; i < 12; i += 1) {
      h.clock.now = new Date(Date.UTC(2026, 10, 20, 0, 0, i));
      await h.call("registerPushDevice", { userId, body: { platform: "android", token: token(`d${i}`) } });
    }
    const devices = await storage.listPushDevices(userId);
    assert.equal(devices.length, 10);
    assert.ok(devices.every((device) => !device.token.startsWith("d0-") && !device.token.startsWith("d1-")), "the oldest two were dropped");
    assert.deepEqual((await h.call("unregisterPushDevice", { userId, body: { all: true } })).body, { removed: 10 });
    assert.equal((await storage.listPushDevices(userId)).length, 0);
  });

  t("deleting an account deletes its device tokens", async () => {
    const storage = makeStorage();
    const h = makeHarness(storage, makeFakePush(true).service);
    const userId = await makeUser(storage, "Ada");
    await h.call("registerPushDevice", { userId, body: { platform: "ios", token: token("gone") } });
    await storage.deleteUserAccount(userId);
    assert.equal((await storage.listPushDevices(userId)).length, 0);
  });

  t("phones are alerted only for real news, never for tweaks, stops or removals", async () => {
    const storage = makeStorage();
    const fake = makeFakePush(true);
    const h = makeHarness(storage, fake.service);
    const [a, b] = [await makeUser(storage, "Ada"), await makeUser(storage, "Bo")];
    await Promise.all([makeVerifiedProfile(storage, a), makeVerifiedProfile(storage, b)]);

    const invite = await h.call("createInvite", { userId: a });
    assert.deepEqual(fake.notified, [], "creating an invite alerts nobody");
    const accepted = await h.call("acceptInvite", { userId: b, body: { token: invite.body.token } });
    assert.equal(accepted.status, 200);
    assert.deepEqual(fake.notified, [a], "the inviter hears that a friend joined");

    // Replaying the same invite is refused and must not alert again.
    assert.equal((await h.call("acceptInvite", { userId: b, body: { token: invite.body.token } })).status, 410);
    assert.deepEqual(fake.notified, [a]);

    const linkId = accepted.body.id;
    const share = { fields: ["sunSign", "moonSign"] };
    assert.equal((await h.call("setShare", { userId: a, params: { id: linkId }, body: share })).status, 200);
    assert.deepEqual(fake.notified, [a, b], "starting to share alerts the friend");

    await h.call("setShare", { userId: a, params: { id: linkId }, body: { fields: ["sunSign"] } });
    assert.deepEqual(fake.notified, [a, b], "changing what is shared is not news");
    await h.call("revokeShare", { userId: a, params: { id: linkId } });
    await h.call("removeFriend", { userId: b, params: { id: linkId } });
    assert.deepEqual(fake.notified, [a, b], "stopping or leaving never alerts anyone");
  });

  t("a failing or slow push provider never fails or delays the request", async () => {
    const storage = makeStorage();
    const failing: PushService = { isAvailable: () => true, notifyUpdate: () => Promise.reject(new Error("provider down")) };
    const sync: PushService = { isAvailable: () => true, notifyUpdate: () => { throw new Error("sync boom"); } };
    for (const push of [failing, sync]) {
      const h = makeHarness(storage, push);
      const [a, b] = [await makeUser(storage, "Ada"), await makeUser(storage, "Bo")];
      const invite = await h.call("createInvite", { userId: a });
      const accepted = await h.call("acceptInvite", { userId: b, body: { token: invite.body.token } });
      assert.equal(accepted.status, 200);
    }
  });

  t("a failed registration never writes the device token to the logs", async () => {
    const storage = makeStorage();
    const userId = await makeUser(storage, "Ada");
    const secret = token("leak");
    // Mimics a driver error that embeds query parameters, as Drizzle's does.
    (storage as any).upsertPushDevice = async (_u: string, _p: string, tok: string) => {
      throw Object.assign(new Error(`Failed query: insert into push_devices params: ${tok}`), { params: [tok], code: "23505" });
    };
    (storage as any).deleteAllPushDevices = async () => { throw Object.assign(new Error(`boom ${secret}`), { params: [secret] }); };
    const h = makeHarness(storage, makeFakePush(true).service);
    const logged: unknown[][] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => { logged.push(args); };
    try {
      assert.equal((await h.call("registerPushDevice", { userId, body: { platform: "ios", token: secret } })).status, 500);
      assert.equal((await h.call("unregisterPushDevice", { userId, body: { all: true } })).status, 500);
    } finally { console.error = original; }
    assert.equal(logged.length, 2);
    const text = logged.map((args) => args.map((a) => (typeof a === "string" ? a : JSON.stringify(a, Object.getOwnPropertyNames(Object(a))))).join(" ")).join("\n");
    assert.ok(!text.includes(secret), "the token must not appear in logs");
    assert.match(text, /Error \(23505\)/);
  });
}
