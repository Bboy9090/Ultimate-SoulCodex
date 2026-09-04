import type { Express } from "express";
import { z } from "zod";
import {
  calculateVerifiedFullChartAstrology,
  type AstrologyData,
} from "../services/astrology-production";

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

/**
 * Minimal online evidence endpoint for a local-first profile.
 *
 * This route intentionally does not import storage, account/profile persistence,
 * or AI generation services. A user who asks only for astronomical verification
 * receives only the evidence snapshot needed to reconcile their local profile.
 *
 * Exact timed inputs also qualify Mercury through Pluto through the separately
 * approved NASA/JPL evidence contract. Their raw birth inputs are not persisted.
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
      const astrologyData = await calculateVerifiedFullChartAstrology({
        birthDate: parsed.data.birthDate,
        birthTime: parsed.data.birthTime?.trim() || undefined,
        timezone: parsed.data.timezone,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
      });
      const updatedAt = new Date().toISOString();

      return res.json({
        astrologyData: withVerifiedLegacyAliases(astrologyData),
        updatedAt,
        processing: {
          persistedProfile: false,
          aiGeneration: false,
          purpose: "astronomy_verification_only",
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
