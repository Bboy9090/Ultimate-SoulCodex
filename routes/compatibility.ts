import { Router } from "express";
import { calculateArchetypeMatches, type ArchetypeMatch, type RelationshipMode } from "../services/archetype-matches";
import { extractVerifiedAstrology } from "../server/lib/verified-astrology";

const router = Router();

const MODE_KEYS: RelationshipMode[] = ["love", "attraction", "friendship", "growth"];
const ZODIAC_SIGNS = new Set([
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]);

export type CompatibilityEvidenceMode = "verified" | "symbolic" | "unavailable";

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

function validSymbolicSign(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value.trim();
  return ZODIAC_SIGNS.has(clean) ? clean : undefined;
}

export function symbolicSunSign(profile: any): string | undefined {
  return (
    validSymbolicSign(profile?.astrologyData?.sunSign) ??
    validSymbolicSign(profile?.astrology?.sunSign) ??
    validSymbolicSign(profile?.sunSign)
  );
}

function averageScore(match: ArchetypeMatch): number {
  return Math.round((match.scores.love + match.scores.attraction + match.scores.friendship + match.scores.growth) / 4);
}

function topBy(matches: ArchetypeMatch[], mode: RelationshipMode): ArchetypeMatch | null {
  return [...matches].sort((a, b) => b.scores[mode] - a.scores[mode])[0] ?? null;
}

export function buildCompatibilityProfileInput(profile: any) {
  const astrology = extractVerifiedAstrology(profile);
  const humanDesignType = verifiedHumanDesignType(profile);
  return {
    sunSign: astrology.sun,
    lifePathNumber: deterministicLifePath(profile),
    humanDesignType,
    unresolved: {
      astrology: astrology.unresolved,
      humanDesign: humanDesignType ? [] : ["Human Design type"],
    },
  };
}

export function buildMatchResponse(profile: any, mode: RelationshipMode = "love") {
  const verifiedInput = buildCompatibilityProfileInput(profile);
  const symbolicSun = symbolicSunSign(profile);
  const evidenceMode: CompatibilityEvidenceMode = verifiedInput.sunSign
    ? "verified"
    : symbolicSun
      ? "symbolic"
      : "unavailable";

  const sunSign = verifiedInput.sunSign ?? symbolicSun;
  const humanDesignType = evidenceMode === "verified" ? verifiedInput.humanDesignType : undefined;
  const excludedLayers = [
    ...(verifiedInput.unresolved.astrology ?? []).map((item) => `Verified ${item}`),
    ...(verifiedInput.unresolved.humanDesign ?? []),
  ];

  if (!sunSign) {
    return {
      available: false,
      evidenceMode,
      reason: "No verified or supported symbolic Sun sign is available for compatibility interpretation.",
      unresolved: verifiedInput.unresolved,
      excludedLayers,
      all: [],
      best: [],
      challenging: [],
      picks: {},
      formula: {
        inputs: {
          sunSign: null,
          lifePathNumber: verifiedInput.lifePathNumber ?? null,
          humanDesignType: null,
          mode,
          evidenceMode,
        },
        layers: ["A verified or explicitly symbolic Sun sign is required before sign-pair interpretation"],
        modes: MODE_KEYS,
      },
    };
  }

  const all = calculateArchetypeMatches(sunSign, verifiedInput.lifePathNumber, humanDesignType, mode);
  const ranked = [...all].sort((a, b) => b.score - a.score);
  const averageRanked = [...all].sort((a, b) => averageScore(b) - averageScore(a));

  return {
    available: true,
    evidenceMode,
    evidenceLabel: evidenceMode === "verified"
      ? "Verified birth input · symbolic relationship model"
      : "Supported symbolic Sun · lower-certainty relationship model",
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
    unresolved: verifiedInput.unresolved,
    excludedLayers,
    formula: {
      inputs: {
        sunSign,
        lifePathNumber: verifiedInput.lifePathNumber ?? null,
        humanDesignType: humanDesignType ?? null,
        mode,
        evidenceMode,
      },
      layers: [
        evidenceMode === "verified"
          ? "Verified Sun placement used inside a symbolic sign-pair model"
          : "Saved symbolic Sun sign used as tradition-based reflection, not verified astronomy",
        "Traditional element, modality, and ruler associations",
        ...(verifiedInput.lifePathNumber ? ["Deterministic Life Path resonance"] : []),
        ...(humanDesignType ? ["Verified Human Design type fit"] : []),
        "High-flow and high-friction symbolic sign-pair rules",
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
