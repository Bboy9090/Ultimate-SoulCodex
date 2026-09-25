import * as Astronomy from 'astronomy-engine';
import { resolveCivilTimeStrict } from './civil-time.js';

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export type OfflineSunResolution =
  | {
      status: 'resolved';
      sign: (typeof SIGNS)[number];
      longitudeDegrees: number | null;
      policy: 'exact-local-time' | 'stable-across-local-day';
      inputTimestamps: string[];
      engine: 'astronomy-engine@2.1.19';
      verificationStatus: 'calculated';
    }
  | {
      status: 'unresolved';
      sign: null;
      longitudeDegrees: null;
      policy: 'unresolved';
      inputTimestamps: string[];
      engine: 'astronomy-engine@2.1.19';
      verificationStatus: 'unavailable';
      reason:
        | 'invalid_or_ambiguous_local_time'
        | 'local_day_boundary_unresolvable'
        | 'sun_sign_changes_within_local_day'
        | 'ephemeris_calculation_failed';
    };

function normalizeLongitude(value: number): number {
  return ((value % 360) + 360) % 360;
}

function sunAt(timestamp: Date) {
  const vector = Astronomy.GeoVector(Astronomy.Body.Sun, timestamp, true);
  const longitudeDegrees = normalizeLongitude(Astronomy.Ecliptic(vector).elon);
  const sign = SIGNS[Math.floor(longitudeDegrees / 30)];
  return { sign, longitudeDegrees };
}

function stableLocalDay(
  birthDate: string,
  timezone: string,
): OfflineSunResolution {
  const start = resolveCivilTimeStrict(birthDate, '00:00', timezone);
  const end = resolveCivilTimeStrict(birthDate, '23:59', timezone);

  if (
    start.status !== 'valid' ||
    !start.utc ||
    end.status !== 'valid' ||
    !end.utc
  ) {
    return {
      status: 'unresolved',
      sign: null,
      longitudeDegrees: null,
      policy: 'unresolved',
      inputTimestamps: [
        ...(start.candidates ?? []),
        ...(end.candidates ?? []),
      ],
      engine: 'astronomy-engine@2.1.19',
      verificationStatus: 'unavailable',
      reason: 'local_day_boundary_unresolvable',
    };
  }

  try {
    const first = sunAt(start.utc);
    const last = sunAt(end.utc);
    const inputTimestamps = [start.utc.toISOString(), end.utc.toISOString()];

    if (first.sign !== last.sign) {
      return {
        status: 'unresolved',
        sign: null,
        longitudeDegrees: null,
        policy: 'unresolved',
        inputTimestamps,
        engine: 'astronomy-engine@2.1.19',
        verificationStatus: 'unavailable',
        reason: 'sun_sign_changes_within_local_day',
      };
    }

    // The sign is stable across the entire local day, but without an exact
    // birth time no single longitude is justified. Preserve the sign and
    // deliberately withhold degree-level precision.
    return {
      status: 'resolved',
      sign: first.sign,
      longitudeDegrees: null,
      policy: 'stable-across-local-day',
      inputTimestamps,
      engine: 'astronomy-engine@2.1.19',
      verificationStatus: 'calculated',
    };
  } catch {
    return {
      status: 'unresolved',
      sign: null,
      longitudeDegrees: null,
      policy: 'unresolved',
      inputTimestamps: [start.utc.toISOString(), end.utc.toISOString()],
      engine: 'astronomy-engine@2.1.19',
      verificationStatus: 'unavailable',
      reason: 'ephemeris_calculation_failed',
    };
  }
}

/**
 * Resolve a tropical geocentric Sun sign locally without fixed date cutoffs.
 *
 * Exact birth time is used when it maps uniquely through the supplied IANA
 * timezone. If time is missing or civil-time resolution is ambiguous, the Sun
 * sign is only returned when it remains unchanged across the full local day.
 */
export function resolveOfflineSun(
  birthDate: string,
  birthTime: string | null | undefined,
  timezone: string,
): OfflineSunResolution {
  const trimmedTime = birthTime?.trim();
  if (!trimmedTime) return stableLocalDay(birthDate, timezone);

  const resolved = resolveCivilTimeStrict(birthDate, trimmedTime, timezone);
  if (resolved.status !== 'valid' || !resolved.utc) {
    // A DST ambiguity does not necessarily make the Sun sign ambiguous. Prove
    // stability across the local day instead of inventing one UTC occurrence.
    return stableLocalDay(birthDate, timezone);
  }

  try {
    const placement = sunAt(resolved.utc);
    return {
      status: 'resolved',
      sign: placement.sign,
      longitudeDegrees: placement.longitudeDegrees,
      policy: 'exact-local-time',
      inputTimestamps: [resolved.utc.toISOString()],
      engine: 'astronomy-engine@2.1.19',
      verificationStatus: 'calculated',
    };
  } catch {
    return {
      status: 'unresolved',
      sign: null,
      longitudeDegrees: null,
      policy: 'unresolved',
      inputTimestamps: [resolved.utc.toISOString()],
      engine: 'astronomy-engine@2.1.19',
      verificationStatus: 'unavailable',
      reason: 'ephemeris_calculation_failed',
    };
  }
}
