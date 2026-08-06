import { describe, expect, it } from "vitest";
import fs from "node:fs";

const read = (path: string) => fs.readFileSync(path, "utf8");

describe("V4 screen recording regressions", () => {
  it("renders a compatibility transition skeleton instead of a blank route", () => {
    const route = read("client/src/pages/CompatibilityRoute.tsx");
    const app = read("client/src/App.tsx");
    expect(route).toContain("CompatibilitySkeleton");
    expect(route).toContain('aria-busy="true"');
    expect(app).toContain('path="/compatibility" component={CompatibilityRoute}');
  });

  it("keeps evidence details inspectable without forcing dense content open", () => {
    const reading = read("client/src/components/ClarityReadingExperience.tsx");
    expect(reading).toContain("<details");
    expect(reading).toContain("Evidence and confidence details");
    expect(reading).toContain("Limits and corrections");
  });

  it("collapses the persistent reading launcher after meaningful scrolling", () => {
    const launcher = read("client/src/components/ProfileClarityLauncher.tsx");
    expect(launcher).toContain("window.scrollY > 280");
    expect(launcher).toContain("compact");
    expect(launcher).toContain("env(safe-area-inset-bottom)");
  });

  it("prevents exact reading-section repetition", () => {
    const model = read("client/src/lib/clarityReadingModel.ts");
    expect(model).toContain("makeProgressiveSections");
    expect(model).toContain("used.has(key)");
  });

  it("connects timeline context to the active identity", () => {
    const timeline = read("client/src/components/TimelineContinuityHeader.tsx");
    expect(timeline).toContain("Living timeline");
    expect(timeline).toContain("what actually happened");
  });
});
