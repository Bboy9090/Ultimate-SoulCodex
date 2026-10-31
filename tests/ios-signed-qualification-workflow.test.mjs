import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolveBuild } from "../scripts/resolve-ios-qualification-build.mjs";

test("normal releases keep source build and both qualification markers off", () => {
  assert.deepEqual(resolveBuild({ GITHUB_EVENT_NAME: "push", GITHUB_REF_NAME: "release/4.1.0-rc1" }), {
    IOS_BUILD_NUMBER: "4000014", VITE_BILLING_QUALIFICATION_MODE: "false", SOUL_CODEX_IOS_QUALIFICATION_BUILD: "false",
  });
});
test("reserved branch and explicit dispatch enable both markers with reserved build", () => {
  for (const env of [
    { GITHUB_EVENT_NAME: "push", GITHUB_REF_NAME: "qualification/ios-billing-4000016" },
    { GITHUB_EVENT_NAME: "workflow_dispatch", QUALIFICATION_REQUEST: "true", QUALIFICATION_BUILD_NUMBER: "4000016" },
  ]) {
    const result = resolveBuild(env);
    assert.equal(result.IOS_BUILD_NUMBER, "4000016");
    assert.equal(result.VITE_BILLING_QUALIFICATION_MODE, "true");
    assert.equal(result.SOUL_CODEX_IOS_QUALIFICATION_BUILD, "true");
  }
});
test("missing, stale, injected, oversized, and accidental numbers fail closed", () => {
  for (const number of ["", "4000014", "4000016\nINJECT=true", "9999999999", "-4000016"]) {
    assert.throws(() => resolveBuild({ GITHUB_EVENT_NAME: "workflow_dispatch", QUALIFICATION_REQUEST: "true", QUALIFICATION_BUILD_NUMBER: number }));
  }
  assert.throws(() => resolveBuild({ QUALIFICATION_BUILD_NUMBER: "4000016" }));
  assert.throws(() => resolveBuild({ GITHUB_EVENT_NAME: "push", QUALIFICATION_REQUEST: "true", QUALIFICATION_BUILD_NUMBER: "4000016" }));
});
test("signed lane resolves before bootstrap, checks exported identity, and never uploads to stores", () => {
  const workflow = readFileSync(".github/workflows/ios-4.0.2-native-load-hotfix.yml", "utf8");
  const signed = workflow.slice(workflow.indexOf("  signed-app-store-ipa:"));
  assert.ok(signed.indexOf("Resolve bounded billing qualification build") < signed.indexOf("Bootstrap exact native tree"));
  assert.match(signed, /CURRENT_PROJECT_VERSION="\$IOS_BUILD_NUMBER"/);
  assert.match(signed, /CFBundleVersion.*\$IOS_BUILD_NUMBER/);
  assert.match(signed, /provider_transactions=not_tested/);
  assert.match(signed, /artifact_only_owner_QA_handoff/);
  assert.doesNotMatch(signed, /altool|iTMSTransporter|pilot upload|app-store-connect.*upload/);
});

test("simulator and signed marker evidence directories exist before redirection", () => {
  const workflow = readFileSync(".github/workflows/ios-4.0.2-native-load-hotfix.yml", "utf8");
  const markers = [...workflow.matchAll(/if \[ "\$VITE_BILLING_QUALIFICATION_MODE" = true \]; then\n            mkdir -p build\/export\n            grep -rl/g)];
  assert.equal(markers.length, 2);
});
