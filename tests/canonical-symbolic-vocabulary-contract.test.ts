import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  CANONICAL_NUMBER_PATTERNS,
  CANONICAL_SIGN_PATTERNS,
  canonicalNumberPattern,
  canonicalSignPattern,
} from "../shared/symbolic-vocabulary.ts";

const localUrl = new URL("../client/src/lib/foundationOfflineCodex.ts", import.meta.url);
const serverUrl = new URL("../server/services/archetype.ts", import.meta.url);

test("canonical symbolic vocabulary covers every governed sign and numerology number", () => {
  assert.equal(Object.keys(CANONICAL_SIGN_PATTERNS).length, 12);
  assert.deepEqual(
    Object.keys(CANONICAL_NUMBER_PATTERNS).map(Number).sort((a, b) => a - b),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33],
  );
  assert.equal(canonicalSignPattern("virgo")?.word, "Refiner");
  assert.equal(canonicalSignPattern(" Scorpio ")?.action, "Separate what is known from what is feared before escalating.");
  assert.equal(canonicalNumberPattern(22)?.word, "Master Builder");
  assert.equal(canonicalNumberPattern(99), null);
});

test("active local and server synthesis consume the shared vocabulary instead of duplicate tables", async () => {
  const [local, server] = await Promise.all([
    readFile(localUrl, "utf8"),
    readFile(serverUrl, "utf8"),
  ]);

  for (const source of [local, server]) {
    assert.match(source, /@shared\/symbolic-vocabulary/);
  }
  assert.doesNotMatch(local, /const SIGN_PATTERNS/);
  assert.doesNotMatch(local, /const LIFE_PATHS/);
  assert.doesNotMatch(server, /const SIGN_PATTERN/);
  assert.doesNotMatch(server, /const NUMBER_PATTERN/);
});
