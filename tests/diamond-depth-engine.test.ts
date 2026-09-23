import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  buildDepthChapters,
  chapterWordCount,
} from "../client/src/lib/depthEngine";
import type { ClarityReadingModel } from "../client/src/lib/clarityReadingModel";

const firstModel: ClarityReadingModel = {
  title: "The thoughtful builder",
  summary: "A test reading.",
  coreContradiction: "Careful evaluation can improve quality while also delaying movement after enough information is already available.",
  visiblePattern: "You may pause before committing.",
  protectiveFunction: "Pausing can protect you from acting before the picture feels complete.",
  gift: "Deliberate attention can become precise judgment.",
  cost: "Waiting too long can turn care into stalled movement.",
  relationshipImpact: "Other people may mistake processing time for distance.",
  groundedAction: "Name what you know, what you do not know, and the next reversible step.",
  signals: [
    { id: "sun", label: "Sun", value: "Virgo", confidence: "verified", source: "independent astronomy" },
    { id: "expression", label: "Expression", value: "4", confidence: "deterministic", source: "name calculation" },
  ],
  limitations: ["This is interpretive, not diagnostic."],
};

const secondModel: ClarityReadingModel = {
  title: "The expressive explorer",
  summary: "A second test reading.",
  coreContradiction: "A pull toward rapid experimentation can collide with a need for emotional reciprocity.",
  visiblePattern: "You may move quickly toward novelty when a situation starts to feel repetitive.",
  protectiveFunction: "Keeping options open may preserve a sense of freedom when commitment feels narrowing.",
  gift: "Adaptability can make you quick to discover alternatives and communicate possibility.",
  cost: "Constant movement can make consistency harder to sustain after the first wave of interest.",
  relationshipImpact: "Other people may experience the need for space differently from the way you experience it internally.",
  groundedAction: "Choose one commitment worth deepening and define one form of freedom that can exist inside it.",
  signals: [
    { id: "expression", label: "Expression", value: "5", confidence: "deterministic", source: "name calculation" },
    { id: "soul-urge", label: "Soul Urge", value: "2", confidence: "deterministic", source: "name-vowel calculation" },
  ],
  limitations: ["This is interpretive, not diagnostic."],
};

test("server depth chapters are profile-derived instead of universal essays", () => {
  const first = buildDepthChapters(firstModel);
  const second = buildDepthChapters(secondModel);

  assert.equal(first.length, 5);
  assert.equal(second.length, 5);

  for (const chapter of first) {
    assert.ok(chapterWordCount(chapter) > 150, `${chapter.id} should remain a substantive chapter`);
    assert.equal(chapter.action, firstModel.groundedAction);
    assert.match(chapter.reflection, /\?/);
  }

  const firstText = first
    .map((chapter) => [chapter.translation, chapter.strength, chapter.cost, chapter.relationshipView].join(" "))
    .join(" ");
  const secondText = second
    .map((chapter) => [chapter.translation, chapter.strength, chapter.cost, chapter.relationshipView].join(" "))
    .join(" ");

  assert.notEqual(firstText, secondText);
  assert.match(firstText, /Sun: Virgo/);
  assert.match(firstText, /Expression: 4/);
  assert.match(secondText, /Expression: 5/);
  assert.match(secondText, /Soul Urge: 2/);
  assert.ok(secondText.includes(secondModel.coreContradiction!));
  assert.equal(secondText.includes(firstModel.visiblePattern), false);
});

test("depth engine source contains no legacy universal discernment essays", () => {
  const source = readFileSync("client/src/lib/depthEngine.ts", "utf8");
  for (const phrase of [
    "Discernment becomes valuable when",
    "Protection becomes expensive when",
    "Competence attracts work",
    "The clearest cost is expansion without an exit condition",
  ]) {
    assert.equal(source.includes(phrase), false, phrase);
  }
});

test("lived feedback still recalibrates the interpretation path", () => {
  const baseline = buildDepthChapters(firstModel);
  const corrected = buildDepthChapters(firstModel, { "visible-pattern": "not-really" });
  assert.notEqual(corrected[0].translation, baseline[0].translation);
  assert.match(corrected[0].practicalTakeaway, /Do not force yourself into it/i);
  assert.match(corrected[1].practicalTakeaway, /earlier layer did not fit/i);
});
