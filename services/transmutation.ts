export interface TransmutationTechnique {
  planet: string;
  technique: string;
  description: string;
  protocol: string[];
  duration: string;
  frequency: string;
  warning?: string;
}

// Maps each planetary force to its corresponding transmutation discipline
export const TRANSMUTATION_TECHNIQUES: Record<string, TransmutationTechnique> = {
  'Pluto': {
    planet: 'Pluto',
    technique: 'Shadow Work & Radical Forgiveness',
    description: 'Pluto transits force confrontation with the shadow - the rejected, hidden parts of yourself. The only way through is radical honesty and forgiveness of self and others.',
    protocol: [
      '1. IDENTIFY THE SHADOW: Write down what you\'re avoiding, denying, or projecting onto others. Name the fear.',
      '2. FEEL THE DENSITY: Sit with the emotion without trying to fix it. Let it be as heavy as it needs to be. This is the death.',
      '3. FORGIVE THE PATTERN: Speak aloud: "I forgive myself for carrying this. I forgive [person/situation] for triggering this. I release this to be transformed."',
      '4. WITNESS THE REBIRTH: Notice what emerges after the heaviness passes. The phoenix always rises from the ashes.',
      '5. INTEGRATE THE LESSON: Ask yourself: "What power was hidden beneath this shadow?" Claim it.'
    ],
    duration: '20-30 minutes per session',
    frequency: 'Daily during intense Pluto transits (conjunction, square, opposition)',
    warning: 'This work is intense. Do not bypass the feeling stage. The shadow must be felt to be healed.'
  },
  
  'Saturn': {
    planet: 'Saturn',
    technique: 'Discipline Protocol & Structure Building',
    description: 'Saturn demands mastery through consistent effort. The Teacher shows you where your foundation is weak. Build it stronger through disciplined action.',
    protocol: [
      '1. IDENTIFY THE WEAK STRUCTURE: Where is Saturn showing limitation? What needs strengthening? (Health, career, relationship commitment, etc.)',
      '2. CREATE THE COMMITMENT: Write a specific, measurable discipline you will practice daily. Make it small enough to be sustainable.',
      '3. TRACK YOUR CONSISTENCY: Use a physical calendar. Mark each day you complete the discipline. This visual proof builds momentum.',
      '4. HONOR THE RESISTANCE: When you don\'t want to do it, do it anyway. This is the lesson. The feeling doesn\'t matter; the action does.',
      '5. REVIEW WEEKLY: Every 7 days, acknowledge what you\'ve built. Saturn rewards those who show up consistently.'
    ],
    duration: 'Daily practice (15-60 minutes depending on the discipline)',
    frequency: 'Continuous throughout Saturn transit (can last 2-3 years)',
    warning: 'Do not quit when it gets hard. That\'s the exact moment Saturn is teaching you mastery.'
  },
  
  'Uranus': {
    planet: 'Uranus',
    technique: 'Liberation Through Surrender & Authentic Expression',
    description: 'Uranus breaks down false structures to reveal authentic truth. Resistance creates suffering. Surrender accelerates awakening.',
    protocol: [
      '1. IDENTIFY THE CAGE: What structure (job, relationship, belief, identity) feels restrictive? Where are you living inauthentically?',
      '2. SPEAK THE TRUTH: Out loud, say what you\'ve been afraid to say. "I don\'t want this anymore." "This isn\'t me." Let the words break the spell.',
      '3. TAKE ONE RADICAL ACTION: Do something your old self would never do. Cut your hair. Quit the thing. Say no. The action rewires your nervous system.',
      '4. EMBRACE THE CHAOS: Change feels unstable because it is. Breathe through the uncertainty. The ground will solidify again.',
      '5. CELEBRATE FREEDOM: Acknowledge each moment you choose authenticity over security. This is the awakening.'
    ],
    duration: 'Spontaneous actions + daily check-in (10 minutes)',
    frequency: 'Throughout Uranus transit, with intensity during exact aspects',
    warning: 'Uranus moves fast. Don\'t overthink it. The lightning has already struck - just move with it.'
  },
  
  'Neptune': {
    planet: 'Neptune',
    technique: 'Spiritual Surrender & Ego Dissolution',
    description: 'Neptune dissolves boundaries and demands surrender of control. The ego must die for the soul to emerge. Trust the process.',
    protocol: [
      '1. RELEASE CONTROL: Identify what you\'re trying to force. Career outcome, relationship, healing timeline. Speak it: "I surrender this to divine timing."',
      '2. MEDITATE ON EMPTINESS: Sit in silence for 20 minutes daily. Don\'t try to achieve anything. Just be. Let the boundaries dissolve.',
      '3. SERVE WITHOUT EXPECTATION: Do something for another person anonymously. No credit, no recognition. This dissolves ego.',
      '4. DISCERN ILLUSION FROM TRUTH: Journal: "What story am I telling myself? What\'s actually true?" Neptune reveals where you\'ve been lying to yourself.',
      '5. PRACTICE COMPASSION: For yourself and others. Everyone is doing their best. Judgment dissolves in the Neptune fog.'
    ],
    duration: '20-30 minutes meditation + ongoing surrender practice',
    frequency: 'Daily during Neptune transit',
    warning: 'Do not make major decisions during peak Neptune transits. Wait for clarity. Confusion is part of the process.'
  },
  
  'Jupiter': {
    planet: 'Jupiter',
    technique: 'Gratitude Amplification & Generous Action',
    description: 'Jupiter expands whatever you focus on. Gratitude multiplies abundance. Generosity creates flow. This is the season of YES.',
    protocol: [
      '1. MORNING GRATITUDE: Before getting out of bed, list 10 things you\'re grateful for. Feel the expansion in your chest.',
      '2. SAY YES TO OPPORTUNITY: Jupiter presents chances for growth. Say yes even if you don\'t feel ready. Confidence comes after action.',
      '3. GIVE FREELY: Money, time, knowledge, praise. Give without expecting return. Jupiter rewards the generous.',
      '4. EXPAND YOUR VISION: Ask yourself: "What would I do if I knew I couldn\'t fail?" Write it down. Take one action toward it today.',
      '5. CELEBRATE WINS: Acknowledge every success, no matter how small. This tells Jupiter you\'re ready for more.'
    ],
    duration: '15 minutes morning practice + ongoing generous action',
    frequency: 'Daily during Jupiter transit (especially during exact aspects)',
    warning: 'Beware of excess and overconfidence. Jupiter can create "too much of a good thing." Stay grounded.'
  }
};

// Get technique for a specific planet
export function getTransmutationTechnique(planet: string): TransmutationTechnique | null {
  return TRANSMUTATION_TECHNIQUES[planet] || null;
}

// Get all techniques
export function getAllTransmutationTechniques(): TransmutationTechnique[] {
  return Object.values(TRANSMUTATION_TECHNIQUES);
}

// Get recommended technique based on active transits
export function getRecommendedTechnique(activeTransits: any[]): TransmutationTechnique | null {
  if (!activeTransits || activeTransits.length === 0) return null;
  
  // Find the most intense transit (high intensity + tight orb)
  const priorityOrder = ['Pluto', 'Neptune', 'Uranus', 'Saturn', 'Jupiter'];
  
  for (const planet of priorityOrder) {
    const transit = activeTransits.find(t => t.planet === planet);
    if (transit) {
      return getTransmutationTechnique(planet);
    }
  }
  
  // Fallback to first transit
  return getTransmutationTechnique(activeTransits[0].planet);
}

// Get multiple techniques if multiple intense transits are active
export function getActiveTransmutationTechniques(activeTransits: any[]): TransmutationTechnique[] {
  if (!activeTransits || activeTransits.length === 0) return [];
  
  const techniques: TransmutationTechnique[] = [];
  const seenPlanets = new Set<string>();
  
  // Get unique techniques for each planet (prioritize high intensity)
  const sortedTransits = [...activeTransits].sort((a, b) => {
    const intensityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
    const aIntensity = intensityOrder[a.intensity] || 0;
    const bIntensity = intensityOrder[b.intensity] || 0;
    return bIntensity - aIntensity;
  });
  
  for (const transit of sortedTransits) {
    if (!seenPlanets.has(transit.planet)) {
      const technique = getTransmutationTechnique(transit.planet);
      if (technique) {
        techniques.push(technique);
        seenPlanets.add(transit.planet);
      }
    }
  }
  
  return techniques;
}
