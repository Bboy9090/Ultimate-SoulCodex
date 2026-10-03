import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const billing = readFileSync(new URL("../server/billing.ts", import.meta.url), "utf8");
const verifier = readFileSync(new URL("../server/lib/native-billing-verification.ts", import.meta.url), "utf8");
const client = readFileSync(new URL("../client/src/lib/nativeBilling.ts", import.meta.url), "utf8");
const panel = readFileSync(new URL("../client/src/components/SoulCodexPlusBillingPanel.tsx", import.meta.url), "utf8");

test("native verification is authenticated, origin-bound, and server-authoritative", () => {
  assert.match(billing, /\/api\/billing\/native\/verify/);
  assert.match(billing, /isNativeAppOrigin\(requestOrigin\(req\)\)/);
  assert.match(billing, /req\.session\?\.userId/);
  assert.match(billing, /recordVerifiedBillingEvent/);
  assert.match(billing, /resolveProductEntitlementForUser/);
  assert.doesNotMatch(billing, /isPremium\s*=\s*true/);
});

test("Apple verification checks signed JWS, trusted chain, app, product, account, and environment", () => {
  assert.match(verifier, /header\.alg !== "ES256"/);
  assert.match(verifier, /X509Certificate/);
  assert.match(verifier, /apple_certificate_root_untrusted/);
  assert.match(verifier, /apple_bundle_mismatch/);
  assert.match(verifier, /apple_product_mismatch/);
  assert.match(verifier, /apple_transaction_mismatch/);
  assert.match(verifier, /apple_account_binding_mismatch/);
  assert.match(verifier, /APPLE_IAP_ALLOWED_ENVIRONMENTS/);
  assert.match(verifier, /apple_environment_invalid/);
  assert.match(verifier, /normalized === "production"/);
  assert.match(verifier, /apple_environment_mismatch/);
  assert.match(billing, /"apple_environment_invalid"/);
});

test("Google verification uses Play Developer API, binds account, and acknowledges only after verification", () => {
  assert.match(verifier, /androidpublisher\.googleapis\.com/);
  assert.match(verifier, /purchases\/subscriptionsv2\/tokens/);
  assert.match(verifier, /google_play_product_mismatch/);
  assert.match(verifier, /obfuscatedExternalAccountId !== userId/);
  assert.match(verifier, /google_play_account_binding_mismatch/);
  assert.match(verifier, /ACKNOWLEDGEMENT_STATE_PENDING/);
  assert.match(verifier, /:acknowledge/);
  assert.match(verifier, /google_play_acknowledgement_failed/);
});

test("native client sends store evidence to server and refreshes durable access", () => {
  assert.match(client, /\/api\/billing\/native\/verify/);
  assert.match(panel, /verifyNativeBillingEvidence/);
  assert.match(panel, /invalidateQueries\(\{ queryKey: \["\/api\/access"\] \}\)/);
  assert.match(panel, /refetchAccess/);
  assert.match(panel, /Restore purchases/);
  assert.doesNotMatch(panel, /setQueryData\([^)]*tier:\s*"plus"/s);
});

test("native purchase passes authenticated account id into store account binding", () => {
  assert.match(panel, /purchaseNativeProduct\(productId, currentUser\.id\)/);
  assert.match(verifier, /payload\.appAccountToken\.toLowerCase\(\) !== userId\.toLowerCase\(\)/);
  assert.match(verifier, /obfuscatedExternalAccountId !== userId/);
});
