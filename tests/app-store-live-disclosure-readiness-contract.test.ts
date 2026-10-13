import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const receipt = readFileSync(
  "governance/release-audits/V4_1_APP_STORE_LIVE_DISCLOSURE_READINESS_2026-10-13.md",
  "utf8",
);
const manifest = readFileSync("ios/App/App/PrivacyInfo.xcprivacy", "utf8");

test("live App Store readiness receipt records the public privacy mismatch without overclaiming private product state", () => {
  assert.match(receipt, /Data Not Collected/);
  assert.match(receipt, /does not expose an \*\*In-App Purchases\*\* section/);
  assert.match(receipt, /do \*\*not\*\* prove that the monthly or annual products are absent/);
  assert.match(receipt, /does not claim access to private App Store Connect state/);
});

test("receipt mirrors every linked non-tracking 4.1 privacy-manifest category", () => {
  for (const value of [
    "NSPrivacyCollectedDataTypeName",
    "NSPrivacyCollectedDataTypeEmailAddress",
    "NSPrivacyCollectedDataTypeUserID",
    "NSPrivacyCollectedDataTypeCoarseLocation",
    "NSPrivacyCollectedDataTypeSensitiveInfo",
    "NSPrivacyCollectedDataTypePurchaseHistory",
    "NSPrivacyCollectedDataTypeOtherUserContent",
  ]) {
    assert.match(manifest, new RegExp(value));
  }
  for (const label of [
    "Contact Info → Name",
    "Contact Info → Email Address",
    "Identifiers → User ID",
    "Location → Coarse Location",
    "Sensitive Info",
    "Purchases → Purchase History",
    "User Content → Other User Content",
  ]) {
    assert.ok(receipt.includes(label));
  }
  assert.match(receipt, /Tracking: \*\*No\*\*/);
});

test("receipt keeps TestFlight qualification separate from production billing", () => {
  assert.match(receipt, /SOUL_CODEX_PLUS_IOS_BILLING_ENABLED/);
  assert.match(receipt, /SOUL_CODEX_PLUS_IOS_QUALIFICATION_ENABLED/);
  assert.match(receipt, /VITE_BILLING_QUALIFICATION_MODE=true/);
  assert.match(receipt, /SOUL_CODEX_IOS_QUALIFICATION_BUILD=true/);
  assert.match(receipt, /sandbox/);
  assert.match(receipt, /BLOCKED — do not enable production iOS billing yet/);
});
