import { test } from "node:test";
import assert from "node:assert";
import {
  DEPTH_INTERPRETATION_LAYER_KEYS,
  synthesizeDepthInterpretationV1,
  validateDepthInterpretationV1,
  type DepthSynthesisInputV1,
  type DepthSynthesisSeed,
  type InterpretationEvidenceRef,
} from "../index.js";

function evidence(
  id: string,
  overrides: Partial<InterpretationEvidenceRef> = {},
): InterpretationEvidenceRef {
  return {
    id,
    system: "mirror",
    field: id,
    value: id,
    confidence: "high",
    provenanceStatus: "partially-verified",
    timeSensitivity: "none",
    ...overrides,
  };
}

function completeSeed(): DepthSynthesisSeed {
  return {
    evidence: evidence("mirror.independence"),
    label: "reported independence",
    priority: 100,
    facets: {
      claritySummary: "Independence is the strongest supplied pattern.",
      visiblePattern: "Other people may notice self-directed movement first.",
      innerExperience: "Private processing may continue after visible action begins.",
      hiddenNeed: "Reliable room for self-direction may matter beneath the pattern.",
      protectiveFunction: "Self-direction may reduce exposure to uncertain dependence.",
      gift: "The pattern can support initiative and ownership.",
      shadow: "Overuse can reduce collaboration and corrective feedback.",
      commonMisreading: "Self-direction may be mistaken for a lack of care.",
      relationshipImpact: "Trust may grow through consistency without forced closeness.",
      decisionImpact: "Choices may favor control over waiting for group agreement.",
      boundaryOrRepair: "State the need for autonomy before withdrawing.",
      action: "Name one decision that can move without more permission.",
    },
    tensionAxes: ["independence", "speed"],
    limitations: [
      "The supplied signal does not establish how the pattern developed.",
    ],
  };
}

function input(seeds: DepthSynthesisSeed[]): DepthSynthesisInputV1 {
  return {
    version: 1,
    generatedAt: "2026-07-24T16:00:00.000Z",
    birthTimeStatus: "known",
    seeds,
    missingData: [],
  };
}

test("Depth synthesis", async (suite) => {
  await suite.test("produces a valid complete interpretation", () => {
    const result = synthesizeDepthInterpretationV1(
      input([
        completeSeed(),
        {
          evidence: evidence("values.consistency", {
            system: "moral-compass",
          }),
          label: "stated consistency needs",
          priority: 90,
          facets: {
            hiddenNeed: "Consistency remains important inside independent movement.",
          },
          tensionAxes: ["consistency", "stability"],
          limitations: [
            "A stated value does not prove identical behavior in every context.",
          ],
        },
      ]),
    );

    const validation = validateDepthInterpretationV1(result, {
      birthTimeStatus: "known",
    });

    assert.equal(validation.valid, true);
    assert.deepEqual(validation.findings, []);
    assert.equal(result.coreContradiction.claimKind, "inferred");
    assert.deepEqual(result.coreContradiction.evidenceIds, [
      "mirror.independence",
      "values.consistency",
    ]);
  });

  await suite.test("links every available layer to existing evidence", () => {
    const result = synthesizeDepthInterpretationV1(input([completeSeed()]));
    const evidenceIds = new Set(result.evidence.map((item) => item.id));

    for (const key of DEPTH_INTERPRETATION_LAYER_KEYS) {
      const layer = result[key];
      if (layer.claimKind === "unavailable") continue;

      assert.ok(layer.evidenceIds.length > 0, `${key} must cite evidence`);
      layer.evidenceIds.forEach((id) => {
        assert.ok(evidenceIds.has(id), `${key} cites missing evidence ${id}`);
      });
    }
  });

  await suite.test("leaves unsupported contradiction unavailable", () => {
    const result = synthesizeDepthInterpretationV1(input([completeSeed()]));

    assert.equal(result.coreContradiction.claimKind, "unavailable");
    assert.match(result.coreContradiction.summary, /^Unavailable:/);
  });

  await suite.test("removes time-sensitive support when birth time is unknown", () => {
    const risingSeed: DepthSynthesisSeed = {
      evidence: evidence("astrology.rising.sign", {
        system: "astrology",
        field: "chart.rising.sign",
        value: "Scorpio",
        timeSensitivity: "birth-time-required",
      }),
      label: "Scorpio Rising",
      priority: 200,
      facets: {
        visiblePattern: "A time-sensitive first-impression pattern is present.",
      },
      tensionAxes: ["structure"],
      limitations: ["Rising sign requires an accurate birth time."],
    };
    const normalizedInput = input([completeSeed(), risingSeed]);
    normalizedInput.birthTimeStatus = "unknown";

    const result = synthesizeDepthInterpretationV1(normalizedInput);

    assert.equal(
      result.evidence.some((item) => item.id === "astrology.rising.sign"),
      false,
    );
    assert.equal(
      result.visiblePattern.evidenceIds.includes("astrology.rising.sign"),
      false,
    );
    assert.ok(
      result.missingData.some((item) =>
        item.includes("chart.rising.sign"),
      ),
    );
    assert.equal(
      validateDepthInterpretationV1(result, {
        birthTimeStatus: "unknown",
      }).valid,
      true,
    );
  });

  await suite.test("degrades approximate-time evidence", () => {
    const authoritySeed: DepthSynthesisSeed = {
      evidence: evidence("human-design.authority", {
        system: "human-design",
        timeSensitivity: "birth-time-required",
      }),
      label: "time-sensitive authority",
      facets: {
        decisionImpact: "A time-sensitive authority may affect decision pacing.",
      },
      limitations: [],
    };
    const normalizedInput = input([completeSeed(), authoritySeed]);
    normalizedInput.birthTimeStatus = "approximate";

    const result = synthesizeDepthInterpretationV1(normalizedInput);
    const authority = result.evidence.find(
      (item) => item.id === "human-design.authority",
    );

    assert.equal(authority?.confidence, "low");
    assert.ok(
      authority?.notes?.some((note) => note.includes("approximate")),
    );
  });


  await suite.test("behavioral evidence outranks a higher raw symbolic priority", () => {
    const symbolicSeed: DepthSynthesisSeed = {
      evidence: evidence("astrology.symbolic-visible", {
        system: "astrology",
        field: "sun",
        value: "Virgo",
        confidence: "high",
        provenanceStatus: "externally-verified",
      }),
      label: "verified Virgo symbolism",
      priority: 999,
      claimKind: "derived",
      facets: {
        visiblePattern: "Symbolic astrology would describe precision first.",
      },
      tensionAxes: ["analysis"],
    };

    const behavioralSeed: DepthSynthesisSeed = {
      evidence: evidence("mirror.visible-pattern", {
        system: "mirror",
        field: "reportedPattern",
        value: "checks details before committing",
        confidence: "high",
        provenanceStatus: "partially-verified",
      }),
      label: "reported visible behavior",
      priority: 1,
      claimKind: "observed",
      facets: {
        visiblePattern: "You report checking details before committing.",
      },
      tensionAxes: ["analysis"],
    };

    const result = synthesizeDepthInterpretationV1(input([symbolicSeed, behavioralSeed]));

    assert.equal(result.visiblePattern.summary, "You report checking details before committing.");
    assert.deepEqual(result.visiblePattern.evidenceIds, [
      "mirror.visible-pattern",
      "astrology.symbolic-visible",
    ]);
  });

  await suite.test("does not let verified symbolic data verify a protective function", () => {
    const symbolicSeed: DepthSynthesisSeed = {
      evidence: evidence("astrology.moon-saturn", {
        system: "astrology",
        field: "verifiedMoonSaturnPattern",
        value: "Virgo Moon + Capricorn Saturn",
        confidence: "high",
        provenanceStatus: "externally-verified",
      }),
      label: "verified Moon-Saturn symbolism",
      priority: 150,
      claimKind: "derived",
      facets: {
        hiddenNeed: "The symbolic pattern may emphasize steadiness before exposure.",
        protectiveFunction: "The symbolic pattern may emphasize self-protection through structure.",
      },
      tensionAxes: ["structure"],
      limitations: ["Astronomical placements are verified; psychological meaning is symbolic."],
    };

    const result = synthesizeDepthInterpretationV1(input([symbolicSeed]));

    assert.equal(result.evidence[0]?.confidence, "high");
    assert.equal(result.protectiveFunction.confidence, "moderate");
    assert.equal(result.protectiveFunction.claimKind, "inferred");
    assert.match(result.protectiveFunction.explanation, /symbolic hypothesis/i);
    assert.ok(
      result.protectiveFunction.limitations.some((item) =>
        item.includes("does not by itself verify")
      )
    );
    assert.equal(result.hiddenNeed.confidence, "moderate");
    assert.equal(result.hiddenNeed.claimKind, "inferred");
  });

  await suite.test("behavioral support can retain high confidence for protective function", () => {
    const behavioralSeed: DepthSynthesisSeed = {
      evidence: evidence("mirror.protective-pattern", {
        system: "mirror",
        field: "reportedPattern",
        value: "withdraws when standards shift",
        confidence: "high",
        provenanceStatus: "partially-verified",
      }),
      label: "reported protective pattern",
      priority: 160,
      claimKind: "observed",
      facets: {
        protectiveFunction: "Withdrawal appears to preserve control when expectations become unstable.",
      },
      tensionAxes: ["stability"],
      limitations: ["Observed pattern still may vary by context."],
    };

    const result = synthesizeDepthInterpretationV1(input([behavioralSeed]));

    assert.equal(result.protectiveFunction.confidence, "high");
    assert.equal(result.protectiveFunction.claimKind, "observed");
    assert.doesNotMatch(result.protectiveFunction.explanation, /symbolic hypothesis/i);
  });

  await suite.test("serializes deterministically for identical input", () => {
    const normalizedInput = input([
      completeSeed(),
      {
        evidence: evidence("values.consistency", {
          system: "moral-compass",
        }),
        label: "stated consistency needs",
        facets: {
          hiddenNeed: "Consistency supports sustainable independence.",
        },
        tensionAxes: ["consistency"],
        limitations: ["The value may be situational."],
      },
    ]);

    assert.equal(
      JSON.stringify(synthesizeDepthInterpretationV1(normalizedInput)),
      JSON.stringify(synthesizeDepthInterpretationV1(normalizedInput)),
    );
  });
});
