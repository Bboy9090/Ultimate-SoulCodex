/**
 * Galactic Code Axis Scoring
 *
 * Score 10 axes (0-100) based on weighted evidence from:
 * - Astrology (Sun, Moon, Rising, Mercury, Venus, Mars, aspects, elements, houses)
 * - Human Design (verified Type, Authority, Profile, and defined centers)
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
  projector: { observer: 9, strategist: 8, teacher: 7, connector: 6, protector: 4, transformer: 4, builder: 3, initiator: 2, explorer: 2, stabilizer: 2 },
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

const ELEMENT_TO_AXES: Record<string, Partial<Record<AxisKey, number>>> = {
  fire: { initiator: 8, explorer: 6, teacher: 4 },
  earth: { builder: 8, stabilizer: 8, strategist: 5 },
  air: { connector: 8, teacher: 6, observer: 5, strategist: 4 },
  water: { protector: 7, connector: 7, transformer: 6, observer: 4 },
};

const HOUSE_TO_AXES: Record<number, Partial<Record<AxisKey, number>>> = {
  1: { initiator: 7, observer: 3 },
  2: { builder: 6, stabilizer: 6 },
  3: { connector: 7, teacher: 6, observer: 4 },
  4: { protector: 7, stabilizer: 6 },
  5: { teacher: 6, initiator: 5, transformer: 4 },
  6: { builder: 7, observer: 6, stabilizer: 5 },
  7: { connector: 8, protector: 4 },
  8: { transformer: 8, strategist: 4 },
  9: { explorer: 8, teacher: 6 },
  10: { strategist: 8, builder: 7, initiator: 5 },
  11: { connector: 7, transformer: 5, teacher: 4 },
  12: { observer: 7, transformer: 6, protector: 4 },
};

const AUTHORITY_TO_AXES: Array<[RegExp, Partial<Record<AxisKey, number>>]> = [
  [/emotional/i, { transformer: 8, protector: 5, observer: 4 }],
  [/sacral/i, { builder: 8, stabilizer: 6 }],
  [/splenic/i, { observer: 8, protector: 6 }],
  [/ego|heart/i, { initiator: 7, builder: 6 }],
  [/self[- ]?projected/i, { connector: 7, teacher: 6 }],
  [/mental|environment/i, { observer: 8, strategist: 7 }],
  [/lunar/i, { observer: 9, transformer: 6 }],
];

const CENTER_TO_AXES: Record<string, Partial<Record<AxisKey, number>>> = {
  head: { observer: 5, teacher: 2 },
  ajna: { observer: 6, strategist: 5 },
  throat: { connector: 6, teacher: 5, initiator: 3 },
  g: { connector: 4, stabilizer: 4, initiator: 3 },
  heart: { builder: 5, initiator: 5 },
  spleen: { observer: 5, protector: 5 },
  'solar plexus': { transformer: 6, connector: 4 },
  sacral: { builder: 7, stabilizer: 5 },
  root: { stabilizer: 6, builder: 4 },
};

const TRAIT_AXIS_KEYWORDS: Array<[RegExp, AxisKey[]]> = [
  [/analy|research|observ|detail|reflect|investigat/i, ['observer', 'strategist']],
  [/build|method|reliable|disciplin|organ|execute|practical/i, ['builder', 'stabilizer']],
  [/protect|care|loyal|support|steward|nurtur/i, ['protector', 'connector']],
  [/lead|initiat|direct|assert|independent/i, ['initiator']],
  [/connect|collabor|social|relat|empat|diplom/i, ['connector']],
  [/teach|communicat|express|explain|mentor|creative/i, ['teacher', 'connector']],
  [/strateg|plan|system|data|principle/i, ['strategist']],
  [/transform|adapt|change|intens|depth/i, ['transformer']],
  [/explor|curious|freedom|novel|experiment/i, ['explorer']],
  [/stable|steady|patient|ground|consistent/i, ['stabilizer']],
];

function applyWeighted(
  axes: Record<AxisKey, AxisScore>,
  weights: Partial<Record<AxisKey, number>> | undefined,
  multiplier: number,
  evidence: string,
): void {
  if (!weights || multiplier <= 0) return;
  for (const [axis, points] of Object.entries(weights)) {
    if (!points) continue;
    axes[axis as AxisKey].score += points * multiplier;
    axes[axis as AxisKey].evidence.push(evidence);
  }
}

function applySign(
  axes: Record<AxisKey, AxisScore>,
  sign: string | null,
  multiplier: number,
  evidence: string,
): void {
  if (!sign) return;
  applyWeighted(axes, SIGN_TO_AXES[sign], multiplier, evidence);
}

function applyNumber(
  axes: Record<AxisKey, AxisScore>,
  raw: string | null,
  multiplier: number,
  evidenceLabel: string,
): void {
  if (!raw) return;
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value)) return;
  const weights = LIFE_PATH_TO_AXES[value];
  if (!weights) return;
  applyWeighted(axes, weights, multiplier, `${evidenceLabel} ${value}`);
}

function houseNumber(value: string): number | null {
  const match = value.match(/(?:house\s*)?(1[0-2]|[1-9])\b/i);
  const parsed = match ? Number(match[1]) : NaN;
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 12 ? parsed : null;
}

function applyBehaviorText(
  axes: Record<AxisKey, AxisScore>,
  value: string | null,
  multiplier: number,
  evidenceLabel: string,
): void {
  if (!value) return;
  const matched = new Set<AxisKey>();
  for (const [pattern, targets] of TRAIT_AXIS_KEYWORDS) {
    if (!pattern.test(value)) continue;
    for (const axis of targets) matched.add(axis);
  }
  for (const axis of matched) {
    axes[axis].score += 2 * multiplier;
    axes[axis].evidence.push(`${evidenceLabel}: ${value}`);
  }
}


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

  // Astrology: every governed field declared by the Galactic Code input can contribute.
  applySign(axes, normalized.astrology.sun, ASTROLOGY_WEIGHTS.sun, `Sun ${normalized.astrology.sun}`);
  applySign(axes, normalized.astrology.moon, ASTROLOGY_WEIGHTS.moon, `Moon ${normalized.astrology.moon}`);
  applySign(axes, normalized.astrology.rising, ASTROLOGY_WEIGHTS.rising, `Rising ${normalized.astrology.rising}`);
  applySign(axes, normalized.astrology.mercury, ASTROLOGY_WEIGHTS.mercury, `Mercury ${normalized.astrology.mercury}`);
  applySign(axes, normalized.astrology.venus, ASTROLOGY_WEIGHTS.venus, `Venus ${normalized.astrology.venus}`);
  applySign(axes, normalized.astrology.mars, ASTROLOGY_WEIGHTS.mars, `Mars ${normalized.astrology.mars}`);

  for (const element of normalized.astrology.dominantElements) {
    applyWeighted(axes, ELEMENT_TO_AXES[element], ASTROLOGY_WEIGHTS.dominantElement, `Dominant element: ${element}`);
  }
  for (const house of normalized.astrology.houseEmphasis) {
    const value = houseNumber(house);
    if (value) applyWeighted(axes, HOUSE_TO_AXES[value], ASTROLOGY_WEIGHTS.houseEmphasis, `House emphasis: ${house}`);
  }
  for (const aspect of normalized.astrology.majorAspects) {
    if (/square|opposition/i.test(aspect)) {
      applyWeighted(axes, { transformer: 4, strategist: 2 }, ASTROLOGY_WEIGHTS.majorAspect, `Major aspect tension: ${aspect}`);
    } else if (/trine|sextile|conjunction/i.test(aspect)) {
      applyWeighted(axes, { connector: 3, stabilizer: 2 }, ASTROLOGY_WEIGHTS.majorAspect, `Major aspect resonance: ${aspect}`);
    }
  }

  // Human Design: only governed verified core fields with an approved semantic map contribute.
  if (normalized.humanDesign.type) {
    applyWeighted(
      axes,
      HD_TYPE_TO_AXES[normalized.humanDesign.type],
      HD_WEIGHTS.type,
      `HD Type: ${normalized.humanDesign.type}`,
    );
  }
  if (normalized.humanDesign.authority) {
    for (const [pattern, weights] of AUTHORITY_TO_AXES) {
      if (pattern.test(normalized.humanDesign.authority)) {
        applyWeighted(axes, weights, HD_WEIGHTS.authority, `HD Authority: ${normalized.humanDesign.authority}`);
        break;
      }
    }
  }
  if (normalized.humanDesign.profile) {
    const [firstLine, secondLine] = normalized.humanDesign.profile.split('/').map(Number);
    const lineAxes: Record<number, Partial<Record<AxisKey, number>>> = {
      1: { observer: 6, strategist: 3 },
      2: { observer: 4, stabilizer: 3 },
      3: { explorer: 6, transformer: 4 },
      4: { connector: 6, teacher: 3 },
      5: { strategist: 5, teacher: 4, initiator: 2 },
      6: { observer: 5, teacher: 5, transformer: 3 },
    };
    if (lineAxes[firstLine]) applyWeighted(axes, lineAxes[firstLine], HD_WEIGHTS.profile, `HD Profile line ${firstLine}`);
    if (lineAxes[secondLine]) applyWeighted(axes, lineAxes[secondLine], HD_WEIGHTS.profile, `HD Profile line ${secondLine}`);
  }
  for (const center of normalized.humanDesign.definedCenters) {
    applyWeighted(axes, CENTER_TO_AXES[center], HD_WEIGHTS.definedCenter, `Defined center: ${center}`);
  }
  // Channels remain verified/inspectable Human Design evidence, but Soul Codex
  // does not currently maintain an approved channel-to-axis semantic map.
  // Do not route channel labels through generic behavioral keyword matching.

  // Numerology: all governed core values score independently instead of Life Path carrying the whole system.
  applyNumber(axes, normalized.numerology.lifePath, NUMEROLOGY_WEIGHTS.lifePath, 'Life Path');
  applyNumber(axes, normalized.numerology.expressionNumber, NUMEROLOGY_WEIGHTS.expression, 'Expression');
  applyNumber(axes, normalized.numerology.soulUrgeNumber, NUMEROLOGY_WEIGHTS.soulUrge, 'Soul Urge');
  applyNumber(axes, normalized.numerology.birthdayNumber, NUMEROLOGY_WEIGHTS.birthdayNumber, 'Birthday Number');
  applyNumber(axes, normalized.numerology.maturityNumber, NUMEROLOGY_WEIGHTS.maturity, 'Maturity Number');

  // Behavior: only recognized language contributes. Unknown traits do not default to Observer.
  for (const trait of normalized.behavior.traits) {
    applyBehaviorText(axes, trait, BEHAVIOR_WEIGHTS.trait, 'Behavioral trait');
  }
  applyBehaviorText(axes, normalized.behavior.decisionStyle, BEHAVIOR_WEIGHTS.decisionStyle, 'Decision style');
  applyBehaviorText(axes, normalized.behavior.stressPattern, BEHAVIOR_WEIGHTS.stressPattern, 'Stress pattern');
  applyBehaviorText(axes, normalized.behavior.relationalPattern, BEHAVIOR_WEIGHTS.relationalPattern, 'Relational pattern');
  applyBehaviorText(axes, normalized.behavior.builderMode, BEHAVIOR_WEIGHTS.builderMode, 'Builder mode');
  applyBehaviorText(axes, normalized.behavior.moralCompass, BEHAVIOR_WEIGHTS.moralCompass, 'Moral compass');

  const maxScore = Math.max(...Object.values(axes).map((axis) => axis.score), 1);
  const results: GalacticAxisScore[] = Object.entries(axes).map(([key, data]) => ({
    key,
    label: AXIS_DEFINITIONS[key as AxisKey].label,
    score: data.score > 0 ? Math.min(100, Math.round((data.score / maxScore) * 100)) : 0,
    evidence: [...new Set(data.evidence)],
  }));

  return results.sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
}

export function getTopAxes(axes: GalacticAxisScore[], count: number = 3): GalacticAxisScore[] {
  return axes.slice(0, count);
}
