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

  it("keeps progressive depth controls in the reading experience", () => {
    const source = fs.readFileSync("client/src/components/ClarityReadingExperience.tsx", "utf8");
    expect(source).toContain("Quick insight");
    expect(source).toContain("Standard reading");
    expect(source).toContain("Deep dive");
    expect(source).toContain("What this means in plain language");
    expect(source).toContain("How other people may experience it");
    expect(source).toContain("Reflection check");
  });
});
