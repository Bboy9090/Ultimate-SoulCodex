import assert from "node:assert/strict";
import test from "node:test";
import { profileBelongsToActor } from "../server/lib/profile-ownership.ts";

test("user-owned profiles are readable only by the matching authenticated user", () => {
  const profile = { userId: "user-a", sessionId: null };
  assert.equal(profileBelongsToActor(profile, { userId: "user-a", sessionId: "session-x" }), true);
  assert.equal(profileBelongsToActor(profile, { userId: "user-b", sessionId: "session-x" }), false);
  assert.equal(profileBelongsToActor(profile, { userId: null, sessionId: "session-x" }), false);
});

test("anonymous server-backed profiles are readable only by the creating session", () => {
  const profile = { userId: null, sessionId: "session-a" };
  assert.equal(profileBelongsToActor(profile, { userId: null, sessionId: "session-a" }), true);
  assert.equal(profileBelongsToActor(profile, { userId: null, sessionId: "session-b" }), false);
  assert.equal(profileBelongsToActor(profile, { userId: "user-a", sessionId: "session-b" }), false);
});

test("ownerless records fail closed instead of becoming public by ID", () => {
  assert.equal(profileBelongsToActor({ userId: null, sessionId: null }, { userId: "user-a", sessionId: "session-a" }), false);
  assert.equal(profileBelongsToActor(null, { userId: "user-a", sessionId: "session-a" }), false);
});
