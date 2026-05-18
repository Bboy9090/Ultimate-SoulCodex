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

test("explanation library validator catches banned language in entry.name", () => {
  const badLibrary = [
    {
      ...EXPLANATION_LIBRARY_SEED[0],
      name: "Sun in Virgo (Deeply Intuitive)", // "deeply intuitive" is a canonical banned phrase
    },
  ];
  const result = validateExplanationLibrary(badLibrary);
  const nameViolations = result.violations.filter((v) => v.field === "name");
  assert.ok(nameViolations.length > 0, "should have caught banned phrase in name");
  assert.equal(nameViolations[0].code, "banned_phrase");
  assert.equal(nameViolations[0].snippet, "deeply intuitive");
});

test("explanation library validator catches canonical v1 banned phrases in explainable fields", () => {
  const badLibrary = [
    {
      ...EXPLANATION_LIBRARY_SEED[0],
      plainEnglishMeaning: "They feel deeply and also have a sacred blueprint.", // "feel deeply" and "sacred blueprint" are canonical v1 banned phrases
    },
  ];
  const result = validateExplanationLibrary(badLibrary);
  const plainEnglishViolations = result.violations.filter((v) => v.field === "plainEnglishMeaning");
  assert.ok(plainEnglishViolations.length >= 2, "should have caught multiple banned phrases");
  const snippets = plainEnglishViolations.map(v => v.snippet.toLowerCase());
  assert.ok(snippets.includes("feel deeply"));
  assert.ok(snippets.includes("sacred blueprint"));
});

test("explanation library validator catches deterministic language in explainable fields", () => {
  const badLibrary = [
    {
      ...EXPLANATION_LIBRARY_SEED[0],
      growthMove: "You always succeed when you try.", // "you always" is a deterministic pattern
    },
  ];
  const result = validateExplanationLibrary(badLibrary);
  const growthMoveViolations = result.violations.filter((v) => v.field === "growthMove");
  assert.ok(growthMoveViolations.length > 0, "should have caught deterministic language");
  assert.ok(
    growthMoveViolations.some((v) => v.code === "deterministic_always"),
    "should include deterministic_always violation"
  );
});

test("explanation library validator catches medical/diagnostic language in explainable fields", () => {
  const badLibrary = [
    {
      ...EXPLANATION_LIBRARY_SEED[0],
      whyItMatters: "This prevents anxiety disorder.", // "anxiety disorder" is a medical diagnosis pattern
    },
  ];
  const result = validateExplanationLibrary(badLibrary);
  const whyItMattersViolations = result.violations.filter((v) => v.field === "whyItMatters");
  assert.ok(whyItMattersViolations.length > 0, "should have caught medical diagnosis");
  assert.equal(whyItMattersViolations[0].code, "diagnosis_anxiety_disorder");
});
