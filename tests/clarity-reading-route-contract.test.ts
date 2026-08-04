import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("V4 clarity reading route contract", () => {
  it("keeps a single public reading route with local profile dispatch", () => {
    const app = read("client/src/App.tsx");
    expect(app).toContain('path="/reading/:id"');
    expect(app).toContain('id?.startsWith("local-")');
    expect(app).toContain("OfflineClarityReadingPage");
    expect(app).toContain("ClarityReadingPage");
  });

  it("keeps the home reading destination separate from raw profile evidence", () => {
    const home = read("client/src/pages/home.tsx");
    expect(home).toContain("readingHref");
    expect(home).toContain("Why do I operate this way?");
    expect(home).toContain("Verified facts, inferences, uncertainty, missing data");
  });

  it("keeps online readings honest about unavailable profiles", () => {
    const page = read("client/src/pages/ClarityReadingPage.tsx");
    expect(page).toContain("No interpretation should be invented");
    expect(page).toContain("Symbolic overlap is supporting context, not independent proof");
    expect(page).toContain("Lived experience is the final correction layer");
  });

  it("keeps offline readings device-local and confidence labeled", () => {
    const page = read("client/src/pages/OfflineClarityReadingPage.tsx");
    expect(page).toContain("loadOfflineProfile");
    expect(page).toContain("Works offline");
    expect(page).toContain("deterministic");
    expect(page).toContain("verified");
    expect(page).toContain("No reading should be invented");
  });
});
