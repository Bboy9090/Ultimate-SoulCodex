import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const up = readFileSync("migrations/0002_durable_entitlements.sql", "utf8");
const down = readFileSync("migrations/0002_durable_entitlements.down.sql", "utf8");

test("0002 creates only additive durable entitlement authority tables", () => {
  for (const table of ["billing_subjects", "store_transaction_events", "entitlement_grants", "billing_verification_receipts"]) {
    assert.match(up, new RegExp(`CREATE TABLE \\"${table}\\"`));
  }
  assert.match(up, /store_events_provider_transaction_uidx/);
  assert.match(up, /billing_receipts_provider_event_uidx/);
  assert.match(up, /entitlement_grants_subject_capability_uidx/);
  assert.match(up, /ON DELETE restrict/);
  assert.doesNotMatch(up, /DROP TABLE|ALTER TABLE "users"|ALTER TABLE "soul_profiles"/);
});

test("0002 rollback removes only additive billing tables", () => {
  for (const table of ["billing_verification_receipts", "entitlement_grants", "store_transaction_events", "billing_subjects"]) {
    assert.match(down, new RegExp(`DROP TABLE IF EXISTS ${table}`));
  }
  assert.doesNotMatch(down, /DROP TABLE IF EXISTS users|DROP TABLE IF EXISTS soul_profiles/);
});
