/**
 * Server-only, fail-closed Galactic Code input reconstruction.
 * This adapter is intentionally not a public route or persistence authority.
 * Caller-provided verification flags must never enter this function.
 */
import type { Profile } from "../../shared/schema";
import type { GalacticCodeInput } from "../../shared/galactic-code/types";
import { calculateNumerology } from "./numerology";
import { verifiedProfileHumanDesignSummary } from "./profile-human-design";
import { profileBelongsToActor, type ProfileActor } from "../lib/profile-ownership";

type Data = Record<string, any>;
const record = (value: unknown): Data =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as Data : {};

function verifiedSign(value: unknown): string | undefined {
  const placement = record(value);
  return placement.verificationStatus === "verified" &&
    placement.evidence && typeof placement.sign === "string" &&
    /^(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)$/i.test(placement.sign)
    ? placement.sign : undefined;
}

export function trustedGalacticInputFromProfile(
  profile: Profile,
  actor: ProfileActor,
): GalacticCodeInput | null {
  if (!profileBelongsToActor(profile, actor)) return null;

  // Recompute deterministic numerology instead of trusting stored claims.
  const date = profile.birthDate instanceof Date ? profile.birthDate : new Date(profile.birthDate);
  if (!Number.isFinite(date.getTime())) return null;
  const birthDate = date.toISOString().slice(0, 10);
  const numerology = calculateNumerology(profile.fullBirthName || "", birthDate);
  if (numerology.status !== "resolved") return null;

  const astrology = record(profile.astrologyData);
  const sun = verifiedSign(astrology.sun);
  const moon = verifiedSign(astrology.moon);
  const hasBirthTime = Boolean(profile.birthTime?.trim());
  const rising = hasBirthTime ? verifiedSign(astrology.rising) : undefined;

  // Stored HD is eligible only when its approved receipt is reproducible.
  // Do not propagate advanced HD fields or browser-authored evidence labels.
  const hd = record(profile.humanDesignData);
  const verifiedHd = hasBirthTime && verifiedProfileHumanDesignSummary(hd) !== null;

  return {
    profileId: profile.id,
    birthDate,
    astrology: {
      evidenceState: sun ? "verified" : "unavailable",
      coverage: sun ? "partial" : "missing",
      sun,
      moon,
      rising,
      mercury: verifiedSign(record(astrology.planets).mercury),
      venus: verifiedSign(record(astrology.planets).venus),
      mars: verifiedSign(record(astrology.planets).mars),
    },
    humanDesign: verifiedHd
      ? {
          evidenceState: "verified", coverage: "partial",
          type: hd.type, strategy: hd.strategy, authority: hd.authority, profile: hd.profile,
        }
      : { evidenceState: "unavailable", coverage: "missing" },
    numerology: {
      evidenceState: "deterministic",
      coverage: "partial",
      lifePath: numerology.lifePath,
      birthdayNumber: numerology.birthday,
    },
    // Assessment provenance has not been integrated. Stored traits are not proof.
    behavior: { evidenceState: "unavailable", traits: [] },
  };
}
