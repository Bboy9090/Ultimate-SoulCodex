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


test("pre-paint native dialogs are suppressed and restored after React mounts", async () => {
  const [html, main] = await Promise.all([
    readFile("client/index.html", "utf8"),
    readFile("client/src/appEntry.tsx", "utf8"),
  ]);

  assert.match(html, /location\.protocol === "capacitor:"/);
  assert.match(html, /window\.alert = function \(\) \{\};/);
  assert.match(html, /window\.confirm = function \(\) \{ return false; \};/);
  assert.match(html, /window\.prompt = function \(\) \{ return null; \};/);
  assert.match(main, /window\.alert = nativeDialogs\.alert/);
  assert.match(main, /window\.confirm = nativeDialogs\.confirm/);
  assert.match(main, /window\.prompt = nativeDialogs\.prompt/);
});


test("tiny bootstrap dynamically loads the React application before the heavy graph", async () => {
  const source = await readFile("client/src/main.tsx", "utf8");
  assert.doesNotMatch(source, /from "react"/);
  assert.doesNotMatch(source, /from "\.\/App"/);
  assert.match(source, /import\("\.\/appEntry"\)/);
  assert.match(source, /soulcodexModule = "bootstrap"/);
  assert.match(source, /app-module-load/);
});

test("secondary routes are lazy so home first paint does not evaluate the whole product", async () => {
  const source = await readFile("client/src/App.tsx", "utf8");
  assert.match(source, /lazy\(\(\) => import\("\.\/pages\/offline-profile"\)\)/);
  assert.match(source, /lazy\(\(\) => import\("\.\/pages\/AstrologyAtlasPage"\)\)/);
  assert.match(source, /lazy\(\(\) => import\("\.\/pages\/CompatibilityRoute"\)\)/);
  assert.match(source, /<Suspense fallback=/);
});
