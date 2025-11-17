import type { Profile } from '@shared/schema';

export interface Affirmation {
  text: string;
  category: 'abundance' | 'peace' | 'love' | 'transformation' | 'power';
  focus: string;
}

// Affirmation templates based on different soul profile aspects
const AFFIRMATION_TEMPLATES = {
  // Life Path Number based
  lifePath: {
    1: [
      { text: "I am a natural leader, and I step confidently into my power today.", category: 'power' as const, focus: "Leadership" },
      { text: "New beginnings flow to me effortlessly as I trust my pioneering spirit.", category: 'transformation' as const, focus: "New Beginnings" },
      { text: "I attract opportunities that honor my independence and originality.", category: 'abundance' as const, focus: "Independence" }
    ],
    2: [
      { text: "I am a peacemaker, and harmony flows through all my relationships.", category: 'peace' as const, focus: "Harmony" },
      { text: "My sensitivity is my superpower, connecting me deeply to love and truth.", category: 'love' as const, focus: "Connection" },
      { text: "I attract balanced partnerships that honor my gentle strength.", category: 'abundance' as const, focus: "Partnership" }
    ],
    3: [
      { text: "I express my creative gifts freely, and the universe celebrates my joy.", category: 'transformation' as const, focus: "Creativity" },
      { text: "Love and laughter surround me as I share my authentic voice.", category: 'love' as const, focus: "Self-Expression" },
      { text: "Abundance flows to me through my natural charisma and joy.", category: 'abundance' as const, focus: "Joy" }
    ],
    4: [
      { text: "I build strong foundations, and my efforts create lasting abundance.", category: 'abundance' as const, focus: "Foundation" },
      { text: "I trust the process, knowing my dedication brings peaceful rewards.", category: 'peace' as const, focus: "Trust" },
      { text: "My practical wisdom transforms challenges into stepping stones.", category: 'transformation' as const, focus: "Wisdom" }
    ],
    5: [
      { text: "I embrace freedom and change, attracting adventures that align with my soul.", category: 'transformation' as const, focus: "Freedom" },
      { text: "My curiosity opens doors to abundant opportunities and experiences.", category: 'abundance' as const, focus: "Adventure" },
      { text: "I flow with life's changes, finding peace in every transformation.", category: 'peace' as const, focus: "Flow" }
    ],
    6: [
      { text: "I nurture myself and others with unconditional love and compassion.", category: 'love' as const, focus: "Nurturing" },
      { text: "My heart is open, attracting harmonious and loving relationships.", category: 'love' as const, focus: "Harmony" },
      { text: "I create beauty and peace in my home and in the world.", category: 'peace' as const, focus: "Beauty" }
    ],
    7: [
      { text: "I trust my inner wisdom, and spiritual abundance flows to me naturally.", category: 'abundance' as const, focus: "Wisdom" },
      { text: "I find peace in solitude, connecting deeply with my higher self.", category: 'peace' as const, focus: "Solitude" },
      { text: "My quest for truth transforms my life and inspires others.", category: 'transformation' as const, focus: "Truth" }
    ],
    8: [
      { text: "I am a powerful manifestor, and material abundance is my natural state.", category: 'abundance' as const, focus: "Manifestation" },
      { text: "I use my power wisely, creating prosperity that benefits all.", category: 'power' as const, focus: "Prosperity" },
      { text: "Success flows to me as I align my ambition with divine purpose.", category: 'transformation' as const, focus: "Success" }
    ],
    9: [
      { text: "I am a compassionate healer, and love radiates from my very being.", category: 'love' as const, focus: "Healing" },
      { text: "I release what no longer serves me, making space for abundant blessings.", category: 'transformation' as const, focus: "Release" },
      { text: "My humanitarian spirit attracts soul-aligned opportunities to serve.", category: 'abundance' as const, focus: "Service" }
    ],
    11: [
      { text: "I am a spiritual messenger, and my intuition guides me to divine abundance.", category: 'power' as const, focus: "Intuition" },
      { text: "I trust my visions, knowing they transform lives including my own.", category: 'transformation' as const, focus: "Vision" },
      { text: "My light inspires others, and love multiplies through my presence.", category: 'love' as const, focus: "Inspiration" }
    ],
    22: [
      { text: "I am a master builder, manifesting abundance on a grand scale.", category: 'abundance' as const, focus: "Mastery" },
      { text: "My practical vision transforms dreams into lasting reality.", category: 'transformation' as const, focus: "Vision" },
      { text: "I create peace and prosperity for myself and the collective.", category: 'peace' as const, focus: "Legacy" }
    ],
    33: [
      { text: "I am a master teacher, and unconditional love flows through everything I do.", category: 'love' as const, focus: "Teaching" },
      { text: "My compassion transforms pain into healing for all beings.", category: 'transformation' as const, focus: "Compassion" },
      { text: "I attract abundant opportunities to serve and uplift humanity.", category: 'abundance' as const, focus: "Service" }
    ]
  },
  
  // Sun Sign based
  sunSign: {
    Aries: [
      { text: "I courageously pursue my passions, and success flows naturally to me.", category: 'power' as const, focus: "Courage" },
      { text: "My bold energy attracts exciting opportunities and abundant experiences.", category: 'abundance' as const, focus: "Boldness" }
    ],
    Taurus: [
      { text: "I am grounded in abundance, attracting wealth and beauty effortlessly.", category: 'abundance' as const, focus: "Stability" },
      { text: "I create a peaceful sanctuary, and serenity surrounds me always.", category: 'peace' as const, focus: "Sanctuary" }
    ],
    Gemini: [
      { text: "My curious mind attracts abundant knowledge and connections.", category: 'abundance' as const, focus: "Curiosity" },
      { text: "I communicate with love, and my words create positive transformation.", category: 'love' as const, focus: "Communication" }
    ],
    Cancer: [
      { text: "I nurture myself with love, and emotional abundance flows to me.", category: 'love' as const, focus: "Self-Love" },
      { text: "I trust my intuition, finding peace in the wisdom of my emotions.", category: 'peace' as const, focus: "Intuition" }
    ],
    Leo: [
      { text: "I shine my light boldly, and the universe celebrates my magnificence.", category: 'power' as const, focus: "Radiance" },
      { text: "Love and admiration flow to me as I express my authentic self.", category: 'love' as const, focus: "Authenticity" }
    ],
    Virgo: [
      { text: "I serve with love, and abundant blessings return to me multiplied.", category: 'abundance' as const, focus: "Service" },
      { text: "I find peace in perfection unfolding naturally through my efforts.", category: 'peace' as const, focus: "Perfection" }
    ],
    Libra: [
      { text: "I create harmony in all areas, attracting balanced and abundant relationships.", category: 'love' as const, focus: "Balance" },
      { text: "Peace and beauty surround me as I align with grace and fairness.", category: 'peace' as const, focus: "Grace" }
    ],
    Scorpio: [
      { text: "I transform powerfully, shedding old layers to reveal my abundant truth.", category: 'transformation' as const, focus: "Transformation" },
      { text: "My depth attracts profound love and soul-level connections.", category: 'love' as const, focus: "Depth" }
    ],
    Sagittarius: [
      { text: "I expand fearlessly, and abundance meets me on every adventure.", category: 'abundance' as const, focus: "Expansion" },
      { text: "I trust life's journey, finding peace in the wisdom of experience.", category: 'peace' as const, focus: "Trust" }
    ],
    Capricorn: [
      { text: "I build my empire with patience, attracting lasting wealth and success.", category: 'abundance' as const, focus: "Achievement" },
      { text: "My discipline transforms dreams into tangible reality.", category: 'transformation' as const, focus: "Discipline" }
    ],
    Aquarius: [
      { text: "My unique vision attracts abundant opportunities to innovate and lead.", category: 'power' as const, focus: "Innovation" },
      { text: "I connect with my tribe, and collective love amplifies my purpose.", category: 'love' as const, focus: "Community" }
    ],
    Pisces: [
      { text: "I flow with divine guidance, and spiritual abundance fills my life.", category: 'abundance' as const, focus: "Flow" },
      { text: "Love is my natural state, and compassion transforms everything I touch.", category: 'love' as const, focus: "Compassion" }
    ]
  },
  
  // Human Design Type based
  hdType: {
    Generator: [
      { text: "I respond to life with joy, and my energy attracts abundant satisfaction.", category: 'abundance' as const, focus: "Response" },
      { text: "I trust my sacral wisdom, finding peace in work that lights me up.", category: 'peace' as const, focus: "Satisfaction" }
    ],
    "Manifesting Generator": [
      { text: "I move quickly toward my desires, manifesting abundance at lightning speed.", category: 'abundance' as const, focus: "Speed" },
      { text: "I honor my multi-passionate nature, transforming through diverse experiences.", category: 'transformation' as const, focus: "Versatility" }
    ],
    Manifestor: [
      { text: "I initiate powerfully, and the universe supports my bold moves.", category: 'power' as const, focus: "Initiation" },
      { text: "I inform with love, creating peace through clear communication.", category: 'peace' as const, focus: "Clarity" }
    ],
    Projector: [
      { text: "I am recognized for my gifts, attracting abundant invitations to guide.", category: 'abundance' as const, focus: "Recognition" },
      { text: "I rest deeply, finding peace in honoring my unique energy rhythm.", category: 'peace' as const, focus: "Rest" }
    ],
    Reflector: [
      { text: "I am a wise mirror, and my clarity attracts abundant opportunities to reflect truth.", category: 'power' as const, focus: "Wisdom" },
      { text: "I honor my lunar cycle, finding peace in patient decision-making.", category: 'peace' as const, focus: "Patience" }
    ]
  },
  
  // Enneagram Type based
  enneagram: {
    1: [
      { text: "I release perfectionism, finding peace in progress and growth.", category: 'peace' as const, focus: "Progress" },
      { text: "My integrity attracts abundant opportunities aligned with my values.", category: 'abundance' as const, focus: "Integrity" }
    ],
    2: [
      { text: "I receive love as generously as I give it, creating abundant reciprocity.", category: 'love' as const, focus: "Receiving" },
      { text: "My needs matter, and honoring them brings peace to my relationships.", category: 'peace' as const, focus: "Self-Care" }
    ],
    3: [
      { text: "I am worthy beyond my achievements, attracting love for who I am.", category: 'love' as const, focus: "Worthiness" },
      { text: "Success flows naturally when I align authenticity with ambition.", category: 'abundance' as const, focus: "Authenticity" }
    ],
    4: [
      { text: "I am whole and complete, and this truth transforms my experience.", category: 'transformation' as const, focus: "Wholeness" },
      { text: "My unique gifts attract abundant appreciation and recognition.", category: 'abundance' as const, focus: "Uniqueness" }
    ],
    5: [
      { text: "I trust that I have enough energy, time, and resources for abundance.", category: 'abundance' as const, focus: "Sufficiency" },
      { text: "I engage with life fully, finding peace in connection and presence.", category: 'peace' as const, focus: "Engagement" }
    ],
    6: [
      { text: "I trust myself and life, releasing fear to welcome abundant peace.", category: 'peace' as const, focus: "Trust" },
      { text: "My courage transforms anxiety into confident action and growth.", category: 'transformation' as const, focus: "Courage" }
    ],
    7: [
      { text: "I find joy in the present moment, where true abundance already exists.", category: 'abundance' as const, focus: "Presence" },
      { text: "I embrace all emotions, finding peace in the fullness of experience.", category: 'peace' as const, focus: "Wholeness" }
    ],
    8: [
      { text: "I use my power to protect and empower, attracting love and loyalty.", category: 'love' as const, focus: "Protection" },
      { text: "My vulnerability is strength, transforming relationships through openness.", category: 'transformation' as const, focus: "Vulnerability" }
    ],
    9: [
      { text: "My voice matters, and speaking my truth attracts abundant respect.", category: 'power' as const, focus: "Voice" },
      { text: "I honor my priorities, finding peace in asserting my needs.", category: 'peace' as const, focus: "Assertion" }
    ]
  }
};

// Universal affirmations for days when specific data isn't available
const UNIVERSAL_AFFIRMATIONS: Affirmation[] = [
  { text: "I am worthy of infinite abundance, and prosperity flows to me from expected and unexpected sources.", category: 'abundance', focus: "Worthiness" },
  { text: "Peace is my natural state, and I return to calm with every breath.", category: 'peace', focus: "Calm" },
  { text: "I am love, I give love, I receive love - love is the essence of who I am.", category: 'love', focus: "Essence" },
  { text: "I transform with grace, releasing what no longer serves my highest good.", category: 'transformation', focus: "Grace" },
  { text: "I step into my power today, trusting in my ability to create my reality.", category: 'power', focus: "Creation" },
  { text: "The universe conspires in my favor, aligning me with perfect opportunities.", category: 'abundance', focus: "Alignment" },
  { text: "I choose peace over worry, knowing that everything unfolds in divine timing.", category: 'peace', focus: "Timing" },
  { text: "My heart is open to give and receive love in all its beautiful forms.", category: 'love', focus: "Openness" },
  { text: "I embrace change as a catalyst for positive transformation in my life.", category: 'transformation', focus: "Change" },
  { text: "I am divinely guided, protected, and deeply loved by the universe.", category: 'love', focus: "Divine Love" }
];

// Deterministic seeded shuffle for consistent daily affirmations
function seededShuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentSeed = seed;
  
  // Simple seeded random number generator (Mulberry32)
  const seededRandom = () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    return currentSeed / 4294967296;
  };
  
  // Fisher-Yates shuffle with seeded random
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// Generate seed from profile ID and date for deterministic selection
function generateSeed(profileId: string, date: string = new Date().toISOString().split('T')[0]): number {
  const str = `${profileId}-${date}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function generateDailyAffirmations(profile: Profile, count: number = 3, date?: string): Affirmation[] {
  const affirmations: Affirmation[] = [];
  const astroData = profile.astrologyData as any;
  const hdData = profile.humanDesignData as any;
  const personalityData = profile.personalityData as any;
  const numData = profile.numerologyData as any;
  
  // Get affirmations from different aspects
  const sources: Affirmation[][] = [];
  
  // Life Path affirmations
  if (numData?.lifePath && AFFIRMATION_TEMPLATES.lifePath[numData.lifePath as keyof typeof AFFIRMATION_TEMPLATES.lifePath]) {
    sources.push(AFFIRMATION_TEMPLATES.lifePath[numData.lifePath as keyof typeof AFFIRMATION_TEMPLATES.lifePath]);
  }
  
  // Sun Sign affirmations
  if (astroData?.sunSign && AFFIRMATION_TEMPLATES.sunSign[astroData.sunSign as keyof typeof AFFIRMATION_TEMPLATES.sunSign]) {
    sources.push(AFFIRMATION_TEMPLATES.sunSign[astroData.sunSign as keyof typeof AFFIRMATION_TEMPLATES.sunSign]);
  }
  
  // Human Design Type affirmations
  if (hdData?.type && AFFIRMATION_TEMPLATES.hdType[hdData.type as keyof typeof AFFIRMATION_TEMPLATES.hdType]) {
    sources.push(AFFIRMATION_TEMPLATES.hdType[hdData.type as keyof typeof AFFIRMATION_TEMPLATES.hdType]);
  }
  
  // Enneagram affirmations
  if (personalityData?.enneagram?.type && AFFIRMATION_TEMPLATES.enneagram[personalityData.enneagram.type as keyof typeof AFFIRMATION_TEMPLATES.enneagram]) {
    sources.push(AFFIRMATION_TEMPLATES.enneagram[personalityData.enneagram.type as keyof typeof AFFIRMATION_TEMPLATES.enneagram]);
  }
  
  // Combine all sources
  const allAffirmations = sources.flat();
  
  // Generate deterministic seed based on profile ID and date
  const seed = generateSeed(profile.id, date);
  
  // If we have profile-specific affirmations, select deterministically
  if (allAffirmations.length > 0) {
    const shuffled = seededShuffle(allAffirmations, seed);
    affirmations.push(...shuffled.slice(0, count));
  }
  
  // Fill remaining with universal affirmations if needed
  while (affirmations.length < count) {
    const remaining = count - affirmations.length;
    const universal = seededShuffle(UNIVERSAL_AFFIRMATIONS, seed + affirmations.length);
    affirmations.push(...universal.slice(0, remaining));
  }
  
  return affirmations.slice(0, count);
}
