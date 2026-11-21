import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Android bundles the Firebase Messaging plugin; iOS explicitly does not yet", () => {
  assert.match(read("android/app/capacitor.build.gradle"), /implementation project\(':capacitor-firebase-messaging'\)/);
  assert.match(read("android/capacitor.settings.gradle"), /@capacitor-firebase\/messaging\/android/);

  const config = read("capacitor.config.ts");
  const iosBlock = config.slice(config.indexOf("ios: {"), config.indexOf("plugins: {")).replace(/\/\/.*$/gm, "");
  assert.match(iosBlock, /includePlugins:/, "iOS must pin its plugin list so `cap sync` in Xcode Cloud cannot pull in new plugins");
  assert.ok(!iosBlock.includes("@capacitor-firebase/messaging"), "iOS push is not integrated yet");
  for (const plugin of ["@capacitor/contacts", "@capacitor/keyboard", "@capacitor/splash-screen", "@capacitor/status-bar", "@capawesome/capacitor-apple-sign-in"]) {
    assert.ok(iosBlock.includes(`"${plugin}"`), `iOS must keep ${plugin}`);
  }
  assert.ok(!read("ios/App/CapApp-SPM/Package.swift").includes("irebase"), "no Firebase in the iOS package graph until it is built on a Mac");
});

test("the JavaScript lane talks to the plugin's real registered name and methods", () => {
  const lane = read("client/src/lib/phoneAlerts.ts");
  assert.match(lane, /isPluginAvailable\("FirebaseMessaging"\)/);
  assert.match(lane, /registerPlugin<MessagingPlugin>\("FirebaseMessaging"\)/);
  const definitions = readFileSync(new URL("../node_modules/@capacitor-firebase/messaging/dist/esm/definitions.d.ts", import.meta.url), "utf8");
  for (const method of ["checkPermissions", "requestPermissions", "getToken", "deleteToken", "notificationActionPerformed"]) {
    assert.ok(definitions.includes(method), `plugin must expose ${method}`);
  }
});

test("Firebase client config comes from CI secrets only and is never committed or printed", () => {
  const gitignore = read(".gitignore");
  assert.match(gitignore, /^android\/app\/google-services\.json$/m);
  assert.match(gitignore, /^ios\/App\/App\/GoogleService-Info\.plist$/m);

  const workflow = read(".github/workflows/store-4.0.0-release.yml");
  const step = workflow.slice(workflow.indexOf("Install Firebase Android config (optional)"), workflow.indexOf("Detect Android signing credentials"));
  assert.match(step, /secrets\.ANDROID_GOOGLE_SERVICES_JSON/);
  assert.match(step, /package soulcodex\.app/, "wrong-app config must fail the build");
  assert.match(step, /exit 0/, "a build without the secret must still succeed (alerts simply unavailable)");
  assert.ok(!/echo[^\n]*\$ANDROID_GOOGLE_SERVICES_JSON|cat android\/app\/google-services\.json/.test(step), "the config must never be printed");
});

test("Firebase stays dormant on Android until the person opts in", () => {
  const manifest = read("android/app/src/main/AndroidManifest.xml");
  assert.match(manifest, /firebase_messaging_auto_init_enabled" android:value="false"/);
  assert.match(manifest, /firebase_analytics_collection_enabled" android:value="false"/);
  // The only code path that turns auto-init on is the plugin's getToken(), which the app calls
  // only from the explicit opt-in and the opted-in launch refresh.
  const lane = read("client/src/lib/phoneAlerts.ts");
  assert.equal((lane.match(/getToken\(\)/g) ?? []).length >= 3, true);
  assert.match(lane, /if \(deps\.store\.get\(\) !== userId\) return "skipped"/, "launch refresh never runs for a device that has not opted in");
});
