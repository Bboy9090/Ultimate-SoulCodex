// Chinese astrology / BaZi is not production-governed yet.
// A valid Four Pillars engine requires the correct calendrical boundary,
// solar terms, stems/branches, local civil time, and a documented convention.
export function calculateChineseAstrology(birthDate: string): never {
  void birthDate;
  throw new Error('chinese_astrology_unavailable:no_governed_bazi_four_pillars_engine');
}
