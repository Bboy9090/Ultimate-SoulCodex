/**
 * One Move — every day ends with one clear action.
 * No overwhelm. Just one thing.
 */

import type { CodexToolResult, ProfileInput } from "./types";
import { extractCore } from "./types";

const MOVES = [
  { move: "Have the conversation you've been delaying", why: "Unfinished conversations consume more energy than difficult ones" },
  { move: "Finish the thing that's 80% done", why: "Near-complete tasks create constant mental drag" },
  { move: "Say no to something you already resent", why: "Every obligation you keep against your will leaks energy into resentment" },
  { move: "Write down the decision you're avoiding", why: "Unnamed decisions grow into anxiety — naming them shrinks them" },
  { move: "Cancel one thing from tomorrow's calendar", why: "Space is not laziness — it's strategic recovery" },
  { move: "Tell someone what you actually need from them", why: "Unspoken needs become silent tests that everyone fails" },
  { move: "Start the hardest task first tomorrow", why: "Your willpower peaks in the first 2 hours — use it on what matters" },
  { move: "Delete or archive 10 things from your phone", why: "Digital clutter is mental clutter wearing a different outfit" },
  { move: "Go outside for 15 minutes without your phone", why: "Your nervous system is running on stimulation — it needs the opposite" },
  { move: "Apologize for one thing you know you got wrong", why: "Carrying undelivered apologies is heavier than delivering them" },
  { move: "Ask for help with the thing you've been doing alone", why: "Self-reliance past its usefulness becomes isolation" },
  { move: "Set one boundary you've been avoiding", why: "Every time you skip the boundary, the cost of setting it later goes up" },
  { move: "Close 3 browser tabs you've been 'saving for later'", why: "If you haven't read it in a week, you're not going to — and it's pulling at you" },
  { move: "Eat a meal without a screen in front of you", why: "Your body processes stress through rest — not through more input" },
];

export function oneMove(profile: ProfileInput, date: Date = new Date()): CodexToolResult {
  const core = extractCore(profile);

  const personalMoves: typeof MOVES = [];
  if (core.stressPattern) {
    personalMoves.push({
      move: `Interrupt your stress pattern (${core.stressPattern.toLowerCase()}) the next time it activates`,
      why: `This pattern runs on autopilot — one conscious interruption starts breaking the loop`,
    });
  }
  if (core.growthEdge) {
    personalMoves.push({
      move: `Take one step toward your growth edge: ${core.growthEdge.toLowerCase()}`,
      why: "Growth edges don't get easier by waiting — they get easier by starting",
    });
  }

  const allMoves = [...personalMoves, ...MOVES];
  const idx = (date.getDate() + date.getMonth() + (core.birthDate ? new Date(core.birthDate).getDate() : 0)) % allMoves.length;
  const selected = allMoves[idx];

  return {
    tool: "one_move",
    title: "One Move",
    observation: selected.move,
    meaning: selected.why,
    action: `Do this before the day ends. Not perfectly. Just done.${core.hdType ? ` Your ${core.hdType} strategy: ${core.hdStrategy ? core.hdStrategy.toLowerCase() : "trust the signal"} — but don't use strategy as a reason to delay.` : ""}`,
  };
}
