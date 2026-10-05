import test from "node:test";
import assert from "node:assert/strict";
import { resolveIntegrationConfig } from "../../server/lib/integration-config";

test("integrations remain disabled by default", () => {
  const config = resolveIntegrationConfig({ NODE_ENV: "production" });
  assert.equal(config.firebase.mode, "disabled");
  assert.equal(config.admob.mode, "disabled");
  assert.equal(config.googleAnalytics.mode, "disabled");
  assert.equal(config.aws.mode, "disabled");
  assert.equal(config.gemini.mode, "disabled");
  assert.equal(config.tensorFlow.mode, "disabled");
});

test("configured integrations stay in test mode unless explicitly in production", () => {
  const config = resolveIntegrationConfig({
    NODE_ENV: "development",
    FIREBASE_ENABLED: "true",
    FIREBASE_PROJECT_ID: "soulcodex-test",
    ADMOB_ENABLED: "true",
    ADMOB_ANDROID_APP_ID: "ca-app-pub-test",
    GEMINI_ENABLED: "true",
    GEMINI_API_KEY: "test-key",
  });
  assert.equal(config.firebase.mode, "test");
  assert.equal(config.admob.mode, "test");
  assert.equal(config.gemini.mode, "test");
});

test("production mode requires both enablement and configuration", () => {
  const config = resolveIntegrationConfig({
    NODE_ENV: "production",
    FIREBASE_ENABLED: "true",
    FIREBASE_PROJECT_ID: "soulcodex-prod",
    ADMOB_ENABLED: "true",
    ADMOB_ANDROID_APP_ID: "ca-app-pub-prod",
  });
  assert.equal(config.firebase.mode, "production");
  assert.equal(config.admob.mode, "production");
  assert.equal(config.googleAnalytics.mode, "disabled");
});
