// Legacy asteroid astrology surface.
//
// Approximate asteroid longitudes and fabricated houses are not acceptable as
// natal placements. Chiron has its own qualified production path elsewhere;
// Ceres, Pallas, Juno, Vesta, and Black Moon Lilith remain unavailable here
// until each has a governed ephemeris/evidence contract.

export interface Asteroid {
  name: string;
  longitude: number;
  sign: string;
  house: number;
  degree: number;
  meaning: string;
  keywords: string[];
  interpretation: string;
}

export interface AsteroidData {
  chiron: Asteroid;
  ceres: Asteroid;
  pallas: Asteroid;
  juno: Asteroid;
  vesta: Asteroid;
  lilith: Asteroid;
  interpretation: {
    wounds: string;
    nurturing: string;
    wisdom: string;
    partnership: string;
    devotion: string;
    shadow: string;
    synthesis: string;
  };
}

export function calculateAsteroids(
  birthDate: string,
  birthTime: string,
  timezone: string,
  ascendantLongitude: number
): AsteroidData {
  void birthDate;
  void birthTime;
  void timezone;
  void ascendantLongitude;
  throw new Error('asteroid_placements_not_production_ready');
}
