import test from "node:test";
import assert from "node:assert/strict";
import { decodeLifeEvent } from "../decode";

test("decodeLifeEvent classifies betrayal and returns stable structure", () => {
  const out = decodeLifeEvent({
    text: "I found out they cheated and lied for months. I feel devastated and can't sleep.",
    phase: "recalibration",
    driver: "trust",
  });

  assert.equal(out.category, "betrayal");
  assert.equal(out.intensity, "high");
  assert.ok(out.meaning.includes("Trust was violated"));
  assert.equal(out.decision_rule, "Do not decide from shock. Stabilize, then decide.");
  assert.ok(Array.isArray(out.next_steps) && out.next_steps.length >= 2);
  assert.ok(Array.isArray(out.avoid) && out.avoid.length >= 2);
  assert.ok(Array.isArray(out.follow_up_questions) && out.follow_up_questions.length >= 2);
});

test("decodeLifeEvent uses category_hint as strong signal", () => {
  const out = decodeLifeEvent({
    text: "Everything is changing and I don't know why yet.",
    category_hint: "job_change",
    phase: "transition",
    driver: "career",
  });

  assert.equal(out.category, "job_change");
  assert.ok(out.meaning.toLowerCase().includes("work"));
});

test("decodeLifeEvent falls back to unknown with minimal input", () => {
  const out = decodeLifeEvent({ text: "ok" });
  assert.equal(out.category, "unknown");
  assert.equal(out.intensity, "low");
});

