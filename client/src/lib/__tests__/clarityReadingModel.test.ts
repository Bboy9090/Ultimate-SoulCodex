import { describe, expect, it } from "vitest";
import { buildClarityReadingModel, firstSupportedText } from "../clarityReadingModel";

describe("clarityReadingModel", () => {
  it("uses the first meaningful supported text", () => {
    expect(firstSupportedText(undefined, "", "  ", "usable", "later")).toBe("usable");
  });

  it("prefers independently verified astronomy over symbolic fallback", () => {
    const model = buildClarityReadingModel({
      verifiedAstrologyData: {
        sun: { sign: "Virgo" },
        moon: { sign: "Scorpio" },
      },
      astrologyData: {
        sunSign: "Leo",
        moonSign: "Gemini",
      },
      numerologyData: { lifePath: 9 },
      archetypeData: { title: "Sacred Guardian" },
    });

    expect(model.title).toBe("Sacred Guardian");
    expect(model.signals).toContainEqual(
      expect.objectContaining({ id: "sun", value: "Virgo", confidence: "verified" }),
    );
    expect(model.signals).not.toContainEqual(
      expect.objectContaining({ id: "sun-symbolic", value: "Leo" }),
    );
    expect(model.signals).toContainEqual(
      expect.objectContaining({ id: "life-path", value: "9", confidence: "deterministic" }),
    );
  });

  it("labels local symbolic Sun as supported rather than verified", () => {
    const model = buildClarityReadingModel({
      astrologyData: { sunSign: "Virgo" },
      numerologyData: { lifePath: 9 },
    });

    expect(model.signals).toContainEqual(
      expect.objectContaining({
        id: "sun-symbolic",
        value: "Virgo",
        confidence: "supported",
      }),
    );
    expect(model.limitations[0]).toMatch(/No independently verified/);
  });

  it("does not invent Moon or Rising signals when they are missing", () => {
    const model = buildClarityReadingModel({
      astrologyData: { sunSign: "Virgo" },
    });

    expect(model.signals.some((signal) => signal.id === "moon")).toBe(false);
    expect(model.signals.some((signal) => signal.id === "rising")).toBe(false);
  });

  it("uses direct depth interpretation before generic fallbacks", () => {
    const model = buildClarityReadingModel({
      depthInterpretation: {
        title: "Quiet Precision",
        summary: "You create order before you trust movement.",
        visiblePattern: "You notice what others skip.",
        protectiveFunction: "Precision protects against preventable chaos.",
        gift: "Discernment becomes practical care.",
        cost: "Refinement becomes delay.",
        relationshipImpact: "You may correct before first acknowledging.",
        groundedAction: "Name what is already good before suggesting a repair.",
      },
      biography: "Lower-priority biography",
    });

    expect(model).toMatchObject({
      title: "Quiet Precision",
      summary: "You create order before you trust movement.",
      visiblePattern: "You notice what others skip.",
      protectiveFunction: "Precision protects against preventable chaos.",
      gift: "Discernment becomes practical care.",
      cost: "Refinement becomes delay.",
      relationshipImpact: "You may correct before first acknowledging.",
      groundedAction: "Name what is already good before suggesting a repair.",
    });
  });

  it("normalizes nested offline depth sections into the same reading contract", () => {
    const model = buildClarityReadingModel({
      depthInterpretation: {
        claritySummary: {
          title: "The Quiet Guardian",
          summary: "You stabilize the room before naming what you need.",
        },
        behavior: { summary: "You notice pressure before other people name it." },
        protectiveFunction: { summary: "Preparedness protects emotional safety." },
        gift: { summary: "Your awareness becomes steady practical care." },
        shadow: { summary: "Responsibility can become silent resentment." },
        relationshipImpact: { summary: "You may help before asking whether help is wanted." },
        action: { summary: "Ask one direct question before solving the problem." },
      },
      numerologyData: { lifePath: 9, expression: 4, soulUrge: 5 },
    });

    expect(model).toMatchObject({
      title: "The Quiet Guardian",
      summary: "You stabilize the room before naming what you need.",
      visiblePattern: "You notice pressure before other people name it.",
      protectiveFunction: "Preparedness protects emotional safety.",
      gift: "Your awareness becomes steady practical care.",
      cost: "Responsibility can become silent resentment.",
      relationshipImpact: "You may help before asking whether help is wanted.",
      groundedAction: "Ask one direct question before solving the problem.",
    });
    expect(model.signals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "life-path", confidence: "deterministic" }),
        expect.objectContaining({ id: "expression", confidence: "deterministic" }),
        expect.objectContaining({ id: "soul-urge", confidence: "deterministic" }),
      ]),
    );
  });
});
