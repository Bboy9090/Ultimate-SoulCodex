import { test } from "node:test";
import assert from "node:assert";
import {
  DEPTH_INTERPRETATION_LAYER_KEYS,
  type DepthInterpretationV1,
  type InterpretationLayer,
} from "../../depth-interpretation/index.js";
import {
  createDepthSoulGuideFallback,
  generateDepthSoulGuidePrompt,
  generateSoulGuidePromptText,
  parseDepthSoulGuideResponse,
  parseSoulGuideResponse,
  type SoulGuideDepthProseResponse,
} from "../index.js";
import type { TimelineIntelligenceSummary } from "../../timeline-intelligence/types.js";

function layer(title: string): InterpretationLayer {
  return {
    title,
    summary: `${title} is supported by the supplied pattern.`,
    explanation: `${title} describes one possible expression of the supplied evidence without treating it as fixed identity.`,
    claimKind: "inferred",
    evidenceIds: ["mirror.driver"],
    confidence: "high",
    limitations: [
      "This interpretation is limited to the supplied signals.",
      "Lived experience may describe the pattern differently.",
    ],
  };
}

function sourceInterpretation(): DepthInterpretationV1 {
  return {
    version: 1,
    generatedAt: "2026-07-24T17:00:00.000Z",
    claritySummary: layer("Core pattern"),
    visiblePattern: layer("Visible pattern"),
    innerExperience: layer("Inner experience"),
    hiddenNeed: layer("Hidden need"),
    protectiveFunction: layer("Protective function"),
    coreContradiction: layer("Core contradiction"),
    gift: layer("Gift"),
    shadow: layer("Shadow"),
    commonMisreading: layer("Common misreading"),
    relationshipImpact: layer("Relationship impact"),
    decisionImpact: layer("Decision impact"),
    boundaryOrRepair: layer("Boundary or repair"),
    action: layer("Action"),
    evidence: [
      {
        id: "mirror.driver",
        system: "mirror",
        field: "mirror.driver",
        value: "Independence",
        confidence: "high",
        provenanceStatus: "partially-verified",
        timeSensitivity: "none",
        notes: ["User-supplied behavioral driver."],
      },
    ],
    missingData: [],
    overallConfidence: "high",
  };
}

function proseResponse(
  source: DepthInterpretationV1,
): SoulGuideDepthProseResponse {
  return Object.fromEntries(
    DEPTH_INTERPRETATION_LAYER_KEYS.map((key) => [
      key,
      {
        title: source[key].title,
        summary: `Clear rewrite for ${key}.`,
        explanation: `The supplied signals may support this ${key} pattern, while lived experience remains authoritative.`,
      },
    ]),
  ) as unknown as SoulGuideDepthProseResponse;
}

function timelineSummary(): TimelineIntelligenceSummary {
  return {
    version: 1,
    generatedAt: "2026-07-24T17:00:00.000Z",
    sampleSize: 10,
    confidence: "Moderate",
    dateRange: { start: "2026-07-01", end: "2026-07-10" },
    systemSignals: [],
    livedSignals: [],
    matches: [],
    divergences: [],
    alignmentScore: 0.5,
    observations: [],
    nextTrackingSuggestion: null,
  };
}

test("Layered Soul Guide", async (suite) => {
  await suite.test("prompt contains every layer and the evidence boundary", () => {
    const source = sourceInterpretation();
    const prompt = generateDepthSoulGuidePrompt(source);

    for (const key of DEPTH_INTERPRETATION_LAYER_KEYS) {
      assert.ok(prompt.includes(key), `prompt must include ${key}`);
    }

    assert.ok(prompt.includes("You may rewrite prose. You may not rewrite epistemology."));
    assert.ok(prompt.includes("mirror.driver"));
    assert.ok(prompt.includes("Lived experience overrides"));
    assert.ok(prompt.includes("Do not return evidenceIds"));
  });

  await suite.test("prompt forbids biography, trauma, diagnosis, and certainty invention", () => {
    const prompt = generateDepthSoulGuidePrompt(sourceInterpretation());

    assert.ok(prompt.includes("childhood causes"));
    assert.ok(prompt.includes("trauma"));
    assert.ok(prompt.includes("attachment styles"));
    assert.ok(prompt.includes("diagnoses"));
    assert.ok(prompt.includes("Do not predict the future"));
  });

  await suite.test("parser accepts safe prose and preserves locked metadata", () => {
    const source = sourceInterpretation();
    const result = parseDepthSoulGuideResponse(
      JSON.stringify(proseResponse(source)),
      source,
      { birthTimeStatus: "known" },
    );

    assert.ok(result.interpretation);
    assert.deepEqual(result.findings, []);
    assert.deepEqual(result.interpretation?.evidence, source.evidence);
    assert.deepEqual(result.interpretation?.missingData, source.missingData);
    assert.equal(
      result.interpretation?.overallConfidence,
      source.overallConfidence,
    );
    assert.equal(result.interpretation?.generatedAt, source.generatedAt);
    assert.equal(result.interpretation?.version, source.version);

    for (const key of DEPTH_INTERPRETATION_LAYER_KEYS) {
      assert.deepEqual(
        result.interpretation?.[key].evidenceIds,
        source[key].evidenceIds,
      );
      assert.deepEqual(
        result.interpretation?.[key].limitations,
        source[key].limitations,
      );
      assert.equal(
        result.interpretation?.[key].claimKind,
        source[key].claimKind,
      );
      assert.equal(
        result.interpretation?.[key].confidence,
        source[key].confidence,
      );
    }
  });

  await suite.test("parser rejects missing layers", () => {
    const source = sourceInterpretation();
    const prose = proseResponse(source) as unknown as Record<string, unknown>;
    delete prose.hiddenNeed;

    const result = parseDepthSoulGuideResponse(JSON.stringify(prose), source);

    assert.equal(result.interpretation, null);
    assert.ok(result.findings.some((finding) => finding.code === "missing-layer"));
  });

  await suite.test("parser rejects attempts to change locked layer metadata", () => {
    const source = sourceInterpretation();
    const prose = proseResponse(source) as unknown as Record<
      string,
      Record<string, unknown>
    >;
    prose.claritySummary.evidenceIds = ["invented.evidence"];
    prose.claritySummary.confidence = "high";

    const result = parseDepthSoulGuideResponse(JSON.stringify(prose), source);

    assert.equal(result.interpretation, null);
    assert.ok(
      result.findings.some(
        (finding) => finding.code === "attempted-metadata-rewrite",
      ),
    );
  });

  await suite.test("parser rejects attempts to change top-level metadata", () => {
    const source = sourceInterpretation();
    const prose = proseResponse(source) as unknown as Record<string, unknown>;
    prose.evidence = [{ id: "invented.evidence" }];
    prose.overallConfidence = "high";

    const result = parseDepthSoulGuideResponse(JSON.stringify(prose), source);

    assert.equal(result.interpretation, null);
    assert.ok(
      result.findings.some(
        (finding) =>
          finding.code === "attempted-top-level-metadata-rewrite",
      ),
    );
  });

  await suite.test("parser rejects unsafe biography and diagnostic wording", () => {
    const unsafePhrases = [
      "Your childhood taught you never to depend on anyone.",
      "This is a trauma response.",
      "You have an avoidant attachment style.",
      "This diagnosis proves that the pattern is permanent.",
      "You will always repeat this behavior.",
    ];

    for (const unsafe of unsafePhrases) {
      const source = sourceInterpretation();
      const prose = proseResponse(source);
      prose.hiddenNeed.explanation = unsafe;

      const result = parseDepthSoulGuideResponse(
        JSON.stringify(prose),
        source,
      );

      assert.equal(result.interpretation, null, unsafe);
      assert.ok(result.findings.length > 0, unsafe);
    }
  });

  await suite.test("fallback follows clarity-first card order", () => {
    const fallback = createDepthSoulGuideFallback(sourceInterpretation());

    assert.deepEqual(
      fallback.primaryCards.map((card) => card.key),
      ["claritySummary", "coreContradiction", "action"],
    );
    assert.equal(fallback.cards[0].key, "claritySummary");
    assert.equal(fallback.cards[1].key, "coreContradiction");
    assert.equal(fallback.cards[2].key, "action");
  });

  await suite.test("fallback detail cards retain evidence and limitations", () => {
    const fallback = createDepthSoulGuideFallback(sourceInterpretation());

    for (const card of fallback.cards) {
      assert.deepEqual(card.evidenceIds, ["mirror.driver"]);
      assert.ok(card.limitations.length > 0);
      assert.equal(card.confidence, "high");
      assert.equal(card.claimKind, "inferred");
    }

    assert.ok(fallback.markdown.includes("**Evidence:** mirror.driver"));
    assert.ok(fallback.markdown.includes("Lived experience remains"));
  });

  await suite.test("unknown-time degradation survives safe prose rewriting", () => {
    const source = sourceInterpretation();
    source.missingData = [
      "Exact birth time is unknown; Rising sign and time-sensitive Human Design claims are unavailable.",
    ];
    source.overallConfidence = "moderate";

    const result = parseDepthSoulGuideResponse(
      JSON.stringify(proseResponse(source)),
      source,
      { birthTimeStatus: "unknown" },
    );

    assert.ok(result.interpretation);
    assert.deepEqual(result.interpretation?.missingData, source.missingData);
    assert.equal(result.interpretation?.overallConfidence, "moderate");
    assert.equal(
      result.interpretation?.evidence.some(
        (item) => item.timeSensitivity === "birth-time-required",
      ),
      false,
    );
  });

  await suite.test("existing Soul Guide v1 prompt and parser remain compatible", () => {
    const prompt = generateSoulGuidePromptText(timelineSummary());
    assert.ok(prompt.includes('"theme"'));
    assert.ok(prompt.includes('"narrative"'));

    const parsed = parseSoulGuideResponse(
      JSON.stringify({
        theme: "A stable theme",
        narrative: "A stable narrative",
        reflectionPrompts: ["One"],
        nextSteps: ["Two"],
        keyInsights: ["Three"],
      }),
    );

    assert.equal(parsed?.theme, "A stable theme");
    assert.equal(parsed?.version, 1);
  });
});
