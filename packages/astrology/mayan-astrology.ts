// Mayan / Tzolk'in-style birth identity is not production-governed.
// Do not derive a historical-calendar identity from an arbitrary modern anchor.
export function calculateMayanAstrology(birthDate: string): never {
  void birthDate;
  throw new Error('mayan_astrology_unavailable:no_governed_tzolkin_calendar_contract');
}
