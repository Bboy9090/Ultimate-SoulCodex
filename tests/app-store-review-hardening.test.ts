import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const infoPlist = readFileSync("ios/App/App/Info.plist", "utf8");
const premiumModal = readFileSync("client/src/components/PremiumUpgradeModal.tsx", "utf8");

test("iOS does not carry the obsolete armv7 device requirement", () => {
  assert.doesNotMatch(infoPlist, /UIRequiredDeviceCapabilities[\s\S]*?<string>armv7<\/string>/);
});

test("native premium UI does not advertise external digital checkout", () => {
  assert.match(premiumModal, /const nativeStoreBuild = Capacitor\.isNativePlatform\(\)/);
  assert.match(premiumModal, /!nativeStoreBuild && \(/);
  assert.match(premiumModal, /does not open external payment pages for digital features/);
  assert.doesNotMatch(premiumModal, /native release candidate|store billing is validated|Native purchase boundary/);
});

test("native premium copy preserves guest-access truth", () => {
  assert.match(premiumModal, /core guest experience remains available without a purchase/);
  assert.match(premiumModal, /Existing premium entitlements may still be recognized when available/);
});
