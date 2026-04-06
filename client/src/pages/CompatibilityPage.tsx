import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import ConfidenceBadge from "../components/ConfidenceBadge";

interface Person {
  id: string;
  name: string;
  birthDate: string;
}

interface CompatibilityResult {
  overallScore: number;
  dimensions: {
    identity: number;
    stress: number;
    values: number;
    decisions: number;
  };
  friction: string[];
  synergy: string[];
  profile1Name?: string;
  profile2Name?: string;
}

// Dimension config — glyph + accent color
const DIM_CONFIG = {
  identity:  { glyph: "◉", color: "#8b5cf6", label: "Identity" },
  stress:    { glyph: "⬡", color: "#f59e0b", label: "Under Pressure" },
  values:    { glyph: "◌", color: "#f472b6", label: "Values" },
  decisions: { glyph: "◆", color: "#22d3ee", label: "Decisions" },
};

export default function CompatibilityPage() {
  const [myProfile, setMyProfile]     = useState<any>(null);
  const [myProfileId, setMyProfileId] = useState<string | null>(null);
  const [myConfidence, setMyConfidence] = useState<any>(null);
  const [persons, setPersons]         = useState<Person[]>([]);
  const [isAddOpen, setIsAddOpen]     = useState(false);
  const [result, setResult]           = useState<CompatibilityResult | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", birthDate: "", birthTime: "", birthLocation: "" });

  useEffect(() => {
    const saved = localStorage.getItem("soulProfile");
    if (saved) setMyProfile(JSON.parse(saved));
    const savedId = localStorage.getItem("soulMyProfileId");
    if (savedId) setMyProfileId(savedId);
    const savedPersons = localStorage.getItem("soulPersons");
    if (savedPersons) setPersons(JSON.parse(savedPersons));
    const savedConf = localStorage.getItem("soulConfidence");
    if (savedConf) setMyConfidence(JSON.parse(savedConf));
  }, []);

  const flash = (fn: (v: string | null) => void, msg: string) => {
    fn(msg);
    setTimeout(() => fn(null), 3000);
  };

  const saveMyProfileMutation = useMutation({
    mutationFn: async () => {
      const rawInputs = localStorage.getItem("onboardingData") || localStorage.getItem("soulUserInputs");
      if (!rawInputs) throw new Error("Complete onboarding first to save your profile.");
      const inputs = JSON.parse(rawInputs);
      if (!inputs.name || !inputs.birthDate) throw new Error("Onboarding data is incomplete.");
      return apiRequest("/api/profiles", {
        method: "POST",
        body: JSON.stringify({ name: inputs.name, birthDate: inputs.birthDate, birthTime: inputs.birthTime || undefined, birthLocation: inputs.birthLocation || undefined }),
      });
    },
    onSuccess: (data: any) => {
      const id = data.id?.toString();
      localStorage.setItem("soulMyProfileId", id);
      setMyProfileId(id);
      flash(setSuccess, "Profile saved — ready to compare.");
    },
    onError: (err: any) => flash(setError, err.message || "Failed to save profile"),
  });

  const addPersonMutation = useMutation({
    mutationFn: async (data: typeof form) =>
      apiRequest("/api/profiles", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (data: any) => {
      const newPerson = { id: data.id, name: form.name, birthDate: form.birthDate };
      const updated = [...persons, newPerson];
      setPersons(updated);
      localStorage.setItem("soulPersons", JSON.stringify(updated));
      setIsAddOpen(false);
      setForm({ name: "", birthDate: "", birthTime: "", birthLocation: "" });
      flash(setSuccess, `${newPerson.name} added`);
    },
    onError: () => flash(setError, "Failed to add person"),
  });

  const compareMutation = useMutation({
    mutationFn: async (personId: string) => {
      if (!myProfileId) throw new Error("Save your profile first");
      return apiRequest("/api/compatibility", {
        method: "POST",
        body: JSON.stringify({ profile1Id: myProfileId, profile2Id: personId }),
      });
    },
    onSuccess: (data: any) => {
      const cd   = data.compatibilityData || {};
      const dims = cd.dimensions || {};
      setResult({
        overallScore: data.overallScore ?? cd.overall ?? 0,
        dimensions: {
          identity:  dims.identity?.score  ?? dims.identity  ?? 0,
          stress:    dims.stress?.score    ?? dims.stress    ?? 0,
          values:    dims.values?.score    ?? dims.values    ?? 0,
          decisions: dims.decisions?.score ?? dims.decisions ?? 0,
        },
        friction: cd.friction || [],
        synergy:  cd.synergy  || [],
        profile1Name: data.profile1?.name,
        profile2Name: data.profile2?.name,
      });
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    },
    onError: (err: any) => flash(setError, err.message || "Comparison failed"),
  });

  const handleCompare = (personId: string) => {
    if (!myProfileId) { flash(setError, "Save your profile first."); return; }
    compareMutation.mutate(personId);
  };

  return (
    <div style={{ padding: "2rem 1rem 4rem", maxWidth: 780, margin: "0 auto" }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 5vw, 2.25rem)" }}>
          Compatibility
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>
          Compare your blueprint with someone else to see where your energies meet.
        </p>
      </section>

      {/* ── Toasts ───────────────────────────────────────────────────────── */}
      {error && (
        <div style={{ padding: "0.7rem 1rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", color: "#ef4444", marginBottom: "1rem", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: "0.7rem 1rem", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "10px", color: "#22c55e", marginBottom: "1rem", fontSize: "0.85rem" }}>
          {success}
        </div>
      )}

      {/* ── My Profile Card ──────────────────────────────────────────────── */}
      <div style={{
        background: "rgba(15,20,40,0.65)", border: "1px solid rgba(139,92,246,0.2)",
        borderLeft: "3px solid #8b5cf6", borderRadius: "14px",
        padding: "1.5rem", marginBottom: "1.75rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.2rem", color: "var(--cosmic-lavender)",
            }}>
              ◉
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--foreground)" }}>
                {myProfile?.birth_data?.name || myProfile?.archetype?.name || "My Profile"}
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.3rem", alignItems: "center" }}>
                {myProfile?.archetype?.element && (
                  <span style={{
                    display: "inline-block", padding: "0.15rem 0.6rem",
                    background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)",
                    borderRadius: "99px", fontSize: "0.68rem", color: "var(--cosmic-lavender)", letterSpacing: "0.06em",
                  }}>
                    {myProfile.archetype.element} · {myProfile.archetype.role}
                  </span>
                )}
                {myConfidence && (
                  <ConfidenceBadge badge={myConfidence.badge} reason={myConfidence.reason} size="sm" />
                )}
              </div>
            </div>
          </div>
          {!myProfileId ? (
            <button className="btn btn-primary" onClick={() => saveMyProfileMutation.mutate()} disabled={saveMyProfileMutation.isPending} style={{ fontSize: "0.82rem", padding: "0.5rem 1.1rem" }}>
              {saveMyProfileMutation.isPending ? "Saving…" : "Save Profile"}
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "#22c55e" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} /> Linked
            </div>
          )}
        </div>

        {/* Sun / Moon / Rising mini-row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
          {([["Sun", myProfile?.astrology?.sunSign], ["Moon", myProfile?.astrology?.moonSign], ["Rising", myProfile?.astrology?.risingSign]] as [string, string][]).map(([label, val]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)", marginBottom: "0.2rem" }}>{label}</div>
              <div style={{ fontWeight: 500, fontSize: "0.9rem", color: val ? "var(--foreground)" : "var(--muted-foreground)" }}>{val || "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Connections ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1rem", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--foreground)" }}>
            <span style={{ color: "var(--cosmic-pink)" }}>◌</span> Connections
          </h2>
          <button
            className="btn btn-secondary"
            style={{ padding: "0.45rem 0.9rem", fontSize: "0.8rem" }}
            onClick={() => setIsAddOpen(!isAddOpen)}
          >
            {isAddOpen ? "✕ Close" : "+ Add Person"}
          </button>
        </div>

        {isAddOpen && (
          <div style={{
            background: "rgba(15,20,40,0.65)", border: "1px dashed rgba(139,92,246,0.4)",
            borderRadius: "12px", padding: "1.5rem", marginBottom: "1.25rem",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem", marginBottom: "1rem" }}>
              {([["Name", "text", "name", "Name", ""], ["Birth Date", "date", "birthDate", "", ""], ["Birth Time (optional)", "time", "birthTime", "", ""], ["Birth Location", "text", "birthLocation", "City, Country", ""]] as [string, string, keyof typeof form, string, string][]).map(([label, type, key, ph]) => (
                <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                  <label className="label" style={{ fontSize: "0.75rem" }}>{label}</label>
                  <input className="input" type={type} placeholder={ph} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => addPersonMutation.mutate(form)}
              disabled={!form.name || !form.birthDate || addPersonMutation.isPending}
            >
              {addPersonMutation.isPending ? "Adding…" : "Add Connection"}
            </button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {persons.length === 0 && !isAddOpen && (
            <div style={{ textAlign: "center", color: "var(--muted-foreground)", padding: "2.5rem 1rem", border: "1px dashed rgba(139,92,246,0.2)", borderRadius: "12px", fontSize: "0.85rem" }}>
              No connections yet. Add someone to compare.
            </div>
          )}
          {persons.map(person => (
            <div key={person.id} style={{
              background: "rgba(15,20,40,0.55)", border: "1px solid rgba(139,92,246,0.15)",
              borderRadius: "12px", padding: "1rem 1.25rem",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "rgba(244,114,182,0.12)", border: "1px solid rgba(244,114,182,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", color: "var(--cosmic-rose)",
                }}>
                  ◌
                </div>
                <div>
                  <p style={{ fontWeight: 600, margin: 0, fontSize: "0.9rem" }}>{person.name}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", margin: 0 }}>{person.birthDate}</p>
                </div>
              </div>
              <button
                className="btn btn-secondary"
                style={{ padding: "0.4rem 0.9rem", fontSize: "0.78rem" }}
                onClick={() => handleCompare(person.id)}
                disabled={compareMutation.isPending}
              >
                {compareMutation.isPending && compareMutation.variables === person.id ? "Analyzing…" : "Compare"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {result && (
        <div style={{
          background: "rgba(15,20,40,0.7)", border: "1px solid rgba(139,92,246,0.3)",
          borderRadius: "16px", padding: "2rem",
        }}>
          <h2 className="gradient-text" style={{ textAlign: "center", marginBottom: "0.5rem", fontFamily: "var(--font-serif)", fontSize: "1.5rem" }}>
            Compatibility Analysis
          </h2>
          {(result.profile1Name || result.profile2Name) && (
            <p style={{ textAlign: "center", color: "var(--muted-foreground)", fontSize: "0.82rem", marginBottom: "2rem" }}>
              {result.profile1Name} × {result.profile2Name}
            </p>
          )}

          {/* Score ring */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
            <div style={{ position: "relative", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                <circle cx="70" cy="70" r="64" fill="none" stroke="rgba(139,92,246,0.12)" strokeWidth="10" />
                <circle cx="70" cy="70" r="64" fill="none" stroke="var(--cosmic-purple)" strokeWidth="10"
                  strokeDasharray="402" strokeDashoffset={402 - (402 * result.overallScore) / 100}
                  strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease-out" }} />
              </svg>
              <div style={{ position: "absolute", textAlign: "center" }}>
                <span style={{ fontSize: "2.4rem", fontWeight: 700, display: "block", color: "var(--foreground)" }}>{result.overallScore}%</span>
                <span style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Match</span>
              </div>
            </div>
          </div>

          {/* Dimension bars */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "2rem" }}>
            {(Object.entries(DIM_CONFIG) as [keyof typeof DIM_CONFIG, typeof DIM_CONFIG[keyof typeof DIM_CONFIG]][]).map(([key, cfg]) => (
              <DimensionBar key={key} label={cfg.label} glyph={cfg.glyph} color={cfg.color} score={result.dimensions[key]} />
            ))}
          </div>

          {/* Synergy */}
          {result.synergy.length > 0 && (
            <div style={{
              background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.18)",
              borderLeft: "3px solid #22c55e", borderRadius: "10px",
              padding: "1rem 1.25rem", marginBottom: "1rem",
            }}>
              <p style={{ fontSize: "0.62rem", letterSpacing: "0.12em", color: "#22c55e", textTransform: "uppercase", marginBottom: "0.6rem", fontWeight: 700 }}>
                Synergy
              </p>
              {result.synergy.map((s, i) => (
                <p key={i} style={{ fontSize: "0.85rem", color: "rgba(230,255,230,0.85)", marginBottom: "0.25rem" }}>
                  <span style={{ color: "#22c55e", marginRight: "0.4rem" }}>✦</span>{s}
                </p>
              ))}
            </div>
          )}

          {/* Friction */}
          {result.friction.length > 0 && (
            <div style={{
              background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)",
              borderLeft: "3px solid #f59e0b", borderRadius: "10px",
              padding: "1rem 1.25rem",
            }}>
              <p style={{ fontSize: "0.62rem", letterSpacing: "0.12em", color: "#f59e0b", textTransform: "uppercase", marginBottom: "0.6rem", fontWeight: 700 }}>
                Watch Points
              </p>
              {result.friction.map((f, i) => (
                <p key={i} style={{ fontSize: "0.82rem", color: "rgba(255,240,200,0.82)", marginBottom: "0.25rem" }}>
                  <span style={{ color: "#f59e0b", marginRight: "0.4rem" }}>▪</span>{f}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Dimension bar ────────────────────────────────────────────────────────────

function DimensionBar({ label, glyph, color, score }: {
  label: string; glyph: string; color: string; score: number;
  children?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ color, fontSize: "0.85rem" }}>{glyph}</span>
          <span style={{ fontWeight: 500, color: "var(--foreground)" }}>{label}</span>
        </div>
        <span style={{ color, fontWeight: 600, fontSize: "0.82rem" }}>{score}%</span>
      </div>
      <div style={{ height: 7, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: 4, transition: "width 1s ease-out" }} />
      </div>
    </div>
  );
}
