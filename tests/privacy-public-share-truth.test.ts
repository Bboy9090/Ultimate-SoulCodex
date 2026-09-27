import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const privacyUrl = new URL("../client/src/pages/PrivacyPage.tsx", import.meta.url);
const termsUrl = new URL("../client/src/pages/TermsPage.tsx", import.meta.url);

test("privacy policy truthfully documents opt-in sanitized public sharing", async () => {
  const source = await readFile(privacyUrl, "utf8");

  assert.match(source, /Nothing from a private profile becomes public automatically/);
  assert.match(source, /specific fields you selected/);
  assert.match(source, /private profile ID/);
  assert.match(source, /birth date/);
  assert.match(source, /birth time/);
  assert.match(source, /timezone/);
  assert.match(source, /coordinates/);
  assert.match(source, /assessment answers/);
  assert.match(source, /raw verification evidence/);
  assert.match(source, /revoke a public-card link/);
  assert.match(source, /September 27, 2026/);
});

test("terms explain the practical limit of revocation", async () => {
  const source = await readFile(termsUrl, "utf8");

  assert.match(source, /Private Soul Codex profiles are not public by default/);
  assert.match(source, /separate sanitized snapshot/);
  assert.match(source, /until you revoke it/);
  assert.match(source, /cannot recall copies another person may already have saved or screenshotted/);
  assert.match(source, /September 27, 2026/);
});
