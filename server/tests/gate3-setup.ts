/**
 * Gate 3 Test Setup & ESM/CJS Compatibility Bridge
 *
 * This module provides compatibility layer for astronomy-engine ESM imports
 * which have known issues with direct named imports in Node.js ESM mode.
 */

import * as astronomyEngine from "astronomy-engine";

// Workaround: Use namespace import to access exports that have ESM compatibility issues
export const Body = astronomyEngine.Body;
export const Ecliptic = astronomyEngine.Ecliptic;
export const GeoVector = astronomyEngine.GeoVector;

// Re-export other necessary astronomy-engine types and functions
export type { AstroTime } from "astronomy-engine";
