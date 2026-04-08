interface ArchetypeData {
  title: string;
  description: string;
  strengths: string[];
  shadows: string[];
  themes: string[];
  guidance: string;
  integration: {
    astrologyInfluence: string;
    numerologyInfluence: string;
    personalityBridge: string;
    soulSynthesis: string;
    lifeThemes: string[];
  };
  personalizedInsights: {
    coreEssence: string;
    spiritualPurpose: string;
    evolutionPath: string;
    keyLessons: string[];
  };
}

const archetypes = [
  {
    keywords: ['fire', 'leo', 'leader', '1', '8', 'commander', 'achiever'],
    title: "Solar Sovereign",
    description: "A crown of light rests upon your brow, woven from threads of creative fire and illuminated purpose. You embody the golden dawn of possibility, drawing souls into your luminous orbit like moths to sacred flame.",
    strengths: ["Celestial Leadership", "Alchemical Self-Expression", "Presence that Inspires Awakening", "Lion-Hearted Courage"],
    shadows: ["The Mirror of Ego", "Shadow of Dominion", "Hunger for Reflected Light"],
    themes: ["The Throne of Authentic Power", "Flames of Creation", "Voice that Commands the Stars", "Divine Authority Robed in Humility"],
    guidance: "Let your solar fire warm rather than burn—for the truest sovereign rules through love's radiance, not power's glare. Illuminate paths for others while walking your own with grace."
  },
  {
    keywords: ['water', 'scorpio', 'cancer', '4', '5', 'investigator', 'individualist'],
    title: "Mirror Alchemist", 
    description: "Within you dwells a sacred crucible where shadows transmute to starlight, wounds blossom into wisdom. You are the mystic who dances with darkness to birth the dawn—a soul-deep transformer who knows that pearls form only in the oyster's pain.",
    strengths: ["Depths that Heal Wounds", "Phoenix-Fire Transformation", "Sight Beyond the Veil", "Sacred Alchemy of the Soul"],
    shadows: ["Ocean that Drowns the Self", "Fortress of Isolation", "Spiral of Obsession"],
    themes: ["Metamorphosis through Shadow", "Waters that Cleanse and Renew", "Emotional Mastery as Spiritual Art", "Depth as Devotional Practice"],
    guidance: "Trust the medicine brewing in your depths, yet remember: even the deepest divers must breathe. Surface to share your pearls of wisdom, lest they remain forever hidden in the sacred dark."
  },
  {
    keywords: ['air', 'gemini', 'aquarius', '3', '7', 'enthusiast', 'campaigner'],
    title: "Cosmic Messenger",
    description: "You are the silver-tongued weaver of words and worlds, the bridge between heaven's whispers and earth's ears. Divine sparks dance on your lips—each utterance a prayer, each idea a seed of revolution cast upon winds of change.",
    strengths: ["Voice that Carries Stardust", "Mind Like Quicksilver Lightning", "Shape-Shifting Adaptation", "Vision that Births Tomorrow"],
    shadows: ["Butterfly Mind's Scattered Flight", "Drowning in the Data-Stream", "Surface Skimmer of Shallow Seas"],
    themes: ["Communication as Sacred Communion", "Innovation's Electric Kiss", "Threads that Weave Souls Together", "Wisdom Shared is Love Multiplied"],
    guidance: "Gather your brilliant fragments into focused beams of light. When your words serve the highest truth, you become the universe speaking through human form—precious vessel, prophetic voice."
  },
  {
    keywords: ['earth', 'taurus', 'virgo', 'capricorn', '6', '2', 'helper', 'protector'],
    title: "Sacred Guardian",
    description: "You are the mountain's steadfast embrace, the oak's patient shelter, the soil that nourishes all growing things. Yours is the quiet power of stones and seasons—a love that builds cathedrals grain by grain, breath by devoted breath.",
    strengths: ["Roots that Anchor Souls", "Earth-Wisdom Made Tangible", "Love that Tends and Mends", "Loyalty Carved in Ancient Stone"],
    shadows: ["Atlas Who Carries Too Much Sky", "Walls that Protect Yet Imprison", "Martyrdom's Bitter Harvest"],
    themes: ["Service as Sacred Offering", "Fortress-Hearts that Shelter All", "Foundation Stones of Communities", "Nurture as Highest Calling"],
    guidance: "Your devotion is divine—yet even guardians need guarding, even givers must receive. Fill your own well with the waters of self-love, that your rivers of service may flow eternal."
  },
  {
    keywords: ['mutable', '9', 'peacemaker', 'mediator', 'libra'],
    title: "Harmony Weaver",
    description: "You walk the tightrope between warring worlds, a master of the sacred dance where all opposites embrace. Like moonlight that gentles the night, you bring balm to burning conflicts—your very presence a prayer for peace made flesh.",
    strengths: ["Scales of Divine Justice", "Peacemaker's Healing Touch", "Beauty that Restores Balance", "Equilibrium Born of Grace"],
    shadows: ["Flight from Necessary Storms", "Paralysis of Perpetual Maybe", "Mirror that Reflects Only Others"],
    themes: ["Balance as Spiritual Practice", "Peace Woven from Chaos-Threads", "The Art of Sacred Compromise", "Diplomacy as Love's Language"],
    guidance: "Your gift for harmony is humanity's treasure—yet true peace begins within. Dare to disturb false tranquility when justice calls. Sometimes the most loving act is speaking the difficult truth."
  }
];

// Helper function to generate integration analysis
export function generateIntegrationAnalysis(astrologyData: any, numerologyData: any, personalityData: any, archetype: any) {
  const astroInfluence = generateAstrologyInfluence(astrologyData);
  const numeroInfluence = generateNumerologyInfluence(numerologyData);
  const personalityBridge = generatePersonalityBridge(personalityData);
  const soulSynthesis = generateSoulSynthesis(astrologyData, numerologyData, personalityData, archetype);
  const lifeThemes = extractLifeThemes(astrologyData, numerologyData, personalityData);

  return {
    astrologyInfluence: astroInfluence,
    numerologyInfluence: numeroInfluence,
    personalityBridge: personalityBridge,
    soulSynthesis: soulSynthesis,
    lifeThemes: lifeThemes
  };
}

// Helper function to generate personalized insights
export function generatePersonalizedInsights(astrologyData: any, numerologyData: any, personalityData: any, archetype: any) {
  return {
    coreEssence: generateCoreEssence(astrologyData, numerologyData, archetype),
    spiritualPurpose: generateSpiritualPurpose(astrologyData, numerologyData, personalityData),
    evolutionPath: generateEvolutionPath(astrologyData, numerologyData, archetype),
    keyLessons: generateKeyLessons(astrologyData, numerologyData, personalityData)
  };
}

// Astrology influence generator
function generateAstrologyInfluence(astrologyData: any): string {
  if (!astrologyData) return "Your astrological blueprint awaits discovery through detailed birth chart analysis.";
  
  const { sunSign, moonSign, risingSign } = astrologyData;
  return `Your ${sunSign} Sun provides your core identity and creative force, while your ${moonSign} Moon shapes your emotional nature and inner world. Your ${risingSign} Rising sign creates the persona you present to the world, influencing how others first perceive you. Together, these three form your astrological trinity, creating a unique cosmic signature that influences your personality, motivations, and life path.`;
}

// Numerology influence generator  
function generateNumerologyInfluence(numerologyData: any): string {
  if (!numerologyData) return "Your numerological patterns reveal themselves through the sacred mathematics of your name and birth date.";
  
  const { lifePath, expression, soulUrge, personality } = numerologyData;
  return `Your Life Path ${lifePath} reveals your soul's intended journey and core lessons. Expression Number ${expression} shows your natural talents and abilities, while Soul Urge ${soulUrge} uncovers your heart's deepest desires. Your Personality Number ${personality} influences how others perceive you. These numbers work together to create a mathematical blueprint of your soul's purpose and potential.`;
}

// Personality bridge generator
function generatePersonalityBridge(personalityData: any): string {
  if (!personalityData?.enneagram && !personalityData?.mbti) {
    return "Your personality patterns bridge your cosmic blueprint with earthly expression through conscious self-awareness.";
  }
  
  let bridge = "";
  if (personalityData?.enneagram) {
    bridge += `Your Enneagram Type ${personalityData.enneagram.type} reveals your core motivations and unconscious patterns. `;
  }
  if (personalityData?.mbti) {
    bridge += `Your ${personalityData.mbti.type} type shows how you process information and make decisions. `;
  }
  bridge += "These personality frameworks help bridge your cosmic design with practical daily living, showing how your soul's blueprint manifests in conscious behavior and choice.";
  
  return bridge;
}

// Soul synthesis generator
function generateSoulSynthesis(astrologyData: any, numerologyData: any, personalityData: any, archetype: any): string {
  const systems = [];
  if (astrologyData) systems.push("astrological influences");
  if (numerologyData) systems.push("numerological patterns");  
  if (personalityData?.enneagram || personalityData?.mbti) systems.push("personality dynamics");
  
  if (systems.length === 0) {
    return `The ${archetype.title} archetype represents your soul's unique expression awaiting full discovery.`;
  }
  
  const systemsText = systems.join(", ");
  return `The ${archetype.title} archetype emerges from the synthesis of your ${systemsText}. This archetypal pattern represents how your soul chose to express itself in this incarnation, combining cosmic timing, sacred mathematics, and conscious personality into a unified spiritual identity. Your archetype serves as a guiding template for understanding your deepest nature and highest potential.`;
}

// Core essence generator
function generateCoreEssence(astrologyData: any, numerologyData: any, archetype: any): string {
  let essence = `At your core, you embody the ${archetype.title} archetype - ${archetype.description.toLowerCase()}`;
  
  if (astrologyData?.sunSign && numerologyData?.lifePath) {
    essence += ` Your ${astrologyData.sunSign} Sun and Life Path ${numerologyData.lifePath} create a unique soul signature that expresses through ${archetype.themes.join(', ').toLowerCase()}.`;
  } else {
    essence += ` This archetypal essence expresses through themes of ${archetype.themes.join(', ').toLowerCase()}.`;
  }
  
  return essence;
}

// Spiritual purpose generator
function generateSpiritualPurpose(astrologyData: any, numerologyData: any, personalityData: any): string {
  let purpose = "Your spiritual purpose involves integrating your cosmic gifts into earthly service.";
  
  if (astrologyData?.northNode) {
    purpose = `Your North Node in ${astrologyData.northNode.sign} reveals your soul's primary growth direction. `;
  }
  
  if (numerologyData?.lifePath) {
    const lifePath = numerologyData.lifePath;
    if (lifePath === 1) purpose += "As a Life Path 1, you're here to pioneer new ways of being and lead others toward authenticity.";
    else if (lifePath === 2) purpose += "As a Life Path 2, you're here to teach cooperation and bring harmony to divided situations.";
    else if (lifePath === 3) purpose += "As a Life Path 3, you're here to inspire others through creative expression and joyful communication.";
    else if (lifePath === 4) purpose += "As a Life Path 4, you're here to build stable foundations that support humanity's progress.";
    else if (lifePath === 5) purpose += "As a Life Path 5, you're here to expand consciousness through exploration and change.";
    else if (lifePath === 6) purpose += "As a Life Path 6, you're here to heal and nurture others through unconditional love.";
    else if (lifePath === 7) purpose += "As a Life Path 7, you're here to seek truth and bridge spiritual wisdom with practical application.";
    else if (lifePath === 8) purpose += "As a Life Path 8, you're here to master material realm while maintaining spiritual values.";
    else if (lifePath === 9) purpose += "As a Life Path 9, you're here to serve humanity's evolution through wisdom and compassion.";
    else if (lifePath === 11) purpose += "As a Master Number 11, you're here to inspire others through spiritual insight and intuitive guidance.";
    else if (lifePath === 22) purpose += "As a Master Number 22, you're here to build lasting structures that bridge heaven and earth.";
    else if (lifePath === 33) purpose += "As a Master Number 33, you're here to heal through pure love and embody Christ consciousness.";
    else purpose += `Your Life Path ${lifePath} carries unique spiritual assignments for this incarnation.`;
  } else {
    purpose += " Your purpose unfolds through conscious integration of your spiritual gifts with practical service.";
  }
  
  return purpose;
}

// Evolution path generator
function generateEvolutionPath(astrologyData: any, numerologyData: any, archetype: any): string {
  let path = `Your evolutionary path follows the ${archetype.title} template, moving from `;
  
  if (archetype.shadows && archetype.shadows.length > 0) {
    path += `unconscious patterns like ${archetype.shadows[0].toLowerCase()} toward `;
  } else {
    path += "unconscious reactive patterns toward ";
  }
  
  if (archetype.strengths && archetype.strengths.length > 0) {
    path += `conscious mastery of ${archetype.strengths[0].toLowerCase()}. `;
  } else {
    path += "conscious mastery of your gifts. ";
  }
  
  if (astrologyData?.southNode && astrologyData?.northNode) {
    path += `Astrologically, you're evolving from ${astrologyData.southNode.sign} patterns toward ${astrologyData.northNode.sign} growth.`;
  } else {
    path += "This evolution involves integrating shadow aspects while developing your highest potential.";
  }
  
  return path;
}

// Key lessons generator
function generateKeyLessons(astrologyData: any, numerologyData: any, personalityData: any): string[] {
  const lessons = [];
  
  // Add numerology-based lessons
  if (numerologyData?.lifePath) {
    const lifePath = numerologyData.lifePath;
    if (lifePath === 1) lessons.push("Learning to lead without dominating others");
    else if (lifePath === 2) lessons.push("Balancing cooperation with healthy boundaries");
    else if (lifePath === 3) lessons.push("Focusing creative energy for maximum impact");
    else if (lifePath === 4) lessons.push("Building without becoming rigid or controlling");
    else if (lifePath === 5) lessons.push("Embracing freedom while honoring commitments");
    else if (lifePath === 6) lessons.push("Serving others without losing yourself");
    else if (lifePath === 7) lessons.push("Sharing wisdom without becoming isolated");
    else if (lifePath === 8) lessons.push("Using power for service rather than control");
    else if (lifePath === 9) lessons.push("Giving without depleting your own resources");
    else if ([11, 22, 33].includes(lifePath)) lessons.push("Grounding spiritual gifts in practical service");
  }
  
  // Add astrology-based lessons
  if (astrologyData?.northNode) {
    const northNode = astrologyData.northNode.sign;
    if (northNode === 'Aries') lessons.push("Developing courage and independent action");
    else if (northNode === 'Taurus') lessons.push("Cultivating patience and practical wisdom");
    else if (northNode === 'Gemini') lessons.push("Learning effective communication and adaptability");
    else if (northNode === 'Cancer') lessons.push("Developing emotional intelligence and nurturing");
    else if (northNode === 'Leo') lessons.push("Expressing authentic creativity and leadership");
    else if (northNode === 'Virgo') lessons.push("Mastering service and attention to detail");
    else if (northNode === 'Libra') lessons.push("Creating balance and harmonious relationships");
    else if (northNode === 'Scorpio') lessons.push("Transforming through emotional depth and healing");
    else if (northNode === 'Sagittarius') lessons.push("Expanding consciousness through higher learning");
    else if (northNode === 'Capricorn') lessons.push("Building lasting structures with integrity");
    else if (northNode === 'Aquarius') lessons.push("Contributing to collective progress and innovation");
    else if (northNode === 'Pisces') lessons.push("Developing compassion and spiritual surrender");
  }
  
  // Add personality-based lessons
  if (personalityData?.enneagram?.type) {
    const type = personalityData.enneagram.type;
    if (type === 1) lessons.push("Accepting imperfection while maintaining standards");
    else if (type === 2) lessons.push("Recognizing and meeting your own needs");
    else if (type === 3) lessons.push("Valuing authentic being over achievement");
    else if (type === 4) lessons.push("Finding beauty in ordinary experiences");
    else if (type === 5) lessons.push("Engaging with life instead of just observing");
    else if (type === 6) lessons.push("Trusting yourself and your inner authority");
    else if (type === 7) lessons.push("Going deep instead of constantly seeking novelty");
    else if (type === 8) lessons.push("Using strength to protect rather than control");
    else if (type === 9) lessons.push("Taking action on your own priorities");
  }
  
  // Fallback lessons if no specific data
  if (lessons.length === 0) {
    lessons.push("Integrating your cosmic blueprint with earthly service");
    lessons.push("Balancing personal growth with contribution to others");
    lessons.push("Transforming unconscious patterns into conscious gifts");
  }
  
  return lessons;
}

// Life themes extractor
function extractLifeThemes(astrologyData: any, numerologyData: any, personalityData: any): string[] {
  const themes = new Set<string>();
  
  // Add astrological themes
  if (astrologyData) {
    const { sunSign, moonSign } = astrologyData;
    if (['aries', 'leo', 'sagittarius'].includes(sunSign?.toLowerCase())) {
      themes.add("Creative self-expression");
      themes.add("Leadership and inspiration");
    }
    if (['taurus', 'virgo', 'capricorn'].includes(sunSign?.toLowerCase())) {
      themes.add("Building and manifestation");
      themes.add("Practical service");
    }
    if (['gemini', 'libra', 'aquarius'].includes(sunSign?.toLowerCase())) {
      themes.add("Communication and connection");
      themes.add("Social innovation");
    }
    if (['cancer', 'scorpio', 'pisces'].includes(sunSign?.toLowerCase())) {
      themes.add("Emotional healing");
      themes.add("Spiritual transformation");
    }
  }
  
  // Add numerological themes
  if (numerologyData?.lifePath) {
    const lifePath = numerologyData.lifePath;
    if ([1, 8].includes(lifePath)) themes.add("Leadership and achievement");
    if ([2, 6, 9].includes(lifePath)) themes.add("Service and cooperation");
    if ([3, 5].includes(lifePath)) themes.add("Creative expression and freedom");
    if ([4, 7].includes(lifePath)) themes.add("Knowledge and systematic building");
    if ([11, 22, 33].includes(lifePath)) themes.add("Spiritual mastery and teaching");
  }
  
  return Array.from(themes).slice(0, 6); // Limit to 6 themes
}

// Generate unique archetype title based on ALL profile data for maximum uniqueness
function generateUniqueArchetypeTitle(
  astrologyData: any,
  numerologyData: any,
  personalityData: any
): string {
  // Create comprehensive hash from ALL profile data
  const profileSignature = JSON.stringify({
    sun: astrologyData?.sunSign,
    moon: astrologyData?.moonSign,
    rising: astrologyData?.risingSign,
    lifePath: numerologyData?.lifePath,
    expression: numerologyData?.expression,
    soulUrge: numerologyData?.soulUrge,
    personality: numerologyData?.personality,
    enneagram: personalityData?.enneagram?.type,
    mbti: personalityData?.mbti?.type,
    // Include raw astro data for uniqueness even with same signs
    planets: JSON.stringify(astrologyData?.planets || {}),
    houses: JSON.stringify(astrologyData?.houses || {})
  });
  
  const fullHash = hashString(profileSignature);
  
  // Large expanded word pools with many more options
  const prefixPools = {
    fire: ['Solar', 'Radiant', 'Flame', 'Phoenix', 'Luminous', 'Blazing', 'Ember', 'Stellar'],
    earth: ['Sacred', 'Earthbound', 'Grounded', 'Mountain', 'Crystalline', 'Rooted', 'Stone', 'Verdant'],
    air: ['Cosmic', 'Celestial', 'Ethereal', 'Windborn', 'Astral', 'Skyward', 'Breeze', 'Cloud'],
    water: ['Mystic', 'Ocean', 'Lunar', 'Mirror', 'Tidal', 'Flowing', 'Deep', 'Reflective']
  };
  
  const corePools = {
    1: ['Sovereign', 'Pioneer', 'Trailblazer', 'Initiator', 'Leader', 'Pathfinder', 'Vanguard'],
    2: ['Harmonizer', 'Peaceweaver', 'Bridge', 'Diplomat', 'Mediator', 'Unifier', 'Balancer'],
    3: ['Muse', 'Creator', 'Storyteller', 'Bard', 'Artist', 'Wordsmith', 'Performer'],
    4: ['Builder', 'Architect', 'Guardian', 'Keeper', 'Foundation', 'Crafter', 'Mason'],
    5: ['Wanderer', 'Explorer', 'Catalyst', 'Transformer', 'Voyager', 'Seeker', 'Adventurer'],
    6: ['Healer', 'Nurturer', 'Caretaker', 'Shepherd', 'Protector', 'Guardian', 'Tender'],
    7: ['Seeker', 'Sage', 'Mystic', 'Oracle', 'Philosopher', 'Scholar', 'Knower'],
    8: ['Alchemist', 'Master', 'Manifestor', 'Empress', 'Sovereign', 'Wielder', 'Commander'],
    9: ['Visionary', 'Lightbringer', 'Compassionate', 'Elder', 'Wise One', 'Guide', 'Seer'],
    11: ['Illuminator', 'Beacon', 'Conduit', 'Channel', 'Lightkeeper', 'Revealer', 'Awakener'],
    22: ['Worldbuilder', 'Architect', 'Dreamweaver', 'Crystallizer', 'Anchor', 'Founder', 'Creator'],
    33: ['Avatar', 'Christed', 'Ascended', 'Bodhisattva', 'Master', 'Saint', 'Divine']
  };
  
  const modifierPools = {
    i: ['Introspective', 'Inner', 'Quiet', 'Reflective', 'Centered'],
    e: ['Expressive', 'Outward', 'Radiant', 'Outgoing', 'Open'],
    n: ['Intuitive', 'Visionary', 'Inspired', 'Imaginative', 'Prophetic'],
    s: ['Practical', 'Grounded', 'Sensible', 'Tangible', 'Earthly']
  };
  
  // Build components using hash to select from pools
  const components: string[] = [];
  
  // 1. Sun sign element prefix
  if (astrologyData?.sunSign) {
    const element = getElementForSign(astrologyData.sunSign) as 'fire' | 'earth' | 'air' | 'water';
    const pool = prefixPools[element] || ['Awakened'];
    const selected = pool[Math.abs(fullHash % pool.length)];
    components.push(selected);
  }
  
  // 2. Life Path core
  if (numerologyData?.lifePath) {
    const pool = corePools[numerologyData.lifePath as keyof typeof corePools] || ['Soul'];
    const selected = pool[Math.abs((fullHash >> 4) % pool.length)];
    components.push(selected);
  }
  
  // 3. MBTI modifier (deterministic based on full hash, not just MBTI)
  if (personalityData?.mbti?.type) {
    const mbti = personalityData.mbti.type.toLowerCase();
    const ieKey = mbti.startsWith('i') ? 'i' : 'e';
    const nsKey = mbti.includes('n') ? 'n' : 's';
    
    // Use different hash sections for each modifier type
    if (Math.abs((fullHash >> 8) % 3) === 0) {
      const pool = modifierPools[ieKey];
      const selected = pool[Math.abs((fullHash >> 12) % pool.length)];
      components.unshift(selected);
    }
    if (Math.abs((fullHash >> 16) % 3) === 1) {
      const pool = modifierPools[nsKey];
      const selected = pool[Math.abs((fullHash >> 20) % pool.length)];
      components.unshift(selected);
    }
  }
  
  // 4. Add unique suffix based on expression/soul urge numbers
  if (numerologyData?.expression || numerologyData?.soulUrge) {
    const suffixNum = (numerologyData?.expression || 0) + (numerologyData?.soulUrge || 0);
    const suffixes = ['Light', 'Truth', 'Wisdom', 'Grace', 'Power', 'Love', 'Beauty', 'Justice', 'Freedom', 'Unity', 'Harmony', 'Strength'];
    const selected = suffixes[Math.abs((fullHash >> 24) % suffixes.length)];
    
    if (Math.abs((fullHash >> 28) % 2) === 0 && components.length >= 2) {
      components.push(`of ${selected}`);
    }
  }
  
  // Fallback
  if (components.length === 0) {
    components.push('Awakened', 'Soul');
  }
  
  // Add unique mystical syllable suffix to guarantee absolute uniqueness
  // Uses base-36 encoding of hash to create pronounceable suffixes
  const syllables = ['Ra', 'El', 'Ka', 'Na', 'Sa', 'Ta', 'Ma', 'Da', 'La', 'Va',
                     'Ri', 'Ni', 'Mi', 'Ki', 'Si', 'Ti', 'Li', 'Zi', 'Fi', 'Hi',
                     'Ro', 'No', 'Mo', 'Ko', 'So', 'To', 'Lo', 'Zo', 'Fo', 'Ho',
                     'Ru', 'Nu', 'Mu', 'Ku', 'Su', 'Tu'];
  
  // Generate 2-syllable suffix from hash for uniqueness (36*36 = 1,296 combos per title variant)
  const syl1 = syllables[Math.abs(fullHash % syllables.length)];
  const syl2 = syllables[Math.abs((fullHash >> 6) % syllables.length)];
  const uniqueSuffix = `${syl1}${syl2}`;
  
  // Add suffix in mystical format
  components.push(`-${uniqueSuffix}`);
  
  return components.join(' ');
}

// Helper to get element for sign
function getElementForSign(sign: string): string {
  const s = sign.toLowerCase();
  if (['aries', 'leo', 'sagittarius'].includes(s)) return 'fire';
  if (['taurus', 'virgo', 'capricorn'].includes(s)) return 'earth';
  if (['gemini', 'libra', 'aquarius'].includes(s)) return 'air';
  if (['cancer', 'scorpio', 'pisces'].includes(s)) return 'water';
  return 'fire';
}

// Simple hash function for strings
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return hash;
}

export function synthesizeArchetype(
  astrologyData: any,
  numerologyData: any,
  personalityData: any
): ArchetypeData {
  const keywords: string[] = [];
  
  // Extract keywords from astrology
  if (astrologyData) {
    if (astrologyData.sunSign) keywords.push(astrologyData.sunSign.toLowerCase());
    if (astrologyData.moonSign) keywords.push(astrologyData.moonSign.toLowerCase());
    if (astrologyData.risingSign) keywords.push(astrologyData.risingSign.toLowerCase());
    
    // Add element keywords
    const sunSignLower = astrologyData.sunSign?.toLowerCase();
    if (['aries', 'leo', 'sagittarius'].includes(sunSignLower)) keywords.push('fire');
    if (['taurus', 'virgo', 'capricorn'].includes(sunSignLower)) keywords.push('earth');
    if (['gemini', 'libra', 'aquarius'].includes(sunSignLower)) keywords.push('air');
    if (['cancer', 'scorpio', 'pisces'].includes(sunSignLower)) keywords.push('water');
  }
  
  // Extract keywords from numerology
  if (numerologyData?.lifePath) {
    keywords.push(numerologyData.lifePath.toString());
  }
  
  // Extract keywords from personality
  if (personalityData?.enneagram?.type) {
    keywords.push(personalityData.enneagram.type.toString());
  }
  if (personalityData?.mbti?.type) {
    keywords.push(personalityData.mbti.type.toLowerCase());
  }

  // Find best matching archetype
  let bestMatch = archetypes[0];
  let maxMatches = 0;

  for (const archetype of archetypes) {
    const matches = archetype.keywords.filter(keyword => 
      keywords.some(k => k && (k.includes(keyword) || keyword.includes(k)))
    ).length;
    
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = archetype;
    }
  }
  
  // Generate unique personalized title
  const uniqueTitle = generateUniqueArchetypeTitle(astrologyData, numerologyData, personalityData);

  // Generate detailed integration analysis
  const integration = generateIntegrationAnalysis(astrologyData, numerologyData, personalityData, bestMatch);
  const personalizedInsights = generatePersonalizedInsights(astrologyData, numerologyData, personalityData, bestMatch);

  const result = {
    title: uniqueTitle,
    description: bestMatch.description,
    strengths: bestMatch.strengths || [],
    shadows: bestMatch.shadows || [],
    themes: bestMatch.themes || [],
    guidance: bestMatch.guidance,
    integration,
    personalizedInsights
  };
  
  return result;
}
