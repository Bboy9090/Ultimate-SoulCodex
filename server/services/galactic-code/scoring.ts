/**
 * Galactic Code Axis Scoring
 *
 * Score 10 axes (0-100) based on weighted evidence from:
 * - Astrology (Sun, Moon, Rising, Mercury, Venus, Mars, aspects, elements, houses)
 * - Human Design (Type, Authority, Profile, centers, channels, cross)
 * - Numerology (Life Path, Expression, Birthday, etc.)
 * - Behavior (traits, decision style, stress pattern, etc.)
 */

import type { NormalizedGalacticInput, GalacticAxisScore } from '../../../shared/galactic-code/types';

export const AXIS_DEFINITIONS = {
  observer: { label: 'Observer', key: 'observer' },
  builder: { label: 'Builder', key: 'builder' },
  protector: { label: 'Protector', key: 'protector' },
  initiator: { label: 'Initiator', key: 'initiator' },
  connector: { label: 'Connector', key: 'connector' },
  teacher: { label: 'Teacher', key: 'teacher' },
  strategist: { label: 'Strategist', key: 'strategist' },
  transformer: { label: 'Transformer', key: 'transformer' },
  explorer: { label: 'Explorer', key: 'explorer' },
  stabilizer: { label: 'Stabilizer', key: 'stabilizer' },
} as const;

type AxisKey = keyof typeof AXIS_DEFINITIONS;

interface AxisScore {
  score: number;
  evidence: string[];
}

const ASTROLOGY_WEIGHTS = {
  sun: 4,
  moon: 5,
  rising: 5,
  mercury: 4,
  venus: 3,
  mars: 4,
  majorAspect: 2,
  houseEmphasis: 3,
  dominantElement: 3,
};

const HD_WEIGHTS = {
  type: 6,
  authority: 7,
  profile: 6,
  definedCenter: 2,
  channel: 3,
  incarnationCross: 5,
};

const NUMEROLOGY_WEIGHTS = {
  lifePath: 6,
  expression: 5,
  soulUrge: 4,
  birthdayNumber: 3,
  maturity: 3,
};

const BEHAVIOR_WEIGHTS = {
  trait: 4,
  decisionStyle: 5,
  stressPattern: 4,
  relationalPattern: 4,
  builderMode: 5,
  moralCompass: 3,
};

const SIGN_TO_AXES: Record<string, Record<AxisKey, number>> = {
  aries: { initiator: 9, protector: 6, explorer: 7, builder: 5, strategist: 5, observer: 3, connector: 3, teacher: 3, transformer: 4, stabilizer: 2 },
  taurus: { stabilizer: 9, builder: 8, observer: 6, protector: 5, strategist: 4, connector: 3, teacher: 3, initiator: 2, transformer: 2, explorer: 3 },
  gemini: { connector: 9, teacher: 8, observer: 7, strategist: 5, initiator: 4, explorer: 5, builder: 3, protector: 2, transformer: 3, stabilizer: 2 },
  cancer: { protector: 9, connector: 8, stabilizer: 7, observer: 6, builder: 5, teacher: 4, transformer: 4, strategist: 3, initiator: 2, explorer: 2 },
  leo: { initiator: 9, builder: 8, teacher: 7, protector: 5, strategist: 6, observer: 4, connector: 5, transformer: 4, explorer: 4, stabilizer: 3 },
  virgo: { observer: 8, builder: 7, strategist: 7, stabilizer: 5, teacher: 4, connector: 4, protector: 4, transformer: 3, initiator: 2, explorer: 2 },
  libra: { connector: 9, teacher: 8, strategist: 7, observer: 6, builder: 4, transformer: 5, protector: 3, initiator: 3, explorer: 2, stabilizer: 2 },
  scorpio: { observer: 7, transformer: 9, protector: 6, strategist: 6, initiator: 5, builder: 4, teacher: 4, connector: 3, explorer: 3, stabilizer: 2 },
  sagittarius: { explorer: 9, teacher: 8, initiator: 7, strategist: 6, connector: 5, builder: 4, observer: 4, transformer: 4, protector: 3, stabilizer: 2 },
  capricorn: { strategist: 9, builder: 8, observer: 7, stabilizer: 6, protector: 5, initiator: 3, connector: 3, teacher: 3, transformer: 2, explorer: 2 },
  aquarius: { strategist: 9, transformer: 8, initiator: 7, observer: 6, teacher: 5, connector: 5, explorer: 4, protector: 2, builder: 2, stabilizer: 2 },
  pisces: { transformer: 9, teacher: 8, connector: 7, observer: 6, protector: 5, strategist: 4, stabilizer: 4, builder: 3, initiator: 2, explorer: 2 },
};

const HD_TYPE_TO_AXES: Record<string, Record<AxisKey, number>> = {
  manifestor: { initiator: 10, strategist: 7, protector: 6, builder: 5, observer: 4, explorer: 4, teacher: 3, connector: 3, transformer: 3, stabilizer: 2 },
  generator: { builder: 10, connector: 7, stabilizer: 6, observer: 5, teacher: 4, protector: 4, strategist: 3, transformer: 3, initiator: 2, explorer: 2 },
  'manifesting generator': { builder: 9, initiator: 7, explorer: 7, connector: 5, observer: 4, strategist: 4, protector: 3, teacher: 3, transformer: 3, stabilizer: 2 },
  reflector: { observer: 10, connector: 5, transformer: 5, teacher: 4, strategist: 4, protector: 3, builder: 3, initiator: 2, explorer: 2, stabilizer: 2 },
};

const LIFE_PATH_TO_AXES: Record<number, Record<AxisKey, number>> = {
  1: { initiator: 9, builder: 8, strategist: 7, explorer: 5, protector: 4, observer: 3, connector: 2, teacher: 2, transformer: 2, stabilizer: 2 },
  2: { connector: 9, teacher: 8, observer: 7, protector: 6, strategist: 5, builder: 4, transformer: 4, stabilizer: 3, initiator: 2, explorer: 2 },
  3: { teacher: 9, connector: 8, transformer: 7, initiator: 5, builder: 5, explorer: 4, observer: 3, strategist: 3, protector: 2, stabilizer: 2 },
  4: { builder: 9, strategist: 8, observer: 7, stabilizer: 6, protector: 5, connector: 3, initiator: 2, explorer: 2, teacher: 2, transformer: 2 },
  5: { explorer: 9, initiator: 6, connector: 5, teacher: 4, transformer: 4, strategist: 4, builder: 3, observer: 3, protector: 2, stabilizer: 2 },
  6: { teacher: 9, protector: 8, connector: 7, stabilizer: 6, observer: 5, builder: 4, strategist: 3, initiator: 2, explorer: 2, transformer: 2 },
  7: { observer: 9, strategist: 8, transformer: 6, teacher: 5, connector: 5, protector: 4, initiator: 2, explorer: 2, builder: 2, stabilizer: 2 },
  8: { builder: 9, strategist: 8, initiator: 6, protector: 5, observer: 4, transformer: 3, explorer: 3, teacher: 2, connector: 2, stabilizer: 2 },
  9: { teacher: 8, transformer: 7, connector: 6, protector: 6, observer: 5, initiator: 3, strategist: 3, builder: 2, explorer: 2, stabilizer: 2 },
  11: { transformer: 9, initiator: 8, teacher: 7, strategist: 6, connector: 5, observer: 5, protector: 3, builder: 3, explorer: 3, stabilizer: 2 },
  22: { builder: 9, strategist: 8, initiator: 6, protector: 6, observer: 5, transformer: 4, explorer: 3, teacher: 2, connector: 2, stabilizer: 2 },
  33: { teacher: 10, transformer: 9, connector: 8, protector: 7, observer: 6, strategist: 4, builder: 3, initiator: 2, explorer: 2, stabilizer: 2 },
};

export function scoreAxes(normalized: NormalizedGalacticInput): GalacticAxisScore[] {
  const axes: Record<AxisKey, AxisScore> = {
    observer: { score: 0, evidence: [] },
    builder: { score: 0, evidence: [] },
    protector: { score: 0, evidence: [] },
    initiator: { score: 0, evidence: [] },
    connector: { score: 0, evidence: [] },
    teacher: { score: 0, evidence: [] },
    strategist: { score: 0, evidence: [] },
    transformer: { score: 0, evidence: [] },
    explorer: { score: 0, evidence: [] },
    stabilizer: { score: 0, evidence: [] },
  };

  // Astrology scoring
  if (normalized.astrology.sun) {
    const signAxes = SIGN_TO_AXES[normalized.astrology.sun];
    if (signAxes) {
      for (const [axis, points] of Object.entries(signAxes)) {
        axes[axis as AxisKey].score += points * ASTROLOGY_WEIGHTS.sun;
        axes[axis as AxisKey].evidence.push(`Sun ${normalized.astrology.sun}`);
      }
    }
  }

  if (normalized.astrology.moon) {
    const signAxes = SIGN_TO_AXES[normalized.astrology.moon];
    if (signAxes) {
      for (const [axis, points] of Object.entries(signAxes)) {
        axes[axis as AxisKey].score += points * ASTROLOGY_WEIGHTS.moon;
        axes[axis as AxisKey].evidence.push(`Moon ${normalized.astrology.moon}`);
      }
    }
  }

  if (normalized.astrology.rising) {
    const signAxes = SIGN_TO_AXES[normalized.astrology.rising];
    if (signAxes) {
      for (const [axis, points] of Object.entries(signAxes)) {
        axes[axis as AxisKey].score += points * ASTROLOGY_WEIGHTS.rising;
        axes[axis as AxisKey].evidence.push(`Rising ${normalized.astrology.rising}`);
      }
    }
  }

  // Human Design scoring
  if (normalized.humanDesign.type) {
    const typeAxes = HD_TYPE_TO_AXES[normalized.humanDesign.type];
    if (typeAxes) {
      for (const [axis, points] of Object.entries(typeAxes)) {
        axes[axis as AxisKey].score += points * HD_WEIGHTS.type;
        axes[axis as AxisKey].evidence.push(`HD Type: ${normalized.humanDesign.type}`);
      }
    }
  }

  if (normalized.humanDesign.profile) {
    axes.observer.score += 2 * HD_WEIGHTS.profile;
    axes.observer.evidence.push(`HD Profile: ${normalized.humanDesign.profile}`);
  }

  // Numerology scoring
  if (normalized.numerology.lifePath) {
    const lifePathNum = parseInt(normalized.numerology.lifePath, 10);
    if (!isNaN(lifePathNum) && LIFE_PATH_TO_AXES[lifePathNum]) {
      const lpAxes = LIFE_PATH_TO_AXES[lifePathNum];
      for (const [axis, points] of Object.entries(lpAxes)) {
        axes[axis as AxisKey].score += points * NUMEROLOGY_WEIGHTS.lifePath;
        axes[axis as AxisKey].evidence.push(`Life Path ${lifePathNum}`);
      }
    }
  }

  // Behavior scoring
  for (const trait of normalized.behavior.traits) {
    axes.observer.score += 2 * BEHAVIOR_WEIGHTS.trait;
    axes.observer.evidence.push(`Behavioral trait: ${trait}`);
  }

  if (normalized.behavior.decisionStyle) {
    axes.strategist.score += 2 * BEHAVIOR_WEIGHTS.decisionStyle;
    axes.strategist.evidence.push(`Decision style: ${normalized.behavior.decisionStyle}`);
  }

  if (normalized.behavior.builderMode) {
    axes.builder.score += 2 * BEHAVIOR_WEIGHTS.builderMode;
    axes.builder.evidence.push(`Builder mode: ${normalized.behavior.builderMode}`);
  }

  // Normalize scores to 0-100
  const maxScore = Math.max(...Object.values(axes).map(a => a.score), 1);
  const results: GalacticAxisScore[] = Object.entries(axes).map(([key, data]) => ({
    key,
    label: AXIS_DEFINITIONS[key as AxisKey].label,
    score: Math.min(100, Math.round((data.score / maxScore) * 100)),
    evidence: data.evidence,
  }));

  return results.sort((a, b) => b.score - a.score);
}

export function getTopAxes(axes: GalacticAxisScore[], count: number = 3): GalacticAxisScore[] {
  return axes.slice(0, count);
}
