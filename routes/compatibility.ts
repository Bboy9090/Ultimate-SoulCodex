import { Router } from "express";
import { calculateArchetypeMatches, type ArchetypeMatch, type RelationshipMode } from "../services/archetype-matches";
import { extractVerifiedAstrology } from "../server/lib/verified-astrology";

const router = Router();

const MODE_KEYS: RelationshipMode[] = ["love", "attraction", "friendship", "growth"];

interface EvidenceLike {
  source?: string | null;
  engine?: string | null;
  calculatedAt?: string | null;
}

interface VerifiedValueLike {
  value?: string | null;
  type?: string | null;
  verificationStatus?: string | null;
  status?: string | null;
  evidence?: EvidenceLike | null;
  provenance?: EvidenceLike | null;
}

function hasEvidence(value: VerifiedValueLike | null | undefined): boolean {
  const state = value?.verificationStatus ?? value?.status;
  const evidence = value?.provenance ?? value?.evidence;
  return state === "verified" && Boolean(evidence?.source && evidence?.engine && evidence?.calculatedAt);
}

function verifiedHumanDesignType(profile: any): string | undefined {
  const candidate = profile?.humanDesignData?.type ?? profile?.humanDesign?.type;
  if (typeof candidate === "object" && candidate && hasEvidence(candidate)) {
    return candidate.value ?? candidate.type ?? undefined;
  }
  return undefined;
}

function deterministicLifePath(profile: any): number | undefined {
  const raw =
    profile?.lifePathNumber ??
    profile?.numerologyData?.lifePathNumber ??
    profile?.numerologyData?.lifePath ??
    profile?.numerology?.lifePath?.value;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 9 ? parsed : undefined;
}

function averageScore(match: ArchetypeMatch): number {
  return Math.round((match.scores.love + match.scores.attraction + match.scores.friendship + match.scores.growth) / 4);
}

function topBy(matches: ArchetypeMatch[], mode: RelationshipMode): ArchetypeMatch | null {
  return [...matches].sort((a, b) => b.scores[mode] - a.scores[mode])[0] ?? null;
}

export function buildCompatibilityProfileInput(profile: any) {
  const astrology = extractVerifiedAstrology(profile);
  return {
    sunSign: astrology.sun,
    lifePathNumber: deterministicLifePath(profile),
    humanDesignType: verifiedHumanDesignType(profile),
    unresolved: {
      astrology: astrology.unresolved,
      humanDesign: verifiedHumanDesignType(profile) ? [] : ["Human Design type"],
    },
  };
}

function buildMatchResponse(profile: any, mode: RelationshipMode = "love") {
  const input = buildCompatibilityProfileInput(profile);
  if (!input.sunSign) {
    return {
      available: false,
      reason: "A verified Sun placement is required for the sign compatibility explorer.",
      unresolved: input.unresolved,
      all: [],
      best: [],
      challenging: [],
      picks: {},
      formula: {
        inputs: {
          sunSign: null,
          lifePathNumber: input.lifePathNumber ?? null,
          humanDesignType: input.humanDesignType ?? null,
          mode,
        },
        layers: ["Verified Sun placement required before sign-pair interpretation"],
        modes: MODE_KEYS,
      },
    };
  }

  const all = calculateArchetypeMatches(input.sunSign, input.lifePathNumber, input.humanDesignType, mode);
  const ranked = [...all].sort((a, b) => b.score - a.score);
  const averageRanked = [...all].sort((a, b) => averageScore(b) - averageScore(a));

  return {
    available: true,
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
    unresolved: input.unresolved,
    formula: {
      inputs: {
        sunSign: input.sunSign,
        lifePathNumber: input.lifePathNumber ?? null,
        humanDesignType: input.humanDesignType ?? null,
        mode,
      },
      layers: [
        "Verified Sun-sign pair pattern",
        "Ruling planet chemistry",
        ...(input.lifePathNumber ? ["Deterministic Life Path resonance"] : []),
        ...(input.humanDesignType ? ["Verified Human Design type fit"] : []),
        "Known high-friction and high-flow sign pairs",
      ],
      modes: MODE_KEYS,
    },
  };
}

router.post("/compatibility/archetype-matches", (req, res) => {
  try {
    const { profile, mode = "love" } = req.body ?? {};
    if (!profile || typeof profile !== "object") {
      return res.status(400).json({ message: "A saved Soul Profile is required. Do not resubmit naked sign strings." });
    }

    const safeMode = MODE_KEYS.includes(mode) ? mode : "love";
    const result = buildMatchResponse(profile, safeMode);
    res.status(result.available ? 200 : 422).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err?.message || "Compatibility match generation failed" });
  }
});

router.get("/compatibility/ping", (_req, res) => {
  res.json({ ok: true });
});

export default router;
