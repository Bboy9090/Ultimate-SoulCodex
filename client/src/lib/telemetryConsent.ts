export type TelemetryConsentState = "unset" | "granted" | "denied";

export type TelemetryPolicyInput = {
  analyticsEnabled: boolean;
  admobEnabled: boolean;
  premiumEntitled: boolean;
};

export type TelemetryPolicySnapshot = {
  consent: TelemetryConsentState;
  analyticsAllowed: boolean;
  adsAllowed: boolean;
  blockers: string[];
};

export const TELEMETRY_CONSENT_STORAGE_KEY = "soulcodex.telemetry-consent.v1";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function isTelemetryConsentState(value: unknown): value is TelemetryConsentState {
  return value === "unset" || value === "granted" || value === "denied";
}

export function readPersistedTelemetryConsent(storage: StorageLike): TelemetryConsentState {
  try {
    const raw = storage.getItem(TELEMETRY_CONSENT_STORAGE_KEY);
    if (!raw) return "unset";

    const parsed = JSON.parse(raw) as { state?: unknown };
    return isTelemetryConsentState(parsed?.state) ? parsed.state : "unset";
  } catch {
    return "unset";
  }
}

export function persistTelemetryConsent(
  storage: StorageLike,
  state: Exclude<TelemetryConsentState, "unset">,
): void {
  storage.setItem(
    TELEMETRY_CONSENT_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      state,
    }),
  );
}

export function clearTelemetryConsent(storage: StorageLike): void {
  storage.removeItem(TELEMETRY_CONSENT_STORAGE_KEY);
}

export function resolveTelemetryPolicy(
  consent: TelemetryConsentState,
  input: TelemetryPolicyInput,
): TelemetryPolicySnapshot {
  const blockers: string[] = [];

  if (consent !== "granted") {
    blockers.push(
      consent === "denied"
        ? "telemetry consent denied"
        : "telemetry consent not yet granted",
    );
  }

  const analyticsAllowed = input.analyticsEnabled && consent === "granted";
  if (input.analyticsEnabled && !analyticsAllowed) {
    blockers.push("analytics collection blocked by consent policy");
  }

  const adsAllowed =
    input.admobEnabled &&
    consent === "granted" &&
    !input.premiumEntitled;

  if (input.admobEnabled && input.premiumEntitled) {
    blockers.push("ads suppressed by premium entitlement");
  } else if (input.admobEnabled && !adsAllowed) {
    blockers.push("ad serving blocked by consent policy");
  }

  return {
    consent,
    analyticsAllowed,
    adsAllowed,
    blockers,
  };
}

export function resolvePersistedTelemetryPolicy(
  storage: StorageLike,
  input: TelemetryPolicyInput,
): TelemetryPolicySnapshot {
  return resolveTelemetryPolicy(readPersistedTelemetryConsent(storage), input);
}
