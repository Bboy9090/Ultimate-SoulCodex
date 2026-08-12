import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const iosWorkflowPath = ".github/workflows/build-ios.yml";
const androidWorkflowPath = ".github/workflows/build-android.yml";
const iosProjectPath = "ios/App/App.xcodeproj/project.pbxproj";

async function text(path: string): Promise<string> {
  return readFile(path, "utf8");
}

test("iOS release workflow uses the supported Capacitor 8 native toolchain", async () => {
  const workflow = await text(iosWorkflowPath);

  assert.match(workflow, /runs-on:\s*macos-26/);
  assert.match(workflow, /node-version:\s*22/);
  assert.match(workflow, /XCODE_MAJOR/);
  assert.match(workflow, /test "\$XCODE_MAJOR" -ge 26/);
});

test("iOS App Store workflow cannot mask archive or export failures", async () => {
  const workflow = await text(iosWorkflowPath);

  assert.match(workflow, /set -euo pipefail/);
  assert.match(workflow, /xcodebuild -workspace App\.xcodeproj\/project\.xcworkspace[\s\S]*archive 2>&1 \| tee archive\.log/);
  assert.match(workflow, /xcodebuild -exportArchive[\s\S]*2>&1 \| tee export\.log/);
});

test("iOS App Store workflow requires a real non-empty IPA and records its digest", async () => {
  const workflow = await text(iosWorkflowPath);

  assert.match(workflow, /IPA_PATH=\$\(find build\/export -maxdepth 1 -name "\*\.ipa" -type f -print -quit\)/);
  assert.match(workflow, /test -n "\$IPA_PATH"/);
  assert.match(workflow, /test -s "\$IPA_PATH"/);
  assert.match(workflow, /shasum -a 256 "\$IPA_PATH"/);
  assert.match(workflow, /if-no-files-found:\s*error/);
});

test("iOS provisioning preflight binds the Apple Team ID to the release bundle ID", async () => {
  const workflow = await text(iosWorkflowPath);
  const project = await text(iosProjectPath);

  assert.match(project, /DEVELOPMENT_TEAM = 86NUJ8M3B8;/);
  assert.match(project, /PRODUCT_BUNDLE_IDENTIFIER = app\.soulcodex\.ios;/);
  assert.match(workflow, /test "\$PROFILE_TEAM" = "86NUJ8M3B8"/);
  assert.match(workflow, /test "\$APP_IDENTIFIER" = "86NUJ8M3B8\.app\.soulcodex\.ios"/);
});

test("Android Play workflow requires signing material and a real AAB", async () => {
  const workflow = await text(androidWorkflowPath);

  assert.match(workflow, /ANDROID_KEYSTORE/);
  assert.match(workflow, /ANDROID_KEYSTORE_PASSWORD/);
  assert.match(workflow, /ANDROID_KEY_ALIAS/);
  assert.match(workflow, /ANDROID_KEY_PASSWORD/);
  assert.match(workflow, /\.\/gradlew bundleRelease/);
  assert.match(workflow, /test -f app\/build\/outputs\/bundle\/release\/app-release\.aab|if \[ ! -f "app\/build\/outputs\/bundle\/release\/app-release\.aab" \]/);
});
