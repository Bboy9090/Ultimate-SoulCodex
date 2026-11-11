import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { evaluateRuntimeParity, inspectPublicRuntime } from "../scripts/audit-public-runtime-parity.mjs";

const SHA = "d8c8fd6487f89ad23618faa101df3d1138a83947";
const OLD_SHA = "337f53abb1a9a1942a50b831a5b0a23c1f9e4c26";
const health = {
  status: "ok",
  appVersion: "4.1.0",
  releaseSha: SHA,
  apiContract: "foundation-v4",
  persistence: { mode: "postgres", durable: true, durableFeaturesAvailable: true },
};
const ready = {
  status: "ready",
  appVersion: "4.1.0",
  releaseSha: SHA,
  apiContract: "foundation-v4",
  persistence: { ready: true, mode: "postgres" },
};
const evalWith = (options = {}) => evaluateRuntimeParity({
  expectedSha: SHA, health, ready, healthHttpStatus: 200, readyHttpStatus: 200, ...options,
});

test("a verified public source and readiness pair is current, but never store-qualified", () => {
  const result = evalWith();
  assert.equal(result.status, "CURRENT_READY");
  assert.equal(result.observedSha, SHA);
  assert.equal(result.railwayServiceIdentityQualified, false);
  assert.equal(result.appStoreBinaryQualified, false);
});

test("stale but healthy public runtime is not current release", () => {
  const result = evalWith({ expectedSha: OLD_SHA });
  assert.equal(result.status, "STALE_READY");
  assert.equal(result.observedSha, SHA);
  assert.equal(result.expectedSha, OLD_SHA);
});

test("invalid expected source SHA is incomplete, never inferred current", () => {
  for (const expectedSha of ["", "unknown", "d8c8fd64", null]) {
    assert.equal(evalWith({ expectedSha }).status, "INCOMPLETE");
  }
});

test("invalid public response or non-durable storage prevents a current verdict", () => {
  const cases = [
    { healthHttpStatus: 503 },
    { readyHttpStatus: 503 },
    { health: { ...health, releaseSha: "unknown" } },
    { health: { ...health, apiContract: "other" } },
    { health: { ...health, persistence: { mode: "memory", durable: false } } },
    { ready: { ...ready, releaseSha: OLD_SHA } },
    { ready: { ...ready, persistence: { ready: false } } },
    { health: null },
    { ready: null },
  ];
  for (const item of cases) {
    assert.equal(evalWith(item).status, "INCOMPLETE", JSON.stringify(item));
  }
});

test("public inspector accepts only JSON and preserves both exact endpoint URLs", async () => {
  const calls = [];
  const result = await inspectPublicRuntime(SHA, async (url, options) => {
    calls.push({ url, options });
    const payload = url.endsWith("/health") ? health : ready;
    return new Response(JSON.stringify(payload), { status: 200, headers: { "Content-Type": "application/json" } });
  });
  assert.equal(result.status, "CURRENT_READY");
  assert.equal(result.publicBase, "https://soulcodex.up.railway.app");
  assert.deepEqual(calls.map((x) => x.url).sort(), [
    "https://soulcodex.up.railway.app/health",
    "https://soulcodex.up.railway.app/ready",
  ]);
  assert.ok(calls.every((x) => x.options.redirect === "error"));
});

test("HTML SPA fallback, network errors, redirects, and malformed JSON never qualify", async () => {
  const cases = [
    async () => new Response("<html>app</html>", { status: 200, headers: { "content-type": "text/html" } }),
    async () => { throw Error("offline"); },
    async () => new Response("broken JSON", { status: 200, headers: { "content-type": "application/json" } }),
  ];
  for (const fetchImpl of cases) {
    const result = await inspectPublicRuntime(SHA, fetchImpl);
    assert.equal(result.status, "INCOMPLETE");
    assert.equal(result.observedSha, null);
  }
});

test("the scheduled workflow is read-only and does not fetch live websites in a PR", () => {
  const workflow = readFileSync(new URL("../.github/workflows/public-runtime-parity.yml", import.meta.url), "utf8");
  assert.ok(workflow.includes('cron: "37 15 * * 1"'));
  assert.ok(workflow.includes("workflow_dispatch:"));
  assert.ok(workflow.includes("permissions:\n  contents: read"));
  assert.ok(workflow.includes("if: github.event_name != 'pull_request'"));
  assert.ok(workflow.includes("retention-days: 30"));
  for (const forbidden of ["id-token: write", "deploy", "railway up", "AWS_ACCESS_KEY_ID"]) {
    assert.equal(workflow.includes(forbidden), false, forbidden);
  }
});
