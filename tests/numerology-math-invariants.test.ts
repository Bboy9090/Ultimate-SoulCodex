import assert from "node:assert/strict";
import test from "node:test";
import {
  NUMEROLOGY_POLICY,
  calcCoreNumerology,
  calcExpression,
  calcPersonality,
  calcSoulUrge,
  normalizeNumerologyName,
  numerologyNameComponentAvailability,
  reduceNumerology,
} from "../packages/core/compute/numerology";
import { calcPersonalYear } from "../packages/core/compute/personal-numbers";

const allowedFinalValues = new Set([1,2,3,4,5,6,7,8,9,11,22,33]);

test("numerology reduction always terminates in the governed final set", () => {
  for (let value = 1; value <= 100_000; value += 1) {
    const result = reduceNumerology(value);
    assert.ok(allowedFinalValues.has(result.value), String(value));
    assert.equal(result.sourceTotal, value);
    assert.equal(result.reductionPath[0], value);
    assert.equal(
      result.reductionPath[result.reductionPath.length - 1],
      result.value,
    );
    assert.ok(result.reductionPath.length <= 8, String(value));
  }
});

test("master numbers are preserved exactly at every reduction boundary", () => {
  for (const master of NUMEROLOGY_POLICY.masterNumbers) {
    const result = reduceNumerology(master);
    assert.equal(result.value, master);
    assert.deepEqual(result.reductionPath, [master]);
  }

  assert.equal(reduceNumerology(29).value, 11);
  assert.equal(reduceNumerology(38).value, 11);
  assert.equal(reduceNumerology(49).value, 13 > 9 ? 4 : 13);
  assert.equal(reduceNumerology(58).value, 13 > 9 ? 4 : 13);
});

test("karmic debt detection records governed debt values without changing final reduction", () => {
  const fixtures = [
    [13, 4, 13],
    [14, 5, 14],
    [16, 7, 16],
    [19, 1, 19],
    [49, 4, 13],
    [59, 5, 14],
  ] as const;

  for (const [source, expected, debt] of fixtures) {
    const result = reduceNumerology(source);
    assert.equal(result.value, expected);
    assert.equal(result.karmicDebt, debt);
  }
});

test("name normalization is stable across case, spacing, punctuation, and supported Latin transliteration", () => {
  const groups = [
    ["José Núñez", "JOSE NUNEZ", "josé-núñez", "  José   Núñez  "],
    ["Straße", "STRASSE", "straße"],
    ["Ægir", "AEGIR", "ægir"],
    ["Søren", "SOREN", "søren"],
    ["Łukasz", "LUKASZ", "łukasz"],
  ];

  for (const group of groups) {
    const normalized = group.map(normalizeNumerologyName);
    assert.equal(new Set(normalized).size, 1, group.join(" | "));
    const expression = group.map(calcExpression);
    assert.equal(new Set(expression).size, 1, group.join(" | "));
  }
});

test("Y remains a consonant under the frozen numerology policy", () => {
  assert.equal(NUMEROLOGY_POLICY.yPolicy, "consonant");

  const availability = numerologyNameComponentAvailability("Y");
  assert.equal(availability.vowelCount, 0);
  assert.equal(availability.consonantCount, 1);
  assert.throws(() => calcSoulUrge("Y"), /no eligible letters/i);
  assert.equal(typeof calcPersonality("Y"), "number");
});

test("vowel-only and consonant-only names stay partially unresolved instead of using zero placeholders", () => {
  const vowels = calcCoreNumerology("1990-09-17", "AEIOU");
  assert.equal(vowels.soulUrge !== null, true);
  assert.equal(vowels.personality, null);

  const consonants = calcCoreNumerology("1990-09-17", "BCDFG");
  assert.equal(consonants.soulUrge, null);
  assert.equal(consonants.personality !== null, true);
});

test("invalid reduction inputs fail closed", () => {
  for (const value of [-1, -100, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(
      () => reduceNumerology(value),
      /non-negative integer/,
      String(value),
    );
  }
});

test("names with no supported Latin letters remain unresolved rather than manufacturing values", () => {
  for (const name of ["", "1234", "----", "東京", "🙂"]) {
    assert.equal(normalizeNumerologyName(name), "");
    assert.throws(
      () => calcExpression(name),
      /at least one canonical A-Z letter/i,
      name,
    );
  }
});


test("numeric Personal Year overload requires all calendar fields", () => {
  assert.equal(
    calcPersonalYear(9, 17, 2026),
    calcPersonalYear("1990-09-17", 2026),
  );

  assert.throws(
    () => calcPersonalYear(9),
    /requires explicit month, day, and target year/i,
  );
  assert.throws(
    () => calcPersonalYear(9, 17),
    /requires explicit month, day, and target year/i,
  );
});

test("Personal Year numeric and date-string forms agree across calendar samples", () => {
  for (let month = 1; month <= 12; month += 1) {
    const day = Math.min(
      28,
      [31,29,31,30,31,30,31,31,30,31,30,31][month - 1],
    );
    for (const year of [1, 99, 1900, 1990, 2026, 9999]) {
      const date = `1990-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      assert.equal(
        calcPersonalYear(month, day, year),
        calcPersonalYear(date, year),
        `${month}/${day} in ${year}`,
      );
    }
  }
});
