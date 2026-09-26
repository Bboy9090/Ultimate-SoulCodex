// Arabic Parts / Lots are not production-governed yet.
// Production use requires a documented lot convention, sect determination,
// verified natal geometry, and explicit house/angle policy.
export function calculateArabicParts(
  ascendantLongitude: number,
  sunLongitude: number,
  moonLongitude: number,
  venusLongitude: number,
  jupiterLongitude: number,
  saturnLongitude: number,
  isDayBirth: boolean,
): never {
  void ascendantLongitude;
  void sunLongitude;
  void moonLongitude;
  void venusLongitude;
  void jupiterLongitude;
  void saturnLongitude;
  void isDayBirth;
  throw new Error('arabic_parts_unavailable:governed_lot_convention_required');
}
