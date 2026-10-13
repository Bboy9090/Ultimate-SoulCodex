import assert from "node:assert/strict";
import test from "node:test";
import {
  PROVIDER_CHECKPOINTS,
  validateBillingQualificationEvidence,
  providerQualificationDecision,
} from "../scripts/validate-billing-qualification-evidence.mjs";

const SHA = "a".repeat(40);

function allPassProvider(provider: keyof typeof PROVIDER_CHECKPOINTS) {
  return Object.fromEntries(
    PROVIDER_CHECKPOINTS[provider].map((checkpoint) => [
      checkpoint,
      {
        result: "PASS",
        evidenceRef: `redacted:${provider}:${checkpoint}:abcd1234`,
        serverVerification: checkpoint.includes("purchase") ? "verified" : "",
      },
    ]),
  );
}

test("missing provider checkpoints remain inconclusive and cannot qualify", () => {
  const report = validateBillingQualificationEvidence({
    releaseSha: SHA,
    appVersionBuild: "4.1.0 / 4000011",
    providers: { ios: {}, android: {}, web: {} },
  });

  assert.equal(report.overallQualified, false);
  assert.equal(report.providers.ios.decision, "INCONCLUSIVE");
  assert.equal(report.providers.android.decision, "INCONCLUSIVE");
  assert.equal(report.providers.web.decision, "INCONCLUSIVE");
});

test("provider qualification requires evidence on every PASS checkpoint", () => {
  assert.throws(
    () =>
      validateBillingQualificationEvidence({
        releaseSha: SHA,
        appVersionBuild: "4.1.0 / 4000011",
        providers: {
          ios: { catalog: { result: "PASS" } },
          android: {},
          web: {},
        },
      }),
    /PASS requires a redacted evidenceRef/,
  );
});

test("purchase PASS requires server verification evidence", () => {
  assert.throws(
    () =>
      validateBillingQualificationEvidence({
        releaseSha: SHA,
        appVersionBuild: "4.1.0 / 4000011",
        providers: {
          ios: {
            monthly_purchase: {
              result: "PASS",
              evidenceRef: "redacted:ios:monthly:abc123",
            },
          },
          android: {},
          web: {},
        },
      }),
    /requires serverVerification/,
  );
});

test("secret-like fields are rejected", () => {
  assert.throws(
    () =>
      validateBillingQualificationEvidence({
        releaseSha: SHA,
        appVersionBuild: "4.1.0 / 4000011",
        providers: { ios: {}, android: {}, web: {} },
        serviceAccountJson: "{}",
      }),
    /Forbidden evidence key/,
  );
});

test("all providers qualify only when every checkpoint is pass or not applicable", () => {
  const report = validateBillingQualificationEvidence({
    releaseSha: SHA,
    appVersionBuild: "4.1.0 / 4000011",
    providers: {
      ios: allPassProvider("ios"),
      android: allPassProvider("android"),
      web: allPassProvider("web"),
    },
  });

  assert.equal(report.providers.ios.decision, "PASS");
  assert.equal(report.providers.android.decision, "PASS");
  assert.equal(report.providers.web.decision, "PASS");
  assert.equal(report.overallQualified, true);
});

test("one provider can qualify independently while others remain inconclusive", () => {
  const report = validateBillingQualificationEvidence({
    releaseSha: SHA,
    appVersionBuild: "4.1.0 / 4000011",
    providers: {
      ios: allPassProvider("ios"),
      android: {},
      web: {},
    },
  });

  assert.equal(providerQualificationDecision(report, "ios").qualified, true);
  assert.equal(providerQualificationDecision(report, "ios").decision, "PASS");
  assert.equal(providerQualificationDecision(report, "android").qualified, false);
  assert.equal(report.overallQualified, false);
});

test("provider-specific decision rejects unknown provider names", () => {
  const report = validateBillingQualificationEvidence({
    releaseSha: SHA,
    appVersionBuild: "4.1.0 / 4000011",
    providers: { ios: {}, android: {}, web: {} },
  });
  assert.throws(() => providerQualificationDecision(report, "stripe"), /provider must be ios, android, or web/);
});
