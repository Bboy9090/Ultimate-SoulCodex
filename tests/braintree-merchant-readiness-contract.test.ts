import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const doc = readFileSync("docs/BRAINTREE_MERCHANT_ONBOARDING_AND_RELEASE_GATES.md", "utf8");
const ledger = readFileSync("server/lib/durable-entitlements.ts", "utf8");
const billing = readFileSync("server/billing.ts", "utf8");

test("Braintree has a bounded web-only onboarding path, not a pretend live checkout", () => {
  assert.match(doc, /NOT CONNECTED · NOT ENABLED · NOT APPROVED FOR PRODUCTION/);
  assert.match(doc, /existing Stripe web path and Apple\/Google native subscription programs stay unchanged/);
  assert.match(doc, /SOUL_CODEX_PLUS_BRAINTREE_WEB_ENABLED/);
  assert.match(doc, /must default off/);
  assert.match(doc, /No public product claims, existing-account migration, activation, real charge/);
  assert.doesNotMatch(billing, /app\.(post|get)\("\/api\/billing\/braintree/);
});

test("Braintree cannot be processed under an existing Stripe entitlement identity", () => {
  assert.match(ledger, /billingProviderSchema = z\.enum\(\["stripe", "apple", "google_play"\]\)/);
  assert.match(doc, /cannot become a Plus grant by pretending to be Stripe/);
  assert.match(doc, /Sandbox events must not grant ordinary production access/);
  assert.match(doc, /signed webhook lifecycle/);
  assert.match(doc, /No raw PAN, CVV/);
});

test("merchant secrets, mobile store compliance and lifecycle need independent approval", () => {
  assert.match(doc, /never GitHub or a chat/);
  assert.match(doc, /Merchant ID, Public Key, Private Key and Merchant Account ID/);
  assert.match(doc, /StoreKit and Google Play Billing must remain the default native paths/);
  assert.match(doc, /Renewal, expiry, grace, cancellation, refund, dispute, account deletion, restore/);
  assert.match(doc, /manual go-live approval/);
});
