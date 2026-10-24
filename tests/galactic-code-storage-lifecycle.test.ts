import assert from "node:assert/strict";
import test from "node:test";
import { MemStorage } from "../server/storage";

async function createProfile(storage: MemStorage, owner: { userId?: string; sessionId?: string }) {
  return storage.createProfile({
    userId: owner.userId ?? null,
    sessionId: owner.sessionId ?? null,
    name: "Galactic Test",
    fullBirthName: "Galactic Test",
    birthDate: new Date("1990-09-17T00:00:00.000Z"),
    birthTime: null,
    birthLocation: null,
    timezone: null,
    latitude: null,
    longitude: null,
  } as any);
}

test("Galactic record upsert is profile-keyed and revision/version bound", async () => {
  const storage = new MemStorage();
  const profile = await createProfile(storage, { sessionId: "guest-a" });
  const first = await storage.upsertGalacticCodeRecord({
    profileId: profile.id,
    userId: null,
    sessionId: "guest-a",
    revision: "a".repeat(64),
    version: "galactic-code-v1",
    result: { fingerprint: "private-a" },
    generatedAt: new Date("2026-10-24T12:00:00.000Z"),
  });
  const second = await storage.upsertGalacticCodeRecord({
    profileId: profile.id,
    userId: null,
    sessionId: "guest-a",
    revision: "b".repeat(64),
    version: "galactic-code-v1",
    result: { fingerprint: "private-b" },
    generatedAt: new Date("2026-10-24T12:01:00.000Z"),
  });
  assert.equal(first.id, second.id);
  assert.equal((await storage.getGalacticCodeRecord(profile.id))?.revision, "b".repeat(64));
});

test("session ownership migration also migrates Galactic record ownership", async () => {
  const storage = new MemStorage();
  const profile = await createProfile(storage, { sessionId: "guest-a" });
  await storage.upsertGalacticCodeRecord({
    profileId: profile.id, userId: null, sessionId: "guest-a",
    revision: "a".repeat(64), version: "galactic-code-v1", result: {}, generatedAt: new Date(),
  });
  await storage.migrateSessionOwnershipToUser("guest-a", "user-a");
  const record = await storage.getGalacticCodeRecord(profile.id);
  assert.equal(record?.userId, "user-a");
  assert.equal(record?.sessionId, null);
});

test("session deletion removes Galactic records", async () => {
  const storage = new MemStorage();
  const profile = await createProfile(storage, { sessionId: "guest-a" });
  await storage.upsertGalacticCodeRecord({
    profileId: profile.id, userId: null, sessionId: "guest-a",
    revision: "a".repeat(64), version: "galactic-code-v1", result: {}, generatedAt: new Date(),
  });
  await storage.deleteSessionData("guest-a");
  assert.equal(await storage.getGalacticCodeRecord(profile.id), undefined);
  assert.equal(await storage.getProfile(profile.id), undefined);
});

test("account deletion removes user-owned Galactic records", async () => {
  const storage = new MemStorage();
  const profile = await createProfile(storage, { userId: "user-a" });
  await storage.upsertGalacticCodeRecord({
    profileId: profile.id, userId: "user-a", sessionId: null,
    revision: "a".repeat(64), version: "galactic-code-v1", result: {}, generatedAt: new Date(),
  });
  await storage.deleteUserAccount("user-a");
  assert.equal(await storage.getGalacticCodeRecord(profile.id), undefined);
  assert.equal(await storage.getProfile(profile.id), undefined);
});
