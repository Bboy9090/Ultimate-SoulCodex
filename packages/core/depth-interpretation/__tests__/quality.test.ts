import { test } from "node:test";
import assert from "node:assert";
import {
  DEPTH_INTERPRETATION_LAYER_KEYS,
  type DepthInterpretationV1,
  type InterpretationLayer,
} from "../types.js";
import {
  DEPTH_QUALITY_FIXTURES,
  createStrongDepthQualityFixture,
} from "../quality-fixtures.js";
import { evaluateDepthInterpretationQuality } from "../quality.js";

function clone(
  interpretation: DepthInterpretationV1,
): DepthInterpretationV1 {
  return JSON.parse(JSON.stringify(interpretation)) as DepthInterpretationV1;
}

function unavailableLayer(title: string, reason: string): InterpretationLayer {
  return {
    title,
    summary: `Unavailable: ${reason}`,
    explanation: `Insufficient data: ${reason}`,
    claimKind: "unavailable",
    evidenceIds: [],
    confidence: "low",
    limitations: [reason],
  };
}

function findingCodes(
  result: ReturnType<typeof evaluateDepthInterpretationQuality>,
): Set<string> {
  return new Set(result.findings.map((finding) => finding.code));
}

test("Depth interpretation quality gates", async (suite) => {
  await suite.test("locks regression corpus outcomes", () => {
    for (const fixture of DEPTH_QUALITY_FIXTURES) {
      const result = evaluateDepthInterpretationQuality(
        fixture.interpretation,
        { birthTimeStatus: fixture.birthTimeStatus },
      );
      const codes = findingCodes(result);

      assert.equal(result.pass, fixture.expectedPass, fixture.id);
      for (const expectedCode of fixture.expectedFindingCodes) {
        assert.ok(codes.has(expectedCode), `${fixture.id} missing ${expectedCode}`);
      }
    }
  });

  await suite.test("strong fixture passes at full score", () => {
    const result = evaluateDepthInterpretationQuality(
      createStrongDepthQualityFixture(),
      { birthTimeStatus: "known" },
    );

    assert.equal(result.pass, true);
    assert.equal(result.score, 100);
    assert.deepEqual(result.findings, []);
    assert.equal(result.metrics.availableLayers, 13);
    assert.equal(result.metrics.unavailableLayers, 0);
    assert.equal(result.metrics.totalEvidence, 4);
    assert.equal(result.metrics.evidenceSystems, 4);
  });

  await suite.test("honest unknown-time fixture passes with visible warning", () => {
    const fixture = DEPTH_QUALITY_FIXTURES.find(
      (item) => item.id === "honest-unknown-time",
    );
    assert.ok(fixture);

    const result = evaluateDepthInterpretationQuality(fixture.interpretation, {
      birthTimeStatus: "unknown",
    });

    assert.equal(result.pass, true);
    assert.equal(result.score, 97);
    assert.ok(findingCodes(result).has("unknown-time-degradation-visible"));
  });

  await suite.test("requires available clarity and action", () => {
    const interpretation = clone(createStrongDepthQualityFixture());
    interpretation.claritySummary = unavailableLayer(
      "Clarity summary",
      "the supplied signals do not support a primary pattern.",
    );
    interpretation.action = unavailableLayer(
      "Action",
      "the supplied signals do not support a grounded next move.",
    );

    const result = evaluateDepthInterpretationQuality(interpretation);
    const codes = findingCodes(result);

    assert.equal(result.pass, false);
    assert.ok(codes.has("clarity-summary-unavailable"));
    assert.ok(codes.has("action-unavailable"));
  });

  await suite.test("allows honest unavailable contradiction with warning", () => {
    const interpretation = clone(createStrongDepthQualityFixture());
    interpretation.coreContradiction = unavailableLayer(
      "Core contradiction",
      "the supplied signals do not support two distinct sides of a tension.",
    );

    const result = evaluateDepthInterpretationQuality(interpretation);

    assert.equal(result.pass, true);
    assert.equal(result.score, 97);
    assert.ok(findingCodes(result).has("contradiction-unavailable"));
  });

  await suite.test("rejects repeated and self-duplicated layer prose", () => {
    const interpretation = clone(createStrongDepthQualityFixture());
    const repeated =
      "The same supported pattern appears here without adding a distinct layer of explanation.";
    interpretation.hiddenNeed.summary = repeated;
    interpretation.protectiveFunction.summary = repeated;
    interpretation.gift.summary = repeated;
    interpretation.shadow.summary = interpretation.shadow.explanation;

    const result = evaluateDepthInterpretationQuality(interpretation);
    const codes = findingCodes(result);

    assert.equal(result.pass, false);
    assert.ok(codes.has("duplicate-layer-summary"));
    assert.ok(codes.has("summary-explanation-duplicate"));
  });

  await suite.test("warns when inferred prose hides calibration", () => {
    const interpretation = clone(createStrongDepthQualityFixture());
    interpretation.hiddenNeed.summary =
      "Reliable autonomy is the central need beneath this pattern in every relevant situation.";
    interpretation.hiddenNeed.explanation =
      "The evidence describes reliable autonomy as the organizing need beneath the visible behavior and surrounding agreement.";

    const result = evaluateDepthInterpretationQuality(interpretation);

    assert.equal(result.pass, true);
    assert.ok(findingCodes(result).has("uncalibrated-inference-language"));
  });

  await suite.test("rejects one-sided contradiction evidence", () => {
    const interpretation = clone(createStrongDepthQualityFixture());
    interpretation.coreContradiction.evidenceIds = ["mirror.driver"];

    const result = evaluateDepthInterpretationQuality(interpretation);

    assert.equal(result.pass, false);
    assert.ok(
      findingCodes(result).has("contradiction-needs-two-evidence-sides"),
    );
  });

  await suite.test("rejects generic, mystical, and invented-biography prose", () => {
    const shallow = DEPTH_QUALITY_FIXTURES.find(
      (item) => item.id === "shallow-overclaiming",
    );
    const biography = DEPTH_QUALITY_FIXTURES.find(
      (item) => item.id === "invented-biography",
    );
    assert.ok(shallow);
    assert.ok(biography);

    const shallowCodes = findingCodes(
      evaluateDepthInterpretationQuality(shallow.interpretation),
    );
    const biographyCodes = findingCodes(
      evaluateDepthInterpretationQuality(biography.interpretation),
    );

    assert.ok(shallowCodes.has("generic-self-help-filler"));
    assert.ok(shallowCodes.has("mystical-filler"));
    assert.ok(biographyCodes.has("invented-biography"));
    assert.ok(biographyCodes.has("invented-trauma-or-attachment"));
  });

  await suite.test("rejects deterministic and scientific-authority wording", () => {
    const interpretation = clone(createStrongDepthQualityFixture());
    interpretation.shadow.explanation =
      "You will always repeat this behavior because the data scientifically proves that the pattern cannot change.";

    const result = evaluateDepthInterpretationQuality(interpretation);
    const codes = findingCodes(result);

    assert.equal(result.pass, false);
    assert.ok(codes.has("deterministic-certainty"));
    assert.ok(codes.has("contract-deterministic-wording"));
  });

  await suite.test("rejects high confidence without system diversity", () => {
    const fixture = DEPTH_QUALITY_FIXTURES.find(
      (item) => item.id === "unsupported-high-confidence",
    );
    assert.ok(fixture);

    const result = evaluateDepthInterpretationQuality(fixture.interpretation);
    const codes = findingCodes(result);

    assert.equal(result.pass, false);
    assert.ok(codes.has("high-confidence-low-system-diversity"));
    assert.ok(codes.has("contract-unsupported-overall-high-confidence"));
    assert.ok(codes.has("contract-unsupported-layer-high-confidence"));
  });

  await suite.test("warns about severe evidence overconcentration", () => {
    const interpretation = clone(createStrongDepthQualityFixture());
    interpretation.overallConfidence = "moderate";

    for (const key of DEPTH_INTERPRETATION_LAYER_KEYS) {
      if (key === "coreContradiction") {
        interpretation[key] = unavailableLayer(
          "Core contradiction",
          "the supplied signals do not support two distinct sides of a tension.",
        );
        continue;
      }

      interpretation[key].evidenceIds = ["mirror.driver"];
      interpretation[key].confidence = "moderate";
    }

    const result = evaluateDepthInterpretationQuality(interpretation);
    const codes = findingCodes(result);

    assert.equal(result.pass, true);
    assert.ok(codes.has("evidence-overconcentration"));
    assert.ok(codes.has("low-evidence-utilization"));
  });

  await suite.test("rejects action without an observable verb", () => {
    const interpretation = clone(createStrongDepthQualityFixture());
    interpretation.action.summary =
      "Greater patience and clearer awareness around the next high-stakes choice.";
    interpretation.action.explanation =
      "A calm relationship with uncertainty and a more thoughtful orientation toward the decision would be beneficial.";

    const result = evaluateDepthInterpretationQuality(interpretation);

    assert.equal(result.pass, false);
    assert.ok(findingCodes(result).has("action-lacks-observable-verb"));
  });

  await suite.test("rejects hidden unknown-time degradation", () => {
    const interpretation = clone(createStrongDepthQualityFixture());
    interpretation.overallConfidence = "moderate";
    interpretation.missingData = [];

    const result = evaluateDepthInterpretationQuality(interpretation, {
      birthTimeStatus: "unknown",
    });

    assert.equal(result.pass, false);
    assert.ok(findingCodes(result).has("unknown-time-not-disclosed"));
  });

  await suite.test("reports weak available-layer coverage", () => {
    const interpretation = clone(createStrongDepthQualityFixture());
    const keysToRemove = [
      "visiblePattern",
      "innerExperience",
      "hiddenNeed",
      "protectiveFunction",
      "gift",
      "shadow",
      "commonMisreading",
      "relationshipImpact",
    ] as const;

    for (const key of keysToRemove) {
      interpretation[key] = unavailableLayer(
        interpretation[key].title,
        "the supporting signal is missing.",
      );
    }

    const result = evaluateDepthInterpretationQuality(interpretation);

    assert.equal(result.pass, false);
    assert.ok(findingCodes(result).has("insufficient-layer-coverage"));
  });

  await suite.test("is deterministic and does not mutate source", () => {
    const interpretation = createStrongDepthQualityFixture();
    const snapshot = JSON.stringify(interpretation);
    const first = evaluateDepthInterpretationQuality(interpretation, {
      birthTimeStatus: "known",
    });
    const second = evaluateDepthInterpretationQuality(interpretation, {
      birthTimeStatus: "known",
    });

    assert.deepEqual(first, second);
    assert.equal(JSON.stringify(interpretation), snapshot);
  });
});
