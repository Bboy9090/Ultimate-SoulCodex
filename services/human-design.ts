/**
 * Server Human Design Adapter
 *
 * This module re-exports the canonical Human Design implementation from
 * the astrology package. It exists as a compatibility layer for existing
 * server routes and services while the canonical implementation lives at
 * packages/astrology/human-design.ts
 *
 * Phase 3: Canonical authority established at packages/astrology/human-design.ts
 * Server duplicate removed; this adapter ensures routes don't break during transition.
 *
 * TODO: Phase 3 will update routes.ts to import directly from packages/astrology
 * and this adapter can be deprecated.
 */

export {
  calculateHumanDesign,
  getHumanDesignInterpretation,
  type HumanDesignData,
} from '@soulcodex/astrology';
