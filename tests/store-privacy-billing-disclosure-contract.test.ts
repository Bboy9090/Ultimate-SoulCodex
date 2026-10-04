import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const manifest = readFileSync(new URL("../ios/App/App/PrivacyInfo.xcprivacy", import.meta.url), "utf8");
const packet = readFileSync(new URL("../docs/STORE_SUBMISSION_PACKET.md", import.meta.url), "utf8");
const privacy = readFileSync(new URL("../client/src/pages/PrivacyPage.tsx", import.meta.url), "utf8");
const metadata = readFileSync(new URL("../app_store_metadata.md", import.meta.url), "utf8");

test("native privacy manifest declares purchase history without tracking", () => {
  assert.match(manifest, /NSPrivacyCollectedDataTypePurchaseHistory/);
  const purchase = manifest.slice(
    manifest.indexOf("NSPrivacyCollectedDataTypePurchaseHistory") - 100,
    manifest.indexOf("NSPrivacyCollectedDataTypePurchaseHistory") + 500,
  );
  assert.match(purchase, /NSPrivacyCollectedDataTypeLinked[\s\S]*<true\/>/);
  assert.match(purchase, /NSPrivacyCollectedDataTypeTracking[\s\S]*<false\/>/);
  assert.match(purchase, /NSPrivacyCollectedDataTypePurposeAppFunctionality/);
});

test("store packet declares purchase history and keeps raw payment information excluded", () => {
  assert.match(packet, /\| Purchase history \| Yes \| No\*/);
  assert.match(packet, /Payment card or bank information/);
  assert.doesNotMatch(packet, /In-app purchase history from a native store purchase flow/);
  assert.match(packet, /Data Not Collected/);
});

test("public privacy policy describes billing records without claiming raw card collection", () => {
  assert.match(privacy, /Purchase, subscription, and entitlement records/);
  assert.match(privacy, /does not receive raw card numbers/);
  assert.match(privacy, /Last updated October 4, 2026/);
});

test("verified App Store identity is recorded in canonical release metadata", () => {
  assert.match(packet, /6764221944/);
  assert.match(metadata, /6764221944/);
});
