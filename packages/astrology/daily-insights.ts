import type { Profile } from './shared/schema';
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
  planetaryHour: string | null;
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
  // The daily template selector uses only governed current-day calculations.
  // Do not read stored legacy identity systems into this context.
  return {
    id: profile.id,
    name: profile.name,
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
