/**
 * The natal wheel's frame of reference is the governed Equal House cusp.
 * An internal or conditional Ascendant candidate must never orient a verified chart.
 */
export function normalizedVerifiedLongitude(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return ((value % 360) + 360) % 360;
}

export function verifiedAscendantLongitude(
  houseCusps: ReadonlyArray<{ house: number; longitude: number | null }> | null | undefined,
): number | null {
  const houseOne = houseCusps?.find((cusp) => cusp.house === 1);
  return normalizedVerifiedLongitude(houseOne?.longitude);
}
