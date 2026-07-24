import { test } from "node:test";
import assert from "node:assert";
import {
  DEPTH_INTERPRETATION_LAYER_KEYS,
  validateDepthInterpretationV1,
  type DepthInterpretationV1,
  type InterpretationLayer,
} from "../index.js";

function makeLayer(
  overrides: Partial<InterpretationLayer> = {},
): InterpretationLayer {
  return {
    title: "Supported pattern",
    summary: "A supported pattern appears across the supplied data.",
    explanation:
      "The available evidence is consistent enough to describe the pattern without treating it as fixed identity.",
    claimKind: "derived",
    evidenceIds: ["evidence-1"],
    confidence: "moderate",
    limitations: [],
    ...overrides,
  };
}

function makeInterpretation(): DepthInterpretationV1 {
  return {
    version: 1,
    generatedAt: "2026-07-24T12:00:00.000Z",
    claritySummary: makeLayer({
      title: "Core pattern",
      summary: "You may use preparation to create stability before acting.",
    }),
    visiblePattern: makeLayer({ title: "What people see" }),
    innerExperience: makeLayer({ title: "What they may miss" }),
    hiddenNeed: makeLayer({ title: "Need beneath the pattern" }),
    protectiveFunction: makeLayer({ title: "Protective function" }),
    coreContradiction: makeLayer({ title: "Core contradiction" }),
    gift: makeLayer({ title: "Gift" }),
    shadow: makeLayer({ title: "Shadow" }),
    commonMisreading: makeLayer({ title: "Common misreading" }),
    relationshipImpact: makeLayer({ title: "Relationship impact" }),
    decisionImpact: makeLayer({ title: "Decision impact" }),
    boundaryOrRepair: makeLayer({ title: "Boundary or repair" }),
    action: makeLayer({
      title: "Grounded action",
      summary: "Name the missing information before delaying the decision.",
    }),
    evidence: [
      {
        id: "evidence-1",
        system: "tracker",
        field: "decisionDelayAfterMissingInformation",
        value: true,
        confidence: "moderate",
        provenanceStatus: "partially-verified",
        timeSensitivity: "none",
      },
    ],
    missingData: [],
    overallConfidence: "moderate",
  };
}

function findingCodes(interpretation: DepthInterpretationV1): string[] {
  return validateDepthInterpretationV1(interpretation).findings.map(
    (finding) => finding.code,
  );
}

test("Depth Interpretation contract", async (suite) => {
  await suite.test("accepts a valid complete interpretation", () => {
    const result = validateDepthInterpretationV1(makeInterpretation(), {
      birthTimeStatus: "known",
    });

    assert.equal(result.valid, true);
    assert.deepEqual(result.findings, []);
  });

  await suite.test("reports an evidence ID missing from the evidence collection", () => {
    const interpretation = makeInterpretation();
    interpretation.visiblePattern.evidenceIds = ["missing-evidence"];

    const result = validateDepthInterpretationV1(interpretation);

    assert.equal(result.valid, false);
    assert.ok(
      result.findings.some(
        (finding) =>
          finding.code === "missing-evidence-reference" &&
          finding.path === "visiblePattern.evidenceIds[0]",
      ),
    );
  });

  await suite.test("rejects unsupported overall high confidence", () => {
    const interpretation = makeInterpretation();
    interpretation.overallConfidence = "high";
    interpretation.evidence[0].provenanceStatus = "unverified";

    assert.ok(
      findingCodes(interpretation).includes(
        "unsupported-overall-high-confidence",
      ),
    );
  });

  await suite.test("rejects an inference without limitations", () => {
    const interpretation = makeInterpretation();
    interpretation.hiddenNeed = makeLayer({
      claimKind: "inferred",
      limitations: [],
    });

    assert.ok(
      findingCodes(interpretation).includes("inference-without-limitations"),
    );
  });

  await suite.test("rejects time-sensitive evidence when birth time is unknown", () => {
    const interpretation = makeInterpretation();
    interpretation.evidence.push({
      id: "birth-time-evidence",
      system: "astrology",
      field: "ascendant",
      value: "Scorpio",
      confidence: "moderate",
      provenanceStatus: "partially-verified",
      timeSensitivity: "birth-time-required",
    });
    interpretation.visiblePattern.evidenceIds = ["birth-time-evidence"];

    const result = validateDepthInterpretationV1(interpretation, {
      birthTimeStatus: "unknown",
    });

    assert.equal(result.valid, false);
    assert.ok(
      result.findings.some(
        (finding) => finding.code === "unknown-time-sensitive-claim",
      ),
    );
  });

  await suite.test("rejects an unavailable layer that still makes a confident claim", () => {
    const interpretation = makeInterpretation();
    interpretation.innerExperience = makeLayer({
      summary: "A hidden emotional state is certainly present.",
      explanation: "The system can explain the private cause without source data.",
      claimKind: "unavailable",
      confidence: "high",
      evidenceIds: [],
    });

    const codes = findingCodes(interpretation);

    assert.ok(codes.includes("unavailable-with-confidence"));
    assert.ok(codes.includes("unavailable-with-explanatory-claim"));
  });

  await suite.test("reports empty clarity and action layers", () => {
    const interpretation = makeInterpretation();
    interpretation.claritySummary.summary = "";
    interpretation.action.summary = "";
    interpretation.action.explanation = "";

    const codes = findingCodes(interpretation);

    assert.ok(codes.includes("empty-clarity-summary"));
    assert.ok(codes.includes("empty-action"));
  });

  await suite.test("rejects deterministic or diagnostic wording", () => {
    const interpretation = makeInterpretation();
    interpretation.shadow.summary = "You will always repeat this behavior.";
    interpretation.shadow.explanation =
      "This is a personality disorder diagnosis.";

    const codes = findingCodes(interpretation);

    assert.ok(codes.includes("deterministic-wording"));
    assert.ok(codes.includes("diagnostic-wording"));
  });

  await suite.test("preserves the stable v1 layer order and serializable shape", () => {
    const interpretation = makeInterpretation();
    const serialized = JSON.stringify(interpretation);

    assert.deepEqual(DEPTH_INTERPRETATION_LAYER_KEYS, [
      "claritySummary",
      "visiblePattern",
      "innerExperience",
      "hiddenNeed",
      "protectiveFunction",
      "coreContradiction",
      "gift",
      "shadow",
      "commonMisreading",
      "relationshipImpact",
      "decisionImpact",
      "boundaryOrRepair",
      "action",
    ]);
    assert.deepEqual(JSON.parse(serialized), interpretation);
  });
});
