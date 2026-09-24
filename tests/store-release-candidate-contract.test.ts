import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function text(path: string): Promise<string> {
  return readFile(path, "utf8");
}

test("Soul Codex platform release identities are aligned", async () => {
  const android = await text("android/app/build.gradle");
  const info = await text("ios/App/App/Info.plist");
  const project = await text("ios/App/App.xcodeproj/project.pbxproj");
  const manifest = await text("client/src/lib/v4ReleaseManifest.ts");
  const dockerfile = await text("Dockerfile");
  const serverIdentity = await text("server/lib/release-identity.ts");
  const clientIdentity = await text("client/src/lib/releaseIdentity.ts");
  const androidBuildspec = await text("buildspec-android.yml");
  const envExample = await text(".env.example");

  assert.match(android, /versionCode\s+4000008/);
  assert.match(android, /versionName\s+"4\.0\.1"/);
  assert.match(info, /<key>CFBundleShortVersionString<\/key>\s*<string>4\.0\.2<\/string>/);
  assert.match(info, /<key>CFBundleVersion<\/key>\s*<string>4000009<\/string>/);
  assert.match(project, /CURRENT_PROJECT_VERSION = 4000009;/);
  assert.match(project, /MARKETING_VERSION = 4\.0\.2;/);
  assert.match(project, /PRODUCT_BUNDLE_IDENTIFIER = app\.soulcodex\.ios;/);
  assert.match(manifest, /releaseVersion:\s*"4\.0\.1"/);
  assert.match(dockerfile, /SOUL_CODEX_RELEASE_VERSION=4\.0\.1/);
  assert.match(serverIdentity, /DEFAULT_FOUNDATION_RELEASE_VERSION = "4\.0\.1"/);
  assert.match(clientIdentity, /DEFAULT_CLIENT_RELEASE_VERSION = "4\.0\.1"/);
  assert.match(androidBuildspec, /VITE_RELEASE_VERSION: "4\.0\.1"/);
  assert.match(envExample, /VITE_RELEASE_VERSION=4\.0\.1/);
  assert.match(envExample, /SOUL_CODEX_RELEASE_VERSION=4\.0\.1/);

  for (const [name, source] of [
    ["Dockerfile", dockerfile],
    ["server release identity", serverIdentity],
    ["client release identity", clientIdentity],
    ["Android CodeBuild", androidBuildspec],
    ["environment example", envExample],
  ] as const) {
    assert.doesNotMatch(source, /4\.0\.0-rc\.3/, `${name} must not retain the RC3 runtime identity`);
  }
});

test("store workflow binds exact release branch and Play production upload", async () => {
  const workflow = await text(".github/workflows/store-4.0.0-release.yml");
  for (const secret of [
    "ANDROID_KEYSTORE",
    "ANDROID_KEYSTORE_PASSWORD",
    "ANDROID_KEY_ALIAS",
    "ANDROID_KEY_PASSWORD",
    "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON",
  ]) {
    assert.match(workflow, new RegExp(secret));
  }
  assert.match(workflow, /release\/store-4\.0\.0-federation-final/);
  assert.match(workflow, /r0adkll\/upload-google-play@v1\.1\.3/);
  assert.match(workflow, /packageName:\s*app\.soulcodex\.main/);
  assert.match(workflow, /track:\s*production/);
  assert.match(workflow, /status:\s*completed/);
  assert.match(workflow, /VITE_RELEASE_VERSION:\s*4\.0\.2/);
  assert.match(workflow, /iOS marketingVersion=4\.0\.2/);
  assert.match(workflow, /iOS build=4000009/);
  assert.match(workflow, /signed_store_upload=delegated_to_xcode_cloud_after_main_merge/);
});

test("release validator refuses stale rc metadata and unknown SHAs", async () => {
  const validator = await text("scripts/validate-mobile-release.mjs");
  assert.match(validator, /releaseVersion !== "4\.0\.1"/);
  assert.match(validator, /versionCode\\s\+4000008/);
  assert.match(validator, /CURRENT_PROJECT_VERSION = 4000009/);
  assert.match(validator, /VITE_RELEASE_SHA cannot be unknown/);
  assert.match(validator, /40-character Git commit SHA/);
});


test("store metadata points at the verified production domain and exact release identities", async () => {
  const packet = await text("docs/STORE_SUBMISSION_PACKET.md");
  const listing = await text("store-assets/STORE_LISTING.md");
  const appStore = await text("app_store_metadata.md");

  for (const source of [packet, listing, appStore]) {
    assert.match(source, /https:\/\/soulcodex\.up\.railway\.app\/privacy/);
    assert.match(source, /https:\/\/soulcodex\.up\.railway\.app\/support/);
    assert.match(source, /https:\/\/soulcodex\.up\.railway\.app\/account-deletion/);
    assert.doesNotMatch(source, /https:\/\/soulcodex\.app\/(?:privacy|support|account-deletion)/);
  }

  assert.match(packet, /4\.0\.1 \/ versionCode 4000008/);
  assert.match(packet, /4\.0\.2 \/ build 4000009/);
  assert.match(packet, /10785817586/);
  assert.match(packet, /52cddc3a1e216fa84d346d2c69ca1b508d6fbee1ab72d7d90fac942c6a4702cf/);
});
