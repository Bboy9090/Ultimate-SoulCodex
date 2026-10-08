import { isCoordinateWithinRange, isValidIanaTimezone } from "@shared/schema";
import { hasVerifiedHumanDesignTrust } from "./humanDesignTrust";

type ProfileInputs = {
  birthDate?: string;
  birthTime?: string | null;
  birthTimeStatus?: string;
  timezone?: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  humanDesignData?: Record<string, unknown> | null;
  humanDesignVerificationDiagnostic?: { status: string; reason?: string };
};

/** Separate input completeness from successful calculation and trusted verification. */
export function humanDesignAvailability(profile: ProfileInputs) {
  if (hasVerifiedHumanDesignTrust(profile.humanDesignData)) {
    return { state: "verified" as const, message: "Human Design core is verified.", missing: [] };
  }
  if (profile.humanDesignData?.status === "range_analyzed") {
    return { state: "range_analyzed" as const, message: "Human Design was analyzed across the birth day. Stable components are available; changing components require an exact birth time.", missing: [] };
  }
  const missing: string[] = [];
  const date = typeof profile.birthDate === "string" ? profile.birthDate : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date) missing.push("a valid birth date");
  if (profile.birthTimeStatus === "unknown" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(profile.birthTime ?? "")) {
    missing.push("an exact birth time");
  }
  if (!isValidIanaTimezone(profile.timezone ?? "")) missing.push("the birthplace timezone");
  if (!isCoordinateWithinRange(profile.latitude, -90, 90) ||
    !isCoordinateWithinRange(profile.longitude, -180, 180)) missing.push("resolved birthplace coordinates");
  if (missing.length) {
    return { state: "missing_inputs" as const, message: `Human Design needs ${missing.join(", ")} for the current calculation service.`, missing };
  }
  const reason = profile.humanDesignVerificationDiagnostic?.reason ?? profile.humanDesignData?.reason;
  const failureDetails: Record<string, string> = {
    nonexistent_local_time: "That local clock time falls in a daylight-saving gap; check the recorded birth time.",
    timezone_resolution_failed: "The service could not resolve the local birth time into an exact instant.",
    invalid_timezone: "The calculation service rejected the supplied timezone.",
    verification_failed: "The independent verification check did not pass.",
    calculation_failed: "The calculation service could not finish this chart.",
  };
  const detail = typeof reason === "string" ? failureDetails[reason] : undefined;
  return {
    state: "pending_verification" as const,
    message: `Your birth date, time, and resolved birthplace are complete. Human Design calculation or verification has not completed. ${detail ?? "Retry profile-system verification; you do not need to re-enter your birth information."}`,
    missing,
  };
}
