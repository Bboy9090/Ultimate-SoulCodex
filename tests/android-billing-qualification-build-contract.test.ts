import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(".github/workflows/android-billing-qualification-parity.yml", "utf8");

test("Android qualification artifact is a dedicated Play test build, not a production release", () => {
  assert.match(workflow, /VITE_BILLING_QUALIFICATION_MODE: "true"/);
  assert.match(workflow, /QUALIFICATION_VERSION_CODE: "4000017"/);
  assert.match(workflow, /versionCode 4000017/);
  assert.match(workflow, /production_billing_enabled=false/);
  assert.match(workflow, /production_publish_attempted=false/);
  assert.match(workflow, /play_upload_attempted=false/);
  assert.match(workflow, /actions\/upload-artifact@v6/);
  assert.doesNotMatch(workflow, /upload-google-play|tracks\/production|edits\.commit/);
});

test("qualification artifact is built from the exact reviewed SHA and signed with the app upload key", () => {
  assert.match(workflow, /CANDIDATE_SHA: \$\{\{ github\.event\.pull_request\.head\.sha \|\| github\.sha \}\}/);
  assert.match(workflow, /test "\$\(git rev-parse HEAD\)" = "\$CANDIDATE_SHA"/);
  assert.match(workflow, /ANDROID_KEYSTORE/);
  assert.match(workflow, /jarsigner -verify/);
  assert.match(workflow, /keytool -printcert/);
  assert.match(workflow, /Remove temporary upload keystore/);
});
