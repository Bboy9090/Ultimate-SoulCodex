import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";

const provider = fs.readFileSync("server/astro/providers/localProvider.ts", "utf8");
const productionEntry = fs.readFileSync("server/index.ts", "utf8");

test("local astrology provider delegates to governed production candidates", () => {
  assert.match(provider, /services\/astrology-production/);
  assert.doesNotMatch(provider, /\.\.\/\.\.\/\.\.\/services\/astrology/);
  assert.doesNotMatch(provider, /estimateTimezoneFromCoordinates/);
  assert.doesNotMatch(provider, /fromZonedTime/);
  assert.doesNotMatch(provider, /calculateChironPosition/);
  assert.doesNotMatch(provider, /latitude[^\n]*\?\?\s*0|longitude[^\n]*\?\?\s*0/);
});

test("production server enters through governed server routes, not legacy root routes", () => {
  assert.match(productionEntry, /from "\.\/routes\.js"/);
  assert.doesNotMatch(productionEntry, /from "\.\.\/routes/);
});
