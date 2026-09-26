// Fixed-star interpretation is not production-governed yet.
// A valid implementation requires an epoch-aware/precessed star catalog,
// documented longitude frame, governed orb policy, and evidence contract.
export function calculateFixedStars(
  planets: Record<string, number>,
): never {
  void planets;
  throw new Error('fixed_stars_unavailable:epoch_aware_governed_catalog_required');
}
