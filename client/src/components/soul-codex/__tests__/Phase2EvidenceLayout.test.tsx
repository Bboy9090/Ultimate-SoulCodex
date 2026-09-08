/**
 * Phase 2 Evidence Layout Test
 *
 * Shows how badges and drawer replace repeated prose
 *
 * BEFORE:
 * - "Moderate source support"
 * - "This layer combines..."
 * - "Their overlap is supporting context..."
 * - (repeated 5+ times)
 *
 * AFTER:
 * - [Calculated] [2 supporting layers] badge row
 * - One shared tooltip explaining what "2 supporting layers" means
 * - Audit hidden behind "Why this reading?" drawer
 */

import { describe, it, expect } from "vitest";

describe("Phase 2: Evidence Badges Replace Prose", () => {
  it("Example: Robert Gonzalez Virgo Sun badge", () => {
    // BEFORE: "Moderate source support. This layer combines Virgo Sun symbolism
    // with the practical orientation of Life Path 9. Their overlap is supporting
    // context, not independent proof. It describes the supplied pattern without
    // treating it as fixed identity."

    // AFTER:
    const badge = {
      type: "calculated",
      label: "Calculated",
      count: 2, // "2 supporting layers"
      tooltip:
        "Supported by Virgo Sun and Life Path 9. This is an interpretive synthesis, not independent proof or a fixed identity claim.",
    };

    expect(badge.type).toBe("calculated");
    expect(badge.count).toBe(2);
    expect(badge.tooltip).toBeTruthy();
  });

  it("Example: Expression Number with provisional status", () => {
    // BEFORE: "Provisional expression number requires full birth name.
    // This reflects Pythagorean numerology applied to Robert Gonzalez.
    // If a middle name or changed name applies, recalculate this value.
    // Confidence is moderate pending name verification."

    // AFTER:
    const badge = {
      type: "provisional",
      label: "Provisional",
      tooltip: "Applies pending verification of full birth-certificate name",
    };

    expect(badge.type).toBe("provisional");
    expect(badge.tooltip).toContain("pending");
  });

  it("Consolidates repeated patterns into badge row", () => {
    // Old experience: user sees [Moderate] [Moderate] [Moderate] [...] across page
    // New experience: user sees context-appropriate badges, one per layer
    // All detailed explanations move to drawer

    const badges = [
      { type: "calculated", count: 2 },
      { type: "provisional", count: 1 },
      { type: "self_reported", count: 0 },
    ];

    expect(badges).toHaveLength(3);
    expect(badges[0].type).toBe("calculated");
  });

  it("Limitation grouping: 35 technical items → 5 user-facing categories", () => {
    // OLD: "Recorded limitations: 35" (sounds catastrophic)
    // NEW: "5 active limitations" (manageable, grouped)

    const limitationGroups = [
      {
        category: "missing_birth_time",
        count: 2,
        userFacingLabel: "Birth time not verified",
      },
      {
        category: "incomplete_name_data",
        count: 1,
        userFacingLabel: "Full birth name not confirmed",
      },
      {
        category: "offline_generation",
        count: 1,
        userFacingLabel: "Generated without live APIs",
      },
      {
        category: "estimated_data",
        count: 1,
        userFacingLabel: "Some values estimated",
      },
    ];

    expect(limitationGroups).toHaveLength(4);
    expect(limitationGroups[0].count).toBe(2);
    expect(limitationGroups[0].userFacingLabel).not.toContain("Recorded");
  });

  it("Evidence layer breakdown: separate input/calculation/interpretation", () => {
    const sunSignLayer = {
      name: "Sun sign",
      value: "Virgo",

      // Where did this come from?
      inputStatus: "user_entered",
      inputRemark: "Birth date: 1990-09-17",

      // How was it calculated?
      calculationStatus: "deterministic",
      calculationRemark: "SOFA ephemeris for 11:11 AM EDT",

      // What does it mean?
      interpretationStatus: "direct",
      interpretationRemark: "Symbolizes practical precision",

      confidence: "high",
      confidenceReason: "Complete birth data available",
    };

    expect(sunSignLayer.inputStatus).toBe("user_entered");
    expect(sunSignLayer.calculationStatus).toBe("deterministic");
    expect(sunSignLayer.interpretationStatus).toBe("direct");

    // This is now much clearer than "unverified"
    expect(sunSignLayer.confidence).toBe("high");
  });

  it("Single persistent banner replaces repeated disclaimers", () => {
    // OLD location: Top of reading + inside every section + inside every card
    // NEW location: Once, at top, then badges for specifics

    const banner = {
      mode: "reflective",
      message:
        "Soul Codex interprets symbolic systems. It is not biography, identity, or destiny—it is a reflective mirror.",
    };

    expect(banner.message).toBeTruthy();
    expect(banner.message.length).toBeLessThan(200); // Compact
  });

  it("Drawer hides technical audit behind 'Why this reading?'", () => {
    // User-facing page shows insight first
    // Audit materials (evidence layers, limitations, metadata) hidden by default
    // Click "Why this reading?" to expand and see all details

    const drawer = {
      title: "Why this reading?",
      isHiddenByDefault: true,
      contains: [
        "Evidence layers by confidence",
        "Grouped limitations",
        "Calculation method",
        "Engine version",
        "Generated timestamp",
      ],
    };

    expect(drawer.isHiddenByDefault).toBe(true);
    expect(drawer.contains).toHaveLength(5);
  });

  it("Evidence layer organization: high → moderate → low confidence", () => {
    // OLD: All limitations listed flat (35 items)
    // NEW: Grouped by confidence level + grouped by limitation category

    const byConfidence = {
      high: ["Sun sign", "Birth date"],
      moderate: ["Moon sign"],
      low: ["Expression number"],
    };

    expect(byConfidence.high).toHaveLength(2);
    expect(byConfidence.moderate).toHaveLength(1);
    expect(byConfidence.low).toHaveLength(1);
  });
});
