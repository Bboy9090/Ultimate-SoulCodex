import type { Express } from "express";
import { z } from "zod";
import {
  calculateVerifiedAstrology,
  type AstrologyData,
} from "../services/astrology-production";
import { calculateHumanDesign } from "@soulcodex/astrology";
import { fromZonedTime } from "date-fns-tz";
import {
  createHumanDesignTrustRecord,
  createVerifiedHumanDesignTrustRecord,
} from "../services/human-design-trust";

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

function withVerifiedLegacyAliases(astrologyData: AstrologyData) {
  return {
    ...astrologyData,
    sunSign: astrologyData.sun.verificationStatus === "verified" ? astrologyData.sun.sign : null,
    moonSign: astrologyData.moon.verificationStatus === "verified" ? astrologyData.moon.sign : null,
    risingSign: astrologyData.rising.verificationStatus === "verified" ? astrologyData.rising.sign : null,
  };
}

function calculateVerifiedHumanDesignSnapshot(input: {
  birthDate: string;
  birthTime?: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
}) {
  const hasExactInputs = Boolean(
    input.birthTime &&
      input.timezone &&
      input.latitude !== undefined &&
      input.longitude !== undefined,
  );

  if (!hasExactInputs) {
    return {
      status: "unresolved" as const,
      reason: "requires_exact_birth_time_and_coordinates",
      trust: createHumanDesignTrustRecord({ birthTimeKnown: false }),
    };
  }

  const result = calculateHumanDesign({
    name: "Local verified profile",
    birthDate: input.birthDate,
    birthTime: input.birthTime!,
    birthLocation: "Verification input",
    latitude: String(input.latitude),
    longitude: String(input.longitude),
    timezone: input.timezone,
  });

  const localTimestamp = `${input.birthDate}T${input.birthTime}:00`;
  const utc = fromZonedTime(localTimestamp, input.timezone);
  const inputTimestampUtc = utc.toISOString();

  if (result.status !== "resolved") {
    return {
      status: "unresolved" as const,
      reason: result.reason,
      trust: createHumanDesignTrustRecord({
        birthTimeKnown: true,
        inputTimestampUtc,
      }),
    };
  }

  const trust = createVerifiedHumanDesignTrustRecord({
    birthTimeKnown: true,
    inputTimestampUtc,
    candidate: {
      type: result.type,
      strategy: result.strategy,
      authority: result.authority,
      profile: result.profile,
    },
  });

  return {
    status: "verified" as const,
    type: result.type,
    strategy: result.strategy,
    authority: result.authority,
    profile: result.profile,
    definition: result.definition,
    centers: result.centers,
    channels: result.channels,
    activations: result.activations,
    activatedGates: result.activatedGates,
    trust,
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
      const astrologyData = await calculateVerifiedAstrology({
        birthDate: parsed.data.birthDate,
        birthTime: parsed.data.birthTime?.trim() || undefined,
        timezone: parsed.data.timezone,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
      });
      const humanDesignData = calculateVerifiedHumanDesignSnapshot({
        birthDate: parsed.data.birthDate,
        birthTime: parsed.data.birthTime?.trim() || undefined,
        timezone: parsed.data.timezone,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
      });
      const updatedAt = new Date().toISOString();

      return res.json({
        astrologyData: withVerifiedLegacyAliases(astrologyData),
        humanDesignData,
        updatedAt,
        processing: {
          persistedProfile: false,
          aiGeneration: false,
          purpose: "profile_evidence_verification_only",
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
