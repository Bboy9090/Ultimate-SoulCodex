import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const storeWorkflowPath = ".github/workflows/store-4.0.0-release.yml";
const xcodeParityWorkflowPath = ".github/workflows/xcode-cloud-bootstrap-parity.yml";
const validatorPath = "scripts/validate-mobile-release.mjs";
const iosProjectPath = "ios/App/App.xcodeproj/project.pbxproj";
const iosInfoPlistPath = "ios/App/App/Info.plist";
const iosExportOptionsPath = "ios/App/ExportOptions.plist";
const androidBuildGradlePath = "android/app/build.gradle";
const v4ManifestPath = "client/src/lib/v4ReleaseManifest.ts";

async function text(path: string): Promise<string> {
  return readFile(path, "utf8");
}

function capture(source: string, pattern: RegExp, label: string): string {
  const match = source.match(pattern);
  assert.ok(match?.[1], `${label} must be present`);
  return match[1];
}

test("iOS parity workflow exercises the supported native bootstrap and archive path", async () => {
  const workflow = await text(xcodeParityWorkflowPath);
  assert.match(workflow, /runs-on:\s*macos-15/);
  assert.match(workflow, /node-version:\s*22/);
  assert.match(workflow, /sh ios\/App\/ci_scripts\/ci_post_clone\.sh/);
  assert.match(workflow, /npm run mobile:validate:ios/);
  assert.match(workflow, /xcodebuild[\s\S]*-archivePath[\s\S]*CODE_SIGNING_ALLOWED=NO[\s\S]*archive/);
});

test("iOS parity workflow cannot mask bootstrap, validation, or archive failures", async () => {
  const workflow = await text(xcodeParityWorkflowPath);
  assert.doesNotMatch(workflow, /continue-on-error:\s*true/);
  assert.doesNotMatch(workflow, /\|\| true/);
  assert.match(workflow, /Create unsigned device archive after bootstrap/);
});

test("iOS parity records the exact candidate SHA as a retained artifact", async () => {
  const workflow = await text(xcodeParityWorkflowPath);
  assert.match(workflow, /VITE_RELEASE_SHA:\s*\$\{\{ github\.sha \}\}/);
  assert.match(workflow, /SHA=\$\{GITHUB_SHA\}/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.match(workflow, /retention-days:\s*90/);
});

test("iOS project binds automatic signing to the canonical Apple team and bundle", async () => {
  const project = await text(iosProjectPath);
  assert.match(project, /CODE_SIGN_STYLE = Automatic;/);
  assert.match(project, /DEVELOPMENT_TEAM = 86NUJ8M3B8;/);
  assert.match(project, /PRODUCT_BUNDLE_IDENTIFIER = app\.soulcodex\.ios;/);
});

test("iOS export remains App Store scoped with the canonical team", async () => {
  const validator = await text(validatorPath);
  const exportOptions = await text(iosExportOptionsPath);
  assert.match(validator, /ios\/App\/ExportOptions\.plist/);
  assert.match(exportOptions, /<key>teamID<\/key>\s*<string>86NUJ8M3B8<\/string>/);
  assert.match(exportOptions, /<key>method<\/key>\s*<string>(app-store|app-store-connect)<\/string>/);
});

test("store workflow constructs and validates both Capacitor native payloads", async () => {
  const workflow = await text(storeWorkflowPath);
  assert.match(workflow, /npm run build:capacitor/);
  assert.match(workflow, /npm run mobile:validate:android/);
  assert.match(workflow, /npm run mobile:validate:ios/);
  assert.match(workflow, /VITE_RELEASE_SHA:\s*\$\{\{ github\.sha \}\}/);
});

test("Google Play production publishing is signed, inspectable, and main-only", async () => {
  const workflow = await text(storeWorkflowPath);
  for (const secret of [
    "ANDROID_KEYSTORE",
    "ANDROID_KEYSTORE_PASSWORD",
    "ANDROID_KEY_ALIAS",
    "ANDROID_KEY_PASSWORD",
    "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON",
  ]) {
    assert.match(workflow, new RegExp(secret));
  }
  assert.match(workflow, /keytool -list/);
  assert.match(workflow, /\.\/gradlew --no-daemon bundleRelease/);
  assert.match(workflow, /test -s "\$AAB"/);
  assert.match(workflow, /jarsigner -verify "\$AAB"/);
  assert.match(workflow, /AAB-SHA256\.txt/);
  assert.match(workflow, /RELEASE-CANDIDATE-SHA\.txt/);
  assert.match(
    workflow,
    /Publish signed AAB to Google Play production\n\s+if: github\.ref == 'refs\/heads\/main'/,
  );
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

test("native distributable versions agree with the canonical release manifest", async () => {
  const manifest = await text(v4ManifestPath);
  const iosInfo = await text(iosInfoPlistPath);
  const iosProject = await text(iosProjectPath);
  const androidGradle = await text(androidBuildGradlePath);

  const releaseVersion = capture(manifest, /releaseVersion:\s*"([^"]+)"/, "manifest releaseVersion");
  const iosVersion = capture(iosInfo, /<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/, "iOS version");
  const iosBuild = capture(iosInfo, /<key>CFBundleVersion<\/key>\s*<string>([^<]+)<\/string>/, "iOS build");
  const androidVersion = capture(androidGradle, /versionName\s+"([^"]+)"/, "Android version");
  const androidBuild = capture(androidGradle, /versionCode\s+(\d+)/, "Android build");

  assert.equal(iosVersion, releaseVersion);
  assert.equal(androidVersion, releaseVersion);
  assert.match(iosProject, new RegExp(`MARKETING_VERSION = ${releaseVersion.replaceAll(".", "\\.")};`));
  assert.match(iosProject, new RegExp(`CURRENT_PROJECT_VERSION = ${iosBuild};`));
  assert.ok(Number(iosBuild) >= 4_000_004);
  assert.ok(Number(androidBuild) >= 4_000_004);
  assert.match(manifest, /apiContract:\s*"foundation-v4"/);
});
