import type { TimelineConfidenceLevel } from "./types.js";

export function deriveTimelineConfidence(
  sampleSize: number,
): TimelineConfidenceLevel {
  if (sampleSize < 7) return "Very Low";
  if (sampleSize < 14) return "Low";
  if (sampleSize < 30) return "Moderate";
  if (sampleSize < 60) return "High";
  return "Very High";
}

export function getTimelineConfidenceThreshold(
  level: TimelineConfidenceLevel,
): number {
  const thresholds: Record<TimelineConfidenceLevel, number> = {
    "Very Low": 0,
    Low: 7,
    Moderate: 14,
    High: 30,
    "Very High": 60,
  };
  return thresholds[level];
}

export function getTimelineConfidenceDescription(
  level: TimelineConfidenceLevel,
): string {
  const descriptions: Record<TimelineConfidenceLevel, string> = {
    "Very Low": "Very limited observation window",
    Low: "Early observation window",
    Moderate: "Growing observation window",
    High: "Broad observation window",
    "Very High":
      "Extended observation window — larger sample size improves coverage, not proof or predictive accuracy",
  };
  return descriptions[level];
}

export function isTimelineConfident(
  sampleSize: number,
  requiredLevel: TimelineConfidenceLevel = "Low",
): boolean {
  const required = getTimelineConfidenceThreshold(requiredLevel);
  return sampleSize >= required;
}

export function canShowTimelineIntelligence(sampleSize: number): boolean {
  return sampleSize >= 7;
}
