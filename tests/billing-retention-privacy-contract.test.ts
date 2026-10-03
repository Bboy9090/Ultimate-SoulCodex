import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const routes = readFileSync(new URL("../server/routes.ts", import.meta.url), "utf8");
const storage = readFileSync(new URL("../server/storage.ts", import.meta.url), "utf8");
const deletion = readFileSync(new URL("../client/src/pages/AccountDeletionPage.tsx", import.meta.url), "utf8");
const privacy = readFileSync(new URL("../client/src/pages/PrivacyPage.tsx", import.meta.url), "utf8");
const terms = readFileSync(new URL("../client/src/pages/TermsPage.tsx", import.meta.url), "utf8");

test("account deletion does not falsely promise deletion of immutable billing audit records", () => {
  assert.doesNotMatch(routes, /All your data has been permanently deleted/);
  assert.match(routes, /Minimal billing and security audit records may be retained/);
  assert.match(deletion, /Minimal billing transaction, entitlement-verification, refund\/revocation/);
  assert.doesNotMatch(deletion, /premium entitlement history associated with the account/);
});

test("canonical account deletion removes account access without deleting billing ledger tables", () => {
  const deleteUserBody = storage.slice(
    storage.indexOf("async deleteUserAccount(userId: string)", storage.indexOf("class PostgresStorage")),
  );
  assert.match(deleteUserBody, /delete\(users\)/);
  assert.doesNotMatch(deleteUserBody, /delete\(billingSubjects\)/);
  assert.doesNotMatch(deleteUserBody, /delete\(billingTransactionEvents\)/);
  assert.doesNotMatch(deleteUserBody, /delete\(entitlementGrants\)/);
  assert.doesNotMatch(deleteUserBody, /delete\(billingVerificationReceipts\)/);
});

test("privacy and terms explain durable entitlement truth and audit retention", () => {
  assert.match(privacy, /minimal transaction, entitlement, and redacted verification-audit records/i);
  assert.match(privacy, /minimal billing and security audit records may be retained/i);
  assert.match(terms, /valid durable entitlement/);
  assert.match(terms, /checkout success page, local flag, or\s+profile field does not grant paid access/i);
  assert.match(terms, /Minimal billing and security audit records\s+may be retained/);
});
