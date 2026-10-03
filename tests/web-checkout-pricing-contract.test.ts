import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const billing = readFileSync(new URL("../server/billing.ts", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("../server/index.ts", import.meta.url), "utf8");
const routes = readFileSync(new URL("../server/routes.ts", import.meta.url), "utf8");
const panel = readFileSync(new URL("../client/src/components/SoulCodexPlusBillingPanel.tsx", import.meta.url), "utf8");
const pricing = readFileSync(new URL("../client/src/pages/PricingPage.tsx", import.meta.url), "utf8");

test("web checkout is session-bound and feature flagged", () => {
  assert.match(billing, /SOUL_CODEX_PLUS_WEB_CHECKOUT_ENABLED/);
  assert.match(billing, /req\.session\?\.userId/);
  assert.match(billing, /mode:\s*"subscription"/);
  assert.match(billing, /subscription_data/);
  assert.match(billing, /soulCodexUserId:\s*user\.id/);
  assert.doesNotMatch(billing, /profileId/);
});

test("parsed checkout routes run after session setup", () => {
  assert.doesNotMatch(indexSource, /registerBillingRoutes\(app\)/);
  const sessionIndex = routes.indexOf("setupSession(app)");
  const billingIndex = routes.indexOf("registerBillingRoutes(app)");
  assert.ok(sessionIndex >= 0);
  assert.ok(billingIndex > sessionIndex);
});

test("native shells never receive the web checkout path", () => {
  assert.match(billing, /native_store_billing_required/);
  assert.match(panel, /Capacitor\.isNativePlatform/);
  assert.match(panel, /Web checkout is never opened from the bundled app/);
});

test("pricing is catalog-backed and never hard-coded", () => {
  assert.match(billing, /stripe\.prices\.retrieve/);
  assert.match(panel, /Intl\.NumberFormat/);
  assert.match(panel, /\/api\/billing\/catalog/);
  assert.doesNotMatch(panel, /\$\d+(?:\.\d{2})?/);
  assert.doesNotMatch(pricing, /\$\d+(?:\.\d{2})?/);
});

test("checkout return only refreshes durable access", () => {
  assert.match(panel, /checkout/);
  assert.match(panel, /invalidateQueries\(\{ queryKey: \["\/api\/access"\] \}\)/);
  assert.match(panel, /refetchAccess/);
  assert.match(panel, /not verified yet/);
  assert.doesNotMatch(panel, /setQueryData\(\["\/api\/access"\].*tier:\s*"plus"/s);
});

test("web subscription management uses hosted Stripe portal", () => {
  assert.match(billing, /billingPortal\.sessions\.create/);
  assert.match(billing, /getLatestEntitlementGrant/);
  assert.match(billing, /getBillingTransactionEventById/);
  assert.match(panel, /\/api\/billing\/manage/);
});

test("pricing page mounts one centralized Plus billing surface", () => {
  assert.match(pricing, /SoulCodexPlusBillingPanel/);
  assert.match(pricing, /livePremiumFeatures/);
  assert.doesNotMatch(pricing, /plannedPremiumFeatures/);
});
