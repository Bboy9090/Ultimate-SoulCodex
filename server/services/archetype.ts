import { extractVerifiedAstrology } from "../lib/verified-astrology";

interface ArchetypeData {
  title: string;
  description: string;
  strengths: string[];
  shadows: string[];
  themes: string[];
  guidance: string;
}

const unresolvedArchetype: ArchetypeData = {
  title: "Pattern Witness",
  description:
    "Your Soul Codex is still assembling the verified layers needed for a responsible synthesis.",
  strengths: ["Self-observation", "Curiosity", "Discernment", "Patience with uncertainty"],
  shadows: ["Rushing toward labels", "Treating guesses as identity", "Outsourcing self-knowledge"],
  themes: ["Observation", "Clarity", "Verification", "Self-trust"],
  guidance:
    "Use the supported layers as reflection prompts and leave unresolved material open until better information exists.",
};

const archetypes = [
  {
    keywords: ["fire", "leo", "leader", "1", "8", "commander", "achiever"],
    title: "Solar Sovereign",
    description:
      "You embody radiant leadership and creative power, naturally drawing others into your luminous presence.",
    strengths: [
      "Natural leadership",
      "Creative expression",
      "Inspiring presence",
      "Courageous action",
    ],
    shadows: [
      "Ego inflation",
      "Domineering tendencies",
      "Need for constant attention",
    ],
    themes: ["Leadership", "Creativity", "Self-expression", "Authority"],
    guidance:
      "Channel your solar energy into uplifting others while staying grounded in humility.",
  },
  {
    keywords: [
      "water",
      "scorpio",
      "cancer",
      "4",
      "5",
      "investigator",
      "individualist",
    ],
    title: "Mirror Alchemist",
    description:
      "You transform through deep reflection, turning life's shadows into profound wisdom and healing.",
    strengths: [
      "Emotional depth",
      "Transformative healing",
      "Intuitive insight",
      "Spiritual alchemy",
    ],
    shadows: [
      "Emotional overwhelm",
      "Isolation tendencies",
      "Obsessive patterns",
    ],
    themes: ["Transformation", "Healing", "Depth", "Emotional mastery"],
    guidance:
      "Trust your ability to transform pain into wisdom, but remember to surface for air and connection.",
  },
  {
    keywords: [
      "air",
      "gemini",
      "aquarius",
      "3",
      "7",
      "enthusiast",
      "campaigner",
    ],
    title: "Cosmic Messenger",
    description:
      "You bridge worlds through communication, bringing divine inspiration into earthly expression.",
    strengths: [
      "Clear communication",
      "Innovative thinking",
      "Versatile adaptation",
      "Inspiring vision",
    ],
    shadows: [
      "Mental scattered-ness",
      "Information overload",
      "Superficial connections",
    ],
    themes: ["Communication", "Innovation", "Connection", "Knowledge sharing"],
    guidance:
      "Focus your brilliant mind on projects that serve the highest good of all.",
  },
  {
    keywords: [
      "earth",
      "taurus",
      "virgo",
      "capricorn",
      "6",
      "2",
      "helper",
      "protector",
    ],
    title: "Sacred Guardian",
    description:
      "You create stability and nurture growth, serving as a protective force for those in your care.",
    strengths: [
      "Reliable support",
      "Practical wisdom",
      "Nurturing care",
      "Steadfast loyalty",
    ],
    shadows: [
      "Over-responsibility",
      "Rigid thinking",
      "Self-sacrifice patterns",
    ],
    themes: ["Service", "Protection", "Stability", "Nurturing"],
    guidance:
      "Your devotion is a gift, but remember to fill your own cup while serving others.",
  },
  {
    keywords: ["mutable", "9", "peacemaker", "mediator", "libra"],
    title: "Harmony Weaver",
    description:
      "You naturally create balance and understanding, bringing peace to conflicted situations.",
    strengths: [
      "Diplomatic skills",
      "Peaceful mediation",
      "Aesthetic appreciation",
      "Emotional balance",
    ],
    shadows: [
      "Conflict avoidance",
      "Indecisiveness",
      "People-pleasing",
    ],
    themes: ["Balance", "Peace", "Harmony", "Diplomacy"],
    guidance:
      "Your gift for creating harmony is needed, but don't lose yourself in others' needs.",
  },
];

export function synthesizeArchetype(
  astrologyData: unknown,
  numerologyData: any,
  personalityData: any,
): ArchetypeData {
  const keywords: string[] = [];

  const verifiedAstrology = extractVerifiedAstrology({ astrologyData });
  for (const sign of [
    verifiedAstrology.sun,
    verifiedAstrology.moon,
    verifiedAstrology.rising,
  ]) {
    if (sign) keywords.push(sign.toLowerCase());
  }

  const sun = verifiedAstrology.sun?.toLowerCase();
  if (sun) {
    if (["aries", "leo", "sagittarius"].includes(sun)) keywords.push("fire");
    if (["taurus", "virgo", "capricorn"].includes(sun)) keywords.push("earth");
    if (["gemini", "libra", "aquarius"].includes(sun)) keywords.push("air");
    if (["cancer", "scorpio", "pisces"].includes(sun)) keywords.push("water");
  }

  if (numerologyData?.lifePath !== undefined && numerologyData?.lifePath !== null) {
    keywords.push(String(numerologyData.lifePath));
  }

  if (personalityData?.enneagram?.type !== undefined) {
    keywords.push(String(personalityData.enneagram.type));
  }
  if (personalityData?.mbti?.type) {
    keywords.push(String(personalityData.mbti.type).toLowerCase());
  }

  let bestMatch: (typeof archetypes)[number] | null = null;
  let maxMatches = 0;

  for (const archetype of archetypes) {
    const matches = archetype.keywords.filter((keyword) =>
      keywords.some((candidate) =>
        candidate.includes(keyword) || keyword.includes(candidate),
      ),
    ).length;

    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = archetype;
    }
  }

  if (!bestMatch || maxMatches === 0) return unresolvedArchetype;

  return {
    title: bestMatch.title,
    description: bestMatch.description,
    strengths: bestMatch.strengths,
    shadows: bestMatch.shadows,
    themes: bestMatch.themes,
    guidance: bestMatch.guidance,
  };
}
