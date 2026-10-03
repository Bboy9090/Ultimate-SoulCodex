import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const indexSource = readFileSync(new URL("../server/index.ts", import.meta.url), "utf8");
const canonicalRoutes = readFileSync(new URL("../server/routes.ts", import.meta.url), "utf8");
const billing = readFileSync(new URL("../server/billing.ts", import.meta.url), "utf8");
const entitlement = readFileSync(new URL("../server/lib/durable-entitlements.ts", import.meta.url), "utf8");

test("production server uses canonical billing and route modules", () => {
  assert.match(indexSource, /from "\.\/routes\.js"/);
  assert.match(indexSource, /from "\.\/billing\.js"/);
  assert.doesNotMatch(indexSource, /\.\.\/routes/);
});

test("canonical access never authorizes from legacy premium flags", () => {
  assert.doesNotMatch(canonicalRoutes, /profile\.isPremium/);
  assert.doesNotMatch(canonicalRoutes, /user\.isPremium/);
  assert.doesNotMatch(canonicalRoutes, /stripeSubscriptionId/);
  assert.match(canonicalRoutes, /resolveProductEntitlementForUser/);
  assert.match(entitlement, /SOUL_CODEX_PLUS_CAPABILITY/);
});

test("canonical billing cannot grant premium through legacy profile mutation", () => {
  assert.doesNotMatch(billing, /updateProfile\([^)]*isPremium/);
  assert.doesNotMatch(billing, /mode:\s*"payment"/);
  assert.match(billing, /mode:\s*"subscription"/);
  assert.match(billing, /recordVerifiedBillingEvent/);
  assert.match(billing, /SOUL_CODEX_PLUS_WEB_CHECKOUT_ENABLED/);
});

test("mock subscription services are not imported by canonical production routes", () => {
  assert.doesNotMatch(canonicalRoutes, /subscription-service/);
  assert.doesNotMatch(indexSource, /subscription-service/);
});


test("session-aware parsed billing is registered only after session setup", () => {
  assert.doesNotMatch(indexSource, /registerBillingRoutes\(app\)/);
  const sessionIndex = canonicalRoutes.indexOf("setupSession(app)");
  const billingIndex = canonicalRoutes.indexOf("registerBillingRoutes(app)");
  assert.ok(sessionIndex >= 0);
  assert.ok(billingIndex > sessionIndex);
});
