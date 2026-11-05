import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const receipt = readFileSync(
  "governance/release-audits/V4_1_APP_STORE_CONNECT_PRIVACY_RECEIPT.md",
  "utf8",
);
const manifest = readFileSync("ios/App/App/PrivacyInfo.xcprivacy", "utf8");

test("App Store Connect privacy receipt is fail-closed until owner evidence exists", () => {
  assert.match(receipt, /INCOMPLETE UNTIL OWNER EVIDENCE IS ENTERED/);
  assert.match(receipt, /<required>/);
  assert.match(receipt, /BLOCKED — do not submit \/ resubmit this candidate/);
  assert.match(receipt, /No source-code test, privacy manifest, public storefront page, or prior App Store version may be used as a substitute/);
});

test("receipt mirrors every linked non-tracking privacy-manifest category", () => {
  const pairs = [
    ["NSPrivacyCollectedDataTypeName", "Contact Info → Name"],
    ["NSPrivacyCollectedDataTypeEmailAddress", "Contact Info → Email Address"],
    ["NSPrivacyCollectedDataTypeUserID", "Identifiers → User ID"],
    ["NSPrivacyCollectedDataTypeCoarseLocation", "Location → Coarse Location"],
    ["NSPrivacyCollectedDataTypeSensitiveInfo", "Sensitive Info"],
    ["NSPrivacyCollectedDataTypePurchaseHistory", "Purchases → Purchase History"],
    ["NSPrivacyCollectedDataTypeOtherUserContent", "User Content → Other User Content"],
  ] as const;

  for (const [manifestValue, receiptLabel] of pairs) {
    assert.match(manifest, new RegExp(manifestValue));
    assert.ok(receipt.includes(receiptLabel));
  }

  assert.match(receipt, /Tracking: \*\*No\*\*/);
  assert.match(receipt, /Raw payment-card or bank information collected by Soul Codex: \*\*No\*\*/);
});
