import assert from "node:assert/strict";
import test from "node:test";
import { MemStorage } from "../storage";

test("deleteSessionData removes anonymous profile, contacts, logs, push data, and redemption", async () => {
  const storage = new MemStorage();
  const sessionId = "session-delete-test";
  const profile = await storage.createProfile({
    name: "Delete Me",
    birthDate: "1990-01-01",
    sessionId,
  } as any);
  await storage.createPerson({ sessionId, fullName: "Contact" } as any);
  await storage.createFrequencyLog({ sessionId, frequency: 7 } as any);
  await storage.createPushSubscription({
    sessionId,
    endpoint: "https://push.example.test/delete",
    keys: { p256dh: "key", auth: "auth" },
  } as any);
  const code = await storage.createAccessCode({ code: "DELETE-SESSION", maxUses: 1 } as any);
  await storage.createAccessCodeRedemptionWithIncrement({ accessCodeId: code.id, sessionId });

  await storage.deleteSessionData(sessionId);

  assert.equal(await storage.getProfile(profile.id), undefined);
  assert.deepEqual(await storage.getPersonsBySessionId(sessionId), []);
  assert.deepEqual(await storage.getFrequencyLogsBySession(sessionId), []);
  assert.deepEqual(await storage.getPushSubscriptionsBySession(sessionId), []);
  assert.deepEqual(await storage.getAccessCodeRedemptions({ sessionId }), []);
});

test("deleteUserAccount removes the account and its profile-derived data", async () => {
  const storage = new MemStorage();
  const userId = "user-delete-test";
  await storage.upsertUser({ id: userId, email: "delete@example.test" });
  const profile = await storage.createProfile({
    name: "Delete Account",
    birthDate: "1990-01-01",
    userId,
  } as any);
  await storage.createAssessment({ profileId: profile.id, assessmentType: "test" } as any);
  const code = await storage.createAccessCode({ code: "DELETE-USER", maxUses: 1 } as any);
  await storage.createAccessCodeRedemptionWithIncrement({ accessCodeId: code.id, userId });

  await storage.deleteUserAccount(userId);

  assert.equal(await storage.getUser(userId), undefined);
  assert.equal(await storage.getProfile(profile.id), undefined);
  assert.equal(await storage.getAssessment(profile.id, "test"), undefined);
  assert.deepEqual(await storage.getAccessCodeRedemptions({ userId }), []);
});
