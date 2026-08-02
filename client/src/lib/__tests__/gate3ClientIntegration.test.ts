import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
const poster = fs.readFileSync(path.resolve("client/src/pages/PosterPage.tsx"), "utf8");
const onboarding = fs.readFileSync(path.resolve("client/src/pages/OnboardingPage.tsx"), "utf8");
describe("Gate 3 client integration", () => {
  it("removes fabricated poster fallbacks", () => { expect(poster).not.toContain('?? "Gemini"'); expect(poster).not.toContain('?? "Pisces"'); expect(poster).not.toContain('sunSign: "Gemini"'); expect(poster).not.toContain('moonSign: "Pisces"'); expect(poster).toContain("getVerifiedPlacement(astro.sun)"); });
  it("removes date-boundary Sun promotion", () => { expect(onboarding).not.toContain("SIGN_BOUNDARIES"); expect(onboarding).not.toContain("getApproxSunSign"); expect(onboarding).not.toContain("earlySunSign"); expect(onboarding).toContain("getVerifiedPlacement(astro.sun"); });
});
