import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import ReadingElement from "@/components/soul-codex/ReadingElement";
import LimitationsPanel from "@/components/soul-codex/LimitationsPanel";
import { IconAlert, IconArrowLeft, IconLogo } from "../components/Icons";
import { loadActiveProfile } from "../lib/profileStorage";
import {
  getVerifiedPlacement,
  placementDisplayStatus,
  type PlacementLike,
  type VerifiedPlacement,
} from "../lib/placementVerification";
import type { DisplayMode, ReadingElement as ReadingElementType } from "@soulcodex/core";

function chartFromProfile(profile: any) {
  return profile?.chart ?? profile?.astrologyData?.chart ?? profile?.astrologyData ?? {};
}

function numerologyFromProfile(profile: any) {
  return profile?.numerology ?? profile?.numerologyData ?? {};
}

function verifiedConfidence(placement: VerifiedPlacement): number | null {
  const confidence = placement.evidence.confidence;
  return typeof confidence === "number" && Number.isFinite(confidence)
    ? Math.max(0, Math.min(100, confidence))
    : null;
}

function evidenceFor(label: string, placement: VerifiedPlacement) {
  const degree = typeof placement.degree === "number" ? `${placement.degree}° ` : "";
  return [{
    source: placement.evidence.source ?? "verified calculation",
    description: `${label} at ${degree}${placement.sign}; engine ${placement.evidence.engine}; calculated ${placement.evidence.calculatedAt}`,
    value: `${degree}${placement.sign}`,
    verified: true,
  }];
}

function buildPlacementReading(
  kind: "sun" | "moon" | "rising",
  placement: VerifiedPlacement,
): ReadingElementType | null {
  const confidence = verifiedConfidence(placement);
  if (confidence === null) return null;

  const sign = placement.sign;
  const evidence = evidenceFor(kind === "rising" ? "Ascendant" : kind[0].toUpperCase() + kind.slice(1), placement);

  if (kind === "sun") {
    return {
      headline: `Your ${sign} Sun describes the identity pattern you consciously develop.`,
      mechanism: `${sign} themes shape how you organize purpose, attention, and self-expression.`,
      protection: "You may lean on your strongest identity pattern when uncertainty makes you feel exposed.",
      howOthersSeeit: "People usually notice the repeated choices and standards through which you express this pattern.",
      gift: "Used deliberately, this placement can become a stable source of direction and craft.",
      cost: "Over-identifying with one pattern can turn a strength into rigidity.",
      action: "Choose one strength to use deliberately today instead of trying to perform the whole identity at once.",
      evidence,
      confidence,
      verified: true,
      visibleIn: ["essential", "complete", "technical"],
    };
  }

  if (kind === "moon") {
    return {
      headline: `Your ${sign} Moon describes a verified emotional-processing pattern.`,
      mechanism: `${sign} themes influence what helps you feel safe, understood, and internally settled.`,
      protection: "Under pressure, you may default to familiar emotional habits before conscious reasoning catches up.",
      howOthersSeeit: "Close relationships notice this pattern most clearly because it appears in your private reactions.",
      gift: "When understood, the Moon pattern becomes a practical guide for regulation and emotional honesty.",
      cost: "Automatic protection can become avoidance when it is never examined.",
      action: "Name the feeling before explaining it. Description first, interpretation second.",
      evidence,
      confidence,
      verified: true,
      visibleIn: ["complete", "technical"],
    };
  }

  return {
    headline: `Your verified ${sign} Ascendant describes how you initially meet the world.`,
    mechanism: `${sign} themes influence first impressions, instinctive presentation, and the style through which you enter new situations.`,
    protection: "The Ascendant can function as a fast protective strategy before trust is established.",
    howOthersSeeit: "People often encounter this layer before they understand the rest of your chart.",
    gift: "Used consciously, this presentation style helps you navigate unfamiliar environments without losing yourself.",
    cost: "A protective first impression can become a wall when it remains active after safety is established.",
    action: "Notice where your first-impression strategy is useful and where it is keeping connection at a distance.",
    evidence,
    confidence,
    verified: true,
    visibleIn: ["complete", "technical"],
  };
}

function buildLifePathReading(profile: any): ReadingElementType | null {
  const numerology = numerologyFromProfile(profile);
  const lifePath = numerology.lifePath ?? numerology.lifePathNumber ?? profile?.lifePathNumber;
  if (typeof lifePath !== "number") return null;

  return {
    headline: `Life Path ${lifePath} is the long-form theme calculated from your birth date.`,
    mechanism: "This number summarizes a recurring developmental direction rather than a fixed personality sentence.",
    protection: "A life-path theme can become a role you overperform when you forget that growth also requires rest and revision.",
    howOthersSeeit: "People may repeatedly invite you into situations that exercise this theme.",
    gift: "The number offers a stable lens for recognizing recurring lessons across different stages of life.",
    cost: "Treating the number as destiny can flatten the complexity of your actual choices.",
    action: "Use the number as a question for today, not a verdict about your entire life.",
    evidence: [{
      source: "birth-date calculation",
      description: `Life Path calculated from ${profile?.birthDate ?? "saved birth date"}`,
      value: String(lifePath),
      verified: true,
    }],
    confidence: 100,
    verified: true,
    visibleIn: ["essential", "complete", "technical"],
  };
}

function unresolvedCard(label: string, placement: PlacementLike | null | undefined) {
  const status = placementDisplayStatus(placement);
  return (
    <div className="glassmorphism" style={{ padding: "1.5rem", borderRadius: 18, marginBottom: "1rem", borderLeft: "4px solid var(--sc-gold)" }}>
      <h3 style={{ margin: "0 0 .5rem", color: "var(--sc-ivory)" }}>{label}</h3>
      <p style={{ margin: 0, color: "var(--sc-stone)", lineHeight: 1.6 }}>{status}. Interpretation is paused until the calculation layer supplies verified evidence.</p>
    </div>
  );
}

export default function VerifiedCodexReadingPage() {
  const [, navigate] = useLocation();
  const [displayMode, setDisplayMode] = useState<DisplayMode>("complete");
  const profile = loadActiveProfile();

  const chart = chartFromProfile(profile);
  const sunSource = chart?.sun as PlacementLike | undefined;
  const moonSource = chart?.moon as PlacementLike | undefined;
  const risingSource = (chart?.rising ?? chart?.ascendant) as PlacementLike | undefined;

  const verifiedSun = getVerifiedPlacement(sunSource);
  const verifiedMoon = getVerifiedPlacement(moonSource);
  const verifiedRising = getVerifiedPlacement(risingSource);

  const readings = useMemo(() => {
    const values: ReadingElementType[] = [];
    const sun = verifiedSun ? buildPlacementReading("sun", verifiedSun) : null;
    const moon = verifiedMoon ? buildPlacementReading("moon", verifiedMoon) : null;
    const rising = verifiedRising ? buildPlacementReading("rising", verifiedRising) : null;
    const lifePath = buildLifePathReading(profile);
    if (sun) values.push(sun);
    if (moon) values.push(moon);
    if (rising) values.push(rising);
    if (lifePath) values.push(lifePath);
    return values;
  }, [profile, verifiedSun, verifiedMoon, verifiedRising]);

  const visibleReadings = readings.filter((reading) => reading.visibleIn.includes(displayMode));
  const codename = profile?.codename ?? profile?.synthesis?.codename ?? "Soul Profile";

  if (!profile) {
    return (
      <div className="nebula-bg" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
        <div className="glassmorphism" style={{ maxWidth: 460, padding: "2rem", borderRadius: 24, textAlign: "center" }}>
          <IconAlert size={42} style={{ color: "var(--sc-gold)", marginBottom: "1rem" }} />
          <h1 style={{ color: "var(--sc-ivory)" }}>No active profile</h1>
          <p style={{ color: "var(--sc-stone)", lineHeight: 1.6 }}>Create or restore one profile before requesting a reading. The app will not invent missing birth data to keep the page cheerful.</p>
          <button className="btn btn-primary" onClick={() => navigate("/create")}>Create profile</button>
        </div>
      </div>
    );
  }

  return (
    <div className="nebula-bg" style={{ minHeight: "100vh", padding: "var(--safe-top) 1.25rem var(--safe-bottom)" }}>
      <main style={{ maxWidth: 700, margin: "0 auto", paddingBottom: "5rem" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 0" }}>
          <button className="btn btn-ghost" onClick={() => navigate("/today")}><IconArrowLeft size={20} /></button>
          <IconLogo size={44} />
          <div style={{ width: 44 }} />
        </header>

        <section className="glassmorphism" style={{ padding: "2.25rem", borderRadius: 28, textAlign: "center", marginBottom: "1.5rem" }}>
          <div className="section-label" style={{ color: "var(--sc-gold)", marginBottom: ".75rem" }}>SOUL CODEX READING</div>
          <h1 className="heading-display" style={{ color: "var(--sc-ivory)", marginBottom: "1rem" }}>{codename}</h1>
          <ConfidenceBadge badge={visibleReadings.length ? "verified" : "partial"} reason="Only evidence-bearing placements are interpreted." />
        </section>

        <div style={{ display: "flex", justifyContent: "center", gap: ".6rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {(["essential", "complete", "technical"] as const).map((mode) => (
            <button key={mode} onClick={() => setDisplayMode(mode)} className={displayMode === mode ? "btn btn-primary" : "btn btn-secondary"}>{mode}</button>
          ))}
        </div>

        <section aria-label="Verified reading elements">
          {visibleReadings.map((reading, index) => (
            <ReadingElement key={`${reading.headline}-${index}`} element={reading} mode={displayMode} showEvidence={displayMode === "technical"} />
          ))}
        </section>

        {!verifiedSun && unresolvedCard("Sun", sunSource)}
        {!verifiedMoon && unresolvedCard("Moon", moonSource)}
        {!verifiedRising && unresolvedCard("Ascendant", risingSource)}

        {(!verifiedSun || !verifiedMoon || !verifiedRising) && (
          <div style={{ padding: "1.25rem", borderRadius: 16, margin: "1.25rem 0", background: "rgba(59,130,246,.08)", borderLeft: "4px solid #3b82f6", color: "var(--sc-ivory)", lineHeight: 1.65 }}>
            Interpretation paused for every placement that lacks verified source, engine, calculation timestamp, and evidence-based confidence. A populated sign string is not proof. A birth time is not proof either.
          </div>
        )}

        <LimitationsPanel profile={profile} />
      </main>
    </div>
  );
}
