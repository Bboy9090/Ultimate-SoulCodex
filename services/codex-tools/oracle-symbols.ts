/**
 * Oracle Symbols — non-tarot alternative.
 * Less "woo," more universal. Each symbol maps to a behavioral insight.
 */

import type { CodexToolResult, ProfileInput } from "./types";
import { extractCore } from "./types";

interface OracleSymbol {
  name: string;
  meaning: string;
  behavior: string;
  action: string;
  avoid: string;
}

const SYMBOLS: OracleSymbol[] = [
  { name: "The Mirror", meaning: "Self-reflection is needed before external action", behavior: "You're projecting onto a situation instead of seeing it clearly", action: "Write down what you think is happening vs. what you actually know", avoid: "Making decisions based on assumptions" },
  { name: "The Gate", meaning: "A decision point is here — not later, now", behavior: "You've been gathering information to avoid choosing", action: "Choose a direction instead of waiting for certainty", avoid: "Telling yourself you need more time when you already know" },
  { name: "The Storm", meaning: "External pressure is testing your foundation", behavior: "Stress is amplifying your default patterns", action: "Reduce input. Cancel one thing. Create space to think", avoid: "Adding more commitments to feel in control" },
  { name: "The Flame", meaning: "Your drive is high but unfocused", behavior: "You're starting things without finishing what's already open", action: "Pick the one project that matters most. Give it two hours of undivided attention", avoid: "Spreading energy across five things and finishing none" },
  { name: "The Scale", meaning: "Something is out of balance — you already know what", behavior: "You're giving more than you're receiving in a specific area", action: "Name the imbalance out loud. Then adjust one thing", avoid: "Pretending it's fine when your body is telling you otherwise" },
  { name: "The Root", meaning: "Your foundation needs attention before you build higher", behavior: "You're focused on growth but your basics are unstable", action: "Fix the thing you've been ignoring — the bill, the conversation, the health habit", avoid: "Chasing new goals while the floor creaks underneath" },
  { name: "The River", meaning: "Flow requires releasing control", behavior: "You're gripping too tightly on an outcome", action: "Let go of how it's supposed to look. Focus on the next step only", avoid: "Planning five steps ahead when you haven't taken the first one" },
  { name: "The Shield", meaning: "Protection mode is active — check if it's still needed", behavior: "You're defending a position that no longer needs defending", action: "Lower one guard. Share one honest thing with someone today", avoid: "Using strength as a wall instead of a tool" },
  { name: "The Compass", meaning: "Direction matters more than speed right now", behavior: "You're moving fast but not sure where", action: "Stop for 15 minutes. Ask: where am I actually trying to go?", avoid: "Confusing busyness with progress" },
  { name: "The Key", meaning: "Access is available if you ask for it", behavior: "You're trying to do something alone that requires help", action: "Ask one person for the specific thing you need. Not vaguely — specifically", avoid: "Performing independence when collaboration would be faster" },
  { name: "The Mask", meaning: "What you're showing isn't what you're feeling", behavior: "There's a gap between your public face and your private state", action: "Tell one person the truth about how you're actually doing", avoid: "Performing 'fine' when you're running on fumes" },
  { name: "The Seed", meaning: "Something small you planted is ready for attention", behavior: "An idea, habit, or relationship needs deliberate watering", action: "Spend 30 minutes on the thing you started and neglected", avoid: "Abandoning early efforts because they don't feel dramatic enough" },
];

export function oracleSymbolDraw(profile: ProfileInput, date: Date = new Date()): CodexToolResult {
  const core = extractCore(profile);
  const dayIndex = (date.getDate() + date.getMonth() + (core.birthDate ? new Date(core.birthDate).getDate() : 0)) % SYMBOLS.length;
  const symbol = SYMBOLS[dayIndex];

  const personalizedMeaning = `${symbol.meaning}. ${core.sunSign ? `Your ${core.sunSign} Sun's default is to ${core.sunSign === "Aries" || core.sunSign === "Leo" || core.sunSign === "Sagittarius" ? "push through" : core.sunSign === "Taurus" || core.sunSign === "Virgo" || core.sunSign === "Capricorn" ? "bear down and endure" : core.sunSign === "Gemini" || core.sunSign === "Libra" || core.sunSign === "Aquarius" ? "think your way out" : "feel your way through"} — but today that default might not serve you.` : ""} ${core.hdType ? `As a ${core.hdType}, ${core.hdStrategy ? `your strategy is to ${core.hdStrategy.toLowerCase()}` : "wait for the right signal"} — not force it.` : ""}`;

  return {
    tool: "oracle_symbol",
    title: `Symbol: ${symbol.name}`,
    observation: symbol.behavior,
    meaning: personalizedMeaning,
    action: `${symbol.action}\n\n**Avoid:** ${symbol.avoid}`,
    extras: {
      symbol: symbol.name,
      avoid: symbol.avoid,
    },
  };
}
