import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const deletionUrl = new URL("../client/src/pages/AccountDeletionPage.tsx", import.meta.url);

test("account deletion does not claim full completion when local cleanup fails", async () => {
  const source = await readFile(deletionUrl, "utf8");

  assert.match(source, /serverDeleted/);
  assert.match(source, /setServerDeleted\(true\)/);
  assert.match(source, /clearThisDeviceAfterDeletion/);
  assert.match(source, /server-backed account was deleted, but this device could not finish clearing/);
  assert.match(source, /if \(!localCleared\)/);
  assert.match(source, /Retry Clearing This Device/);
  assert.match(source, /caches\.keys\(\)/);
  assert.match(source, /window\.location\.replace\("\/\?accountDeleted=1"\)/);
});
