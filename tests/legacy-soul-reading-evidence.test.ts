import assert from "node:assert/strict";
import test from "node:test";
import { generateSoulReading } from "../src/codex/soul-reading";

const input: any = {
  birth: { birthDate: "1990-09-17", birthPlace: "Bronx", timeKnown: false },
  chart: {
    sun: { planet: "Sun", sign: "Virgo" },
    moon: { planet: "Moon", sign: "Scorpio" },
  },
  numerology: { lifePath: 9 },
};

test("missing Mercury and Mars cannot inherit Sun/Moon and manufacture placement readings", () => {
  const steps = generateSoulReading(input).steps;
  const mind = steps.find((step) => step.id === "mind")?.body ?? "";
  const stress = steps.find((step) => step.id === "stress")?.body ?? "";
  assert.match(mind, /Mercury is unresolved/);
  assert.match(stress, /Mars is unresolved/);
  assert.doesNotMatch(mind, /Virgo|Scorpio|analyzing and refining/i);
  assert.doesNotMatch(stress, /Virgo|Scorpio|pressure rises my mind/i);
});

test("missing Moon remains unresolved rather than receiving a generic personality", () => {
  const withoutMoon = { ...input, chart: { ...input.chart, moon: undefined } };
  const emotion = generateSoulReading(withoutMoon).steps.find((step) => step.id === "emotion")?.body ?? "";
  assert.match(emotion, /Moon is unresolved/);
  assert.doesNotMatch(emotion, /Scorpio|Virgo|I process emotions internally/);
});

test("supported Mercury and Mars retain distinct sign-specific content", () => {
  const chart = { ...input.chart, mercury: { planet: "Mercury", sign: "Gemini" }, mars: { planet: "Mars", sign: "Taurus" } };
  const steps = generateSoulReading({ ...input, chart }).steps;
  assert.match(steps.find((step) => step.id === "mind")?.body ?? "", /multiple tracks at once/);
  assert.match(steps.find((step) => step.id === "stress")?.body ?? "", /Under pressure I dig in/);
});
