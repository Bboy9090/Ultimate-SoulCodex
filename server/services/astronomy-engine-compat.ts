// Canonical astronomy-engine compatibility adapter
// Handles both ESM and CJS export patterns across different environments
// @see https://github.com/cosinekitty/astronomy/issues (ESM export issues)

import * as AstronomyModule from "astronomy-engine";

// Extract the actual API whether it's a default export or namespace
const AstronomyEngine =
  (AstronomyModule as any).default ?? AstronomyModule;

// Export all key functions and types used by server-side astrology
export const {
  Body,
  Ecliptic,
  GeoVector,
  SiderealTime,
} = AstronomyEngine;

export type { FlexibleDateTime, Vector } from "astronomy-engine";
