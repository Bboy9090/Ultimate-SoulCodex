import assert from "node:assert/strict";
import test from "node:test";
import {
  EXPRESSION_THEMES,
  SOUL_URGE_THEMES,
  type ClarityReadingModel,
} from "../client/src/lib/clarityReadingModel";
import { buildDepthChapters, chapterWordCount } from "../client/src/lib/depthEngine";

const model: ClarityReadingModel = {
  title: "Quality fixture",
  summary: "Fixture reading.",
  coreContradiction: "Unavailable: the supplied signals do not support one of the defined contradiction pairs.",
  visiblePattern: "You may pause before committing to a plan that other people are waiting on.",
  protectiveFunction: "Pausing can protect you from acting before the picture feels complete.",
  gift: "Deliberate attention can become precise judgment when the stakes are real.",
  cost: "Waiting too long can turn care into stalled movement for everyone involved.",
  relationshipImpact: "Other people may mistake processing time for distance between you.",
  groundedAction: "Name what you know, what you do not know, and the next reversible step.",
  signals: [
    { id: "sun", label: "Sun", value: "Virgo", confidence: "verified", source: "independent astronomy" },
    { id: "expression", label: "Expression", value: "4", confidence: "deterministic", source: "name calculation" },
    { id: "soul-urge", label: "Soul Urge", value: "2", confidence: "supported", source: "name calculation" },
    { id: "moon", label: "Moon", value: "Unknown", confidence: "unavailable", source: "birth time missing" },
  ],
  limitations: [],
};

function readingText(): { all: string; sentences: string[] } {
  const chapters = buildDepthChapters(model, {});
  const all = chapters
    .flatMap((c) => [c.observation, c.translation, c.strength, c.cost, c.misunderstanding, c.relationshipView, c.stressView, c.practicalTakeaway, c.reflection, c.decisionExample, c.relationshipExample, c.workExample])
    .join("\n");
  const sentences = all.split(/(?<=[.!?])\s+|\n/).map((s) => s.trim()).filter((s) => s.length >= 25);
  return { all, sentences };
}

test("a reading never repeats a sentence of 25+ characters", () => {
  const { sentences } = readingText();
  const seen = new Map<string, number>();
  for (const s of sentences) seen.set(s, (seen.get(s) ?? 0) + 1);
  const dupes = [...seen].filter(([, n]) => n > 1).map(([s]) => s);
  assert.deepEqual(dupes, []);
});

test("each supplied model sentence is quoted at most three times", () => {
  const { all } = readingText();
  for (const sentence of [model.visiblePattern, model.protectiveFunction, model.gift, model.cost, model.relationshipImpact]) {
    const needle = sentence.replace(/[.!?]+$/, "");
    const count = all.split(needle).length - 1;
    assert.ok(count <= 3, `"${needle}" appears ${count} times`);
  }
});

test("internal jargon and unavailable placeholders never reach reader text", () => {
  const { all } = readingText();
  assert.doesNotMatch(all, /evidence ledger/i);
  assert.doesNotMatch(all, /\[(verified|deterministic|stable|supported|tentative)\]/i);
  assert.doesNotMatch(all, /Unavailable:/);
  assert.doesNotMatch(all, /strongest supplied contradiction/i);
  assert.doesNotMatch(all, /Moon: Unknown/);
});

test("the evidence framing note is written once and each signal is cited once", () => {
  const { all } = readingText();
  assert.equal(all.split("For context, this reading rests on").length - 1, 1);
  assert.equal(all.split("they do not prove the behavioral interpretation").length - 1, 1);
  for (const cite of ["Sun: Virgo", "Expression: 4", "Soul Urge: 2"]) {
    assert.equal(all.split(cite).length - 1, 1, `${cite} cited more than once`);
  }
});

test("chapters stay substantive without bloat", () => {
  for (const chapter of buildDepthChapters(model, {})) {
    const words = chapterWordCount(chapter);
    assert.ok(words > 150 && words < 700, `${chapter.id}: ${words} words`);
  }
});

test("number themes keep the grammatical shape the reading frames rely on", () => {
  for (const [name, table] of [["expression", EXPRESSION_THEMES], ["soul-urge", SOUL_URGE_THEMES]] as const) {
    for (const [n, theme] of Object.entries(table)) {
      assert.doesNotMatch(theme.pull, /^to\s/i, `${name} ${n} pull must be a bare infinitive`);
      assert.match(theme.risk, /^[a-z-]+ing\b/i, `${name} ${n} risk must begin with a gerund`);
      assert.match(theme.drive, /,| and /, `${name} ${n} drive must be a plural list`);
    }
  }
});
