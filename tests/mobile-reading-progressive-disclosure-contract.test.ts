import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourceUrl = new URL("../client/src/components/ClarityReadingExperience.tsx", import.meta.url);

test("standard and deep reading chapters use per-chapter progressive disclosure", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, /expandedChapters/);
  assert.match(source, /Open chapter detail/);
  assert.match(source, /Open deep chapter/);
  assert.match(source, /aria-expanded=\{expanded\}/);
  assert.match(source, /showStandard && expanded/);
  assert.match(source, /showDeep && expanded/);
});

test("chapter depth remains collapsed by default and quick mode stays compact", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, /useState<Set<string>>\(\(\) => new Set\(\)\)/);
  assert.match(source, /nextDepth === "quick"\) setExpandedChapters\(new Set\(\)\)/);
  assert.doesNotMatch(source, /new Set\(chapters\.map/);
});

test("progressive disclosure preserves all substantive chapter layers", async () => {
  const source = await readFile(sourceUrl, "utf8");
  for (const field of [
    "chapter.translation",
    "chapter.dailyLife",
    "chapter.strength",
    "chapter.cost",
    "chapter.misunderstanding",
    "chapter.relationshipView",
    "chapter.stressView",
    "chapter.practicalTakeaway",
    "chapter.reflection",
    "chapter.action",
  ]) {
    assert.match(source, new RegExp(field.replace(".", "\\.")));
  }
});
