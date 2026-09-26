import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const doctrine = readFileSync("docs/soul-codex/product-doctrine.md", "utf8");
const inputs = readFileSync("docs/engine/system-inputs.md", "utf8");
const canonReadme = readFileSync("docs/soul-codex/README.md", "utf8");

test("canonical doctrine requires evidence-driven differentiation, not fabricated uniqueness", () => {
  assert.match(doctrine, /When governed evidence differs, the reading must change in substance/i);
  assert.match(doctrine, /must not manufacture uniqueness/i);
  assert.doesNotMatch(doctrine, /Same Sun sign users must not receive identical readings/);
});

test("canonical input contract keeps exact-time systems unresolved when precision is missing", () => {
  assert.match(inputs, /Human Design remains unresolved/i);
  assert.match(inputs, /civil time is ambiguous\/nonexistent/i);
  assert.match(inputs, /Moon, Rising, houses.*remain unresolved/i);
  assert.doesNotMatch(inputs, /degraded authority\/profile\/channel precision/i);
});

test("canonical docs defer production system state to the executable registry", () => {
  assert.match(canonReadme, /shared\/system-registry\.ts/);
  assert.match(canonReadme, /governance\/SYSTEM_REGISTRY\.md/);
  assert.match(canonReadme, /Historical code or documentation does not make a system production-governed/i);
});
