import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const formUrl = new URL("../client/src/pages/local-first-input-form.tsx", import.meta.url);

test("local-first creation distinguishes completed verification from deferred failure", async () => {
  const source = await readFile(formUrl, "utf8");

  assert.match(source, /Promise<boolean>/);
  assert.match(source, /!navigator\.onLine\) return false/);
  assert.match(source, /return !profileNeedsOnlineVerification\(hydrated\);/);
  assert.match(source, /currentActive\?\.id === localProfile\.id/);
  assert.match(source, /return false;/);
  assert.match(source, /verificationCompleted = await requestVerificationWhenOnline/);
  assert.match(source, /online verification request completed/);
  assert.match(source, /online verification did not complete/);
  assert.match(source, /Nothing was guessed or promoted/);
});
