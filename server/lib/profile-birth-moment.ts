import { resolveCivilTimeStrict } from '../../packages/core/compute/civil-time.js';
import {
  calculateBirthMomentLunarEvidence,
  type BirthMomentLunarEvidence,
} from '../../packages/astrology/birth-moment.js';

type BirthProfileInput = {
  birthDate: Date | string | null | undefined;
  birthTime: string | null | undefined;
  timezone: string | null | undefined;
};

export type ProfileBirthMomentEvidence =
  | Exclude<BirthMomentLunarEvidence, { status: 'verified_calculation' }>
  | (Extract<BirthMomentLunarEvidence, { status: 'verified_calculation' }> & {
      astronomicalFacts: Extract<BirthMomentLunarEvidence, { status: 'verified_calculation' }>['astronomicalFacts'] & {
        civilTimeProvenance: {
          ianaTimezone: string;
          localTimestamp: string;
          conversionMethod: 'standard-iana-tzdb';
          runtimeTzdbVersion: string | null;
        };
      };
    })
  | {
      status: 'unavailable';
      reason: 'birth_date_invalid' | 'birth_timezone_unknown' | 'birth_time_unresolved';
      astronomicalFacts: null;
      symbolicInterpretation: null;
    };

function unavailable(reason: 'birth_date_invalid' | 'birth_timezone_unknown' | 'birth_time_unresolved'): ProfileBirthMomentEvidence {
  return { status: 'unavailable', reason, astronomicalFacts: null, symbolicInterpretation: null };
}

/**
 * Bridge stored profile civil-time inputs to the existing governed lunar
 * calculator. Never interpret a local clock in the server's own timezone.
 * Historical DST ambiguities and non-existent times remain unresolved.
 */
export function buildProfileBirthMomentEvidence(profile: BirthProfileInput): ProfileBirthMomentEvidence {
  if (!profile.birthTime?.trim()) {
    const missing = calculateBirthMomentLunarEvidence(null, false);
    // The core calculator currently returns unavailable for unknown time;
    // narrow its union before returning our stricter profile response type.
    if (missing.status !== 'unavailable') return unavailable('birth_time_unresolved');
    return missing;
  }
  if (!profile.timezone?.trim()) return unavailable('birth_timezone_unknown');

  const date = profile.birthDate instanceof Date
    ? (Number.isNaN(profile.birthDate.getTime()) ? '' : profile.birthDate.toISOString().slice(0, 10))
    : (typeof profile.birthDate === 'string' ? profile.birthDate.slice(0, 10) : '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return unavailable('birth_date_invalid');

  let resolution: ReturnType<typeof resolveCivilTimeStrict>;
  try {
    resolution = resolveCivilTimeStrict(date, profile.birthTime, profile.timezone.trim());
  } catch {
    return unavailable('birth_time_unresolved');
  }
  if (
    resolution.status !== 'valid' ||
    !resolution.utc ||
    resolution.candidateUtcOffsetsMinutes.length !== 1
  ) return unavailable('birth_time_unresolved');

  const offsetMinutes = resolution.candidateUtcOffsetsMinutes[0];
  if (!Number.isInteger(offsetMinutes) || Math.abs(offsetMinutes) > 1439) {
    // Historical sub-minute offsets cannot be expressed as ISO offset minutes.
    return unavailable('birth_time_unresolved');
  }

  const absoluteMinutes = Math.abs(offsetMinutes);
  const offset = (offsetMinutes < 0 ? '-' : '+') +
    String(Math.floor(absoluteMinutes / 60)).padStart(2, '0') + ':' +
    String(absoluteMinutes % 60).padStart(2, '0');
  try {
    const lunar = calculateBirthMomentLunarEvidence(resolution.localTimestamp + offset, true);
    if (lunar.status !== 'verified_calculation') return unavailable('birth_time_unresolved');
    // This IANA timezone belongs to the saved profile; unlike the numeric
    // offset, it is not a user-entered ISO offset. Keep their provenance distinct.
    return {
      ...lunar,
      astronomicalFacts: {
        ...lunar.astronomicalFacts,
        civilTimeProvenance: {
          ianaTimezone: resolution.timezone,
          localTimestamp: resolution.localTimestamp,
          conversionMethod: resolution.conversionMethod,
          runtimeTzdbVersion: resolution.runtimeTzdbVersion,
        },
      },
    };
  } catch {
    return unavailable('birth_time_unresolved');
  }
}
