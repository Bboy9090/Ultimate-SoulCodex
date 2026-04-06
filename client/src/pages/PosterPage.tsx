import type { ReactNode } from "react";
import { useState, useMemo } from "react";
import { z } from "zod";
import BirthChartPosterSVG, { type PosterData } from "../components/BirthChartPosterSVG";
import ConfidenceBadge from "../components/ConfidenceBadge";

const ZODIAC_SIGNS = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces",
];

const posterSchema = z.object({
  name: z.string().optional(),
  birthDate: z.string().min(1, "Birth date is required"),
  birthTime: z.string().optional(),
  birthLocation: z.string().optional(),
  sunSign: z.enum(ZODIAC_SIGNS as [string, ...string[]]),
  moonSign: z.enum(ZODIAC_SIGNS as [string, ...string[]]),
  risingSign: z.enum([...ZODIAC_SIGNS, ""] as [string, ...string[]]).optional(),
  lifePathNumber: z.number().int().min(1).max(33),
  masterNumber: z.number().int().optional(),
});

const DEMO: PosterData = {
  name: "Aria Solano",
  birthDate: "1990-06-21",
  birthTime: "11:11",
  birthLocation: "San Francisco, CA",
  sunSign: "Gemini",
  moonSign: "Pisces",
  risingSign: "Sagittarius",
  lifePathNumber: 9,
  masterNumber: 11,
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="form-group" style={{ marginBottom: "0.875rem" }}>
      <label className="label" style={{ fontSize: "0.8125rem" }}>{label}</label>
      {children}
    </div>
  );
}

function SignSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      className="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ padding: "0.6rem 0.75rem" }}
    >
      <option value="">— none —</option>
      {ZODIAC_SIGNS.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}

export default function PosterPage() {
  const [data, setData] = useState<PosterData>(DEMO);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [computing, setComputing] = useState(false);
  const [computeError, setComputeError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const update = (field: keyof PosterData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleComputeChart = async () => {
    if (!data.birthDate || !data.birthLocation) {
      setComputeError("Birth date and location are required to compute the chart.");
      return;
    }
    setComputing(true);
    setComputeError(null);
    try {
      const res = await fetch("/api/astro/fullchart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: data.birthDate,
          birthTime: data.birthTime || undefined,
          timeUnknown: !data.birthTime,
          birthLocation: data.birthLocation,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setComputeError(json.error ?? "Chart computation failed.");
        return;
      }
      const planetEntries = Object.entries(json.planets ?? {}) as [string, { longitude: number }][];
      const planets = planetEntries
        .filter(([, v]) => typeof v?.longitude === "number")
        .map(([name, v]) => ({ name, longitude: v.longitude }));
      update("planets", planets);
      if (json.sun && !data.sunSign) update("sunSign", json.sun);
      if (json.moon && !data.moonSign) update("moonSign", json.moon);
      if (json.rising && !data.risingSign) update("risingSign", json.rising);
    } catch (err: any) {
      setComputeError(err?.message ?? "Network error.");
    } finally {
      setComputing(false);
    }
  };

  const validateAndGetData = (): PosterData | null => {
    try {
      posterSchema.parse({
        ...data,
        lifePathNumber: Number(data.lifePathNumber),
        risingSign: data.risingSign || undefined,
        masterNumber: data.masterNumber || undefined,
      });
      setErrors([]);
      return data;
    } catch (err: any) {
      const msgs = err?.errors?.map((e: any) => e.message) ?? ["Invalid input"];
      setErrors(msgs);
      return null;
    }
  };

  const handleDownload = async (width: 2048 | 4096) => {
    const validated = validateAndGetData();
    if (!validated) return;

    setDownloading(width);
    try {
      const res = await fetch(`/api/poster/render?width=${width}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      if (!res.ok) {
        const msg = await res.text();
        setErrors([`Export failed: ${msg}`]);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `soul-codex-poster-${width}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setErrors([err?.message ?? "Download failed"]);
    } finally {
      setDownloading(null);
    }
  };

  const posterConfidence = useMemo(() => {
    if (data.birthTime && data.birthLocation) return { badge: "verified", reason: "Time + location locked. Highest accuracy." };
    if (data.birthDate) return { badge: "partial", reason: "Birth time unknown. No houses or rising-based conclusions." };
    return { badge: "unverified", reason: "Missing geo/timezone lock. Chart positions may drift." };
  }, [data.birthTime, data.birthLocation, data.birthDate]);

  return (
    <div className="container animate-fade-in" style={{ padding: "2rem 1rem 4rem", maxWidth: "1200px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
        <h1 className="gradient-text" style={{ margin: 0, fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
          Birth Chart Poster
        </h1>
        <ConfidenceBadge badge={posterConfidence.badge} reason={posterConfidence.reason} size="md" />
      </div>
      <p style={{ color: "var(--muted-foreground)", marginBottom: "2rem" }}>
        Customize your chart and download a high-resolution poster.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr)",
        gap: "2rem",
        alignItems: "start",
      }}>

        {/* Form panel */}
        <div className="glass-card-static" style={{ padding: "1.5rem", borderRadius: "16px" }}>
          <h2 style={{ fontSize: "1rem", color: "#f8fafc", marginBottom: "1.25rem", borderBottom: "1px solid rgba(139,92,246,0.2)", paddingBottom: "0.75rem" }}>
            Your Details
          </h2>

          <Field label="Name (optional)">
            <input className="input" value={data.name ?? ""} onChange={(e) => update("name", e.target.value)} placeholder="Aria Solano" />
          </Field>

          <Field label="Birth Date">
            <input className="input" type="date" value={data.birthDate} onChange={(e) => update("birthDate", e.target.value)} />
          </Field>

          <Field label="Birth Time (optional)">
            <input className="input" type="time" value={data.birthTime ?? ""} onChange={(e) => update("birthTime", e.target.value || undefined)} />
          </Field>

          <Field label="Birth Location (optional)">
            <input className="input" value={data.birthLocation ?? ""} onChange={(e) => update("birthLocation", e.target.value)} placeholder="City, State or Country" />
          </Field>

          <div style={{ marginBottom: "1rem" }}>
            <button
              className="btn btn-secondary"
              onClick={handleComputeChart}
              disabled={computing || !data.birthDate || !data.birthLocation}
              type="button"
              style={{ width: "100%", justifyContent: "center" }}
            >
              {computing ? "Computing…" : data.planets?.length ? `✓ Chart Computed (${data.planets.length} planets)` : "Compute Chart from Birth Data"}
            </button>
            {computeError && (
              <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "0.375rem", marginBottom: 0 }}>{computeError}</p>
            )}
            {!computeError && data.planets?.length ? (
              <p style={{ color: "#4ade80", fontSize: "0.75rem", marginTop: "0.375rem", marginBottom: 0 }}>
                Planets plotted at real ecliptic positions.
              </p>
            ) : null}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Sun Sign">
              <SignSelect value={data.sunSign} onChange={(v) => update("sunSign", v)} />
            </Field>
            <Field label="Moon Sign">
              <SignSelect value={data.moonSign} onChange={(v) => update("moonSign", v)} />
            </Field>
          </div>

          <Field label="Rising Sign (optional)">
            <SignSelect value={data.risingSign ?? ""} onChange={(v) => update("risingSign", v || undefined)} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Life Path Number">
              <input
                className="input"
                type="number"
                min={1}
                max={33}
                value={data.lifePathNumber}
                onChange={(e) => update("lifePathNumber", parseInt(e.target.value, 10) || 1)}
              />
            </Field>
            <Field label="Master Number (optional)">
              <select
                className="input"
                value={data.masterNumber ?? ""}
                onChange={(e) => update("masterNumber", e.target.value ? parseInt(e.target.value) : undefined)}
                style={{ padding: "0.6rem 0.75rem" }}
              >
                <option value="">— none —</option>
                <option value="11">11</option>
                <option value="22">22</option>
                <option value="33">33</option>
              </select>
            </Field>
          </div>

          {errors.length > 0 && (
            <div style={{ padding: "0.75rem", background: "rgba(239,68,68,0.1)", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.3)", marginBottom: "1rem" }}>
              {errors.map((e, i) => <p key={i} style={{ color: "#ef4444", fontSize: "0.8125rem", margin: 0 }}>{e}</p>)}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
            <button
              className="btn btn-primary"
              onClick={() => handleDownload(2048)}
              disabled={downloading !== null}
              style={{ flex: 1, minWidth: "140px" }}
              type="button"
            >
              {downloading === 2048 ? "Generating..." : "Download PNG 2048px"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => handleDownload(4096)}
              disabled={downloading !== null}
              style={{ flex: 1, minWidth: "140px" }}
              type="button"
            >
              {downloading === 4096 ? "Generating..." : "Download PNG 4096px"}
            </button>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.75rem" }}>
            High-res PNG — ready for print or social media.
          </p>
        </div>

        {/* Live preview */}
        <div style={{ position: "sticky", top: "80px" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginBottom: "0.5rem", textAlign: "center", letterSpacing: 1 }}>
            LIVE PREVIEW
          </p>
          <div style={{
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid rgba(214,178,94,0.2)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          }}>
            <BirthChartPosterSVG data={data} />
          </div>
        </div>
      </div>

      {/* Mobile: preview below form */}
      <style>{`
        @media (max-width: 768px) {
          .poster-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
