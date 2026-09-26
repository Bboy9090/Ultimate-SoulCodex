/**
 * Soul Codex progression/return chart contract.
 *
 * These features are intentionally unavailable in production until they are
 * backed by qualified ephemeris, house, angle, location, and evidence logic.
 * Do not place approximate chart math behind these exports.
 */

import type { Profile } from '../shared/schema';

export interface ReturnChart {
  type: 'solar' | 'lunar' | 'venus' | 'mars' | 'jupiter' | 'saturn';
  date: Date;
  chart: {
    sun: { sign: string; degree: number; house: number };
    moon: { sign: string; degree: number; house: number };
    ascendant: { sign: string; degree: number };
    midheaven: { sign: string; degree: number };
    planets: Record<string, { sign: string; degree: number; house: number }>;
    houses: Array<{ sign: string; degree: number }>;
  };
  themes: string[];
  interpretation: string;
  yearAhead?: string;
}

export interface Progression {
  type: 'secondary' | 'tertiary' | 'solar-arc';
  date: Date;
  progressedPlanets: Record<string, { sign: string; degree: number }>;
  aspects: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
    interpretation: string;
  }>;
  themes: string[];
  interpretation: string;
}

function progressionFeatureUnavailable(feature: string): never {
  throw new Error(`${feature}_not_production_ready`);
}

export function calculateSolarReturn(
  profile: Profile,
  returnYear: number,
): ReturnChart {
  void profile;
  void returnYear;
  return progressionFeatureUnavailable('solar_return');
}

export function calculateLunarReturn(
  profile: Profile,
  returnDate: Date,
): ReturnChart {
  void profile;
  void returnDate;
  return progressionFeatureUnavailable('lunar_return');
}

export function calculateSecondaryProgressions(
  profile: Profile,
  currentDate: Date,
): Progression {
  void profile;
  void currentDate;
  return progressionFeatureUnavailable('secondary_progressions');
}
