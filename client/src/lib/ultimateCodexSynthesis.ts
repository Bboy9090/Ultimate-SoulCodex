import {
  calcBirthday,
  calcExpression,
  calcLifePath,
  calcMaturity,
  calcPersonality,
  calcSoulUrge,
} from "@soulcodex/core";
import { SOUL_CODEX_PRODUCTION_SYSTEM_REGISTRY } from "@shared/system-registry";
import { humanDesignChannelLabel, humanDesignDefinedChannels, normalizeHumanDesignCenters } from "./humanDesignDisplay";
import { getSynthesisPlacement, getVerifiedPlacement } from "./placementVerification";
import { hasVerifiedHumanDesignTrust } from "./profileVerificationReconciliation";

type AnyRecord = Record<string, any>;

const PLANETS = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
] as const;

const PLANET_LABELS: Record<(typeof PLANETS)[number], string> = {
  sun: "Sun",
  moon: "Moon",
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
  uranus: "Uranus",
  neptune: "Neptune",
  pluto: "Pluto",
};

const SIGN_META: Record<string, { element: string; modality: string; word: string }> = {
  Aries: { element: "Fire", modality: "Cardinal", word: "Pioneer" },
  Taurus: { element: "Earth", modality: "Fixed", word: "Anchor" },
  Gemini: { element: "Air", modality: "Mutable", word: "Messenger" },
  Cancer: { element: "Water", modality: "Cardinal", word: "Keeper" },
  Leo: { element: "Fire", modality: "Fixed", word: "Radiant" },
  Virgo: { element: "Earth", modality: "Mutable", word: "Refiner" },
  Libra: { element: "Air", modality: "Cardinal", word: "Mediator" },
  Scorpio: { element: "Water", modality: "Fixed", word: "Alchemist" },
  Sagittarius: { element: "Fire", modality: "Mutable", word: "Seeker" },
  Capricorn: { element: "Earth", modality: "Cardinal", word: "Architect" },
  Aquarius: { element: "Air", modality: "Fixed", word: "Reformer" },
  Pisces: { element: "Water", modality: "Mutable", word: "Dreamer" },
};

const LIFE_PATH_WORD: Record<number, string> = {
  1: "Pioneer",
  2: "Harmonizer",
  3: "Creator",
  4: "Builder",
  5: "Explorer",
  6: "Steward",
  7: "Analyst",
  8: "Executive",
  9: "Integrator",
  11: "Visionary",
  22: "Master Builder",
  33: "Teacher",
};

const LIFE_PATH_AXIS: Record<number, string[]> = {
  1: ["initiation", "autonomy"],
  2: ["connection", "cooperation"],
  3: ["expression", "communication"],
  4: ["structure", "stability"],
  5: ["freedom", "adaptation"],
  6: ["care", "responsibility"],
  7: ["analysis", "depth"],
  8: ["execution", "authority"],
  9: ["integration", "service"],
  11: ["vision", "sensitivity"],
  22: ["structure", "execution"],
  33: ["care", "teaching"],
};

const HD_WORD: Record<string, string> = {
  Manifestor: "Initiator",
  Generator: "Sustainer",
  "Manifesting Generator": "Multi-Builder",
  Projector: "Guide",
  Reflector: "Mirror",
};

const ELEMENT_AXES: Record<string, string[]> = {
  Fire: ["initiation", "expression"],
  Earth: ["structure", "stability"],
  Air: ["communication", "analysis"],
  Water: ["sensitivity", "connection"],
};

const HOUSE_THEMES: Record<number, string> = {
  1: "identity and approach",
  2: "resources and values",
  3: "learning and communication",
  4: "home and foundations",
  5: "creativity and expression",
  6: "craft, routines, and service",
  7: "partnership and relating",
  8: "shared resources and transformation",
  9: "belief, meaning, and exploration",
  10: "public role and vocation",
  11: "community and future aims",
  12: "retreat, closure, and inner life",
};

export type UltimateCodexCoverage = "complete" | "partial" | "insufficient";

export interface UltimateCodexPlacement {
  key: string;
  label: string;
  sign: string;
  house: number | null;
  degree: number | null;
  longitude: number | null;
  element: string | null;
  modality: string | null;
  evidenceState: "verified" | "stable_across_range";
}

export interface UltimateCodexPoint {
  key: "rising" | "midheaven" | "northNode" | "southNode" | "chiron";
  label: string;
  sign: string;
  house: number | null;
  degree: number | null;
  longitude: number | null;
}

export interface UltimateCodexStellium {
  kind: "sign" | "house";
  key: string;
  label: string;
  planetKeys: string[];
  rule: string;
}

export interface UltimateCodexSynthesis {
  version: "ultimate-codex-v1";
  coverage: UltimateCodexCoverage;
  codexNumber: string | null;
  codexId: string | null;
  fingerprint: string | null;
  identitySignature: string;
  derivedArchetype: string | null;
  dominantElement: string | null;
  dominantModality: string | null;
  placements: UltimateCodexPlacement[];
  supportingPoints: UltimateCodexPoint[];
  houseCusps: Array<{ house: number; sign: string; degree: number | null; longitude: number | null }>;
  aspects: Array<{ planet1: string; planet2: string; aspect: string; orb: number }>;
  stelliums: UltimateCodexStellium[];
  resonances: string[];
  tensions: string[];
  integrationMoves: string[];
  systemSummary: Array<{ system: string; status: string; detail: string }>;
  unresolved: string[];
  evidenceSignature: string[];
}

function validSign(value: unknown): value is keyof typeof SIGN_META {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(SIGN_META, value);
}

function finiteNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function validHouse(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 12 ? n : null;
}

function governedEvidence(
  value: AnyRecord | undefined,
  policyId: string,
): boolean {
  return Boolean(
    value?.verificationStatus === "verified" &&
    value?.policyId === policyId &&
    typeof value?.evidenceArtifactId === "string" &&
    value.evidenceArtifactId.trim().length > 0
  );
}

function verifiedSupportingPoint(
  key: UltimateCodexPoint["key"],
  point: AnyRecord | undefined,
): boolean {
  if (!point || !validSign(point.sign)) return false;
  if (key === "rising") return Boolean(getSynthesisPlacement(point));
  if (key === "midheaven") return governedEvidence(point, "ASTRO-EQUAL-HOUSE-v1");
  if (key === "northNode" || key === "southNode") {
    return governedEvidence(point, "ASTRO-MEAN-NODE-v1") &&
      point.mode === "mean" &&
      validHouse(point.house) !== null;
  }
  return governedEvidence(point, "ASTRO-CHIRON-v1") &&
    point.qualificationMethod === "live-jpl-qualified-against-swiss" &&
    validHouse(point.house) !== null;
}

function normalizedLongitude(value: unknown): number | null {
  const n = finiteNumber(value);
  if (n === null) return null;
  return ((n % 360) + 360) % 360;
}

function placementLongitude(placement: AnyRecord | undefined): number | null {
  return normalizedLongitude(
    placement?.longitude ??
    placement?.internalCandidate?.longitude ??
    placement?.evidence?.longitude
  );
}

function placementDegree(placement: AnyRecord | undefined): number | null {
  const direct = finiteNumber(placement?.degree);
  if (direct !== null) return Math.round(direct * 100) / 100;
  const longitude = placementLongitude(placement);
  return longitude === null ? null : Math.round((longitude % 30) * 100) / 100;
}

function numericValue(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
}

function canonicalNumerology(profile: AnyRecord, numerology: AnyRecord) {
  const birthDate = typeof profile?.birthDate === "string" ? profile.birthDate.slice(0, 10) : null;
  const fullBirthName = typeof profile?.fullBirthName === "string" && profile.fullBirthName.trim()
    ? profile.fullBirthName.trim()
    : null;

  let lifePath: number | null = null;
  let birthday: number | null = null;
  let expression: number | null = null;
  let soulUrge: number | null = null;
  let personality: number | null = null;
  let maturity: number | null = null;

  if (birthDate) {
    try {
      lifePath = calcLifePath(birthDate);
      birthday = calcBirthday(birthDate);
    } catch {
      lifePath = null;
      birthday = null;
    }
  }

  if (birthDate && fullBirthName) {
    try {
      expression = calcExpression(fullBirthName);
      soulUrge = calcSoulUrge(fullBirthName);
      personality = calcPersonality(fullBirthName);
      maturity = calcMaturity(birthDate, fullBirthName);
    } catch {
      expression = null;
      soulUrge = null;
      personality = null;
      maturity = null;
    }
  }

  const personalYear = numerology?.evidenceStates?.personalYear === "verified"
    ? numericValue(numerology.personalYear ?? numerology.personalYearNumber)
    : null;

  return { lifePath, birthday, expression, soulUrge, personality, maturity, personalYear };
}

function fnv1a(value: string, seed = 0x811c9dc5): number {
  let hash = seed >>> 0;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function identityHash(signature: string[]): { fingerprint: string; codexNumber: string; codexId: string } {
  const canonical = signature.join("|");
  const a = fnv1a(canonical, 0x811c9dc5);
  const b = fnv1a(canonical.split("").reverse().join(""), 0x9e3779b9);
  const fingerprint = `${a.toString(16).padStart(8, "0")}${b.toString(16).padStart(8, "0")}`;
  const codexNumber = `${String(a % 1_000_000).padStart(6, "0")}${String(b % 1_000_000).padStart(6, "0")}`;
  return {
    fingerprint,
    codexNumber,
    codexId: `GCX-${fingerprint.slice(0, 4).toUpperCase()}-${fingerprint.slice(4, 8).toUpperCase()}-${fingerprint.slice(8, 12).toUpperCase()}`,
  };
}

function topKey(counts: Map<string, number>): string | null {
  const values = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (!values.length || values[0][1] <= 0) return null;
  return values[0][0];
}

function unique(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())).map((value) => value.trim()))];
}

function findStelliums(placements: UltimateCodexPlacement[]): UltimateCodexStellium[] {
  const signGroups = new Map<string, string[]>();
  const houseGroups = new Map<number, string[]>();
  for (const placement of placements) {
    const bySign = signGroups.get(placement.sign) ?? [];
    bySign.push(placement.key);
    signGroups.set(placement.sign, bySign);
    if (placement.house) {
      const byHouse = houseGroups.get(placement.house) ?? [];
      byHouse.push(placement.key);
      houseGroups.set(placement.house, byHouse);
    }
  }

  const result: UltimateCodexStellium[] = [];
  for (const [sign, planetKeys] of signGroups) {
    if (planetKeys.length < 3) continue;
    result.push({
      kind: "sign",
      key: sign,
      label: `${sign} sign cluster · ${planetKeys.length} synthesis-eligible natal placements`,
      planetKeys,
      rule: "Soul Codex flags 3+ verified or full-day-stable natal sign placements as a stellium-style concentration. Range-stable placements retain their provenance; definitions vary across astrological traditions.",
    });
  }
  for (const [house, planetKeys] of houseGroups) {
    if (planetKeys.length < 3) continue;
    result.push({
      kind: "house",
      key: String(house),
      label: `House ${house} cluster · ${planetKeys.length} verified natal planets`,
      planetKeys,
      rule: "Soul Codex flags 3+ verified natal planets in one verified house as a house concentration.",
    });
  }
  return result;
}

function aspectText(aspect: { planet1: string; planet2: string; aspect: string; orb: number }): string {
  return `${aspect.planet1} ${aspect.aspect} ${aspect.planet2} · orb ${aspect.orb.toFixed(2)}°`;
}

export function buildUltimateCodexSynthesis(profile: AnyRecord): UltimateCodexSynthesis {
  const astrology = (profile?.verifiedAstrologyData ?? profile?.astrologyData ?? {}) as AnyRecord;
  const numerology = (profile?.numerologyData ?? {}) as AnyRecord;
  const hd = (profile?.humanDesignData ?? {}) as AnyRecord;
  const personalityData = (profile?.personalityData ?? {}) as AnyRecord;

  const placements: UltimateCodexPlacement[] = [];
  for (const key of PLANETS) {
    const placement = astrology?.planets?.[key] as AnyRecord | undefined;
    const synthesisPlacement = getSynthesisPlacement(placement);
    if (!synthesisPlacement || !validSign(synthesisPlacement.sign)) continue;
    const exactVerified = synthesisPlacement.evidenceState === "verified";
    const house = exactVerified ? validHouse(astrology?.planetaryHouses?.[key]) : null;
    placements.push({
      key,
      label: PLANET_LABELS[key],
      sign: synthesisPlacement.sign,
      house,
      degree: exactVerified ? placementDegree(placement) : null,
      longitude: exactVerified ? placementLongitude(placement) : null,
      element: SIGN_META[synthesisPlacement.sign].element,
      modality: SIGN_META[synthesisPlacement.sign].modality,
      evidenceState: synthesisPlacement.evidenceState,
    });
  }

  const houseCusps = Array.isArray(astrology?.houses)
    ? astrology.houses
        .filter((row: AnyRecord) =>
          governedEvidence(row, "ASTRO-EQUAL-HOUSE-v1") &&
          validHouse(row?.house) !== null &&
          validSign(row?.sign)
        )
        .map((row: AnyRecord) => ({
          house: Number(row.house),
          sign: String(row.sign),
          degree: finiteNumber(row.degree),
          longitude: normalizedLongitude(row.longitude),
        }))
        .sort((a: { house: number }, b: { house: number }) => a.house - b.house)
    : [];

  const supportingPoints: UltimateCodexPoint[] = [];
  const pointSpecs = [
    ["rising", "Rising", astrology?.rising, null],
    ["midheaven", "Midheaven", astrology?.midheaven, null],
    ["northNode", "North Node", astrology?.northNode, validHouse(astrology?.northNode?.house)],
    ["southNode", "South Node", astrology?.southNode, validHouse(astrology?.southNode?.house)],
    ["chiron", "Chiron", astrology?.chiron, validHouse(astrology?.chiron?.house)],
  ] as const;
  for (const [key, label, point, house] of pointSpecs) {
    if (!verifiedSupportingPoint(key, point as AnyRecord | undefined)) continue;
    supportingPoints.push({
      key,
      label,
      sign: point.sign,
      house,
      degree: placementDegree(point),
      longitude: placementLongitude(point),
    });
  }

  const aspects = Array.isArray(astrology?.aspects)
    ? astrology.aspects
        .filter((row: AnyRecord) =>
          typeof row?.planet1 === "string" &&
          typeof row?.planet2 === "string" &&
          typeof row?.aspect === "string" &&
          finiteNumber(row?.orb) !== null &&
          row?.policyId === "ASTRO-ASPECT-MAJOR-v1"
        )
        .map((row: AnyRecord) => ({
          planet1: String(row.planet1),
          planet2: String(row.planet2),
          aspect: String(row.aspect).toLowerCase(),
          orb: Number(row.orb),
        }))
    : [];

  const elementCounts = new Map<string, number>();
  const modalityCounts = new Map<string, number>();
  for (const placement of placements) {
    if (placement.element) elementCounts.set(placement.element, (elementCounts.get(placement.element) ?? 0) + 1);
    if (placement.modality) modalityCounts.set(placement.modality, (modalityCounts.get(placement.modality) ?? 0) + 1);
  }
  const dominantElement = topKey(elementCounts);
  const dominantModality = topKey(modalityCounts);
  const verifiedPlacementCount = placements.filter((placement) => placement.evidenceState === "verified").length;
  const stablePlacementCount = placements.filter((placement) => placement.evidenceState === "stable_across_range").length;
  const stelliums = findStelliums(placements);

  // Deterministic numerology is recomputed from its required source inputs.
  // Stored numbers are a cache, not authority. Missing full birth name means
  // name-based numerology is unavailable rather than inferred from display name.
  const {
    lifePath,
    birthday,
    expression,
    soulUrge,
    personality,
    maturity,
    personalYear,
  } = canonicalNumerology(profile, numerology);

  const verifiedHd = hasVerifiedHumanDesignTrust(hd);
  const stableHdComponent = (key: string): string | null => {
    const component = hd?.components?.[key];
    return component?.evidenceState === "stable_across_range" &&
      typeof component?.value === "string" &&
      component.value.trim()
      ? component.value.trim()
      : null;
  };
  const hdEvidenceMode = verifiedHd ? "verified" as const :
    stableHdComponent("type") ? "stable_across_range" as const : null;
  const hdType = verifiedHd && typeof hd.type === "string" ? hd.type.trim() : stableHdComponent("type");
  const hdStrategy = verifiedHd && typeof hd.strategy === "string" ? hd.strategy.trim() : stableHdComponent("strategy");
  const hdAuthority = verifiedHd && typeof hd.authority === "string" ? hd.authority.trim() : stableHdComponent("authority");
  const hdProfile = verifiedHd && typeof hd.profile === "string" ? hd.profile.trim() : stableHdComponent("profile");
  const hdDefinition = verifiedHd && typeof hd.definition === "string" ? hd.definition.trim() : stableHdComponent("definition");
  const hdCenters = verifiedHd
    ? normalizeHumanDesignCenters(hd.centers)
    : { defined: (stableHdComponent("centers") ?? "").split("|").filter(Boolean), undefined: [] };
  const hdChannels = verifiedHd
    ? humanDesignDefinedChannels(hd.channels).map(humanDesignChannelLabel)
    : (stableHdComponent("channels") ?? "").split("|").filter(Boolean);
  const hdGates = verifiedHd && Array.isArray(hd.activatedGates)
    ? hd.activatedGates.map(String)
    : (stableHdComponent("gates") ?? "").split(",").filter(Boolean);
  const hdActivationSignature: string[] = [];
  if (verifiedHd) {
    for (const side of ["conscious", "unconscious"] as const) {
      const rows = hd?.activations?.[side];
      if (!rows || typeof rows !== "object") continue;
      for (const [body, value] of Object.entries(rows as AnyRecord).sort(([a], [b]) => a.localeCompare(b))) {
        const gate = Number((value as AnyRecord)?.gate);
        const line = Number((value as AnyRecord)?.line);
        if (!Number.isInteger(gate) || gate < 1 || gate > 64) continue;
        if (!Number.isFinite(line) || line < 1 || line > 6) continue;
        hdActivationSignature.push(`hd:activation:${side}:${body}:${gate}.${line}`);
      }
    }
  }

  const evidenceSignature = [
    ...placements.map((p) => `astro:${p.evidenceState}:${p.key}:${p.sign}:${p.degree ?? "?"}:H${p.house ?? "?"}`),
    ...houseCusps.map((h) => `house:${h.house}:${h.sign}:${h.degree ?? "?"}`),
    ...supportingPoints.map((p) => `point:${p.key}:${p.sign}:${p.degree ?? "?"}:H${p.house ?? "angle"}`),
    ...aspects.map((a) => `aspect:${a.planet1}:${a.aspect}:${a.planet2}:${a.orb.toFixed(2)}`),
    ...stelliums.map((s) => `cluster:${s.kind}:${s.key}:${s.planetKeys.join(",")}`),
    lifePath ? `num:lp:${lifePath}` : null,
    birthday ? `num:birthday:${birthday}` : null,
    expression ? `num:expression:${expression}` : null,
    soulUrge ? `num:soul:${soulUrge}` : null,
    personality ? `num:personality:${personality}` : null,
    maturity ? `num:maturity:${maturity}` : null,
    hdType ? `hd:${hdEvidenceMode ?? "unresolved"}:type:${hdType}` : null,
    hdStrategy ? `hd:${hdEvidenceMode ?? "unresolved"}:strategy:${hdStrategy}` : null,
    hdAuthority ? `hd:${hdEvidenceMode ?? "unresolved"}:authority:${hdAuthority}` : null,
    hdProfile ? `hd:${hdEvidenceMode ?? "unresolved"}:profile:${hdProfile}` : null,
    hdDefinition ? `hd:${hdEvidenceMode ?? "unresolved"}:definition:${hdDefinition}` : null,
    ...hdCenters.defined.map((center) => `hd:center:${center}`),
    ...hdChannels.map((channel) => `hd:channel:${channel}`),
    ...hdGates.map((gate) => `hd:gate:${gate}`),
    ...hdActivationSignature,
  ].filter((value): value is string => Boolean(value)).sort();

  const hashedIdentity = identityHash(evidenceSignature);

  const unresolved: string[] = [];
  if (placements.length < PLANETS.length) unresolved.push(`${PLANETS.length - placements.length} natal planet placement(s) are neither verified nor stable across the full range and are excluded.`);
  if (houseCusps.length < 12) unresolved.push(`${12 - houseCusps.length} house cusp(s) are not verified and are excluded.`);
  for (const [key, label] of [["rising","Rising"],["midheaven","Midheaven"],["northNode","North Node"],["southNode","South Node"],["chiron","Chiron"]] as const) {
    if (!supportingPoints.some((point) => point.key === key)) unresolved.push(`${label} is unavailable or conditional under the current evidence and is excluded from the main synthesis.`);
  }
  if (!hdType) unresolved.push("Human Design Type is unavailable or conditional and does not influence combined identity synthesis.");
  if (!hdAuthority) unresolved.push("Human Design Authority is unavailable or conditional and does not influence combined identity synthesis.");
  if (!hdProfile) unresolved.push("Human Design Profile is unavailable or conditional and does not influence combined identity synthesis.");
  if (!lifePath) unresolved.push("Life Path is unavailable to the combined synthesis.");
  if (!birthday) unresolved.push("Birthday number is unavailable to the combined synthesis.");
  if (!expression) unresolved.push("Expression number is unavailable to the combined synthesis.");
  if (!soulUrge) unresolved.push("Soul Urge number is unavailable to the combined synthesis.");
  if (!personality) unresolved.push("Personality number is unavailable to the combined synthesis.");
  if (!maturity) unresolved.push("Maturity number is unavailable to the combined synthesis.");

  const systemsPresent = [
    placements.length >= 3 || houseCusps.length === 12,
    Boolean(lifePath || expression || soulUrge),
    Boolean(hdType && hdAuthority),
  ].filter(Boolean).length;
  const completeNumerology = Boolean(lifePath && birthday && expression && soulUrge && personality && maturity);
  const completeSupportingPoints = supportingPoints.length === 5;
  const coverage: UltimateCodexCoverage =
    systemsPresent >= 3 && placements.length === 10 && houseCusps.length === 12 && completeSupportingPoints && verifiedHd && completeNumerology
      ? "complete"
      : systemsPresent >= 2
        ? "partial"
        : "insufficient";

  const fingerprint = coverage === "insufficient" ? null : hashedIdentity.fingerprint;
  const codexNumber = coverage === "insufficient" ? null : hashedIdentity.codexNumber;
  const codexId = coverage === "insufficient" ? null : hashedIdentity.codexId;

  const primaryStellium = stelliums[0] ?? null;
  const sunPlacement = placements.find((placement) => placement.key === "sun") ?? null;
  const moonPlacement = placements.find((placement) => placement.key === "moon") ?? null;
  const risingPoint = supportingPoints.find((point) => point.key === "rising");

  // Human-facing identity labels stay literal and familiar. Technical archetype
  // nicknames, fingerprint fragments, element jargon, and internal synthesis
  // labels belong in the Systems inspector rather than the profile headline.
  const astrologyIdentity = sunPlacement ? `${sunPlacement.sign} Sun` : null;
  const moonIdentity = moonPlacement ? `${moonPlacement.sign} Moon` : null;
  const risingIdentity = risingPoint ? `${risingPoint.sign} Rising` : null;
  const humanDesignIdentity = hdType ? `${hdType}${hdProfile ? ` ${hdProfile}` : ""}` : null;
  const numerologyIdentity = lifePath ? `Life Path ${lifePath}` : null;
  const signConcentrations = stelliums
    .filter((cluster) => cluster.kind === "sign")
    .slice(0, 2)
    .map((cluster) => `${cluster.key} stellium`);

  const identityParts = unique([
    astrologyIdentity,
    moonIdentity,
    risingIdentity,
    humanDesignIdentity,
    numerologyIdentity,
    ...signConcentrations,
  ]);
  const identitySignature = identityParts.length
    ? identityParts.join(" · ")
    : "Core identity summary unavailable from current evidence";

  const derivedArchetypeParts = unique([
    astrologyIdentity,
    moonIdentity,
    risingIdentity,
    humanDesignIdentity,
    numerologyIdentity,
    ...signConcentrations,
  ]).slice(0, 4);
  const derivedArchetype =
    coverage === "insufficient" || derivedArchetypeParts.length < 2
      ? null
      : derivedArchetypeParts.join(" · ");

  const resonances: string[] = [];
  if (dominantElement && lifePath && LIFE_PATH_AXIS[lifePath]) {
    const overlap = ELEMENT_AXES[dominantElement]?.filter((axis) => LIFE_PATH_AXIS[lifePath].includes(axis)) ?? [];
    if (overlap.length) {
      resonances.push(`${dominantElement} chart emphasis and Life Path ${lifePath} both repeat ${overlap.join(" + ")} themes. Treat the repetition as symbolic reinforcement, not independent proof.`);
    }
  }
  if (hdType === "Generator" || hdType === "Manifesting Generator") {
    if (dominantElement === "Earth" || [4, 8, 22].includes(lifePath ?? -1)) {
      resonances.push(`${hdType} response/sustained-energy language overlaps with the profile's structure/building emphasis.`);
    }
  }
  if (hdType === "Projector" && (dominantElement === "Air" || [7, 11].includes(lifePath ?? -1))) {
    resonances.push("Projector guidance/recognition language overlaps with analysis, pattern-reading, or perspective themes elsewhere in the Codex.");
  }
  if (hdType === "Reflector" && (dominantElement === "Water" || dominantElement === "Air" || [2, 7, 9, 11].includes(lifePath ?? -1))) {
    resonances.push("Reflector sampling/mirroring language overlaps with sensitivity, observation, or integration themes elsewhere in the Codex.");
  }
  for (const cluster of stelliums.slice(0, 2)) {
    resonances.push(`${cluster.label} concentrates several verified planetary functions in the same ${cluster.kind === "sign" ? "style" : "life area"}, increasing that theme's visibility inside the symbolic reading.`);
  }

  const tensions: string[] = [];
  const hardAspects = aspects.filter((a) => a.aspect === "square" || a.aspect === "opposition");
  for (const aspect of hardAspects.slice(0, 4)) {
    tensions.push(`${aspectText(aspect)} creates a traditional hard-aspect tension between two verified planetary positions. Soul Codex keeps both functions visible instead of choosing one as the "real" self.`);
  }
  if (hdStrategy && /wait/i.test(hdStrategy) && (dominantModality === "Cardinal" || dominantElement === "Fire" || [1, 8].includes(lifePath ?? -1))) {
    tensions.push(`The chart/numerology carries initiatory symbolism while Human Design Strategy says "${hdStrategy}". Use this as a timing-vs-style contradiction: the urge to initiate can describe style, while Strategy/Authority can be used as the chosen timing practice.`);
  }
  if (expression && soulUrge && expression !== soulUrge) {
    const e = LIFE_PATH_WORD[expression];
    const s = LIFE_PATH_WORD[soulUrge];
    if (e && s) {
      tensions.push(`Expression ${expression} (${e}) and Soul Urge ${soulUrge} (${s}) describe different symbolic instructions. They do not need to agree; one can describe outward expression while the other describes an inward pull.`);
    }
  }
  if (primaryStellium && dominantElement) {
    tensions.push(`A strong ${primaryStellium.kind} concentration can make one part of the symbolic map louder than the rest. The integration task is to notice what the cluster emphasizes without treating quieter houses, signs, or systems as absent.`);
  }

  const integrationMoves = unique([
    tensions.some((t) => /timing-vs-style/.test(t))
      ? "Sequence the contradiction: check Strategy/Authority for timing first, then let the initiatory symbolism shape how you act after the timing decision."
      : null,
    hardAspects.length
      ? "For each square/opposition, write the need represented by each side and choose a context-specific sequence rather than forcing one side to erase the other."
      : null,
    stelliums.length
      ? "Treat each stellium-style cluster as concentration, not destiny. Before a major decision, deliberately consult at least one quieter house/element/theme so the loud cluster does not become the only voice."
      : null,
    expression && soulUrge && expression !== soulUrge
      ? "Separate public expression from private need: ask which number describes what you are doing outwardly and which describes what you need internally before deciding that they conflict."
      : null,
    hdAuthority
      ? `Use verified Human Design Authority (${hdAuthority}) as one optional decision ritual, then compare the outcome with lived experience instead of treating the system as a command.`
      : null,
    "When systems disagree, prefer observed lived experience over symbolic interpretation. Keep the evidence, revise the meaning.",
  ]);

  const personalityEvidenceState =
    typeof personalityData.evidenceState === "string" ? personalityData.evidenceState : null;
  const personalityAssessed =
    personalityEvidenceState === "assessed" || personalityEvidenceState === "verified";

  const systemSummary = [
    {
      system: "Natal planets / Big Three",
      status:
        verifiedPlacementCount === 10 && supportingPoints.some((point) => point.key === "rising" && (astrology?.rising?.verificationStatus === "verified"))
          ? "verified"
          : placements.length
            ? stablePlacementCount
              ? "mixed verified / stable across range"
              : "partial verified"
            : "unresolved",
      detail: `${verifiedPlacementCount} verified · ${stablePlacementCount} stable across range · ${PLANETS.length - placements.length} excluded natal planets · Rising ${supportingPoints.some((point) => point.key === "rising") ? ((astrology?.rising?.verificationStatus === "verified") ? "verified" : "stable across range") : "conditional/unavailable"}`,
    },
    {
      system: "Houses / Midheaven",
      status: houseCusps.length === 12 && supportingPoints.some((point) => point.key === "midheaven") ? "verified governed geometry" : "unresolved",
      detail: `${houseCusps.length}/12 Equal House cusps · Midheaven ${supportingPoints.some((point) => point.key === "midheaven") ? "verified" : "unresolved"}`,
    },
    {
      system: "Major aspects",
      status: placements.length === 10 ? "governed from verified longitudes" : "partial / unresolved",
      detail: `${aspects.length} governed major aspect(s) · ${hardAspects.length} square/opposition tension aspect(s)`,
    },
    {
      system: "Nodes / Chiron",
      status: ["northNode", "southNode", "chiron"].every((key) => supportingPoints.some((point) => point.key === key)) ? "verified governed points" : "unresolved",
      detail: `${["northNode", "southNode", "chiron"].filter((key) => supportingPoints.some((point) => point.key === key)).length}/3 supported points`,
    },
    {
      system: "Numerology",
      status: completeNumerology ? "deterministic stable core" : lifePath ? "partial deterministic core" : "unresolved",
      detail: unique([
        lifePath ? `LP ${lifePath}` : null,
        birthday ? `Birthday ${birthday}` : null,
        expression ? `Expression ${expression}` : null,
        soulUrge ? `Soul Urge ${soulUrge}` : null,
        personality ? `Personality ${personality}` : null,
        maturity ? `Maturity ${maturity}` : null,
        personalYear ? `Personal Year ${personalYear} (current cycle; excluded from stable fingerprint)` : null,
      ]).join(" · ") || "No governed number available.",
    },
    {
      system: "Human Design",
      status: verifiedHd ? "verified core" : hdEvidenceMode === "stable_across_range" ? "stable across full-day range" : "unresolved",
      detail: verifiedHd
        ? unique([hdType, hdStrategy, hdAuthority, hdProfile, hdDefinition]).join(" · ")
        : hdEvidenceMode === "stable_across_range"
          ? `${unique([hdType, hdStrategy, hdAuthority, hdProfile, hdDefinition]).join(" · ")} · only invariant components are admitted; conditional components remain excluded.`
          : "Excluded from synthesis until verified or stable across the full unknown-time range.",
    },
    {
      system: "Personality assessments",
      status: personalityAssessed ? "user-assessed supporting evidence" : "not assessed / excluded",
      detail: personalityAssessed
        ? "Explicit user assessment may support reflection but is not diagnostic evidence."
        : "No explicit governed assessment state is present, so personality labels do not influence the combined Codex.",
    },
    {
      system: "Astrocartography",
      status: "unavailable / excluded",
      detail: "No production-grade line calculation and mapping contract; no decorative power-place claims are allowed.",
    },
    {
      system: "Palmistry",
      status: "unavailable / excluded",
      detail: "No governed image-analysis contract and explicit image-consent path; no generated palm claims are allowed.",
    },
  ];

  const representedRegistryIds = new Set([
    "natal-astrology",
    "houses-midheaven",
    "major-aspects",
    "nodes-chiron",
    "numerology-core",
    "human-design-core",
    "personality-assessments",
    "astrocartography",
    "palmistry",
  ]);
  for (const entry of SOUL_CODEX_PRODUCTION_SYSTEM_REGISTRY) {
    if (representedRegistryIds.has(entry.id)) continue;
    systemSummary.push({
      system: entry.label,
      status:
        entry.state === "unavailable"
          ? "unavailable / excluded"
          : entry.state === "inspect-only"
            ? "inspect-only / excluded"
            : entry.state === "user-assessed"
              ? "requires explicit user assessment / excluded"
              : entry.mayInfluenceUltimateCodex
                ? "governed supporting system"
                : "governed / excluded from stable identity fingerprint",
      detail: `${entry.evidenceContract}. ${entry.rule}`,
    });
  }

  return {
    version: "ultimate-codex-v1",
    coverage,
    codexNumber,
    codexId,
    fingerprint,
    identitySignature,
    derivedArchetype,
    dominantElement,
    dominantModality,
    placements,
    supportingPoints,
    houseCusps,
    aspects,
    stelliums,
    resonances: resonances.length ? resonances : ["No cross-system reinforcement is asserted beyond the currently available governed evidence."],
    tensions: tensions.length ? tensions : ["No governed contradiction is currently strong enough to assert; this is not the same as having no inner conflict."],
    integrationMoves,
    systemSummary,
    unresolved,
    evidenceSignature,
  };
}

export const ULTIMATE_CODEX_STELLIUM_RULE =
  "Soul Codex flags 3+ synthesis-eligible natal sign placements (verified or stable across the full unknown-time range), or 3+ verified planets in one verified house, as a stellium-style concentration; provenance stays visible and traditions vary.";
