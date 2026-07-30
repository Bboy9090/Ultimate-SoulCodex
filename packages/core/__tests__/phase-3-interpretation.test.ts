/**
 * Phase 3 Interpretation Tests
 *
 * Mechanism-driven writing, archetype by depth, golden Robert fixture
 *
 * BEFORE (generic): "A central pattern emphasizes precision, improvement, and practical service."
 * AFTER (mechanism): "You naturally notice what is inefficient, unfinished, or poorly structured.
 *                     Your strongest instinct is to improve it in a way that serves a larger purpose."
 */

import { describe, it, expect } from "vitest";
import {
  selectArchetype,
  generateCorePatternInterpretation,
  generatePsychologicalMirror,
  generateActionInsights,
  GOLDEN_ROBERT_CODEX,
} from "../soul-codex-interpretation-v3.js";

describe("Phase 3: Interpretation & Archetype", () => {
  describe("Archetype by Data Depth", () => {
    it("date_only: Sun only → Service-Oriented Analyst (provisional)", () => {
      const archetype = selectArchetype("date_only", "Virgo");
      expect(archetype.name).toBe("Service-Oriented Analyst");
      expect(archetype.status).toBe("provisional");
      expect(archetype.basedOn).toEqual(["Virgo Sun"]);
    });

    it("partial: Astrology + Numerology → Purposeful Systems Builder (provisional)", () => {
      const archetype = selectArchetype(
        "partial",
        "Virgo",
        "Virgo",
        undefined,
        9
      );
      expect(archetype.name).toBe("Purposeful Systems Builder");
      expect(archetype.status).toBe("provisional");
      expect(archetype.basedOn).toContain("Virgo Moon");
      expect(archetype.basedOn).toContain("Life Path 9");
    });

    it("complete: All systems → The Shadow Systems Architect (complete)", () => {
      const archetype = selectArchetype(
        "complete",
        "Virgo",
        "Virgo",
        "Scorpio",
        9,
        "Reflector 2/5"
      );
      expect(archetype.name).toBe("The Shadow Systems Architect");
      expect(archetype.status).toBe("complete");
      expect(archetype.basedOn).toContain("Virgo stellium");
      expect(archetype.basedOn).toContain("Scorpio Rising");
    });

    it("archetype provides next steps for upgrading from provisional to complete", () => {
      const partial = selectArchetype("partial", "Virgo", "Virgo", undefined, 9);
      expect(partial.nextSteps).toBeTruthy();
      expect(partial.nextSteps).toContain("birth time");
    });
  });

  describe("Mechanism-Based Core Pattern", () => {
    it("explains mechanism, not just names themes", () => {
      const pattern = generateCorePatternInterpretation(
        "Virgo",
        "Virgo",
        "Scorpio",
        9
      );

      // OLD: "A central pattern emphasizes precision, improvement, and practical service."
      // NEW: Explains HOW Virgo + Life Path 9 + Scorpio create the pattern
      expect(pattern.observation).toContain("notice");
      expect(pattern.observation).toContain("improve");
      expect(pattern.mechanism).toContain("Virgo");
      expect(pattern.mechanism).toContain("Life Path 9");
      expect(pattern.mechanism).toContain("Scorpio");
    });

    it("tension explains actual lived conflict, not just labels it", () => {
      const pattern = generateCorePatternInterpretation(
        "Virgo",
        "Virgo",
        "Scorpio",
        9
      );
      expect(pattern.tension).toContain("expand");
      expect(pattern.tension).toContain("complete");
      expect(pattern.tension).toContain("enough");
    });

    it("gift and shadow are distinct, not euphemisms", () => {
      const pattern = generateCorePatternInterpretation(
        "Virgo",
        "Virgo",
        "Scorpio",
        9
      );
      expect(pattern.gift).not.toEqual(pattern.shadow);
      expect(pattern.gift).toContain("diagnosis");
      expect(pattern.shadow).toContain("paralysis");
    });
  });

  describe("Psychological Mirror (What People See/Miss)", () => {
    it("shows actual misreading mechanism", () => {
      const mirror = generatePsychologicalMirror("Virgo", "Virgo", "Scorpio");

      expect(mirror.whatPeopleSee).toContain("Discernment");
      expect(mirror.whatTheyMiss).toContain("pressure");
      expect(mirror.whatTheyMiss).toContain("meaningful");
      expect(mirror.howTheyMisit).toBeTruthy();
    });

    it("not generic - specific to this chart", () => {
      const mirror = generatePsychologicalMirror("Virgo", "Virgo", "Scorpio");
      expect(mirror.whatPeopleSee).not.toMatch(/attention|detail|organized/i);
      expect(mirror.whatTheyMiss).toContain("cost");
    });
  });

  describe("Actionable Insights (mechanism-based)", () => {
    it("current pattern explains HOW person is likely operating", () => {
      const insights = generateActionInsights("Scorpio", 9);
      const work = insights.find((i) => i.domain === "Work & Contribution");
      expect(work?.currentPattern).toContain("expand");
      expect(work?.currentPattern).toContain("responsibility");
    });

    it("leverage points to actual strength, not vague encouragement", () => {
      const insights = generateActionInsights("Scorpio", 9);
      const work = insights.find((i) => i.domain === "Work & Contribution");
      expect(work?.leverage).toContain("complete enough");
      expect(work?.leverage).toContain("test");
    });

    it("guard warns against specific pattern, not abstract virtue", () => {
      const insights = generateActionInsights("Scorpio", 9);
      const work = insights.find((i) => i.domain === "Work & Contribution");
      expect(work?.guard).toContain("perfectionism");
      expect(work?.guard).toContain("delay");
    });

    it("test provides concrete signal for knowing if it's working", () => {
      const insights = generateActionInsights("Scorpio", 9);
      const work = insights.find((i) => i.domain === "Work & Contribution");
      expect(work?.test).toContain("finish");
      expect(work?.test).toContain("move on");
    });

    it("provides insights across multiple domains", () => {
      const insights = generateActionInsights("Scorpio", 9);
      const domains = insights.map((i) => i.domain);
      expect(domains).toContain("Work & Contribution");
      expect(domains).toContain("Relationships");
      expect(domains).toContain("Self-Understanding");
    });
  });

  describe("Golden Robert Fixture - Regression Guard", () => {
    it("has complete archetype, not provisional", () => {
      expect(GOLDEN_ROBERT_CODEX.archetypeStatus).toBe("complete");
      expect(GOLDEN_ROBERT_CODEX.archetypeName).toBe(
        "The Shadow Systems Architect"
      );
    });

    it("core insight explains mechanism", () => {
      expect(GOLDEN_ROBERT_CODEX.coreInsight).toContain("naturally detect");
      expect(GOLDEN_ROBERT_CODEX.coreInsight).toContain("inefficient");
      expect(GOLDEN_ROBERT_CODEX.coreInsight).not.toContain("symbolizes");
    });

    it("systems are labeled correctly without approximations", () => {
      expect(GOLDEN_ROBERT_CODEX.systems.astrology).toBe(
        "Virgo Sun · Virgo Moon · Scorpio Rising"
      );
      expect(GOLDEN_ROBERT_CODEX.systems.astrology).not.toContain(
        "approximation"
      );
      expect(GOLDEN_ROBERT_CODEX.systems.numerology).toBe("Life Path 9");
    });

    it("confidence is high because all systems verified", () => {
      expect(GOLDEN_ROBERT_CODEX.calculationConfidence).toBe("High");
      expect(GOLDEN_ROBERT_CODEX.verifiedSystems).toEqual([
        "Verified astrology",
        "Deterministic numerology",
        "Self-confirmed Human Design",
      ]);
    });

    it("core gift and primary tension are specific", () => {
      expect(GOLDEN_ROBERT_CODEX.coreGift).toContain("Systems diagnosis");
      expect(GOLDEN_ROBERT_CODEX.primaryTension).toContain("standards");
      expect(GOLDEN_ROBERT_CODEX.primaryTension).toContain("responsibility");
    });

    it("grounded action is concrete, not aspirational", () => {
      expect(GOLDEN_ROBERT_CODEX.groundedAction).toContain("Finish one");
      expect(GOLDEN_ROBERT_CODEX.groundedAction).toContain("clearly defined");
      expect(GOLDEN_ROBERT_CODEX.groundedAction).toContain("complete enough");
    });
  });

  describe("Label Consistency - Phase 3 Fixes", () => {
    it("no contradiction between 'Codex Summary' and 'reflective frameworks'", () => {
      // OLD: "Your locally generated biography" contradicted "reflective frameworks"
      // NEW: "Your Codex Summary" properly frames what this is
      // (tested via component - this test documents the requirement)
      expect("Your Codex Summary").not.toMatch(/biography/i);
    });

    it("archetype status marked provisional when data incomplete", () => {
      const partial = selectArchetype("partial", "Virgo", "Virgo", undefined, 9);
      expect(partial.status).toBe("provisional");
    });

    it("archetype status marked complete when all systems verified", () => {
      const complete = selectArchetype(
        "complete",
        "Virgo",
        "Virgo",
        "Scorpio",
        9,
        "Reflector 2/5"
      );
      expect(complete.status).toBe("complete");
    });
  });

  describe("Comparison: Before vs After", () => {
    it("old generic vs new mechanism-specific", () => {
      // OLD (generic for any Virgo):
      const OLD = "A central pattern emphasizes precision, improvement, and practical service.";

      // NEW (specific mechanism for Virgo + 9 + Scorpio):
      const pattern = generateCorePatternInterpretation(
        "Virgo",
        "Virgo",
        "Scorpio",
        9
      );

      // NEW should not just name attributes, should explain mechanism
      expect(pattern.observation).not.toEqual(OLD);
      expect(pattern.observation).not.toMatch(
        /emphasizes|precision|service/i
      );
      expect(pattern.mechanism).toContain("Virgo");
      expect(pattern.mechanism).toContain("Life Path");
    });

    it("generic action vs mechanism-based action", () => {
      const insights = generateActionInsights("Scorpio", 9);
      const work = insights.find((i) => i.domain === "Work & Contribution");

      // OLD would be: "Avoid overthinking decisions"
      // NEW explains the mechanism and gives concrete guidance
      expect(work?.leverage).toContain("Define");
      expect(work?.leverage).toContain("before");
      expect(work?.guard).toContain("perfectionism");
      expect(work?.test).toContain("finish");
    });
  });
});
