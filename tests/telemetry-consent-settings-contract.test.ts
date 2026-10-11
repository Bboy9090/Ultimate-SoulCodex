import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("client/src/pages/SettingsPage.tsx", "utf8");

test("Settings exposes explicit persisted telemetry consent choices", () => {
  assert.match(source, /persistTelemetryConsent/);
  assert.match(source, /readPersistedTelemetryConsent/);
  assert.match(source, /data-testid="telemetry-consent-granted"/);
  assert.match(source, /data-testid="telemetry-consent-denied"/);
  assert.match(source, /This preference does not turn Analytics or AdMob on by itself/);
});

test("Settings explains premium ad suppression and fail-closed unset state", () => {
  assert.match(source, /Premium still suppresses ads/);
  assert.match(source, /returns the policy to fail-closed/);
  assert.match(source, />unset</);
});
