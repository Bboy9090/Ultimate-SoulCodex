import type { ConfidenceLevel } from "./types.js";

export function deriveConfidenceLevel(dataPoints: number): ConfidenceLevel {
  if (dataPoints < 3) return "Very Low";
  if (dataPoints < 7) return "Low";
  if (dataPoints < 14) return "Moderate";
  if (dataPoints < 30) return "High";
  return "Very High";
}

export function getConfidenceThreshold(level: ConfidenceLevel): number {
  const thresholds: Record<ConfidenceLevel, number> = {
    "Very Low": 0,
    Low: 3,
    Moderate: 7,
    High: 14,
    "Very High": 30,
  };
  return thresholds[level];
}

export function getConfidenceDescription(level: ConfidenceLevel): string {
  const descriptions: Record<ConfidenceLevel, string> = {
    "Very Low": "Insufficient data to establish patterns",
    Low: "Early data collection — patterns emerging",
    Moderate: "Reasonable data foundation — patterns becoming clear",
    High: "Strong data foundation — patterns well-established",
    "Very High": "Comprehensive data — patterns very reliable",
  };
  return descriptions[level];
}

export function isConfidentEnough(dataPoints: number, requiredLevel: ConfidenceLevel = "Moderate"): boolean {
  const required = getConfidenceThreshold(requiredLevel);
  return dataPoints >= required;
}
