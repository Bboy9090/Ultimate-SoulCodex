import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const connectionsUrl = new URL("../client/src/pages/ConnectionsPage.tsx", import.meta.url);
const pickerUrl = new URL("../client/src/lib/deviceContactPicker.ts", import.meta.url);
const sharedPageUrl = new URL("../client/src/pages/PublicSharedProfilePage.tsx", import.meta.url);
const shareModalUrl = new URL("../client/src/components/ShareModal.tsx", import.meta.url);
const privacyUrl = new URL("../client/src/pages/PrivacyPage.tsx", import.meta.url);

test("Connections uses explicit multi-contact selection and local-only storage", async () => {
  const [source, picker] = await Promise.all([readFile(connectionsUrl, "utf8"), readFile(pickerUrl, "utf8")]);
  assert.match(picker, /Contacts\.pickContact\(\)/);
  assert.match(picker, /\["name", "tel", "email"\]/);
  assert.match(picker, /multiple: true/);
  assert.doesNotMatch(picker, /Contacts\.find\(/);
  assert.doesNotMatch(picker, /Contacts\.save\(|Contacts\.remove\(/);
  assert.match(source, /saveImportedContacts/);
  assert.match(source, /Contacts stay on this device/);
  assert.match(source, /not uploaded for account matching/);
  assert.doesNotMatch(source, /joined Soul Codex|verified friend/i);
});

test("saved contacts expose reviewed SMS email and native-share invitation paths", async () => {
  const source = await readFile(connectionsUrl, "utf8");
  assert.match(source, /buildSoulCodexInvite/);
  assert.match(source, /Text invite/);
  assert.match(source, /Email invite/);
  assert.match(source, /navigator\.share/);
  assert.match(source, /navigator\.clipboard\.writeText/);
  assert.match(source, /Chart not shared yet/);
});

test("consented comparison-chart shares can be saved locally and opened in comparison", async () => {
  const [sharedPage, modal] = await Promise.all([
    readFile(sharedPageUrl, "utf8"),
    readFile(shareModalUrl, "utf8"),
  ]);
  assert.match(modal, /Verified comparison chart/);
  assert.match(modal, /exact degrees/);
  assert.match(sharedPage, /Shared for comparison/);
  assert.match(sharedPage, /Save to Connections/);
  assert.match(sharedPage, /Compare our charts/);
  assert.match(sharedPage, /sanitizeConnectionPlacements/);
});

test("privacy disclosure distinguishes local contact selection from public chart sharing", async () => {
  const source = await readFile(privacyUrl, "utf8");
  assert.match(source, /device contact picker/);
  assert.match(source, /does not upload the address book/);
  assert.match(source, /Verified comparison chart/);
  assert.match(source, /does not send that message automatically/);
});
