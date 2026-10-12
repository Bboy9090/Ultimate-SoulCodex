import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const procedure = readFileSync(new URL("../governance/release-audits/V4_1_NATIVE_BILLING_QUALIFICATION.md", import.meta.url), "utf8");
const receipt = readFileSync(new URL("../governance/release-audits/V4_1_NATIVE_BILLING_QUALIFICATION_RECEIPT.md", import.meta.url), "utf8");

test("native billing qualification names the approved catalog without claiming provider approval", () => {
  for (const value of [
    "$5.99 USD / month",
    "$59.99 USD / year",
    "app.soulcodex.plus.monthly",
    "app.soulcodex.plus.annual",
    "soul_codex_plus_monthly",
    "soul_codex_plus_annual",
  ]) assert.match(procedure, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(procedure, /not proof of store approval or product availability/i);
});

test("provider qualification requires real purchase restore and lifecycle evidence", () => {
  assert.match(procedure, /Monthly purchase/);
  assert.match(procedure, /Annual purchase/);
  assert.match(procedure, /Restore Purchases/);
  assert.match(procedure, /Reinstall/);
  assert.match(procedure, /Second device/);
  assert.match(procedure, /Refund\/revocation/);
  assert.match(procedure, /App Store Server Notifications V2/);
  assert.match(procedure, /RTDN/);
  assert.match(procedure, /INCONCLUSIVE is not PASS/);
});

test("receipt starts fail-closed with platform flags disabled", () => {
  assert.match(receipt, /\*\*iOS result:\*\* INCONCLUSIVE/);
  assert.match(receipt, /\*\*Android result:\*\* INCONCLUSIVE/);
  assert.match(receipt, /MUST REMAIN FALSE until result is PASS/);
  assert.match(receipt, /Legacy native umbrella flag allowed: NO/);
});
