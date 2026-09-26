import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const validatorPath = new URL(
  "../packages/core/src/soul-codex/reading-validator.ts",
  import.meta.url,
);

test("reading quality gate permits calibrated symbolic language", async () => {
  const source = await readFile(validatorPath, "utf8");

  assert.doesNotMatch(source, /\/may feel\/i/);
  assert.doesNotMatch(source, /\/might experience\/i/);
  assert.doesNotMatch(source, /\/possibly\/i/);
  assert.doesNotMatch(source, /\/perhaps\/i/);

  assert.match(source, /trust the process/i);
  assert.match(source, /step into your power/i);
  assert.match(source, /everything happens for a reason/i);
});

test("reading quality gate checks snapshot-to-engine repetition", async () => {
  const source = await readFile(validatorPath, "utf8");

  assert.match(source, /overlapRatio\(reading\.snapshot\.centralPattern, engine\.summary\)/);
  assert.match(source, /snapshot central pattern/);
});
