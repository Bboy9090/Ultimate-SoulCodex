import type { Profile } from '../shared/schema';
import { getDailyContext, type DailyContext } from './daily-context';
import { selectTemplates } from './template-bank';
import { generateDailyAffirmations, type Affirmation } from './affirmations';
import crypto from 'crypto';
import { extractVerifiedAstrology } from '../server/lib/verified-astrology';

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

export function extractDailyProfileSummary(profile: Profile) {
  const verifiedAstrology = extractVerifiedAstrology(profile);
  const hdData = profile.humanDesignData as any;
  const numData = profile.numerologyData as any;
  const personalityData = profile.personalityData as any;
  const hdVerified = hdData?.status === 'verified';

  return {
    id: profile.id,
    name: profile.name,
    // Automatic daily synthesis only receives evidence-qualified identity data.
    sunSign: verifiedAstrology.sun,
    moonSign: verifiedAstrology.moon,
    risingSign: verifiedAstrology.rising,
    hdVerified,
    hdType: hdVerified ? hdData?.type : undefined,
    hdProfile: hdVerified ? hdData?.profile : undefined,
    hdAuthority: hdVerified ? hdData?.authority : undefined,
    // Personality labels may be displayed in dedicated surfaces, but the
    // automatic daily selector does not use them as a rotating source.
    enneagramType: personalityData?.enneagram?.type,
    mbtiType: personalityData?.mbti?.type,
    lifePath: numData?.lifePath,
    expression: numData?.expression,
    soulUrge: numData?.soulUrge,
  };
}

export function generateDailyInsights(
  profile: Profile,
  lastUsedTemplateIds: string[] = []
): { data: DailyInsightData; templateIds: string[]; contentHash: string } {
  const dailyContext = getDailyContext(profile.birthDate);
  const profileSummary = extractDailyProfileSummary(profile);
  
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
