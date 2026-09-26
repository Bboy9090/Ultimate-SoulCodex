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

function verifiedPlacementSign(astrologyData: any, key: "sun" | "moon" | "rising"): string | undefined {
  const placement = astrologyData?.placements?.[key] ?? astrologyData?.[key];
  if (!placement || typeof placement !== "object") return undefined;
  const status = placement.verificationStatus ?? placement.status;
  const evidence = placement.provenance ?? placement.evidence;
  if (status !== "verified") return undefined;
  if (!evidence?.source || !evidence?.engine || !evidence?.calculatedAt) return undefined;
  return typeof placement.sign === "string" && placement.sign.trim() ? placement.sign : undefined;
}

function governedAstrologyView(astrologyData: unknown): any | null {
  const source = astrologyData as any;
  const sun = verifiedPlacementSign(source, "sun");
  const moon = verifiedPlacementSign(source, "moon");
  const rising = verifiedPlacementSign(source, "rising");
  if (!sun && !moon && !rising) return null;
  return { sunSign: sun, moonSign: moon, risingSign: rising };
}

const archetypes = [
  {
    keywords: ['fire', 'leo', 'leader', '1', '8', 'commander', 'achiever'],
    title: "The Natural Leader",
    description: "You walk in the room and the energy shifts. You got that natural, effortless royalty about you—a spark that just makes people want to follow your lead. You draw folks into your orbit without even trying because you carry that authentic, creative fire. You're not just loud for no reason; you're born to lead effortlessly, but you do it with heart.",
    strengths: ["Effortless Authority", "Creative Spark", "Inspiring Presence", "Authentic Courage"],
    shadows: ["Ego traps", "Needing constant validation", "Dominating the room unnecessarily"],
    themes: ["Owning your authentic power", "Creating impactful work", "Leading by example", "Holding your head high"],
    guidance: "Keep shining, but remember that the best leaders warm the room instead of scorching it. Let your fire inspire people to find their own light instead of just making them stand in your shadow."
  },
  {
    keywords: ['water', 'scorpio', 'cancer', '4', '5', 'investigator', 'individualist'],
    title: "The Deep Truth-Seeker", 
    description: "You don't do surface-level. You see right through the BS and straight into people's core. You're the one who takes the darkest, heaviest moments in life and turns them into straight-up wisdom. You've been through the fire, and instead of letting it break you, you used it to forge something totally unbreakable within yourself.",
    strengths: ["Deep Emotional Intelligence", "Turning Pain to Wisdom", "Seeing Past the Surface", "Fierce Resilience"],
    shadows: ["Drowning in your own depth", "Isolating yourself", "Holding onto grudges or obsessions"],
    themes: ["Healing through honesty", "Emotional mastery", "Finding strength in vulnerability", "Deep connections"],
    guidance: "Trust your gut, because your depth is your absolute superpower. But hey, remember to come up for air sometimes. You don't always have to dive into the deep end—it's okay to just exist in the light for a minute and catch your breath."
  },
  {
    keywords: ['air', 'gemini', 'aquarius', '3', '7', 'enthusiast', 'campaigner'],
    title: "The Visionary Communicator",
    description: "You've got the gift of gab, but with actual substance. You're the bridge connecting totally different worlds, dropping gems and sparking new ideas wherever you go. Your mind moves at lightning speed, connecting dots that nobody else even sees, and your words have the power to shift perspectives instantly.",
    strengths: ["Brilliant Communicator", "Lightning-Fast Mind", "Adaptable & Quick", "Future-Focused Vision"],
    shadows: ["Getting scattered or burnt out", "Information overload", "Keeping things too surface-level"],
    themes: ["Connecting people and ideas", "Innovative thinking", "Speaking your truth", "Building community"],
    guidance: "Your mind is brilliant, but it can get real scattered if you're pulling in a hundred directions at once. Ground yourself. Lock in on what actually matters, and your voice will literally move mountains."
  },
  {
    keywords: ['earth', 'taurus', 'virgo', 'capricorn', '6', '2', 'helper', 'protector'],
    title: "The Grounded Protector",
    description: "Look, you're the rock everybody leans on when things get shaky. You got that quiet, steadfast energy like a mountain—immovable, rooted, providing shelter when the storms hit. You love building things up, block by block, making sure everyone you care about has a solid foundation. You're out here doing the quiet, real work of keeping it all together.",
    strengths: ["Unshakable Loyalty", "Practical Wisdom", "Nurturing Care", "Building Real Foundations"],
    shadows: ["Carrying everybody else's weight", "Getting stuck in your ways", "Playing the martyr"],
    themes: ["Providing safe spaces", "Long-term building", "Devotion and loyalty", "Steady growth"],
    guidance: "Listen, your devotion is beautiful, but even the strongest walls need maintenance. You can't pour from an empty cup. Take a minute to fill your own tank so you don't burn out trying to carry everybody else's weight."
  },
  {
    keywords: ['mutable', '9', 'peacemaker', 'mediator', 'libra'],
    title: "The Balance Keeper",
    description: "You're the peacekeeper, the one who can step into a chaotic situation and just smooth it all out. You've got this natural grace that helps conflicting sides find middle ground. You don't just want things to look nice; you want genuine balance, fairness, and good energy for everybody involved. You walk the tightrope and make it look easy.",
    strengths: ["Natural Diplomat", "Healing Energy", "Creating True Balance", "Grace Under Fire"],
    shadows: ["Avoiding necessary conflict", "Indecision", "Losing yourself to please others"],
    themes: ["Creating harmony", "Justice and fairness", "Building bridges", "Emotional intelligence"],
    guidance: "I respect you keeping the peace, but never forget that your voice matters too. Sometimes you gotta rock the boat to get to the real truth. Don't shrink yourself just to keep everybody else comfortable."
  }
];

// Helper function to generate integration analysis
export function generateIntegrationAnalysis(astrologyData: any, numerologyData: any, personalityData: any, archetype: any) {
  astrologyData = governedAstrologyView(astrologyData);
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
  astrologyData = governedAstrologyView(astrologyData);
  return {
    coreEssence: generateCoreEssence(astrologyData, numerologyData, archetype),
    spiritualPurpose: generateSpiritualPurpose(astrologyData, numerologyData, personalityData),
    evolutionPath: generateEvolutionPath(astrologyData, numerologyData, archetype),
    keyLessons: generateKeyLessons(astrologyData, numerologyData, personalityData)
  };
}

// Astrology influence generator
function generateAstrologyInfluence(astrologyData: any): string {
  if (!astrologyData) {
    return "Astrology is withheld here until governed placement evidence is available.";
  }

  const { sunSign, moonSign, risingSign } = astrologyData;
  return `In astrological tradition, a ${sunSign} Sun, ${moonSign} Moon, and ${risingSign} Rising are used as symbolic lenses for identity, emotional style, and outward presentation. Soul Codex treats those meanings as reflection prompts, not measured personality traits or causes of behavior.`;
}

// Numerology influence generator
function generateNumerologyInfluence(numerologyData: any): string {
  if (!numerologyData || numerologyData.status === "unresolved") {
    return "Numerology is withheld here until deterministic name and birth-date inputs are resolved.";
  }

  const { lifePath, expression, soulUrge, personality } = numerologyData;
  return `Under the declared Soul Codex numerology policy, Life Path ${lifePath}, Expression ${expression}, Soul Urge ${soulUrge}, and Personality ${personality} are deterministic symbolic numbers. Traditional numerology associates them with different reflection themes, but they do not prove destiny, talent, hidden desire, or how other people perceive you.`;
}

// Personality bridge generator
function generatePersonalityBridge(personalityData: any): string {
  if (!personalityData?.enneagram && !personalityData?.mbti) {
    return "No personality-framework result is being used in this layer.";
  }

  const parts: string[] = [];
  if (personalityData?.enneagram?.type) {
    parts.push(`Enneagram Type ${personalityData.enneagram.type}`);
  }
  if (personalityData?.mbti?.type) {
    parts.push(`MBTI ${personalityData.mbti.type}`);
  }

  return `${parts.join(" and ")} can be used as self-reflection frameworks when they come from an explicit assessment. They are not treated here as objective measurements of unconscious motives, cognition, or fixed behavior.`;
}

// Soul synthesis generator
function generateSoulSynthesis(astrologyData: any, numerologyData: any, personalityData: any, archetype: any): string {
  const systems = [];
  if (astrologyData) systems.push("verified-supported astrology");
  if (numerologyData && numerologyData.status !== "unresolved") systems.push("deterministic numerology");
  if (personalityData?.enneagram || personalityData?.mbti) systems.push("explicit personality-framework results");

  if (systems.length === 0) {
    return `The ${archetype.title} label is withheld from factual identity claims because there is not enough governed evidence to support a synthesis.`;
  }

  return `The ${archetype.title} archetype is a reflective synthesis of ${systems.join(", ")}. It is a narrative lens for exploring patterns and questions; it is not proof of a soul plan, destiny, incarnation purpose, or fixed psychological identity.`;
}

// Core essence generator
function generateCoreEssence(astrologyData: any, numerologyData: any, archetype: any): string {
  const themes = Array.isArray(archetype?.themes) ? archetype.themes.join(', ').toLowerCase() : "the available themes";
  let essence = `As a reflection prompt, the ${archetype.title} archetype emphasizes ${themes}.`;

  if (astrologyData?.sunSign && numerologyData?.lifePath) {
    essence += ` A ${astrologyData.sunSign} Sun and Life Path ${numerologyData.lifePath} add two different symbolic traditions to that prompt; neither is treated as a measured core essence.`;
  }

  return essence;
}

// Spiritual purpose generator
function generateSpiritualPurpose(astrologyData: any, numerologyData: any, personalityData: any): string {
  void personalityData;
  const prompts: string[] = [];

  if (astrologyData?.northNode?.sign) {
    prompts.push(
      `In some astrological traditions, North Node in ${astrologyData.northNode.sign} is used as a symbolic growth-direction prompt.`,
    );
  }

  const lifePathThemes: Record<number, string> = {
    1: "initiative and independent action",
    2: "cooperation and relationship balance",
    3: "expression and creativity",
    4: "structure and steady building",
    5: "change and adaptability",
    6: "responsibility and care",
    7: "inquiry and reflection",
    8: "execution, resources, and leadership",
    9: "completion, contribution, and perspective",
    11: "inspiration and heightened perspective",
    22: "large-scale building and implementation",
    33: "teaching, service, and care",
  };

  const lifePath = Number(numerologyData?.lifePath);
  if (Number.isInteger(lifePath) && lifePathThemes[lifePath]) {
    prompts.push(
      `Traditional numerology uses Life Path ${lifePath} as a reflection theme around ${lifePathThemes[lifePath]}.`,
    );
  }

  if (prompts.length === 0) {
    return "No governed spiritual-purpose claim is made from the available data.";
  }

  return `${prompts.join(" ")} These are optional symbolic prompts, not evidence that you were born for a predetermined mission.`;
}

// Evolution path generator
function generateEvolutionPath(astrologyData: any, numerologyData: any, archetype: any): string {
  let path = `Your evolutionary path follows the ${archetype.title} template, moving from `;
  
  if (archetype.shadows && archetype.shadows.length > 0) {
    path += `possible reactive patterns such as ${archetype.shadows[0].toLowerCase()} toward `;
  } else {
    path += "possible reactive patterns toward ";
  }
  
  if (archetype.strengths && archetype.strengths.length > 0) {
    path += `conscious mastery of ${archetype.strengths[0].toLowerCase()}. `;
  } else {
    path += "conscious mastery of your gifts. ";
  }
  
  if (astrologyData?.southNode && astrologyData?.northNode) {
    path += `Astrologically, you're evolving from ${astrologyData.southNode.sign} patterns toward ${astrologyData.northNode.sign} growth.`;
  } else {
    path += "Use this as a reflection exercise: notice which listed shadow themes actually fit, then practice the strengths you want to develop.";
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
    lessons.push("Noticing reactive patterns and deliberately practicing preferred strengths");
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
  
  // Large expanded word pools with grounded, direct words
  const prefixPools = {
    fire: ['Fierce', 'Radiant', 'Bold', 'Electric', 'Dynamic', 'Passionate'],
    earth: ['Grounded', 'Solid', 'Rooted', 'Steadfast', 'Real', 'Practical'],
    air: ['Brilliant', 'Sharp', 'Visionary', 'Quick', 'Electric', 'Awake'],
    water: ['Deep', 'Intuitive', 'Soulful', 'Profound', 'Empathic', 'Heavy']
  };
  
  const corePools = {
    1: ['Pioneer', 'Leader', 'Boss', 'Vanguard', 'Trailblazer'],
    2: ['Connector', 'Bridge', 'Peacemaker', 'Diplomat', 'Resolver'],
    3: ['Creator', 'Voice', 'Storyteller', 'Artist', 'Speaker'],
    4: ['Builder', 'Architect', 'Guardian', 'Foundation', 'Rock'],
    5: ['Explorer', 'Catalyst', 'Transformer', 'Seeker', 'Disruptor'],
    6: ['Healer', 'Nurturer', 'Protector', 'Guardian', 'Anchor'],
    7: ['Seeker', 'Truth-Teller', 'Thinker', 'Philosopher', 'Guide'],
    8: ['Mastermind', 'Commander', 'Executor', 'Boss', 'Architect'],
    9: ['Visionary', 'Guide', 'Elder', 'Compassionate', 'Light'],
    11: ['Awakener', 'Beacon', 'Illuminator', 'Channel', 'Guide'],
    22: ['Master Builder', 'Anchor', 'Architect', 'Founder', 'Creator'],
    33: ['Master Healer', 'Light', 'Teacher', 'Guide', 'Healer']
  };
  
  const modifierPools = {
    i: ['Deep', 'Quiet', 'Reflective', 'Centered', 'Observant'],
    e: ['Outgoing', 'Radiant', 'Expressive', 'Loud', 'Open'],
    n: ['Intuitive', 'Visionary', 'Inspired', 'Imaginative', 'Future-Focused'],
    s: ['Practical', 'Grounded', 'Sensible', 'Tangible', 'Real']
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
    const suffixes = ['Truth', 'Wisdom', 'Grit', 'Power', 'Love', 'Justice', 'Freedom', 'Realness', 'Harmony', 'Strength'];
    const selected = suffixes[Math.abs((fullHash >> 24) % suffixes.length)];
    
    if (Math.abs((fullHash >> 28) % 2) === 0 && components.length >= 2) {
      components.push(`of ${selected}`);
    }
  }
  
  // Fallback
  if (components.length === 0) {
    components.push('Real', 'Soul');
  }
  
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
  const rawAstrologyData = astrologyData;
  astrologyData = governedAstrologyView(astrologyData);
  const keywords: string[] = [];
  
  // Extract keywords from verified astrology only
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

  if (keywords.length === 0) {
    return {
      title: "Archetype unresolved",
      description: "No governed identity evidence is available for archetype synthesis. No substitute archetype is assigned.",
      strengths: [],
      shadows: [],
      themes: [],
      guidance: "Add or verify supported profile evidence before using archetype interpretation.",
      integration: generateIntegrationAnalysis(rawAstrologyData, numerologyData, personalityData, {}),
      personalizedInsights: generatePersonalizedInsights(rawAstrologyData, numerologyData, personalityData, {}),
    };
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
  const integration = generateIntegrationAnalysis(rawAstrologyData, numerologyData, personalityData, bestMatch);
  const personalizedInsights = generatePersonalizedInsights(rawAstrologyData, numerologyData, personalityData, bestMatch);

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
