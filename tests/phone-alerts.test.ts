import assert from "node:assert/strict";
import test from "node:test";
import {
  PhoneAlertsError,
  disablePhoneAlerts,
  disablePhoneAlertsOnSignOut,
  enablePhoneAlerts,
  phoneAlertsView,
  refreshPhoneAlertToken,
  safeAlertRoute,
  type MessagingPlugin,
  type PhoneAlertsApi,
  type PhoneAlertsDeps,
} from "../client/src/lib/phoneAlerts";

function harness(options: { permission?: string; requestResult?: string; token?: string; registerError?: "unavailable" | "failed"; unregisterFails?: boolean; stored?: string | null } = {}) {
  const log: string[] = [];
  let stored: string | null = options.stored ?? null;
  const plugin: MessagingPlugin = {
    async checkPermissions() { log.push("check"); return { receive: options.permission ?? "prompt" }; },
    async requestPermissions() { log.push("request"); return { receive: options.requestResult ?? "granted" }; },
    async getToken() { log.push("getToken"); return { token: options.token ?? "tok-1" }; },
    async deleteToken() { log.push("deleteToken"); },
    async addListener() { return { remove: async () => undefined }; },
  };
  const api: PhoneAlertsApi = {
    async status() { return { available: true, registered: false, deviceCount: 0 }; },
    async register(platform, token) {
      log.push(`register:${platform}:${token}`);
      if (options.registerError) throw new PhoneAlertsError(options.registerError);
    },
    async unregister(token) { log.push(`unregister:${token}`); if (options.unregisterFails) throw new PhoneAlertsError("failed"); },
  };
  const deps: PhoneAlertsDeps = {
    platform: "ios", plugin, api,
    store: { get: () => stored, set: (id) => { stored = id; log.push(`store:${id}`); }, clear: () => { stored = null; log.push("clear"); } },
  };
  return { deps, log, stored: () => stored };
}

test("the card is hidden unless native, plugin-bearing and the server reports delivery available", () => {
  const base = { platform: "ios" as const, pluginPresent: true, serverAvailable: true, permission: "prompt", enabledForThisAccount: false };
  assert.deepEqual(phoneAlertsView(base), { kind: "off" });
  assert.deepEqual(phoneAlertsView({ ...base, enabledForThisAccount: true }), { kind: "on" });
  assert.deepEqual(phoneAlertsView({ ...base, permission: "denied" }), { kind: "blocked" });
  assert.deepEqual(phoneAlertsView({ ...base, platform: null }), { kind: "hidden" }, "web");
  assert.deepEqual(phoneAlertsView({ ...base, pluginPresent: false }), { kind: "hidden" }, "a build without the plugin");
  assert.deepEqual(phoneAlertsView({ ...base, serverAvailable: false }), { kind: "hidden" }, "server not configured");
});

test("enabling asks permission once, registers this device's token, and remembers the account", async () => {
  const h = harness();
  assert.deepEqual(await enablePhoneAlerts(h.deps, "user-1"), { status: "enabled" });
  assert.deepEqual(h.log, ["check", "request", "getToken", "register:ios:tok-1", "store:user-1"]);
  assert.equal(h.stored(), "user-1");

  const granted = harness({ permission: "granted" });
  await enablePhoneAlerts(granted.deps, "user-1");
  assert.ok(!granted.log.includes("request"), "no prompt when already granted");
});

test("denied permission, unconfigured server and failures never leave a half-enabled state", async () => {
  const denied = harness({ requestResult: "denied" });
  assert.deepEqual(await enablePhoneAlerts(denied.deps, "u"), { status: "denied" });
  assert.ok(!denied.log.some((line) => line.startsWith("register")) && denied.stored() === null);

  const unavailable = harness({ registerError: "unavailable" });
  assert.deepEqual(await enablePhoneAlerts(unavailable.deps, "u"), { status: "unavailable" });
  assert.equal(unavailable.stored(), null);

  const failed = harness({ registerError: "failed" });
  assert.deepEqual(await enablePhoneAlerts(failed.deps, "u"), { status: "failed" });
  assert.equal(failed.stored(), null);

  const noToken = harness({ token: "" });
  assert.deepEqual(await enablePhoneAlerts(noToken.deps, "u"), { status: "failed" });

  assert.deepEqual(await enablePhoneAlerts({ ...harness().deps, plugin: null }, "u"), { status: "unsupported" });
  assert.deepEqual(await enablePhoneAlerts({ ...harness().deps, platform: null }, "u"), { status: "unsupported" });
});

test("disabling removes only this device and always clears the local choice, even offline", async () => {
  const ok = harness({ stored: "user-1" });
  assert.deepEqual(await disablePhoneAlerts(ok.deps), { serverCleared: true });
  assert.deepEqual(ok.log, ["getToken", "unregister:tok-1", "deleteToken", "clear"]);
  assert.equal(ok.stored(), null);

  const offline = harness({ stored: "user-1", unregisterFails: true });
  assert.deepEqual(await disablePhoneAlerts(offline.deps), { serverCleared: false });
  assert.ok(offline.log.includes("deleteToken") && offline.stored() === null, "the OS token is deleted and the choice cleared anyway");
});

test("sign-out touches nothing unless this device opted in, and never throws", async () => {
  const never = harness({ stored: null });
  await disablePhoneAlertsOnSignOut(never.deps);
  assert.deepEqual(never.log, [], "no plugin calls for people who never enabled alerts");

  const opted = harness({ stored: "user-1" });
  await disablePhoneAlertsOnSignOut(opted.deps);
  assert.ok(opted.log.includes("unregister:tok-1") && opted.stored() === null);

  const broken = harness({ stored: "user-1" });
  broken.deps.plugin = { ...broken.deps.plugin!, getToken: async () => { throw new Error("native failure"); }, deleteToken: async () => { throw new Error("x"); } };
  await assert.doesNotReject(disablePhoneAlertsOnSignOut(broken.deps));
  assert.equal(broken.stored(), null);
});

test("launch refresh re-registers only for the account that opted in, never prompts", async () => {
  const same = harness({ stored: "user-1", permission: "granted", token: "rotated" });
  assert.equal(await refreshPhoneAlertToken(same.deps, "user-1"), "refreshed");
  assert.ok(same.log.includes("register:ios:rotated"));

  const other = harness({ stored: "user-1", permission: "granted" });
  assert.equal(await refreshPhoneAlertToken(other.deps, "user-2"), "skipped", "a different account on the same phone is not enrolled");
  assert.ok(!other.log.some((line) => line.startsWith("register")));

  const notEnabled = harness({ stored: null, permission: "granted" });
  assert.equal(await refreshPhoneAlertToken(notEnabled.deps, "user-1"), "skipped");

  const revoked = harness({ stored: "user-1", permission: "denied" });
  assert.equal(await refreshPhoneAlertToken(revoked.deps, "user-1"), "skipped");
  assert.ok(!revoked.log.includes("request"), "refresh never prompts");

  const unavailable = harness({ stored: "user-1", permission: "granted", registerError: "unavailable" });
  assert.equal(await refreshPhoneAlertToken(unavailable.deps, "user-1"), "failed");
  assert.equal(unavailable.stored(), null, "the choice is dropped when the server stops offering alerts");
});

test("a tapped alert can only open the Soul Circle page", () => {
  assert.equal(safeAlertRoute({ url: "/circle" }), "/circle");
  for (const bad of [undefined, null, {}, { url: "/settings" }, { url: "https://evil.example" }, { url: "//evil.example" }, { url: "/circle/../admin" }, "/circle"]) {
    assert.equal(safeAlertRoute(bad), null);
  }
});
