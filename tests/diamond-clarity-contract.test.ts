import { describe, expect, it } from "vitest";
import {
  DIAMOND_SECTION_ORDER,
  validateDiamondOutput,
} from "../src/ai/diamondClarity";
import { buildSoulCodexSystemPrompt } from "../src/ai/soulCodexEngine";

const validReading = `
**Pattern**
You keep refining after the work is already usable.

**Why**
Uncertainty keeps the decision open, so revision feels safer than release.

**Need**
This may be protecting your need to avoid preventable mistakes.

**Gift**
You notice weak points before they become expensive failures.

**Cost**
The finish line moves, and completed work stays unavailable to others.

**Action**
Define the minimum release standard before starting today's revision.

**Evidence**
Supported by deterministic Life Path data and recorded behavior answers. Moon, Rising, and Human Design were unresolved and excluded.
`;

describe("Diamond clarity contract", () => {
  it("requires the complete clarity sequence", () => {
    const result = validateDiamondOutput(validReading);
    expect(result.valid).toBe(true);
    expect(result.missing).toEqual([]);
    expect(DIAMOND_SECTION_ORDER).toEqual([
      "Pattern", "Why", "Need", "Gift", "Cost", "Action", "Evidence",
    ]);
  });

  it("rejects trait summaries without mechanism, action, or evidence", () => {
    const result = validateDiamondOutput("You are loyal, analytical, and creative.");
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("Why");
    expect(result.violations).toContain("Provides no concrete next step.");
    expect(result.violations).toContain("Hides or omits evidence and uncertainty.");
  });

  it("rejects unsupported biography claims", () => {
    const result = validateDiamondOutput(validReading.replace(
      "Uncertainty keeps the decision open, so revision feels safer than release.",
      "You are this way because of your childhood."
    ));
    expect(result.valid).toBe(false);
    expect(result.violations).toContain("Claims unsupported biography or interprets unresolved data.");
  });

  it("rejects system stacking instead of synthesis", () => {
    const result = validateDiamondOutput(validReading.replace(
      "You keep refining after the work is already usable.",
      "Astrology, numerology, and Human Design all say you are careful."
    ));
    expect(result.valid).toBe(false);
    expect(result.violations).toContain("Stacks symbolic systems instead of synthesizing one clear pattern.");
  });

  it("builds prompts that preserve uncertainty and the Diamond sequence", () => {
    const prompt = buildSoulCodexSystemPrompt({
      directMode: true,
      includePatternDetection: true,
      birthTimeKnown: false,
    });

    for (const section of DIAMOND_SECTION_ORDER) {
      expect(prompt).toContain(`**${section}**`);
    }
    expect(prompt).toContain("maximum clarity through meaningful depth");
    expect(prompt).toContain("Do not infer or interpret them");
    expect(prompt).not.toContain("No advice.");
    expect(prompt).not.toContain("Be a mirror, not a mentor. No support. No warmth.");
  });
});
