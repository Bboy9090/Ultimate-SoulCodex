import { Router } from "express";
import { calculateArchetypeMatches, type ArchetypeMatch, type RelationshipMode } from "../services/archetype-matches";

const router = Router();

const MODE_KEYS: RelationshipMode[] = ["love", "attraction", "friendship", "growth"];

function averageScore(match: ArchetypeMatch): number {
  return Math.round((match.scores.love + match.scores.attraction + match.scores.friendship + match.scores.growth) / 4);
}

function topBy(matches: ArchetypeMatch[], mode: RelationshipMode): ArchetypeMatch | null {
  return [...matches].sort((a, b) => b.scores[mode] - a.scores[mode])[0] ?? null;
}

function buildMatchResponse(
  sunSign: string,
  lifePathNumber?: number,
  hdType?: string,
  mode: RelationshipMode = "love"
) {
  const all = calculateArchetypeMatches(sunSign, lifePathNumber, hdType, mode);
  const ranked = [...all].sort((a, b) => b.score - a.score);
  const averageRanked = [...all].sort((a, b) => averageScore(b) - averageScore(a));

  return {
    all: ranked,
    best: ranked.slice(0, 4),
    challenging: ranked.slice(-3).reverse(),
    picks: {
      lifePartner: topBy(all, "love"),
      sexPartner: topBy(all, "attraction"),
      mindMatch: topBy(all, "friendship"),
      growthPartner: topBy(all, "growth"),
      easiest: averageRanked[0] ?? null,
      hardest: averageRanked[averageRanked.length - 1] ?? null,
    },
    formula: {
      inputs: {
        sunSign,
        lifePathNumber: lifePathNumber ?? null,
        humanDesignType: hdType ?? null,
        mode,
      },
      layers: [
        "Sun-sign aspect pattern",
        "Ruling planet chemistry",
        "Life Path number resonance",
        "Human Design type element fit",
        "Known high-friction and high-flow sign pairs",
      ],
      modes: MODE_KEYS,
    },
  };
}

router.post("/compatibility/archetype-matches", (req, res) => {
  try {
    const { sunSign, lifePathNumber, hdType, mode = "love" } = req.body ?? {};
    if (!sunSign) return res.status(400).json({ message: "sunSign is required" });

    const safeMode = MODE_KEYS.includes(mode) ? mode : "love";
    const parsedLifePath = lifePathNumber ? Number(lifePathNumber) : undefined;
    const result = buildMatchResponse(sunSign, parsedLifePath, hdType, safeMode);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err?.message || "Compatibility match generation failed" });
  }
});

router.get("/compatibility/ping", (_req, res) => {
  res.json({ ok: true });
});

export default router;