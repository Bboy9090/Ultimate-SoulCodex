import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourceUrl = new URL("../client/src/components/ClarityReadingExperience.tsx", import.meta.url);

test("standard reading is flat by default with one optional plain-language drawer", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.doesNotMatch(source, /Open chapter detail/);
  assert.doesNotMatch(source, /Open deep chapter/);
  assert.doesNotMatch(source, /expandedChapters/);
  assert.match(source, /One grounded move/);
  assert.match(source, /Plain language and real-life examples/);
  assert.match(source, /<details className="group relative mt-4/);
});

test("deep reading adds substantive layers inline without a second chapter gate", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, /showDeep && \(/);
  assert.match(source, /How other people may experience it/);
  assert.match(source, /What changes under stress/);
  assert.match(source, /Reflection check/);
  assert.doesNotMatch(source, /aria-expanded=\{expanded\}/);
});

test("evidence is decoupled from primary prose into one global trace drawer", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, />Evidence Trace</);
  assert.match(source, />View Evidence Trace</);
  assert.match(source, /model\.signals/);
  assert.match(source, /model\.limitations/);
});

test("flattened reading preserves all substantive chapter layers", async () => {
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
