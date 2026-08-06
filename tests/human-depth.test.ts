import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { buildDepthChapters } from "../client/src/lib/depthEngine";
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

describe("Human Depth reading contract", () => {
  it("gives each chapter real-life examples, benefit, tradeoff, misunderstanding, and action", () => {
    const chapters = buildDepthChapters(model);
    for (const chapter of chapters) {
      expect(chapter.dailyLife).toHaveLength(3);
      expect(chapter.dailyLife.join(" ")).toMatch(/decisions|conflict|work|relationship|teams/i);
      expect(chapter.strength.length).toBeGreaterThan(120);
      expect(chapter.cost.length).toBeGreaterThan(120);
      expect(chapter.misunderstanding.length).toBeGreaterThan(90);
      expect(chapter.practicalTakeaway.length).toBeGreaterThan(120);
      expect(chapter.action).toBe(model.groundedAction);
    }
  });

  it("lets the user correct each interpretation without changing source data", () => {
    const source = fs.readFileSync("client/src/components/ClarityReadingExperience.tsx", "utf8");
    expect(source).toContain("Does this fit your experience?");
    expect(source).toContain("Very much");
    expect(source).toContain("Partly");
    expect(source).toContain("Not really");
    expect(source).toContain("localStorage");
    expect(source).toContain("does not rewrite your birth data");
  });

  it("renders the human questions the test recording proved were missing", () => {
    const source = fs.readFileSync("client/src/components/ClarityReadingExperience.tsx", "utf8");
    expect(source).toContain("What this may look like in real life");
    expect(source).toContain("What this gives you");
    expect(source).toContain("What it may cost");
    expect(source).toContain("How this may be misunderstood");
    expect(source).toContain("What to do with this insight");
  });
});
