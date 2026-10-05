import test from "node:test";
import assert from "node:assert/strict";
import { resolveFirebaseWebConfig } from "../server/lib/firebase-web-config";

test("Firebase web configuration fails closed when deployment values are missing", () => {
  const result = resolveFirebaseWebConfig({
    VITE_FIREBASE_PROJECT_ID: "soul-codex-platform",
  });

  assert.equal(result.configured, false);
  assert.equal(result.config, null);
});

test("Firebase web configuration resolves browser-safe deployment values", () => {
  const result = resolveFirebaseWebConfig({
    VITE_FIREBASE_API_KEY: "browser-key",
    VITE_FIREBASE_AUTH_DOMAIN: "soul-codex-platform.firebaseapp.com",
    VITE_FIREBASE_PROJECT_ID: "soul-codex-platform",
    VITE_FIREBASE_STORAGE_BUCKET: "soul-codex-platform.firebasestorage.app",
    VITE_FIREBASE_MESSAGING_SENDER_ID: "1234567890",
    VITE_FIREBASE_APP_ID: "1:1234567890:web:abc123",
    VITE_FIREBASE_MEASUREMENT_ID: "G-EXAMPLE",
  });

  assert.equal(result.configured, true);
  assert.equal(result.config?.projectId, "soul-codex-platform");
  assert.equal(result.config?.measurementId, "G-EXAMPLE");
});
