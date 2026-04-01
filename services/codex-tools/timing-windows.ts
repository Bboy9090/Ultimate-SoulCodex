/**
 * Timing Windows — "When should I move?"
 * Uses transits, cycles, and personal day numbers to generate strategic timing.
 */

import type { CodexToolResult, ProfileInput } from "./types";
import { extractCore } from "./types";

type Clarity = "low" | "building" | "clear" | "declining";

interface DayWindow {
  day: number;
  clarity: Clarity;
  reason: string;
}

function getPersonalDayNumber(birthDate: Date | string | null, targetDate: Date): number {
  if (!birthDate) return targetDate.getDate() % 9 || 9;
  const bd = new Date(birthDate);
  if (isNaN(bd.getTime())) return targetDate.getDate() % 9 || 9;

  const bDay = bd.getDate();
  const bMonth = bd.getMonth() + 1;
  const tDay = targetDate.getDate();
  const tMonth = targetDate.getMonth() + 1;
  const tYear = targetDate.getFullYear();

  let sum = bDay + bMonth + tDay + tMonth + tYear;
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split("").reduce((a, b) => a + Number(b), 0);
  }
  return sum;
}

const DAY_CLARITY: Record<number, Clarity> = {
  1: "clear",
  2: "building",
  3: "clear",
  4: "building",
  5: "clear",
  6: "building",
  7: "low",
  8: "clear",
  9: "declining",
  11: "building",
  22: "clear",
  33: "building",
};

const DAY_REASON: Record<number, string> = {
  1: "Initiation energy — good for starting, not finishing",
  2: "Cooperation day — decisions land better with input from others",
  3: "Expression day — clarity through communication",
  4: "Structure day — build foundations, not experiments",
  5: "Change day — disruption is productive if channeled",
  6: "Responsibility day — focus on what you owe, not what you want",
  7: "Reflection day — observe, don't commit",
  8: "Power day — strong for financial and strategic moves",
  9: "Completion day — close loops, don't open new ones",
  11: "Intuition amplified — trust the quiet signal",
  22: "Master builder — long-term action pays off today",
  33: "Service day — lead through helping, not controlling",
};

export function timingWindow(profile: ProfileInput, date: Date = new Date()): CodexToolResult {
  const core = extractCore(profile);

  const windows: DayWindow[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(date);
    d.setDate(d.getDate() + i);
    const dayNum = getPersonalDayNumber(core.birthDate, d);
    windows.push({
      day: i,
      clarity: DAY_CLARITY[dayNum] || "building",
      reason: DAY_REASON[dayNum] || "Moderate energy — proceed with awareness",
    });
  }

  const bestWindow = windows.find((w) => w.clarity === "clear");
  const lowDays = windows.filter((w) => w.clarity === "low" || w.clarity === "declining");
  const today = windows[0];

  const dayLabels = ["Today", "Tomorrow", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];

  const windowSummary = windows.slice(0, 5).map((w, i) => {
    const label = dayLabels[i];
    const icon = w.clarity === "clear" ? "✓" : w.clarity === "building" ? "~" : w.clarity === "low" ? "✗" : "↓";
    return `${label}: ${icon} ${w.clarity} — ${w.reason}`;
  }).join("\n");

  const observation = `**Next 7 days:**\n${windowSummary}`;

  let meaning = "";
  if (today.clarity === "clear") {
    meaning = `Today is a strong window for action. ${core.hdType ? `Your ${core.hdType} design supports moving on this — ${core.hdStrategy ? core.hdStrategy.toLowerCase() : "trust the signal"}.` : "The conditions favor decisive movement."}`;
  } else if (today.clarity === "low") {
    meaning = `Today favors observation over action. ${core.moonSign ? `Your ${core.moonSign} Moon may push you to react emotionally — resist that.` : "Delay commitments until clarity returns."} ${lowDays.length > 1 ? `Low-clarity stretch: ${lowDays.length} days. Plan accordingly.` : ""}`;
  } else {
    meaning = `Clarity is building. ${bestWindow ? `Best window opens in ${bestWindow.day} day${bestWindow.day !== 1 ? "s" : ""}.` : "No strong window this week — act on the most stable day."} ${core.lifePath ? `Life Path ${core.lifePath}: ${Number(core.lifePath) === 7 ? "trust the pause" : Number(core.lifePath) <= 3 ? "act when the signal clears" : "build incrementally"}.` : ""}`;
  }

  const action = bestWindow
    ? `Best move: ${bestWindow.day === 0 ? "Act today" : `Wait ${bestWindow.day} day${bestWindow.day !== 1 ? "s" : ""}`}. ${bestWindow.reason}.`
    : `No perfect window this week. Pick the clearest day and commit. Waiting for perfect conditions is its own trap.`;

  return {
    tool: "timing_window",
    title: "Timing Window",
    observation,
    meaning,
    action,
    extras: {
      windows: windows.map((w, i) => ({ label: dayLabels[i], ...w })),
      bestDay: bestWindow?.day ?? null,
      todayClarity: today.clarity,
    },
  };
}
