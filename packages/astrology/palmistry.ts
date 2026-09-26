// Palmistry requires actual palm evidence.
// Birth dates and numerology cannot establish hand dominance, palm lines,
// mounts, marks, or other palm observations.
export function generatePalmReading(
  birthDate: string,
  lifePath: number,
): never {
  void birthDate;
  void lifePath;
  throw new Error('palmistry_unavailable:palm_observation_or_image_required');
}
