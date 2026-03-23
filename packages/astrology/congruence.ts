import { differenceInDays, startOfDay, subDays } from 'date-fns';

export interface FrequencyLog {
  frequency: number;
  loggedAt: Date | string;
  notes?: string | null;
  activeTransits?: any;
}

export interface CongruenceScore {
  score: number; // 0-100
  trend: 'rising' | 'stable' | 'falling';
  trendPercentage: number; // -100 to +100
  consistency: number; // 0-100
  alignment: number; // 0-100 (purpose alignment)
  insights: string[];
  recommendations: string[];
  breakdown: {
    frequencyTrend: {
      score: number;
      current7DayAvg: number;
      previous7DayAvg: number;
      change: number;
    };
    disciplineConsistency: {
      score: number;
      daysLogged: number;
      totalDays: number;
      percentage: number;
      currentStreak: number;
    };
    purposeAlignment: {
      score: number;
      hasPurpose: boolean;
      averageFrequency: number;
      gap: number;
    };
  };
}

/**
 * Calculate Congruence Score - The Ultimate Metric (Phase 3)
 * 
 * This score measures alignment between:
 * 1. Frequency Trend (30%): Are you rising or falling in emotional state?
 * 2. Discipline Consistency (40%): Are you showing up daily to do the work?
 * 3. Purpose Alignment (30%): Is your daily frequency aligned with your stated purpose?
 * 
 * Score of 80-100 = Mastery (living your purpose with discipline)
 * Score of 60-79 = Progress (on the path, keep going)
 * Score of 40-59 = Resistance (friction is teaching you something)
 * Score of 0-39 = Crisis (deep work needed, shadow active)
 */
export function calculateCongruenceScore(
  frequencyLogs: FrequencyLog[],
  purposeStatement: string | null | undefined,
  lookbackDays: number = 30
): CongruenceScore {
  const now = new Date();
  const cutoffDate = subDays(now, lookbackDays);
  
  // Filter logs to lookback period and ensure dates are Date objects
  const relevantLogs = frequencyLogs
    .filter(log => new Date(log.loggedAt) >= cutoffDate)
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());
  
  if (relevantLogs.length === 0) {
    return {
      score: 0,
      trend: 'stable',
      trendPercentage: 0,
      consistency: 0,
      alignment: 0,
      insights: ['No frequency logs found in the past 30 days. Begin logging to activate your Congruence Score.'],
      recommendations: ['Log your emotional frequency at least once daily to establish your baseline.'],
      breakdown: {
        frequencyTrend: { score: 0, current7DayAvg: 0, previous7DayAvg: 0, change: 0 },
        disciplineConsistency: { score: 0, daysLogged: 0, totalDays: lookbackDays, percentage: 0, currentStreak: 0 },
        purposeAlignment: { score: 0, hasPurpose: false, averageFrequency: 0, gap: 0 }
      }
    };
  }
  
  // === 1. FREQUENCY TREND (30%) ===
  const frequencyTrend = calculateFrequencyTrend(relevantLogs);
  
  // === 2. DISCIPLINE CONSISTENCY (40%) ===
  const disciplineConsistency = calculateDisciplineConsistency(relevantLogs, lookbackDays);
  
  // === 3. PURPOSE ALIGNMENT (30%) ===
  const purposeAlignment = calculatePurposeAlignment(relevantLogs, purposeStatement);
  
  // === CALCULATE OVERALL SCORE ===
  const weightedScore = 
    (frequencyTrend.score * 0.30) +
    (disciplineConsistency.score * 0.40) +
    (purposeAlignment.score * 0.30);
  
  const finalScore = Math.round(weightedScore);
  
  // === DETERMINE TREND ===
  let trend: 'rising' | 'stable' | 'falling' = 'stable';
  const trendPercentage = frequencyTrend.change;
  if (trendPercentage > 5) trend = 'rising';
  if (trendPercentage < -5) trend = 'falling';
  
  // === GENERATE INSIGHTS ===
  const insights = generateInsights(finalScore, frequencyTrend, disciplineConsistency, purposeAlignment);
  
  // === GENERATE RECOMMENDATIONS ===
  const recommendations = generateRecommendations(frequencyTrend, disciplineConsistency, purposeAlignment);
  
  return {
    score: finalScore,
    trend,
    trendPercentage: Math.round(trendPercentage),
    consistency: Math.round(disciplineConsistency.score),
    alignment: Math.round(purposeAlignment.score),
    insights,
    recommendations,
    breakdown: {
      frequencyTrend: {
        score: Math.round(frequencyTrend.score),
        current7DayAvg: Math.round(frequencyTrend.current7DayAvg * 10) / 10,
        previous7DayAvg: Math.round(frequencyTrend.previous7DayAvg * 10) / 10,
        change: Math.round(frequencyTrend.change)
      },
      disciplineConsistency: {
        score: Math.round(disciplineConsistency.score),
        daysLogged: disciplineConsistency.daysLogged,
        totalDays: lookbackDays,
        percentage: Math.round(disciplineConsistency.percentage),
        currentStreak: disciplineConsistency.currentStreak
      },
      purposeAlignment: {
        score: Math.round(purposeAlignment.score),
        hasPurpose: purposeAlignment.hasPurpose,
        averageFrequency: Math.round(purposeAlignment.averageFrequency * 10) / 10,
        gap: Math.round(purposeAlignment.gap * 10) / 10
      }
    }
  };
}

function calculateFrequencyTrend(logs: FrequencyLog[]) {
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const fourteenDaysAgo = subDays(now, 14);
  
  const currentPeriodLogs = logs.filter(log => new Date(log.loggedAt) >= sevenDaysAgo);
  const previousPeriodLogs = logs.filter(log => 
    new Date(log.loggedAt) >= fourteenDaysAgo && new Date(log.loggedAt) < sevenDaysAgo
  );
  
  const current7DayAvg = currentPeriodLogs.length > 0
    ? currentPeriodLogs.reduce((sum, log) => sum + log.frequency, 0) / currentPeriodLogs.length
    : 0;
  
  const previous7DayAvg = previousPeriodLogs.length > 0
    ? previousPeriodLogs.reduce((sum, log) => sum + log.frequency, 0) / previousPeriodLogs.length
    : current7DayAvg;
  
  const change = previous7DayAvg > 0
    ? ((current7DayAvg - previous7DayAvg) / previous7DayAvg) * 100
    : 0;
  
  let score = (current7DayAvg / 10) * 100;
  const trendModifier = change * 0.5;
  score = Math.max(0, Math.min(100, score + trendModifier));
  
  return {
    score,
    current7DayAvg,
    previous7DayAvg,
    change
  };
}

function calculateDisciplineConsistency(logs: FrequencyLog[], lookbackDays: number) {
  const uniqueDays = new Set<string>();
  logs.forEach(log => {
    const dayKey = startOfDay(new Date(log.loggedAt)).toISOString();
    uniqueDays.add(dayKey);
  });
  
  const daysLogged = uniqueDays.size;
  const percentage = (daysLogged / lookbackDays) * 100;
  
  let score = percentage;
  
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
  );
  
  let currentStreak = 0;
  const today = startOfDay(new Date());
  
  for (const log of sortedLogs) {
    const logDay = startOfDay(new Date(log.loggedAt));
    const daysDiff = differenceInDays(today, logDay);
    
    if (daysDiff === currentStreak) {
      currentStreak++;
    } else if (daysDiff > currentStreak) {
      break;
    }
  }
  
  if (currentStreak >= 21) score += 30;
  else if (currentStreak >= 14) score += 20;
  else if (currentStreak >= 7) score += 10;
  
  score = Math.min(100, score);
  
  return {
    score,
    daysLogged,
    percentage,
    currentStreak
  };
}

function calculatePurposeAlignment(logs: FrequencyLog[], purposeStatement: string | null | undefined) {
  if (!purposeStatement || purposeStatement.trim().length === 0) {
    return {
      score: 50,
      hasPurpose: false,
      averageFrequency: 0,
      gap: 0
    };
  }
  
  const averageFrequency = logs.reduce((sum, log) => sum + log.frequency, 0) / logs.length;
  const idealFrequency = 8;
  const gap = idealFrequency - averageFrequency;
  const score = Math.max(0, Math.min(100, 100 - (gap / 7) * 100));
  
  return {
    score,
    hasPurpose: true,
    averageFrequency,
    gap: Math.max(0, gap)
  };
}

function generateInsights(
  score: number,
  frequencyTrend: any,
  disciplineConsistency: any,
  purposeAlignment: any
): string[] {
  const insights: string[] = [];
  
  if (score >= 80) {
    insights.push('🔥 Mastery: You are living in alignment with your purpose. This is rare. Your discipline and rising frequency demonstrate true self-command.');
  } else if (score >= 60) {
    insights.push('✨ Progress: You are on the path. Consistency is building. Each day you show up, you strengthen your alignment.');
  } else if (score >= 40) {
    insights.push('⚡ Resistance: Friction is present. This is not failure - it\'s the Universe showing you what needs attention. The obstacle IS the path.');
  } else {
    insights.push('🌑 Crisis: Deep work is calling. Something fundamental needs to shift. The shadow is active. This is your initiation.');
  }
  
  if (frequencyTrend.change > 10) {
    insights.push(`Your frequency is rising ${Math.abs(frequencyTrend.change)}% - you\'re actively transmuting density into light. This momentum is real.`);
  } else if (frequencyTrend.change < -10) {
    insights.push(`Your frequency is falling ${Math.abs(frequencyTrend.change)}% - a planetary transit or shadow pattern is active. Do not judge this. Feel it fully.`);
  } else {
    insights.push('Your frequency is stable - you\'re in a plateau. This is integration time. Consistency matters more than dramatic shifts.');
  }
  
  if (disciplineConsistency.currentStreak >= 14) {
    insights.push(`${disciplineConsistency.currentStreak}-day streak! Your nervous system is rewiring. This level of discipline creates permanent change.`);
  } else if (disciplineConsistency.percentage < 50) {
    insights.push('Inconsistent logging reveals inconsistent self-awareness. You cannot master what you do not measure. Show up daily.');
  }
  
  if (purposeAlignment.hasPurpose) {
    if (purposeAlignment.gap < 1) {
      insights.push('Your daily frequency MATCHES your stated purpose. You are living what you claim. This is integrity.');
    } else if (purposeAlignment.gap > 3) {
      insights.push(`Your frequency is ${purposeAlignment.gap.toFixed(1)} points below alignment with your purpose. The gap between who you say you are and how you actually feel is the work.`);
    }
  } else {
    insights.push('No purpose statement defined yet. Alignment cannot be measured without a declared intention. Define your Singular Will.');
  }
  
  return insights;
}

function generateRecommendations(
  frequencyTrend: any,
  disciplineConsistency: any,
  purposeAlignment: any
): string[] {
  const recommendations: string[] = [];
  
  if (frequencyTrend.current7DayAvg < 5) {
    recommendations.push('Your frequency is low. Check active transits - Pluto, Saturn, or Neptune may be triggering shadow work. Use the transmutation protocol.');
  }
  
  if (frequencyTrend.change < -15) {
    recommendations.push('Rapid frequency drop detected. This is NOT random. Identify which planet is transiting your chart and apply the corresponding transmutation technique immediately.');
  }
  
  if (disciplineConsistency.percentage < 60) {
    recommendations.push('Log your frequency at the same time daily. Make it non-negotiable. Discipline is the foundation of all mastery.');
  }
  
  if (disciplineConsistency.currentStreak === 0) {
    recommendations.push('Start today. One log. Then tomorrow. Then the next day. The streak rewires your nervous system. Begin now.');
  }
  
  if (!purposeAlignment.hasPurpose) {
    recommendations.push('Define your Purpose Statement: What is your Singular Will? What are you here to become? Write it clearly. Alignment requires a target.');
  } else if (purposeAlignment.gap > 2) {
    recommendations.push('Your stated purpose and your daily reality are misaligned. Either your purpose is false (ego-driven) or you\'re not living it. Revise or recommit.');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Continue your practice. Consistency compounds. Every day you show up, you strengthen the pattern.');
  }
  
  return recommendations;
}
