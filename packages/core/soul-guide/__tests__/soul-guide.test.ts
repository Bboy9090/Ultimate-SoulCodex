import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  generateSoulGuidePromptText,
  parseSoulGuideResponse,
  saveSoulGuideInterpretation,
  loadSoulGuideInterpretation,
  clearSoulGuideCache,
  type SoulGuideInterpretation,
} from "../index";
import type { TimelineIntelligenceSummary } from "../../timeline-intelligence/types";

describe("Soul Guide", () => {
  // Mock localStorage
  beforeEach(() => {
    // Clear any existing data
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("generateSoulGuidePromptText", () => {
    it("generates a prompt with evidence constraints", () => {
      const summary: TimelineIntelligenceSummary = {
        version: 1,
        generatedAt: new Date().toISOString(),
        sampleSize: 10,
        confidence: "Moderate",
        dateRange: { start: "2026-01-01", end: "2026-01-10" },
        systemSignals: [
          {
            date: "2026-01-10",
            system: "personal-year",
            value: 5,
            label: "Year 5",
            description: "Power & Expansion",
          },
        ],
        livedSignals: [
          {
            dateRange: { start: "2026-01-01", end: "2026-01-10" },
            metric: "energy",
            value: 4,
          },
        ],
        matches: [],
        divergences: [],
        alignmentScore: 0.7,
        observations: ["Energy remained steady at 4 across the tracking period"],
        nextTrackingSuggestion: "Continue tracking for more data",
      };

      const prompt = generateSoulGuidePromptText(summary);

      expect(prompt).toContain("Never invents");
      expect(prompt).toContain("evidence");
      expect(prompt).toContain("lived experience");
      expect(prompt).toContain("JSON");
      expect(prompt).toContain("Moderate");
      expect(prompt).toContain("10");
    });

    it("includes confidence level appropriately", () => {
      const summary: TimelineIntelligenceSummary = {
        version: 1,
        generatedAt: new Date().toISOString(),
        sampleSize: 3,
        confidence: "Low",
        dateRange: { start: "2026-01-01", end: "2026-01-03" },
        systemSignals: [],
        livedSignals: [],
        matches: [],
        divergences: [],
        alignmentScore: 0,
        observations: [],
        nextTrackingSuggestion: null,
      };

      const prompt = generateSoulGuidePromptText(summary);

      expect(prompt).toContain("Low");
      expect(prompt).toContain("early data");
    });
  });

  describe("parseSoulGuideResponse", () => {
    it("parses a valid JSON response", () => {
      const response = JSON.stringify({
        theme: "Energy patterns align with lunar cycles",
        narrative:
          "Your tracking reveals a pattern: high energy during waxing moon phases.",
        reflectionPrompts: [
          "How does moon awareness shift your daily practice?",
          "What practices support steady energy?",
          "Where do you feel most aligned?",
        ],
        nextSteps: [
          "Track energy around the full moon this cycle",
          "Note any shifts at the new moon",
        ],
        keyInsights: [
          "Energy stability is your baseline",
          "Lunar phases correlate with mood shifts",
          "Alignment improves with intentional reflection",
        ],
      });

      const result = parseSoulGuideResponse(response);

      expect(result).not.toBeNull();
      expect(result?.theme).toBe("Energy patterns align with lunar cycles");
      expect(result?.narrative).toContain("tracking reveals");
      expect(result?.reflectionPrompts).toHaveLength(3);
      expect(result?.nextSteps).toHaveLength(2);
      expect(result?.keyInsights).toHaveLength(3);
      expect(result?.version).toBe(1);
    });

    it("handles JSON with markdown formatting", () => {
      const response = `Here's the interpretation:

\`\`\`json
{
  "theme": "Clear alignment pattern",
  "narrative": "Your data shows consistency.",
  "reflectionPrompts": ["Why is stability important?"],
  "nextSteps": ["Continue tracking"],
  "keyInsights": ["You are consistent"]
}
\`\`\``;

      const result = parseSoulGuideResponse(response);

      expect(result).not.toBeNull();
      expect(result?.theme).toBe("Clear alignment pattern");
    });

    it("returns null for invalid JSON", () => {
      const result = parseSoulGuideResponse("not valid json at all");
      expect(result).toBeNull();
    });

    it("returns null for missing required fields", () => {
      const response = JSON.stringify({
        theme: "Some theme",
        // Missing narrative, reflectionPrompts, etc
      });

      const result = parseSoulGuideResponse(response);
      expect(result).toBeNull();
    });

    it("returns null for non-array reflectionPrompts", () => {
      const response = JSON.stringify({
        theme: "Theme",
        narrative: "Narrative",
        reflectionPrompts: "not an array",
        nextSteps: [],
        keyInsights: [],
      });

      const result = parseSoulGuideResponse(response);
      expect(result).toBeNull();
    });

    it("limits results to expected array sizes", () => {
      const response = JSON.stringify({
        theme: "Theme",
        narrative: "Narrative",
        reflectionPrompts: ["a", "b", "c", "d", "e", "f"], // more than 3
        nextSteps: ["x", "y", "z"], // more than 2
        keyInsights: ["1", "2", "3", "4"], // more than 3
      });

      const result = parseSoulGuideResponse(response);

      expect(result?.reflectionPrompts).toHaveLength(3);
      expect(result?.nextSteps).toHaveLength(2);
      expect(result?.keyInsights).toHaveLength(3);
    });
  });

  describe("localStorage persistence", () => {
    it("saves interpretation to localStorage", () => {
      const interpretation: SoulGuideInterpretation = {
        version: 1,
        generatedAt: new Date().toISOString(),
        theme: "Test theme",
        narrative: "Test narrative",
        reflectionPrompts: ["Q1", "Q2", "Q3"],
        nextSteps: ["S1", "S2"],
        keyInsights: ["I1", "I2", "I3"],
        dataPointsAnalyzed: 10,
        confidenceInInterpretation: "High",
      };

      saveSoulGuideInterpretation(interpretation);

      const stored = localStorage.getItem("soulcodex.soulGuide.v1");
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.theme).toBe("Test theme");
    });

    it("loads interpretation from localStorage", () => {
      const interpretation: SoulGuideInterpretation = {
        version: 1,
        generatedAt: new Date().toISOString(),
        theme: "Test theme",
        narrative: "Test narrative",
        reflectionPrompts: ["Q1"],
        nextSteps: ["S1"],
        keyInsights: ["I1"],
        dataPointsAnalyzed: 5,
        confidenceInInterpretation: "Moderate",
      };

      saveSoulGuideInterpretation(interpretation);
      const loaded = loadSoulGuideInterpretation();

      expect(loaded).not.toBeNull();
      expect(loaded?.theme).toBe("Test theme");
      expect(loaded?.version).toBe(1);
    });

    it("returns null when no interpretation exists", () => {
      const loaded = loadSoulGuideInterpretation();
      expect(loaded).toBeNull();
    });

    it("returns null for invalid stored data", () => {
      localStorage.setItem("soulcodex.soulGuide.v1", "invalid json");
      const loaded = loadSoulGuideInterpretation();
      expect(loaded).toBeNull();
    });

    it("returns null for missing version field", () => {
      const invalid = {
        theme: "Theme",
        narrative: "Narrative",
        reflectionPrompts: [],
        nextSteps: [],
        keyInsights: [],
        // Missing version
      };
      localStorage.setItem("soulcodex.soulGuide.v1", JSON.stringify(invalid));
      const loaded = loadSoulGuideInterpretation();
      expect(loaded).toBeNull();
    });

    it("clears cache correctly", () => {
      const interpretation: SoulGuideInterpretation = {
        version: 1,
        generatedAt: new Date().toISOString(),
        theme: "Theme",
        narrative: "Narrative",
        reflectionPrompts: ["Q"],
        nextSteps: ["S"],
        keyInsights: ["I"],
        dataPointsAnalyzed: 0,
        confidenceInInterpretation: "Low",
      };

      saveSoulGuideInterpretation(interpretation);
      expect(loadSoulGuideInterpretation()).not.toBeNull();

      clearSoulGuideCache();
      expect(loadSoulGuideInterpretation()).toBeNull();
    });
  });

  describe("evidence constraints", () => {
    it("prompt forbids inventing signals", () => {
      const summary: TimelineIntelligenceSummary = {
        version: 1,
        generatedAt: new Date().toISOString(),
        sampleSize: 7,
        confidence: "Moderate",
        dateRange: null,
        systemSignals: [],
        livedSignals: [],
        matches: [],
        divergences: [],
        alignmentScore: 0,
        observations: [],
        nextTrackingSuggestion: null,
      };

      const prompt = generateSoulGuidePromptText(summary);

      // Should explicitly forbid inventing evidence
      expect(prompt).toContain("Never invents");
      expect(prompt).toContain("CRITICAL CONSTRAINTS");
      expect(prompt).toContain("Only reference the data above");
    });

    it("prompt emphasizes user judgment", () => {
      const summary: TimelineIntelligenceSummary = {
        version: 1,
        generatedAt: new Date().toISOString(),
        sampleSize: 14,
        confidence: "High",
        dateRange: null,
        systemSignals: [],
        livedSignals: [],
        matches: [],
        divergences: [],
        alignmentScore: 0.5,
        observations: [],
        nextTrackingSuggestion: null,
      };

      const prompt = generateSoulGuidePromptText(summary);

      expect(prompt).toContain("Respects their judgment");
      expect(prompt).toContain("validate, not dictate");
    });
  });
});
