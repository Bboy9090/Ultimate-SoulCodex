// Ayurvedic constitution is not inferred from birth month, zodiac signs, or
// Enneagram. A production Prakruti/Vikruti result requires an explicit governed
// assessment rather than unrelated profile fields.
export function calculateAyurveda(
  birthDate: string,
  astrologyData?: unknown,
  personalityData?: unknown,
): never {
  void birthDate;
  void astrologyData;
  void personalityData;
  throw new Error('ayurveda_unavailable:governed_assessment_required');
}
