import type { Profile } from '@shared/schema';
import { getDailyContext, type DailyContext } from './daily-context';
import { selectTemplates } from './template-bank';
import { generateDailyAffirmations, type Affirmation } from './affirmations';
import crypto from 'crypto';

export interface DailyInsightData {
  date: string;
  personalDayNumber: number;
  universalDayNumber: number;
  moonSign: string;
  moonPhase: string;
  moonPhasePercentage: number;
  currentHDGate: number;
  currentHDLine: number;
  planetaryHour: string;
  insights: string[];
  affirmations: Affirmation[];
  profile: {
    name: string;
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    hdType?: string;
    enneagramType?: string;
    mbtiType?: string;
    lifePath?: number;
  };
}

function extractProfileSummary(profile: Profile) {
  const astroData = profile.astrologyData as any;
  const hdData = profile.humanDesignData as any;
  const personalityData = profile.personalityData as any;
  const numData = profile.numerologyData as any;
  
  // Extract all 15 new advanced systems
  const vedicData = profile.vedicAstrologyData as any;
  const geneKeysData = profile.geneKeysData as any;
  const iChingData = profile.iChingData as any;
  const chineseData = profile.chineseAstrologyData as any;
  const kabbalahData = profile.kabbalahData as any;
  const mayanData = profile.mayanAstrologyData as any;
  const chakraData = profile.chakraData as any;
  const sacredGeomData = profile.sacredGeometryData as any;
  const runesData = profile.runesData as any;
  const sabianData = profile.sabianSymbolsData as any;
  const ayurvedaData = profile.ayurvedaData as any;
  const biorhythmsData = profile.biorhythmsData as any;
  const asteroidsData = profile.asteroidsData as any;
  const arabicPartsData = profile.arabicPartsData as any;
  const fixedStarsData = profile.fixedStarsData as any;
  const archetypeData = profile.archetypeData as any;

  return {
    id: profile.id,
    name: profile.name,
    // Original systems
    sunSign: astroData?.sunSign,
    moonSign: astroData?.moonSign,
    risingSign: astroData?.risingSign,
    hdType: hdData?.type,
    hdProfile: hdData?.profile,
    hdAuthority: hdData?.authority,
    enneagramType: personalityData?.enneagram?.type,
    mbtiType: personalityData?.mbti?.type,
    lifePath: numData?.lifePath,
    expression: numData?.expression,
    soulUrge: numData?.soulUrge,
    // Vedic Astrology
    vedicSun: vedicData?.sunSign,
    vedicMoon: vedicData?.moonSign,
    moonNakshatra: vedicData?.moonNakshatra,
    // Gene Keys
    lifeWorkGift: geneKeysData?.lifeWork?.gift,
    evolutionGenius: geneKeysData?.evolution?.genius,
    // I Ching
    iChingNumber: iChingData?.number,
    iChingName: iChingData?.name,
    // Chinese Astrology
    chineseYear: chineseData?.yearAnimal?.name || chineseData?.yearAnimal,
    chineseElement: chineseData?.yearElement,
    // Kabbalah
    kabbalisticPath: kabbalahData?.primaryPath?.name,
    // Mayan Astrology
    mayanDaySign: mayanData?.daySign?.name || mayanData?.daySign,
    mayanTone: mayanData?.tone,
    // Chakras
    dominantChakra: chakraData?.dominantChakras?.[0]?.name,
    // Sacred Geometry
    primaryShape: sacredGeomData?.primaryShape,
    // Runes
    birthRune: runesData?.rune,
    // Sabian Symbols
    sabianSun: sabianData?.sun?.symbol,
    sabianMoon: sabianData?.moon?.symbol,
    // Ayurveda
    primaryDosha: ayurvedaData?.primaryDosha?.name || ayurvedaData?.primaryDosha,
    // Biorhythms
    physicalPeakDay: biorhythmsData?.physicalPeakDays?.[0],
    emotionalPeakDay: biorhythmsData?.emotionalPeakDays?.[0],
    // Asteroids
    keyAsteroid: asteroidsData?.asteroids?.[0]?.name,
    // Arabic Parts
    fortuneSign: arabicPartsData?.fortune?.sign,
    spiritSign: arabicPartsData?.spirit?.sign,
    // Fixed Stars
    primaryStar: fixedStarsData?.conjunctions?.[0]?.starName,
    // Tarot
    tarotCard: archetypeData?.tarotCards?.[0]?.name,
  };
}

export function generateDailyInsights(
  profile: Profile,
  lastUsedTemplateIds: string[] = []
): { data: DailyInsightData; templateIds: string[]; contentHash: string } {
  const dailyContext = getDailyContext(profile.birthDate);
  const profileSummary = extractProfileSummary(profile);
  
  const { selectedTemplates, templateIds } = selectTemplates(
    dailyContext, 
    profileSummary, 
    lastUsedTemplateIds
  );
  
  const contextWithProfile = {
    ...dailyContext,
    profile: profileSummary,
  };
  
  const insights = selectedTemplates.map(template => template.template(contextWithProfile));
  // Use the same date as daily context to ensure consistency across timezones
  const affirmations = generateDailyAffirmations(profile, 3, dailyContext.date);
  
  const insightData: DailyInsightData = {
    date: dailyContext.date,
    personalDayNumber: dailyContext.personalDayNumber,
    universalDayNumber: dailyContext.universalDayNumber,
    moonSign: dailyContext.moonSign,
    moonPhase: dailyContext.moonPhase,
    moonPhasePercentage: dailyContext.moonPhasePercentage,
    currentHDGate: dailyContext.currentHDGate,
    currentHDLine: dailyContext.currentHDLine,
    planetaryHour: dailyContext.planetaryHour,
    insights,
    affirmations,
    profile: profileSummary,
  };
  
  const contentHash = crypto
    .createHash('md5')
    .update(insights.join('|'))
    .digest('hex');
  
  return {
    data: insightData,
    templateIds,
    contentHash,
  };
}
