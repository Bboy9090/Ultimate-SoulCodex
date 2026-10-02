import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildSafeDiagnosticBundle } from "../client/src/lib/safeDiagnosticBundle";

const diagnosticsUrl = new URL("../client/src/pages/DiagnosticsPage.tsx", import.meta.url);
const supportUrl = new URL("../client/src/pages/SupportPage.tsx", import.meta.url);
const serverUrl = new URL("../server/index.ts", import.meta.url);

test("safe diagnostic bundle contains release facts but ignores injected private material", () => {
  const input = {
    checkedAt: "2026-09-29T07:00:00.000Z",
    client: {
      appVersion: "4.0.1",
      releaseSha: "abc123",
      expectedApiContract: "foundation-v4",
      apiBase: "https://soulcodex.up.railway.app",
    },
    backend: {
      status: "ok",
      appVersion: "4.0.1",
      releaseSha: "abc123",
      apiContract: "foundation-v4",
    },
    contractMatches: true,
    exactShaMatches: true,
    compatibilityOk: true,
    online: true,
    birthDate: "1990-09-17",
    birthTime: "11:11",
    profileId: "private-profile-id",
    assessmentAnswers: ["secret-answer"],
    shareToken: "secret-share-token",
  } as any;

  const output = buildSafeDiagnosticBundle(input);

  assert.match(output, /client\.releaseSha=abc123/);
  assert.match(output, /contractMatches=yes/);
  assert.match(output, /Privacy: this summary intentionally excludes birth data/);
  assert.doesNotMatch(output, /1990-09-17/);
  assert.doesNotMatch(output, /11:11/);
  assert.doesNotMatch(output, /private-profile-id/);
  assert.doesNotMatch(output, /secret-answer/);
  assert.doesNotMatch(output, /secret-share-token/);
});

test("Diagnostics copy workflow explicitly describes its privacy boundary", async () => {
  const source = await readFile(diagnosticsUrl, "utf8");

  assert.match(source, /Copy safe summary/);
  assert.match(source, /buildSafeDiagnosticBundle/);
  assert.match(source, /Birth data, profile content, account identifiers, assessment answers, payment data, and share tokens are excluded/);
  assert.match(source, /navigator\.clipboard\.writeText\(safeSummary\)/);
});

test("Support steers users away from sending sensitive profile material", async () => {
  const source = await readFile(supportUrl, "utf8");

  assert.match(source, /href="\/diagnostics"/);
  assert.match(source, /birth date\/time\/place/);
  assert.match(source, /assessment answers/);
  assert.match(source, /active public-share tokens/);
  assert.match(source, /payment details/);
});

test("server disables unused ambient sensors without blocking clipboard or hosted payment", async () => {
  const source = await readFile(serverUrl, "utf8");

  assert.match(source, /"Permissions-Policy"/);
  assert.match(source, /camera=\(\), microphone=\(\), geolocation=\(\)/);
  assert.doesNotMatch(source, /clipboard-write=\(\)/);
  assert.doesNotMatch(source, /payment=\(\)/);
  assert.match(source, /contentSecurityPolicy: false/);
});
