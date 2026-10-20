import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const panel = readFileSync("client/src/components/SoulCodexPlusBillingPanel.tsx", "utf8");
const signin = readFileSync("client/src/components/AppleSignInButton.tsx", "utf8");
const native = readFileSync("client/src/lib/nativeBilling.ts", "utf8");

test("iOS account requests bypass CapacitorHttp cookie rewriting and register the Foundation transport", () => {
  const query = readFileSync("client/src/lib/queryClient.ts", "utf8");
  const bridge = readFileSync("ios/App/App/SoulCodexBridgeViewController.swift", "utf8");
  const policy = readFileSync("ios/App/App/SoulCodexSessionPolicy.swift", "utf8");
  const plugin = readFileSync("ios/App/App/SoulCodexSessionHTTPPlugin.swift", "utf8");
  assert.match(query, /nativeRequest: \(options\) => nativeSessionHTTP.request\(options\)/);
  assert.doesNotMatch(query, /CapacitorHttp.request/);
  assert.match(bridge, /registerPluginInstance\(SoulCodexSessionHTTPPlugin\(\)\)/);
  assert.match(policy, /HTTPCookie.cookies\(withResponseHeaderFields: headers, for: url\)/);
  assert.match(plugin, /configuration.httpCookieStorage = HTTPCookieStorage.shared/);
  assert.match(plugin, /cookieStore.delete\(cookie\)/);
  assert.match(plugin, /completionHandler\(nil\)/);
});

test("purchase and restore recheck the server account before invoking StoreKit", () => {
  assert.match(panel, /await requireNativeBillingSession\(currentUser.id\);\s*const evidence = await purchaseNativeProduct/);
  assert.match(panel, /await requireNativeBillingSession\(currentUser.id\);\s*const evidenceList = await restoreNativePurchases/);
  assert.match(native, /apiFetch\("\/api\/auth\/user", \{ cache: "no-store" \}\)/);
  assert.match(native, /user.id !== expectedUserId/);
});

test("Apple sign-in confirms a session before caching the connected account", () => {
  const check = signin.indexOf('apiFetch("/api/auth/user"');
  const cache = signin.indexOf('queryClient.setQueryData(["/api/user"], loginData.user)');
  assert.ok(check > 0 && cache > check);
  assert.match(signin, /sessionUser.id !== loginData.user\?\.id/);
});

test("authentication failure offers reconnection and preserves finish-after-verification", () => {
  assert.match(panel, /Reconnect Apple account to restore/);
  assert.match(panel, /You do not need to buy again/);
  assert.match(panel, /<AppleSignInButton/);
  assert.match(panel, /handleNativeFailure\(error\)/);
  const verify = panel.slice(panel.indexOf("const verifyNativeEvidence"), panel.indexOf("useEffect", panel.indexOf("const verifyNativeEvidence")));
  assert.ok(verify.indexOf("await verifyNativeBillingEvidence") < verify.indexOf("await finishNativeTransaction"));
});
