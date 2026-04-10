import type { ReactNode } from "react";
import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import BirthChartPosterSVG, { type PosterData } from "../components/BirthChartPosterSVG";

const ZODIAC_SIGNS = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces",
];

const PLANET_LABELS: Record<string, string> = {
  sun:"☉ Sun", moon:"☽ Moon", mercury:"☿ Mercury", venus:"♀ Venus",
  mars:"♂ Mars", jupiter:"♃ Jupiter", saturn:"♄ Saturn",
  uranus:"♅ Uranus", neptune:"♆ Neptune", pluto:"♇ Pluto",
  north_node:"☊ North Node", chiron:"⚷ Chiron",
};

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction:"☌", opposition:"☍", trine:"△", square:"□",
  sextile:"⚹", quincunx:"⚻", semisquare:"∠", sesquisquare:"⚼",
};

const ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];

const cardBase = {
  background: "rgba(28,18,10,0.72)",
  border: "1px solid rgba(212,168,95,0.18)",
  borderRadius: 12,
  backdropFilter: "blur(16px)",
} as const;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <label style={{ display: "block", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(246,241,232,0.5)", marginBottom: "0.3rem" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function SignSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)} style={{ padding: "0.55rem 0.75rem" }}>
      <option value="">— none —</option>
      {ZODIAC_SIGNS.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sc-gold)", fontWeight: 700, marginBottom: "0.85rem", opacity: 0.8 }}>
      {children}
    </div>
  );
}

function planetHouse(lon: number, cusps: number[]): number {
  if (!cusps || cusps.length < 12) return 0;
  for (let i = 0; i < 12; i++) {
    const start = cusps[i];
    const end   = cusps[(i + 1) % 12];
    const lon360 = ((lon % 360) + 360) % 360;
    if (start <= end) {
      if (lon360 >= start && lon360 < end) return i + 1;
    } else {
      if (lon360 >= start || lon360 < end) return i + 1;
    }
  }
  return 1;
}

function getProfile() {
  try { return JSON.parse(localStorage.getItem("soulProfile") ?? "{}"); } catch { return {}; }
}

const DEMO: PosterData = {
  name: "", birthDate: "", sunSign: "Gemini", moonSign: "Pisces",
  risingSign: "Sagittarius", lifePathNumber: 9, masterNumber: 11,
};

export default function PosterPage() {
  const [data, setData]     = useState<PosterData>(DEMO);
  const [downloading, setDownloading]   = useState<number | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [computing, setComputing]       = useState(false);
  const [computeError, setComputeError] = useState<string | null>(null);
  const [profileAstro, setProfileAstro] = useState<any>(null);
  const [profileHD, setProfileHD]       = useState<any>(null);
  const [rawProfile, setRawProfile]     = useState<any>(null);
  const [activeTab, setActiveTab]       = useState<"placements"|"aspects"|"hd">("placements");
  const [isPremium, setIsPremium]       = useState(false);

  /* Fetch entitlement status on mount */
  useEffect(() => {
    fetch("/api/entitlements")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.isPremium) setIsPremium(true); })
      .catch(() => {});
  }, []);

  /* Auto-populate from stored profile */
  useEffect(() => {
    const p = getProfile();
    const astro = p?.astrology ?? p?.natalChart ?? p?.chart ?? {};
    const hd    = p?.humanDesign ?? p?.human_design ?? {};
    const num   = p?.numerology ?? {};

    if (p?.birthDate || p?.dob) {
      setRawProfile(p);
      const newData: PosterData = {
        name:            p.name ?? p.firstName ?? "",
        birthDate:       p.birthDate ?? p.dob ?? "",
        birthTime:       p.birthTime ?? p.time ?? "",
        birthLocation:   p.birthLocation ?? p.location ?? p.city ?? "",
        sunSign:         astro.sun ?? p.sunSign ?? "Gemini",
        moonSign:        astro.moon ?? p.moonSign ?? "Pisces",
        risingSign:      astro.rising ?? p.risingSign ?? undefined,
        lifePathNumber:  num.lifePathNumber ?? p.lifePathNumber ?? 9,
        masterNumber:    num.masterNumber ?? p.masterNumber ?? undefined,
        planets: astro.planets
          ? Object.entries(astro.planets).map(([name, v]: [string, any]) => ({
              name, longitude: v.longitude ?? 0,
            }))
          : [],
        houseCusps: astro.houses?.cusps ?? [],
      };
      setData(newData);
      setProfileAstro(astro);
      setProfileHD(hd);
    }
  }, []);

  const update = (field: keyof PosterData, value: any) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const handleComputeChart = async () => {
    if (!data.birthDate || !data.birthLocation) {
      setComputeError("Birth date and location are required.");
      return;
    }
    setComputing(true); setComputeError(null);
    try {
      const res  = await fetch("/api/astro/fullchart", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate: data.birthDate, birthTime: data.birthTime || undefined, timeUnknown: !data.birthTime, birthLocation: data.birthLocation }),
      });
      const json = await res.json();
      if (!json.ok) { setComputeError(json.error ?? "Chart computation failed."); return; }
      const planets = Object.entries(json.planets ?? {})
        .filter(([, v]: any) => typeof v?.longitude === "number")
        .map(([name, v]: any) => ({ name, longitude: v.longitude }));
      update("planets", planets);
      update("houseCusps", json.houses?.cusps ?? []);
      if (json.sun)    update("sunSign", json.sun);
      if (json.moon)   update("moonSign", json.moon);
      if (json.rising) update("risingSign", json.rising);
      setProfileAstro(json);
    } catch (err: any) { setComputeError(err?.message ?? "Network error."); }
    finally { setComputing(false); }
  };

  const handleDownloadPdfReport = async () => {
    setDownloadingPdf(true);
    try {
      const profile = {
        name:          data.name || rawProfile?.name || "Soul Codex",
        birthDate:     data.birthDate,
        birthTime:     data.birthTime ?? "",
        birthLocation: data.birthLocation ?? "",
      };
      const astrologyData  = profileAstro ?? rawProfile?.astrology ?? {};
      const humanDesignData = profileHD   ?? rawProfile?.humanDesign ?? {};

      const res = await fetch("/api/natal-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, astrologyData, humanDesignData }),
      });
      if (!res.ok) { setDownloadingPdf(false); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = `${(profile.name || "Soul_Codex").replace(/\s+/g, "_")}_Natal_Chart.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    finally { setDownloadingPdf(false); }
  };

  const handleDownload = async (width: 2048 | 4096) => {
    setDownloading(width);
    try {
      const res = await fetch(`/api/poster/render?width=${width}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { setDownloading(null); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = `soul-codex-poster-${width}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    finally { setDownloading(null); }
  };

  /* Build planet placement rows */
  const placementRows = useMemo(() => {
    const planets = profileAstro?.planets ?? {};
    const cusps   = profileAstro?.houses?.cusps ?? data.houseCusps ?? [];
    return Object.entries(planets).map(([name, p]: [string, any]) => ({
      glyph:  name,
      label:  PLANET_LABELS[name.toLowerCase()] ?? name,
      sign:   p.sign ?? "—",
      degree: p.degree != null ? `${Math.floor(p.degree)}°${String(Math.round((p.degree % 1) * 60)).padStart(2,"0")}'` : "—",
      house:  cusps.length ? ROMAN[(planetHouse(p.longitude ?? 0, cusps) - 1)] ?? "—" : "—",
    }));
  }, [profileAstro, data.houseCusps]);

  const aspectRows = useMemo(() => {
    return (profileAstro?.aspects ?? []).slice(0, 20).map((a: any) => ({
      p1:     PLANET_LABELS[a.planet1?.toLowerCase()] ?? a.planet1,
      symbol: ASPECT_SYMBOLS[a.aspect?.toLowerCase()] ?? a.aspect,
      type:   a.aspect,
      p2:     PLANET_LABELS[a.planet2?.toLowerCase()] ?? a.planet2,
      orb:    a.orb != null ? `${a.orb.toFixed(1)}°` : "—",
    }));
  }, [profileAstro]);

  const hasData = placementRows.length > 0 || aspectRows.length > 0 || profileHD?.type;

  const tabs = [
    { id: "placements" as const, label: "Placements", count: placementRows.length },
    { id: "aspects"    as const, label: "Aspects",    count: aspectRows.length },
    { id: "hd"         as const, label: "Human Design", count: profileHD?.type ? 1 : 0 },
  ];

  return (
    <div style={{ padding: "2rem 1.5rem 4rem", maxWidth: 1200, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem,3vw,2rem)", color: "var(--sc-gold)", margin: "0 0 0.3rem", letterSpacing: "0.02em" }}>
          Birth Chart Poster
        </h1>
        <p style={{ color: "rgba(246,241,232,0.5)", fontSize: "0.85rem", margin: 0 }}>
          Visual natal chart with aspect table, house placements, and Human Design breakdown.
        </p>
      </div>

      {/* Main layout: form + poster */}
      <div className="poster-layout" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.5rem", alignItems: "start", marginBottom: "2rem" }}>

        {/* Form panel */}
        <div style={{ ...cardBase, padding: "1.25rem" }}>
          <SectionHeader>Chart Details</SectionHeader>

          <Field label="Name">
            <input className="input" value={data.name ?? ""} onChange={(e) => update("name", e.target.value)} placeholder="Your name" />
          </Field>
          <Field label="Birth Date">
            <input className="input" type="date" value={data.birthDate} onChange={(e) => update("birthDate", e.target.value)} />
          </Field>
          <Field label="Birth Time">
            <input className="input" type="time" value={data.birthTime ?? ""} onChange={(e) => update("birthTime", e.target.value || undefined)} />
          </Field>
          <Field label="Birth Location">
            <input className="input" value={data.birthLocation ?? ""} onChange={(e) => update("birthLocation", e.target.value)} placeholder="City, Country" />
          </Field>

          <button
            className="btn btn-secondary"
            onClick={handleComputeChart}
            disabled={computing || !data.birthDate || !data.birthLocation}
            style={{ width: "100%", fontSize: "0.8rem", marginBottom: "0.75rem" }}
          >
            {computing ? "Computing…" : data.planets?.length ? `✓ ${data.planets.length} planets plotted` : "Compute Chart"}
          </button>
          {computeError && <p style={{ color: "#ef4444", fontSize: "0.78rem", marginBottom: "0.5rem" }}>{computeError}</p>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Field label="Sun Sign"><SignSelect value={data.sunSign} onChange={(v) => update("sunSign", v)} /></Field>
            <Field label="Moon Sign"><SignSelect value={data.moonSign} onChange={(v) => update("moonSign", v)} /></Field>
          </div>
          <Field label="Rising Sign"><SignSelect value={data.risingSign ?? ""} onChange={(v) => update("risingSign", v || undefined)} /></Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
            <Field label="Life Path">
              <input className="input" type="number" min={1} max={33} value={data.lifePathNumber} onChange={(e) => update("lifePathNumber", parseInt(e.target.value) || 1)} />
            </Field>
            <Field label="Master #">
              <select className="input" value={data.masterNumber ?? ""} onChange={(e) => update("masterNumber", e.target.value ? parseInt(e.target.value) : undefined)} style={{ padding: "0.55rem 0.75rem" }}>
                <option value="">None</option>
                <option value="11">11</option>
                <option value="22">22</option>
                <option value="33">33</option>
              </select>
            </Field>
          </div>

          <button className="btn btn-primary" onClick={() => handleDownload(2048)} disabled={downloading !== null || downloadingPdf} style={{ width: "100%", fontSize: "0.82rem", marginBottom: "0.5rem" }}>
            {downloading === 2048 ? "Generating…" : "⬇ Download 2048px PNG"}
          </button>
          <button className="btn btn-secondary" onClick={() => handleDownload(4096)} disabled={downloading !== null || downloadingPdf} style={{ width: "100%", fontSize: "0.82rem", marginBottom: "0.75rem" }}>
            {downloading === 4096 ? "Generating…" : "⬇ Download 4096px PNG"}
          </button>

          {/* PDF Report */}
          <div style={{ borderTop: "1px solid rgba(212,168,95,0.14)", paddingTop: "0.75rem" }}>
            <button
              className="btn btn-secondary"
              onClick={handleDownloadPdfReport}
              disabled={downloadingPdf || downloading !== null || !data.birthDate}
              style={{ width: "100%", fontSize: "0.82rem", background: "rgba(10,30,20,0.7)", border: "1px solid rgba(212,168,95,0.35)", color: "var(--sc-gold)" }}
            >
              {downloadingPdf ? "✦ Generating PDF…" : "✦ Download Full PDF Report"}
            </button>
            <p style={{ fontSize: "0.68rem", color: "rgba(246,241,232,0.35)", textAlign: "center", marginTop: "0.4rem", marginBottom: 0 }}>
              Natal chart · Big Three · Aspects · Human Design — AI written
            </p>
          </div>

          {/* Blueprint link */}
          <div style={{ textAlign: "center", paddingTop: "0.85rem" }}>
            <Link href="/blueprint" style={{ fontSize: "0.78rem", color: "var(--sc-gold)", opacity: 0.7, textDecoration: "none", letterSpacing: "0.04em" }}>
              View Full Reading →
            </Link>
          </div>
        </div>

        {/* Poster preview */}
        <div style={{ position: "sticky", top: 80 }}>
          <p style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: "rgba(246,241,232,0.35)", textAlign: "center", marginBottom: "0.6rem", textTransform: "uppercase" }}>
            Live Preview
          </p>

          {/* Upgrade notice for free users */}
          {!isPremium && (
            <div style={{
              marginBottom: "0.75rem",
              padding: "0.65rem 1rem",
              borderRadius: 8,
              border: "1px solid rgba(212,168,95,0.32)",
              background: "rgba(212,168,95,0.07)",
            }}>
              <span style={{ fontSize: "0.82rem", color: "var(--sc-gold)", opacity: 0.9, lineHeight: 1.5 }}>
                ✦ The full atmospheric chart — dark sky, constellations, and teal gradients — is available with a{" "}
                <a href="/profile" style={{ color: "var(--sc-gold)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
                  premium plan
                </a>.
              </span>
            </div>
          )}

          {isPremium && (
            <div style={{
              marginBottom: "0.75rem",
              padding: "0.5rem 1rem",
              borderRadius: 8,
              border: "1px solid rgba(90,200,216,0.25)",
              background: "rgba(90,200,216,0.07)",
              textAlign: "center",
            }}>
              <span style={{ fontSize: "0.75rem", color: "#5ac8d8", letterSpacing: "0.08em" }}>
                ✦ PREMIUM  ·  Atmospheric Chart Unlocked
              </span>
            </div>
          )}

          <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(212,168,95,0.18)", boxShadow: "0 8px 48px rgba(0,0,0,0.6)" }}>
            <BirthChartPosterSVG data={data} variant={isPremium ? "premium" : "free"} />
          </div>
        </div>
      </div>

      {/* ── Data sections ─────────────────────────────────────────────────────── */}
      {hasData && (
        <div style={{ ...cardBase, padding: "1.5rem" }}>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", borderBottom: "1px solid rgba(212,168,95,0.14)", paddingBottom: "0.75rem" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "0.4rem 1rem", borderRadius: 6, border: "none", cursor: "pointer",
                  fontSize: "0.8rem", fontWeight: activeTab === tab.id ? 600 : 400,
                  background: activeTab === tab.id ? "rgba(212,168,95,0.15)" : "transparent",
                  color: activeTab === tab.id ? "var(--sc-gold)" : "rgba(246,241,232,0.5)",
                  transition: "all 0.15s",
                }}
              >
                {tab.label} {tab.count > 0 && <span style={{ opacity: 0.6, fontSize: "0.7rem" }}>({tab.count})</span>}
              </button>
            ))}
          </div>

          {/* Planet Placements Tab */}
          {activeTab === "placements" && (
            <div>
              <SectionHeader>Natal Placements</SectionHeader>
              {placementRows.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Planet","Sign","Degree","House"].map((h) => (
                          <th key={h} style={{ textAlign: "left", padding: "0.4rem 0.75rem", fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--sc-gold)", opacity: 0.7, borderBottom: "1px solid rgba(212,168,95,0.14)", fontWeight: 600 }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {placementRows.map((row, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? "rgba(212,168,95,0.03)" : "transparent" }}>
                          <td style={{ padding: "0.55rem 0.75rem", fontSize: "0.85rem", color: "var(--sc-ivory)", fontWeight: 500 }}>{row.label}</td>
                          <td style={{ padding: "0.55rem 0.75rem", fontSize: "0.85rem", color: "rgba(246,241,232,0.8)" }}>{row.sign}</td>
                          <td style={{ padding: "0.55rem 0.75rem", fontSize: "0.82rem", color: "rgba(246,241,232,0.6)", fontFamily: "monospace" }}>{row.degree}</td>
                          <td style={{ padding: "0.55rem 0.75rem", fontSize: "0.82rem", color: "var(--sc-gold)", opacity: 0.8 }}>{row.house}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: "rgba(246,241,232,0.4)", fontSize: "0.85rem" }}>
                  Compute the chart above to see planetary placements.
                </p>
              )}
            </div>
          )}

          {/* Aspects Tab */}
          {activeTab === "aspects" && (
            <div>
              <SectionHeader>Natal Aspects</SectionHeader>
              {aspectRows.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Planet","Aspect","Planet","Orb"].map((h, i) => (
                          <th key={i} style={{ textAlign: "left", padding: "0.4rem 0.75rem", fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--sc-gold)", opacity: 0.7, borderBottom: "1px solid rgba(212,168,95,0.14)", fontWeight: 600 }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {aspectRows.map((row, i) => {
                        const isHard = ["square","opposition"].includes(row.type?.toLowerCase());
                        const isEasy = ["trine","sextile"].includes(row.type?.toLowerCase());
                        const aspectColor = isHard ? "#e88" : isEasy ? "#8e8" : "var(--sc-gold)";
                        return (
                          <tr key={i} style={{ background: i % 2 === 0 ? "rgba(212,168,95,0.03)" : "transparent" }}>
                            <td style={{ padding: "0.55rem 0.75rem", fontSize: "0.85rem", color: "rgba(246,241,232,0.8)" }}>{row.p1}</td>
                            <td style={{ padding: "0.55rem 0.75rem", fontSize: "1rem", color: aspectColor, textAlign: "center" }}>{row.symbol}</td>
                            <td style={{ padding: "0.55rem 0.75rem", fontSize: "0.85rem", color: "rgba(246,241,232,0.8)" }}>{row.p2}</td>
                            <td style={{ padding: "0.55rem 0.75rem", fontSize: "0.78rem", color: "rgba(246,241,232,0.45)", fontFamily: "monospace" }}>{row.orb}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: "rgba(246,241,232,0.4)", fontSize: "0.85rem" }}>
                  Compute the chart above to see aspects.
                </p>
              )}
            </div>
          )}

          {/* Human Design Tab */}
          {activeTab === "hd" && (
            <div>
              <SectionHeader>Human Design</SectionHeader>
              {profileHD?.type ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                  {[
                    { label: "Type",       value: profileHD.type },
                    { label: "Strategy",   value: profileHD.strategy },
                    { label: "Authority",  value: profileHD.authority },
                    { label: "Profile",    value: profileHD.profile },
                    { label: "Definition", value: profileHD.definition },
                    { label: "Signature",  value: profileHD.signature },
                    { label: "Not-Self",   value: profileHD.notSelf ?? profileHD.not_self },
                    { label: "Incarnation Cross", value: profileHD.incarnationCross ?? profileHD.cross },
                  ].filter((r) => r.value).map((row) => (
                    <div key={row.label} style={{
                      background: "rgba(212,168,95,0.06)",
                      border: "1px solid rgba(212,168,95,0.14)",
                      borderRadius: 8, padding: "0.85rem 1rem",
                    }}>
                      <div style={{ fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--sc-gold)", opacity: 0.7, marginBottom: "0.3rem", fontWeight: 700 }}>
                        {row.label}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "var(--sc-ivory)", fontWeight: 500 }}>
                        {row.value}
                      </div>
                    </div>
                  ))}

                  {/* Defined centers */}
                  {(profileHD.definedCenters ?? profileHD.defined_centers ?? []).length > 0 && (
                    <div style={{ gridColumn: "1 / -1", background: "rgba(212,168,95,0.06)", border: "1px solid rgba(212,168,95,0.14)", borderRadius: 8, padding: "0.85rem 1rem" }}>
                      <div style={{ fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--sc-gold)", opacity: 0.7, marginBottom: "0.5rem", fontWeight: 700 }}>
                        Defined Centers
                      </div>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        {(profileHD.definedCenters ?? profileHD.defined_centers ?? []).map((c: string) => (
                          <span key={c} style={{ padding: "0.2rem 0.7rem", borderRadius: 99, background: "rgba(212,168,95,0.12)", border: "1px solid rgba(212,168,95,0.25)", fontSize: "0.75rem", color: "var(--sc-gold)" }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gates */}
                  {(profileHD.gates ?? []).length > 0 && (
                    <div style={{ gridColumn: "1 / -1", background: "rgba(212,168,95,0.06)", border: "1px solid rgba(212,168,95,0.14)", borderRadius: 8, padding: "0.85rem 1rem" }}>
                      <div style={{ fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--sc-gold)", opacity: 0.7, marginBottom: "0.5rem", fontWeight: 700 }}>
                        Active Gates
                      </div>
                      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                        {(profileHD.gates ?? []).map((g: number | string) => (
                          <span key={g} style={{ padding: "0.15rem 0.55rem", borderRadius: 6, background: "rgba(212,168,95,0.08)", border: "1px solid rgba(212,168,95,0.18)", fontSize: "0.75rem", color: "rgba(246,241,232,0.7)", fontFamily: "monospace" }}>
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: "rgba(246,241,232,0.4)", fontSize: "0.85rem" }}>
                  Complete your profile to see Human Design data.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 768px) {
          .poster-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
