import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const files = {
  packageJson: readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  android: readFileSync(new URL("../android/app/build.gradle", import.meta.url), "utf8"),
  iosInfo: readFileSync(new URL("../ios/App/App/Info.plist", import.meta.url), "utf8"),
  iosProject: readFileSync(new URL("../ios/App/App.xcodeproj/project.pbxproj", import.meta.url), "utf8"),
  validator: readFileSync(new URL("../scripts/validate-mobile-release.mjs", import.meta.url), "utf8"),
  storeWorkflow: readFileSync(new URL("../.github/workflows/store-4.0.0-release.yml", import.meta.url), "utf8"),
  metadata: readFileSync(new URL("../app_store_metadata.md", import.meta.url), "utf8"),
};

test("active release surfaces use one 4.1.0 / 4000010 identity", () => {
  assert.match(files.packageJson, /"version": "4\.1\.0"/);
  assert.match(files.android, /versionCode\s+4000010/);
  assert.match(files.android, /versionName\s+"4\.1\.0"/);
  assert.match(files.iosInfo, /<string>4\.1\.0<\/string>/);
  assert.match(files.iosInfo, /<string>4000010<\/string>/);
  assert.match(files.iosProject, /MARKETING_VERSION = 4\.1\.0;/);
  assert.match(files.iosProject, /CURRENT_PROJECT_VERSION = 4000010;/);
  assert.match(files.validator, /releaseVersion !== "4\.1\.0"/);
  assert.match(files.storeWorkflow, /Android versionName=4\.1\.0/);
  assert.match(files.storeWorkflow, /Android versionCode=4000010/);
  assert.match(files.storeWorkflow, /iOS marketingVersion=4\.1\.0/);
  assert.match(files.storeWorkflow, /iOS build=4000010/);
  assert.match(files.metadata, /Android: `4\.1\.0` \/ versionCode `4000010`/);
  assert.match(files.metadata, /iOS: `4\.1\.0` \/ build `4000010`/);
});

test("4.1 RC does not turn on purchase surfaces by source default", () => {
  const envExample = readFileSync(new URL("../.env.example", import.meta.url), "utf8");
  const billing = readFileSync(new URL("../server/billing.ts", import.meta.url), "utf8");
  assert.doesNotMatch(envExample, /^SOUL_CODEX_PLUS_WEB_CHECKOUT_ENABLED=true$/m);
  assert.doesNotMatch(envExample, /^SOUL_CODEX_PLUS_IOS_BILLING_ENABLED=true$/m);
  assert.doesNotMatch(envExample, /^SOUL_CODEX_PLUS_ANDROID_BILLING_ENABLED=true$/m);
  assert.doesNotMatch(envExample, /^SOUL_CODEX_PLUS_NATIVE_BILLING_ENABLED=true$/m);
  assert.match(billing, /SOUL_CODEX_PLUS_WEB_CHECKOUT_ENABLED\?\.trim\(\)\.toLowerCase\(\) === "true"/);
  assert.match(billing, /SOUL_CODEX_PLUS_IOS_BILLING_ENABLED/);
  assert.match(billing, /SOUL_CODEX_PLUS_ANDROID_BILLING_ENABLED/);
  assert.match(billing, /SOUL_CODEX_PLUS_NATIVE_BILLING_ENABLED\?\.trim\(\)\.toLowerCase\(\) === "true"/);
});
