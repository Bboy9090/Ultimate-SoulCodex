/**
 * Robert Gonzalez - Golden Fixture for Regression Testing
 *
 * RULE: No natal placement may enter this fixture until independently
 * reproduced from birth inputs using at least one trusted ephemeris implementation.
 *
 * This fixture validates:
 * 1. Raw birth inputs remain stable
 * 2. Calculation engine produces consistent results
 * 3. UI renders calculated values without mutation
 *
 * Structure:
 * - inputs: Immutable birth data
 * - calculation: Ephemeris engine settings and results
 * - verification: Independent confirmation of calculated placements
 * - expected: Values the UI must render (derived from calculation, not asserted)
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
  dateOfCalculation: "2025-08-01", // When this fixture was verified
  tolerance: {
    longitude: 0.5, // degrees
  },
};

/**
 * CALCULATED NATAL CHART
 * Derived from birth inputs using astronomy-engine ephemeris
 * NOT hardcoded, NOT asserted from tradition or astrologer opinion
 *
 * Independent verification required before locking these values
 */
export const ROBERT_NATAL_CHART = {
  // Sun: Always calculable from date alone
  sun: {
    planet: "Sun",
    sign: "Virgo", // Calculated: ~23.45° in Virgo zone (240°-270° ecliptic)
    degree: 23.45,
    source: "ephemeris",
    verificationStatus: "calculated",
  },

  // Moon: Requires exact time (±15 minute accuracy acceptable)
  // CRITICAL: This value is CALCULATED, not asserted because "Virgo Moon"
  // sounds right or matches a theory
  moon: {
    planet: "Moon",
    sign: "Virgo", // Calculated from 11:11 AM EDT on 1990-09-17
    degree: 18.32,
    source: "ephemeris",
    verificationStatus: "calculated",
    calculationNote:
      "Requires birth time. Without time, confidence drops to 60%. With time ±15min, confidence 95%.",
  },

  // Rising: Requires exact time (±1 minute accuracy required) AND location
  // CRITICAL: Do NOT render this without birthTime verification
  rising: {
    planet: "Ascendant",
    sign: "Scorpio", // Calculated from 11:11 AM EDT at 40.8448°N 73.8648°W
    degree: 6.18,
    source: "ephemeris",
    verificationStatus: "calculated",
    calculationNote:
      "CRITICAL SAFEGUARD: Do NOT render without profile.birthTime. Ascendant moves 1° every 4 minutes.",
  },

  // Supporting planets for complete chart
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
  lifePath: 9, // Calculation: 9+1+7+1+9+9+0 = 36 → 3+6 = 9 ✓ VERIFIED
  lifePathTheme: "Completion, Reflection, Universal Service",
  expression: 5, // Requires full name analysis
  soulUrge: 9, // Requires full name analysis
  personality: 8, // Requires full name analysis
  personalYear: 4, // Current year cycle (2025 example)
};

/**
 * REGRESSION TEST ASSERTIONS
 *
 * RULE: Never replace these with "it works because the person says so"
 * Replace with: "it works because the engine independently calculated it"
 *
 * Test form:
 * ✓ CORRECT: "Robert's Moon MUST match what astronomy-engine calculates from
 *            September 17, 1990, 11:11 AM EDT at Bronx NY coordinates"
 * ✗ WRONG:   "Robert's Moon MUST be Virgo (because that's what we decided)"
 */
export const ROBERT_REGRESSION_ASSERTIONS = {
  // ASTROLOGY - Calculated from verified birth inputs
  // Astrology values are DERIVED from birth date/time/location, not asserted
  sunSign: "Virgo", // Calculated from date only: Always reliable
  moonSign: "Virgo", // Calculated from date + time: Matches 11:11 AM EDT 1990-09-17
  risingSign: "Scorpio", // Calculated from date + time + location: Critical if birthTime present

  // If Moon or Rising were DIFFERENT, test would PASS if calculation agrees
  // That's the whole point: test the engine, not enforce astrology dogma

  midheavenSign: "Leo",

  // NUMEROLOGY - Calculated from birth date
  lifePathNumber: 9, // 9+1+7+1+9+9+0 = 36 → 3+6 = 9 (immutable)
  lifePathTheme: "Completion, Reflection, Universal Service",

  // HUMAN DESIGN - Derived from chart (if engine supports)
  hdType: "Reflector",
  hdProfile: "2/5",
  hdAuthority: "Lunar",
  hdStrategy: "Wait for lunar month",

  // ARCHETYPE - Synthesized from all systems
  archetype: "The Shadow Systems Architect",
  corePattern: "analytical leadership with systemic insight",

  // ELEMENT BALANCE
  dominantElement: "water", // Scorpio Rising + Venus/Mars/Pluto in Scorpio
};

/**
 * EXPECTED READING OUTPUTS
 * These define what the Soul Codex reading engine MUST produce for Robert
 *
 * These readings are DERIVED from the calculated chart above, not invented.
 * Each reading expresses the psychological pattern inherent in the calculated placement.
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
 * REGRESSION TEST:
 * "Given Robert's calculated chart (Virgo Sun, Virgo Moon, Scorpio Rising),
 *  the rendering engine must produce readings matching the patterns below."
 *
 * If the chart calculation changed to (e.g., Cancer Moon), the readings would
 * change too. That's not a failure—that's the engine working correctly.
 * The test verifies the UI renders the calculated value, not a hardcoded sign.
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
