import fs from "node:fs";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildDepthChapters,
  chapterWordCount,
  isTerminalOneLiner,
} from "../client/src/lib/depthEngine";
import type { ClarityReadingModel } from "../client/src/lib/clarityReadingModel";

const model: ClarityReadingModel = {
  title: "The thoughtful builder",
  summary: "A test reading.",
  visiblePattern: "You may pause before committing.",
  protectiveFunction: "Pausing can protect you from acting before the picture feels complete.",
  gift: "Deliberate attention can become discernment.",
  cost: "Waiting too long can turn care into stalled movement.",
  relationshipImpact: "Other people may mistake processing time for distance.",
  groundedAction: "Name what you know, what you do not know, and the next reversible step.",
  signals: [],
  limitations: ["This is interpretive, not diagnostic."],
};

describe("Depth Engine", () => {
  it("detects terminal one-line answers", () => {
    assert.equal(isTerminalOneLiner("You need freedom."), true);
    assert.equal(isTerminalOneLiner("You need freedom. In practice, that can mean needing room to decide without feeling managed, while still remaining capable of commitment and honest connection when boundaries are clear."), false);
  });

  it("turns every major insight into a complete chapter", () => {
    const chapters = buildDepthChapters(model);
    assert.equal(chapters.length, 5);
    for (const chapter of chapters) {
      assert.ok(chapter.translation.length > 140);
      assert.equal(chapter.dailyLife.length, 3);
      assert.ok(chapter.strength);
      assert.ok(chapter.cost);
      assert.ok(chapter.relationshipView);
      assert.ok(chapter.stressView);
      assert.match(chapter.reflection, /\?/);
      assert.equal(chapter.action, model.groundedAction);
      assert.ok(chapterWordCount(chapter) > 150);
    }
  });

  it("gives structurally different chapters their own reasoning", () => {
    const chapters = buildDepthChapters(model);
    assert.equal(new Set(chapters.map((chapter) => chapter.translation)).size, 5);
    assert.equal(new Set(chapters.map((chapter) => chapter.strength)).size, 5);
    assert.equal(new Set(chapters.map((chapter) => chapter.cost)).size, 5);
    const source = fs.readFileSync("client/src/lib/depthEngine.ts", "utf8");
    assert.doesNotMatch(source, /When used consciously, this pattern can become/);
    assert.doesNotMatch(source, /A strength can keep its honorable name long after it has stopped helping/);
    assert.doesNotMatch(source, /Discernment becomes valuable when/);
    assert.doesNotMatch(source, /Protection becomes expensive when/);
    assert.doesNotMatch(source, /Competence attracts work/);
    assert.doesNotMatch(source, /The clearest cost is expansion without an exit condition/);
  });

  it("changes chapter substance when the profile model changes", () => {
    const other: ClarityReadingModel = {
      ...model,
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
    };

    const first = buildDepthChapters(model);
    const second = buildDepthChapters(other);
    const firstText = first.map((chapter) => [chapter.translation, chapter.strength, chapter.cost, chapter.relationshipView].join(" ")).join(" ");
    const secondText = second.map((chapter) => [chapter.translation, chapter.strength, chapter.cost, chapter.relationshipView].join(" ")).join(" ");

    assert.notEqual(secondText, firstText);
    assert.match(secondText, new RegExp(other.visiblePattern.replace(/[.*+?^${}()|[\]\\]/g, "\\expect(secondText).toContain(other.visiblePattern);")));
    assert.ok(other.coreContradiction && secondText.includes(other.coreContradiction));
    assert.match(secondText, /Expression: 5/);
    assert.match(secondText, /Soul Urge: 2/);
    assert.ok(!secondText.includes(model.visiblePattern));
  });

  it("uses lived feedback to recalibrate the current and subsequent chapters", () => {
    const baseline = buildDepthChapters(model);
    const corrected = buildDepthChapters(model, { "visible-pattern": "not-really" });

    assert.notEqual(corrected[0].translation, baseline[0].translation);
    assert.match(corrected[0].practicalTakeaway, /Do not force yourself into it/);
    assert.match(corrected[1].practicalTakeaway, /An earlier layer did not fit your experience/);

    const confirmed = buildDepthChapters(model, { "visible-pattern": "very-much" });
    assert.match(confirmed[0].practicalTakeaway, /fitting very strongly/);
    assert.match(confirmed[1].practicalTakeaway, /An earlier layer fit strongly/);
  });

  it("keeps progressive depth controls in the reading experience", () => {
    const source = fs.readFileSync("client/src/components/ClarityReadingExperience.tsx", "utf8");
    assert.match(source, /Quick insight/);
    assert.match(source, /Standard reading/);
    assert.match(source, /Deep dive/);
    assert.match(source, /What this means in plain language/);
    assert.match(source, /How other people may experience it/);
    assert.match(source, /Reflection check/);
    assert.match(source, /buildDepthChapters\(model, fits\)/);
  });
});
