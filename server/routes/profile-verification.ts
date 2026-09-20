import type { Express } from "express";
import { z } from "zod";
import {
  calculateVerifiedAstrology,
  type AstrologyData,
} from "../services/astrology-production";
import { calculateHumanDesign } from "@soulcodex/astrology";
import {
  APPROVED_HUMAN_DESIGN_CORE_VERIFICATION,
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

function verifiedHumanDesignCore(input: {
  birthDate: string;
  birthTime?: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
  inputTimestampUtc?: string | null;
}) {
  if (
    !input.birthTime ||
    input.latitude === undefined ||
    input.longitude === undefined ||
    !input.inputTimestampUtc
  ) {
    return null;
  }

  const result = calculateHumanDesign({
    name: "Verification profile",
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    birthLocation: "Verified coordinates",
    timezone: input.timezone,
    latitude: String(input.latitude),
    longitude: String(input.longitude),
  });

  if (result.status !== "resolved") return null;

  const definedCenters = Object.entries(result.centers)
    .filter(([, center]) => center.defined)
    .map(([name]) => name)
    .sort();

  const definedChannels = result.channels
    .filter((channel) => channel.defined)
    .map((channel) => [...channel.gates].sort((a, b) => a - b))
    .sort((left, right) =>
      left[0] - right[0] || left[1] - right[1],
    );

  const trust = createVerifiedHumanDesignTrustRecord({
    birthTimeKnown: true,
    inputTimestampUtc: input.inputTimestampUtc,
    candidate: {
      type: result.type,
      strategy: result.strategy,
      authority: result.authority,
      profile: result.profile,
    },
  });

  if (trust.status !== "verified") return null;

  return {
    status: "verified" as const,
    policyId: APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.policyId,
    type: result.type,
    strategy: result.strategy,
    authority: result.authority,
    profile: result.profile,
    definedCenters,
    definedChannels,
    activations: result.activations,
    trust,
    limitations: [
      "Verified core excludes Variables and Incarnation Cross naming.",
      "Human Design interpretation remains a symbolic framework rather than scientific personality measurement.",
    ],
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
      const updatedAt = new Date().toISOString();
      const humanDesignData = verifiedHumanDesignCore({
        birthDate: parsed.data.birthDate,
        birthTime: parsed.data.birthTime?.trim() || undefined,
        timezone: parsed.data.timezone,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        inputTimestampUtc:
          astrologyData.moon.internalCandidate?.inputTimestamp ?? null,
      });

      return res.json({
        astrologyData: withVerifiedLegacyAliases(astrologyData),
        humanDesignData,
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
