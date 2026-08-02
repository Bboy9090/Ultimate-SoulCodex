import { describe, expect, it } from "vitest";
import {
  enforceDiamondRuntimeOutput,
  SAFE_DIAMOND_REFUSAL,
} from "../src/ai/diamondRuntime";

const validReading = `**Pattern**
You keep refining work after it is already usable.

**Why**
Keeping the decision open makes revision feel safer than release.

**Need**
This may protect your need to avoid preventable mistakes.

**Gift**
You notice weak points before they become expensive failures.

**Cost**
The finish line moves and useful work remains unavailable.

**Action**
Define the minimum release standard before revising again today.

**Evidence**
Supported by deterministic Life Path data and recorded behavior answers. Moon and Rising remained unresolved and were excluded.`;

describe("Diamond runtime output firewall", () => {
  it("passes a valid Diamond reading unchanged", () => {
    const result = enforceDiamondRuntimeOutput(validReading);
    expect(result.valid).toBe(true);
    expect(result.content).toBe(validReading);
    expect(result.violations).toEqual([]);
  });

  it("blocks a shallow trait dump before it reaches the user", () => {
    const result = enforceDiamondRuntimeOutput("You are loyal, intense, and analytical.");
    expect(result.valid).toBe(false);
    expect(result.content).toBe(SAFE_DIAMOND_REFUSAL);
    expect(result.violations).toContain("Missing Why");
    expect(result.violations).toContain("Provides no concrete next step.");
  });

  it("blocks unsupported biography even when formatting looks complete", () => {
    const unsafe = validReading.replace(
      "Keeping the decision open makes revision feel safer than release.",
      "You are this way because of your childhood."
    );
    const result = enforceDiamondRuntimeOutput(unsafe);
    expect(result.valid).toBe(false);
    expect(result.content).toContain("did not meet Soul Codex clarity standards");
    expect(result.violations).toContain("Claims unsupported biography or interprets unresolved data.");
  });

  it("returns a complete safe refusal instead of an empty response", () => {
    const result = enforceDiamondRuntimeOutput("");
    expect(result.valid).toBe(false);
    for (const section of ["Pattern", "Why", "Need", "Gift", "Cost", "Action", "Evidence"]) {
      expect(result.content).toContain(`**${section}**`);
    }
  });
});
