import type { Express } from "express";
import { z } from "zod";
import {
  calculateVerifiedAstrology,
  type AstrologyData,
} from "../services/astrology-production";
import { calculateHumanDesign } from "../../packages/astrology/human-design";
import { createVerifiedHumanDesignTrustRecord } from "../services/human-design-trust";
import {
  calculateUnknownTimeAstrologyRange,
  calculateUnknownTimeHumanDesignRange,
  type UnknownTimeAstrologyRange,
} from "../services/unknown-time-range";
import { fromZonedTime } from "date-fns-tz";

const numericCoordinate = z
  .union([z.number(), z.string().min(1)])
  .transform((value) => Number(value))
  .refine((value) => Number.isFinite(value), "Coordinate must be a finite number");

export const profileVerificationRequestSchema = z
  .object({
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Birth date must use YYYY-MM-DD"),
    birthTime: z
      .union([
        z.literal(""),
        z.string().regex(/^\d{2}:\d{2}$/, "Birth time must use HH:MM when provided"),
      ])
      .optional(),
    timezone: z.string().min(1, "Timezone is required"),
    latitude: numericCoordinate
      .refine((value) => value >= -90 && value <= 90, "Latitude must be between -90 and 90")
      .optional(),
    longitude: numericCoordinate
      .refine((value) => value >= -180 && value <= 180, "Longitude must be between -180 and 180")
      .optional(),
  })
  .strict();

function verifiedLegacySign(placement: any): string | null {
  const evidence = placement?.provenance ?? placement?.evidence;
  const evidenceComplete = Boolean(
    typeof evidence?.source === "string" && evidence.source.trim() &&
    typeof evidence?.engine === "string" && evidence.engine.trim() &&
    typeof evidence?.calculatedAt === "string" &&
    evidence.calculatedAt.trim() &&
    !Number.isNaN(Date.parse(evidence.calculatedAt))
  );
  return placement?.verificationStatus === "verified" &&
    evidenceComplete &&
    typeof placement?.sign === "string" &&
    placement.sign.trim()
    ? placement.sign.trim()
    : null;
}

function withVerifiedLegacyAliases(astrologyData: AstrologyData) {
  return {
    ...astrologyData,
    sunSign: verifiedLegacySign(astrologyData.sun),
    moonSign: verifiedLegacySign(astrologyData.moon),
    risingSign: verifiedLegacySign(astrologyData.rising),
  };
}

function placementFromRange(
  original: any,
  range: UnknownTimeAstrologyRange["planets"][string],
  label: string,
) {
  if (range.evidenceState === "stable_across_range" && range.value) {
    return {
      ...original,
      sign: range.value,
      verificationStatus: "calculated",
      evidenceState: "stable_across_range",
      rangeEvidence: range.rangeEvidence,
      conditionalValues: range.conditionalValues,
      evidence: {
        source: "Soul Codex full-day minute sweep",
        engine: "unknown-time-range-v1",
        calculatedAt: new Date().toISOString(),
      },
      reason: `${label} is stable across every possible HH:MM birth time for the supplied date/timezone.`,
    };
  }
  return {
    ...original,
    sign: null,
    verificationStatus: "unresolved",
    evidenceState: range.evidenceState,
    rangeEvidence: range.rangeEvidence,
    conditionalValues: range.conditionalValues,
    reason: range.reason,
  };
}

function withUnknownTimeRange(
  astrologyData: AstrologyData,
  range: UnknownTimeAstrologyRange,
): AstrologyData {
  if (!astrologyData.planets) return astrologyData;
  const planets = {
    sun: placementFromRange(astrologyData.planets.sun, range.planets.sun, "Sun"),
    moon: placementFromRange(astrologyData.planets.moon, range.planets.moon, "Moon"),
    mercury: placementFromRange(astrologyData.planets.mercury, range.planets.mercury, "Mercury"),
    venus: placementFromRange(astrologyData.planets.venus, range.planets.venus, "Venus"),
    mars: placementFromRange(astrologyData.planets.mars, range.planets.mars, "Mars"),
    jupiter: placementFromRange(astrologyData.planets.jupiter, range.planets.jupiter, "Jupiter"),
    saturn: placementFromRange(astrologyData.planets.saturn, range.planets.saturn, "Saturn"),
    uranus: placementFromRange(astrologyData.planets.uranus, range.planets.uranus, "Uranus"),
    neptune: placementFromRange(astrologyData.planets.neptune, range.planets.neptune, "Neptune"),
    pluto: placementFromRange(astrologyData.planets.pluto, range.planets.pluto, "Pluto"),
  };
  const rising = {
    ...astrologyData.rising,
    sign: range.ascendant.evidenceState === "stable_across_range" ? range.ascendant.value : null,
    verificationStatus:
      range.ascendant.evidenceState === "stable_across_range" ? "calculated" : "unresolved",
    evidenceState: range.ascendant.evidenceState,
    rangeEvidence: range.ascendant.rangeEvidence,
    conditionalValues: range.ascendant.conditionalValues,
    reason: range.ascendant.reason,
  } as AstrologyData["rising"];

  return {
    ...astrologyData,
    sun: planets.sun,
    moon: planets.moon,
    rising,
    planets,
    houses: undefined,
    midheaven: undefined,
    planetaryHouses: undefined,
    aspects: undefined,
    verification: {
      ...astrologyData.verification,
      complete: false,
      unresolvedBodies: [
        ...new Set([
          ...astrologyData.verification.unresolvedBodies,
          "Ascendant",
          "Houses",
          "Midheaven",
        ]),
      ],
      suggestions:
        "Birth time is unknown. Stable-across-range placements may be interpreted with range provenance; conditional placements must branch by time window; Ascendant, houses, and Midheaven are not certified.",
      lastUpdated: new Date().toISOString(),
    },
  };
}

/**
 * Minimal online evidence endpoint for a local-first profile.
 *
 * This route intentionally does not import storage, account/profile persistence,
 * or AI generation services. A user who asks only for astronomical verification
 * receives only the evidence snapshot needed to reconcile their local profile.
 */
export function registerProfileVerificationRoutes(app: Express) {
  app.post("/api/verification/profile", async (req, res) => {
    const parsed = profileVerificationRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Verification request is invalid",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    try {
      const exactBirthTime = parsed.data.birthTime?.trim() || undefined;
      let astrologyData = await calculateVerifiedAstrology({
        birthDate: parsed.data.birthDate,
        birthTime: exactBirthTime,
        timezone: parsed.data.timezone,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
      });
      const updatedAt = new Date().toISOString();
      let humanDesignData: Record<string, unknown> | null = null;
      let astrologyRange = null as ReturnType<typeof calculateUnknownTimeAstrologyRange> | null;
      let humanDesignRange = null as ReturnType<typeof calculateUnknownTimeHumanDesignRange> | null;

      if (!exactBirthTime) {
        astrologyRange = calculateUnknownTimeAstrologyRange({
          birthDate: parsed.data.birthDate,
          timezone: parsed.data.timezone,
          latitude: parsed.data.latitude,
          longitude: parsed.data.longitude,
        });
        astrologyData = withUnknownTimeRange(astrologyData, astrologyRange);
        humanDesignRange = calculateUnknownTimeHumanDesignRange({
          birthDate: parsed.data.birthDate,
          timezone: parsed.data.timezone,
          latitude: parsed.data.latitude,
          longitude: parsed.data.longitude,
        });
        humanDesignData = {
          status: "range_analyzed",
          evidenceState: "conditional",
          components: humanDesignRange.components,
          reason: humanDesignRange.reason ??
            "Only Human Design components stable across every possible birth minute may be used; conditional components remain excluded from synthesis.",
        };
      }

      if (
        parsed.data.birthTime?.trim() &&
        parsed.data.latitude !== undefined &&
        parsed.data.longitude !== undefined
      ) {
        const humanDesign = calculateHumanDesign({
          name: "Private profile",
          birthDate: parsed.data.birthDate,
          birthTime: parsed.data.birthTime,
          birthLocation: "Resolved birthplace",
          timezone: parsed.data.timezone,
          latitude: String(parsed.data.latitude),
          longitude: String(parsed.data.longitude),
        });

        if (humanDesign.status === "resolved") {
          const inputTimestampUtc = fromZonedTime(
            `${parsed.data.birthDate}T${parsed.data.birthTime}:00`,
            parsed.data.timezone,
          ).toISOString();
          const trust = createVerifiedHumanDesignTrustRecord({
            birthTimeKnown: true,
            inputTimestampUtc,
            calculatedAt: updatedAt,
            candidate: {
              type: humanDesign.type,
              strategy: humanDesign.strategy,
              authority: humanDesign.authority,
              profile: humanDesign.profile,
            },
          });
          if (trust.status !== "verified") {
            throw new Error("human_design_verified_contract_not_produced");
          }

          humanDesignData = {
            status: trust.status,
            type: humanDesign.type,
            strategy: humanDesign.strategy,
            authority: humanDesign.authority,
            profile: humanDesign.profile,
            definition: humanDesign.definition,
            centers: humanDesign.centers,
            channels: humanDesign.channels,
            activations: humanDesign.activations,
            activatedGates: humanDesign.activatedGates,
            engine: trust.engine,
            source: trust.source,
            calculatedAt: trust.calculatedAt,
            inputTimestampUtc: trust.inputTimestampUtc,
            verificationReceiptId: trust.verificationReceiptId,
            independentSource: trust.independentSource,
            verifiedAt: trust.verifiedAt,
            limitations: trust.limitations,
          };
        }
      }

      return res.json({
        astrologyData: withVerifiedLegacyAliases(astrologyData),
        humanDesignData,
        rangeEvidence: exactBirthTime
          ? null
          : {
              astrology: astrologyRange,
              humanDesign: humanDesignRange,
            },
        updatedAt,
        processing: {
          persistedProfile: false,
          aiGeneration: false,
          purpose: "profile_system_verification_only",
        },
      });
    } catch (error) {
      console.error("[ProfileVerification] Verification failed safely:", error);
      return res.status(503).json({
        message: "Independent astronomy verification is temporarily unavailable",
        code: "verification_unavailable",
      });
    }
  });
}
