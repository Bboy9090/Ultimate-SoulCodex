/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOUL CODEX - ELEMENTAL MEDICINE SYSTEM
 * Fusion of Eastern (TCM, Ayurveda) + West/Central African Wisdom
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export type Element = 'Earth' | 'Water' | 'Fire' | 'Air' | 'Metal';

export interface ElementProfile {
  element: Element;
  symbol: string;
  color: string;
  coreFunction: string;
  whenBalanced: string[];
  whenImbalanced: string[];
  needs: string[];
  helps: string[];
  avoid: string[];
  organs: string[];
  emotion: string;
  season: string;
  time: string;
  africanAssociation: string;
  tcmAssociation: string;
  ayurvedicLink: string;
}

export interface ElementalDiagnosis {
  primaryElement: Element;
  secondaryElement: Element;
  excessElement: Element | null;
  deficientElement: Element | null;
  elementScores: Record<Element, number>;
  balance: 'Balanced' | 'Slightly Imbalanced' | 'Imbalanced' | 'Severely Imbalanced';
  interpretation: string;
  dailyFocus: Element;
  weeklyRhythm: Record<string, Element>;
  remedies: ElementalRemedy[];
  warnings: string[];
}

export interface ElementalRemedy {
  category: 'food' | 'movement' | 'ritual' | 'environment' | 'social' | 'rest';
  title: string;
  description: string;
  element: Element;
  effect: 'increase' | 'decrease' | 'balance';
}

export interface SoulArchetype {
  title: string;
  subtitle: string;
  coreEssence: string;
  strengths: string[];
  shadows: string[];
  purpose: string;
  soulFrequency: string;
  firstPersonBio: string;
  romanticProfile: RomanticProfile;
  destinyReading: DestinyReading;
  powerMode: ModeProfile;
  shadowMode: ModeProfile;
}

export interface RomanticProfile {
  title: string;
  howYouLove: string;
  traits: string[];
  craves: string;
  shadowInLove: string[];
  needs: string[];
}

export interface DestinyReading {
  overview: string;
  phases: DestinyPhase[];
  ultimateDestiny: string;
}

export interface DestinyPhase {
  name: string;
  ageRange: string;
  description: string;
  keywords: string[];
}

export interface ModeProfile {
  name: string;
  traits: string[];
  description: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ELEMENT PROFILES DATABASE
// ─────────────────────────────────────────────────────────────────────────────

export const ELEMENT_PROFILES: Record<Element, ElementProfile> = {
  Earth: {
    element: 'Earth',
    symbol: '🌍',
    color: '#8B7355',
    coreFunction: 'Stability, digestion, structure, grounding',
    whenBalanced: [
      'Grounded and steady',
      'Reliable and consistent',
      'Nurturing presence',
      'Practical wisdom',
      'Strong foundation'
    ],
    whenImbalanced: [
      'Overwhelm and heaviness',
      'Worry and overthinking',
      'Stagnation',
      'Digestive issues',
      'Feeling stuck'
    ],
    needs: ['Routine', 'Nourishment', 'Rest', 'Stability', 'Connection to nature'],
    helps: [
      'Warm, grounding meals',
      'Consistent daily schedule',
      'Decluttering space',
      'Walking barefoot on earth',
      'Strength training'
    ],
    avoid: ['Skipping meals', 'Chaos and disorder', 'Isolation', 'Cold foods', 'Irregular sleep'],
    organs: ['Spleen', 'Stomach', 'Muscles'],
    emotion: 'Worry / Pensiveness',
    season: 'Late Summer / Transitions',
    time: 'Morning (7-11 AM)',
    africanAssociation: 'Ancestors, bones, protection, legacy',
    tcmAssociation: 'Spleen-Stomach, transformation of food to energy',
    ayurvedicLink: 'Kapha dosha (stability, structure)'
  },
  
  Water: {
    element: 'Water',
    symbol: '💧',
    color: '#4A90D9',
    coreFunction: 'Emotion, intuition, memory, flow',
    whenBalanced: [
      'Calm and adaptable',
      'Deeply empathetic',
      'Strong intuition',
      'Emotional intelligence',
      'Wisdom and depth'
    ],
    whenImbalanced: [
      'Anxiety and fear',
      'Exhaustion and burnout',
      'Emotional overwhelm',
      'Isolation',
      'Lack of willpower'
    ],
    needs: ['Emotional safety', 'Rest', 'Solitude', 'Creative expression', 'Deep connections'],
    helps: [
      'Hydration and water rituals',
      'Warm baths with salt',
      'Music and sound healing',
      'Journaling emotions',
      'Moon observation'
    ],
    avoid: ['Constant noise', 'Emotional vampires', 'Overwork', 'Cold environments', 'Suppressing feelings'],
    organs: ['Kidneys', 'Bladder', 'Bones', 'Ears'],
    emotion: 'Fear / Wisdom',
    season: 'Winter',
    time: 'Evening (5-7 PM)',
    africanAssociation: 'Emotion, fertility, memory, ancestral waters',
    tcmAssociation: 'Kidney-Bladder, life essence (Jing)',
    ayurvedicLink: 'Kapha + Vata (fluidity, movement)'
  },
  
  Fire: {
    element: 'Fire',
    symbol: '🔥',
    color: '#E85D4C',
    coreFunction: 'Drive, transformation, passion, heat',
    whenBalanced: [
      'Motivated and warm',
      'Natural leader',
      'Passionate expression',
      'Clear vision',
      'Joyful presence'
    ],
    whenImbalanced: [
      'Anger and irritability',
      'Burnout and exhaustion',
      'Insomnia',
      'Inflammation',
      'Destructive impulses'
    ],
    needs: ['Release', 'Purpose', 'Recognition', 'Creative outlet', 'Movement'],
    helps: [
      'Physical exercise (early day)',
      'Morning sunlight',
      'Creative projects',
      'Cooling foods (greens, citrus)',
      'Slower mornings'
    ],
    avoid: ['Late nights', 'Stimulants', 'Conflict', 'Excessive heat', 'Overcommitment'],
    organs: ['Heart', 'Small Intestine', 'Blood vessels'],
    emotion: 'Joy / Anxiety',
    season: 'Summer',
    time: 'Midday (11 AM - 1 PM)',
    africanAssociation: 'Transformation, purification, warrior spirit, Shango energy',
    tcmAssociation: 'Heart-Small Intestine, Shen (spirit)',
    ayurvedicLink: 'Pitta dosha (metabolism, intensity)'
  },
  
  Air: {
    element: 'Air',
    symbol: '🌬️',
    color: '#87CEEB',
    coreFunction: 'Thought, breath, communication, movement',
    whenBalanced: [
      'Clear-minded',
      'Excellent communicator',
      'Quick thinker',
      'Adaptable',
      'Inspired and creative'
    ],
    whenImbalanced: [
      'Overthinking',
      'Restlessness',
      'Anxiety',
      'Scattered energy',
      'Disconnection from body'
    ],
    needs: ['Calm mind', 'Breathwork', 'Boundaries', 'Grounding', 'Silence'],
    helps: [
      'Breathing exercises',
      'Time limits on media',
      'Walking meditation',
      'Single-tasking',
      'Nature sounds'
    ],
    avoid: ['Multitasking', 'Information overload', 'Excessive talking', 'Cold drafts', 'Chaotic environments'],
    organs: ['Lungs', 'Large Intestine', 'Skin'],
    emotion: 'Grief / Inspiration',
    season: 'Autumn',
    time: 'Afternoon (3-5 PM)',
    africanAssociation: 'Spirit communication, breath of ancestors, wind divination',
    tcmAssociation: 'Lung-Large Intestine, Wei Qi (protective energy)',
    ayurvedicLink: 'Vata dosha (movement, nervous system)'
  },
  
  Metal: {
    element: 'Metal',
    symbol: '⚔️',
    color: '#C0C0C0',
    coreFunction: 'Boundaries, order, integrity, protection',
    whenBalanced: [
      'Disciplined and focused',
      'Clear boundaries',
      'Organized mind',
      'Strong integrity',
      'Protective presence'
    ],
    whenImbalanced: [
      'Rigidity',
      'Grief stuck in body',
      'Harsh judgment',
      'Isolation',
      'Perfectionism'
    ],
    needs: ['Structure', 'Closure', 'Justice', 'Order', 'Sacred space'],
    helps: [
      'Creating schedules',
      'Saying "no" clearly',
      'Strength training',
      'Decluttering',
      'Rituals of release'
    ],
    avoid: ['People-pleasing', 'Clutter', 'Broken promises', 'Disrespect', 'Chaos'],
    organs: ['Lungs', 'Large Intestine', 'Skin'],
    emotion: 'Grief / Righteousness',
    season: 'Autumn',
    time: 'Evening (5-7 PM)',
    africanAssociation: 'Ogun energy, iron protection, justice, warfare, boundaries',
    tcmAssociation: 'Metal phase, letting go, refinement',
    ayurvedicLink: 'Vata + Pitta (sharp, cutting, precise)'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ARCHETYPE DATABASE
// ─────────────────────────────────────────────────────────────────────────────

const ARCHETYPES: Record<string, Partial<SoulArchetype>> = {
  'quiet-storm-architect': {
    title: 'The Quiet Storm Architect',
    subtitle: 'Builder of Worlds',
    coreEssence: `You're a builder of worlds — physical, emotional, spiritual, creative. Everything you touch becomes a blueprint, a system, or a legacy. Your mind works like a map: you see the structure behind chaos, the patterns beneath people, the future inside the present.

You're a transformer soul.
You don't stay the same version for long —
you evolve through fire.`,
    strengths: [
      'Insightful as hell',
      'Deep loyalty',
      'Protective but calm',
      'Quiet leader energy',
      'Creative architect mind',
      'Natural problem-solver',
      'Old soul intuition'
    ],
    shadows: [
      'You absorb pain instead of expressing it',
      'You shut down when disappointed',
      'You try to fix what should be walked away from',
      'You carry burdens alone',
      'You love deeper than you admit'
    ],
    purpose: 'To build something enduring. A world, a family legacy, an empire, a story universe — something that outlives you.',
    soulFrequency: 'Warrior heart + creator mind + healer spirit',
  },
  
  'mystic-healer': {
    title: 'The Mystic Healer',
    subtitle: 'Channel of Light',
    coreEssence: `You're a bridge between worlds — the seen and unseen, the broken and whole. Your presence alone shifts energy in a room. You feel everything, sometimes too much, but that sensitivity is your superpower.

You're a transmuter of pain.
What breaks others, you alchemize into wisdom.`,
    strengths: [
      'Profound empathy',
      'Natural healer energy',
      'Spiritual depth',
      'Intuitive knowing',
      'Gentle strength',
      'Transformative presence',
      'Wisdom beyond years'
    ],
    shadows: [
      'You absorb others\' pain as your own',
      'You neglect your own needs for others',
      'Boundaries feel like walls to you',
      'You over-give until empty',
      'You attract broken people to fix'
    ],
    purpose: 'To heal what others cannot see. To be the medicine for souls who have forgotten their light.',
    soulFrequency: 'Healer heart + mystic mind + warrior spirit',
  },
  
  'visionary-revolutionary': {
    title: 'The Visionary Revolutionary',
    subtitle: 'Breaker of Chains',
    coreEssence: `You see what others can't — the future, the truth, the possibility. You're not here to fit in; you're here to reshape reality. Your mind operates ahead of time, and your soul refuses to accept "impossible."

You're a pattern-breaker.
What holds others down, you burn through.`,
    strengths: [
      'Visionary thinking',
      'Fearless authenticity',
      'Innovation mastery',
      'Magnetic presence',
      'Strategic brilliance',
      'Unshakeable conviction',
      'Catalyst energy'
    ],
    shadows: [
      'Impatience with slower minds',
      'Isolation from feeling misunderstood',
      'Burning bridges too fast',
      'Difficulty with mundane tasks',
      'Exhaustion from carrying the vision alone'
    ],
    purpose: 'To shatter limitations and build the future others are afraid to imagine.',
    soulFrequency: 'Visionary mind + rebel heart + creator spirit',
  },
  
  'guardian-protector': {
    title: 'The Guardian Protector',
    subtitle: 'Shield of the Sacred',
    coreEssence: `You're the one who stands between chaos and those you love. Protection isn't a choice for you — it's coded into your soul. You move in silence but strike with precision when needed.

You're a silent fortress.
Your strength is in your stillness.`,
    strengths: [
      'Fierce loyalty',
      'Calm under pressure',
      'Protective instinct',
      'Strategic patience',
      'Physical presence',
      'Dependable strength',
      'Quiet authority'
    ],
    shadows: [
      'Carrying weight that isn\'t yours',
      'Suppressing vulnerability',
      'Hypervigilance exhaustion',
      'Difficulty receiving help',
      'Over-responsibility for others\' safety'
    ],
    purpose: 'To be the shield. To protect what is sacred when no one else will.',
    soulFrequency: 'Warrior heart + guardian mind + protector spirit',
  },
  
  'cosmic-creator': {
    title: 'The Cosmic Creator',
    subtitle: 'Weaver of Realities',
    coreEssence: `You don't just imagine worlds — you build them. Art, stories, systems, experiences — your mind is a universe generator. Creation isn't a hobby; it's your soul's native language.

You're a world-weaver.
What you envision, you manifest.`,
    strengths: [
      'Boundless creativity',
      'Original thinking',
      'Artistic vision',
      'Universe-building mind',
      'Emotional depth in creation',
      'Prolific output',
      'Timeless perspective'
    ],
    shadows: [
      'Perfectionism paralysis',
      'Difficulty finishing projects',
      'Isolation in creative worlds',
      'Undervaluing your work',
      'Losing yourself in creation'
    ],
    purpose: 'To create what has never existed. To leave beauty, meaning, and wonder behind.',
    soulFrequency: 'Creator heart + cosmic mind + artist spirit',
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATION FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate elemental profile based on birth data and optional astrology/numerology
 */
export function calculateElementalProfile(
  birthDate: string,
  lifePath?: number,
  sunSign?: string,
  moonSign?: string,
  humanDesignType?: string
): ElementalDiagnosis {
  const scores: Record<Element, number> = {
    Earth: 20,
    Water: 20,
    Fire: 20,
    Air: 20,
    Metal: 20
  };
  
  // Birth date influences
  const date = new Date(birthDate);
  const month = date.getMonth();
  const day = date.getDate();
  
  // Season-based element (Northern hemisphere)
  if (month >= 2 && month <= 4) { // Spring
    scores.Air += 10;
    scores.Fire += 5;
  } else if (month >= 5 && month <= 7) { // Summer
    scores.Fire += 15;
  } else if (month >= 8 && month <= 10) { // Autumn
    scores.Metal += 10;
    scores.Air += 5;
  } else { // Winter
    scores.Water += 15;
  }
  
  // Day number influence
  const dayNum = day % 5;
  if (dayNum === 0) scores.Earth += 8;
  else if (dayNum === 1) scores.Water += 8;
  else if (dayNum === 2) scores.Fire += 8;
  else if (dayNum === 3) scores.Air += 8;
  else scores.Metal += 8;
  
  // Life Path influence
  if (lifePath) {
    if ([2, 4, 6].includes(lifePath)) scores.Earth += 12;
    if ([7, 9, 11].includes(lifePath)) scores.Water += 12;
    if ([1, 3, 5].includes(lifePath)) scores.Fire += 12;
    if ([5, 7, 9].includes(lifePath)) scores.Air += 10;
    if ([8, 22, 33].includes(lifePath)) scores.Metal += 12;
  }
  
  // Sun sign element mapping
  const signElements: Record<string, Element> = {
    Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
    Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
    Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
    Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water'
  };
  
  if (sunSign && signElements[sunSign]) {
    scores[signElements[sunSign]] += 15;
  }
  
  if (moonSign && signElements[moonSign]) {
    scores[signElements[moonSign]] += 10;
  }
  
  // Human Design type influence
  if (humanDesignType) {
    if (humanDesignType === 'Manifestor') { scores.Fire += 10; scores.Metal += 5; }
    if (humanDesignType === 'Generator') { scores.Earth += 10; scores.Fire += 5; }
    if (humanDesignType === 'Manifesting Generator') { scores.Fire += 10; scores.Earth += 5; }
    if (humanDesignType === 'Projector') { scores.Air += 10; scores.Water += 5; }
    if (humanDesignType === 'Reflector') { scores.Water += 15; }
  }
  
  // Determine primary and secondary elements
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]) as [Element, number][];
  const primaryElement = sorted[0][0];
  const secondaryElement = sorted[1][0];
  const lowestElement = sorted[4][0];
  
  // Determine excess/deficient
  const maxScore = sorted[0][1];
  const minScore = sorted[4][1];
  const avgScore = Object.values(scores).reduce((a, b) => a + b) / 5;
  
  let excessElement: Element | null = null;
  let deficientElement: Element | null = null;
  
  if (maxScore > avgScore + 15) excessElement = sorted[0][0];
  if (minScore < avgScore - 10) deficientElement = sorted[4][0];
  
  // Calculate balance
  const variance = Object.values(scores).reduce((sum, s) => sum + Math.abs(s - avgScore), 0) / 5;
  let balance: ElementalDiagnosis['balance'];
  if (variance < 5) balance = 'Balanced';
  else if (variance < 10) balance = 'Slightly Imbalanced';
  else if (variance < 15) balance = 'Imbalanced';
  else balance = 'Severely Imbalanced';
  
  // Generate interpretation
  const interpretation = generateElementalInterpretation(primaryElement, secondaryElement, excessElement, deficientElement);
  
  // Generate remedies
  const remedies = generateRemedies(excessElement, deficientElement, primaryElement);
  
  // Daily focus based on day of week
  const dayOfWeek = new Date().getDay();
  const dailyElements: Element[] = ['Earth', 'Air', 'Fire', 'Water', 'Metal', 'Earth', 'Water'];
  const dailyFocus = dailyElements[dayOfWeek];
  
  // Weekly rhythm
  const weeklyRhythm: Record<string, Element> = {
    Monday: 'Earth',
    Tuesday: 'Fire',
    Wednesday: 'Air',
    Thursday: 'Water',
    Friday: 'Metal',
    Saturday: 'Fire',
    Sunday: 'Water'
  };
  
  return {
    primaryElement,
    secondaryElement,
    excessElement,
    deficientElement,
    elementScores: scores,
    balance,
    interpretation,
    dailyFocus,
    weeklyRhythm,
    remedies,
    warnings: generateWarnings(excessElement, deficientElement)
  };
}

function generateElementalInterpretation(
  primary: Element,
  secondary: Element,
  excess: Element | null,
  deficient: Element | null
): string {
  let interpretation = `Your elemental constitution is primarily ${primary} with strong ${secondary} influence. `;
  
  const combos: Record<string, string> = {
    'Earth-Water': 'You are deeply grounded yet emotionally intuitive. A natural nurturer with profound depth.',
    'Earth-Fire': 'You combine stability with passion. A builder who creates with intensity and purpose.',
    'Earth-Air': 'You balance practicality with ideas. A grounded thinker who manifests concepts into reality.',
    'Earth-Metal': 'You are structured and disciplined. A fortress of reliability with clear boundaries.',
    'Water-Fire': 'You hold paradox beautifully — depth and intensity, emotion and action. A passionate soul with intuitive power.',
    'Water-Air': 'You blend intuition with intellect. A dreamer who can articulate the unseen.',
    'Water-Metal': 'You combine emotional depth with structured boundaries. A protected yet feeling soul.',
    'Fire-Air': 'You are dynamic and expressive. Quick-minded with passionate delivery.',
    'Fire-Metal': 'You combine drive with discipline. A warrior-architect who builds with fierce focus.',
    'Air-Metal': 'You are precise and communicative. A sharp mind with clear boundaries.'
  };
  
  const key = `${primary}-${secondary}`;
  const reverseKey = `${secondary}-${primary}`;
  interpretation += combos[key] || combos[reverseKey] || 'Your unique blend creates a distinctive elemental signature.';
  
  if (excess) {
    interpretation += ` Currently, you may have excess ${excess} energy — ${ELEMENT_PROFILES[excess].whenImbalanced[0].toLowerCase()}.`;
  }
  
  if (deficient) {
    interpretation += ` You could benefit from more ${deficient} energy — cultivate ${ELEMENT_PROFILES[deficient].needs[0].toLowerCase()}.`;
  }
  
  return interpretation;
}

function generateRemedies(excess: Element | null, deficient: Element | null, primary: Element): ElementalRemedy[] {
  const remedies: ElementalRemedy[] = [];
  
  // Add remedies for deficient element
  if (deficient) {
    const profile = ELEMENT_PROFILES[deficient];
    remedies.push(
      { category: 'movement', title: `Activate ${deficient}`, description: profile.helps[0], element: deficient, effect: 'increase' },
      { category: 'ritual', title: `${deficient} Ritual`, description: profile.helps[1], element: deficient, effect: 'increase' }
    );
  }
  
  // Add remedies to balance excess
  if (excess) {
    const opposite: Record<Element, Element> = {
      Fire: 'Water',
      Water: 'Fire',
      Earth: 'Air',
      Air: 'Earth',
      Metal: 'Water'
    };
    const balancing = opposite[excess];
    const profile = ELEMENT_PROFILES[balancing];
    remedies.push(
      { category: 'food', title: `Cool ${excess}`, description: `Balance with ${balancing}: ${profile.helps[0]}`, element: balancing, effect: 'balance' },
      { category: 'rest', title: `Rest from ${excess}`, description: profile.helps[2] || profile.helps[1], element: balancing, effect: 'decrease' }
    );
  }
  
  // Add primary element maintenance
  const primaryProfile = ELEMENT_PROFILES[primary];
  remedies.push(
    { category: 'environment', title: `Honor Your ${primary}`, description: primaryProfile.helps[3] || primaryProfile.helps[0], element: primary, effect: 'balance' }
  );
  
  return remedies;
}

function generateWarnings(excess: Element | null, deficient: Element | null): string[] {
  const warnings: string[] = [];
  
  if (excess) {
    warnings.push(`Avoid: ${ELEMENT_PROFILES[excess].avoid.slice(0, 2).join(', ')}`);
  }
  
  if (deficient) {
    warnings.push(`You need more: ${ELEMENT_PROFILES[deficient].needs.slice(0, 2).join(', ')}`);
  }
  
  return warnings;
}

// ─────────────────────────────────────────────────────────────────────────────
// SOUL ARCHETYPE GENERATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate complete soul archetype profile
 */
export function generateSoulArchetype(
  name: string,
  lifePath: number,
  sunSign?: string,
  moonSign?: string,
  humanDesignType?: string,
  enneagramType?: number
): SoulArchetype {
  // Determine base archetype
  let archetypeKey = 'quiet-storm-architect';
  
  if (lifePath === 1 || lifePath === 8) archetypeKey = 'visionary-revolutionary';
  else if (lifePath === 2 || lifePath === 6 || lifePath === 9) archetypeKey = 'mystic-healer';
  else if (lifePath === 4 || lifePath === 22) archetypeKey = 'guardian-protector';
  else if (lifePath === 3 || lifePath === 5) archetypeKey = 'cosmic-creator';
  else if (lifePath === 7 || lifePath === 11) archetypeKey = 'quiet-storm-architect';
  
  // Override with Human Design if available
  if (humanDesignType === 'Manifestor') archetypeKey = 'visionary-revolutionary';
  if (humanDesignType === 'Projector') archetypeKey = 'mystic-healer';
  if (humanDesignType === 'Reflector') archetypeKey = 'mystic-healer';
  
  const base = ARCHETYPES[archetypeKey] || ARCHETYPES['quiet-storm-architect'];
  
  // Generate personalized elements
  const firstName = name.split(' ')[0];
  
  const firstPersonBio = generateFirstPersonBio(firstName, base, sunSign, moonSign);
  const romanticProfile = generateRomanticProfile(base, sunSign, moonSign, enneagramType);
  const destinyReading = generateDestinyReading(base, lifePath, humanDesignType);
  const powerMode = generatePowerMode(base);
  const shadowMode = generateShadowMode(base);
  
  return {
    title: base.title || 'The Awakened Soul',
    subtitle: base.subtitle || 'Seeker of Truth',
    coreEssence: base.coreEssence || '',
    strengths: base.strengths || [],
    shadows: base.shadows || [],
    purpose: base.purpose || '',
    soulFrequency: base.soulFrequency || '',
    firstPersonBio,
    romanticProfile,
    destinyReading,
    powerMode,
    shadowMode
  };
}

function generateFirstPersonBio(
  name: string,
  archetype: Partial<SoulArchetype>,
  sunSign?: string,
  moonSign?: string
): string {
  const bios: Record<string, string> = {
    'quiet-storm-architect': `I'm not the loudest in the room, but I'm the one who sees everything. I move with purpose, not noise. I'm loyal, real, and I care deeper than I ever show. I build things — ideas, stories, futures, systems — because that's where my mind comes alive. I've been through shit, but I don't break. I evolve. I protect the people I love, even when they don't know it. I don't waste time on fake energy or small talk. I'm here to build something that actually matters. That's who I am.`,
    
    'mystic-healer': `I feel things others don't notice. It's not a choice — it's how I'm wired. I've learned to carry that weight, to transmute pain into understanding. People come to me when they're broken, and I don't turn them away. But I'm learning that I need healing too. My power isn't in fixing — it's in holding space. I'm here to remind people of their own light.`,
    
    'visionary-revolutionary': `I see the future before it arrives. I don't follow trends — I set them. People call me intense, ahead of my time, sometimes difficult. That's because I refuse to accept limitations that everyone else just tolerates. I'm here to break patterns, not repeat them. My vision is my power.`,
    
    'guardian-protector': `I'm the one who shows up when it matters. I don't talk about loyalty — I live it. When someone I love is threatened, I don't hesitate. I move in silence, but my presence speaks. Protection isn't a role I play. It's who I am at my core.`,
    
    'cosmic-creator': `I see universes where others see blank pages. My mind never stops creating — stories, worlds, systems, art. It's not a hobby; it's my soul's language. I'm here to leave something behind that didn't exist before me.`
  };
  
  let bio = bios[Object.keys(ARCHETYPES).find(k => ARCHETYPES[k].title === archetype.title) || 'quiet-storm-architect'];
  
  return bio;
}

function generateRomanticProfile(
  archetype: Partial<SoulArchetype>,
  sunSign?: string,
  moonSign?: string,
  enneagramType?: number
): RomanticProfile {
  const romanticProfiles: Record<string, RomanticProfile> = {
    'quiet-storm-architect': {
      title: 'The Loyal Firekeeper',
      howYouLove: 'You love with intensity, loyalty, and honesty. You don\'t do shallow. When you\'re in, you\'re in. You give protection, passion, presence, and depth — the kind that can\'t be faked.',
      traits: [
        'Protective',
        'Emotionally intuitive',
        'Honest, even when blunt',
        'Loyal to the bone',
        'Quietly affectionate',
        'Needs emotional safety',
        'Needs a partner who matches your heart AND your mind'
      ],
      craves: 'Someone who is real — no dramas, no games, no pretending. Someone who stands beside you, not behind you or above you. Someone who respects your loyalty and earns your softness.',
      shadowInLove: [
        'You carry the relationship on your back',
        'You don\'t speak hurt — you swallow it',
        'You forgive too deeply',
        'You try to heal people at your own expense'
      ],
      needs: ['Stability', 'Honesty', 'Emotional intelligence', 'Loyalty', 'Calm strength']
    },
    
    'mystic-healer': {
      title: 'The Soul Tender',
      howYouLove: 'You love through presence, understanding, and spiritual connection. For you, intimacy is soul-deep. You see your partner\'s wounds and love them anyway.',
      traits: [
        'Deeply empathic lover',
        'Nurturing presence',
        'Spiritually connected',
        'Intuitive about partner\'s needs',
        'Healing through love',
        'Needs soul recognition'
      ],
      craves: 'Someone who sees your depth without drowning in it. A partner who can hold space for you, not just receive your care.',
      shadowInLove: [
        'You lose yourself in your partner',
        'You attract wounded souls to fix',
        'You give until empty',
        'You mistake healing for loving'
      ],
      needs: ['Spiritual connection', 'Mutual nurturing', 'Emotional reciprocity', 'Space for your healing']
    },
    
    default: {
      title: 'The Authentic Lover',
      howYouLove: 'You love with your whole being. Authenticity matters more than performance. You need realness over romance, depth over drama.',
      traits: ['Authentic', 'Deep', 'Loyal', 'Protective', 'Present'],
      craves: 'Real connection, mutual respect, and someone who matches your depth.',
      shadowInLove: ['Difficulty being vulnerable', 'Carrying too much alone', 'Fear of abandonment'],
      needs: ['Trust', 'Consistency', 'Emotional safety', 'Mutual growth']
    }
  };
  
  const key = Object.keys(ARCHETYPES).find(k => ARCHETYPES[k].title === archetype.title);
  return romanticProfiles[key || 'default'] || romanticProfiles.default;
}

function generateDestinyReading(
  archetype: Partial<SoulArchetype>,
  lifePath: number,
  humanDesignType?: string
): DestinyReading {
  return {
    overview: 'Your path is not random — it follows a pattern. Each phase builds on the last, leading you toward your ultimate purpose.',
    phases: [
      {
        name: 'Fire & Lessons',
        ageRange: '0–25',
        description: 'Learning through pain, betrayal, chaos, mistakes, and broken trust. But every wound taught you a skill, a boundary, or a strength.',
        keywords: ['Foundation', 'Lessons', 'Resilience', 'Identity formation']
      },
      {
        name: 'Construction Era',
        ageRange: '25–40',
        description: 'You start building: projects, systems, creative universes, new identities for yourself. This is where the Architect shows up.',
        keywords: ['Building', 'Creation', 'Systems', 'Manifestation']
      },
      {
        name: 'Rise Into Leadership',
        ageRange: '40–55',
        description: 'You become the mentor, the master builder, the quiet leader people look to. You guide, create, protect, and shape the future.',
        keywords: ['Leadership', 'Mentorship', 'Influence', 'Mastery']
      },
      {
        name: 'Legacy Era',
        ageRange: '55+',
        description: 'What you built becomes your mark. Your creations, your impact, your wisdom — they outlive you and continue to serve.',
        keywords: ['Legacy', 'Wisdom', 'Transcendence', 'Completion']
      }
    ],
    ultimateDestiny: archetype.purpose || 'To leave something enduring behind — a mark that outlasts time.'
  };
}

function generatePowerMode(archetype: Partial<SoulArchetype>): ModeProfile {
  return {
    name: 'Power Mode',
    description: 'Power Mode is your natural state — you just slip out of it when chaos or emotional noise gets too loud.',
    traits: [
      'Architect energy active',
      'Clear boundaries',
      'Centered and calm',
      'Direct with your truth',
      'Creating instead of reacting',
      'Building something big',
      'Leading without saying a word'
    ]
  };
}

function generateShadowMode(archetype: Partial<SoulArchetype>): ModeProfile {
  return {
    name: 'Shadow Mode',
    description: 'When you\'re in Shadow Mode, you\'ve lost connection to your center. Awareness is the first step back.',
    traits: [
      'Silent when hurt',
      'Overthinking',
      'Carrying everyone',
      'Trust issues',
      'Feeling misunderstood',
      'Feeling responsible for everything',
      'Trying to fix people who can\'t be fixed'
    ]
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DAILY ELEMENTAL GUIDANCE
// ─────────────────────────────────────────────────────────────────────────────

export function getDailyElementalGuidance(primaryElement: Element, date: Date = new Date()): {
  element: Element;
  focus: string;
  action: string;
  avoid: string;
  affirmation: string;
} {
  const dayOfWeek = date.getDay();
  const dailyElements: Element[] = ['Earth', 'Air', 'Fire', 'Water', 'Metal', 'Earth', 'Water'];
  const todayElement = dailyElements[dayOfWeek];
  
  const focusMap: Record<Element, { focus: string; action: string; avoid: string; affirmation: string }> = {
    Earth: {
      focus: 'Grounding & Structure',
      action: 'Complete one task fully. Eat a nourishing meal. Touch the ground.',
      avoid: 'Chaos, skipped meals, overcommitment',
      affirmation: 'I am grounded. I am stable. I am enough.'
    },
    Water: {
      focus: 'Rest & Emotion',
      action: 'Journal your feelings. Take a bath. Listen to calming music.',
      avoid: 'Noise, emotional vampires, pushing through exhaustion',
      affirmation: 'I flow with life. My emotions are wisdom.'
    },
    Fire: {
      focus: 'Action & Purpose',
      action: 'Move your body. Start a project. Express your passion.',
      avoid: 'Stagnation, overthinking, playing small',
      affirmation: 'I am the fire. I create. I transform.'
    },
    Air: {
      focus: 'Clarity & Communication',
      action: 'Breathe deeply. Write your thoughts. Speak your truth.',
      avoid: 'Information overload, multitasking, suppressing voice',
      affirmation: 'My mind is clear. My voice matters.'
    },
    Metal: {
      focus: 'Boundaries & Order',
      action: 'Say no to one thing. Organize something. Honor your limits.',
      avoid: 'People-pleasing, clutter, broken promises',
      affirmation: 'I protect my energy. I honor my boundaries.'
    }
  };
  
  return {
    element: todayElement,
    ...focusMap[todayElement]
  };
}

export default {
  ELEMENT_PROFILES,
  calculateElementalProfile,
  generateSoulArchetype,
  getDailyElementalGuidance
};
