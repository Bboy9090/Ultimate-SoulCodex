import assert from "node:assert/strict";
import test from "node:test";
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
