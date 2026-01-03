import { generateText, isGeminiAvailable } from "./gemini";

interface BiographyRequest {
  name: string;
  archetypeTitle: string;
  astrologyData: any;
  numerologyData: any;
  personalityData: any;
  archetype: any;
  // New advanced systems (30+ total for complete synthesis)
  humanDesignData: any;
  vedicAstrologyData: any;
  geneKeysData: any;
  iChingData: any;
  chineseAstrologyData: any;
  kabbalahData: any;
  mayanAstrologyData: any;
  chakraData: any;
  sacredGeometryData: any;
  runesData: any;
  sabianSymbolsData: any;
  ayurvedaData: any;
  biorhythmsData: any;
  asteroidsData: any;
  arabicPartsData: any;
  fixedStarsData: any;
  tarotCards?: any; // Tarot birth cards
}

// Daily Guidance request type (narrower than BiographyRequest)
export type DailyGuidanceRequest = Pick<BiographyRequest, 
  "name" | "archetypeTitle" | "astrologyData" | "numerologyData" | "personalityData" | "archetype"
>;

function generateFallbackBiography(data: BiographyRequest): string {
  const themes = data.archetype?.themes || ['transformation', 'self-discovery', 'spiritual growth'];
  const sunSign = data.astrologyData?.sunSign || data.vedicAstrologyData?.sunSign || 'the cosmos';
  const moonSign = data.astrologyData?.moonSign || data.vedicAstrologyData?.moonSign || 'my inner wisdom';
  const lifePath = data.numerologyData?.lifePath || '';
  const hdType = data.humanDesignData?.type || '';
  const chineseSign = data.chineseAstrologyData?.yearAnimal?.name || ''; // yearAnimal is an object with .name property
  const iChingName = data.iChingData?.name || '';
  const mayanSign = data.mayanAstrologyData?.daySign?.name || ''; // daySign is an object with .name property
  const ayurvedaDosha = data.ayurvedaData?.primaryDosha?.name || ''; // primaryDosha is an object with .name property
  const birthRune = data.runesData?.rune || '';
  const geneKeyGift = data.geneKeysData?.lifeWork?.gift || '';
  const tarotCard = data.tarotCards && data.tarotCards.length > 0 ? data.tarotCards[0].name : '';
  const primaryChakra = data.chakraData?.dominantChakras?.[0]?.name || '';
  const sacredShape = data.sacredGeometryData?.primaryShape || '';
  const keyAsteroid = data.asteroidsData?.asteroids?.[0]?.name || '';
  const fixedStar = data.fixedStarsData?.conjunctions?.[0]?.starName || '';
  const vedicMoon = data.vedicAstrologyData?.moonNakshatra || '';
  
  const templates = [
    // Template 1: Comprehensive multi-system synthesis
    `I am a ${data.archetypeTitle}, ${hdType ? `a ${hdType} in Human Design, ` : ''}born under ${sunSign} with ${moonSign} guiding my emotional depths${vedicMoon ? ` (${vedicMoon} nakshatra)` : ''}${lifePath ? `, carrying the vibration of Life Path ${lifePath}` : ''}${tarotCard ? `. The ${tarotCard} illuminates my soul's journey` : ''}. ${chineseSign ? `The wisdom of the ${chineseSign} flows through my being, ` : ''}${iChingName ? `embodying the essence of ${iChingName}. ` : ''}${sacredShape ? `The ${sacredShape} reflects my sacred geometry, ` : ''}My path has been one of ${themes[0]} and deep inner wisdom${mayanSign ? `, aligned with ${mayanSign} day sign energy` : ''}${fixedStar ? `, amplified by ${fixedStar}'s celestial influence` : ''}. I transform challenges into stepping stones for growth, ${primaryChakra ? `channeling energy through my ${primaryChakra} center and ` : ''}using my ${ayurvedaDosha ? `${ayurvedaDosha} nature and ` : ''}intuitive gifts to navigate both seen and unseen worlds. ${geneKeyGift ? `My gift of ${geneKeyGift} ` : 'I '}serve${geneKeyGift ? 's' : ''} as a bridge between mystical and practical${birthRune ? `, guided by ${birthRune}'s ancient wisdom` : ''}.`,
    
    // Template 2: Energy design and celestial influences
    `As a ${data.archetypeTitle}${hdType ? ` and ${hdType} being` : ''}, I walk between worlds with ${sunSign} illuminating my path${keyAsteroid ? ` and ${keyAsteroid} adding depth to my cosmic signature` : ''}. ${moonSign !== 'my inner wisdom' ? `${moonSign} anchors my intuition` : 'My intuition guides me'}${vedicMoon ? ` through the lens of ${vedicMoon}` : ''}${lifePath ? `, while Life Path ${lifePath}` : ', and my path'} teaches me that ${themes[1] || 'self-discovery'} unlocks my highest potential. ${chineseSign ? `The ${chineseSign}'s energy brings ` : 'I carry '}${themes[2] || 'spiritual growth'} into everything I touch${mayanSign ? `, dancing with ${mayanSign} cosmic timing` : ''}. ${tarotCard ? `The ${tarotCard} card reveals ` : 'My journey reveals '}the depths of ${themes[0]}. ${ayurvedaDosha ? `My ${ayurvedaDosha} constitution guides my healing journey, ` : ''}${primaryChakra ? `balanced through my ${primaryChakra}, ` : ''}${iChingName ? `while ${iChingName} reminds me that ` : 'knowing that '}every experience serves my soul's evolution. ${geneKeyGift ? `Through ${geneKeyGift}, ` : ''}I continue expanding into my fullest expression.`,
    
    // Template 3: Sacred patterns weaving cosmic dance
    `My essence as a ${data.archetypeTitle} reflects the cosmic dance of ${sunSign} energy${hdType ? ` channeled through ${hdType} design` : ''}${lifePath ? `, harmonizing with Life Path ${lifePath} wisdom` : ''}. ${chineseSign ? `Born in the year of the ${chineseSign}, ` : ''}${birthRune ? `guided by ${birthRune}, ` : ''}${sacredShape ? `embodying ${sacredShape} sacred geometry, ` : ''}I am here to experience ${themes[0]} in all its forms${mayanSign ? `, aligned with ${mayanSign} sacred timing` : ''}${fixedStar ? ` and blessed by ${fixedStar}'s stellar guidance` : ''}. ${tarotCard ? `The ${tarotCard} illuminates my path, ` : ''}${iChingName ? `${iChingName} teaches me that ` : 'I understand that '}each challenge is an invitation to alchemize pain into wisdom${ayurvedaDosha ? `, balanced through my ${ayurvedaDosha} nature` : ''}${primaryChakra ? ` and ${primaryChakra} energy` : ''}. ${keyAsteroid ? `${keyAsteroid}'s influence adds ` : 'My cosmic signature adds '}unique depth to my journey. ${geneKeyGift ? `My gift of ${geneKeyGift} allows` : 'My gifts allow'} me to serve as a bridge between mystical and practical worlds${moonSign !== 'my inner wisdom' ? `, with ${moonSign}${vedicMoon ? ` (${vedicMoon})` : ''} guiding my emotional intelligence` : ''}. ${data.archetype?.guidance || 'I help others recognize their own divine nature and cosmic purpose.'}`
  ];
  
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

export async function generateBiography(data: BiographyRequest): Promise<string> {
  // If Gemini AI not available, use fallback biography generator
  if (!isGeminiAvailable()) {
    console.log("Gemini AI not available, using fallback biography generation");
    return generateFallbackBiography(data);
  }

  try {
    // Build comprehensive profile summary from ALL 30+ systems
    const prompt = `You are an expert mystical biographer. Create a compelling 2-3 paragraph first-person biographical narrative for ${data.name}.

COMPLETE SOUL SYNTHESIS (30+ Mystical Systems):

Core Identity:
- Archetype: ${data.archetypeTitle}
- Sun/Moon/Rising: ${data.astrologyData?.sunSign}/${data.astrologyData?.moonSign}/${data.astrologyData?.risingSign || 'Unknown'}
- Life Path: ${data.numerologyData?.lifePath} | Expression: ${data.numerologyData?.expression} | Soul Urge: ${data.numerologyData?.soulUrge || 'Unknown'}
- Enneagram: ${data.personalityData?.enneagram?.type || 'Unknown'} | MBTI: ${data.personalityData?.mbti?.type || 'Unknown'}
${Array.isArray(data.tarotCards) && data.tarotCards.length > 0 ? `- Tarot Birth Cards: ${data.tarotCards.map((c: any) => c.name).join(' & ')}` : ''}

Energy Design:
${data.humanDesignData ? `- Human Design: ${data.humanDesignData.type} ${data.humanDesignData.profile || ''} | Authority: ${data.humanDesignData.authority}` : ''}
${data.vedicAstrologyData ? `- Vedic Sun: ${data.vedicAstrologyData.sunSign} | Moon Nakshatra: ${data.vedicAstrologyData.moonNakshatra}` : ''}
${data.chineseAstrologyData ? `- Chinese Zodiac: ${data.chineseAstrologyData.yearAnimal?.name || data.chineseAstrologyData.yearAnimal} (${data.chineseAstrologyData.yearElement} Element)` : ''}

Soul Path & Purpose:
${data.geneKeysData ? `- Gene Keys: Gift: ${data.geneKeysData.lifeWork?.gift}, Genius: ${data.geneKeysData.evolution?.genius}` : ''}
${data.iChingData ? `- I Ching: ${data.iChingData.number}. ${data.iChingData.name} - ${data.iChingData.keywords?.slice(0, 3).join(', ') || ''}` : ''}
${data.kabbalahData ? `- Kabbalistic Path: ${data.kabbalahData.primaryPath?.number}. ${data.kabbalahData.primaryPath?.name} - ${data.kabbalahData.primaryPath?.essence}` : ''}
${data.mayanAstrologyData ? `- Mayan Day Sign: ${data.mayanAstrologyData.daySign?.name || data.mayanAstrologyData.daySign} (Tone ${data.mayanAstrologyData.tone}) - ${data.mayanAstrologyData.keywords?.slice(0, 2).join(', ') || ''}` : ''}

Sacred Patterns & Symbols:
${data.sacredGeometryData ? `- Sacred Geometry: ${data.sacredGeometryData.primaryShape} - ${data.sacredGeometryData.meaning}` : ''}
${data.runesData ? `- Birth Rune: ${data.runesData.rune} - ${data.runesData.keywords?.slice(0, 3).join(', ') || ''}` : ''}
${data.chakraData ? `- Dominant Chakras: ${data.chakraData.dominantChakras?.map((c: any) => c.name).slice(0, 2).join(', ') || ''}` : ''}
${data.sabianSymbolsData ? `- Sabian Symbols: Sun ${data.sabianSymbolsData.sun?.symbol || ''}, Moon ${data.sabianSymbolsData.moon?.symbol || ''}` : ''}

Healing & Wellness:
${data.ayurvedaData ? `- Ayurvedic Dosha: ${data.ayurvedaData.primaryDosha?.name || data.ayurvedaData.primaryDosha} (${data.ayurvedaData.qualities?.slice(0, 3).join(', ') || ''})` : ''}
${data.biorhythmsData ? `- Life Rhythms: Physical Peak Day ${data.biorhythmsData.physicalPeakDays?.[0] || 'varies'}, Emotional ${data.biorhythmsData.emotionalPeakDays?.[0] || 'varies'}` : ''}

Advanced Celestial Influences:
${data.asteroidsData ? `- Key Asteroids: ${data.asteroidsData.asteroids?.slice(0, 3).map((a: any) => `${a.name} in ${a.sign}`).join(', ') || ''}` : ''}
${data.arabicPartsData ? `- Arabic Parts: Fortune in ${data.arabicPartsData.fortune?.sign || ''}, Spirit in ${data.arabicPartsData.spirit?.sign || ''}` : ''}
${data.fixedStarsData ? `- Fixed Star Influences: ${data.fixedStarsData.conjunctions?.slice(0, 2).map((s: any) => s.starName).join(', ') || ''}` : ''}

Core Themes:
${data.archetype?.themes?.join(', ') || 'Transformation, self-discovery, spiritual growth'}

INSTRUCTIONS:
Write in first person as if ${data.name} is introducing themselves. Synthesize the MOST IMPORTANT patterns from across ALL these systems into a cohesive spiritual narrative. Focus on:
1. Their unique cosmic signature and how multiple systems reveal complementary truths
2. Core gifts and challenges that appear across systems
3. Their life purpose and how they transform challenges into wisdom
4. Keep it mystical yet authentic - this is their complete soul story

Return only the biographical text (2-3 paragraphs), no additional formatting.`;

    const biography = await generateText({
      model: "gemini-2.5-flash",
      temperature: 0.8,
      prompt
    });

    return biography || generateFallbackBiography(data);
  } catch (error) {
    console.error("Error generating biography with Gemini AI, using fallback:", error);
    return generateFallbackBiography(data);
  }
}

function generateFallbackDailyGuidance(data: DailyGuidanceRequest): string {
  const guidanceTemplates = [
    `Today, embrace your ${data.archetypeTitle} nature by focusing on ${data.archetype?.themes?.[0] || 'transformation'}. Trust your ${data.astrologyData?.moonSign || 'intuitive'} intuition to guide you through any challenges that arise.`,
    
    `Your ${data.astrologyData?.sunSign || 'solar'} energy is particularly strong today. Channel this power into ${data.archetype?.themes?.[1] || 'creative expression'} and remember that every experience serves your highest growth.`,
    
    `As a ${data.archetypeTitle}, today calls you to honor both your light and shadow. Your Life Path ${data.numerologyData?.lifePath || ''} wisdom reminds you that ${data.archetype?.guidance || 'balance is key to your spiritual evolution'}.`
  ];
  
  const randomIndex = Math.floor(Math.random() * guidanceTemplates.length);
  return guidanceTemplates[randomIndex];
}

export async function generateDailyGuidance(data: DailyGuidanceRequest): Promise<string> {
  // If Gemini AI not available, use fallback guidance generator
  if (!isGeminiAvailable()) {
    console.log("Gemini AI not available, using fallback daily guidance generation");
    return generateFallbackDailyGuidance(data);
  }

  try {
    const prompt = `Create personalized daily guidance for ${data.name} based on their spiritual profile.

Profile:
- Archetype: ${data.archetypeTitle}
- Sun/Moon/Rising: ${data.astrologyData?.sunSign}/${data.astrologyData?.moonSign}/${data.astrologyData?.risingSign}
- Life Path: ${data.numerologyData?.lifePath}

Generate a brief, actionable daily insight (2-3 sentences) that aligns with their cosmic blueprint. Focus on practical spiritual guidance for today.

Return only the guidance text.`;

    const guidance = await generateText({
      model: "gemini-2.5-flash",
      temperature: 0.8,
      prompt
    });

    return guidance || generateFallbackDailyGuidance(data);
  } catch (error) {
    console.error("Error generating daily guidance with Gemini AI, using fallback:", error);
    return generateFallbackDailyGuidance(data);
  }
}
