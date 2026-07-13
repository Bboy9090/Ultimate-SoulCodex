/**
 * Galactic Code Fingerprint
 *
 * Deterministic SHA-256 fingerprint generation.
 * Input: normalized astrology, human design, numerology, behavioral traits
 * Output: unique fingerprint and short code
 */

import crypto from 'node:crypto';

export interface FingerprintResult {
  fingerprint: string;
  shortCode: string;
  uniquenessKey: string;
}

export function createGalacticFingerprint(normalizedInput: unknown): FingerprintResult {
  const jsonString = JSON.stringify(normalizedInput);

  const fingerprint = crypto
    .createHash('sha256')
    .update(jsonString)
    .digest('hex');

  const shortCode = createShortCode(fingerprint);
  const uniquenessKey = fingerprint.substring(0, 16);

  return {
    fingerprint,
    shortCode,
    uniquenessKey,
  };
}

function createShortCode(fingerprint: string): string {
  const part1 = fingerprint.substring(0, 4).toUpperCase();
  const part2 = fingerprint.substring(8, 12).toUpperCase();
  const part3 = fingerprint.substring(16, 20).toUpperCase();

  return `SCX-GC-${part1}-${part2}-${part3}`;
}
