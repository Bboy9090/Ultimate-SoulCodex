import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const billing = readFileSync(new URL("../server/billing.ts", import.meta.url), "utf8");
const client = readFileSync(new URL("../client/src/lib/nativeBilling.ts", import.meta.url), "utf8");
const diagnostics = readFileSync(new URL("../client/src/pages/DiagnosticsPage.tsx", import.meta.url), "utf8");

const start = billing.indexOf('app.get("/api/billing/native/qualification-access"');
const end = billing.indexOf('app.post("/api/billing/native/verify"');
const endpoint = billing.slice(start, end);

test("sandbox recovery is a read-only native and server-authorized tester route", () => {
  assert.ok(start >= 0 && end > start);
  assert.match(endpoint, /isNativeAppOrigin\(requestOrigin\(req\)\)/);
  assert.match(endpoint, /billingQualificationRequest\(req\)/);
  assert.match(endpoint, /!platformNativeBillingFlagEnabled\(platform\)/);
  assert.match(endpoint, /iosQualificationFlagEnabled\(\)/);
  assert.match(endpoint, /androidQualificationFlagEnabled\(\)/);
  assert.match(endpoint, /req\.session\?\.userId/);
  assert.match(endpoint, /nativeBillingQualificationAccountAllowed\(userId\)/);
  assert.match(endpoint, /resolveSandboxBillingEntitlementForUser\(storage, userId\)/);
  assert.match(endpoint, /Cache-Control", "private, no-store/);
  assert.match(endpoint, /res\.status\(404\)/);
  assert.match(endpoint, /res\.status\(401\)/);
  assert.match(endpoint, /res\.status\(403\)/);
  assert.doesNotMatch(endpoint, /recordVerifiedBillingEvent|createEntitlementGrant|verifyGoogleBillingEvidence|verifyAppleBillingEvidence/);
});

test("qualification client is compile-time opt-in and cannot replace production access", () => {
  const section = client.slice(client.indexOf("export async function loadNativeBillingSandboxStatus"));
  assert.match(section, /if \(!qualificationMode\) return null/);
  assert.match(section, /currentNativeBillingPlatform\(\)/);
  assert.match(section, /qualificationHeaders\(\)/);
  assert.match(section, /cache: "no-store"/);
  assert.match(section, /\/api\/billing\/native\/qualification-access/);
  assert.doesNotMatch(section, /invalidateQueries|setQueryData|isPremium\s*=\s*true/);
});

test("sandbox receipt is explicitly diagnostic rather than production Plus", () => {
  assert.match(diagnostics, /loadNativeBillingSandboxStatus/);
  assert.match(diagnostics, /sandbox-billing-recovery-status/);
  assert.match(diagnostics, /not a production Plus entitlement/);
  assert.match(diagnostics, /No authorized sandbox receipt available/);
  assert.match(diagnostics, /billing\.sandboxAccess\?\.lastVerifiedAt/);
});
