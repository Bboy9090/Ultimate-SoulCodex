import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const bodygraphUrl = new URL("../client/src/components/HumanDesignBodygraph.tsx", import.meta.url);
const displayDataUrl = new URL("../packages/astrology/human-design-display-data.ts", import.meta.url);

test("Human Design bodygraph imports display metadata without calculation dependencies", async () => {
  const [bodygraph, displayData] = await Promise.all([
    readFile(bodygraphUrl, "utf8"),
    readFile(displayDataUrl, "utf8"),
  ]);

  assert.match(bodygraph, /@soulcodex\/astrology\/human-design-display-data/);
  assert.doesNotMatch(bodygraph, /from "@soulcodex\/astrology"/);

  assert.match(displayData, /export const HD_GATES/);
  assert.match(displayData, /export const HD_CENTERS/);
  assert.doesNotMatch(displayData, /from\s+["']astronomy-engine["']/);
  assert.doesNotMatch(displayData, /from\s+["']date-fns-tz["']/);
  assert.doesNotMatch(displayData, /from\s+["']geo-tz["']/);
  assert.doesNotMatch(displayData, /import\s+\{[^}]*createEvidenceEntry[^}]*\}/);
});
