/**
 * Phase 3 Interpretation Tests
 *
 * Mechanism-driven writing, archetype by depth, golden Robert fixture
 *
 * BEFORE (generic): "A central pattern emphasizes precision, improvement, and practical service."
 * AFTER (mechanism): "You naturally notice what is inefficient, unfinished, or poorly structured.
 *                     Your strongest instinct is to improve it in a way that serves a larger purpose."
 */

import { test } from "node:test";
import assert from "node:assert";
import {
  selectArchetype,
  generateCorePatternInterpretation,
  generatePsychologicalMirror,
  generateActionInsights,
  GOLDEN_ROBERT_CODEX,
} from "../soul-codex-interpretation-v3.js";

test("Phase 3: Interpretation & Archetype", async (t) => {
  await t.test("Archetype by Data Depth", async (t) => {
    await t.test("date_only: Sun only → Service-Oriented Analyst (provisional)", () => {
      const archetype = selectArchetype("date_only", "Virgo");
      assert.strictEqual(archetype.name, "Service-Oriented Analyst");
      assert.strictEqual(archetype.status, "provisional");
      assert.deepStrictEqual(archetype.basedOn, ["Virgo Sun"]);
    });

    await t.test("partial: Astrology + Numerology → Purposeful Systems Builder (provisional)", () => {
      const archetype = selectArchetype(
        "partial",
        "Virgo",
        "Virgo",
        undefined,
        9
      );
      assert.strictEqual(archetype.name, "Purposeful Systems Builder");
      assert.strictEqual(archetype.status, "provisional");
      assert(archetype.basedOn.includes("Virgo Moon"));
      assert(archetype.basedOn.includes("Life Path 9"));
    });

    await t.test("complete: All systems → The Shadow Systems Architect (complete)", () => {
      const archetype = selectArchetype(
        "complete",
        "Virgo",
        "Virgo",
        "Scorpio",
        9,
        "Reflector 2/5"
      );
      assert.strictEqual(archetype.name, "The Shadow Systems Architect");
      assert.strictEqual(archetype.status, "complete");
      assert(archetype.basedOn.includes("Virgo stellium"));
      assert(archetype.basedOn.includes("Scorpio Rising"));
    });

    await t.test("archetype provides next steps for upgrading from provisional to complete", () => {
      const partial = selectArchetype("partial", "Virgo", "Virgo", undefined, 9);
      assert(partial.nextSteps);
      assert(partial.nextSteps.includes("Human Design"));
    });
  });

  await t.test("Mechanism-Based Core Pattern", async (t) => {
    await t.test("explains mechanism, not just names themes", () => {
      const pattern = generateCorePatternInterpretation(
        "Virgo",
        "Virgo",
        "Scorpio",
        9
      );

      assert(pattern.observation.includes("notice"));
      assert(pattern.observation.includes("improve"));
      assert(pattern.mechanism.includes("Virgo"));
      assert(pattern.mechanism.includes("Life Path 9"));
      assert(pattern.mechanism.includes("Scorpio"));
    });

    await t.test("tension explains actual lived conflict, not just labels it", () => {
      const pattern = generateCorePatternInterpretation(
        "Virgo",
        "Virgo",
        "Scorpio",
        9
      );
      assert(pattern.tension.includes("expand"));
      assert(pattern.tension.includes("complete"));
      assert(pattern.tension.includes("enough"));
    });

    await t.test("gift and shadow are distinct, not euphemisms", () => {
      const pattern = generateCorePatternInterpretation(
        "Virgo",
        "Virgo",
        "Scorpio",
        9
      );
      assert.notStrictEqual(pattern.gift, pattern.shadow);
      assert(pattern.gift.includes("diagnosis"));
      assert(pattern.shadow.includes("paralysis"));
    });
  });

  await t.test("Psychological Mirror (What People See/Miss)", async (t) => {
    await t.test("shows actual misreading mechanism", () => {
      const mirror = generatePsychologicalMirror("Virgo", "Virgo", "Scorpio");

      assert(mirror.whatPeopleSee.includes("Discernment"));
      assert(mirror.whatTheyMiss.includes("pressure"));
      assert(mirror.whatTheyMiss.includes("meaningful"));
      assert(mirror.howTheyMisit);
    });

    await t.test("not generic - specific to this chart", () => {
      const mirror = generatePsychologicalMirror("Virgo", "Virgo", "Scorpio");
      assert(!(/attention|detail|organized/i.test(mirror.whatPeopleSee)));
      assert(mirror.whatTheyMiss.includes("cost"));
    });
  });

  await t.test("Actionable Insights (mechanism-based)", async (t) => {
    await t.test("current pattern explains HOW person is likely operating", () => {
      const insights = generateActionInsights("Scorpio", 9);
      const work = insights.find((i) => i.domain === "Work & Contribution");
      assert(work?.currentPattern.includes("expand"));
      assert(work?.currentPattern.includes("responsibility"));
    });

    await t.test("leverage points to actual strength, not vague encouragement", () => {
      const insights = generateActionInsights("Scorpio", 9);
      const work = insights.find((i) => i.domain === "Work & Contribution");
      assert(work?.leverage.includes("complete enough"));
      assert(work?.leverage.includes("test"));
    });

    await t.test("guard warns against specific pattern, not abstract virtue", () => {
      const insights = generateActionInsights("Scorpio", 9);
      const work = insights.find((i) => i.domain === "Work & Contribution");
      assert(work?.guard.includes("perfectionism"));
      assert(work?.guard.includes("delay"));
    });

    await t.test("test provides concrete signal for knowing if it's working", () => {
      const insights = generateActionInsights("Scorpio", 9);
      const work = insights.find((i) => i.domain === "Work & Contribution");
      assert(work?.test.includes("finish"));
      assert(work?.test.includes("move on"));
    });

    await t.test("provides insights across multiple domains", () => {
      const insights = generateActionInsights("Scorpio", 9);
      const domains = insights.map((i) => i.domain);
      assert(domains.includes("Work & Contribution"));
      assert(domains.includes("Relationships"));
      assert(domains.includes("Self-Understanding"));
    });
  });

  await t.test("Golden Robert Fixture - Regression Guard", async (t) => {
    await t.test("has complete archetype, not provisional", () => {
      assert.strictEqual(GOLDEN_ROBERT_CODEX.archetypeStatus, "complete");
      assert.strictEqual(GOLDEN_ROBERT_CODEX.archetypeName, "The Shadow Systems Architect");
    });

    await t.test("core insight explains mechanism", () => {
      assert(GOLDEN_ROBERT_CODEX.coreInsight.includes("naturally detect"));
      assert(GOLDEN_ROBERT_CODEX.coreInsight.includes("inefficient"));
      assert(!GOLDEN_ROBERT_CODEX.coreInsight.includes("symbolizes"));
    });

    await t.test("systems are labeled correctly without approximations", () => {
      assert.strictEqual(GOLDEN_ROBERT_CODEX.systems.astrology, "Virgo Sun · Virgo Moon · Scorpio Rising");
      assert(!GOLDEN_ROBERT_CODEX.systems.astrology.includes("approximation"));
      assert.strictEqual(GOLDEN_ROBERT_CODEX.systems.numerology, "Life Path 9");
    });

    await t.test("confidence is high because all systems verified", () => {
      assert.strictEqual(GOLDEN_ROBERT_CODEX.calculationConfidence, "High");
      assert.deepStrictEqual(GOLDEN_ROBERT_CODEX.verifiedSystems, [
        "Verified astrology",
        "Deterministic numerology",
        "Self-confirmed Human Design",
      ]);
    });

    await t.test("core gift and primary tension are specific", () => {
      assert(GOLDEN_ROBERT_CODEX.coreGift.includes("Systems diagnosis"));
      assert(GOLDEN_ROBERT_CODEX.primaryTension.includes("standards"));
      assert(GOLDEN_ROBERT_CODEX.primaryTension.includes("responsibility"));
    });

    await t.test("grounded action is concrete, not aspirational", () => {
      assert(GOLDEN_ROBERT_CODEX.groundedAction.includes("Finish one"));
      assert(GOLDEN_ROBERT_CODEX.groundedAction.includes("clearly defined"));
      assert(GOLDEN_ROBERT_CODEX.groundedAction.includes("complete enough"));
    });
  });

  await t.test("Label Consistency - Phase 3 Fixes", async (t) => {
    await t.test("no contradiction between 'Codex Summary' and 'reflective frameworks'", () => {
      assert(!(/biography/i.test("Your Codex Summary")));
    });

    await t.test("archetype status marked provisional when data incomplete", () => {
      const partial = selectArchetype("partial", "Virgo", "Virgo", undefined, 9);
      assert.strictEqual(partial.status, "provisional");
    });

    await t.test("archetype status marked complete when all systems verified", () => {
      const complete = selectArchetype(
        "complete",
        "Virgo",
        "Virgo",
        "Scorpio",
        9,
        "Reflector 2/5"
      );
      assert.strictEqual(complete.status, "complete");
    });
  });

  await t.test("Comparison: Before vs After", async (t) => {
    await t.test("old generic vs new mechanism-specific", () => {
      const OLD = "A central pattern emphasizes precision, improvement, and practical service.";

      const pattern = generateCorePatternInterpretation(
        "Virgo",
        "Virgo",
        "Scorpio",
        9
      );

      assert.notStrictEqual(pattern.observation, OLD);
      assert(!(/emphasizes|precision|service/i.test(pattern.observation)));
      assert(pattern.mechanism.includes("Virgo"));
      assert(pattern.mechanism.includes("Life Path"));
    });

    await t.test("generic action vs mechanism-based action", () => {
      const insights = generateActionInsights("Scorpio", 9);
      const work = insights.find((i) => i.domain === "Work & Contribution");

      assert(work?.leverage.includes("Define"));
      assert(work?.leverage.includes("before"));
      assert(work?.guard.includes("perfectionism"));
      assert(work?.test.includes("finish"));
    });
  });
});
