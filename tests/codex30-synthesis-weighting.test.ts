import { describe, expect, it } from "vitest";
import { scoreThemes } from "../packages/core/codex30/synth/score";
import type { Signal } from "../packages/core/codex30/types";

function signal(overrides: Partial<Signal> & Pick<Signal, "id" | "system" | "tags">): Signal {
  return {
    label: overrides.id,
    evidence: [overrides.id],
    intensity: 1,
    polarity: "strength",
    confidence: "high",
    ...overrides,
  };
}

describe("Codex30 synthesis weighting", () => {
  it("prevents repeated signals from one symbolic system from dominating by volume", () => {
    const repeatedAspects: Signal[] = Array.from({ length: 8 }, (_, index) =>
      signal({
        id: `aspect.${index}`,
        system: "aspects",
        tags: ["intensity"],
      }),
    );
    const direct = signal({
      id: "moral.decide.analysis",
      system: "moralCompass",
      tags: ["precision"],
      intensity: 0.8,
    });

    const themes = scoreThemes([...repeatedAspects, direct]);
    const intensity = themes.find((theme) => theme.tag === "intensity");
    const precision = themes.find((theme) => theme.tag === "precision");

    expect(intensity?.score).toBe(50);
    expect(intensity?.sources).toHaveLength(8);
    expect(precision?.score).toBe(80);
    expect((precision?.score ?? 0)).toBeGreaterThan(intensity?.score ?? 0);
  });

  it("uses diminishing returns for cross-system symbolic agreement", () => {
    const themes = scoreThemes([
      signal({ id: "astro.sun", system: "astrology", tags: ["craft"] }),
      signal({ id: "num.life", system: "numerology", tags: ["craft"] }),
      signal({ id: "hd.type", system: "humanDesign", tags: ["craft"] }),
      signal({ id: "aspect.trine", system: "aspects", tags: ["craft"] }),
    ]);
    const craft = themes.find((theme) => theme.tag === "craft");

    expect(craft).toBeDefined();
    expect(craft?.score).toBeLessThanOrEqual(75);
    expect(craft?.sources).toHaveLength(4);
  });

  it("lets symbolic systems reinforce a direct behavioral theme without overwhelming it", () => {
    const themes = scoreThemes([
      signal({
        id: "moral.boundary",
        system: "moralCompass",
        tags: ["boundaries"],
        intensity: 0.9,
      }),
      signal({ id: "astro.rising", system: "astrology", tags: ["boundaries"] }),
      signal({ id: "aspect.opposition", system: "aspects", tags: ["boundaries"] }),
      signal({ id: "hd.projector", system: "humanDesign", tags: ["boundaries"] }),
    ]);
    const boundaries = themes.find((theme) => theme.tag === "boundaries");

    expect(boundaries?.score).toBeGreaterThanOrEqual(90);
    expect(boundaries?.score).toBeLessThanOrEqual(115);
    expect(boundaries?.sources).toHaveLength(4);
  });

  it("bounds malformed intensity rather than allowing arbitrary score inflation", () => {
    const themes = scoreThemes([
      signal({
        id: "bad.intensity",
        system: "moralCompass",
        tags: ["truth"],
        intensity: 999,
      }),
    ]);
    expect(themes.find((theme) => theme.tag === "truth")?.score).toBe(100);
  });
});
