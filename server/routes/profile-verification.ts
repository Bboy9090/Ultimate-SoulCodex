import type { Express } from "express";
import { z } from "zod";
import {
  calculateVerifiedAstrology,
  type AstrologyData,
} from "../services/astrology-production";
import { calculateHumanDesign } from "../../packages/astrology/human-design";
import { createVerifiedHumanDesignTrustRecord } from "../services/human-design-trust";
import { resolveCivilTimeStrict } from "@soulcodex/core";
import { verifyBirthTimezoneCoordinates } from "../lib/birth-location-consistency";
import { isValidClockTime, isValidDateOnly, isValidIanaTimezone } from "@shared/schema";

const numericCoordinate = z
  .union([z.number(), z.string().min(1)])
  .transform((value) => Number(value))
  .refine((value) => Number.isFinite(value), "Coordinate must be a finite number");

export const profileVerificationRequestSchema = z
  .object({
    birthDate: z
      .string()
      .refine(isValidDateOnly, "Birth date must be a real YYYY-MM-DD calendar date"),
    birthTime: z
      .union([
        z.literal(""),
        z.string().refine(isValidClockTime, "Birth time must use a real 24-hour HH:MM value"),
      ])
      .optional(),
    timezone: z
      .string()
      .min(1, "Timezone is required")
      .refine(isValidIanaTimezone, "Timezone must be a valid IANA timezone"),
    latitude: numericCoordinate
      .refine((value) => value >= -90 && value <= 90, "Latitude must be between -90 and 90")
      .optional(),
    longitude: numericCoordinate
      .refine((value) => value >= -180 && value <= 180, "Longitude must be between -180 and 180")
      .optional(),
  })
  .strict()
  .superRefine((data, context) => {
    const latitudePresent = data.latitude !== undefined;
    const longitudePresent = data.longitude !== undefined;
    if (latitudePresent !== longitudePresent) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: latitudePresent ? ["longitude"] : ["latitude"],
        message: "Latitude and longitude must be supplied together",
      });
    }
  });

function withVerifiedLegacyAliases(astrologyData: AstrologyData) {
  return {
    ...astrologyData,
    sunSign: astrologyData.sun.verificationStatus === "verified" ? astrologyData.sun.sign : null,
    moonSign: astrologyData.moon.verificationStatus === "verified" ? astrologyData.moon.sign : null,
    risingSign: astrologyData.rising.verificationStatus === "verified" ? astrologyData.rising.sign : null,
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
      if (
        parsed.data.latitude !== undefined &&
        parsed.data.longitude !== undefined
      ) {
        const locationConsistency = verifyBirthTimezoneCoordinates({
          latitude: parsed.data.latitude,
          longitude: parsed.data.longitude,
          timezone: parsed.data.timezone,
        });
        if (locationConsistency.status !== "matched") {
          return res.status(422).json({
            message:
              locationConsistency.reason === "timezone_coordinate_mismatch"
                ? "Birthplace timezone does not match the supplied coordinates."
                : "Birthplace timezone and coordinates could not be verified safely.",
            code: locationConsistency.reason,
            timezone: locationConsistency.timezone,
            timezoneCandidates: locationConsistency.candidates,
          });
        }
      }

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
            timeConversion: trust.timeConversion,
          };
        }
      }

      const verifiedAstrologyBodies =
        astrologyData.verification?.verifiedBodies ?? [];
      const humanDesignVerified = humanDesignData?.status === "verified";
      const verifiedEvidenceAvailable =
        verifiedAstrologyBodies.length > 0 || humanDesignVerified;

      return res.json({
        astrologyData: withVerifiedLegacyAliases(astrologyData),
        humanDesignData,
        updatedAt,
        evidenceSummary: {
          status: verifiedEvidenceAvailable
            ? "verified_evidence_available"
            : "unresolved",
          verifiedAstrologyBodies,
          humanDesignVerified,
        },
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
