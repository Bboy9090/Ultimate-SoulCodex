import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appEntry = new URL("../client/src/appEntry.tsx", import.meta.url);
const capacitor = new URL("../capacitor.config.ts", import.meta.url);
const indexHtml = new URL("../client/index.html", import.meta.url);
const compatibility = new URL("../client/src/pages/CompatibilityExplorerPage.tsx", import.meta.url);

test("native and web bootstrap use the same base surface", async () => {
  const [nativeConfig, html] = await Promise.all([
    readFile(capacitor, "utf8"),
    readFile(indexHtml, "utf8"),
  ]);
  assert.match(nativeConfig, /backgroundColor:\s*"#07060B"/);
  assert.match(html, /theme-color" content="#07060B"/);
});

test("foreground resume requests a visible paint without reloading profile data", async () => {
  const source = await readFile(appEntry, "utf8");
  assert.match(source, /visibilitychange/);
  assert.match(source, /pageshow/);
  assert.match(source, /requestAnimationFrame/);
  assert.doesNotMatch(source, /location\.reload|window\.location\.reload/);
});

test("compatibility headlines qualitative symbolic bands and keeps exact values inspectable", async () => {
  const source = await readFile(compatibility, "utf8");
  assert.match(source, /function symbolicBand/);
  assert.match(source, /Inspect exact symbolic model values/);
  assert.match(source, /not percentages, probabilities, or measured relationship outcomes/);
  assert.doesNotMatch(source, />symbolic score</);
});
