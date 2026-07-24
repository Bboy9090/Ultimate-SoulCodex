import type {
  BirthTimeStatus,
  DepthInterpretationV1,
  InterpretationClaimKind,
  InterpretationConfidence,
  InterpretationLayer,
} from "./types.js";

export interface DepthQualityFixture {
  id: string;
  description: string;
  interpretation: DepthInterpretationV1;
  birthTimeStatus: BirthTimeStatus;
  expectedPass: boolean;
  expectedFindingCodes: string[];
}

interface LayerInput {
  title: string;
  summary: string;
  explanation: string;
  claimKind: InterpretationClaimKind;
  evidenceIds: string[];
  confidence?: InterpretationConfidence;
  limitations?: string[];
}

function layer(input: LayerInput): InterpretationLayer {
  return {
    title: input.title,
    summary: input.summary,
    explanation: input.explanation,
    claimKind: input.claimKind,
    evidenceIds: [...input.evidenceIds],
    confidence: input.confidence ?? "high",
    limitations:
      input.limitations ??
      (input.claimKind === "inferred"
        ? [
            "This interpretation is limited to the supplied signals.",
            "Lived experience may describe the pattern differently.",
          ]
        : []),
  };
}

export function createStrongDepthQualityFixture(): DepthInterpretationV1 {
  return {
    version: 1,
    generatedAt: "2026-07-24T19:00:00.000Z",
    claritySummary: layer({
      title: "Structured independence",
      summary:
        "The strongest supported pattern combines self-direction with a demand for reliable standards.",
      explanation:
        "User-stated independence, date-derived structure, and tracked decision behavior point toward deliberate ownership rather than simple resistance to help.",
      claimKind: "derived",
      evidenceIds: ["mirror.driver", "numerology.life-path"],
    }),
    visiblePattern: layer({
      title: "Visible self-direction",
      summary:
        "Other people may first notice direct movement, personal standards, and a preference for owning the decision.",
      explanation:
        "The visible pattern is anchored in the user's reported driver and should be read as a current self-description rather than a permanent personality verdict.",
      claimKind: "observed",
      evidenceIds: ["mirror.driver"],
      confidence: "high",
    }),
    innerExperience: layer({
      title: "Private quality control",
      summary:
        "Internally, fast movement may coexist with continued checking for consistency and avoidable error.",
      explanation:
        "Tracked decision notes and the reported driver suggest that visible speed can contain a quieter review process that other people do not see.",
      claimKind: "inferred",
      evidenceIds: ["mirror.driver", "tracker.decision-pattern"],
    }),
    hiddenNeed: layer({
      title: "Reliable autonomy",
      summary:
        "The pattern may need enough independence to act and enough consistency to trust the surrounding agreement.",
      explanation:
        "The combination of self-direction and stated consistency values suggests a need for autonomy that does not require accepting unstable expectations.",
      claimKind: "inferred",
      evidenceIds: ["mirror.driver", "moral.values"],
    }),
    protectiveFunction: layer({
      title: "Reducing uncertain dependence",
      summary:
        "Taking ownership may protect against unclear responsibility, shifting standards, or dependence on unreliable follow-through.",
      explanation:
        "This is one possible protective function supported by the reported driver and values; it does not establish a personal history or fixed hidden cause.",
      claimKind: "inferred",
      evidenceIds: ["mirror.driver", "moral.values"],
    }),
    coreContradiction: layer({
      title: "Freedom with dependable structure",
      summary:
        "The profile supports both strong self-direction and a strong requirement for consistency from people and systems.",
      explanation:
        "These signals can coexist: freedom protects agency, while dependable structure makes cooperation safe enough to remain useful.",
      claimKind: "inferred",
      evidenceIds: ["mirror.driver", "moral.values"],
    }),
    gift: layer({
      title: "Independent construction",
      summary:
        "The constructive gift is the ability to convert personal standards into organized work that can survive pressure.",
      explanation:
        "Date-derived structure and stated consistency values support disciplined building, especially when responsibility and authority are clearly assigned.",
      claimKind: "derived",
      evidenceIds: ["numerology.life-path", "moral.values"],
    }),
    shadow: layer({
      title: "Control replacing collaboration",
      summary:
        "Under pressure, useful ownership may become overcontrol, rushed conclusions, or refusal to accept corrective input.",
      explanation:
        "The reported driver and tracked decision pattern suggest that speed can become defensive when uncertainty rises, although context may change the expression.",
      claimKind: "inferred",
      evidenceIds: ["mirror.driver", "tracker.decision-pattern"],
    }),
    commonMisreading: layer({
      title: "Distance mistaken for indifference",
      summary:
        "Other people may misread self-directed processing as lack of care, secrecy, or unwillingness to cooperate.",
      explanation:
        "One possible misreading is that visible independence hides the importance of dependable agreements and consistent follow-through.",
      claimKind: "inferred",
      evidenceIds: ["mirror.driver"],
    }),
    relationshipImpact: layer({
      title: "Trust through consistency",
      summary:
        "Closeness may grow when expectations remain clear, promises are kept, and autonomy is not treated as rejection.",
      explanation:
        "Stated values and the reported driver suggest that trust depends less on constant access and more on reliable behavior across time.",
      claimKind: "inferred",
      evidenceIds: ["moral.values", "mirror.driver"],
    }),
    decisionImpact: layer({
      title: "Criteria before commitment",
      summary:
        "Tracked choices show stronger outcomes when decision criteria are named before urgency starts controlling the process.",
      explanation:
        "The tracker provides an observed behavioral anchor: decisions improve when standards are written before additional pressure or information arrives.",
      claimKind: "observed",
      evidenceIds: ["tracker.decision-pattern"],
      confidence: "high",
    }),
    boundaryOrRepair: layer({
      title: "State the standard before withdrawal",
      summary:
        "A useful repair may be naming the violated standard directly before taking control, disengaging, or assuming bad intent.",
      explanation:
        "The combination of independence and consistency values suggests that explicit expectations can protect autonomy without ending collaboration prematurely.",
      claimKind: "inferred",
      evidenceIds: ["moral.values", "mirror.driver"],
    }),
    action: layer({
      title: "Write the decision contract",
      summary:
        "Before the next high-stakes choice, write three decision criteria and choose a deadline for review.",
      explanation:
        "Test the pattern by recording whether named criteria reduce rushed control and improve the final decision without adding another round of vague analysis.",
      claimKind: "derived",
      evidenceIds: ["tracker.decision-pattern", "moral.values"],
    }),
    evidence: [
      {
        id: "mirror.driver",
        system: "mirror",
        field: "mirror.driver",
        value: "Independence",
        confidence: "high",
        provenanceStatus: "partially-verified",
        timeSensitivity: "none",
        notes: ["User-supplied current self-assessment."],
      },
      {
        id: "numerology.life-path",
        system: "numerology",
        field: "numerology.lifePath",
        value: 4,
        confidence: "moderate",
        provenanceStatus: "partially-verified",
        timeSensitivity: "none",
        notes: ["Date-derived symbolic theme."],
      },
      {
        id: "tracker.decision-pattern",
        system: "tracker",
        field: "decisions.criteriaBeforeCommitment",
        value: true,
        confidence: "high",
        provenanceStatus: "externally-verified",
        timeSensitivity: "none",
        notes: ["Observed in supplied tracker records."],
      },
      {
        id: "moral.values",
        system: "moral-compass",
        field: "morals.values",
        value: "Consistency, honesty",
        confidence: "high",
        provenanceStatus: "partially-verified",
        timeSensitivity: "none",
        notes: ["User-stated values."],
      },
    ],
    missingData: [],
    overallConfidence: "high",
  };
}

function copyInterpretation(
  interpretation: DepthInterpretationV1,
): DepthInterpretationV1 {
  return JSON.parse(JSON.stringify(interpretation)) as DepthInterpretationV1;
}

function createUnknownTimeFixture(): DepthInterpretationV1 {
  const interpretation = copyInterpretation(createStrongDepthQualityFixture());
  interpretation.generatedAt = "2026-07-24T19:05:00.000Z";
  interpretation.overallConfidence = "moderate";
  interpretation.missingData = [
    "Exact birth time is unknown; Rising sign, houses, angles, Moon degree, and time-sensitive Human Design claims are unavailable.",
  ];
  return interpretation;
}

function createShallowFixture(): DepthInterpretationV1 {
  const interpretation = copyInterpretation(createStrongDepthQualityFixture());
  const shallow = "Trust the process. You are unique.";

  for (const key of [
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
  ] as const) {
    interpretation[key] = {
      title: "Your sacred blueprint",
      summary: shallow,
      explanation: shallow,
      claimKind: "inferred",
      evidenceIds: [],
      confidence: "high",
      limitations: [],
    };
  }

  interpretation.evidence = [];
  interpretation.overallConfidence = "high";
  return interpretation;
}

function createInventedBiographyFixture(): DepthInterpretationV1 {
  const interpretation = copyInterpretation(createStrongDepthQualityFixture());
  interpretation.hiddenNeed.explanation =
    "Your childhood taught you never to depend on anyone, so this is an avoidant attachment style and a trauma response.";
  return interpretation;
}

function createUnsupportedHighConfidenceFixture(): DepthInterpretationV1 {
  const interpretation = copyInterpretation(createStrongDepthQualityFixture());
  interpretation.evidence = interpretation.evidence
    .filter((evidence) => evidence.system === "mirror")
    .map((evidence) => ({
      ...evidence,
      provenanceStatus: "unverified" as const,
    }));

  for (const key of [
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
  ] as const) {
    interpretation[key].evidenceIds = ["mirror.driver"];
    interpretation[key].confidence = "high";
  }

  interpretation.overallConfidence = "high";
  return interpretation;
}

export const DEPTH_QUALITY_FIXTURES: readonly DepthQualityFixture[] = [
  {
    id: "strong-known-time",
    description:
      "Evidence-backed known-time interpretation with calibrated inference and concrete action.",
    interpretation: createStrongDepthQualityFixture(),
    birthTimeStatus: "known",
    expectedPass: true,
    expectedFindingCodes: [],
  },
  {
    id: "honest-unknown-time",
    description:
      "Strong interpretation that visibly records unknown birth-time degradation.",
    interpretation: createUnknownTimeFixture(),
    birthTimeStatus: "unknown",
    expectedPass: true,
    expectedFindingCodes: ["unknown-time-degradation-visible"],
  },
  {
    id: "shallow-overclaiming",
    description:
      "Repeated generic filler with no evidence, no limitations, and unsupported confidence.",
    interpretation: createShallowFixture(),
    birthTimeStatus: "known",
    expectedPass: false,
    expectedFindingCodes: [
      "generic-self-help-filler",
      "mystical-filler",
      "duplicate-layer-summary",
      "contract-inference-without-limitations",
    ],
  },
  {
    id: "invented-biography",
    description:
      "Structurally valid interpretation that invents childhood, attachment, and trauma causes.",
    interpretation: createInventedBiographyFixture(),
    birthTimeStatus: "known",
    expectedPass: false,
    expectedFindingCodes: [
      "invented-biography",
      "invented-trauma-or-attachment",
    ],
  },
  {
    id: "unsupported-high-confidence",
    description:
      "High-confidence interpretation supported by one unverified evidence system.",
    interpretation: createUnsupportedHighConfidenceFixture(),
    birthTimeStatus: "known",
    expectedPass: false,
    expectedFindingCodes: [
      "contract-unsupported-overall-high-confidence",
      "contract-unsupported-layer-high-confidence",
      "high-confidence-low-system-diversity",
    ],
  },
] as const;
