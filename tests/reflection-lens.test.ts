import assert from "node:assert/strict";
import test from "node:test";
import {
  REFLECTION_LENS_COPY,
  normalizeReflectionLens,
} from "../client/src/lib/reflectionLens";

test("reflection lens values fail closed to grounded language", () => {
  assert.equal(normalizeReflectionLens("grounded"), "grounded");
  assert.equal(normalizeReflectionLens("cosmic"), "cosmic");
  assert.equal(normalizeReflectionLens("sacred"), "sacred");
  assert.equal(normalizeReflectionLens("galactic-overdrive"), "grounded");
  assert.equal(normalizeReflectionLens(null), "grounded");
});

test("cosmic and sacred lenses cannot claim to change evidence", () => {
  assert.match(REFLECTION_LENS_COPY.cosmic.principle, /never changes/i);
  assert.match(REFLECTION_LENS_COPY.cosmic.principle, /evidence|astronomical/i);
  assert.match(REFLECTION_LENS_COPY.sacred.principle, /never turns symbolic interpretation into empirical fact/i);
  assert.match(REFLECTION_LENS_COPY.sacred.lede, /not as proof/i);
  assert.match(REFLECTION_LENS_COPY.sacred.lede, /God-given|sacred/i);
});
