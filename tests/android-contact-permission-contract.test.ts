import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const picker = readFileSync(new URL("../client/src/lib/deviceContactPicker.ts", import.meta.url), "utf8");
const manifest = readFileSync(new URL("../android/app/src/main/AndroidManifest.xml", import.meta.url), "utf8");

test("Android contact import fails closed to manual entry before invoking native contacts", () => {
  assert.match(picker, /const platform = Capacitor\.getPlatform\(\)/);
  assert.match(picker, /platform === "android"[\s\S]*status: "unsupported"[\s\S]*platform === "ios"[\s\S]*Contacts\.pickContact\(\)/);
});

test("merged Android manifest explicitly removes broad contacts permissions", () => {
  assert.match(manifest, /android\.permission\.READ_CONTACTS" tools:node="remove"/);
  assert.match(manifest, /android\.permission\.WRITE_CONTACTS" tools:node="remove"/);
});
