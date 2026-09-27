import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourceUrl = new URL("../client/src/components/HumanDesignBodygraph.tsx", import.meta.url);

test("verified Human Design long inventories are collapsed by default", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, />Defined channels<\/summary>/);
  assert.match(source, />Activated gates · names, centers, and keywords<\/summary>/);
  assert.doesNotMatch(source, /<details open[^>]*>\s*<summary[^>]*>Defined channels<\/summary>/s);
  assert.doesNotMatch(source, /<details open[^>]*>\s*<summary[^>]*>Activated gates · names, centers, and keywords<\/summary>/s);
});

test("Human Design evidence remains inspectable after disclosure cleanup", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, /Conscious and unconscious activations/);
  assert.match(source, /What each center represents/);
  assert.match(source, /humanDesignChannelLabel/);
  assert.match(source, /gateMeta/);
});
