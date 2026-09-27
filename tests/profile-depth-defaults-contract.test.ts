import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const profileUrl = new URL("../client/src/pages/offline-profile.tsx", import.meta.url);

test("profile depth guide does not force deeper groups open on first paint", async () => {
  const source = await readFile(profileUrl, "utf8");
  assert.match(source, /<DepthSoulGuide interpretation=\{profile\.depthInterpretation\} \/>/);
  assert.doesNotMatch(source, /defaultOpenGroupIds=/);
});

const natalChartUrl = new URL("../client/src/components/VerifiedNatalChart.tsx", import.meta.url);

test("verified natal interpretation detail stays collapsed on first paint", async () => {
  const source = await readFile(natalChartUrl, "utf8");
  assert.match(source, /Placement meanings · planet \+ sign \+ house/);
  assert.doesNotMatch(source, /<details\s+open[^>]*>[\s\S]*?Placement meanings · planet \+ sign \+ house/);
});
