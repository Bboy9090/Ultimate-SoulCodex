export type Milestone = {
  id: string;
  label: string;
  achieved: boolean;
  date?: string;
};

type JournalEntry = {
  id: string;
  date: string;
  mood: number;
  tags: string[];
  text: string;
};

export function computeMilestones(entries: JournalEntry[]): Milestone[] {
  const milestones: Milestone[] = [];
  const allTags = entries.flatMap(e => e.tags);
  const uniqueDates = new Set(entries.map(e => e.date));
  const sortedDates = [...uniqueDates].sort();

  milestones.push({
    id: "first_reflection",
    label: "First Reflection Logged",
    achieved: entries.length >= 1,
    date: entries.length >= 1 ? entries[entries.length - 1]?.date : undefined,
  });

  milestones.push({
    id: "week_streak",
    label: "7-Day Awareness Streak",
    achieved: uniqueDates.size >= 7,
  });

  milestones.push({
    id: "boundary_logged",
    label: "Boundary Conversation Recorded",
    achieved: allTags.includes("boundary-setting") || allTags.includes("confrontation"),
  });

  milestones.push({
    id: "pattern_spotted",
    label: "Recurring Pattern Identified",
    achieved: entries.length >= 5,
  });

  milestones.push({
    id: "breakthrough",
    label: "Breakthrough Moment Logged",
    achieved: allTags.includes("breakthrough"),
  });

  milestones.push({
    id: "month_active",
    label: "30 Days of Self-Awareness",
    achieved: uniqueDates.size >= 30,
  });

  milestones.push({
    id: "honesty_logged",
    label: "Honesty in Action",
    achieved: allTags.includes("honesty"),
  });

  milestones.push({
    id: "fifty_entries",
    label: "50 Reflections Deep",
    achieved: entries.length >= 50,
  });

  return milestones;
}
