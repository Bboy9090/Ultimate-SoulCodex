import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const profileUrl = new URL("../client/src/pages/offline-profile.tsx", import.meta.url);

test("profile Human Design summary stays compact and defers bodygraph detail", async () => {
  const source = await readFile(profileUrl, "utf8");
  assert.match(source, /Decision architecture snapshot/);
  assert.match(source, /Open the bodygraph below for definition, centers, channels, gates, and activation detail/);
  assert.match(source, /["Type", verifiedHumanDesign\.type]/);
  assert.match(source, /["Strategy", verifiedHumanDesign\.strategy]/);
  assert.match(source, /["Authority", verifiedHumanDesign\.authority]/);
  assert.match(source, /["Profile", verifiedHumanDesign\.profile]/);
  assert.doesNotMatch(source, /Definition &amp; centers/);
  assert.doesNotMatch(source, /Channels &amp; gates/);
  assert.doesNotMatch(source, /humanDesignListLabel/);
});

test("detailed Human Design evidence remains available through the bodygraph", async () => {
  const source = await readFile(profileUrl, "utf8");
  assert.match(source, /<HumanDesignBodygraph data=\{verifiedHumanDesign as Record<string, any>\} \/>/);
  assert.match(source, /DeepChartFallback label="Human Design bodygraph"/);
});
