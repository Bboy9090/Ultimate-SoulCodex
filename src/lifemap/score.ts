import { ALL_PHASES, NUMEROLOGY_PHASE_RULES, THEME_PHASE_RULES } from "./rules";
import type { LifeMapInput, LifeMapPhase, LifeMapReason, ConfidenceLevel } from "./types";

type ScoreMap = Record<LifeMapPhase, number>;

function makeScoreMap(): ScoreMap {
  return {
    Ignition: 0,
    Exposure: 0,
    Construction: 0,
    Expansion: 0,
    Friction: 0,
    Refinement: 0,
    Integration: 0,
    Legacy: 0,
  };
}

export function scoreLifeMap(input: LifeMapInput): {
  scores: ScoreMap;
  reasons: LifeMapReason[];
  confidence: ConfidenceLevel;
} {
  const scores = makeScoreMap();
  const reasons: LifeMapReason[] = [];
  const confidence = input.profile?.confidence?.badge || "unverified";

  const astrologyMultiplier =
    confidence === "verified" ? 1 :
    confidence === "partial" ? 0.7 : 0.5;

  const py = input.profile?.numerology?.personalYear;
  if (py && NUMEROLOGY_PHASE_RULES[py]) {
    const rule = NUMEROLOGY_PHASE_RULES[py];
    scores[rule.primary] += 5;
    reasons.push({
      source: "numerology",
      label: `Personal Year ${py} favors ${rule.primary}.`,
      weight: 5,
    });

    if (rule.secondary) {
      scores[rule.secondary] += 2;
      reasons.push({
        source: "numerology",
        label: `Personal Year ${py} also leans toward ${rule.secondary}.`,
        weight: 2,
      });
    }
  }

  const themes = input.profile?.themes?.topThemes || [];
  for (const rawTheme of themes) {
    const theme = rawTheme.toLowerCase().trim();
    const mapped = THEME_PHASE_RULES[theme];
    if (!mapped) continue;

    mapped.forEach((phase, idx) => {
      const weight = idx === 0 ? 2 : 1;
      scores[phase] += weight;
      reasons.push({
        source: "themes",
        label: `Theme "${rawTheme}" reinforces ${phase}.`,
        weight,
      });
    });
  }

  const cycles = input.fullChart?.cycles;
  if (cycles) {
    const addAstro = (phase: LifeMapPhase, baseWeight: number, label: string) => {
      const weight = Math.round(baseWeight * astrologyMultiplier * 10) / 10;
      scores[phase] += weight;
      reasons.push({ source: "astrology", label, weight });
    };

    if (cycles.saturnStrong) addAstro("Construction", 4, "Saturn pressure favors structure and responsibility.");
    if (cycles.saturnHard) addAstro("Friction", 4, "Hard Saturn pressure suggests testing, delay, and pressure.");
    if (cycles.jupiterStrong) addAstro("Expansion", 4, "Jupiter activation favors growth and opening.");
    if (cycles.jupiterReturn) {
      addAstro("Ignition", 2, "Jupiter return adds fresh momentum.");
      addAstro("Expansion", 3, "Jupiter return also expands opportunity.");
    }
    if (cycles.nodeStrong) {
      addAstro("Exposure", 4, "Node activation exposes life-direction lessons.");
      addAstro("Legacy", 3, "Node activation also points toward bigger long-term meaning.");
    }
    if (cycles.plutoHard) addAstro("Friction", 4, "Pluto pressure suggests deep change through disruption.");
    if (cycles.neptuneHard) {
      addAstro("Exposure", 3, "Neptune pressure can reveal confusion, fantasy, or emotional truth.");
      addAstro("Refinement", 2, "Neptune also pushes simplification and emotional filtering.");
    }
    if (cycles.uranusHard) {
      addAstro("Ignition", 3, "Uranus pressure pushes sudden movement and disruption.");
      addAstro("Friction", 3, "Uranus disruption can also create instability and forced change.");
    }
  }

  const driver = input.profile?.mirror?.driver?.toLowerCase();
  if (driver?.includes("order")) {
    scores.Construction += 2;
    reasons.push({ source: "mirror", label: `Mirror driver "${input.profile?.mirror?.driver}" supports structure and order.`, weight: 2 });
  }
  if (driver?.includes("impact")) {
    scores.Expansion += 2;
    reasons.push({ source: "mirror", label: `Mirror driver "${input.profile?.mirror?.driver}" supports movement and outward force.`, weight: 2 });
  }
  if (driver?.includes("protection")) {
    scores.Legacy += 2;
    reasons.push({ source: "mirror", label: `Mirror driver "${input.profile?.mirror?.driver}" supports protective and stabilizing phases.`, weight: 2 });
  }

  return { scores, reasons, confidence };
}

export function rankPhases(scores: ScoreMap): LifeMapPhase[] {
  return ALL_PHASES.slice().sort((a, b) => scores[b] - scores[a]);
}
