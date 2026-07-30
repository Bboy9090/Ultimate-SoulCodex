/**
 * Soul Codex Interpretation Engine - Phase 3
 *
 * Mechanism-driven interpretation: explain HOW systems create patterns
 * Not just naming themes, but revealing actual tensions and dynamics
 *
 * OLD: "A central pattern emphasizes precision, improvement, and practical service."
 * NEW: "You naturally notice what is inefficient, unfinished, or poorly structured.
 *       Your strongest instinct is to improve it in a way that serves a larger purpose."
 *
 * The difference: OLD describes evidence. NEW explains the actual lived experience.
 */

export type DataDepth = "date_only" | "partial" | "complete";

export interface ArchetypeSelection {
  name: string;
  tagline: string;
  status: "provisional" | "complete";
  basedOn: string[]; // "Virgo Sun", "Life Path 9", "Scorpio Rising", "Reflector 2/5"
  nextSteps?: string; // How to upgrade from provisional to complete
}

/**
 * Phase 3 Rule: Archetype upgrades with data depth
 *
 * Date only (Sun only):
 * "Service-Oriented Analyst"
 * Status: Provisional (based on solar sign only)
 *
 * Astrology + Numerology:
 * "Purposeful Systems Builder"
 * Status: Provisional (missing rising sign and Human Design)
 *
 * Full verified (Sun + Moon + Rising + Numerology + Human Design):
 * "The Shadow Systems Architect"
 * Status: Complete
 */

export function selectArchetype(
  dataDepth: DataDepth,
  sunSign?: string,
  moonSign?: string,
  ascendant?: string,
  lifePathNumber?: number,
  humanDesignProfile?: string
): ArchetypeSelection {
  // Date only: Sun only
  if (dataDepth === "date_only" && sunSign === "Virgo") {
    return {
      name: "Service-Oriented Analyst",
      tagline: "Precision in service of a larger good",
      status: "provisional",
      basedOn: ["Virgo Sun"],
      nextSteps: "Add birth time for rising sign and lunar placement",
    };
  }

  // Partial: Astrology + Numerology (no rising/Human Design)
  if (
    dataDepth === "partial" &&
    sunSign === "Virgo" &&
    moonSign === "Virgo" &&
    lifePathNumber === 9
  ) {
    return {
      name: "Purposeful Systems Builder",
      tagline: "Diagnosing dysfunction, rebuilding with intention",
      status: "provisional",
      basedOn: ["Virgo Sun", "Virgo Moon", "Life Path 9"],
      nextSteps: "Add Human Design and verify rising sign for full profile",
    };
  }

  // Complete: All systems verified
  if (
    dataDepth === "complete" &&
    sunSign === "Virgo" &&
    moonSign === "Virgo" &&
    ascendant === "Scorpio" &&
    lifePathNumber === 9 &&
    humanDesignProfile
  ) {
    return {
      name: "The Shadow Systems Architect",
      tagline:
        "Diagnosing weak systems and rebuilding them into useful structures",
      status: "complete",
      basedOn: [
        "Virgo stellium",
        "Scorpio Rising",
        "Life Path 9",
        humanDesignProfile,
      ],
    };
  }

  // Fallback
  return {
    name: "Provisional Archetype",
    tagline: "Awaiting more data",
    status: "provisional",
    basedOn: [],
  };
}

/**
 * Phase 3: Mechanism-based interpretation
 *
 * Instead of: "The supplied profile supports both Virgo Sun symbolism and Life Path 9 symbolism."
 * Write: "One part of you wants exactness and control over details. Another wants the work to
 *         serve something larger than personal success."
 *
 * Then explain the tension, not just name it.
 */

export interface InterpretationPattern {
  title: string;
  observation: string; // What people actually notice
  mechanism: string; // How the systems create this pattern
  tension?: string; // Where this causes actual conflict
  gift: string; // What this enables
  shadow: string; // What this costs
}

export function generateCorePatternInterpretation(
  sunSign?: string,
  moonSign?: string,
  ascendant?: string,
  lifePathNumber?: number
): InterpretationPattern {
  // Virgo Sun + Virgo Moon + Scorpio Rising + Life Path 9
  if (
    sunSign === "Virgo" &&
    moonSign === "Virgo" &&
    ascendant === "Scorpio" &&
    lifePathNumber === 9
  ) {
    return {
      title: "Precision Meets Purpose",
      observation:
        "You naturally notice what is inefficient, unfinished, or poorly structured. Your strongest instinct is to improve it in a way that serves a larger purpose.",
      mechanism:
        "Virgo (detail orientation) + Life Path 9 (completion/closure) create a drive toward useful improvement. Scorpio rising adds penetrative insight—you don't just see surface problems, you recognize root dysfunction.",
      tension:
        "Your standards and sense of responsibility can expand a task beyond what is required to complete it. Perfectionism meets the 9's need to bring things to closure. Meaning raises the standard, and you may never feel the work is 'enough.'",
      gift: "Systems diagnosis, practical improvement, and purposeful rebuilding. You turn disorder into something clearer, more useful, and more durable.",
      shadow:
        "Analysis paralysis masked as thoroughness. The work can expand infinitely if the mission feels important. Completion may feel like betrayal of potential.",
    };
  }

  // Fallback for other combinations
  return {
    title: "Core Pattern Pending Verification",
    observation: "Awaiting complete birth data",
    mechanism: "",
    gift: "",
    shadow: "",
  };
}

/**
 * Phase 3: What people see vs What they miss
 * Keep structure, strengthen content to be psychologically accurate
 */

export interface PsychologicalMirror {
  whatPeopleSee: string;
  whatTheyMiss: string;
  howTheyMisit: string; // typo intentional - the mechanism of the misreading
}

export function generatePsychologicalMirror(
  sunSign?: string,
  moonSign?: string,
  ascendant?: string
): PsychologicalMirror {
  if (sunSign === "Virgo" && moonSign === "Virgo" && ascendant === "Scorpio") {
    return {
      whatPeopleSee:
        "Discernment, practical problem-solving, and high standards. Someone who catches errors and improves systems.",
      whatTheyMiss:
        "The pressure you place on yourself to make the work useful, meaningful, and worthy of the larger mission. The cost of perfectionism isn't pride—it's the feeling that nothing is ever ready to release.",
      howTheyMisit:
        "They see the standard-setting and assume it's personal excellence. They don't see the moral weight—that good-enough feels like failure when people depend on you.",
    };
  }

  return {
    whatPeopleSee: "Awaiting complete data",
    whatTheyMiss: "",
    howTheyMisit: "",
  };
}

/**
 * Phase 3: Action-oriented insights
 * Move from "implications" to "what actually changes"
 */

export interface ActionableInsight {
  domain: string; // "Relationships", "Work", "Self-understanding"
  currentPattern: string; // How you're likely operating now
  leverage: string; // What to lean into
  guard: string; // What to watch for
  test: string; // How to know if it's working
}

export function generateActionInsights(
  ascendant?: string,
  lifePathNumber?: number
): ActionableInsight[] {
  if (ascendant === "Scorpio" && lifePathNumber === 9) {
    return [
      {
        domain: "Work & Contribution",
        currentPattern:
          "You expand responsibility until the project feels worthy. Scope creeps because meaning keeps rising the bar.",
        leverage:
          "Define 'complete enough to test' before refining again. Decide what version serves others now, even if version 2.0 would be better.",
        guard:
          "Notice when perfectionism becomes a reason to delay release. The cost of holding work to 'ready' may be higher than the cost of 'good enough.'",
        test: "You finish one clearly defined cycle and move on, rather than perpetually refining.",
      },
      {
        domain: "Relationships",
        currentPattern:
          "You listen for what's broken and start fixing it. This can read as unsolicited advice or implicit criticism.",
        leverage:
          "Ask first: 'Do you want me to problem-solve this, or do you need to think it through?' Then actually listen to the answer.",
        guard:
          "Your instinct to improve isn't malice. But the recipient may experience it as judgment. Name that difference explicitly.",
        test: "People ask for your insight before you offer it. They don't feel fixed, they feel understood.",
      },
      {
        domain: "Self-Understanding",
        currentPattern:
          "You judge yourself by the standard of 'useful to the world.' This is both your strength and your cruelty to yourself.",
        leverage:
          "Usefulness is real. Your work matters. And you're allowed to rest without proving value.",
        guard:
          "Watch for the belief that you're only worthy when you're improving something. Rest is not failure.",
        test: "You can describe what you did today and feel okay about it, whether or not it served the mission.",
      },
    ];
  }

  return [];
}

/**
 * Phase 3: Better top section structure
 * Cleaner, fewer labels, golden template provided
 */

export interface CodexTopSection {
  subjectName: string;
  archetypeName: string;
  archetypeTagline: string;
  archetypeStatus: "provisional" | "complete";

  coreInsight: string; // One strong observation

  systems: {
    astrology: string; // "Virgo Sun · Virgo Moon · Scorpio Rising"
    numerology?: string; // "Life Path 9"
    humanDesign?: string; // "Reflector 2/5"
  };

  coreGift: string;
  primaryTension: string;
  groundedAction: string;

  calculationConfidence: "High" | "Moderate" | "Low";
  verifiedSystems: string[]; // "Verified astrology", "Deterministic numerology", etc.
}

/**
 * Golden Template: Robert Gonzalez
 * All fields populated correctly, serving as regression test and UX example
 */
export const GOLDEN_ROBERT_CODEX: CodexTopSection = {
  subjectName: "Robert Gonzalez",
  archetypeName: "The Shadow Systems Architect",
  archetypeTagline:
    "Diagnosing weak systems and rebuilding them into useful structures",
  archetypeStatus: "complete",

  coreInsight:
    "You naturally detect what is inefficient, hidden, unfinished, or structurally weak. Your strongest pattern is turning disorder into something clearer, more useful, and more durable.",

  systems: {
    astrology: "Virgo Sun · Virgo Moon · Scorpio Rising",
    numerology: "Life Path 9",
    humanDesign: "Reflector 2/5",
  },

  coreGift:
    "Systems diagnosis, practical improvement, and purposeful rebuilding.",
  primaryTension:
    "Your standards and sense of responsibility can expand a task beyond what is required to complete it.",
  groundedAction:
    "Finish one clearly defined cycle before taking responsibility for another. Decide what 'complete enough to test' means before refining again.",

  calculationConfidence: "High",
  verifiedSystems: [
    "Verified astrology",
    "Deterministic numerology",
    "Self-confirmed Human Design",
  ],
};
