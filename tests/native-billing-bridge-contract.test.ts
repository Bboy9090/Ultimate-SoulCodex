import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const billing = readFileSync(new URL("../server/billing.ts", import.meta.url), "utf8");
const client = readFileSync(new URL("../client/src/lib/nativeBilling.ts", import.meta.url), "utf8");
const swift = readFileSync(new URL("../ios/App/App/SoulCodexNativeBillingPlugin.swift", import.meta.url), "utf8");
const storyboard = readFileSync(new URL("../ios/App/App/Base.lproj/Main.storyboard", import.meta.url), "utf8");
const project = readFileSync(new URL("../ios/App/App.xcodeproj/project.pbxproj", import.meta.url), "utf8");
const java = readFileSync(new URL("../android/app/src/main/java/app/soulcodex/main/SoulCodexNativeBillingPlugin.java", import.meta.url), "utf8");
const activity = readFileSync(new URL("../android/app/src/main/java/app/soulcodex/main/MainActivity.java", import.meta.url), "utf8");
const gradle = readFileSync(new URL("../android/app/build.gradle", import.meta.url), "utf8");

test("native billing is server-cataloged and disabled without verifier readiness", () => {
  assert.match(billing, /SOUL_CODEX_PLUS_NATIVE_BILLING_ENABLED/);
  assert.match(billing, /appleNativeVerifierConfigured/);
  assert.match(billing, /googleNativeVerifierConfigured/);
  assert.match(billing, /server_verifier_not_configured/);
  assert.match(billing, /\/api\/billing\/native-catalog/);
});

test("web layer registers one provider-neutral native billing bridge", () => {
  assert.match(client, /registerPlugin<SoulCodexNativeBillingPlugin>\("SoulCodexNativeBilling"\)/);
  assert.match(client, /getProducts/);
  assert.match(client, /purchaseNativeProduct/);
  assert.match(client, /restoreNativePurchases/);
  assert.doesNotMatch(client, /isPremium\s*=\s*true/);
});

test("iOS uses StoreKit 2 verified evidence and current entitlements", () => {
  assert.match(swift, /import StoreKit/);
  assert.match(swift, /Product\.products/);
  assert.match(swift, /product\.purchase/);
  assert.match(swift, /case \.verified/);
  assert.match(swift, /jwsRepresentation/);
  assert.match(swift, /Transaction\.currentEntitlements/);
  assert.match(swift, /AppStore\.sync/);
  assert.doesNotMatch(swift, /isPremium/);
  assert.match(storyboard, /SoulCodexBridgeViewController/);
  assert.match(project, /SoulCodexNativeBillingPlugin\.swift in Sources/);
  assert.match(project, /SoulCodexBridgeViewController\.swift in Sources/);
});

test("Android uses Play Billing 9.1 and returns purchase tokens for server verification", () => {
  assert.match(gradle, /com\.android\.billingclient:billing:9\.1\.0/);
  assert.match(activity, /registerPlugin\(SoulCodexNativeBillingPlugin\.class\)/);
  assert.match(java, /BillingClient\.ProductType\.SUBS/);
  assert.match(java, /queryProductDetailsAsync/);
  assert.match(java, /launchBillingFlow/);
  assert.match(java, /queryPurchasesAsync/);
  assert.match(java, /purchaseToken/);
  assert.doesNotMatch(java, /acknowledgePurchase\(/);
  assert.doesNotMatch(java, /isPremium/);
});
