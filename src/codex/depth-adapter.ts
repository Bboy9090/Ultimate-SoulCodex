import type {
  ConfidenceBadge,
  SoulProfile,
} from "../types/soulcodex.js";
import { synthesizeCodex } from "./synthesize.js";
import {
  synthesizeDepthInterpretationV1,
  type BirthTimeStatus,
  type DepthInterpretationV1,
  type DepthSynthesisInputV1,
  type DepthSynthesisSeed,
  type DepthTensionAxis,
  type EvidenceProvenanceStatus,
  type EvidenceSystem,
  type InterpretationConfidence,
  type InterpretationEvidenceRef,
} from "../../packages/core/depth-interpretation/index.js";

const SIGN_TRAITS: Record<
  string,
  { drive: string; shadow: string }
> = {
  Aries: {
    drive: "initiating action and leading from the front",
    shadow: "impatience and burning out other people",
  },
  Taurus: {
    drive: "building stability and protecting what matters",
    shadow: "rigidity presented as loyalty",
  },
  Gemini: {
    drive: "gathering information and connecting ideas",
    shadow: "scattering attention across too many interests",
  },
  Cancer: {
    drive: "protecting and nurturing chosen relationships",
    shadow: "absorbing other people's emotions as personal responsibility",
  },
  Leo: {
    drive: "creating something meaningful and being recognized for it",
    shadow: "depending on approval to confirm legitimacy",
  },
  Virgo: {
    drive: "precision, improvement, and practical service",
    shadow: "analysis expanding until action stalls",
  },
  Libra: {
    drive: "creating harmony and finding a fair answer",
    shadow: "delaying confrontation until resentment accumulates",
  },
  Scorpio: {
    drive: "going deep, testing truth, and maintaining control",
    shadow: "holding pain or suspicion past its useful life",
  },
  Sagittarius: {
    drive: "seeking meaning and expanding understanding",
    shadow: "leaving depth behind for the next horizon",
  },
  Capricorn: {
    drive: "building legacy through discipline and mastery",
    shadow: "measuring worth primarily through output",
  },
  Aquarius: {
    drive: "thinking differently and challenging defaults",
    shadow: "using detachment when emotional stakes rise",
  },
  Pisces: {
    drive: "feeling deeply and translating experience into meaning",
    shadow: "weakening boundaries when another person needs support",
  },
};

const LIFE_PATH_TRAITS: Record<
  number,
  { theme: string; drive: string }
> = {
  1: { theme: "Independence", drive: "self-reliance and pioneering" },
  2: { theme: "Partnership", drive: "cooperation and sensitivity" },
  3: { theme: "Expression", drive: "creativity and communication" },
  4: { theme: "Structure", drive: "building systems that last" },
  5: { theme: "Freedom", drive: "adaptability and experience" },
  6: { theme: "Responsibility", drive: "service and stewardship" },
  7: { theme: "Analysis", drive: "investigation and private understanding" },
  8: { theme: "Power", drive: "material mastery and leadership" },
  9: { theme: "Legacy", drive: "humanitarian purpose and completion" },
  11: { theme: "Intuition", drive: "visionary insight and influence" },
  22: { theme: "Master Building", drive: "turning vision into durable reality" },
  33: { theme: "Master Teaching", drive: "uplifting others through example" },
};

const HD_TYPE_TRAITS: Record<
  string,
  { strength: string; risk: string }
> = {
  Manifestor: {
    strength: "initiating without waiting for permission",
    risk: "moving before other people understand what changed",
  },
  Generator: {
    strength: "sustaining effort when the work is genuinely engaging",
    risk: "continuing obligations that steadily drain energy",
  },
  "Manifesting Generator": {
    strength: "moving quickly across several connected interests",
    risk: "leaving work before repetition creates mastery",
  },
  Projector: {
    strength: "seeing how people and systems can work more effectively",
    risk: "offering direction before recognition or consent is present",
  },
  Reflector: {
    strength: "registering the condition of an environment",
    risk: "confusing absorbed group pressure with personal direction",
  },
};

const ELEMENT_TRAITS: Record<
  "earth" | "air" | "fire" | "water",
  { gift: string; shadow: string }
> = {
  earth: {
    gift: "stability, follow-through, and practical structure",
    shadow: "holding position after conditions have changed",
  },
  air: {
    gift: "mental speed, perspective, and verbal connection",
    shadow: "processing through thought while feeling remains unattended",
  },
  fire: {
    gift: "momentum, courage, and visible initiative",
    shadow: "acting before context or consequence is fully read",
  },
  water: {
    gift: "emotional depth, responsiveness, and environmental awareness",
    shadow: "absorbing pressure before identifying its source",
  },
};

export interface DepthCodexOptions {
  generatedAt?: string;
  birthTimeStatus?: BirthTimeStatus;
}

interface EvidenceQuality {
  confidence: InterpretationConfidence;
  provenanceStatus: EvidenceProvenanceStatus;
}

function evidenceQuality(
  badge: ConfidenceBadge | undefined,
  userSupplied = false,
): EvidenceQuality {
  if (userSupplied) {
    return {
      confidence: "high",
      provenanceStatus: "partially-verified",
    };
  }

  if (badge === "verified") {
    return {
      confidence: "high",
      provenanceStatus: "partially-verified",
    };
  }

  if (badge === "partial") {
    return {
      confidence: "moderate",
      provenanceStatus: "partially-verified",
    };
  }

  return {
    confidence: "moderate",
    provenanceStatus: "unverified",
  };
}

function axesFromText(text: string): DepthTensionAxis[] {
  const value = text.toLowerCase();
  const axes: DepthTensionAxis[] = [];
  const add = (axis: DepthTensionAxis, pattern: RegExp) => {
    if (pattern.test(value) && !axes.includes(axis)) axes.push(axis);
  };

  add("independence", /independen|self-reli|pioneer|initiat|lead/);
  add("consistency", /consisten|repetition|reliable|routine/);
  add("partnership", /partner|cooperat|relationship|together/);
  add("recognition", /recognition|recognized|approval|seen|invitation/);
  add("speed", /speed|fast|quick|impulse|gut|react|momentum/);
  add("analysis", /analy|logic|precision|investigat|understand|information/);
  add("structure", /structure|control|discipline|system|order|mastery/);
  add("sensitivity", /sensitiv|emotion|feel|absorb|nurtur|responsive/);
  add("harmony", /harmony|fair|peace|cooperat/);
  add("directness", /direct|conflict|confront|disrespect|intoleran/);
  add("freedom", /freedom|adapt|movement|experience|pivot/);
  add("stability", /stability|stable|lasting|durable|follow-through/);

  return axes;
}

function makeEvidence(
  profile: SoulProfile,
  input: {
    id: string;
    system: EvidenceSystem;
    field: string;
    value: string | number | boolean | null;
    userSupplied?: boolean;
    timeSensitivity?: "none" | "birth-time-required";
    notes?: string[];
  },
): InterpretationEvidenceRef {
  const quality = evidenceQuality(
    profile.confidence?.badge,
    input.userSupplied,
  );

  return {
    id: input.id,
    system: input.system,
    field: input.field,
    value: input.value,
    confidence: quality.confidence,
    provenanceStatus: quality.provenanceStatus,
    timeSensitivity: input.timeSensitivity ?? "none",
    notes: [
      "Confidence describes source completeness and consistency, not scientific truth.",
      ...(input.notes ?? []),
    ],
  };
}

function addSeed(
  seeds: DepthSynthesisSeed[],
  seed: DepthSynthesisSeed | null,
): void {
  if (seed) seeds.push(seed);
}

function normalizedBirthTimeStatus(
  profile: SoulProfile,
  override?: BirthTimeStatus,
): BirthTimeStatus {
  if (override) return override;
  return profile.birth.timeKnown ? "known" : "unknown";
}

export function normalizeSoulProfileForDepth(
  profile: SoulProfile,
  options: DepthCodexOptions = {},
): DepthSynthesisInputV1 {
  const synthesis = synthesizeCodex(profile);
  const seeds: DepthSynthesisSeed[] = [];
  const missingData: string[] = [];
  const birthTimeStatus = normalizedBirthTimeStatus(
    profile,
    options.birthTimeStatus,
  );

  if (profile.mirror?.driver) {
    const driver = profile.mirror.driver;
    addSeed(seeds, {
      evidence: makeEvidence(profile, {
        id: "mirror.driver",
        system: "mirror",
        field: "mirror.driver",
        value: driver,
        userSupplied: true,
      }),
      label: `the reported driver ${driver}`,
      priority: 130,
      facets: {
        claritySummary: `The strongest user-supplied behavioral driver is ${driver}.`,
        hiddenNeed: `${driver} may be the condition the person most often tries to preserve.`,
        gift: `${driver} can create a clear standard for attention and effort.`,
        boundaryOrRepair: `Name the need for ${driver.toLowerCase()} directly instead of expecting other people to infer it.`,
        action: `Before the next decision, state how ${driver.toLowerCase()} should shape the choice.`,
      },
      tensionAxes: axesFromText(driver),
      limitations: [
        "A reported driver describes a current self-assessment, not a permanent identity.",
      ],
    });
  } else {
    missingData.push("Mirror behavioral driver is missing.");
  }

  if (profile.mirror?.shadowTrigger) {
    const trigger = profile.mirror.shadowTrigger;
    addSeed(seeds, {
      evidence: makeEvidence(profile, {
        id: "mirror.shadow-trigger",
        system: "mirror",
        field: "mirror.shadowTrigger",
        value: trigger,
        userSupplied: true,
      }),
      label: `the reported stress trigger ${trigger}`,
      priority: 125,
      facets: {
        innerExperience: `The clearest reported pressure point is ${trigger}.`,
        protectiveFunction: `The stress response may be trying to reduce exposure to ${trigger.toLowerCase()}.`,
        shadow: synthesis.stressPattern,
        commonMisreading: `Other people may react to the defensive behavior without seeing the reported trigger underneath it.`,
      },
      tensionAxes: axesFromText(trigger),
      limitations: [
        "The trigger is user-supplied, but its protective function remains an interpretation.",
      ],
    });
  } else {
    missingData.push("Mirror stress trigger is missing.");
  }

  if (profile.mirror?.decisionStyle) {
    const decisionStyle = profile.mirror.decisionStyle;
    addSeed(seeds, {
      evidence: makeEvidence(profile, {
        id: "mirror.decision-style",
        system: "mirror",
        field: "mirror.decisionStyle",
        value: decisionStyle,
        userSupplied: true,
      }),
      label: `the reported decision style ${decisionStyle}`,
      priority: 120,
      facets: {
        decisionImpact: synthesis.decisionStyle,
        action:
          synthesis.practicalGuidance.find((item) =>
            /decision|analysis|thought|pause|move/i.test(item),
          ) ?? "Set a decision point before gathering another round of information.",
      },
      tensionAxes: axesFromText(decisionStyle),
      limitations: [
        "Decision style can change by context, stakes, fatigue, and available information.",
      ],
    });
  } else {
    missingData.push("Mirror decision style is missing.");
  }

  if (profile.mirror?.energyStyle) {
    const energyStyle = profile.mirror.energyStyle;
    addSeed(seeds, {
      evidence: makeEvidence(profile, {
        id: "mirror.energy-style",
        system: "mirror",
        field: "mirror.energyStyle",
        value: energyStyle,
        userSupplied: true,
      }),
      label: `the reported energy style ${energyStyle}`,
      priority: 115,
      facets: {
        visiblePattern: `The reported energy style is ${energyStyle}.`,
        innerExperience: `The person's own account of energy is ${energyStyle}, which should override a conflicting symbolic interpretation.`,
      },
      tensionAxes: axesFromText(energyStyle),
      limitations: [
        "Energy style is a self-report and may vary across environments or health conditions.",
      ],
    });
  }

  if (profile.mirror?.conflictStyle) {
    const conflictStyle = profile.mirror.conflictStyle;
    addSeed(seeds, {
      evidence: makeEvidence(profile, {
        id: "mirror.conflict-style",
        system: "mirror",
        field: "mirror.conflictStyle",
        value: conflictStyle,
        userSupplied: true,
      }),
      label: `the reported conflict style ${conflictStyle}`,
      priority: 110,
      facets: {
        relationshipImpact: `The reported conflict style is ${conflictStyle}.`,
        commonMisreading: `A conflict response of ${conflictStyle.toLowerCase()} may be mistaken for the person's full intention.`,
        boundaryOrRepair: `Clarify the goal of the conversation before using the usual ${conflictStyle.toLowerCase()} response.`,
      },
      tensionAxes: axesFromText(conflictStyle),
      limitations: [
        "A reported conflict style does not establish how every relationship operates.",
      ],
    });
  }

  profile.mirror?.nuance?.forEach((nuance, index) => {
    if (!nuance.trim()) return;
    addSeed(seeds, {
      evidence: makeEvidence(profile, {
        id: `mirror.nuance.${index + 1}`,
        system: "user-stated",
        field: `mirror.nuance[${index}]`,
        value: nuance,
        userSupplied: true,
      }),
      label: `user-supplied nuance ${index + 1}`,
      priority: 140 - index,
      facets: {
        innerExperience:
          "A user-supplied nuance is available and should override any conflicting generalized interpretation.",
      },
      limitations: [
        "The nuance is authoritative for the user's lived experience but may be specific to one context.",
      ],
    });
  });

  const sunSign = profile.chart?.sun?.sign;
  const sunTrait = sunSign ? SIGN_TRAITS[sunSign] : undefined;
  if (sunSign && sunTrait) {
    addSeed(seeds, {
      evidence: makeEvidence(profile, {
        id: "astrology.sun.sign",
        system: "astrology",
        field: "chart.sun.sign",
        value: sunSign,
      }),
      label: `Sun in ${sunSign}`,
      priority: 90,
      facets: {
        claritySummary: `The Sun-sign calculation emphasizes ${sunTrait.drive}.`,
        gift: `At its constructive edge, this supports ${sunTrait.drive}.`,
        shadow: `When overextended, the same pattern can become ${sunTrait.shadow}.`,
      },
      tensionAxes: axesFromText(`${sunTrait.drive} ${sunTrait.shadow}`),
      limitations: [
        "A Sun-sign interpretation is one symbolic input and must not override lived experience.",
      ],
    });
  } else {
    missingData.push("Sun-sign data is missing or unsupported.");
  }

  const moonSign = profile.chart?.moon?.sign;
  const moonTrait = moonSign ? SIGN_TRAITS[moonSign] : undefined;
  if (moonSign && moonTrait) {
    addSeed(seeds, {
      evidence: makeEvidence(profile, {
        id: "astrology.moon.sign",
        system: "astrology",
        field: "chart.moon.sign",
        value: moonSign,
        notes:
          birthTimeStatus === "unknown"
            ? [
                "Only the supplied Moon sign is used; Moon degree and house claims remain unavailable.",
              ]
            : undefined,
      }),
      label: `Moon in ${moonSign}`,
      priority: 95,
      facets: {
        innerExperience: `The Moon-sign calculation points toward ${moonTrait.drive} as a possible internal organizing pattern.`,
        hiddenNeed: `Consistency with ${moonTrait.drive} may matter internally even when it is not obvious externally.`,
        relationshipImpact: `Emotional safety may be supported by ${moonTrait.drive}.`,
      },
      tensionAxes: axesFromText(`${moonTrait.drive} ${moonTrait.shadow}`),
      limitations: [
        "Moon-sign interpretation does not establish a private emotional fact.",
      ],
    });
  } else {
    missingData.push("Moon-sign data is missing or unsupported.");
  }

  const risingSign = profile.chart?.rising?.sign;
  const risingTrait = risingSign ? SIGN_TRAITS[risingSign] : undefined;
  if (risingSign && risingTrait) {
    addSeed(seeds, {
      evidence: makeEvidence(profile, {
        id: "astrology.rising.sign",
        system: "astrology",
        field: "chart.rising.sign",
        value: risingSign,
        timeSensitivity: "birth-time-required",
      }),
      label: `Rising sign in ${risingSign}`,
      priority: 100,
      facets: {
        visiblePattern: `A ${risingSign} Rising calculation may shape first impressions through ${risingTrait.drive}.`,
        commonMisreading:
          "Other people may treat the first-impression pattern as the whole person and miss less visible signals.",
      },
      tensionAxes: axesFromText(`${risingTrait.drive} ${risingTrait.shadow}`),
      limitations: [
        "Rising-sign interpretation depends on accurate birth time and location.",
      ],
    });
  } else if (birthTimeStatus !== "unknown") {
    missingData.push("Rising-sign data is missing.");
  }

  const venusSign = profile.chart?.venus?.sign;
  const venusTrait = venusSign ? SIGN_TRAITS[venusSign] : undefined;
  if (venusSign && venusTrait) {
    addSeed(seeds, {
      evidence: makeEvidence(profile, {
        id: "astrology.venus.sign",
        system: "astrology",
        field: "chart.venus.sign",
        value: venusSign,
      }),
      label: `Venus in ${venusSign}`,
      priority: 70,
      facets: {
        relationshipImpact: `The Venus-sign calculation adds ${venusTrait.drive} as a possible relationship preference.`,
      },
      tensionAxes: axesFromText(venusTrait.drive),
      limitations: [
        "A Venus-sign interpretation cannot establish how a specific relationship functions.",
      ],
    });
  }

  const lifePath = profile.numerology?.lifePath;
  const lifePathTrait = lifePath ? LIFE_PATH_TRAITS[lifePath] : undefined;
  if (lifePath && lifePathTrait) {
    addSeed(seeds, {
      evidence: makeEvidence(profile, {
        id: "numerology.life-path",
        system: "numerology",
        field: "numerology.lifePath",
        value: lifePath,
      }),
      label: `Life Path ${lifePath} ${lifePathTrait.theme}`,
      priority: 85,
      facets: {
        claritySummary: `Life Path ${lifePath} contributes ${lifePathTrait.drive} as a date-derived theme.`,
        gift: `${lifePathTrait.theme} can be expressed through ${lifePathTrait.drive}.`,
      },
      tensionAxes: axesFromText(
        `${lifePathTrait.theme} ${lifePathTrait.drive}`,
      ),
      limitations: [
        "Numerology describes a symbolic theme, not a proven behavioral cause.",
      ],
    });
  } else {
    missingData.push("Life Path data is missing or unsupported.");
  }

  const hdType = profile.humanDesign?.type;
  const hdTrait = hdType ? HD_TYPE_TRAITS[hdType] : undefined;
  if (hdType && hdTrait) {
    addSeed(seeds, {
      evidence: makeEvidence(profile, {
        id: "human-design.type",
        system: "human-design",
        field: "humanDesign.type",
        value: hdType,
        timeSensitivity: "birth-time-required",
      }),
      label: `Human Design type ${hdType}`,
      priority: 80,
      facets: {
        visiblePattern: `The Human Design type calculation emphasizes ${hdTrait.strength}.`,
        gift: `The constructive expression is ${hdTrait.strength}.`,
        shadow: `Under pressure, the same type pattern may risk ${hdTrait.risk}.`,
        commonMisreading:
          "Other people may notice the type's visible strategy while missing the conditions it requires.",
      },
      tensionAxes: axesFromText(`${hdTrait.strength} ${hdTrait.risk}`),
      limitations: [
        "Human Design interpretation is time-sensitive and symbolic.",
      ],
    });
  } else {
    missingData.push("Human Design type is missing.");
  }

  if (profile.humanDesign?.authority) {
    const authority = profile.humanDesign.authority;
    addSeed(seeds, {
      evidence: makeEvidence(profile, {
        id: "human-design.authority",
        system: "human-design",
        field: "humanDesign.authority",
        value: authority,
        timeSensitivity: "birth-time-required",
      }),
      label: `Human Design authority ${authority}`,
      priority: 82,
      facets: {
        decisionImpact: synthesis.decisionStyle,
        action: `Test the stated ${authority} authority against lived decision outcomes rather than treating it as a command.`,
      },
      tensionAxes: axesFromText(authority),
      limitations: [
        "Authority interpretation requires accurate birth data and real-world validation.",
      ],
    });
  }

  if (profile.humanDesign?.strategy) {
    const strategy = profile.humanDesign.strategy;
    addSeed(seeds, {
      evidence: makeEvidence(profile, {
        id: "human-design.strategy",
        system: "human-design",
        field: "humanDesign.strategy",
        value: strategy,
        timeSensitivity: "birth-time-required",
      }),
      label: `Human Design strategy ${strategy}`,
      priority: 78,
      facets: {
        decisionImpact: `The supplied Human Design strategy is ${strategy}.`,
        action: `Use ${strategy.toLowerCase()} as an experiment and compare it with actual outcomes.`,
      },
      tensionAxes: axesFromText(strategy),
      limitations: [
        "A Human Design strategy is an experiment, not a universal decision rule.",
      ],
    });
  }

  if (profile.elements) {
    const dominant = (
      Object.entries(profile.elements) as Array<
        ["earth" | "air" | "fire" | "water", number]
      >
    ).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
    const [element, score] = dominant;
    const trait = ELEMENT_TRAITS[element];

    addSeed(seeds, {
      evidence: makeEvidence(profile, {
        id: "elements.dominant",
        system: "elements",
        field: "elements.dominant",
        value: `${element}:${score}`,
      }),
      label: `dominant ${element} element`,
      priority: 75,
      facets: {
        visiblePattern: `The elemental balance emphasizes ${trait.gift}.`,
        innerExperience: `The dominant ${element} pattern may organize experience through ${trait.gift}.`,
        gift: `The elemental gift is ${trait.gift}.`,
        shadow: `When overused, the elemental pattern may become ${trait.shadow}.`,
      },
      tensionAxes: axesFromText(`${trait.gift} ${trait.shadow}`),
      limitations: [
        "Elemental balance is a symbolic synthesis and should be compared with lived behavior.",
      ],
    });
  } else {
    missingData.push("Elemental balance is missing.");
  }

  if (profile.morals?.values?.length) {
    const values = profile.morals.values.slice(0, 5).join(", ");
    addSeed(seeds, {
      evidence: makeEvidence(profile, {
        id: "moral-compass.values",
        system: "moral-compass",
        field: "morals.values",
        value: values,
        userSupplied: true,
      }),
      label: `the stated values ${values}`,
      priority: 105,
      facets: {
        hiddenNeed: `The stated values place ${values} near the center of trust and alignment.`,
        relationshipImpact: synthesis.relationshipStyle,
        boundaryOrRepair:
          "Name which stated value is being protected before conflict becomes a judgment about character.",
      },
      tensionAxes: axesFromText(values),
      limitations: [
        "Stated values do not prove that every action will express them consistently.",
      ],
    });
  } else {
    missingData.push("Moral values are missing.");
  }

  if (profile.morals?.intolerances?.length) {
    const intolerances = profile.morals.intolerances.slice(0, 5).join(", ");
    addSeed(seeds, {
      evidence: makeEvidence(profile, {
        id: "moral-compass.intolerances",
        system: "moral-compass",
        field: "morals.intolerances",
        value: intolerances,
        userSupplied: true,
      }),
      label: `the stated intolerances ${intolerances}`,
      priority: 100,
      facets: {
        protectiveFunction: `Strong reactions may be attempting to protect boundaries around ${intolerances}.`,
        commonMisreading: `A strong reaction to ${intolerances} may be read as rigidity when it is protecting a stated boundary.`,
        relationshipImpact: synthesis.relationshipStyle,
        boundaryOrRepair:
          "Separate the protected boundary from the intensity of the reaction used to defend it.",
      },
      tensionAxes: axesFromText(intolerances),
      limitations: [
        "An intolerance identifies a reported boundary; it does not establish another person's intent.",
      ],
    });
  }

  if (profile.timeline?.currentPhase) {
    const phase = profile.timeline.currentPhase;
    addSeed(seeds, {
      evidence: makeEvidence(profile, {
        id: "timeline.current-phase",
        system: "timeline",
        field: "timeline.currentPhase",
        value: phase,
      }),
      label: `current timeline phase ${phase}`,
      priority: 60,
      facets: {
        claritySummary: synthesis.currentPhaseMeaning,
        action:
          synthesis.practicalGuidance[0] ??
          "Choose one grounded action that matches the current phase.",
      },
      tensionAxes: axesFromText(
        `${phase} ${(profile.timeline.reasons ?? []).join(" ")}`,
      ),
      limitations: [
        "Timeline phase meaning is contextual and does not predict a guaranteed event.",
      ],
    });
  } else {
    missingData.push("Current timeline phase is missing.");
  }

  if (birthTimeStatus === "unknown") {
    missingData.push(
      "Exact birth time is unknown; Rising sign, houses, angles, Moon degree, and time-sensitive Human Design claims are unavailable.",
    );
  }

  return {
    version: 1,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    birthTimeStatus,
    seeds,
    missingData,
  };
}

export function synthesizeDepthCodex(
  profile: SoulProfile,
  options: DepthCodexOptions = {},
): DepthInterpretationV1 {
  return synthesizeDepthInterpretationV1(
    normalizeSoulProfileForDepth(profile, options),
  );
}
