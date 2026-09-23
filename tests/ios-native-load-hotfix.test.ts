import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("native store builds cannot register the browser PWA service worker", async () => {
  const source = await readFile("client/src/lib/registerServiceWorker.ts", "utf8");
  const nativeGuard = source.indexOf("Capacitor.isNativePlatform()");
  const registerCall = source.indexOf("navigator.serviceWorker\n      .register");

  assert.ok(nativeGuard >= 0, "native platform guard is missing");
  assert.ok(registerCall > nativeGuard, "service worker register path must occur after the native early-return guard");
  assert.match(source, /getRegistrations\(\)/);
  assert.match(source, /registration\.unregister\(\)/);
  assert.match(source, /key\.startsWith\("soulcodex-shell-"\)/);
  assert.match(source, /return;\s*}\s*\n\s*if \(!\("serviceWorker" in navigator\)\)/);
});

test("iOS hotfix metadata is a fresh App Store version/build", async () => {
  const [plist, project] = await Promise.all([
    readFile("ios/App/App/Info.plist", "utf8"),
    readFile("ios/App/App.xcodeproj/project.pbxproj", "utf8"),
  ]);

  assert.match(plist, /<key>CFBundleShortVersionString<\/key>\s*<string>4\.0\.2<\/string>/);
  assert.match(plist, /<key>CFBundleVersion<\/key>\s*<string>4000009<\/string>/);
  assert.match(project, /MARKETING_VERSION = 4\.0\.2;/);
  assert.match(project, /CURRENT_PROJECT_VERSION = 4000009;/);
  assert.match(project, /PRODUCT_BUNDLE_IDENTIFIER = app\.soulcodex\.ios;/);
});
