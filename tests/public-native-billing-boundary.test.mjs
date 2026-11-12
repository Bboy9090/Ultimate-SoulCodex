import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { assessBillingBoundary, inspectPublicBillingBoundary, billingAuditExitCode } from "../scripts/audit-public-native-billing-boundary.mjs";

const response = (platform, enabled, qualificationMode = false, verifierConfigured = true) => ({
  httpStatus: 200,
  body: { enabled, ...(platform ? { platform, qualificationMode, verifierConfigured } : {}) },
});
const safe = () => ({
  web: response(null, false),
  android: response("android", false),
  androidQualification: response("android", false, false, false),
  ios: response("ios", false),
  iosQualification: response("ios", true, true),
});

test("live billing monitor fails closed while preserving evidence", () => {
  assert.equal(billingAuditExitCode("PRODUCTION_OFF"), 0);
  for (const state of ["INCOMPLETE", "PRODUCTION_BILLING_REVIEW_REQUIRED", "UNKNOWN", null]) {
    assert.equal(billingAuditExitCode(state), 1);
  }
  const source = readFileSync(new URL("../scripts/audit-public-native-billing-boundary.mjs", import.meta.url), "utf8");
  assert.ok(source.includes("process.exitCode = 1"));
  const workflow = readFileSync(new URL("../.github/workflows/public-native-billing-boundary.yml", import.meta.url), "utf8");
  assert.ok(workflow.includes("if: always() && github.event_name != 'pull_request'"));
});

test("normal production remains off even while sandbox iOS is qualified", () => {
  assert.deepEqual(assessBillingBoundary(safe()), {
    status: "PRODUCTION_OFF",
    productionDisabled: true,
    iosSandboxAvailable: true,
    androidSandboxAvailable: false,
  });
});

test("a valid Android test gate is distinct from activating production billing", () => {
  const values = safe();
  values.androidQualification = response("android", true, true);
  const result = assessBillingBoundary(values);
  assert.equal(result.status, "PRODUCTION_OFF");
  assert.equal(result.productionDisabled, true);
  assert.equal(result.androidSandboxAvailable, true);
});

test("web, iOS, or Android production activation always requires review", () => {
  for (const changed of [
    { web: response(null, true) },
    { android: response("android", true) },
    { ios: response("ios", true) },
    { ios: response("ios", false, true) },
  ]) {
    const result = assessBillingBoundary({ ...safe(), ...changed });
    assert.equal(result.status, "PRODUCTION_BILLING_REVIEW_REQUIRED");
    assert.equal(result.productionDisabled, false);
  }
});

test("malformed responses, wrong platform, missing booleans and failures fail closed", () => {
  for (const changed of [
    { web: { httpStatus: 200, body: null } },
    { ios: response("android", false) },
    { androidQualification: { httpStatus: 503, body: null } },
    { iosQualification: { httpStatus: 200, body: { enabled: false, platform: "ios" } } },
    { web: { httpStatus: 200, body: { enabled: "false" } } },
  ]) {
    const result = assessBillingBoundary({ ...safe(), ...changed });
    assert.equal(result.status, "INCOMPLETE");
    assert.equal(result.productionDisabled, null);
  }
});

test("inspector requests only the five read-only API surfaces with separate qualifier headers", async () => {
  const requests = [];
  const result = await inspectPublicBillingBoundary(async (url, options) => {
    requests.push({ url, options });
    const qualified = options.headers["X-SoulCodex-Billing-Qualification"] === "1";
    const endpoint = new URL(url);
    const platform = endpoint.searchParams.get("platform");
    const payload = platform === "ios"
      ? response("ios", qualified, qualified).body
      : platform === "android"
        ? response("android", false, false, false).body
        : response(null, false).body;
    return new Response(JSON.stringify(payload), { status: 200, headers: { "content-type": "application/json" } });
  });
  assert.equal(result.status, "PRODUCTION_OFF");
  assert.equal(result.storePurchaseQualified, false);
  assert.equal(result.productionActivationAuthorized, false);
  assert.equal(requests.length, 5);
  assert.equal(requests.filter((r) => r.options.headers["X-SoulCodex-Billing-Qualification"]).length, 2);
  assert.ok(requests.every((r) => r.options.redirect === "error"));
});

test("HTML fallback and network failures are incomplete rather than presumed safe", async () => {
  for (const fake of [
    async () => new Response("<html></html>", { status: 200, headers: { "content-type": "text/html" } }),
    async () => { throw new Error("offline"); },
  ]) {
    assert.equal((await inspectPublicBillingBoundary(fake)).status, "INCOMPLETE");
  }
});

test("workflow cannot activate billing, publish stores, or expose secrets", () => {
  const workflow = readFileSync(new URL("../.github/workflows/public-native-billing-boundary.yml", import.meta.url), "utf8");
  assert.match(workflow, /permissions:\n  contents: read/);
  assert.match(workflow, /if: github\.event_name != 'pull_request'/);
  assert.match(workflow, /node --test tests\/public-native-billing-boundary\.test\.mjs/);
  for (const forbidden of ["id-token: write", "railway up", "google-github-actions/auth", "ANDROID_KEYSTORE"]) {
    assert.ok(!workflow.includes(forbidden), forbidden);
  }
});
