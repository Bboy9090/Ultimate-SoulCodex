import { test } from "node:test";
import assert from "node:assert";
import {
  generateSoulGuidePromptText,
  parseSoulGuideResponse,
  saveSoulGuideInterpretation,
  loadSoulGuideInterpretation,
  clearSoulGuideCache,
  type SoulGuideInterpretation,
} from "../index";
import type { TimelineIntelligenceSummary } from "../../timeline-intelligence/types";

// Mock localStorage
const mockStorage: Record<string, string> = {};

const localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  },
};

// Inject mock localStorage into global scope
Object.defineProperty(globalThis, "localStorage", {
  value: localStorage,
  writable: true,
});

test("Soul Guide", async (suite) => {
  await suite.test("generateSoulGuidePromptText generates a prompt with evidence constraints", () => {
    mockStorage.clear?.();
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

    assert.ok(prompt.includes("Never invents"));
    assert.ok(prompt.includes("evidence"));
    assert.ok(prompt.includes("lived experience"));
    assert.ok(prompt.includes("JSON"));
    assert.ok(prompt.includes("Moderate"));
    assert.ok(prompt.includes("10"));
  });

  await suite.test("generateSoulGuidePromptText includes confidence level appropriately", () => {
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

    assert.ok(prompt.includes("Low"));
    assert.ok(prompt.includes("early data"));
  });

  await suite.test("parseSoulGuideResponse parses a valid JSON response", () => {
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

    assert.ok(result !== null);
    assert.equal(result?.theme, "Energy patterns align with lunar cycles");
    assert.ok(result?.narrative.includes("tracking reveals"));
    assert.equal(result?.reflectionPrompts.length, 3);
    assert.equal(result?.nextSteps.length, 2);
    assert.equal(result?.keyInsights.length, 3);
    assert.equal(result?.version, 1);
  });

  await suite.test("parseSoulGuideResponse handles JSON with markdown formatting", () => {
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

    assert.ok(result !== null);
    assert.equal(result?.theme, "Clear alignment pattern");
  });

  await suite.test("parseSoulGuideResponse returns null for invalid JSON", () => {
    const result = parseSoulGuideResponse("not valid json at all");
    assert.equal(result, null);
  });

  await suite.test("parseSoulGuideResponse returns null for missing required fields", () => {
    const response = JSON.stringify({
      theme: "Some theme",
      // Missing narrative, reflectionPrompts, etc
    });

    const result = parseSoulGuideResponse(response);
    assert.equal(result, null);
  });

  await suite.test("parseSoulGuideResponse returns null for non-array reflectionPrompts", () => {
    const response = JSON.stringify({
      theme: "Theme",
      narrative: "Narrative",
      reflectionPrompts: "not an array",
      nextSteps: [],
      keyInsights: [],
    });

    const result = parseSoulGuideResponse(response);
    assert.equal(result, null);
  });

  await suite.test("parseSoulGuideResponse limits results to expected array sizes", () => {
    const response = JSON.stringify({
      theme: "Theme",
      narrative: "Narrative",
      reflectionPrompts: ["a", "b", "c", "d", "e", "f"],
      nextSteps: ["x", "y", "z"],
      keyInsights: ["1", "2", "3", "4"],
    });

    const result = parseSoulGuideResponse(response);

    assert.equal(result?.reflectionPrompts.length, 3);
    assert.equal(result?.nextSteps.length, 2);
    assert.equal(result?.keyInsights.length, 3);
  });

  await suite.test("localStorage - saves interpretation to localStorage", () => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);

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
    assert.ok(stored);

    const parsed = JSON.parse(stored!);
    assert.equal(parsed.theme, "Test theme");
  });

  await suite.test("localStorage - loads interpretation from localStorage", () => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);

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

    assert.ok(loaded !== null);
    assert.equal(loaded?.theme, "Test theme");
    assert.equal(loaded?.version, 1);
  });

  await suite.test("localStorage - returns null when no interpretation exists", () => {
    // Clear all storage first
    Object.keys(mockStorage).forEach((key) => {
      delete mockStorage[key];
    });
    const loaded = loadSoulGuideInterpretation();
    assert.equal(loaded, null);
  });

  await suite.test("localStorage - returns null for invalid stored data", () => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    localStorage.setItem("soulcodex.soulGuide.v1", "invalid json");
    const loaded = loadSoulGuideInterpretation();
    assert.equal(loaded, null);
  });

  await suite.test("localStorage - returns null for missing version field", () => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
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
    assert.equal(loaded, null);
  });

  await suite.test("localStorage - clears cache correctly", () => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);

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
    assert.ok(loadSoulGuideInterpretation() !== null);

    clearSoulGuideCache();
    assert.equal(loadSoulGuideInterpretation(), null);
  });

  await suite.test("evidence constraints - prompt forbids inventing signals", () => {
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

    assert.ok(prompt.includes("Never invents"));
    assert.ok(prompt.includes("Only reference the data above"));
    assert.ok(prompt.includes("NOT to predict"));
  });

  await suite.test("evidence constraints - prompt emphasizes user judgment", () => {
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

    assert.ok(prompt.includes("Respects their judgment"));
    assert.ok(prompt.includes("validate, not dictate"));
  });
});
