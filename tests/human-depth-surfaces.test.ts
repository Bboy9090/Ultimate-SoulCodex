import { describe, expect, it } from "vitest";
import fs from "node:fs";

const read = (path: string) => fs.readFileSync(path, "utf8");

describe("Human Depth interpretation surfaces", () => {
  it("provides one reusable explanation and correction contract", () => {
    const component = read("client/src/components/HumanDepthSurface.tsx");
    expect(component).toContain("What this may look like in real life");
    expect(component).toContain("What this gives you");
    expect(component).toContain("What it may cost");
    expect(component).toContain("How this may be misunderstood");
    expect(component).toContain("In relationships");
    expect(component).toContain("What to do with this insight");
    expect(component).toContain("Does this fit your experience?");
    expect(component).toContain("Very much");
    expect(component).toContain("Partly");
    expect(component).toContain("Not really");
  });

  it("replaces disconnected profile tabs with one integrated human story", () => {
    const profile = read("client/src/pages/profile.tsx");
    expect(profile).toContain("HumanDepthSurface");
    expect(profile).toContain("One profile, one explanation standard");
    expect(profile).toContain("How the Big Three may divide the work");
    expect(profile).toContain("What your core numbers are trying to describe");
    expect(profile).toContain("How assessed personality may show up under pressure");
    expect(profile).toContain("Turn guidance into an observable experiment");
    expect(profile).not.toContain("Strengths & Gifts");
    expect(profile).not.toContain("Growth Areas");
  });
});
