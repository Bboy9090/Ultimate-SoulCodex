import type { ToneMode } from "./schema";
import {
  soulCodexOutputV1Schema,
  type ConfidenceMatrix,
  type CoreSystem,
  type DailyGuidance,
  type IdentitySummary,
  type Sections,
  type SoulCodexOutputV1,
} from "./schema";
import { buildCodexReadingBadges, type ConfidenceResult } from "../compute/confidence";
import { runSoulCodexEngine } from "./engine";
export { runSoulCodexEngine };

type AnyProfile = Record<string, any>;

function nowIso(): string {
  return new Date().toISOString();
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function formatDeg(deg: number | null | undefined): string | undefined {
  if (typeof deg !== "number" || Number.isNaN(deg)) return undefined;
  const d = Math.floor(Math.abs(deg));
  const minutes = Math.floor((Math.abs(deg) - d) * 60);
  return `${d}°${pad2(minutes)}′`;
}

function signElement(sign?: string | null): string | null {
  const s = (sign ?? "").toLowerCase();
  if (!s) return null;
  if (["aries", "leo", "sagittarius"].includes(s)) return "Fire";
  if (["taurus", "virgo", "capricorn"].includes(s)) return "Earth";
  if (["gemini", "libra", "aquarius"].includes(s)) return "Air";
  if (["cancer", "scorpio", "pisces"].includes(s)) return "Water";
  return null;
}

function signMode(sign?: string | null): string | null {
  const s = (sign ?? "").toLowerCase();
  if (!s) return null;
  if (["aries", "cancer", "libra", "capricorn"].includes(s)) return "Cardinal";
  if (["taurus", "leo", "scorpio", "aquarius"].includes(s)) return "Fixed";
  if (["gemini", "virgo", "sagittarius", "pisces"].includes(s)) return "Mutable";
  return null;
}

function uniq<T>(items: (T | null | undefined)[]): T[] {
  const out: T[] = [];
  for (const i of items) {
    if (i == null) continue;
    if (!out.includes(i)) out.push(i);
  }
  return out;
}

function asYyyyMmDd(input: any): string | undefined {
  if (!input) return undefined;
  if (typeof input === "string") return input.slice(0, 10);
  if (input instanceof Date) return input.toISOString().slice(0, 10);
  return undefined;
}

function normalizeConfidence(profile: AnyProfile): ConfidenceResult | null {
  const conf = profile?.confidence ?? profile?.meta?.confidence ?? null;
  if (!conf) return null;
  return buildCodexReadingBadges(conf);
}

function buildConfidenceMatrix(profile: AnyProfile): ConfidenceMatrix {
  const conf = normalizeConfidence(profile);
  const badge = conf?.badge ?? "unverified";

  // Numerology requires only birth date (date-only is stable).
  const birthDate = asYyyyMmDd(profile?.birthDate ?? profile?.birth?.birthDate ?? profile?.signals?.birthDate);
  const numerology: ConfidenceMatrix["numerology"] = birthDate ? "verified" : "unverified";

  // Astrology + Human Design both require time+geo to be fully verified; reuse computed badge.
  const astrology: ConfidenceMatrix["astrology"] = badge;
  const human_design: ConfidenceMatrix["human_design"] = badge;

  // Overall is a coarse quality signal (high when we have verified chart layer + date).
  const overall: ConfidenceMatrix["overall"] =
    astrology === "verified" && human_design === "verified" && numerology === "verified"
      ? "high"
      : numerology === "verified" && (astrology === "verified" || astrology === "partial")
        ? "medium"
        : "low";

  return { astrology, human_design, numerology, overall };
}

function buildCoreSystem(profile: AnyProfile): CoreSystem {
  const astro = profile?.astrologyData ?? profile?.astrology ?? {};
  const hd = profile?.humanDesignData ?? profile?.humanDesign ?? {};
  const num = profile?.numerologyData ?? profile?.numerology ?? {};

  const sunSign = astro?.sunSign;
  const moonSign = astro?.moonSign;
  const risingSign = astro?.risingSign;

  const sunDeg = formatDeg(astro?.planets?.sun?.degree ?? astro?.planets?.sun?.longitude);
  const moonDeg = formatDeg(astro?.planets?.moon?.degree ?? astro?.planets?.moon?.longitude);
  const risingDeg = formatDeg(astro?.ascendant?.degree ?? astro?.ascendant?.longitude);

  const coreAstro = {
    sun: sunSign ? `${sunSign}${sunDeg ? ` ${sunDeg}` : ""}` : undefined,
    moon: moonSign ? `${moonSign}${moonDeg ? ` ${moonDeg}` : ""}` : undefined,
    rising: risingSign ? `${risingSign}${risingDeg ? ` ${risingDeg}` : ""}` : undefined,
    dominant_elements: uniq([signElement(sunSign), signElement(moonSign), signElement(risingSign)]),
    dominant_modes: uniq([signMode(sunSign), signMode(moonSign), signMode(risingSign)]),
    major_signatures: uniq([
      sunSign ? `${sunSign} Sun` : null,
      moonSign ? `${moonSign} Moon` : null,
      risingSign ? `${risingSign} Rising` : null,
    ]),
  };

  const coreHd = {
    type: hd?.type ?? undefined,
    strategy: hd?.strategy ?? undefined,
    authority: hd?.authority ?? undefined,
    profile: hd?.profile ?? undefined,
    definition: hd?.definition ?? undefined,
    signature: hd?.signature ?? undefined,
    not_self_theme: hd?.notSelfTheme ?? hd?.not_self_theme ?? undefined,
  };

  const lifePath = num?.lifePath ?? num?.lifePathNumber;
  const coreNum = {
    life_path: typeof lifePath === "number" ? lifePath : lifePath ? parseInt(String(lifePath), 10) : undefined,
  };

  return {
    astrology: coreAstro,
    human_design: coreHd,
    numerology: coreNum,
  };
}

function defaultIdentitySummary(profile: AnyProfile, core: CoreSystem): IdentitySummary {
  const arch =
    profile?.archetype?.name ??
    profile?.archetypeData?.archetype ??
    profile?.archetypeData?.title ??
    profile?.archetypeData?.name ??
    "Soul Codex";

  const sun = core.astrology.sun?.split(" ")[0];
  const rising = core.astrology.rising?.split(" ")[0];
  const hdType = core.human_design.type;
  const lp = core.numerology.life_path;

  const codename = String(profile?.synthesis?.codename ?? profile?.codename ?? arch);

  const oneLineParts = [
    sun ? `${sun} structure` : null,
    rising ? `${rising} surface` : null,
    hdType ? `${hdType} timing` : null,
    typeof lp === "number" ? `Life Path ${lp}` : null,
  ].filter(Boolean);

  const one_line =
    oneLineParts.length > 0
      ? `${arch} — ${oneLineParts.join(", ")}.`
      : `${arch}.`;

  const system_translation = [
    sun ? `You process through ${sun.toLowerCase()} refinement.` : null,
    rising ? `You protect through ${rising.toLowerCase()} observation.` : null,
    hdType ? `You regulate through ${hdType} energy mechanics.` : null,
    typeof lp === "number" ? `You aim toward Life Path ${lp} meaning.` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    codename,
    one_line,
    system_translation: system_translation || "You move through the world by noticing patterns, calibrating, and choosing what lasts.",
  };
}

function buildIdentityFromEngine(profile: AnyProfile, core: CoreSystem, engine: ReturnType<typeof runSoulCodexEngine>): IdentitySummary {
  const arch =
    profile?.archetype?.name ??
    profile?.archetypeData?.archetype ??
    profile?.archetypeData?.title ??
    profile?.archetypeData?.name ??
    "Soul Codex";

  const coreIdentityPool = (engine.statements_by_section as any)?.core_identity ?? [];
  const bestCore = Array.isArray(coreIdentityPool) && coreIdentityPool.length ? coreIdentityPool[0] : null;

  const codename = String(profile?.synthesis?.codename ?? profile?.codename ?? arch);
  const one_line = typeof bestCore?.text === "string" ? bestCore.text : defaultIdentitySummary(profile, core).one_line;

  const topTraits = engine.trait_signals.slice(0, 3).map((t) => t.trait_key.replace(/_/g, " "));
  const system_translation =
    topTraits.length > 0
      ? `Trait signals emphasize ${topTraits.join(", ")}.`
      : defaultIdentitySummary(profile, core).system_translation;

  return { codename, one_line, system_translation };
}

function bulletsFromText(text: any, max = 5): string[] {
  if (typeof text !== "string") return [];
  const raw = text
    .split(/\n+/g)
    .map((l) => l.trim())
    .filter(Boolean);
  const bulletish = raw
    .flatMap((l) => l.split(/•|- /g).map((x) => x.trim()))
    .filter((x) => x.length > 10);
  const out: string[] = [];
  for (const b of bulletish) {
    if (out.length >= max) break;
    if (!out.includes(b)) out.push(b);
  }
  return out;
}

function sectionFromEngine(title: string, statements: any): { title: string; summary: string; bullets: string[] } {
  const list = Array.isArray(statements) ? statements : [];
  const bullets = list.map((s) => (typeof s?.text === "string" ? s.text.trim() : "")).filter(Boolean).slice(0, 5);
  const summary = bullets[0] ?? "No data yet.";
  return { title, summary, bullets: bullets.slice(0, 4) };
}

function buildSectionsFromEngine(engine: ReturnType<typeof runSoulCodexEngine>): Sections {
  const by = engine.statements_by_section as any;
  return {
    how_you_work: sectionFromEngine("How You Work", by.how_you_work),
    decision_code: sectionFromEngine("Decision Code", by.decision_code),
    relational_pattern: sectionFromEngine("Relational Pattern", by.relational_pattern),
    failure_conditions: sectionFromEngine("Failure Conditions", by.failure_conditions),
    optimal_conditions: sectionFromEngine("Optimal Conditions", by.optimal_conditions),
    distortion_mode: sectionFromEngine("Distortion Mode", by.distortion_mode),
    power_mode: sectionFromEngine("Power Mode", by.power_mode),
    mission_arc: sectionFromEngine("Mission Arc", by.mission_arc),
  };
}

function buildDailyGuidanceFromEngine(engine: ReturnType<typeof runSoulCodexEngine>): DailyGuidance {
  return engine.daily_guidance;
}

export function generateSoulCodexOutputV1(input: {
  profile: AnyProfile;
  profileId: string;
  toneMode?: ToneMode;
}): SoulCodexOutputV1 {
  const core = buildCoreSystem(input.profile);
  const toneMode = input.toneMode ?? "clean";

  const engine = runSoulCodexEngine({
    toneMode,
    astrology: (input.profile?.astrologyData ?? input.profile?.astrology ?? null) as any,
    human_design: (input.profile?.humanDesignData ?? input.profile?.humanDesign ?? null) as any,
    numerology: (input.profile?.numerologyData ?? input.profile?.numerology ?? null) as any,
    mirror: (input.profile?.mirror ?? input.profile?.mirrorAnswers ?? null) as any,
  });

  const identity = buildIdentityFromEngine(input.profile, core, engine);

  const out: SoulCodexOutputV1 = {
    profile_id: input.profileId,
    version: "soul_codex_v1",
    generated_at: nowIso(),
    confidence: buildConfidenceMatrix(input.profile),
    input_summary: {
      birth_date: asYyyyMmDd(input.profile?.birthDate ?? input.profile?.birth?.birthDate) ?? "unknown",
      birth_time: input.profile?.birthTime || undefined,
      birth_location: input.profile?.birthLocation || undefined,
    },
    core_system: core,
    identity_summary: identity,
    sections: buildSectionsFromEngine(engine),
    daily_guidance: buildDailyGuidanceFromEngine(engine),
    tone_mode: toneMode,
  };

  // Contract enforcement.
  return soulCodexOutputV1Schema.parse(out);
}

