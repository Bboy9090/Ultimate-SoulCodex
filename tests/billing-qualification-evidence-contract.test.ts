import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("all providers qualify only when every required checkpoint passes", () => {
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

test("NOT APPLICABLE cannot waive any required provider checkpoint", () => {
  for (const provider of ["ios", "android", "web"] as const) {
    for (const checkpoint of PROVIDER_CHECKPOINTS[provider]) {
      const evidence = allPassProvider(provider);
      evidence[checkpoint] = { result: "NOT APPLICABLE", evidenceRef: "", serverVerification: "" };
      const report = validateBillingQualificationEvidence({
        releaseSha: SHA,
        appVersionBuild: "4.1.0 / 4000011",
        providers: { [provider]: evidence },
      });
      assert.equal(providerQualificationDecision(report, provider).qualified, false, `${provider}.${checkpoint}`);
      assert.equal(report.providers[provider].decision, "INCONCLUSIVE");
      assert.equal(report.overallQualified, false);
    }
  }
});

test("marking the entire qualification matrix NOT APPLICABLE cannot produce PASS", () => {
  const providers = Object.fromEntries(Object.entries(PROVIDER_CHECKPOINTS).map(([provider, checkpoints]) => [
    provider, Object.fromEntries(checkpoints.map((checkpoint) => [checkpoint, { result: "NOT APPLICABLE" }])),
  ]));
  const report = validateBillingQualificationEvidence({ releaseSha: SHA, appVersionBuild: "4.1.0 / 4000011", providers });
  assert.equal(report.overallQualified, false);
  for (const provider of Object.keys(PROVIDER_CHECKPOINTS)) {
    assert.equal(providerQualificationDecision(report, provider).decision, "INCONCLUSIVE");
  }
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


test("committed evidence template cannot carry a stale qualification SHA", () => {
  const template = JSON.parse(
    readFileSync(
      "governance/release-audits/V4_1_BILLING_QUALIFICATION_EVIDENCE.template.json",
      "utf8",
    ),
  );
  assert.equal(template.releaseSha, "REPLACE_WITH_EXACT_40_CHAR_QUALIFICATION_SHA");
});

test("iOS evidence template distinguishes Apple submission build from source project build setting", () => {
  const template = JSON.parse(
    readFileSync(
      "governance/release-audits/V4_1_BILLING_QUALIFICATION_EVIDENCE.template.json",
      "utf8",
    ),
  );
  assert.equal(template.appVersionBuild, "4.1.0 / Apple Xcode Cloud build 324");
  assert.equal(template.sourceProjectBuildSetting, "4000011");
  for (const checkpoint of ["catalog", "monthly_purchase", "annual_purchase"]) {
    assert.equal(template.providers.ios[checkpoint].appBuild, "4.1.0 / Apple Xcode Cloud build 324");
    assert.equal(template.providers.ios[checkpoint].sourceProjectBuildSetting, "4000011");
  }
});
