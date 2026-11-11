import * as Astronomy from 'astronomy-engine';
import { getMoonPhase } from './daily-context';

const Astro: typeof Astronomy = (Astronomy as any).default ?? Astronomy;

export const BIRTH_MOMENT_LUNAR_CONTRACT = 'SOUL-BIRTH-MOMENT-LUNAR-v1' as const;

export type BirthMomentLunarEvidence =
  | {
      status: 'unavailable';
      reason: 'birth_time_unknown';
      astronomicalFacts: null;
      symbolicInterpretation: null;
    }
  | {
      status: 'verified_calculation';
      astronomicalFacts: {
        utcInstant: string;
        timezoneProvenance: {
          kind: 'explicit_iso_offset';
          suppliedOffset: string;
        };
        moonPhase: string;
        illuminationPercent: number;
        elongationDegrees: number;
        calculationContract: typeof BIRTH_MOMENT_LUNAR_CONTRACT;
        source: 'astronomy-engine';
      };
      symbolicInterpretation: null;
    };

/**
 * A UTC instant without its originating zone cannot resolve a user's local
 * birth clock. Require an ISO offset supplied by the caller, never guess it.
 *
 * No unverified eclipse, lunar-age, house, Vedic, or identity claims are made.
 * The phase label and illumination reuse the existing daily-context authority.
 */
export function calculateBirthMomentLunarEvidence(
  birthTimestampWithOffset: string | null | undefined,
  birthTimeKnown: boolean,
): BirthMomentLunarEvidence {
  if (!birthTimeKnown || !birthTimestampWithOffset) {
    return {
      status: 'unavailable',
      reason: 'birth_time_unknown',
      astronomicalFacts: null,
      symbolicInterpretation: null,
    };
  }

  const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/i;
  const match = iso.exec(birthTimestampWithOffset);
  if (!match) throw new RangeError('birth_moment_explicit_timezone_offset_required');

  const suppliedOffset = match[1].toUpperCase();
  if (suppliedOffset !== 'Z') {
    const hours = Number(suppliedOffset.slice(1, 3));
    const minutes = Number(suppliedOffset.slice(4, 6));
    if (hours > 23 || minutes > 59) {
      throw new RangeError('birth_moment_timezone_offset_invalid');
    }
  }

  const instant = new Date(birthTimestampWithOffset);
  if (Number.isNaN(instant.getTime())) {
    throw new RangeError('birth_moment_instant_invalid');
  }

  const phase = getMoonPhase(instant);
  const elongationDegrees = Astro.MoonPhase(instant);
  if (
    !Number.isFinite(elongationDegrees) ||
    elongationDegrees < 0 ||
    elongationDegrees >= 360 ||
    !Number.isFinite(phase.percentage) ||
    phase.percentage < 0 ||
    phase.percentage > 100
  ) {
    throw new RangeError('birth_moment_astronomical_calculation_invalid');
  }
  return {
    status: 'verified_calculation',
    astronomicalFacts: {
      utcInstant: instant.toISOString(),
      timezoneProvenance: {
        kind: 'explicit_iso_offset',
        suppliedOffset,
      },
      moonPhase: phase.phase,
      illuminationPercent: phase.percentage,
      elongationDegrees,
      calculationContract: BIRTH_MOMENT_LUNAR_CONTRACT,
      source: 'astronomy-engine',
    },
    symbolicInterpretation: null,
  };
}
