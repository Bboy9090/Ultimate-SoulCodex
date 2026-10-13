import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const diagnostics = readFileSync("client/src/pages/DiagnosticsPage.tsx", "utf8");

test("billing qualification diagnostics expose provider readiness and entitlement state", () => {
  for (const marker of [
    "billing-qualification-diagnostics",
    "Provider readiness without payment secrets",
    "Server verifier",
    "Monthly catalog",
    "Annual catalog",
    "Entitlement evidence",
    "Current tier",
    "Entitlement source",
    "Last verification",
  ]) {
    assert.match(diagnostics, new RegExp(marker));
  }
});

test("billing diagnostics use provider-localized native product prices when available", () => {
  assert.match(diagnostics, /loadNativeBillingCatalog/);
  assert.match(diagnostics, /loadNativeBillingProducts/);
  assert.match(diagnostics, /monthlyDisplayPrice/);
  assert.match(diagnostics, /annualDisplayPrice/);
});

test("billing diagnostics never render raw provider evidence or payment secrets", () => {
  assert.doesNotMatch(
    diagnostics,
    /{[^\n}]*(transactionId|purchaseToken|signedTransaction|identityToken|accessToken|refreshToken|cardNumber|cvc|cvv)[^\n}]*}/i,
  );
  assert.match(diagnostics, /Transaction IDs, purchase tokens, signed payloads, card data, and provider secrets are never rendered here/);
});

test("diagnostics explicitly refuse to equate configuration with purchase qualification", () => {
  assert.match(diagnostics, /configuration evidence only/);
  assert.match(diagnostics, /real sandbox\/TestFlight\/internal-test evidence/);
  assert.match(diagnostics, /before production activation/);
});
