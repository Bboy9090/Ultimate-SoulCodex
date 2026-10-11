import test from "node:test";
import assert from "node:assert/strict";
import {
  TELEMETRY_CONSENT_STORAGE_KEY,
  clearTelemetryConsent,
  persistTelemetryConsent,
  readPersistedTelemetryConsent,
  resolvePersistedTelemetryPolicy,
  resolveTelemetryPolicy,
} from "../client/src/lib/telemetryConsent";

function memoryStorage(initial?: Record<string, string>) {
  const data = new Map(Object.entries(initial ?? {}));
  return {
    getItem(key: string) {
      return data.has(key) ? data.get(key)! : null;
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
    removeItem(key: string) {
      data.delete(key);
    },
  };
}

test("missing or malformed persisted consent fails closed to unset", () => {
  const empty = memoryStorage();
  assert.equal(readPersistedTelemetryConsent(empty), "unset");

  const malformed = memoryStorage({
    [TELEMETRY_CONSENT_STORAGE_KEY]: "{not-json",
  });
  assert.equal(readPersistedTelemetryConsent(malformed), "unset");

  const unknownState = memoryStorage({
    [TELEMETRY_CONSENT_STORAGE_KEY]: JSON.stringify({ state: "maybe" }),
  });
  assert.equal(readPersistedTelemetryConsent(unknownState), "unset");
});

test("consent must be explicitly persisted as granted or denied", () => {
  const storage = memoryStorage();

  persistTelemetryConsent(storage, "granted");
  assert.equal(readPersistedTelemetryConsent(storage), "granted");

  persistTelemetryConsent(storage, "denied");
  assert.equal(readPersistedTelemetryConsent(storage), "denied");

  clearTelemetryConsent(storage);
  assert.equal(readPersistedTelemetryConsent(storage), "unset");
});

test("analytics stays blocked until persisted consent is granted", () => {
  assert.equal(
    resolveTelemetryPolicy("unset", {
      analyticsEnabled: true,
      admobEnabled: false,
      premiumEntitled: false,
    }).analyticsAllowed,
    false,
  );

  assert.equal(
    resolveTelemetryPolicy("denied", {
      analyticsEnabled: true,
      admobEnabled: false,
      premiumEntitled: false,
    }).analyticsAllowed,
    false,
  );

  assert.equal(
    resolveTelemetryPolicy("granted", {
      analyticsEnabled: true,
      admobEnabled: false,
      premiumEntitled: false,
    }).analyticsAllowed,
    true,
  );
});

test("caller intent cannot override the persisted consent state", () => {
  const storage = memoryStorage();

  const snapshot = resolvePersistedTelemetryPolicy(storage, {
    analyticsEnabled: true,
    admobEnabled: true,
    premiumEntitled: false,
  });

  assert.equal(snapshot.consent, "unset");
  assert.equal(snapshot.analyticsAllowed, false);
  assert.equal(snapshot.adsAllowed, false);
});

test("premium entitlement suppresses ads even after consent is granted", () => {
  const premium = resolveTelemetryPolicy("granted", {
    analyticsEnabled: true,
    admobEnabled: true,
    premiumEntitled: true,
  });

  assert.equal(premium.analyticsAllowed, true);
  assert.equal(premium.adsAllowed, false);
  assert.ok(premium.blockers.includes("ads suppressed by premium entitlement"));
});

test("free tier ads require both enabled AdMob and granted consent", () => {
  const allowed = resolveTelemetryPolicy("granted", {
    analyticsEnabled: false,
    admobEnabled: true,
    premiumEntitled: false,
  });
  assert.equal(allowed.adsAllowed, true);

  const disabledProvider = resolveTelemetryPolicy("granted", {
    analyticsEnabled: false,
    admobEnabled: false,
    premiumEntitled: false,
  });
  assert.equal(disabledProvider.adsAllowed, false);
});

test("denial is preserved as an explicit state instead of being treated as unset", () => {
  const storage = memoryStorage();
  persistTelemetryConsent(storage, "denied");

  const snapshot = resolvePersistedTelemetryPolicy(storage, {
    analyticsEnabled: true,
    admobEnabled: true,
    premiumEntitled: false,
  });

  assert.equal(snapshot.consent, "denied");
  assert.equal(snapshot.analyticsAllowed, false);
  assert.equal(snapshot.adsAllowed, false);
  assert.ok(snapshot.blockers.includes("telemetry consent denied"));
});
