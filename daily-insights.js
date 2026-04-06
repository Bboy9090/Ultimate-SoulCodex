import { getDailyContext } from './daily-context';
import { selectTemplates } from './template-bank';
import { generateDailyAffirmations } from './affirmations';
import crypto from 'crypto';
function extractProfileSummary(profile) {
    const astroData = profile.astrologyData;
    const hdData = profile.humanDesignData;
    const personalityData = profile.personalityData;
    const numData = profile.numerologyData;
    // Extract all 15 new advanced systems
    const vedicData = profile.vedicAstrologyData;
    const geneKeysData = profile.geneKeysData;
    const iChingData = profile.iChingData;
    const chineseData = profile.chineseAstrologyData;
    const kabbalahData = profile.kabbalahData;
    const mayanData = profile.mayanAstrologyData;
    const chakraData = profile.chakraData;
    const sacredGeomData = profile.sacredGeometryData;
    const runesData = profile.runesData;
    const sabianData = profile.sabianSymbolsData;
    const ayurvedaData = profile.ayurvedaData;
    const biorhythmsData = profile.biorhythmsData;
    const asteroidsData = profile.asteroidsData;
    const arabicPartsData = profile.arabicPartsData;
    const fixedStarsData = profile.fixedStarsData;
    const archetypeData = profile.archetypeData;
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
export function generateDailyInsights(profile, lastUsedTemplateIds = []) {
    const dailyContext = getDailyContext(profile.birthDate);
    const profileSummary = extractProfileSummary(profile);
    const { selectedTemplates, templateIds } = selectTemplates(dailyContext, profileSummary, lastUsedTemplateIds);
    const contextWithProfile = {
        ...dailyContext,
        profile: profileSummary,
    };
    const insights = selectedTemplates.map(template => template.template(contextWithProfile));
    // Use the same date as daily context to ensure consistency across timezones
    const affirmations = generateDailyAffirmations(profile, 3, dailyContext.date);
    const insightData = {
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
