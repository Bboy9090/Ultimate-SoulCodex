import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolveApiUrlWithBase } from "../client/src/lib/api-url";

test("native API resolver prefixes /api calls with configured HTTPS origin", () => {
  assert.equal(
    resolveApiUrlWithBase("/api/auth/apple", "https://api.soulcodex.app"),
    "https://api.soulcodex.app/api/auth/apple",
  );
  assert.equal(
    resolveApiUrlWithBase("/api/profiles", "https://api.soulcodex.app/"),
    "https://api.soulcodex.app/api/profiles",
  );
});

test("web fallback preserves same-origin API paths when no base is configured", () => {
  assert.equal(resolveApiUrlWithBase("/api/profiles/123", ""), "/api/profiles/123");
  assert.equal(resolveApiUrlWithBase("/api/profiles/123", undefined), "/api/profiles/123");
});

test("resolver never rewrites non-API application routes or absolute URLs", () => {
  assert.equal(resolveApiUrlWithBase("/settings", "https://api.soulcodex.app"), "/settings");
  assert.equal(
    resolveApiUrlWithBase("https://example.com/file.pdf", "https://api.soulcodex.app"),
    "https://example.com/file.pdf",
  );
});

test("active native server permits both Capacitor shell origins with credentialed CORS", () => {
  const server = readFileSync("server/index.ts", "utf8");
  assert.match(server, /"capacitor:\/\/localhost"/);
  assert.match(server, /"https:\/\/localhost"/);
  assert.match(server, /credentials:\s*true/);
});

test("production sessions use Secure SameSite=None cookies for native cross-origin API calls", () => {
  const session = readFileSync("server/session.ts", "utf8");
  assert.match(session, /secure:\s*isProduction/);
  assert.match(session, /sameSite:\s*isProduction\s*\?\s*"none"\s*:\s*"lax"/);
});

test("reachable compatibility and offline verification paths use the centralized API fetcher", () => {
  const compatibility = readFileSync("client/src/pages/CompatibilityExplorerPage.tsx", "utf8");
  const offline = readFileSync("client/src/pages/offline-profile.tsx", "utf8");
  assert.match(compatibility, /apiFetch\("\/api\/compatibility\/archetype-matches"/);
  assert.doesNotMatch(compatibility, /fetch\("\/api\//);
  assert.match(offline, /apiFetch\("\/api\/verification\/profile"/);
  assert.doesNotMatch(offline, /apiFetch\("\/api\/profiles"/);
  assert.doesNotMatch(offline, /fetch\("\/api\//);
});