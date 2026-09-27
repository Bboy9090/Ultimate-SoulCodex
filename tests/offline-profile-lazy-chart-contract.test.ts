import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const profileUrl = new URL("../client/src/pages/offline-profile.tsx", import.meta.url);

test("deep verified chart visualizations stay out of offline-profile first paint", async () => {
  const source = await readFile(profileUrl, "utf8");

  assert.doesNotMatch(source, /import HumanDesignBodygraph from/);
  assert.doesNotMatch(source, /import VerifiedNatalChart from/);
  assert.match(source, /lazy\(\(\) => import\("@\/components\/HumanDesignBodygraph"\)\)/);
  assert.match(source, /lazy\(\(\) => import\("@\/components\/VerifiedNatalChart"\)\)/);
  assert.match(source, /<Suspense fallback=\{<DeepChartFallback label="Human Design bodygraph" \/>\}>/);
  assert.match(source, /<Suspense fallback=\{<DeepChartFallback label="verified natal wheel" \/>\}>/);
});
