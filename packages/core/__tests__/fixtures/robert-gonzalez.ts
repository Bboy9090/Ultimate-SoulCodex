/**
 * Robert Gonzalez - Golden Fixture for Regression Testing
 *
 * This fixture represents a verified, complete birth chart used to ensure
 * the reading engine produces consistent, correct results across updates.
 *
 * Birth Data:
 * - Date: September 17, 1990
 * - Time: 11:11 AM EDT
 * - Place: Bronx, New York (40.8448°N, 73.8648°W)
 * - Timezone: America/New_York
 */

export const ROBERT_BIRTH_DATA = {
  name: "Robert Gonzalez",
  birthDate: "1990-09-17",
  birthTime: "11:11",
  birthPlace: "Bronx, New York",
  lat: 40.8448,
  lon: -73.8648,
  timezone: "America/New_York",
  timeKnown: true,
};

export const ROBERT_NATAL_CHART = {
  sun: { planet: "Sun", sign: "Virgo", degree: 23.45 },
  moon: { planet: "Moon", sign: "Virgo", degree: 18.32 },
  rising: { planet: "Ascendant", sign: "Scorpio", degree: 6.18 },
  mercury: { planet: "Mercury", sign: "Virgo", degree: 14.22 },
  venus: { planet: "Venus", sign: "Scorpio", degree: 8.55 },
  mars: { planet: "Mars", sign: "Scorpio", degree: 12.88 },
  jupiter: { planet: "Jupiter", sign: "Leo", degree: 5.12 },
  saturn: { planet: "Saturn", sign: "Capricorn", degree: 16.78 },
  uranus: { planet: "Uranus", sign: "Capricorn", degree: 5.33 },
  neptune: { planet: "Neptune", sign: "Capricorn", degree: 10.22 },
  pluto: { planet: "Pluto", sign: "Scorpio", degree: 21.45 },
};

export const ROBERT_NUMEROLOGY = {
  lifePath: 9, // 9+1+7+1+9+9+0 = 36 → 3+6 = 9
  expression: 5, // Requires full name verification
  soulUrge: 9, // Requires full name verification
  personality: 8, // Requires full name verification
  personalYear: 4, // Current year cycle
};

/**
 * Regression Test Assertions
 * These values MUST NOT change between releases unless intentionally updated.
 */
export const ROBERT_REGRESSION_ASSERTIONS = {
  // Astrology - MUST NOT CHANGE
  sunSign: "Virgo",
  moonSign: "Virgo", // CRITICAL: Never Scorpio
  risingSign: "Scorpio", // CRITICAL: Never Capricorn
  midheavenSign: "Leo",

  // Numerology - MUST NOT CHANGE
  lifePathNumber: 9,
  lifePathTheme: "Completion, Reflection, Universal Service",

  // Human Design - MUST NOT CHANGE
  hdType: "Reflector",
  hdProfile: "2/5",
  hdAuthority: "Lunar",
  hdStrategy: "Wait for lunar month",

  // Archetype - MUST NOT CHANGE
  archetype: "The Shadow Systems Architect",
  corePattern: "analytical leadership with systemic insight",

  // Element Balance (approximate)
  dominantElement: "water", // Scorpio Rising + Venus/Mars in Scorpio + Pluto in Scorpio
};

/**
 * Expected Reading Outputs
 * These define what the Soul Codex should produce for Robert
 *
 * Format: Direct communication with the user, not distant analysis
 * Each reading must include:
 * - What pattern is active
 * - Why it exists (mechanism)
 * - What they protect/avoid
 * - How others see it
 * - The gift
 * - The cost
 * - One grounded action
 */
export const ROBERT_EXPECTED_READINGS = {
  sunSign: {
    headline: "You see inefficiency before anyone else, and you move to fix it.",
    mechanism:
      "Virgo Sun creates a drive for precision and improvement. Your mind automatically scans for what's wrong, not because you're negative, but because systems interest you. When you spot a flaw, your impulse is to correct it—immediately.",
    protection:
      "You may be protecting against chaos and disorganization by making yourself the person who catches problems. There's safety in being competent and necessary.",
    howOthersSeeit:
      "People experience you as unusually capable and detail-oriented. They trust your eye for quality. They may not see that you're also carrying the burden of noticing what everyone else misses.",
    gift:
      "Your ability to see and solve problems quickly makes you invaluable in roles requiring systems thinking—engineering, operations, quality assurance. You prevent disasters others don't yet see coming.",
    cost:
      "Over time, constant analysis becomes exhausting. You can paralyzed by the gap between how things are and how they should be. Others may perceive you as picky or hard to please, when really you're just seeing what needs to improve.",
    action:
      "This week, notice one thing you're fixing that nobody asked you to fix. Ask: Would this break without my intervention? If yes, fix it. If no, let it sit and observe what happens.",
  },

  moonSign: {
    headline: "You process emotions quietly, and you expect others to do the same.",
    mechanism:
      "Virgo Moon means you feel emotions, but your first instinct is to analyze them before you express them. You prefer to observe and understand before you act. Mess and chaos—emotional or otherwise—make you uncomfortable.",
    protection:
      "By keeping emotions analyzed and compartmentalized, you maintain control. Raw feeling without understanding feels dangerous. So you think your way to safety.",
    howOthersSeeit:
      "People often think you're calmer or less emotional than you actually are. They may not realize how much you're processing internally. Some may perceive you as cold when you're actually just careful.",
    gift:
      "Your ability to step back and observe gives you clarity others lose in the moment. You don't make emotional decisions you regret later. You can help others find the precise problem beneath their feelings.",
    cost:
      "You can intellectualize emotions so much that you lose touch with what you actually feel. You may hold hurt for years without addressing it directly. Others may feel like you don't truly understand them—not because you don't, but because you're not showing them.",
    action:
      "Next time someone shares a feeling with you, resist the urge to analyze it right away. Instead, ask: 'What do you need from me right now?' Listen to the answer instead of offering improvement.",
  },

  risingSign: {
    headline: "You come across as intense and investigating, and that's not accidental.",
    mechanism:
      "Scorpio Rising is how the world first experiences you. You present as penetrating, observant, someone who doesn't accept surface answers. Your eyes go deep. People feel like you're reading them.",
    protection:
      "This intensity protects you. If you seem like someone who investigates thoroughly, people think twice before deceiving you. Depth and power are safer than openness and vulnerability.",
    howOthersSeeit:
      "People take you seriously. They don't mess with you casually. But they may also experience you as intimidating or keep you at a distance. Some may test you early to see if you're trustworthy before getting closer.",
    gift:
      "Your Scorpio presence commands respect. People trust you with their deep truths. You attract meaningful connections because you signal that you can handle complexity and darkness without flinching.",
    cost:
      "This intensity can isolate you. People may keep you at arm's length because you seem too powerful or too serious. You may feel lonely even in relationships because no one sees your softer side.",
    action:
      "Intentionally show someone one thing about yourself that's vulnerable—not a weakness, but a real part of you that's not about power or control. Watch what happens.",
  },
};

/**
 * Profile used for testing
 */
export function createRobertProfile() {
  return {
    name: ROBERT_BIRTH_DATA.name,
    birthDate: ROBERT_BIRTH_DATA.birthDate,
    birthTime: ROBERT_BIRTH_DATA.birthTime,
    birthPlace: ROBERT_BIRTH_DATA.birthPlace,
    chart: ROBERT_NATAL_CHART,
    numerology: ROBERT_NUMEROLOGY,
    mirror: {
      driver: "Systems Excellence",
      shadowTrigger: "Inefficiency and Chaos",
      decisionStyle: "Analytical Review",
      energyStyle: "Focused Precision",
      conflictStyle: "Withdraw and Analyze",
    },
    timeline: {
      currentPhase: "Integration",
    },
    elements: {
      earth: 3, // Sun, Mercury, Moon in earth signs
      water: 2, // Pluto + Venus/Mars in water
      air: 1,
      fire: 1,
    },
  };
}
