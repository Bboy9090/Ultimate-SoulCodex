export type VerificationAttempt = "idle" | "running" | "complete" | "partial" | "deferred";

export function verificationOutcome(needsOnlineVerificationAfterResponse: boolean): VerificationAttempt {
  return needsOnlineVerificationAfterResponse ? "partial" : "complete";
}

export function shouldOfferVerification(
  needsOnlineVerification: boolean,
  _attempt: VerificationAttempt,
): boolean {
  return needsOnlineVerification;
}
