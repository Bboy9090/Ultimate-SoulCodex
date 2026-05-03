import { apiFetch } from "../lib/queryClient";
import type { CSSProperties } from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import PlanetWheel from "../components/PlanetWheel";
import { 
  IconMoon, IconReading, IconIdentity, IconEarth, 
  IconChevronDown, IconArrowLeft 
} from "../components/Icons";

interface PlanetPosition {
  name: string;
  sign: string;
  degree: number;
  longitude: number;
}

interface Alignment {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
  interpretation: string;
}

interface PersonalTransit {
  transitingPlanet: string;
  transitingSign: string;
  transitingDegree: number;
  natalPlanet: string;
  natalSign: string;
  natalDegree: number;
  aspect: string;
  orb: number;
  interpretation: string;
  intensity: "high" | "medium" | "low";
}

interface DailyHoroscopeData {
  date: string;
  horoscope: string;
  planets: PlanetPosition[];
  alignments: Alignment[];
  personalTransits: PersonalTransit[];
  moonPhase: { phase: string; percentage: number };
  personalDayNumber: number;
}

import { cleanCodexLine } from "../lib/soul-codex/utils/cleanCodexLine";

const DAY_NUMBER_MEANINGS: Record<number, string> = {
  1:  "A day for initiative — start something, lead, act on instinct.",
  2:  "A day for cooperation — listen more, push less, let partnerships work.",
  3:  "A day for expression — say what I mean, create, connect through words.",
  4:  "A day for structure — organize, plan, build something that lasts.",
  5:  "A day for change — break a routine, try something different, stay flexible.",
  6:  "A day for responsibility — show up for someone, nurture what matters.",
  7:  "A day for reflection — step back, think deeply, trust my gut.",
  8:  "A day for power — own my authority, make the hard call, don't shrink.",
  9:  "A day for completion — finish what's lingering, release, clear the slate.",
  11: "A day for intuition — trust the flash of insight before logic talks me out of it.",
  22: "A day for mastery — commit to the work, not just the idea.",
  33: "A day for presence — my steadiness matters more than my output.",
};

function getDeterministicArchetypeInterpretation(d: any): string {
  if (d.sunSign === "Capricorn" && d.moonSign === "Pisces") {
    return "I build rigid structures to protect my soft interior. I work until I'm exhausted to avoid feeling my own sensitivity.";
  }
  if (d.sunSign === "Leo" && d.moonSign === "Scorpio") {
    return "I crave the spotlight but keep my true intentions hidden. My power comes from the tension between my public warmth and private intensity.";
  }
  if (d.sunSign === "Virgo" && d.moonSign === "Gemini") {
    return "I am a nervous system in search of an anchor. My mind moves at a speed that my physical form cannot always support.";
  }
  if (d.sunSign === "Taurus" && d.moonSign === "Aries") {
    return "I am a fortress that strikes with precision. I demand stability, but I have a short fuse for anything that feels like a delay.";
  }
  if (d.sunSign === "Aquarius" && d.moonSign === "Cancer") {
    return "I am a visionary with a heavy heart. I want to save the future, but I am often pulled back by the nostalgia of what I've lost.";
  }
  if (d.hdType === "Projector" && d.sunSign === "Aries") {
    return "I have the vision to lead but not the sustained energy to labor. I burn out when I try to run the race I've already finished in my mind.";
  }
  if (d.hdType === "Manifesting Generator") {
    return "I move fast to find what works, skipping steps that others find essential. My frustration comes from having to go back and fix the foundations I rushed past.";
  }
  if (d.hdType === "Manifestor") {
    return "I am designed to impact, not to be liked. My presence alone changes the room, and I feel trapped when I have to ask for permission.";
  }
  if (d.hdType === "Reflector") {
    return "I am a mirror of my environment. I do not have a fixed center, only a lunar cycle that reveals the truth of where I am standing.";
  }
  return `As a ${d.archetype}, I process life through a lens of ${d.themes[0] || "accuracy"} and ${d.themes[1] || "depth"}. My default is to ${d.shadows[0] || "over-analyze"} when I feel pressured.`;
};

function getDayMeaning(num: number): string {
  return DAY_NUMBER_MEANINGS[num] || DAY_NUMBER_MEANINGS[num % 10] || DAY_NUMBER_MEANINGS[1];
}

function MoonPhaseIcon({ phase, size = 40 }: { phase: string; size?: number }) {
  const r = size / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  let illuminatedSide: "right" | "left" = "right";
  let curveOffset = 0;
  const p = phase.toLowerCase();
  if (p.includes("new"))              { curveOffset = r;        illuminatedSide = "right"; }
  else if (p.includes("waxing cres")) { curveOffset = r * 0.6;  illuminatedSide = "right"; }
  else if (p.includes("first"))       { curveOffset = 0;        illuminatedSide = "right"; }
  else if (p.includes("waxing gib"))  { curveOffset = -r * 0.6; illuminatedSide = "right"; }
  else if (p.includes("full"))        { curveOffset = -r;       illuminatedSide = "right"; }
  else if (p.includes("waning gib"))  { curveOffset = -r * 0.6; illuminatedSide = "left";  }
  else if (p.includes("last") || p.includes("third")) { curveOffset = 0; illuminatedSide = "left"; }
  else if (p.includes("waning cres")) { curveOffset = r * 0.6;  illuminatedSide = "left";  }
  const dark = "#1a1a2e";
  const light = "#e2e8f0";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill={dark} stroke="rgba(212,168,95,0.3)" strokeWidth="1" />
      {illuminatedSide === "right" ? (
        <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${Math.abs(curveOffset)} ${r} 0 0 ${curveOffset >= 0 ? 1 : 0} ${cx} ${cy - r}`} fill={light} opacity="0.9" />
      ) : (
        <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} A ${Math.abs(curveOffset)} ${r} 0 0 ${curveOffset >= 0 ? 0 : 1} ${cx} ${cy - r}`} fill={light} opacity="0.9" />
      )}
    </svg>
  );
}

function SkeletonBlock({ width = "100%", height = "1rem", style }: { width?: string; height?: string; style?: CSSProperties }) {
  return (
    <div style={{
      width, height, borderRadius: "8px",
      background: "linear-gradient(90deg, rgba(212,168,95,0.1) 25%, rgba(212,168,95,0.2) 50%, rgba(212,168,95,0.1) 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", ...style,
    }} />
  );
}

function SkeletonPage() {
  return (
    <div style={{ padding: "2rem 1rem", maxWidth: "800px", margin: "0 auto" }}>
      <SkeletonBlock width="200px" height="1.5rem" style={{ marginBottom: "0.5rem" }} />
      <SkeletonBlock width="140px" height="1rem" style={{ marginBottom: "2rem" }} />
      <SkeletonBlock height="6rem" style={{ marginBottom: "2rem", borderRadius: "16px" }} />
      <SkeletonBlock height="200px" style={{ marginBottom: "2rem", borderRadius: "16px" }} />
      <SkeletonBlock height="100px" style={{ marginBottom: "1rem", borderRadius: "16px" }} />
      <SkeletonBlock height="100px" style={{ borderRadius: "16px" }} />
    </div>
  );
}

function IntensityDot({ intensity }: { intensity: string }) {
  const colors: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };
  return (
    <span style={{
      display: "inline-block", width: "8px", height: "8px", borderRadius: "50%",
      backgroundColor: colors[intensity] || colors.low,
      boxShadow: `0 0 6px ${colors[intensity] || colors.low}`,
    }} />
  );
}

function TransitCard({ transit }: { transit: PersonalTransit }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      style={{
        background: "rgba(15,20,40,0.6)", border: "1px solid rgba(212,168,95,0.15)",
        borderRadius: "12px", padding: "1rem 1.25rem",
        cursor: "pointer", transition: "all 250ms ease",
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <IntensityDot intensity={transit.intensity} />
          <span style={{ fontWeight: 600, color: "#f8fafc", fontSize: "0.9rem" }}>
            {transit.transitingPlanet} {transit.aspect} {transit.natalPlanet}
          </span>
        </div>
        <IconChevronDown size={14} style={{ color: "var(--muted-foreground)", transition: "transform 200ms ease", transform: expanded ? "rotate(180deg)" : "none" }} />
      </div>
      <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: "0.2rem" }}>
        {transit.transitingPlanet} in {transit.transitingSign} ({transit.transitingDegree.toFixed(1)}°) → natal {transit.natalPlanet} in {transit.natalSign} ({transit.natalDegree.toFixed(1)}°)
      </div>
      {expanded && (
        <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(212,168,95,0.15)", fontSize: "0.875rem", color: "#cbd5e1", lineHeight: 1.65 }}>
          {transit.interpretation}
          <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <IntensityDot intensity={transit.intensity} />
            <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "capitalize" }}>
              {transit.intensity} intensity · Orb {transit.orb.toFixed(1)}°
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function aspectColor(aspect: string): string {
  const colors: Record<string, string> = {
    Trine: "#22c55e", Square: "#ef4444", Opposition: "#a855f7", Conjunction: "#fbbf24", Sextile: "#2dd4bf",
  };
  return colors[aspect] || "#94a3b8";
}

const INTENSITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export default function DailyHoroscopePage() {
  const profileData = (() => {
    try { const s = localStorage.getItem("soulProfile"); if (s) return JSON.parse(s); } catch {}
    return null;
  })();
  const profileId = profileData?.id || profileData?.profileId;

  const { data, isLoading, isError, error, refetch } = useQuery<DailyHoroscopeData>({
    queryKey: ["/api/profiles", profileId, "daily-horoscope"],
    queryFn: async () => {
      const res = await apiFetch(`/api/profiles/${profileId}/daily-horoscope`);
      if (res.status === 404 && profileData) {
        // ID mismatch between local and server (e.g. server restart). Re-sync.
        console.log("[DailyHoroscope] ID mismatch. Re-syncing profile...");
        await apiRequest("/api/soul-archetype", {
          method: "POST",
          body: JSON.stringify(profileData)
        });
        // Try again after sync
        const retryRes = await apiFetch(`/api/profiles/${profileId}/daily-horoscope`);
        if (!retryRes.ok) throw new Error(await retryRes.text());
        return retryRes.json();
      }
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!profileId,
    retry: 1,
  });

  if (!profileId) {
    return (
      <div style={{ padding: "4rem 1rem", textAlign: "center", maxWidth: "560px", margin: "0 auto" }}>
        <IconMoon size={72} style={{ marginBottom: "1rem", opacity: 0.4 }} />
        <h2 className="gradient-text" style={{ marginBottom: "1rem" }}>No Profile Found</h2>
        <p style={{ color: "var(--muted-foreground)", marginBottom: "2rem", lineHeight: 1.6, fontSize: "0.9rem" }}>
          Complete the onboarding first to receive a personal daily reading.
        </p>
        <Link href="/start"><button className="btn btn-primary btn-large">Build My Profile</button></Link>
      </div>
    );
  }

  if (isLoading) return <SkeletonPage />;

  if (isError || !data) {
    return (
      <div style={{ padding: "4rem 1rem", textAlign: "center", maxWidth: "560px", margin: "0 auto" }}>
        <h2 style={{ color: "#f8fafc", marginBottom: "1rem" }}>Something went wrong</h2>
        <p style={{ color: "var(--muted-foreground)", marginBottom: "2rem", lineHeight: 1.6, fontSize: "0.9rem" }}>
          {error instanceof Error ? error.message : "Could not load today's reading. Try again later."}
        </p>
        <Link href="/profile"><button className="btn btn-secondary">Back to Profile</button></Link>
      </div>
    );
  }

  const formattedDate = new Date(data.date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // Sort transits by intensity for top-influences section
  const sortedTransits = [...data.personalTransits].sort(
    (a, b) => (INTENSITY_ORDER[a.intensity] ?? 2) - (INTENSITY_ORDER[b.intensity] ?? 2)
  );
  const topInfluences = sortedTransits.slice(0, 3);
  const remainingTransits = sortedTransits.slice(3);

  return (
    <div style={{ padding: "2rem 1rem 4rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* ── 1. Header ────────────────────────────────────────────────────── */}
        <section style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <MoonPhaseIcon phase={data.moonPhase.phase} size={52} />
          <div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 4vw, 2rem)", color: "var(--cosmic-gold)", marginBottom: "0.2rem" }}>
              Today's Reading
            </h1>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.8rem" }}>{formattedDate}</p>
            <p style={{ color: "var(--cosmic-lavender)", fontSize: "0.78rem", marginTop: "0.15rem" }}>
              {data.moonPhase.phase} · {data.moonPhase.percentage}% illuminated
            </p>
          </div>
        </section>

        {/* ── 2. Main Reading — most prominent ────────────────────────────── */}
        <section style={{
          background: "rgba(15,20,40,0.6)", border: "1px solid rgba(212,168,95,0.2)",
          borderTop: "2px solid var(--cosmic-purple)",
          borderRadius: "14px", padding: "1.75rem 1.5rem",
        }}>
          <h3 style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#D4A85F", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <IconReading size={12} /> My Reading
          </h3>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1rem, 2.5vw, 1.2rem)", lineHeight: 1.8, color: "#f1f5f9", margin: 0 }}>
            {cleanCodexLine(data.horoscope, "Your celestial alignment is currently calibrating. Focus on steady progress while the energies stabilize.")}
          </p>
        </section>

        {/* ── 3. Personal Day — compact context note ──────────────────────── */}
        <div style={{
          display: "flex", gap: "0.75rem", alignItems: "center",
          padding: "0.75rem 1rem",
          background: "rgba(212,168,95,0.05)", border: "1px solid rgba(212,168,95,0.14)",
          borderRadius: "10px",
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, var(--cosmic-purple), var(--cosmic-pink))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "0.85rem", color: "#fff",
          }}>
            {data.personalDayNumber}
          </div>
          <p style={{ color: "rgba(230,228,255,0.75)", fontSize: "0.83rem", margin: 0, lineHeight: 1.5 }}>
            <strong style={{ color: "var(--cosmic-lavender)", fontWeight: 600 }}>Personal Day {data.personalDayNumber} — </strong>
            {getDayMeaning(data.personalDayNumber)}
          </p>
        </div>

        {/* ── 4. Top Influences — top 3 transits by intensity ─────────────── */}
        {topInfluences.length > 0 && (
          <section>
            <h3 style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#D4A85F", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <IconIdentity size={12} /> Top Influences Today
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              {topInfluences.map((t, i) => (
                <TransitCard key={i} transit={t} />
              ))}
            </div>
          </section>
        )}

        {/* ── 5. Planet Wheel ──────────────────────────────────────────────── */}
        <section>
          <h3 style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#D4A85F", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <IconEarth size={16} style={{ color: "var(--cosmic-lavender)" }} /> Planetary Alignments Today
          </h3>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PlanetWheel planets={data.planets} alignments={data.alignments} size={400} />
          </div>
          {data.alignments.length > 0 && (
            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {data.alignments.slice(0, 5).map((al, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: "0.75rem",
                  padding: "0.7rem 1rem",
                  background: "rgba(212,168,95,0.05)", borderRadius: "10px",
                  border: "1px solid rgba(212,168,95,0.1)",
                }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: aspectColor(al.aspect), whiteSpace: "nowrap", minWidth: "fit-content" }}>
                    {al.planet1} {al.aspect} {al.planet2}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.55 }}>
                    {al.interpretation}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 6. Transit Detail — clearly secondary ────────────────────────── */}
        {(remainingTransits.length > 0 || (topInfluences.length === 0 && data.personalTransits.length > 0)) && (
          <section>
            <div style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              marginBottom: "0.75rem",
            }}>
              <div style={{ flex: 1, height: 1, background: "rgba(212,168,95,0.15)" }} />
              <span style={{ fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted-foreground)", opacity: 0.5, whiteSpace: "nowrap" }}>
                Transit Detail
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(212,168,95,0.15)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              {(remainingTransits.length > 0 ? remainingTransits : data.personalTransits).map((t, i) => (
                <TransitCard key={i} transit={t} />
              ))}
            </div>
          </section>
        )}

        <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
          <Link href="/profile">
            <button className="btn btn-ghost" style={{ fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <IconArrowLeft size={14} /> Back to Profile
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
