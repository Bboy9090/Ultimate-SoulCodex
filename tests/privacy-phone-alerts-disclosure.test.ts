import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const copies: Array<[string, string]> = [
  ["in-app policy", readFileSync(new URL("../client/src/pages/PrivacyPage.tsx", import.meta.url), "utf8")],
  ["hosted policy", readFileSync(new URL("../legal/privacy/index.html", import.meta.url), "utf8")],
];

for (const [label, text] of copies) {
  test(`${label} discloses Soul Circle and phone-alert data before it ships`, () => {
    assert.match(text, /Soul Circle/);
    assert.match(text, /push token/);
    assert.match(text, /Firebase Cloud Messaging/);
    assert.match(text, /does not enable Firebase Analytics/);
    assert.match(text, /180 days/);
    assert.match(text, /never includes a name, sign, or chart detail/);
    assert.match(text, /deleting your account removes this device’s push token|Deleting your account deletes your Soul Circle/);
    assert.match(text, /November 21, 2026/);
  });
}
