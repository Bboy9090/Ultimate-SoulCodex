import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const profileUrl = new URL("../client/src/pages/offline-profile.tsx", import.meta.url);

test("profile Human Design summary stays compact and defers bodygraph detail", async () => {
  const source = await readFile(profileUrl, "utf8");
  assert.match(source, /Decision architecture snapshot/);
  assert.match(source, /Definition, Centers, Channels, Gates, and activation detail are intentionally withheld/);
  assert.match(source, /["Type", verifiedHumanDesign\.type]/);
  assert.match(source, /["Strategy", verifiedHumanDesign\.strategy]/);
  assert.match(source, /["Authority", verifiedHumanDesign\.authority]/);
  assert.match(source, /["Profile", verifiedHumanDesign\.profile]/);
  assert.doesNotMatch(source, /Definition &amp; centers/);
  assert.doesNotMatch(source, /Channels &amp; gates/);
  assert.doesNotMatch(source, /humanDesignListLabel/);
});

test("unqualified Human Design bodygraph detail remains withheld", async () => {
  const source = await readFile(profileUrl, "utf8");
  assert.doesNotMatch(source, /<HumanDesignBodygraph/);
  assert.doesNotMatch(source, /DeepChartFallback label="Human Design bodygraph"/);
  assert.match(source, /human-design-bodygraph-deferred/);
});
