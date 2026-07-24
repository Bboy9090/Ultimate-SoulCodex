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
