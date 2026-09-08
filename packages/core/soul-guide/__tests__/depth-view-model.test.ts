import { test } from "node:test";
import assert from "node:assert";
import {
  DEPTH_INTERPRETATION_LAYER_KEYS,
  type DepthInterpretationV1,
  type InterpretationLayer,
} from "../../depth-interpretation/index.js";
import {
  DEPTH_SOUL_GUIDE_DISCLOSURES,
  buildDepthSoulGuideViewModel,
} from "../depth-view-model.js";

function layer(
  title: string,
  overrides: Partial<InterpretationLayer> = {},
): InterpretationLayer {
  return {
    title,
    summary: `${title} summary`,
    explanation: `${title} explanation`,
    claimKind: "derived",
    evidenceIds: ["mirror.driver"],
    confidence: "moderate",
    limitations: [`${title} limitation`],
    ...overrides,
  };
}

function interpretation(): DepthInterpretationV1 {
  return {
    version: 1,
    generatedAt: "2026-07-24T18:00:00.000Z",
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
      },
      {
        id: "numerology.life-path",
        system: "numerology",
        field: "numerology.lifePath",
        value: 4,
        confidence: "moderate",
        provenanceStatus: "unverified",
      },
      {
        id: "tracker.energy",
        system: "tracker",
        field: "energy.average",
        value: 4,
        confidence: "high",
        provenanceStatus: "externally-verified",
      },
    ],
    missingData: [],
    overallConfidence: "moderate",
  };
}

test("Depth Soul Guide view model", async (suite) => {
  await suite.test("keeps clarity, contradiction, and action first", () => {
    const model = buildDepthSoulGuideViewModel(interpretation());

    assert.deepEqual(
      model.primary.map((item) => item.key),
      ["claritySummary", "coreContradiction", "action"],
    );
  });

  await suite.test("keeps disclosure group order stable", () => {
    const model = buildDepthSoulGuideViewModel(interpretation());

    assert.deepEqual(
      model.disclosures.map((group) => group.id),
      [
        "what-people-see",
        "what-they-miss",
        "need-and-protection",
        "gift-and-shadow",
        "common-misreading",
        "relationship-and-decision-effects",
        "boundary-and-repair",
      ],
    );
    assert.deepEqual(
      model.disclosures.map((group) => group.id),
      DEPTH_SOUL_GUIDE_DISCLOSURES.map((group) => group.id),
    );
  });

  await suite.test("represents every non-primary layer exactly once", () => {
    const model = buildDepthSoulGuideViewModel(interpretation());
    const primary = new Set(model.primary.map((item) => item.key));
    const detailKeys = model.disclosures.flatMap((group) =>
      group.layers.map((layerItem) => layerItem.key),
    );
    const expected = DEPTH_INTERPRETATION_LAYER_KEYS.filter(
      (key) => !primary.has(key),
    );

    assert.equal(new Set(detailKeys).size, detailKeys.length);
    assert.deepEqual([...detailKeys].sort(), [...expected].sort());
  });

  await suite.test("keeps unavailable layers visible", () => {
    const source = interpretation();
    source.hiddenNeed = layer("Hidden need", {
      summary: "Unavailable: hidden need lacks support.",
      explanation: "Insufficient data: no supported need signal is available.",
      claimKind: "unavailable",
      evidenceIds: [],
      confidence: "low",
      limitations: ["Mirror driver is missing."],
    });

    const model = buildDepthSoulGuideViewModel(source);
    const group = model.disclosures.find(
      (item) => item.id === "need-and-protection",
    );
    const hiddenNeed = group?.layers.find(
      (item) => item.key === "hiddenNeed",
    );

    assert.equal(hiddenNeed?.unavailable, true);
    assert.equal(group?.unavailableCount, 1);
    assert.equal(group?.availableCount, 1);
  });

  await suite.test("summarizes evidence, provenance, and limitations", () => {
    const model = buildDepthSoulGuideViewModel(interpretation());

    assert.equal(model.evidence.totalEvidence, 3);
    assert.equal(model.evidence.externallyVerified, 1);
    assert.equal(model.evidence.partiallyVerified, 1);
    assert.equal(model.evidence.unverified, 1);
    assert.deepEqual(model.evidence.systemCounts, [
      { system: "mirror", count: 1 },
      { system: "numerology", count: 1 },
      { system: "tracker", count: 1 },
    ]);
    assert.equal(model.evidence.limitationCount, 13);
    assert.deepEqual(model.evidence.referencedEvidenceIds, ["mirror.driver"]);
  });

  await suite.test("exposes unknown-time missing data", () => {
    const source = interpretation();
    source.missingData = [
      "Exact birth time is unknown; Rising sign, houses, angles, Moon degree, and time-sensitive Human Design claims are unavailable.",
    ];

    const model = buildDepthSoulGuideViewModel(source);

    assert.deepEqual(model.missingData, source.missingData);
    assert.ok(model.missingData[0].includes("Exact birth time is unknown"));
  });

  await suite.test("does not mutate the source interpretation", () => {
    const source = interpretation();
    const snapshot = JSON.stringify(source);
    const model = buildDepthSoulGuideViewModel(source);

    model.primary[0].evidenceIds.push("mutated.id");
    model.primary[0].limitations.push("mutated limitation");
    model.missingData.push("mutated missing data");

    assert.equal(JSON.stringify(source), snapshot);
  });
});
