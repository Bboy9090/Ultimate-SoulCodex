import { test } from "node:test";
import assert from "node:assert/strict";

import {
  EXPLANATION_LIBRARY_SEED,
  explanationLibrarySchema,
  validateExplanationLibrary,
} from "../explanation-library/index.js";

test("explanation library seed parses against required schema", () => {
  const parsed = explanationLibrarySchema.parse(EXPLANATION_LIBRARY_SEED);
  assert.ok(parsed.length >= 5);
});

test("explanation library seed includes high-traffic baseline entries", () => {
  const ids = new Set(EXPLANATION_LIBRARY_SEED.map((entry) => entry.id));
  const requiredIds = [
    "astrology.sun.virgo",
    "astrology.moon.scorpio",
    "astrology.rising.capricorn",
    "human_design.type.projector",
    "numerology.life_path.9",
  ];

  for (const id of requiredIds) {
    assert.ok(ids.has(id), `missing required explanation entry: ${id}`);
  }
});

test("explanation library seed has no banned, deterministic, or diagnostic language violations", () => {
  const result = validateExplanationLibrary(EXPLANATION_LIBRARY_SEED);
  assert.equal(
    result.violations.length,
    0,
    `unexpected violations: ${JSON.stringify(result.violations, null, 2)}`
  );
});

