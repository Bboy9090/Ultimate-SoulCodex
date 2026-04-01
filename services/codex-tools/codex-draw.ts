/**
 * Codex Draw — profile-integrated tarot reading system.
 *
 * Three modes:
 * - Quick Card (1 card) — daily use, habit-forming
 * - Situation Spread (3 cards) — past / present / direction
 * - Deep Reading (5 cards) — current / hidden / challenge / advice / outcome
 *
 * Every reading is connected to the user's profile, not generic fortune telling.
 */

import type { CodexToolResult, ProfileInput } from "./types";
import { extractCore } from "./types";
import { drawCards, type TarotCard } from "./tarot-deck";

export type SpreadType = "quick" | "situation" | "deep";

export interface DrawnCard {
  position: string;
  card: TarotCard;
  interpretation: string;
}

export interface CodexDrawResult extends CodexToolResult {
  extras: {
    spreadType: SpreadType;
    cards: DrawnCard[];
    codexInsight: string;
  };
}

function personalizeCard(card: TarotCard, position: string, core: ReturnType<typeof extractCore>): string {
  const base = card.behavior;

  const personalHooks: string[] = [];

  if (card.arcana === "major") {
    if (core.sunSign) {
      const fireSign = ["Aries", "Leo", "Sagittarius"].includes(core.sunSign);
      const earthSign = ["Taurus", "Virgo", "Capricorn"].includes(core.sunSign);
      const airSign = ["Gemini", "Libra", "Aquarius"].includes(core.sunSign);

      if (card.keywords.includes("patience") || card.keywords.includes("surrender")) {
        if (fireSign) personalHooks.push(`Your ${core.sunSign} Sun resists this — patience feels like stagnation to you. It's not. It's strategy.`);
      }
      if (card.keywords.includes("action") || card.keywords.includes("drive")) {
        if (earthSign) personalHooks.push(`Your ${core.sunSign} Sun prefers careful action. Today, speed matters more than perfection.`);
        if (airSign) personalHooks.push(`Your ${core.sunSign} Sun wants to think it through first. Today, act before the analysis finishes.`);
      }
    }

    if (core.moonSign) {
      if (card.keywords.includes("intuition") || card.keywords.includes("subconscious")) {
        personalHooks.push(`Your ${core.moonSign} Moon is the key here — the answer isn't in logic, it's in what you feel but haven't said.`);
      }
      if (card.keywords.includes("ending") || card.keywords.includes("release")) {
        personalHooks.push(`Your ${core.moonSign} Moon holds onto things longer than it should. This card says: the holding is costing more than the letting go.`);
      }
    }

    if (core.hdType) {
      if (card.keywords.includes("choice") || card.keywords.includes("truth")) {
        personalHooks.push(`As a ${core.hdType}${core.hdStrategy ? ` (Strategy: ${core.hdStrategy})` : ""}, don't let external pressure make this choice. Wait for your inner authority.`);
      }
    }
  }

  if (card.arcana === "minor" && card.suit) {
    if (card.suit === "swords" && core.stressPattern) {
      personalHooks.push(`This connects to your stress pattern: ${core.stressPattern.toLowerCase()}. The sword cuts both ways — it can clarify or wound.`);
    }
    if (card.suit === "cups" && core.moonSign) {
      personalHooks.push(`Your ${core.moonSign} Moon is directly in play here — this is about emotional truth, not intellectual understanding.`);
    }
    if (card.suit === "pentacles" && core.primaryElement) {
      personalHooks.push(`Your ${core.primaryElement} element resonates with this — ground the insight into physical action.`);
    }
    if (card.suit === "wands" && core.lifePath) {
      personalHooks.push(`Life Path ${core.lifePath} says this creative/driven energy needs a clear channel — don't scatter it.`);
    }
  }

  if (personalHooks.length === 0) {
    if (core.archetype) personalHooks.push(`As ${core.archetype}, this pattern is familiar to you. The question is whether you'll default to your usual response or try the one that actually works.`);
  }

  return `${base} ${personalHooks[0] || ""}`.trim();
}

function buildCodexInsight(cards: DrawnCard[], core: ReturnType<typeof extractCore>, spreadType: SpreadType): string {
  const cardNames = cards.map(c => c.card.name).join(", ");
  const themes = cards.map(c => c.card.keywords[0]).filter(Boolean);
  const uniqueThemes = [...new Set(themes)];

  const lines: string[] = [];

  if (spreadType === "quick") {
    if (core.archetype) {
      lines.push(`Your ${core.archetype} profile intersects with ${cards[0].card.name} today — this isn't random, it's confirmation of what you already sense.`);
    }
    if (core.growthEdge) {
      lines.push(`Your growth edge (${core.growthEdge.toLowerCase()}) is directly addressed by this card's action.`);
    }
  } else {
    if (uniqueThemes.length >= 2) {
      lines.push(`The thread across this reading: ${uniqueThemes.slice(0, 3).join(" → ")}. This isn't three separate messages — it's one story.`);
    }
    if (core.blindSpot) {
      lines.push(`Watch for your blind spot here: ${core.blindSpot.toLowerCase()}. The cards suggest it's active.`);
    }
    if (core.stressPattern) {
      lines.push(`Your stress pattern (${core.stressPattern.toLowerCase()}) may be triggered by what this reading surfaces. That's the point — awareness is the intervention.`);
    }
    if (core.hdType) {
      lines.push(`Your ${core.hdType} strategy applies to every card in this spread: ${core.hdStrategy ? core.hdStrategy.toLowerCase() : "trust your authority"} before acting on any of it.`);
    }
  }

  if (lines.length === 0) {
    lines.push(`This reading (${cardNames}) points to a clear behavioral pattern. The action isn't symbolic — it's something you can do today.`);
  }

  return lines.join(" ");
}

export function codexDraw(
  profile: ProfileInput,
  spreadType: SpreadType = "quick",
  question?: string,
  seed?: number
): CodexDrawResult {
  const core = extractCore(profile);

  const drawSeed = seed ?? (Date.now() + (core.birthDate ? new Date(core.birthDate).getTime() % 100000 : 0));

  let positions: string[];
  let cardCount: number;

  switch (spreadType) {
    case "situation":
      positions = ["Past", "Present", "Direction"];
      cardCount = 3;
      break;
    case "deep":
      positions = ["Current Energy", "Hidden Influence", "Challenge", "Advice", "Outcome Direction"];
      cardCount = 5;
      break;
    default:
      positions = ["Today's Card"];
      cardCount = 1;
  }

  const cards = drawCards(cardCount, drawSeed);

  const drawnCards: DrawnCard[] = cards.map((card, i) => ({
    position: positions[i],
    card,
    interpretation: personalizeCard(card, positions[i], core),
  }));

  const codexInsight = buildCodexInsight(drawnCards, core, spreadType);

  const observationParts = drawnCards.map(dc =>
    `**${dc.position}** — ${dc.card.name}\n${dc.interpretation}`
  );

  const observation = observationParts.join("\n\n");

  const meaning = codexInsight;

  const actionParts = drawnCards.map(dc => dc.card.action);
  const primaryAction = actionParts[actionParts.length - 1];
  const shadowWarning = drawnCards[0].card.shadow;

  const action = `${primaryAction}\n\n**Watch for:** ${shadowWarning}`;

  return {
    tool: "codex_draw",
    title: spreadType === "quick"
      ? `Codex Draw — ${drawnCards[0].card.name}`
      : spreadType === "situation"
      ? "Codex Draw — Situation Spread"
      : "Codex Draw — Deep Reading",
    observation,
    meaning,
    action,
    extras: {
      spreadType,
      cards: drawnCards,
      codexInsight,
    },
  };
}
