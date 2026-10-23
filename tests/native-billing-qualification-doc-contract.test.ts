import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const procedure = readFileSync(new URL("../governance/release-audits/V4_1_NATIVE_BILLING_QUALIFICATION.md", import.meta.url), "utf8");
const receipt = readFileSync(new URL("../governance/release-audits/V4_1_NATIVE_BILLING_QUALIFICATION_RECEIPT.md", import.meta.url), "utf8");

test("native billing qualification names the approved catalog without claiming provider approval", () => {
  for (const value of [
    "$5.99 USD / month",
    "$59.99 USD / year",
    "app.soulcodex.plus.monthly.renewing",
    "app.soulcodex.plus.annual.renewing",
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

test("current qualification receipt separates build readiness from provider transaction qualification", () => {
  assert.match(receipt, /Apple-managed Xcode Cloud archive: PASS/);
  assert.match(receipt, /Qualification transaction SHA: \*\*NOT FROZEN/);
  assert.match(receipt, /no dedicated current-build TestFlight\/internal-test provider evidence run has completed/);
  assert.match(receipt, /freeze the exact qualification build SHA/);
  assert.match(receipt, /Railway production deployment status must be re-recorded for the frozen qualification SHA/);
  assert.match(receipt, /SOUL_CODEX_PLUS_IOS_QUALIFICATION_ENABLED[^\n]*staged/);
  assert.match(receipt, /real annual Apple sandbox transaction has been observed historically/);
  assert.match(receipt, /authentication_required/);
  assert.match(receipt, /current repaired build still requires retest/);
});

test("all provider transaction checkpoints remain inconclusive until evidence is recorded", () => {
  const rows = receipt
    .split("\n")
    .filter((line) => line.startsWith("| ") && !line.includes("Checkpoint") && !line.startsWith("|---"));
  assert.ok(rows.length >= 29);
  for (const row of rows) {
    const cells = row.split("|").map((cell) => cell.trim()).filter(Boolean);
    assert.equal(cells[1], "INCONCLUSIVE", row);
  }
});

test("Apple qualification instructions match observed App Store Connect renewing IDs", () => {
  const catalog = readFileSync(new URL("../docs/SOUL_CODEX_PLUS_STORE_CATALOG_4_1.md", import.meta.url), "utf8");
  const envExample = readFileSync(new URL("../.env.example", import.meta.url), "utf8");
  const disclosure = readFileSync(new URL("../governance/release-audits/V4_1_APP_STORE_LIVE_DISCLOSURE_READINESS_2026-10-13.md", import.meta.url), "utf8");
  for (const [name, document] of [
    ["store catalog", catalog],
    ["qualification procedure", procedure],
    ["qualification receipt", receipt],
    ["environment example", envExample],
    ["App Store disclosure checklist", disclosure],
  ] as const) {
    for (const id of ["app.soulcodex.plus.monthly.renewing", "app.soulcodex.plus.annual.renewing"]) {
      assert.ok(document.includes(id), `${name} must use the observed product ID ${id}`);
    }
    assert.doesNotMatch(document, /app\.soulcodex\.plus\.(monthly|annual)(?!\.renewing)/, `${name} must not direct testers to old Apple product IDs`);
  }
  assert.match(catalog, /Prepare for Submission/);
  assert.match(receipt, /\*\*iOS result:\*\* INCONCLUSIVE/);
});
