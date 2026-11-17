import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { nativeBillingQualificationAccountAllowed } from "../server/lib/native-billing-qualification-accounts";

const accountA = "11111111-1111-4111-8111-111111111111";
const accountB = "22222222-2222-4222-8222-222222222222";

test("sandbox qualification requires an explicit authenticated allowlisted account", () => {
  assert.equal(nativeBillingQualificationAccountAllowed(accountA, undefined), false);
  assert.equal(nativeBillingQualificationAccountAllowed(null, JSON.stringify([accountA])), false);
  assert.equal(nativeBillingQualificationAccountAllowed(accountB, JSON.stringify([accountA])), false);
  assert.equal(nativeBillingQualificationAccountAllowed(accountA, JSON.stringify([accountA])), true);
  assert.equal(nativeBillingQualificationAccountAllowed(accountB, JSON.stringify([accountA, accountB])), true);
});

test("malformed, duplicate, oversized, empty or non-UUID allowlists fail closed", () => {
  for (const invalid of [
    "", "null", "true", "[]", "{", "[123]",
    JSON.stringify([accountA, accountA]),
    JSON.stringify(["not-a-uuid"]),
    JSON.stringify(Array.from({ length: 21 }, () => accountA)),
    " ".repeat(4097),
  ]) {
    assert.equal(nativeBillingQualificationAccountAllowed(accountA, invalid), false, invalid.slice(0, 30));
  }
});

test("both catalog discovery and provider verification scope qualification to the current session", () => {
  const billing = readFileSync(new URL("../server/billing.ts", import.meta.url), "utf8");
  const catalog = billing.slice(billing.indexOf('app.get("/api/billing/native-catalog"'));
  const verify = billing.slice(billing.indexOf('app.post("/api/billing/native/verify"'));
  assert.match(catalog, /nativeBillingQualificationAccountAllowed\(req\.session\?\.userId\)/);
  assert.match(verify, /qualificationEnabled && !nativeBillingQualificationAccountAllowed\(userId\)/);
  assert.match(verify, /native_billing_qualification_account_not_allowed/);
  assert.match(verify, /res\.status\(403\)/);
});
