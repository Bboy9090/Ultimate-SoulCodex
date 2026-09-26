import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const header = readFileSync(
  "client/src/components/soul-codex/CodexHeader.tsx",
  "utf8",
);
const display = readFileSync(
  "client/src/components/soul-codex/SoulCodexReadingDisplay.tsx",
  "utf8",
);

test("Codex header renders stored reading generation metadata", () => {
  assert.match(header, /generatedAt\?: string/);
  assert.match(header, /new Date\(generatedAt\)\.toLocaleDateString\(\)/);
  assert.match(header, /Generated date unavailable/);
  assert.doesNotMatch(header, /Generated \{new Date\(\)\.toLocaleDateString\(\)\}/);
});

test("reading display passes generatedAt into the header", () => {
  assert.match(display, /generatedAt=\{reading\.meta\.generatedAt\}/);
});
