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

  assert.match(android, /versionCode\s+4000014/);
  assert.match(android, /versionName\s+"4\.1\.0"/);
  assert.match(android, /applicationId\s+"soulcodex\.app"/);
  assert.match(android, /namespace\s*=\s*"app\.soulcodex\.main"/);
  assert.match(info, /<key>CFBundleShortVersionString<\/key>\s*<string>4\.1\.0<\/string>/);
  assert.match(info, /<key>CFBundleVersion<\/key>\s*<string>4000012<\/string>/);
  assert.match(project, /CURRENT_PROJECT_VERSION = 4000012;/);
  assert.match(project, /MARKETING_VERSION = 4\.1\.0;/);
  assert.match(project, /PRODUCT_BUNDLE_IDENTIFIER = app\.soulcodex\.ios;/);
  assert.match(manifest, /releaseVersion:\s*"4\.1\.0"/);
  assert.match(dockerfile, /SOUL_CODEX_RELEASE_VERSION=4\.1\.0/);
  assert.match(serverIdentity, /DEFAULT_FOUNDATION_RELEASE_VERSION = "4\.1\.0"/);
  assert.match(clientIdentity, /DEFAULT_CLIENT_RELEASE_VERSION = "4\.1\.0"/);
  assert.match(androidBuildspec, /VITE_RELEASE_VERSION: "4\.1\.0"/);
  assert.match(envExample, /VITE_RELEASE_VERSION=4\.1\.0/);
  assert.match(envExample, /SOUL_CODEX_RELEASE_VERSION=4\.1\.0/);

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

test("store workflow qualifies exact candidate without auto-publishing production", async () => {
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
  assert.match(workflow, /actions\/checkout@v5/);
  assert.match(workflow, /CANDIDATE_SHA:\s*\$\{\{ github\.event\.pull_request\.head\.sha \|\| github\.sha \}\}/);
  assert.equal((workflow.match(/ref:\s*\$\{\{ env\.CANDIDATE_SHA \}\}/g) ?? []).length, 3);
  assert.equal((workflow.match(/test "\$\(git rev-parse HEAD\)" = "\$CANDIDATE_SHA"/g) ?? []).length, 3);
  assert.match(workflow, /VITE_RELEASE_SHA:\s*\$\{\{ env\.CANDIDATE_SHA \}\}/);
  assert.match(workflow, /SHA=\$\{CANDIDATE_SHA\}/);
  assert.match(workflow, /printf '%s\\n' "\$CANDIDATE_SHA" > RELEASE-CANDIDATE-SHA\.txt/);
  assert.doesNotMatch(workflow, /VITE_RELEASE_SHA:\s*\$\{\{ github\.sha \}\}/);
  assert.doesNotMatch(workflow, /SHA=\$\{GITHUB_SHA\}/);
  assert.doesNotMatch(workflow, /RELEASE-CANDIDATE-SHA\.txt[\s\S]{0,200}\$GITHUB_SHA/);
  assert.match(workflow, /actions\/setup-node@v7/);
  assert.match(workflow, /actions\/setup-java@v5/);
  assert.match(workflow, /Detect Google Play publishing credentials/);
  assert.match(workflow, /steps\.play\.outputs\.available/);
  assert.match(workflow, /Require signed Android candidate on main/);
  assert.match(workflow, /production_publish_attempted=false/);
  assert.match(workflow, /production_publish_deferred=true/);
  assert.match(workflow, /submission is deferred until the owner authorizes and completes a separate store-launch process/);
  assert.doesNotMatch(workflow, /r0adkll\/upload-google-play/);
  assert.doesNotMatch(workflow, /track:\s*production/);
  assert.match(workflow, /VITE_RELEASE_VERSION:\s*4\.1\.0/);
  assert.match(workflow, /iOS marketingVersion=4\.1\.0/);
  assert.match(workflow, /iOS build=4000012/);
  assert.match(workflow, /signed_store_upload=delegated_to_xcode_cloud_after_main_merge/);
});

test("release validator refuses stale rc metadata and unknown SHAs", async () => {
  const validator = await text("scripts/validate-mobile-release.mjs");
  assert.match(validator, /releaseVersion !== "4\.1\.0"/);
  assert.match(validator, /android\/app\/build\.gradle/);
  assert.match(validator, /versionCode\\s\+4000014/);
  assert.match(validator, /CURRENT_PROJECT_VERSION = 4000012/);
  assert.match(validator, /VITE_RELEASE_SHA cannot be unknown/);
  assert.match(validator, /40-character Git commit SHA/);
});


test("store metadata points at the verified public legal host and exact release identities", async () => {
  const packet = await text("docs/STORE_SUBMISSION_PACKET.md");
  const listing = await text("store-assets/STORE_LISTING.md");
  const appStore = await text("app_store_metadata.md");

  for (const source of [packet, listing, appStore]) {
    assert.match(source, /https:\/\/bboy9090\.github\.io\/Ultimate-SoulCodex\/privacy\//);
    assert.match(source, /https:\/\/bboy9090\.github\.io\/Ultimate-SoulCodex\/support\//);
    assert.match(source, /https:\/\/bboy9090\.github\.io\/Ultimate-SoulCodex\/account-deletion\//);
    assert.doesNotMatch(source, /https:\/\/soulcodex\.up\.railway\.app\/(?:privacy|support|account-deletion)/);
    assert.doesNotMatch(source, /https:\/\/soulcodex\.app\/(?:privacy|support|account-deletion)/);
  }

  assert.match(packet, /4\.1\.0 \/ versionCode 4000014/);
  assert.match(packet, /4\.1\.0 \/ build 4000012/);
  assert.match(packet, /do not hard-code them into the source tree/);

  assert.match(listing, /Verified Human Design Type, Strategy, Authority, and Profile/);
  assert.match(listing, /Deeper interpretation layers across supported readings/);
  assert.match(listing, /Full-name numerology: Expression, Soul Urge, Personality, and Maturity/);
  assert.match(listing, /Evidence-aware downloadable natal PDF report/);
  assert.doesNotMatch(listing, /Premium includes everything above plus:[\s\S]*Full chart with houses and aspects/);
  assert.doesNotMatch(listing, /Complete Human Design profile/);

  const movingSha = /\b[0-9a-f]{40}\b/i;
  for (const [name, source] of [
    ["canonical packet", packet],
    ["store listing", listing],
    ["app store metadata", appStore],
  ] as const) {
    assert.doesNotMatch(source, movingSha, `${name} must not pin a historical release SHA`);
    assert.match(source, /exact-head|exact qualified candidate|exact qualified/i);
  }
});


test("Store Candidate concurrency is isolated per PR or ref", async () => {
  const workflow = await readFile(
    new URL("../.github/workflows/store-4.0.0-release.yml", import.meta.url),
    "utf8",
  );

  assert.match(
    workflow,
    /group:\s*soulcodex-store-4-1-0-\$\{\{ github\.event\.pull_request\.number \|\| github\.ref \}\}/,
  );
  assert.match(workflow, /cancel-in-progress:\s*true/);
  assert.doesNotMatch(workflow, /group:\s*soulcodex-store-4-1-0\s*$/m);
});


test("Google Play account-deletion page states request steps, deleted data, and retention", async () => {
  const deletion = await text("client/src/pages/AccountDeletionPage.tsx");
  const staticDeletion = await text("legal/account-deletion/index.html");

  for (const source of [deletion, staticDeletion]) {
    assert.match(source, /Delete your Soul Codex account and data/);
    assert.match(source, /How to request deletion/);
    assert.match(source, /privacy@soulcodex\.app/);
    assert.match(source, /What will be removed/);
    assert.match(source, /up to 7 days/);
    assert.match(source, /No scheduled production database backups are currently enabled/);
    assert.match(source, /legally required period/);
  }
  assert.match(deletion, /Permanently Delete My Data/);
  assert.match(deletion, /What may be kept and for how long/);
});


test("subscription listing descriptions retain the Apple EULA required by App Review", async () => {
  const eula = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";
  const packet = await text("docs/STORE_SUBMISSION_PACKET.md");
  const listing = await text("store-assets/STORE_LISTING.md");
  const packetDescription = packet.split("### Full description")[1]?.split("### iOS keywords")[0];
  const listingDescription = listing.split("## Full Description")[1]?.split("## Keywords")[0];
  for (const [name, description] of [["canonical packet", packetDescription], ["store copy", listingDescription]] as const) {
    assert.ok(description?.includes(eula), name + " must include the functional EULA URL inside the copy-paste description");
  }
  assert.match(packet, /every enabled App Store localization/);
});
