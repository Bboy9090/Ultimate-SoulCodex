/**
 * Server-only, fail-closed Galactic Code input reconstruction.
 * This adapter is intentionally not a public route or persistence authority.
 * Caller-provided verification flags must never enter this function.
 */
import type { Profile } from "../../shared/schema";
import type { GalacticCodeInput } from "../../shared/galactic-code/types";
import { calculateNumerology } from "./numerology";
import { calculateVerifiedAstrology } from "./astrology-production";
import { calculateProfileHumanDesign } from "./profile-human-design";
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
  // Reject rollover and out-of-range calendar dates before computing an identity.
  const year = date.getUTCFullYear();
  if (year < 1800 || year > new Date().getUTCFullYear()) return null;
  const birthDate = date.toISOString().slice(0, 10);
  const numerology = calculateNumerology(profile.fullBirthName || "", birthDate);
  if (numerology.status !== "resolved") return null;

  // Recompute against the current birth data; stored verification flags are untrusted.
  const latitude = profile.latitude == null ? undefined : Number(profile.latitude);
  const longitude = profile.longitude == null ? undefined : Number(profile.longitude);
  let astrology: Awaited<ReturnType<typeof calculateVerifiedAstrology>>;
  try {
    astrology = await calculateVerifiedAstrology({
    birthDate,
    birthTime: profile.birthTime || undefined,
    timezone: profile.timezone || undefined,
    latitude: Number.isFinite(latitude) && Math.abs(latitude) <= 90 ? latitude : undefined,
    longitude: Number.isFinite(longitude) && Math.abs(longitude) <= 180 ? longitude : undefined,
  });
  } catch {
    // Ephemeris or reference-service failure cannot promote old stored evidence.
    return null;
  }
  const sun = verifiedSign(astrology.sun);
  const moon = verifiedSign(astrology.moon);
  const hasBirthTime = Boolean(profile.birthTime?.trim());
  const rising = hasBirthTime ? verifiedSign(astrology.rising) : undefined;

  // Recompute HD from the same current birth fields as the profile, not
  // from persisted user-editable JSON or a stale verification receipt.
  // The existing calculator validates the civil instant and approved trust record.
  let hd: Data = {};
  if (hasBirthTime && profile.timezone && Number.isFinite(latitude) && Math.abs(latitude) <= 90 && Number.isFinite(longitude) && Math.abs(longitude) <= 180) {
    try {
      hd = record(calculateProfileHumanDesign({
        birthDate, birthTime: profile.birthTime!, timezone: profile.timezone,
        latitude, longitude,
      }));
    } catch {
      hd = {};
    }
  }
  const verifiedHd = hd.status === "verified" &&
    typeof hd.inputTimestampUtc === "string" &&
    typeof hd.verificationReceiptId === "string" &&
    typeof hd.type === "string" && typeof hd.strategy === "string" &&
    typeof hd.authority === "string" && typeof hd.profile === "string";

  // The current generator requires a verified Sun plus another qualified
  // system. Never synthesize a partial identity from a missing Sun.
  if (!sun) return null;

  return {
    profileId: profile.id,
    birthDate,
    astrology: {
      evidenceState: sun || moon || rising ? "verified" : "unavailable",
      coverage: sun || moon || rising ? "partial" : "missing",
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
