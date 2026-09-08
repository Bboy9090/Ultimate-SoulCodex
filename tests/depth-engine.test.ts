import fs from "node:fs";
import { describe, expect, it } from "vitest";
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
    expect(isTerminalOneLiner("You need freedom.")).toBe(true);
    expect(isTerminalOneLiner("You need freedom. In practice, that can mean needing room to decide without feeling managed, while still remaining capable of commitment and honest connection when boundaries are clear.")).toBe(false);
  });

  it("turns every major insight into a complete chapter", () => {
    const chapters = buildDepthChapters(model);
    expect(chapters).toHaveLength(5);
    for (const chapter of chapters) {
      expect(chapter.translation.length).toBeGreaterThan(140);
      expect(chapter.dailyLife).toHaveLength(3);
      expect(chapter.strength).toBeTruthy();
      expect(chapter.cost).toBeTruthy();
      expect(chapter.relationshipView).toBeTruthy();
      expect(chapter.stressView).toBeTruthy();
      expect(chapter.reflection).toContain("?");
      expect(chapter.action).toBe(model.groundedAction);
      expect(chapterWordCount(chapter)).toBeGreaterThan(150);
    }
  });

  it("gives structurally different chapters their own reasoning", () => {
    const chapters = buildDepthChapters(model);
    expect(new Set(chapters.map((chapter) => chapter.translation)).size).toBe(5);
    expect(new Set(chapters.map((chapter) => chapter.strength)).size).toBe(5);
    expect(new Set(chapters.map((chapter) => chapter.cost)).size).toBe(5);
    const source = fs.readFileSync("client/src/lib/depthEngine.ts", "utf8");
    expect(source).not.toContain("When used consciously, this pattern can become");
    expect(source).not.toContain("A strength can keep its honorable name long after it has stopped helping");
  });

  it("uses lived feedback to recalibrate the current and subsequent chapters", () => {
    const baseline = buildDepthChapters(model);
    const corrected = buildDepthChapters(model, { "visible-pattern": "not-really" });

    expect(corrected[0].translation).not.toBe(baseline[0].translation);
    expect(corrected[0].practicalTakeaway).toContain("Do not force yourself into it");
    expect(corrected[1].practicalTakeaway).toContain("An earlier layer did not fit your experience");

    const confirmed = buildDepthChapters(model, { "visible-pattern": "very-much" });
    expect(confirmed[0].practicalTakeaway).toContain("fitting very strongly");
    expect(confirmed[1].practicalTakeaway).toContain("An earlier layer fit strongly");
  });

  it("keeps progressive depth controls in the reading experience", () => {
    const source = fs.readFileSync("client/src/components/ClarityReadingExperience.tsx", "utf8");
    expect(source).toContain("Quick insight");
    expect(source).toContain("Standard reading");
    expect(source).toContain("Deep dive");
    expect(source).toContain("What this means in plain language");
    expect(source).toContain("How other people may experience it");
    expect(source).toContain("Reflection check");
    expect(source).toContain("buildDepthChapters(model, fits)");
  });
});
