import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const iosWorkflowPath = ".github/workflows/build-ios.yml";
const androidWorkflowPath = ".github/workflows/build-android.yml";
const gate5WorkflowPath = ".github/workflows/gate5-release-preflight.yml";
const validatorPath = "scripts/validate-mobile-release.mjs";
const iosProjectPath = "ios/App/App.xcodeproj/project.pbxproj";
const iosInfoPlistPath = "ios/App/App/Info.plist";
const iosExportOptionsPath = "ios/App/ExportOptions.plist";
const androidBuildGradlePath = "android/app/build.gradle";
const v4ManifestPath = "client/src/lib/v4ReleaseManifest.ts";

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
  assert.match(workflow, /xcodebuild -workspace App\.xcodeproj\/project\.xcworkspace[\s\S]*archive[\s\S]*tee archive\.log/);
  assert.match(workflow, /xcodebuild -exportArchive[\s\S]*tee export\.log/);
});

test("iOS App Store workflow requires a real non-empty IPA and records its digest", async () => {
  const workflow = await text(iosWorkflowPath);
  assert.match(workflow, /IPA_PATH=\$\(find build\/export -maxdepth 1 -name "\*\.ipa" -type f -print -quit\)/);
  assert.match(workflow, /test -n "\$IPA_PATH"/);
  assert.match(workflow, /test -s "\$IPA_PATH"/);
  assert.match(workflow, /shasum -a 256 "\$IPA_PATH"/);
  assert.match(workflow, /RELEASE-CANDIDATE-SHA\.txt/);
  assert.match(workflow, /if-no-files-found:\s*error/);
});

test("iOS provisioning preflight binds the Apple Team ID and current distribution certificate to the release bundle ID", async () => {
  const workflow = await text(iosWorkflowPath);
  const project = await text(iosProjectPath);
  assert.match(project, /DEVELOPMENT_TEAM = 86NUJ8M3B8;/);
  assert.match(project, /PRODUCT_BUNDLE_IDENTIFIER = app\.soulcodex\.ios;/);
  assert.match(workflow, /test "\$PROFILE_TEAM" = "86NUJ8M3B8"/);
  assert.match(workflow, /test "\$APP_IDENTIFIER" = "86NUJ8M3B8\.app\.soulcodex\.ios"/);
  assert.match(workflow, /leaf not in profile\.get\("DeveloperCertificates", \[\]\)/);
  assert.match(workflow, /openssl pkcs12 -legacy/);
});

test("iOS export remains App Store scoped with the canonical team", async () => {
  const workflow = await text(iosWorkflowPath);
  const validator = await text(validatorPath);
  const exportOptions = await text(iosExportOptionsPath);
  assert.match(workflow, /-exportOptionsPlist build\/ExportOptions\.ci\.plist/);
  assert.match(workflow, /<key>method<\/key><string>app-store<\/string>/);
  assert.match(workflow, /<key>teamID<\/key><string>86NUJ8M3B8<\/string>/);
  assert.match(validator, /ios\/App\/ExportOptions\.plist/);
  assert.match(exportOptions, /<key>teamID<\/key>\s*<string>86NUJ8M3B8<\/string>/);
  assert.match(exportOptions, /<key>method<\/key>\s*<string>(app-store|app-store-connect)<\/string>/);
});

test("Gate 5 preflight runs when Capacitor package identity configuration changes", async () => {
  const workflow = await text(gate5WorkflowPath);
  assert.match(workflow, /- "capacitor\.config\.ts"/);
});

test("Android Play workflow requires signing material, signature verification, and a real AAB", async () => {
  const workflow = await text(androidWorkflowPath);
  assert.match(workflow, /ANDROID_KEYSTORE/);
  assert.match(workflow, /ANDROID_KEYSTORE_PASSWORD/);
  assert.match(workflow, /ANDROID_KEY_ALIAS/);
  assert.match(workflow, /ANDROID_KEY_PASSWORD/);
  assert.match(workflow, /keytool -list/);
  assert.match(workflow, /\.\/gradlew bundleRelease/);
  assert.match(workflow, /test -s "\$AAB"/);
  assert.match(workflow, /jarsigner -verify/);
  assert.match(workflow, /AAB-SHA256\.txt/);
  assert.match(workflow, /RELEASE-CANDIDATE-SHA\.txt/);
});

test("native release validation requires inspectable client release identity", async () => {
  const validator = await text(validatorPath);
  for (const key of ["VITE_RELEASE_VERSION", "VITE_RELEASE_SHA", "VITE_API_CONTRACT"]) {
    assert.match(validator, new RegExp(key));
  }
  assert.match(validator, /VITE_RELEASE_SHA cannot be unknown/);
  assert.match(validator, /40-character Git commit SHA/);
  assert.match(validator, /foundation-v4/);
});

test("native distributable identity matches the canonical V4 release candidate", async () => {
  const manifest = await text(v4ManifestPath);
  const iosInfo = await text(iosInfoPlistPath);
  const androidGradle = await text(androidBuildGradlePath);
  assert.match(manifest, /releaseVersion:\s*"4\.0\.0-rc\.3"/);
  assert.match(manifest, /apiContract:\s*"foundation-v4"/);
  assert.match(iosInfo, /<key>CFBundleShortVersionString<\/key>\s*<string>4\.0\.0<\/string>/);
  assert.match(iosInfo, /<key>CFBundleVersion<\/key>\s*<string>4000003<\/string>/);
  assert.match(androidGradle, /versionCode\s+4000003/);
  assert.match(androidGradle, /versionName\s+"4\.0\.0-rc\.3"/);
});
