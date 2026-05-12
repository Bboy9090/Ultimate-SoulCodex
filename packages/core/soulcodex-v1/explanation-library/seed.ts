import type { ExplanationLibrary } from "./schema.js";

export const EXPLANATION_LIBRARY_SEED: ExplanationLibrary = [
  {
    id: "astrology.sun.virgo",
    name: "Sun in Virgo",
    system: "astrology",
    technicalMeaning:
      "The Sun describes identity focus, conscious direction, and how a person organizes effort. Virgo adds precision, analysis, and service orientation.",
    plainEnglishMeaning:
      "You tend to build confidence by improving what is in front of you and making systems cleaner over time.",
    whyItMatters:
      "This pattern affects work style, standards, trust in process, and how quickly you notice what feels off.",
    howItShowsUp: [
      "You scan for errors before committing.",
      "You prefer practical proof over hype.",
      "You feel calmer when structure is clear.",
    ],
    gift: [
      "high pattern recognition",
      "quality control under pressure",
      "steady service to long-term goals",
    ],
    shadow: [
      "over-correction when anxious",
      "self-criticism that slows momentum",
      "difficulty delegating imperfect work",
    ],
    growthMove:
      "Set a completion threshold before starting, so refinement supports progress instead of blocking it.",
    confidence: {
      badge: "verified",
      note: "Sun sign is date-stable when birth date is valid.",
    },
  },
  {
    id: "astrology.moon.scorpio",
    name: "Moon in Scorpio",
    system: "astrology",
    technicalMeaning:
      "The Moon describes emotional regulation, attachment memory, and safety reactions. Scorpio adds intensity, privacy, and transformation pressure.",
    plainEnglishMeaning:
      "You feel deeply and often test for trust before full emotional openness.",
    whyItMatters:
      "This pattern influences bonding pace, conflict repair style, and how you respond to emotional threat.",
    howItShowsUp: [
      "You remember emotional breaches for a long time.",
      "You may pull back until motives feel clear.",
      "You protect private emotions until trust is earned.",
    ],
    gift: [
      "loyalty under pressure",
      "strong emotional intuition",
      "capacity to recover after deep transitions",
    ],
    shadow: [
      "suspicion loops",
      "silent emotional testing",
      "holding resentment instead of naming it",
    ],
    growthMove:
      "Name the feeling directly before starting an internal investigation about other people.",
    confidence: {
      badge: "partial",
      note: "Moon sign is usually stable, but exact degree and house expression depend on birth-time precision.",
    },
  },
  {
    id: "astrology.rising.capricorn",
    name: "Capricorn Rising",
    system: "astrology",
    technicalMeaning:
      "The rising sign describes first-interface behavior and defensive posture. Capricorn rising emphasizes restraint, accountability, and long-horizon positioning.",
    plainEnglishMeaning:
      "People often experience you as composed and serious before they see your softer layers.",
    whyItMatters:
      "This affects social pacing, reputation strategy, and how quickly you allow access.",
    howItShowsUp: [
      "You lead with competence before vulnerability.",
      "You take commitments seriously and track follow-through.",
      "You prefer earned trust over rapid familiarity.",
    ],
    gift: [
      "strong containment in chaos",
      "credible leadership presence",
      "disciplined execution",
    ],
    shadow: [
      "over-control in uncertain situations",
      "emotional distance when stressed",
      "self-worth tied too tightly to output",
    ],
    growthMove:
      "Let trusted people see process, not only finished results, so support can arrive earlier.",
    confidence: {
      badge: "partial",
      note: "Rising sign is highly birth-time and location sensitive.",
    },
  },
  {
    id: "human_design.type.projector",
    name: "Projector Type",
    system: "human_design",
    technicalMeaning:
      "Projector design emphasizes guidance, pattern reading, and strategic direction rather than sustained generator-style output.",
    plainEnglishMeaning:
      "You tend to do your best work by seeing systems clearly and guiding timing, not by forcing constant output.",
    whyItMatters:
      "This pattern influences energy management, collaboration quality, and burnout risk when work pacing is misaligned.",
    howItShowsUp: [
      "You notice inefficiency quickly in teams and processes.",
      "You can become depleted when carrying nonstop execution loads.",
      "You deliver high value when your insight is recognized and applied.",
    ],
    gift: [
      "strategic guidance",
      "systems-level perspective",
      "high leverage through focused insight",
    ],
    shadow: [
      "overworking to prove value",
      "resentment when contributions are ignored",
      "staying in environments that reward volume over precision",
    ],
    growthMove:
      "Design days around focused guidance windows and intentional recovery instead of constant availability.",
    confidence: {
      badge: "partial",
      note: "Type calculation depends on birth-time and location precision.",
    },
  },
  {
    id: "numerology.life_path.9",
    name: "Life Path 9",
    system: "numerology",
    technicalMeaning:
      "Life Path 9 emphasizes completion cycles, broad human concern, and meaning-making through service and perspective.",
    plainEnglishMeaning:
      "You are often pulled toward impact that helps people beyond your immediate circle.",
    whyItMatters:
      "This affects motivation, boundaries in helping roles, and decisions about where your effort should scale.",
    howItShowsUp: [
      "You track whether work matters, not only whether it pays.",
      "You may carry more emotional responsibility than is sustainable.",
      "You can struggle to close chapters that still feel unresolved.",
    ],
    gift: [
      "compassion with range",
      "ability to connect personal story to collective meaning",
      "strong closure insight when lessons are integrated",
    ],
    shadow: [
      "over-giving past healthy limits",
      "difficulty releasing past cycles",
      "confusing guilt with responsibility",
    ],
    growthMove:
      "Set explicit boundary rules for help, so contribution stays sustainable and clear.",
    confidence: {
      badge: "verified",
      note: "Life Path is date-stable when birth date is valid.",
    },
  },
] as const;

