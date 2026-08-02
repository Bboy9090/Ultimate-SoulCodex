import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("Gate 3: no silent astrology upgrades", () => {
  it("PosterPage does not fabricate zodiac signs when profile data is absent", () => {
    const source = read("client/src/pages/PosterPage.tsx");

    expect(source).not.toMatch(/sunSign:\s*astro\.sun\s*\?\?\s*p\.sunSign\s*\?\?\s*["']Gemini["']/);
    expect(source).not.toMatch(/moonSign:\s*astro\.moon\s*\?\?\s*p\.moonSign\s*\?\?\s*["']Pisces["']/);
  });

  it("Onboarding does not promote an approximate date-boundary Sun sign", () => {
    const source = read("client/src/pages/OnboardingPage.tsx");

    expect(source).not.toContain("const SIGN_BOUNDARIES");
    expect(source).not.toContain("function getApproxSunSign");
    expect(source).not.toMatch(/astro\.sunSign\s*\|\|\s*result\.sunSign\s*\|\|\s*earlySunSign/);
  });

  it("backend astrology returns explicit unresolved states instead of approximate signs", () => {
    const source = read("server/services/astrology.ts");

    expect(source).toContain('status: "pending_ephemeris"');
    expect(source).toContain("sign: null");
    expect(source).not.toContain("calculateMoonSign(");
    expect(source).not.toContain("calculateRisingSign(");
  });
});
