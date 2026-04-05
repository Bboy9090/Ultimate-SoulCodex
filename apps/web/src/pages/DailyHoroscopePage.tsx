import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import PlanetWheel from "../components/PlanetWheel";
import ConfidenceBadge from "@/components/ConfidenceBadge";

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

const DAY_NUMBER_MEANINGS: Record<number, string> = {
  1: "A day for initiative — start something, lead, act on instinct.",
  2: "A day for cooperation — listen more, push less, let partnerships work.",
  3: "A day for expression — say what you mean, create, connect through words.",
  4: "A day for structure — organize, plan, build something that lasts.",
  5: "A day for change — break a routine, try something different, stay flexible.",
  6: "A day for responsibility — show up for someone, nurture what matters.",
  7: "A day for reflection — step back, think deeply, trust your gut.",
  8: "A day for power — own your authority, make the hard call, don't shrink.",
  9: "A day for completion — finish what's lingering, release, clear the slate.",
  11: "A day for intuition — trust the flash of insight before logic talks you out of it.",
  22: "A day for mastery — commit to the work, not just the idea.",
  33: "A day for presence — your steadiness matters more than your output.",
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
  if (p.includes("new")) {
    curveOffset = r;
    illuminatedSide = "right";
  } else if (p.includes("waxing crescent")) {
    curveOffset = r * 0.6;
    illuminatedSide = "right";
  } else if (p.includes("first quarter")) {
    curveOffset = 0;
    illuminatedSide = "right";
  } else if (p.includes("waxing gibbous")) {
    curveOffset = -r * 0.6;
    illuminatedSide = "right";
  } else if (p.includes("full")) {
    curveOffset = -r;
    illuminatedSide = "right";
  } else if (p.includes("waning gibbous")) {
    curveOffset = -r * 0.6;
    illuminatedSide = "left";
  } else if (p.includes("last quarter") || p.includes("third quarter")) {
    curveOffset = 0;
    illuminatedSide = "left";
  } else if (p.includes("waning crescent")) {
    curveOffset = r * 0.6;
    illuminatedSide = "left";
  }

  const darkColor = "#1a1a2e";
  const lightColor = "#e2e8f0";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill={darkColor} stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
      {illuminatedSide === "right" ? (
        <path
          d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${Math.abs(curveOffset)} ${r} 0 0 ${curveOffset >= 0 ? 1 : 0} ${cx} ${cy - r}`}
          fill={lightColor}
          opacity="0.9"
        />
      ) : (
        <path
          d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} A ${Math.abs(curveOffset)} ${r} 0 0 ${curveOffset >= 0 ? 0 : 1} ${cx} ${cy - r}`}
          fill={lightColor}
          opacity="0.9"
        />
      )}
    </svg>
  );
}

function SkeletonBlock({ width = "100%", height = "1rem", style }: { width?: string; height?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: "8px",
        background: "linear-gradient(90deg, rgba(139,92,246,0.1) 25%, rgba(139,92,246,0.2) 50%, rgba(139,92,246,0.1) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
        ...style,
      }}
    />
  );
}

function SkeletonPage() {
  return (
    <div className="container" style={{ padding: "2rem 1rem", maxWidth: "800px" }}>
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
  const colors: Record<string, string> = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#22c55e",
  };
  return (
    <span
      style={{
        display: "inline-block",
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: colors[intensity] || colors.low,
        boxShadow: `0 0 6px ${colors[intensity] || colors.low}`,
      }}
    />
  );
}

function TransitCard({ transit }: { transit: PersonalTransit }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="glass-card-static"
      style={{
        padding: "1rem 1.25rem",
        cursor: "pointer",
        transition: "all 250ms ease",
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <IntensityDot intensity={transit.intensity} />
          <span style={{ fontWeight: 600, color: "#f8fafc", fontSize: "0.9375rem" }}>
            {transit.transitingPlanet} {transit.aspect} {transit.natalPlanet}
          </span>
        </div>
        <span
          style={{
            color: "var(--muted-foreground)",
            fontSize: "1.25rem",
            transition: "transform 200ms ease",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▾
        </span>
      </div>
      <div
        style={{
          fontSize: "0.8125rem",
          color: "var(--muted-foreground)",
          marginTop: "0.25rem",
        }}
      >
        {transit.transitingPlanet} in {transit.transitingSign} ({transit.transitingDegree.toFixed(1)}°) → natal{" "}
        {transit.natalPlanet} in {transit.natalSign} ({transit.natalDegree.toFixed(1)}°)
      </div>
      {expanded && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: "0.75rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid rgba(139,92,246,0.15)",
            fontSize: "0.875rem",
            color: "#cbd5e1",
            lineHeight: 1.6,
          }}
        >
          {transit.interpretation}
          <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <IntensityDot intensity={transit.intensity} />
            <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "capitalize" }}>
              {transit.intensity} intensity · Orb {transit.orb.toFixed(1)}°
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DailyHoroscopePage() {
  const profileData = (() => {
    try {
      const stored = localStorage.getItem("soulProfile");
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  })();

  const profileId = profileData?.id || profileData?.profileId;
  const profileConfidence = (() => {
    try {
      const raw = localStorage.getItem("soulConfidence");
      if (raw) return JSON.parse(raw);
      if (profileData?.confidence) return profileData.confidence;
    } catch {}
    return null;
  })();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<DailyHoroscopeData>({
    queryKey: ["/api/profiles", profileId, "daily-horoscope"],
    queryFn: async () => {
      const res = await fetch(`/api/profiles/${profileId}/daily-horoscope`);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!profileId,
  });

  if (!profileId) {
    return (
      <div className="container animate-fade-in" style={{ padding: "4rem 1rem", textAlign: "center", maxWidth: "600px" }}>
        <h2 className="gradient-text" style={{ marginBottom: "1rem" }}>No Profile Found</h2>
        <p style={{ color: "var(--muted-foreground)", marginBottom: "2rem", lineHeight: 1.6 }}>
          I need to complete the onboarding first to get my daily reading.
        </p>
        <Link href="/">
          <button className="btn btn-primary btn-large">Start Onboarding</button>
        </Link>
      </div>
    );
  }

  if (isLoading) return <SkeletonPage />;

  if (isError || !data) {
    return (
      <div className="container animate-fade-in" style={{ padding: "4rem 1rem", textAlign: "center", maxWidth: "600px" }}>
        <h2 style={{ color: "#f8fafc", marginBottom: "1rem" }}>Something went wrong</h2>
        <p style={{ color: "var(--muted-foreground)", marginBottom: "2rem", lineHeight: 1.6 }}>
          {error instanceof Error ? error.message : "Could not load today's reading. Try again later."}
        </p>
        <Link href="/profile">
          <button className="btn btn-secondary">Back to Profile</button>
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(data.date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const confBadge =
    (profileConfidence?.badge ??
      (profileConfidence?.label === "Verified"
        ? "verified"
        : profileConfidence?.label === "Partial"
          ? "partial"
          : "unverified")) as any;

  return (
    <div className="container animate-fade-in" style={{ padding: "2rem 1rem 4rem", maxWidth: "800px" }}>
      <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        <section style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <MoonPhaseIcon phase={data.moonPhase.phase} size={48} />
          <div>
            <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", color: "#f8fafc", marginBottom: "0.25rem" }}>
              Today's Reading
            </h1>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
              {formattedDate}
            </p>
            <p style={{ color: "var(--cosmic-lavender)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>
              {data.moonPhase.phase} · {data.moonPhase.percentage}% illuminated
            </p>
            {profileConfidence && (
              <div style={{ marginTop: "0.5rem" }}>
                <ConfidenceBadge
                  badge={confBadge}
                  label={profileConfidence?.label}
                  reason={profileConfidence?.reason}
                  size="sm"
                />
              </div>
            )}
            {profileConfidence?.aiAssuranceNote && (
              <div style={{ marginTop: "0.5rem", fontSize: "0.72rem", color: "var(--muted-foreground)", lineHeight: 1.55, maxWidth: 520 }}>
                {profileConfidence.aiAssuranceNote}
              </div>
            )}
          </div>
        </section>

        <section className="glass-card-static" style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--cosmic-purple), var(--cosmic-pink))",
              fontWeight: 700,
              fontSize: "0.875rem",
              color: "#fff",
            }}>
              {data.personalDayNumber}
            </span>
            <h3 style={{ fontSize: "1rem", color: "#f8fafc" }}>Personal Day {data.personalDayNumber}</h3>
          </div>
          <p style={{ color: "#cbd5e1", fontSize: "0.875rem", lineHeight: 1.6 }}>
            {getDayMeaning(data.personalDayNumber)}
          </p>
        </section>

        <section className="glass-card-static" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", color: "var(--cosmic-lavender)", marginBottom: "1rem", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            My Daily Reading
          </h3>
          <p style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(1.0625rem, 2.5vw, 1.25rem)",
            lineHeight: 1.7,
            color: "#f1f5f9",
          }}>
            {data.horoscope}
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: "1.125rem", color: "#f8fafc", marginBottom: "1rem" }}>
            Planetary Alignments Today
          </h3>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PlanetWheel planets={data.planets} alignments={data.alignments} size={400} />
          </div>
          {data.alignments.length > 0 && (
            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {data.alignments.slice(0, 5).map((al, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    background: "rgba(139,92,246,0.06)",
                    borderRadius: "12px",
                    border: "1px solid rgba(139,92,246,0.1)",
                  }}
                >
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: aspectColor(al.aspect),
                    whiteSpace: "nowrap",
                    minWidth: "fit-content",
                  }}>
                    {al.planet1} {al.aspect} {al.planet2}
                  </span>
                  <span style={{ fontSize: "0.8125rem", color: "#94a3b8", lineHeight: 1.5 }}>
                    {al.interpretation}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {data.personalTransits.length > 0 && (
          <section>
            <h3 style={{ fontSize: "1.125rem", color: "#f8fafc", marginBottom: "1rem" }}>
              Active Transits for Me
            </h3>
            <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {data.personalTransits.map((t, i) => (
                <TransitCard key={i} transit={t} />
              ))}
            </div>
          </section>
        )}

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link href="/profile">
            <button className="btn btn-ghost" style={{ fontSize: "0.875rem" }}>
              ← Back to Profile
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function aspectColor(aspect: string): string {
  const colors: Record<string, string> = {
    Trine: "#22c55e",
    Square: "#ef4444",
    Opposition: "#a855f7",
    Conjunction: "#fbbf24",
    Sextile: "#2dd4bf",
  };
  return colors[aspect] || "#94a3b8";
}
