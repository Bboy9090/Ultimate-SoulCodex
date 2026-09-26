import type { Signal } from "../types.js";

/**
 * Legacy stress-element identity inference is unavailable under the production
 * registry. Keep the compatibility function fail-closed so arbitrary
 * userInputs cannot manufacture a physiological or identity claim.
 */
export function elementSignals(_userInputs: any): Signal[] {
  return [];
}
