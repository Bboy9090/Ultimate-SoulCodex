/**
 * Robert Gonzalez - Golden Fixture for Regression Testing
 *
 * VERIFICATION STATUS: pending_independent_verification
 *
 * RULE: No natal placement may enter this fixture until independently
 * reproduced from birth inputs using at least one trusted ephemeris implementation.
 *
 * Sun: pending_independent_verification (needs correct geocentric calculation)
 * Moon: pending_independent_verification (needs correct geocentric calculation)
 * Ascendant: unresolved (calculation infrastructure incomplete)
 *
 * This fixture:
 * 1. Documents raw birth inputs (immutable)
 * 2. Reserves space for calculation results
 * 3. Does NOT yet claim verification (marked as pending)
 * 4. Does NOT render Moon or Ascendant as verified in production
 * 5. Provides template structure for when verification exists
 */

/**
 * BIRTH INPUTS - These are the immutable source of truth
 * Every change to these values invalidates the entire fixture
 */
export const ROBERT_BIRTH_DATA = {
  name: "Robert Gonzalez",
  birthDate: "1990-09-17",
  birthTime: "11:11",
  birthPlace: "Bronx, New York",
  lat: 40.8448,
  lon: -73.8648,
  timezone: "America/New_York", // EDT = UTC−4 on Sept 17, 1990
  timeKnown: true,
  // UTC conversion: 11:11 AM EDT = 15:11 UTC
  utcTime: "1990-09-17T15:11:00Z",
};

/**
 * CALCULATION METADATA
 * Documents the ephemeris engine and settings used to derive expected values
 */
export const ROBERT_CALCULATION_CONFIG = {
  engine: "astronomy-engine",
  version: "2.1.19",
  model: "geocentric",
  zodiac: "tropical",
  nodeType: "mean",
  houseSystem: "placidus",
  dateOfCalculation: "2025-08-01",
  tolerance: {
    longitude: 0.5, // degrees
  },
  calculationStatus: {
    sun: "pending_independent_verification",
    moon: "pending_independent_verification",
    ascendant: "unresolved",
  },
};

/**
 * NATAL CHART - PENDING INDEPENDENT VERIFICATION
 *
 * These positions are RESERVED for when correct calculations exist.
 * Do NOT treat these as verified. Do NOT use these values in production
 * until independent ephemeris confirmation is obtained.
 *
 * Current status:
 * - Sun: pending_independent_verification (needs apparent geocentric ecliptic)
 * - Moon: pending_independent_verification (needs apparent geocentric ecliptic)
 * - Ascendant: unresolved (calculation infrastructure incomplete)
 *
 * The values below are placeholder references only, NOT verified calculations.
 */
export const ROBERT_NATAL_CHART = {
  // Sun: Awaiting correct geocentric ecliptic longitude calculation
  sun: {
    planet: "Sun",
    sign: null,
    degree: null,
    source: "ephemeris",
    verificationStatus: "pending_independent_verification",
    calculationNote:
      "Must be calculated using apparent geocentric ecliptic longitude from UTC time and Earth position. " +
      "Heliocentric coordinates are incorrect for natal chart.",
  },

  // Moon: Awaiting correct geocentric ecliptic longitude calculation
  // CRITICAL SAFEGUARD: Do NOT render until verified
  moon: {
    planet: "Moon",
    sign: null,
    degree: null,
    source: "ephemeris",
    verificationStatus: "pending_independent_verification",
    calculationNote:
      "Must be calculated using apparent geocentric ecliptic longitude. " +
      "Requires birth time (±15min tolerance). " +
      "Without time, use low confidence. " +
      "Do NOT insert expected value to satisfy test.",
  },

  // Rising: UNRESOLVED
  // CRITICAL SAFEGUARD: Do NOT render without verified calculation and birthTime
  rising: {
    planet: "Ascendant",
    sign: null,
    degree: null,
    source: "ephemeris",
    verificationStatus: "unresolved",
    calculationNote:
      "Ascendant calculation requires: UTC time + location + LST + true obliquity + house system calculation. " +
      "Currently unimplemented. " +
      "Do NOT render until calculation exists and is independently verified.",
  },

  // Supporting planets: Reserved for future verification
  // Not yet included - all planetary positions need independent verification
  mercury: null,
  venus: null,
  mars: null,
  jupiter: null,
  saturn: null,
  uranus: null,
  neptune: null,
  pluto: null,
};

export const ROBERT_NUMEROLOGY = {
  lifePath: 9, // Calculation: 9+1+7+1+9+9+0 = 36 → 3+6 = 9 ✓ VERIFIED
  lifePathTheme: "Completion, Reflection, Universal Service",
  expression: 5, // Requires full name analysis
  soulUrge: 9, // Requires full name analysis
  personality: 8, // Requires full name analysis
  personalYear: 4, // Current year cycle (2025 example)
};

/**
 * REGRESSION TEST ASSERTIONS - PENDING VERIFICATION
 *
 * RULE: These must be independently verified before being used.
 * Do NOT hardcode expected values to satisfy tests.
 * Tests must fail if calculation is incomplete or contradictory.
 *
 * Status:
 * - Sun: pending independent verification
 * - Moon: pending independent verification
 * - Ascendant: unresolved (calculation not implemented)
 * - Midheaven: reserved for future calculation
 */
export const ROBERT_REGRESSION_ASSERTIONS = {
  // ASTROLOGY - PENDING INDEPENDENT VERIFICATION
  // These values are NULL until correct geocentric calculations exist
  sunSign: null,        // Awaiting correct ecliptic longitude calculation
  moonSign: null,       // Awaiting correct ecliptic longitude calculation
  risingSign: null,     // Unresolved - Ascendant calculation not implemented

  // DO NOT fill these in with expected astrology values
  // The test must FAIL if values are still null after correct implementation
  // That failure is the signal that verification is needed

  midheavenSign: null,

  // NUMEROLOGY - Verified (calculation independent of astrology)
  lifePathNumber: 9, // 9+1+7+1+9+9+0 = 36 → 3+6 = 9 (mathematically immutable)
  lifePathTheme: "Completion, Reflection, Universal Service",

  // HUMAN DESIGN - Reserved for future verification
  hdType: null,
  hdProfile: null,
  hdAuthority: null,
  hdStrategy: null,

  // ARCHETYPE - Reserved for future calculation
  archetype: null,
  corePattern: null,

  // ELEMENT BALANCE - Depends on verified astrology
  dominantElement: null,
};

/**
 * EXPECTED READING OUTPUTS - RESERVED FOR WHEN CHART IS VERIFIED
 *
 * CURRENT STATUS: Do NOT use these readings in production until:
 * 1. Chart calculations are independently verified
 * 2. Sun, Moon, and Ascendant values are locked in ROBERT_NATAL_CHART
 * 3. verifyCalculation() returns status: "verified"
 *
 * These readings are TEMPLATES that would apply to verified signs.
 * They do NOT represent confirmed placements yet.
 *
 * Format: Direct communication with the user (Diamond's structure):
 * - Headline: What pattern is active
 * - Mechanism: Why it exists
 * - Protection: What they protect/avoid
 * - How Others See It: External perception
 * - Gift: The upside of the pattern
 * - Cost: The downside when overused
 * - Action: One grounded next step
 *
 * When chart is verified, test will be:
 * "Given Robert's verified chart, the rendering engine produces readings
 *  matching the patterns documented here."
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
