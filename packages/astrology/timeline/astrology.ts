import type { PhaseSignal } from "./types";

/**
 * Timeline astrology signals are intentionally excluded until they are derived
 * from verified planetary longitudes/aspects for the requested date.
 *
 * Age bands alone are not evidence that a Saturn return, Jupiter return,
 * nodal return/reversal, or Uranus opposition is actually active. Returning
 * those labels from age heuristics would overstate astronomical precision.
 */
export function getAstrologySignals(
  birthDate: string,
  currentDate: Date,
  fullChart?: unknown
): PhaseSignal[] {
  void birthDate;
  void currentDate;
  void fullChart;
  return [];
}
