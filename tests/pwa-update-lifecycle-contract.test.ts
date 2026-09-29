import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const generatorUrl = new URL("../scripts/generate-pwa-service-worker.mjs", import.meta.url);
const registrationUrl = new URL("../client/src/lib/registerServiceWorker.ts", import.meta.url);

test("service worker update lifecycle avoids forced mid-session takeover", async () => {
  const [generator, registration] = await Promise.all([
    readFile(generatorUrl, "utf8"),
    readFile(registrationUrl, "utf8"),
  ]);

  assert.doesNotMatch(generator, /cache\.addAll\(PRECACHE_URLS\)[\s\S]*?self\.skipWaiting\(\)/);
  assert.match(generator, /const previousShell = shellKeys\.filter\(\(key\) => key !== CACHE_NAME\)\.slice\(-1\)/);
  assert.match(generator, /const keep = new Set\(\[CACHE_NAME, \.\.\.previousShell\]\)/);
  assert.match(generator, /if \(event\.data\?\.type === "SKIP_WAITING"\) self\.skipWaiting\(\)/);

  assert.match(registration, /registration\.waiting\?\.postMessage\(\{ type: "SKIP_WAITING" \}\)/);
  assert.match(registration, /document\.visibilityState === "hidden"/);
  assert.match(registration, /registration\.addEventListener\("updatefound"/);
  assert.match(registration, /installing\.state !== "installed"/);
});

test("native shells continue to remove browser service-worker residue", async () => {
  const registration = await readFile(registrationUrl, "utf8");
  assert.match(registration, /Capacitor\.isNativePlatform\(\)/);
  assert.match(registration, /registration\.unregister\(\)/);
  assert.match(registration, /key\.startsWith\("soulcodex-shell-"\)/);
});
