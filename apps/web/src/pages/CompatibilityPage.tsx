import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { ChevronDown, ChevronUp, Plus, User, Heart, Sparkles, Brain, Zap } from "lucide-react";
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
  growthOpportunities: string[];
  profile1Name?: string;
  profile2Name?: string;
}

function normalizeCompatData(data: any): CompatibilityResult {
  const cd = data.compatibilityData || {};
  const dims = cd.dimensions || {};
  const cats = cd.categories ?? {};

  const getScore = (dimKey: string, catKey: string) =>
    dims[dimKey]?.score ?? dims[dimKey] ?? cats[catKey]?.score ?? 0;

  return {
    overallScore: data.overallScore ?? cd.overall ?? 0,
    dimensions: {
      identity:  getScore("identity",  "astrology"),
      stress:    getScore("stress",    "personality"),
      values:    getScore("values",    "spiritual"),
      decisions: getScore("decisions", "numerology"),
    },
    synergy:             cd.synergy             ?? cd.strengths          ?? data.strengths          ?? [],
    friction:            cd.friction            ?? cd.challenges         ?? data.challenges         ?? [],
    growthOpportunities: cd.growthOpportunities ?? data.growthOpportunities ?? [],
    profile1Name: data.profile1?.name,
    profile2Name: data.profile2?.name,
  };
}

export default function CompatibilityPage() {
  const [myProfile, setMyProfile] = useState<any>(null);
  const [myProfileId, setMyProfileId] = useState<string | null>(null);
  const [myConfidence, setMyConfidence] = useState<any>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    birthLocation: ""
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem("soulProfile");
    if (savedProfile) setMyProfile(JSON.parse(savedProfile));
    const savedId = localStorage.getItem("soulMyProfileId");
    if (savedId) setMyProfileId(savedId);
    const savedPersons = localStorage.getItem("soulPersons");
    if (savedPersons) setPersons(JSON.parse(savedPersons));
    const savedConf = localStorage.getItem("soulConfidence");
    if (savedConf) setMyConfidence(JSON.parse(savedConf));
  }, []);

  const saveMyProfileMutation = useMutation({
    mutationFn: async () => {
      const rawInputs = localStorage.getItem("onboardingData") || localStorage.getItem("soulUserInputs");
      if (!rawInputs) {
        throw new Error("Complete onboarding first to save your profile for comparison.");
      }
      const inputs = JSON.parse(rawInputs);
      if (!inputs.name || !inputs.birthDate) {
        throw new Error("Onboarding data is incomplete. Please redo onboarding.");
      }
      return apiRequest("/api/profiles", {
        method: "POST",
        body: JSON.stringify({
          name: inputs.name,
          birthDate: inputs.birthDate,
          birthTime: inputs.birthTime || undefined,
          birthLocation: inputs.birthLocation || undefined,
        }),
      });
    },
    onSuccess: (data: any) => {
      const id = data.id?.toString();
      localStorage.setItem("soulMyProfileId", id);
      setMyProfileId(id);
      setSuccess("Profile saved — you can now compare!");
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to save profile");
      setTimeout(() => setError(null), 5000);
    }
  });

  const addPersonMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      return apiRequest("/api/profiles", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: any) => {
      const newPerson = { id: data.id, name: form.name, birthDate: form.birthDate };
      const updatedPersons = [...persons, newPerson];
      setPersons(updatedPersons);
      localStorage.setItem("soulPersons", JSON.stringify(updatedPersons));
      setIsAddOpen(false);
      setForm({ name: "", birthDate: "", birthTime: "", birthLocation: "" });
      setSuccess(`${newPerson.name} added`);
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: () => {
      setError("Failed to add person");
      setTimeout(() => setError(null), 3000);
    }
  });

  const compareMutation = useMutation({
    mutationFn: async (personId: string) => {
      if (!myProfileId) throw new Error("Save your profile first");
      return apiRequest("/api/compatibility", {
        method: "POST",
        body: JSON.stringify({
          profile1Id: myProfileId,
          profile2Id: personId
        }),
      });
    },
    onSuccess: (data: any) => {
      setCompatibilityResult(normalizeCompatData(data));
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    },
    onError: (err: any) => {
      setError(err.message || "Comparison failed");
      setTimeout(() => setError(null), 3000);
    }
  });

  const handleCompare = (personId: string) => {
    if (!myProfileId) {
      setError("Save your profile first to enable comparison.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    compareMutation.mutate(personId);
  };

  return (
    <div className="container" style={{ padding: "2rem 1rem", maxWidth: 800 }}>
      <section style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 className="gradient-text">Soul Compatibility</h1>
        <p style={{ color: "var(--muted-foreground)" }}>Compare your soul blueprint with others to see how your energies align.</p>
      </section>

      {error && (
        <div style={{ padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--destructive)", borderRadius: "var(--radius)", color: "var(--destructive)", marginBottom: "1rem", textAlign: "center" }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: "0.75rem", background: "rgba(34, 197, 94, 0.1)", border: "1px solid #22c55e", borderRadius: "var(--radius)", color: "#22c55e", marginBottom: "1rem", textAlign: "center" }}>
          {success}
        </div>
      )}

      {/* My Profile Card */}
      <div className="glass-card-static" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ padding: "0.75rem", borderRadius: "50%", background: "rgba(124, 58, 237, 0.2)", color: "var(--cosmic-purple)" }}>
              <User size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{myProfile?.birth_data?.name || "My Profile"}</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.3rem", alignItems: "center" }}>
                {myProfile?.archetype && (
                  <span className="system-badge">{myProfile.archetype.name}</span>
                )}
                {myProfile?.archetype?.element && (
                  <span className="system-badge">{myProfile.archetype.element} • {myProfile.archetype.role}</span>
                )}
                {myConfidence && (
                  <ConfidenceBadge badge={myConfidence.badge} reason={myConfidence.reason} size="sm" />
                )}
              </div>
            </div>
          </div>
          {!myProfileId && (
            <button className="btn btn-primary" onClick={() => saveMyProfileMutation.mutate()} disabled={saveMyProfileMutation.isPending}>
              {saveMyProfileMutation.isPending ? "Saving..." : "Save Profile"}
            </button>
          )}
          {myProfileId && (
            <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} /> Linked
            </div>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", textAlign: "center" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)" }}>Sun</span>
            <span style={{ fontWeight: 500 }}>{myProfile?.astrology?.sunSign || "—"}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)" }}>Moon</span>
            <span style={{ fontWeight: 500 }}>{myProfile?.astrology?.moonSign || "—"}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)" }}>Rising</span>
            <span style={{ fontWeight: 500 }}>{myProfile?.astrology?.risingSign || "—"}</span>
          </div>
        </div>
      </div>

      {/* Add Person & List */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.25rem", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Heart size={20} style={{ color: "var(--cosmic-pink)" }} /> Connections
          </h2>
          <button className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }} onClick={() => setIsAddOpen(!isAddOpen)}>
            {isAddOpen ? <ChevronUp size={16} /> : <Plus size={16} />}
            <span style={{ marginLeft: "0.5rem" }}>Add Person</span>
          </button>
        </div>

        {isAddOpen && (
          <div className="glass-card-static" style={{ padding: "1.5rem", marginBottom: "1.5rem", borderStyle: "dashed", borderColor: "var(--cosmic-purple)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label className="label">Name</label>
                <input className="input" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="label">Birth Date</label>
                <input className="input" type="date" value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="label">Birth Time (Optional)</label>
                <input className="input" type="time" value={form.birthTime} onChange={e => setForm({...form, birthTime: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="label">Birth Location</label>
                <input className="input" placeholder="City, Country" value={form.birthLocation} onChange={e => setForm({...form, birthLocation: e.target.value})} />
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => addPersonMutation.mutate(form)} disabled={!form.name || !form.birthDate || addPersonMutation.isPending}>
              {addPersonMutation.isPending ? "Adding..." : "Add Connection"}
            </button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {persons.length === 0 && !isAddOpen && (
            <p style={{ textAlign: "center", color: "var(--muted-foreground)", padding: "2rem", border: "1px dashed var(--glass-border)", borderRadius: "var(--radius)" }}>
              No connections added yet. Add someone to check compatibility.
            </p>
          )}
          {persons.map((person) => (
            <div key={person.id} className="glass-card" style={{ padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <User size={20} style={{ margin: "auto" }} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, margin: 0 }}>{person.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", margin: 0 }}>{person.birthDate}</p>
                </div>
              </div>
              <button className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }} onClick={() => handleCompare(person.id)} disabled={compareMutation.isPending}>
                {compareMutation.isPending && compareMutation.variables === person.id ? "Analyzing..." : "Compare"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      {compatibilityResult && (
        <div className="glass-card-static animate-slide-up" style={{ padding: "2rem", border: "1px solid var(--cosmic-purple)" }}>
          <h2 className="gradient-text" style={{ textAlign: "center", marginBottom: "2rem" }}>Compatibility Analysis</h2>
          
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
            <div style={{ position: "relative", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                <circle cx="70" cy="70" r="64" fill="none" stroke="var(--muted)" strokeWidth="10" />
                <circle cx="70" cy="70" r="64" fill="none" stroke="var(--cosmic-purple)" strokeWidth="10" strokeDasharray="402" strokeDashoffset={402 - (402 * compatibilityResult.overallScore) / 100} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease-out" }} />
              </svg>
              <div style={{ position: "absolute", textAlign: "center" }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 700, display: "block" }}>{compatibilityResult.overallScore}%</span>
                <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Match</span>
              </div>
            </div>
          </div>

          {(compatibilityResult.profile1Name || compatibilityResult.profile2Name) && (
            <p style={{ textAlign: "center", color: "var(--muted-foreground)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              {compatibilityResult.profile1Name} × {compatibilityResult.profile2Name}
            </p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
            <DimensionBar label="Identity" score={compatibilityResult.dimensions.identity} icon={<User size={16} style={{ color: "var(--cosmic-lavender)" }} />} />
            <DimensionBar label="Under Stress" score={compatibilityResult.dimensions.stress} icon={<Zap size={16} style={{ color: "var(--cosmic-amber)" }} />} />
            <DimensionBar label="Values" score={compatibilityResult.dimensions.values} icon={<Heart size={16} style={{ color: "var(--cosmic-pink)" }} />} />
            <DimensionBar label="Decisions" score={compatibilityResult.dimensions.decisions} icon={<Brain size={16} style={{ color: "var(--cosmic-cyan)" }} />} />
          </div>

          {compatibilityResult.synergy.length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--cosmic-lavender)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                ✦ Why It Works
              </p>
              {compatibilityResult.synergy.map((s, i) => (
                <p key={i} style={{ fontSize: "0.85rem", color: "var(--foreground)", marginBottom: "0.25rem" }}>✦ {s}</p>
              ))}
            </div>
          )}
          {compatibilityResult.friction.length > 0 && (
            <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--glass-border)", marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "#f87171", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                ⚡ Friction Points
              </p>
              {compatibilityResult.friction.map((f, i) => (
                <p key={i} style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", marginBottom: "0.25rem" }}>◦ {f}</p>
              ))}
            </div>
          )}
          {compatibilityResult.growthOpportunities.length > 0 && (
            <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--glass-border)" }}>
              <p style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "#22c55e", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                ◈ How To Win Anyway
              </p>
              {compatibilityResult.growthOpportunities.map((g, i) => (
                <p key={i} style={{ fontSize: "0.82rem", color: "rgba(200,255,200,0.8)", marginBottom: "0.25rem" }}>→ {g}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DimensionBar({ label, score, icon }: { label: string, score: number, icon: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.875rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {icon}
          <span style={{ fontWeight: 500 }}>{label}</span>
        </div>
        <span style={{ color: "var(--muted-foreground)" }}>{score}%</span>
      </div>
      <div style={{ height: 8, background: "var(--muted)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score}%`, background: "var(--cosmic-purple)", transition: "width 1s ease-out" }} />
      </div>
    </div>
  );
}
