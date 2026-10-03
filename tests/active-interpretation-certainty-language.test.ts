import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const ACTIVE_INTERPRETATION_SURFACES = [
  "server/services/numerology.ts",
  "server/services/archetype.ts",
  "server/services/openai-service.ts",
  "client/src/lib/clarityReadingModel.ts",
  "packages/core/offline-codex/index.ts",
  "packages/core/depth-interpretation/synthesize.ts",
] as const;

const DESTINY_CLAIMS = [
  /\byou(?:'|’)re here to\b/i,
  /\byou are here to\b/i,
  /\byour purpose (?:is|involves|requires)\b/i,
  /\byour mission (?:is|involves|requires)\b/i,
  /\byou(?:'|’)re born to\b/i,
  /\byou are born to\b/i,
  /\byou(?:'|’)re meant to\b/i,
  /\byou are meant to\b/i,
] as const;

test("active interpretation surfaces do not turn symbolic calculations into destiny claims", () => {
  for (const path of ACTIVE_INTERPRETATION_SURFACES) {
    const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
    for (const pattern of DESTINY_CLAIMS) {
      assert.doesNotMatch(source, pattern, `${path} contains destiny-style language`);
    }
  }
});

test("production numerology labels math as deterministic and meaning as symbolic", () => {
  const source = readFileSync(new URL("../server/services/numerology.ts", import.meta.url), "utf8");
  assert.match(source, /deterministic calculation/i);
  assert.match(source, /symbolic vocabulary/i);
  assert.match(source, /reflection prompt, not a fixed purpose or destiny/i);
});

test("AI biography prompt preserves the calculation-versus-meaning boundary", () => {
  const source = readFileSync(new URL("../server/services/openai-service.ts", import.meta.url), "utf8");
  assert.match(source, /symbolic or assessed reflection frameworks, not scientific diagnoses or fixed destiny/i);
});
