/**
 * Compatibility entrypoint for legacy service imports.
 *
 * The authoritative astrology interpretation library lives in
 * packages/astrology/interpretations.ts. Keep this path as a re-export so
 * existing callers and tests do not silently receive an independently
 * maintained copy of 12-sign, planetary, house, or aspect interpretations.
 */
export * from "../packages/astrology/interpretations";
