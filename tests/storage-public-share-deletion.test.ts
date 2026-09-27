import assert from "node:assert/strict";
import test from "node:test";
import { MemStorage } from "../server/storage";

test("anonymous session deletion removes its public share snapshots", async () => {
  const storage = new MemStorage();
  const sessionId = "session-public-share-delete";
  const profile = await storage.createProfile({
    name: "Anonymous",
    birthDate: new Date("1990-01-01T00:00:00.000Z"),
    sessionId,
  } as any);

  const share = await storage.createPublicProfileShare(
    profile.id,
    "anonymous-share-token",
    { version: 1, fields: { sunSign: "Capricorn" } },
  );

  assert.ok(await storage.getPublicProfileShareByToken(share.token));
  await storage.deleteSessionData(sessionId);

  assert.equal(await storage.getProfile(profile.id), undefined);
  assert.equal(await storage.getPublicProfileShareByToken(share.token), undefined);
});

test("user account deletion removes its public share snapshots", async () => {
  const storage = new MemStorage();
  const user = await storage.createUser({ username: "delete-share-user", password: "hashed-test-value" });
  const profile = await storage.createProfile({
    name: "Account Owner",
    birthDate: new Date("1990-01-01T00:00:00.000Z"),
    userId: user.id,
  } as any);

  const share = await storage.createPublicProfileShare(
    profile.id,
    "account-share-token",
    { version: 1, fields: { lifePath: 9 } },
  );

  assert.ok(await storage.getPublicProfileShareByToken(share.token));
  await storage.deleteUserAccount(user.id);

  assert.equal(await storage.getUser(user.id), undefined);
  assert.equal(await storage.getProfile(profile.id), undefined);
  assert.equal(await storage.getPublicProfileShareByToken(share.token), undefined);
});
