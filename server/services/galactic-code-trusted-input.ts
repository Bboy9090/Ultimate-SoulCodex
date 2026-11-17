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

function verifiedCenters(value: unknown): { defined: string[]; undefined: string[] } | undefined {
  const centers = record(value);
  const entries = Object.entries(centers).filter(([, center]) =>
    center !== null && typeof center === "object" && !Array.isArray(center),
  );
  if (entries.length === 0) return undefined;
  return {
    defined: entries.filter(([, center]) => record(center).defined === true).map(([name]) => name),
    undefined: entries.filter(([, center]) => record(center).defined !== true).map(([name]) => name),
  };
}

function verifiedChannels(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const values = value.flatMap((item) => {
    const channel = record(item);
    if (channel.defined !== true || !Array.isArray(channel.gates) || channel.gates.length !== 2) return [];
    const gates = channel.gates.map(Number);
    if (gates.some((gate) => !Number.isInteger(gate) || gate < 1 || gate > 64)) return [];
    return [gates.sort((a, b) => a - b).join("-")];
  });
  return values.length > 0 ? [...new Set(values)] : undefined;
}

function verifiedGateList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const values = value
    .filter((item) => typeof item === "number" || typeof item === "string")
    .map((item) => String(item).trim())
    .filter((item) => /^(?:[1-9]|[1-5]\d|6[0-4])$/.test(item));
  return values.length > 0 ? values : undefined;
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
  const validLatitude =
    typeof latitude === "number" && Number.isFinite(latitude) && Math.abs(latitude) <= 90
      ? latitude
      : undefined;
  const validLongitude =
    typeof longitude === "number" && Number.isFinite(longitude) && Math.abs(longitude) <= 180
      ? longitude
      : undefined;
  let astrology: Awaited<ReturnType<typeof calculateVerifiedAstrology>>;
  try {
    astrology = await calculateVerifiedAstrology({
    birthDate,
    birthTime: profile.birthTime || undefined,
    timezone: profile.timezone || undefined,
    latitude: validLatitude,
    longitude: validLongitude,
  });
  } catch {
    // Ephemeris or reference-service failure cannot promote old stored evidence.
    return null;
  }
  const sun = verifiedSign(astrology.sun);
  const moon = verifiedSign(astrology.moon);
  const hasBirthTime = Boolean(profile.birthTime?.trim());
  const rising = hasBirthTime ? verifiedSign(astrology.rising) : undefined;
  const mercury = verifiedSign(record(astrology.planets).mercury);
  const venus = verifiedSign(record(astrology.planets).venus);
  const mars = verifiedSign(record(astrology.planets).mars);

  // Recompute HD from the same current birth fields as the profile, not
  // from persisted user-editable JSON or a stale verification receipt.
  // The existing calculator validates the civil instant and approved trust record.
  let hd: Data = {};
  if (
    hasBirthTime &&
    profile.timezone &&
    typeof validLatitude === "number" &&
    typeof validLongitude === "number"
  ) {
    try {
      hd = record(calculateProfileHumanDesign({
        birthDate, birthTime: profile.birthTime!, timezone: profile.timezone,
        latitude: validLatitude, longitude: validLongitude,
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
  const hdCenters = verifiedHd ? verifiedCenters(hd.centers) : undefined;
  const hdChannels = verifiedHd ? verifiedChannels(hd.channels) : undefined;
  const hdGates = verifiedHd ? verifiedGateList(hd.activatedGates) : undefined;

  return {
    profileId: profile.id,
    birthDate,
    astrology: {
      evidenceState: sun || moon || rising || mercury || venus || mars ? "verified" : "unavailable",
      fieldEvidence: {
        sun: sun ? "verified" : "unavailable",
        moon: moon ? "verified" : "unavailable",
        rising: rising ? "verified" : "unavailable",
        mercury: mercury ? "verified" : "unavailable",
        venus: venus ? "verified" : "unavailable",
        mars: mars ? "verified" : "unavailable",
      },
      coverage: sun || moon || rising ? "partial" : "missing",
      sun,
      moon,
      rising,
      mercury,
      venus,
      mars,
    },
    humanDesign: verifiedHd
      ? {
          evidenceState: "verified",
          fieldEvidence: {
            type: "verified",
            strategy: "verified",
            authority: "verified",
            profile: "verified",
            definition: "unavailable",
            centers: hdCenters ? "verified" : "unavailable",
            channels: hdChannels ? "verified" : "unavailable",
            gates: hdGates ? "verified" : "unavailable",
            incarnationCross: "unavailable",
          },
          coverage: "partial",
          type: hd.type,
          strategy: hd.strategy,
          authority: hd.authority,
          profile: hd.profile,
          centers: hdCenters,
          channels: hdChannels,
          gates: hdGates,
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
