import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const path = ".github/workflows/ios-4.0.2-native-load-hotfix.yml";
const workflow = readFileSync(path, "utf8");
const header = workflow.slice(0, workflow.indexOf("jobs:"));

test("4.1.3 signed iOS workflow is eligible for main pushes touching native release sources", () => {
  assert.match(header, /push:\s*\n\s*branches:\s*\n\s*- main/);
  assert.match(header, /paths:\s*\n\s*- \.github\/workflows\/ios-4\.0\.2-native-load-hotfix\.yml/);
  assert.match(header, /- ios\/\*\*/);
  assert.match(header, /- client\/\*\*/);
  assert.match(header, /workflow_dispatch:/);
  assert.match(header, /VITE_RELEASE_VERSION: 4\.1\.3/);
});

test("signing is gated by exact source checkout, native launch, certificate and provisioning checks", () => {
  assert.match(workflow, /needs: simulator-launch/);
  assert.match(workflow, /test "\$\(git rev-parse HEAD\)" = "\$GITHUB_SHA"/);
  assert.match(workflow, /IOS_CERTIFICATE_P12_MISSING/);
  assert.match(workflow, /IOS_PROVISIONING_PROFILE_MISSING/);
  assert.match(workflow, /IOS_PROFILE_EXPIRED/);
  assert.match(workflow, /IOS_PROFILE_CERTIFICATE_MISMATCH/);
  assert.match(workflow, /codesign --verify --deep --strict/);
  assert.match(workflow, /CFBundleShortVersionString.*4\.1\.3/);
  assert.match(workflow, /CFBundleVersion.*4000017/);
});

test("signed IPA artifact is versioned and source-identifiable without automatic publication", () => {
  assert.match(workflow, /name: soulcodex-4\.1\.3-signed-app-store-ipa/);
  assert.match(workflow, /build\/export\/IPA-SHA256\.txt/);
  assert.match(workflow, /build\/export\/RELEASE-CANDIDATE-SHA\.txt/);
  assert.match(workflow, /IOS-4\.1\.3-SIGNED-RECEIPT\.txt/);
  assert.match(workflow, /name: soulcodex-4\.1\.3-signing-diagnostics/);
  assert.doesNotMatch(workflow, /xcrun altool --upload|xcrun notarytool submit|itunesconnect\.apple\.com\/upload/);
});
