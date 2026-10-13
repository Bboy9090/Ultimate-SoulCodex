import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const server = readFileSync("server/index.ts", "utf8");
const client = readFileSync("client/src/lib/nativeBilling.ts", "utf8");

test("TestFlight qualification header is admitted by trusted-origin CORS", () => {
  assert.match(client, /X-SoulCodex-Billing-Qualification/);
  assert.match(server, /X-SoulCodex-Billing-Qualification/);
  assert.match(server, /allowedHeaders:/);
  assert.match(server, /capacitor:\/\/localhost/);
  assert.match(server, /soulcodex:\/\/localhost/);
  assert.match(server, /https:\/\/localhost/);
});

test("qualification CORS support does not widen origins or headers to wildcard", () => {
  assert.doesNotMatch(server, /origin:\s*["']\*["']/);
  assert.doesNotMatch(server, /allowedHeaders:\s*["']\*["']/);
  assert.match(server, /allowedOrigins\.includes\(origin\)/);
  assert.match(server, /trustedMutationOriginGuard\(allowedOrigins\)/);
});

test("existing billing and authorization headers remain allowed", () => {
  assert.match(server, /Content-Type/);
  assert.match(server, /Authorization/);
  assert.match(server, /Stripe-Signature/);
});
