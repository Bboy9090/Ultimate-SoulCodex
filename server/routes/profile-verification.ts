import type { Express } from "express";
import { z } from "zod";
import {
  calculateVerifiedAstrology,
  type AstrologyData,
} from "../services/astrology-production";
import { calculateHumanDesign } from "../../packages/astrology/human-design";
import { createVerifiedHumanDesignTrustRecord } from "../services/human-design-trust";
import { resolveCivilTimeStrict } from "@soulcodex/core";

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
    birthTimeAccuracy: z
      .enum(["recorded", "recalled", "estimated", "unknown"])
      .optional(),
    birthTimeUncertaintyMinutes: z
      .number()
      .int()
      .min(0)
      .max(720)
      .optional(),
    latitude: numericCoordinate
      .refine((value) => value >= -90 && value <= 90, "Latitude must be between -90 and 90")
      .optional(),
    longitude: numericCoordinate
      .refine((value) => value >= -180 && value <= 180, "Longitude must be between -180 and 180")
      .optional(),
  })
  .strict()
  .superRefine((data, context) => {
    if (!data.birthTime?.trim() && data.birthTimeAccuracy && data.birthTimeAccuracy !== "unknown") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["birthTimeAccuracy"],
        message: "Birth-time accuracy cannot be set when birth time is unknown",
      });
    }
    if (
      data.birthTimeAccuracy === "estimated" &&
      data.birthTimeUncertaintyMinutes === undefined
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["birthTimeUncertaintyMinutes"],
        message: "Approximate birth time requires an uncertainty window",
      });
    }
  });

type InputTimeProvenance = {
  provenanceStatus: "modern_tzdb" | "historical_tzdb_unverified";
  historicalTimeRequiresIndependentSource: boolean;
  timezone: string;
  runtimeTzdbVersion: string | null;
  birthTimeAccuracy: "recorded" | "recalled" | "estimated" | "unknown";
  birthTimeUncertaintyMinutes: number | null;
  birthTimeQualityRequiresReview: boolean;
};

function withVerifiedLegacyAliases(
  astrologyData: AstrologyData,
  inputTimeProvenance: InputTimeProvenance | null,
) {
  const timedInputTrusted =
    inputTimeProvenance?.historicalTimeRequiresIndependentSource !== true;

  return {
    ...astrologyData,
    verification: {
      ...astrologyData.verification,
      inputTimeProvenance,
    },
    sunSign:
      timedInputTrusted && astrologyData.sun.verificationStatus === "verified"
        ? astrologyData.sun.sign
        : null,
    moonSign:
      timedInputTrusted && astrologyData.moon.verificationStatus === "verified"
        ? astrologyData.moon.sign
        : null,
    risingSign:
      timedInputTrusted && astrologyData.rising.verificationStatus === "verified"
        ? astrologyData.rising.sign
        : null,
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
      const timedCivilTime = parsed.data.birthTime?.trim()
        ? resolveCivilTimeStrict(
            parsed.data.birthDate,
            parsed.data.birthTime,
            parsed.data.timezone,
          )
        : null;
      const inputTimeProvenance: InputTimeProvenance | null =
        timedCivilTime?.status === "valid"
          ? {
              provenanceStatus: timedCivilTime.provenanceStatus,
              historicalTimeRequiresIndependentSource:
                timedCivilTime.historicalTimeRequiresIndependentSource,
              timezone: timedCivilTime.timezone,
              runtimeTzdbVersion: timedCivilTime.runtimeTzdbVersion,
              birthTimeAccuracy:
                parsed.data.birthTimeAccuracy ??
                (parsed.data.birthTime?.trim() ? "recalled" : "unknown"),
              birthTimeUncertaintyMinutes:
                parsed.data.birthTimeUncertaintyMinutes ?? null,
              birthTimeQualityRequiresReview:
                parsed.data.birthTimeAccuracy === "estimated" ||
                parsed.data.birthTimeAccuracy === "unknown",
            }
          : null;

      const astrologyData = await calculateVerifiedAstrology({
        birthDate: parsed.data.birthDate,
        birthTime: parsed.data.birthTime?.trim() || undefined,
        timezone: parsed.data.timezone,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
      });
      const updatedAt = new Date().toISOString();
      let humanDesignData: Record<string, unknown> | null = null;

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
          const civilTime = resolveCivilTimeStrict(
            parsed.data.birthDate,
            parsed.data.birthTime,
            parsed.data.timezone,
          );
          if (civilTime.status !== "valid" || !civilTime.utc) {
            throw new Error(`human_design_civil_time_${civilTime.status}`);
          }

          const inputTimestampUtc = civilTime.utc.toISOString();
          const utcOffsetMinutes = civilTime.candidateUtcOffsetsMinutes[0];
          if (!Number.isFinite(utcOffsetMinutes)) {
            throw new Error("human_design_timezone_offset_missing");
          }

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
            timeConversion: {
              timezone: civilTime.timezone,
              utcOffsetMinutes,
              conversionMethod: civilTime.conversionMethod,
              runtimeTzdbVersion: civilTime.runtimeTzdbVersion,
              provenanceStatus: civilTime.provenanceStatus,
              historicalTimeRequiresIndependentSource:
                civilTime.historicalTimeRequiresIndependentSource,
              birthTimeAccuracy:
                parsed.data.birthTimeAccuracy ??
                (parsed.data.birthTime?.trim() ? "recalled" : "unknown"),
              birthTimeUncertaintyMinutes:
                parsed.data.birthTimeUncertaintyMinutes ?? null,
              birthTimeQualityRequiresReview:
                parsed.data.birthTimeAccuracy === "estimated" ||
                parsed.data.birthTimeAccuracy === "unknown",
            },
          });
          humanDesignData = trust.status === "verified"
            ? {
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
                timeConversion: trust.timeConversion,
              }
            : {
                status: trust.status,
                candidate: trust.candidate,
                engine: trust.engine,
                source: trust.source,
                calculatedAt: trust.calculatedAt,
                inputTimestampUtc: trust.inputTimestampUtc,
                limitations: trust.limitations,
                timeConversion: trust.timeConversion,
              };
        }
      }

      return res.json({
        astrologyData: withVerifiedLegacyAliases(astrologyData, inputTimeProvenance),
        humanDesignData,
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
