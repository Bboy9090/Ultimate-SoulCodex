import type { LifeMap, LifeMapYear } from "../types/soulcodex";
import { resolveTimeline } from "../timeline/engine";

export type { LifeMap, LifeMapYear };

export function generateLifeMap(
  currentYear: number,
  personalYear: number,
  horizonYears = 10
): LifeMap {
  const years: LifeMapYear[] = [];

  for (let i = 0; i < horizonYears; i++) {
    const year = currentYear + i;
    const pYear = ((personalYear + i - 1) % 9) + 1;
    const phase = resolveTimeline({ personalYear: pYear, themes: [] });
    years.push({ year, phase });
  }

  return { years };
}
