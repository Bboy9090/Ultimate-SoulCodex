/**
 * Server-only, fail-closed Galactic Code input reconstruction.
 * This adapter is intentionally not a public route or persistence authority.
 * Caller-provided verification flags must never enter this function.
 */
import type { Profile } from "../../shared/schema";
import type { GalacticCodeInput } from "../../shared/galactic-code/types";
import { calculateNumerology } from "./numerology";
import { calculateVerifiedAstrology } from "./astrology-production";
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

export async function trustedGalacticInputFromProfile(
  profile: Profile,
  actor: ProfileActor,
): Promise<GalacticCodeInput | null> {
  if (!profileBelongsToActor(profile, actor)) return null;

  // Recompute deterministic numerology instead of trusting stored claims.
  const date = profile.birthDate instanceof Date ? profile.birthDate : new Date(profile.birthDate);
  if (!Number.isFinite(date.getTime())) return null;
  const birthDate = date.toISOString().slice(0, 10);
  const numerology = calculateNumerology(profile.fullBirthName || "", birthDate);
  if (numerology.status !== "resolved") return null;

  // Recompute against the current birth data; stored verification flags are untrusted.
  const latitude = profile.latitude == null ? undefined : Number(profile.latitude);
  const longitude = profile.longitude == null ? undefined : Number(profile.longitude);
  const astrology = await calculateVerifiedAstrology({
    birthDate,
    birthTime: profile.birthTime || undefined,
    timezone: profile.timezone || undefined,
    latitude: Number.isFinite(latitude) ? latitude : undefined,
    longitude: Number.isFinite(longitude) ? longitude : undefined,
  });
  const sun = verifiedSign(astrology.sun);
  const moon = verifiedSign(astrology.moon);
  const hasBirthTime = Boolean(profile.birthTime?.trim());
  const rising = hasBirthTime ? verifiedSign(astrology.rising) : undefined;

  // Stored HD is eligible only when its approved receipt is reproducible.
  // Do not propagate advanced HD fields or browser-authored evidence labels.
  // Human Design stays withheld until a receipt can be bound to this profile revision.
  const verifiedHd = false;
  const hd: Data = {};

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
