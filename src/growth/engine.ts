type JournalEntry = {
  id: string;
  date: string;
  mood: number;
  tags: string[];
  text: string;
};

export type GrowthSignal = {
  name: string;
  direction: "up" | "down" | "stable";
  value: number;
  change: number;
};

export type WeeklyMirror = {
  summary: string;
  patterns: string[];
  suggestion: string;
};

export type InnerCompass = {
  clarity: number;
  pressure: number;
  emotion: number;
  strategy: number;
};

export type ArchetypeStage = {
  stage: number;
  label: string;
  description: string;
};

export type GrowthSnapshot = {
  signals: GrowthSignal[];
  compass: InnerCompass;
  weeklyMirror: WeeklyMirror;
  stage: ArchetypeStage;
  streakDays: number;
  totalEntries: number;
};

const GROWTH_TAGS: Record<string, { signal: string; direction: "up" | "down" }> = {
  "boundary-setting": { signal: "Boundary Clarity", direction: "up" },
  "confrontation": { signal: "Boundary Clarity", direction: "up" },
  "honesty": { signal: "Boundary Clarity", direction: "up" },
  "clarity": { signal: "Decision Confidence", direction: "up" },
  "breakthrough": { signal: "Decision Confidence", direction: "up" },
  "flow-state": { signal: "Decision Confidence", direction: "up" },
  "patience": { signal: "Emotional Regulation", direction: "up" },
  "connection": { signal: "Emotional Regulation", direction: "up" },
  "overthinking": { signal: "Emotional Regulation", direction: "down" },
  "procrastinating": { signal: "Decision Confidence", direction: "down" },
  "self-sabotage": { signal: "Self-Awareness", direction: "up" },
  "isolation": { signal: "Emotional Regulation", direction: "down" },
  "burnout": { signal: "Boundary Clarity", direction: "down" },
  "impatience": { signal: "Emotional Regulation", direction: "down" },
};

function getRecentEntries(entries: JournalEntry[], days: number): JournalEntry[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  return entries.filter(e => e.date >= cutoffStr);
}

function computeSignals(entries: JournalEntry[]): GrowthSignal[] {
  const recent = getRecentEntries(entries, 14);
  const older = getRecentEntries(entries, 28).filter(e => !recent.includes(e));

  const signalScores = new Map<string, { recent: number; older: number }>();
  const initSignal = (name: string) => {
    if (!signalScores.has(name)) signalScores.set(name, { recent: 0, older: 0 });
  };

  for (const entry of recent) {
    for (const tag of entry.tags) {
      const mapped = GROWTH_TAGS[tag];
      if (!mapped) continue;
      initSignal(mapped.signal);
      const s = signalScores.get(mapped.signal)!;
      s.recent += mapped.direction === "up" ? 1 : -1;
    }
  }

  for (const entry of older) {
    for (const tag of entry.tags) {
      const mapped = GROWTH_TAGS[tag];
      if (!mapped) continue;
      initSignal(mapped.signal);
      const s = signalScores.get(mapped.signal)!;
      s.older += mapped.direction === "up" ? 1 : -1;
    }
  }

  const defaultSignals = ["Boundary Clarity", "Decision Confidence", "Emotional Regulation", "Self-Awareness"];
  for (const name of defaultSignals) initSignal(name);

  return Array.from(signalScores.entries()).map(([name, scores]) => {
    const value = Math.max(0, Math.min(100, 50 + scores.recent * 10));
    const change = scores.recent - scores.older;
    return {
      name,
      direction: change > 0 ? "up" : change < 0 ? "down" : "stable",
      value,
      change,
    };
  });
}

function computeCompass(entries: JournalEntry[]): InnerCompass {
  const recent = getRecentEntries(entries, 7);
  if (recent.length === 0) return { clarity: 50, pressure: 30, emotion: 50, strategy: 50 };

  const avgMood = recent.reduce((sum, e) => sum + e.mood, 0) / recent.length;
  const allTags = recent.flatMap(e => e.tags);

  let clarity = 40 + avgMood * 6;
  let pressure = 60 - avgMood * 8;
  let emotion = 50;
  let strategy = 45;

  if (allTags.includes("clarity") || allTags.includes("breakthrough")) clarity += 15;
  if (allTags.includes("overthinking") || allTags.includes("burnout")) pressure += 15;
  if (allTags.includes("connection") || allTags.includes("patience")) emotion += 10;
  if (allTags.includes("isolation") || allTags.includes("impatience")) emotion -= 10;
  if (allTags.includes("boundary-setting") || allTags.includes("honesty")) strategy += 15;
  if (allTags.includes("procrastinating") || allTags.includes("self-sabotage")) strategy -= 10;

  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  return { clarity: clamp(clarity), pressure: clamp(pressure), emotion: clamp(emotion), strategy: clamp(strategy) };
}

function buildWeeklyMirror(entries: JournalEntry[]): WeeklyMirror {
  const recent = getRecentEntries(entries, 7);
  if (recent.length === 0) {
    return {
      summary: "No journal entries this week. Start logging to see your patterns.",
      patterns: [],
      suggestion: "Write one entry today. Even two sentences will start building signal.",
    };
  }

  const allTags = recent.flatMap(e => e.tags);
  const tagCounts = new Map<string, number>();
  for (const tag of allTags) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);

  const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const avgMood = recent.reduce((sum, e) => sum + e.mood, 0) / recent.length;

  const patterns = topTags.map(([tag, count]) => `${tag} appeared ${count} time${count > 1 ? "s" : ""}`);

  let summary = "";
  if (avgMood >= 4) {
    summary = `Strong week. Average mood: ${avgMood.toFixed(1)}/5. ${recent.length} entries logged.`;
  } else if (avgMood >= 3) {
    summary = `Steady week. Average mood: ${avgMood.toFixed(1)}/5. ${recent.length} entries logged.`;
  } else {
    summary = `Heavier week. Average mood: ${avgMood.toFixed(1)}/5. ${recent.length} entries logged.`;
  }

  if (topTags.length > 0) {
    summary += ` Most recurring pattern: ${topTags[0][0]}.`;
  }

  let suggestion = "Keep logging. Pattern clarity increases after 2 weeks of consistent entries.";
  if (allTags.includes("overthinking")) suggestion = "Your entries flag overthinking. Try the 10-minute action rule: when the loop starts, do one concrete thing within 10 minutes.";
  if (allTags.includes("burnout")) suggestion = "Burnout signal detected. Protect your schedule this week. Cancel one optional commitment.";
  if (allTags.includes("boundary-setting")) suggestion = "Boundary work is showing up. The fact that you're noticing and logging it means the pattern is shifting.";

  return { summary, patterns, suggestion };
}

function computeStage(entries: JournalEntry[]): ArchetypeStage {
  const total = entries.length;
  if (total < 3) return { stage: 1, label: "Awakening", description: "Beginning to notice patterns. The system is learning your rhythm." };
  if (total < 10) return { stage: 2, label: "Recognition", description: "Patterns are becoming visible. You're starting to see what drives your behavior." };
  if (total < 25) return { stage: 3, label: "Boundary Strengthening", description: "You're actively working on the patterns you've identified. Decisions are becoming more intentional." };
  if (total < 50) return { stage: 4, label: "Strategic Clarity", description: "Your self-awareness is consistent. You catch patterns before they run and choose responses instead of reacting." };
  return { stage: 5, label: "Integration", description: "The patterns are part of your operating system now. You move with awareness instead of against habit." };
}

function computeStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 60; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split("T")[0];
    if (sorted.some(e => e.date === dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}

export function analyzeGrowth(entries: JournalEntry[]): GrowthSnapshot {
  return {
    signals: computeSignals(entries),
    compass: computeCompass(entries),
    weeklyMirror: buildWeeklyMirror(entries),
    stage: computeStage(entries),
    streakDays: computeStreak(entries),
    totalEntries: entries.length,
  };
}
