// Vedic astrology / Nakshatras are not production-governed yet.
// Production requires a documented ayanamsa, sidereal frame, lunar-node policy,
// house convention, civil-time resolution, and independent verification.
export function calculateVedicAstrology(params: {
  birthDate: string;
  birthTime: string;
  timezone: string;
  latitude: number;
  longitude: number;
}): never {
  void params;
  throw new Error('vedic_astrology_unavailable:no_governed_sidereal_contract');
}
