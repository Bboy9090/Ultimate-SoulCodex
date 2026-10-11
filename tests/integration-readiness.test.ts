import test from "node:test";
import assert from "node:assert/strict";
import {
  assertEnabledIntegrationsConfigured,
  resolveIntegrationReadiness,
} from "../server/lib/integration-readiness";

test("disabled integrations are safe by default without claiming activation readiness", () => {
  const report = resolveIntegrationReadiness({ NODE_ENV: "production" });
  assert.equal(report.configurationGatePassed, true);
  assert.equal(report.claimsProductionActivationReady, false);
  assert.equal(report.providers.firebase.status, "disabled");
  assert.equal(report.providers.admob.status, "disabled");
  assert.ok(report.activationEvidenceRequired.length >= 5);
});

test("enabled Firebase fails closed when the runtime identity contract is incomplete", () => {
  const report = resolveIntegrationReadiness({
    NODE_ENV: "production",
    FIREBASE_ENABLED: "true",
    FIREBASE_PROJECT_ID: "soul-codex-platform",
  });
  assert.equal(report.configurationGatePassed, false);
  assert.equal(report.providers.firebase.status, "blocked");
  assert.deepEqual(report.providers.firebase.missingRequirements, [
    "FIREBASE_ANDROID_PACKAGE",
    "FIREBASE_IOS_BUNDLE_ID",
    "FIREBASE_WEB_APP_ORIGIN",
  ]);
});

test("enabled AdMob requires the complete cross-platform unit inventory", () => {
  const report = resolveIntegrationReadiness({
    NODE_ENV: "production",
    ADMOB_ENABLED: "true",
    ADMOB_ANDROID_APP_ID: "ca-app-pub-android",
    ADMOB_IOS_APP_ID: "ca-app-pub-ios",
  });
  assert.equal(report.providers.admob.status, "blocked");
  assert.ok(report.providers.admob.missingRequirements.includes("ADMOB_ANDROID_BANNER_UNIT_ID"));
  assert.ok(report.providers.admob.missingRequirements.includes("ADMOB_IOS_REWARDED_UNIT_ID"));
});

test("Gemini configuration requires a model and a server-side key", () => {
  const blocked = resolveIntegrationReadiness({
    NODE_ENV: "production",
    GEMINI_ENABLED: "true",
    GEMINI_API_KEY: "secret-value-not-reported",
  });
  assert.equal(blocked.providers.gemini.status, "blocked");
  assert.deepEqual(blocked.providers.gemini.missingRequirements, ["GEMINI_MODEL"]);

  const ready = resolveIntegrationReadiness({
    NODE_ENV: "production",
    GEMINI_ENABLED: "true",
    GEMINI_MODEL: "gemini-model",
    GEMINI_API_KEY: "secret-value-not-reported",
  });
  assert.equal(ready.providers.gemini.status, "ready");
  assert.equal(ready.configurationGatePassed, true);
});

test("AWS remains policy-blocked even when configured", () => {
  const report = resolveIntegrationReadiness({
    NODE_ENV: "production",
    AWS_ENABLED: "true",
    AWS_REGION: "us-east-1",
  });
  assert.equal(report.providers.aws.status, "blocked");
  assert.deepEqual(report.providers.aws.policyBlockers, [
    "AWS activation is paused by the portfolio resource-utilization policy",
  ]);
});

test("configuration gate can pass while activation evidence remains explicitly unresolved", () => {
  const report = assertEnabledIntegrationsConfigured({
    NODE_ENV: "production",
    FIREBASE_ENABLED: "true",
    FIREBASE_PROJECT_ID: "soul-codex-platform",
    FIREBASE_ANDROID_PACKAGE: "soulcodex.app",
    FIREBASE_IOS_BUNDLE_ID: "app.soulcodex.ios",
    FIREBASE_WEB_APP_ORIGIN: "https://soulcodex.up.railway.app",
    GOOGLE_ANALYTICS_ENABLED: "true",
    GOOGLE_ANALYTICS_MEASUREMENT_ID: "G-EXAMPLE",
    GEMINI_ENABLED: "true",
    GEMINI_MODEL: "gemini-model",
    AI_INTEGRATIONS_GEMINI_API_KEY: "secret-value-not-reported",
  });
  assert.equal(report.configurationGatePassed, true);
  assert.equal(report.providers.firebase.status, "ready");
  assert.equal(report.providers.googleAnalytics.status, "ready");
  assert.equal(report.providers.gemini.status, "ready");
  assert.equal(report.claimsProductionActivationReady, false);
});

test("assertion reports blocker names without exposing secret values", () => {
  assert.throws(
    () => assertEnabledIntegrationsConfigured({
      NODE_ENV: "production",
      GEMINI_ENABLED: "true",
      GEMINI_API_KEY: "super-secret-key-value",
    }),
    (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      assert.match(message, /GEMINI_MODEL/);
      assert.doesNotMatch(message, /super-secret-key-value/);
      return true;
    },
  );
});
