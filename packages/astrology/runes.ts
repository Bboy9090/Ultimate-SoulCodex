// Runes remain a symbolic practice outside the governed identity contract.
// Birth dates, names, and numerology values do not establish a historically
// grounded "birth rune" or spiritual identity.
export function calculateRunes(
  name: string,
  birthDate: string,
  lifePath: number,
): never {
  void name;
  void birthDate;
  void lifePath;
  throw new Error('runes_unavailable:no_governed_birth_rune_method');
}
