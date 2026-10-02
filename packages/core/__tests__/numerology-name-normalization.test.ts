import test from "node:test";
import assert from "node:assert/strict";
import {
  calcExpression,
  normalizeNumerologyName,
} from "../compute/numerology.js";

test("canonical numerology normalization preserves supported Latin diacritics and transliterations", () => {
  assert.equal(normalizeNumerologyName("José González"), normalizeNumerologyName("Jose Gonzalez"));
  assert.equal(calcExpression("José González"), calcExpression("Jose Gonzalez"));
  assert.equal(normalizeNumerologyName("Ægir Øst"), "AEGIROST");
});

test("canonical numerology normalization rejects unsupported alphabetic scripts instead of deleting them", () => {
  assert.throws(
    () => normalizeNumerologyName("Алексей"),
    /outside the supported Latin transliteration policy/,
  );
  assert.throws(
    () => normalizeNumerologyName("Αλέξανδρος"),
    /outside the supported Latin transliteration policy/,
  );
});

test("canonical numerology normalization rejects nonempty inputs with no supported letters", () => {
  assert.throws(
    () => normalizeNumerologyName("123 !@#"),
    /does not contain supported letters/,
  );
});
