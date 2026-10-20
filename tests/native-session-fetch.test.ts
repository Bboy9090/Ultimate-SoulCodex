import assert from "node:assert/strict";
import test from "node:test";
import type { HttpOptions } from "@capacitor/core";
import { createSessionFetch } from "../client/src/lib/native-session-fetch";

const base = "https://api.example.test";

test("native login, account checks, verification, access and logout use the same transport", async () => {
  const requests: HttpOptions[] = [];
  let signedIn = false;
  const request = createSessionFetch({
    isIOS: () => true, apiBase: base,
    webFetch: async () => { throw new Error("Account request escaped to WebView fetch"); },
    nativeRequest: async (options) => {
      requests.push(options);
      const path = new URL(options.url).pathname;
      if (path === "/api/auth/apple") signedIn = true;
      if (path === "/api/auth/logout") signedIn = false;
      return {
        status: path === "/api/billing/native/verify" && !signedIn ? 401 : 200,
        data: path === "/api/auth/user" ? (signedIn ? { id: "user-a" } : null) : { verified: signedIn },
        headers: { "Content-Type": "application/json", "Set-Cookie": "connect.sid=test-only; HttpOnly; Secure" },
        url: options.url,
      };
    },
  });
  await request(`${base}/api/auth/apple`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identityToken: "test-only" }) });
  assert.deepEqual(await (await request(`${base}/api/auth/user`, { cache: "no-store" })).json(), { id: "user-a" });
  const verified = await request(`${base}/api/billing/native/verify`, { method: "POST", headers: { "Content-Type": "application/json", "X-SoulCodex-Billing-Qualification": "1", Cookie: "must-not-forward" }, body: JSON.stringify({ productId: "test-product" }) });
  assert.equal(verified.status, 200);
  assert.equal(verified.headers.has("Set-Cookie"), false);
  await request(`${base}/api/access`);
  await request(`${base}/api/auth/logout`, { method: "POST" });
  assert.equal((await request(`${base}/api/billing/native/verify`)).status, 401);
  assert.equal(requests.length, 6);
  assert.equal(new Headers(requests[2].headers).get("X-SoulCodex-Billing-Qualification"), "1");
  assert.equal(new Headers(requests[1].headers).get("Cache-Control"), "no-store");
  assert.deepEqual(requests[0].data, { identityToken: "test-only" });
  for (const options of requests) {
    assert.equal(new Headers(options.headers).get("Origin"), "capacitor://localhost");
    assert.equal(new Headers(options.headers).has("Cookie"), false);
    assert.equal(options.disableRedirects, true);
  }
});

test("web, non-account and foreign-origin requests retain browser transport", async () => {
  const calls: string[] = [];
  const options = { apiBase: base, nativeRequest: async () => { throw new Error("Unexpected native request"); }, webFetch: async (url: any) => { calls.push(url); return new Response("ok"); } };
  await createSessionFetch({ ...options, isIOS: () => false })(`${base}/api/auth/user`);
  const ios = createSessionFetch({ ...options, isIOS: () => true });
  await ios(`${base}/api/pdf/profile/example`);
  await ios("https://foreign.example.test/api/auth/apple");
  assert.equal(calls.length, 3);
});

test("native account transport refuses insecure endpoints and unsupported bodies", async () => {
  let dispatched = false;
  const options = { isIOS: () => true, apiBase: "http://api.example.test", nativeRequest: async () => { dispatched = true; throw new Error("dispatched"); }, webFetch: fetch };
  await assert.rejects(createSessionFetch(options)("http://api.example.test/api/auth/user"), /HTTPS/);
  const request = createSessionFetch({ ...options, apiBase: base });
  await assert.rejects(request(`${base}/api/auth/apple`, { method: "POST", body: new FormData() }), /JSON body/);
  await assert.rejects(request(`${base}/api/auth/user`, { credentials: "omit" }), /session/);
  assert.equal(dispatched, false);
});

test("expired sessions retain 401 status and error code for recovery", async () => {
  const request = createSessionFetch({ isIOS: () => true, apiBase: base, webFetch: fetch, nativeRequest: async (o) => ({ status: 401, data: { code: "authentication_required" }, headers: { "Content-Type": "application/json" }, url: o.url }) });
  const response = await request(`${base}/api/billing/native/verify`);
  assert.equal(response.ok, false);
  assert.deepEqual(await response.json(), { code: "authentication_required" });
});

test("logout no-content remains valid and aborted calls do not dispatch", async () => {
  let calls = 0;
  const request = createSessionFetch({ isIOS: () => true, apiBase: base, webFetch: fetch, nativeRequest: async (o) => { calls++; return { status: 204, data: "", headers: {}, url: o.url }; } });
  assert.equal((await request(`${base}/api/auth/logout`, { method: "POST" })).status, 204);
  await assert.rejects(request(`${base}/api/auth/user`, { signal: AbortSignal.abort() }), /abort/i);
  assert.equal(calls, 1);
});
