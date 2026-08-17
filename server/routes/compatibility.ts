import { Router } from "express";
import {
  calculateArchetypeMatches,
  type ArchetypeMatch,
  type RelationshipMode,
} from "../../services/archetype-matches";
import { extractVerifiedAstrology } from "../lib/verified-astrology";

const router = Router();

const MODE_KEYS: RelationshipMode[] = ["love", "attraction", "friendship", "growth"];
const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;
const VALID_LIFE_PATHS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]);

export type CompatibilityEvidenceMode = "verified" | "symbolic" | "unavailable";

export function deterministicLifePath(profile: any): number | undefined {
  const raw =
    profile?.lifePathNumber ??
    profile?.numerologyData?.lifePathNumber ??
    profile?.numerologyData?.lifePath ??
    profile?.numerology?.lifePath?.value;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && VALID_LIFE_PATHS.has(parsed) ? parsed : undefined;
}

function validSymbolicSign(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value.trim().toLowerCase();
  return ZODIAC_SIGNS.find((sign) => sign.toLowerCase() === clean);
}

export function symbolicSunSign(profile: any): string | undefined {
  return (
    validSymbolicSign(profile?.astrologyData?.sunSign) ??
    validSymbolicSign(profile?.astrology?.sunSign) ??
    validSymbolicSign(profile?.sunSign) ??
    // A locally computed Sun candidate can support the explicitly symbolic tier
    // when independent verification is unavailable. It is never relabeled as
    // verified astronomy.
    validSymbolicSign(profile?.astrologyData?.sun?.internalCandidate?.sign) ??
    validSymbolicSign(profile?.astrology?.sun?.internalCandidate?.sign)
  );
}

function averageScore(match: ArchetypeMatch): number {
  return Math.round(
    (match.scores.love +
      match.scores.attraction +
      match.scores.friendship +
      match.scores.growth) /
      4,
  );
}

function topBy(matches: ArchetypeMatch[], mode: RelationshipMode): ArchetypeMatch | null {
  return [...matches].sort((a, b) => b.scores[mode] - a.scores[mode])[0] ?? null;
}

export function buildCompatibilityProfileInput(profile: any) {
  const astrology = extractVerifiedAstrology(profile);
  return {
    sunSign: astrology.sun,
    lifePathNumber: deterministicLifePath(profile),
    // Foundation v1 deliberately excludes Human Design from compatibility.
    humanDesignType: undefined as string | undefined,
    unresolved: {
      astrology: astrology.unresolved,
      humanDesign: ["Human Design excluded from Foundation compatibility"],
    },
  };
}

function excludedFoundationLayers(astrologyUnresolved: string[] = []) {
  return [
    ...astrologyUnresolved.map((item) => `Verified ${item}`),
    "Human Design excluded from Foundation compatibility",
    "Houses and house-based interpretation excluded from Foundation compatibility",
  ];
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
  const excludedLayers = excludedFoundationLayers(verifiedInput.unresolved.astrology);

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
        layers: [
          "A verified or explicitly symbolic Sun sign is required before sign-pair interpretation",
        ],
        modes: MODE_KEYS,
      },
    };
  }

  const all = calculateArchetypeMatches(
    sunSign,
    verifiedInput.lifePathNumber,
    undefined,
    mode,
  );
  const ranked = [...all].sort((a, b) => b.score - a.score);
  const averageRanked = [...all].sort((a, b) => averageScore(b) - averageScore(a));

  return {
    available: true,
    evidenceMode,
    evidenceLabel:
      evidenceMode === "verified"
        ? "Verified birth input · symbolic relationship model"
        : "Supported symbolic Sun · lower-certainty relationship model",
    all: ranked,
    best: ranked.slice(0, 4),
    challenging: ranked.slice(-3).reverse(),
    picks: {
      romanticConnection: topBy(all, "love"),
      chemistryAttraction: topBy(all, "attraction"),
      communicationFriendship: topBy(all, "friendship"),
      growthRepair: topBy(all, "growth"),
      easiest: averageRanked[0] ?? null,
      hardest: averageRanked[averageRanked.length - 1] ?? null,
      // Backward-compatible aliases during the UI migration.
      lifePartner: topBy(all, "love"),
      sexPartner: topBy(all, "attraction"),
      mindMatch: topBy(all, "friendship"),
      growthPartner: topBy(all, "growth"),
    },
    unresolved: verifiedInput.unresolved,
    excludedLayers,
    formula: {
      id: "foundation-compatibility-v1",
      inputs: {
        sunSign,
        lifePathNumber: verifiedInput.lifePathNumber ?? null,
        humanDesignType: null,
        mode,
        evidenceMode,
      },
      layers: [
        evidenceMode === "verified"
          ? "Verified Sun placement used inside a symbolic sign-pair model"
          : "Saved symbolic Sun sign used as tradition-based reflection, not verified astronomy",
        "Traditional element, modality, and ruler associations",
        ...(verifiedInput.lifePathNumber
          ? ["Deterministic Life Path resonance"]
          : []),
        "High-flow and high-friction symbolic sign-pair rules",
      ],
      modes: MODE_KEYS,
    },
  };
}

export function buildPersonComparisonResponse(profile: any, otherPerson: any) {
  const verifiedInput = buildCompatibilityProfileInput(profile);
  const savedSymbolicSun = symbolicSunSign(profile);
  const savedSunSign = verifiedInput.sunSign ?? savedSymbolicSun;
  const savedSunEvidenceMode: CompatibilityEvidenceMode = verifiedInput.sunSign
    ? "verified"
    : savedSymbolicSun
      ? "symbolic"
      : "unavailable";
  const otherSunSign = validSymbolicSign(otherPerson?.sunSign);
  const otherName =
    typeof otherPerson?.name === "string"
      ? otherPerson.name.trim().slice(0, 80)
      : "This person";
  const excludedLayers = [
    ...excludedFoundationLayers(verifiedInput.unresolved.astrology),
    "Partner Moon, Rising, Venus, Mars, and houses are not inferred from a user-supplied Sun sign",
  ];

  if (!savedSunSign || !otherSunSign) {
    return {
      available: false,
      evidenceMode: "unavailable" as CompatibilityEvidenceMode,
      savedSunEvidenceMode,
      reason: !savedSunSign
        ? "Your saved profile does not contain a verified or supported symbolic Sun sign."
        : "Choose the other person's Sun sign before comparing.",
      person: { name: otherName, sunSign: otherSunSign ?? null },
      dimensions: null,
      interpretation: null,
      excludedLayers,
      formula: {
        id: "foundation-compatibility-v1",
        inputs: {
          savedSunSign: savedSunSign ?? null,
          otherSunSign: otherSunSign ?? null,
          lifePathNumber: verifiedInput.lifePathNumber ?? null,
          humanDesignType: null,
        },
        layers: [],
      },
    };
  }

  const match = calculateArchetypeMatches(
    savedSunSign,
    verifiedInput.lifePathNumber,
    undefined,
    "love",
  ).find((candidate) => candidate.sign.name === otherSunSign);

  if (!match) {
    return {
      available: false,
      evidenceMode: "unavailable" as CompatibilityEvidenceMode,
      savedSunEvidenceMode,
      reason: "The selected Sun-sign pair could not be evaluated.",
      person: { name: otherName, sunSign: otherSunSign },
      dimensions: null,
      interpretation: null,
      excludedLayers,
      formula: {
        id: "foundation-compatibility-v1",
        inputs: {
          savedSunSign,
          otherSunSign,
          lifePathNumber: verifiedInput.lifePathNumber ?? null,
          humanDesignType: null,
        },
        layers: [],
      },
    };
  }

  return {
    available: true,
    evidenceMode: "symbolic" as CompatibilityEvidenceMode,
    savedSunEvidenceMode,
    evidenceLabel: verifiedInput.sunSign
      ? "Verified saved Sun + user-supplied symbolic partner Sun"
      : "Supported symbolic Sun pair · lower-certainty relationship model",
    person: { name: otherName || "This person", sunSign: otherSunSign },
    dimensions: {
      romantic: match.scores.love,
      chemistry: match.scores.attraction,
      mentalFriendship: match.scores.friendship,
      growth: match.scores.growth,
    },
    interpretation: {
      headline: match.headline,
      why: match.why,
      tension: match.tension ?? null,
    },
    excludedLayers,
    formula: {
      id: "foundation-compatibility-v1",
      inputs: {
        savedSunSign,
        otherSunSign,
        lifePathNumber: verifiedInput.lifePathNumber ?? null,
        humanDesignType: null,
      },
      layers: [
        verifiedInput.sunSign
          ? "Your saved Sun placement passed the independent evidence contract"
          : "Your saved Sun is an explicitly symbolic input",
        "The other person's Sun sign is user-supplied symbolic data, not independently verified astronomy",
        "Traditional sign-pair element, modality, aspect, and ruler associations",
        ...(verifiedInput.lifePathNumber
          ? ["Your deterministic Life Path resonance"]
          : []),
      ],
    },
  };
}

router.post("/compatibility/archetype-matches", (req, res) => {
  try {
    const { profile, mode = "love" } = req.body ?? {};
    if (!profile || typeof profile !== "object") {
      return res.status(400).json({
        message:
          "A saved Soul Profile is required. Do not resubmit naked sign strings.",
      });
    }

    const safeMode = MODE_KEYS.includes(mode) ? mode : "love";
    const result = buildMatchResponse(profile, safeMode);
    res.status(result.available ? 200 : 422).json(result);
  } catch (err: any) {
    res.status(500).json({
      message: err?.message || "Compatibility match generation failed",
    });
  }
});

router.post("/compatibility/person", (req, res) => {
  try {
    const { profile, otherPerson } = req.body ?? {};
    if (!profile || typeof profile !== "object") {
      return res.status(400).json({ message: "A saved Soul Profile is required." });
    }
    if (!otherPerson || typeof otherPerson !== "object") {
      return res
        .status(400)
        .json({ message: "The other person's details are required." });
    }

    const result = buildPersonComparisonResponse(profile, otherPerson);
    res.status(result.available ? 200 : 422).json(result);
  } catch (err: any) {
    res.status(500).json({
      message: err?.message || "Person compatibility comparison failed",
    });
  }
});

router.get("/compatibility/ping", (_req, res) => {
  res.json({ ok: true, contract: "foundation-compatibility-v1" });
});

export default router;
