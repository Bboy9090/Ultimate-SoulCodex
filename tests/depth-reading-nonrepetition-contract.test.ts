import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourceUrl = new URL("../client/src/lib/depthEngine.ts", import.meta.url);

test("depth chapters do not repeat their observation as the first translation sentence", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.doesNotMatch(source, /translation:\s*`\$\{model\.visiblePattern\}/);
  assert.doesNotMatch(source, /translation:\s*`\$\{model\.protectiveFunction\}/);
  assert.doesNotMatch(source, /translation:\s*`\$\{model\.gift\}/);
  assert.doesNotMatch(source, /translation:\s*`\$\{model\.cost\}/);
  assert.doesNotMatch(source, /translation:\s*`\$\{model\.relationshipImpact\}/);
});

test("depth chapters do not reopen strength and cost blocks with the full supplied sentence", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.doesNotMatch(source, /strength:\s*`\$\{model\.gift\}/);
  assert.doesNotMatch(source, /cost:\s*`\$\{model\.cost\}/);
});
