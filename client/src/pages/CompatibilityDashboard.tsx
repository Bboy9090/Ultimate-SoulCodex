import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { apiRequest } from "../lib/queryClient";
import CosmicLoader from "../components/CosmicLoader";
import ConfidenceBadge from "../components/ConfidenceBadge";
import ScButton from "../components/ScButton";
import {
  IconAlert,
  IconCircle,
  IconDecisions,
  IconGrowth,
  IconHeart,
  IconIdentity,
  IconSparkles,
  IconStress,
} from "../components/Icons";
import { pureText } from "../lib/sanitizer";

interface Person {
  id: string;
  name: string;
  birthDate: string;
}

interface CompatibilityResult {
  overallScore: number;
  dimensions: { identity: number; stress: number; values: number; decisions: number };
  friction: string[];
  synergy: string[];
  growthOpportunities: string[];
  profile1Name?: string;
  profile2Name?: string;
  confidence?: { badge?: string; label?: string; reason?: string };
  systemsUsed?: Array<{ system: string; score?: number; weight?: number }>;
  systemsExcluded?: Array<{ system: string; reason?: string }>;
  missingDataWarnings?: string[];
}

const panel: React.CSSProperties = {
  background: "linear-gradient(145deg, rgba(19,24,54,.94), rgba(26,16,48,.88))",
  border: "1px solid rgba(178,120,255,.28)",
  borderRadius: 18,
  boxShadow: "0 18px 60px rgba(0,0,0,.26)",
};

const tabs = ["Overview", "Love", "Communication", "Chemistry", "Conflict", "Human Design", "Astrology", "Numerology", "Purpose", "Timeline"];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value || 0)));
}

function scoreLabel(score: number) {
  if (score >= 90) return "Exceptional";
  if (score >= 80) return "Deep Resonance";
  if (score >= 65) return "Strong Connection";
  if (score >= 50) return "Mixed but Workable";
  return "Growth Intensive";
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "grid", gap: 7 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
        <span style={{ color: "rgba(245,242,255,.78)" }}>{label}</span>
        <strong>{clamp(value)}%</strong>
      </div>
      <div style={{ height: 7, borderRadius: 99, overflow: "hidden", background: "rgba(255,255,255,.08)" }}>
        <div style={{ width: `${clamp(value)}%`, height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#7c3aed,#c084fc)" }} />
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, title, score, rows }: { icon: React.ComponentType<any>; title: string; score: number; rows: Array<[string, number]> }) {
  return (
    <motion.article whileHover={{ y: -4 }} style={{ ...panel, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <Icon size={20} style={{ color: "#c084fc" }} />
        <div style={{ flex: 1 }}><strong>{title}</strong></div>
        <span style={{ fontSize: 26, fontWeight: 800 }}>{clamp(score)}%</span>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {rows.map(([label, value]) => <Bar key={label} label={label} value={value} />)}
      </div>
    </motion.article>
  );
}

function InsightList({ title, items, tone }: { title: string; items: string[]; tone: "good" | "warn" | "growth" }) {
  const color = tone === "good" ? "#5eead4" : tone === "warn" ? "#fb7185" : "#c084fc";
  return (
    <section style={{ ...panel, padding: 20 }}>
      <h3 style={{ margin: "0 0 12px", color }}>{title}</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {(items.length ? items : ["More detail becomes available as both profiles gain complete birth and personality data."]).slice(0, 5).map((item, index) => (
          <div key={`${title}-${index}`} style={{ display: "flex", gap: 10, lineHeight: 1.55, color: "rgba(247,244,255,.82)" }}>
            <span style={{ color }}>✦</span><span>{pureText(item)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CompatibilityDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", birthDate: "", birthTime: "", birthLocation: "" });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("soulProfile") || localStorage.getItem("soulGuestProfile");
      const savedPersons = localStorage.getItem("soulPersons");
      const savedId = localStorage.getItem("soulMyProfileId");
      if (savedProfile) setProfile(JSON.parse(savedProfile));
      if (savedPersons) {
        const parsed = JSON.parse(savedPersons) as Person[];
        setPersons(parsed);
        if (parsed[0]?.id) setSelectedId(String(parsed[0].id));
      }
      if (savedId) setProfileId(savedId);
    } catch {
      setMessage("Stored compatibility data could not be read.");
    }
  }, []);

  const addPerson = useMutation({
    mutationFn: async () => apiRequest("/api/profiles", { method: "POST", body: JSON.stringify(form) }),
    onSuccess: (data: any) => {
      const next = [...persons, { id: String(data.id), name: form.name, birthDate: form.birthDate }];
      setPersons(next);
      setSelectedId(String(data.id));
      localStorage.setItem("soulPersons", JSON.stringify(next));
      setForm({ name: "", birthDate: "", birthTime: "", birthLocation: "" });
      setFormOpen(false);
      setMessage(`${next[next.length - 1].name} was added.`);
    },
    onError: (error: any) => setMessage(error?.message || "Unable to add this person."),
  });

  const compare = useMutation({
    mutationFn: async () => {
      if (!profileId) throw new Error("Link your Soul Codex profile before comparing.");
      if (!selectedId) throw new Error("Choose a person to compare.");
      return apiRequest("/api/compatibility", { method: "POST", body: JSON.stringify({ profile1Id: profileId, profile2Id: selectedId }) });
    },
    onSuccess: (data: any) => {
      const cd = data.compatibilityData || {};
      const dims = cd.dimensions || {};
      const selected = persons.find((person) => String(person.id) === selectedId);
      setResult({
        overallScore: data.overallScore ?? cd.overall ?? 0,
        dimensions: {
          identity: dims.identity?.score ?? dims.identity ?? 0,
          stress: dims.stress?.score ?? dims.stress ?? 0,
          values: dims.values?.score ?? dims.values ?? 0,
          decisions: dims.decisions?.score ?? dims.decisions ?? 0,
        },
        friction: cd.friction || [],
        synergy: cd.synergy || [],
        growthOpportunities: cd.growthOpportunities || [],
        profile1Name: data.profile1?.name ?? profile?.name ?? "Person A",
        profile2Name: data.profile2?.name ?? selected?.name ?? "Person B",
        confidence: data.confidence ?? cd.confidence,
        systemsUsed: data.systemsUsed ?? cd.systemsUsed ?? [],
        systemsExcluded: data.systemsExcluded ?? cd.systemsExcluded ?? [],
        missingDataWarnings: data.missingDataWarnings ?? cd.missingDataWarnings ?? [],
      });
      setActiveTab("Overview");
    },
    onError: (error: any) => setMessage(error?.message || "Comparison failed."),
  });

  const d = result?.dimensions ?? { identity: 0, stress: 0, values: 0, decisions: 0 };
  const overall = clamp(result?.overallScore ?? 0);
  const emotional = clamp((d.values + d.identity) / 2);
  const communication = clamp((d.decisions + d.identity) / 2);
  const chemistry = clamp((overall + d.values + 8) / 2);
  const conflict = clamp((d.stress + d.decisions) / 2);
  const purpose = clamp((d.identity + d.values + d.decisions) / 3);
  const hdType = profile?.humanDesign?.type ?? profile?.humanDesignData?.type ?? "Awaiting complete data";
  const hdAuthority = profile?.humanDesign?.authority ?? profile?.humanDesignData?.authority ?? "Authority not available";
  const confidenceLabel = result?.confidence?.label ?? result?.confidence?.badge ?? "Partial";

  const verdict = useMemo(() => {
    if (!result) return "Run a comparison to reveal the unified relationship reading.";
    const strength = result.synergy[0] ? pureText(result.synergy[0]) : "The bond contains meaningful areas of natural alignment.";
    const challenge = result.friction[0] ? pureText(result.friction[0]) : "The greatest challenge is learning each other’s timing and pressure responses.";
    return `${strength} ${challenge} This connection works best when both people respect different emotional rhythms, communicate directly, and turn recurring triggers into conscious choices.`;
  }, [result]);

  return (
    <div style={{ minHeight: "100vh", padding: "28px 16px 72px", background: "radial-gradient(circle at 50% 0%, rgba(91,33,182,.22), transparent 35%), #070b1d", color: "#f8f5ff" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 22 }}>
          <div>
            <div style={{ color: "#d8b4fe", textTransform: "uppercase", letterSpacing: ".18em", fontSize: 12 }}>Soul Codex</div>
            <h1 style={{ margin: "5px 0 0", fontSize: "clamp(2rem,5vw,3.5rem)", fontFamily: "var(--font-serif)" }}>Compatibility</h1>
            <p style={{ color: "rgba(245,242,255,.66)", margin: "8px 0 0" }}>One relationship story, synthesized across every available system.</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} style={{ padding: "11px 13px", borderRadius: 12, background: "#111733", color: "white", border: "1px solid rgba(192,132,252,.3)" }}>
              <option value="">Choose a person</option>
              {persons.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
            </select>
            <ScButton onClick={() => setFormOpen((open) => !open)} variant="secondary">Add Person</ScButton>
            <ScButton onClick={() => compare.mutate()} loading={compare.isPending}>Compare</ScButton>
          </div>
        </header>

        {message && <div style={{ ...panel, padding: 12, marginBottom: 16, color: "#f0abfc" }}>{message}</div>}

        {formOpen && (
          <section style={{ ...panel, padding: 18, marginBottom: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
            {(["name", "birthDate", "birthTime", "birthLocation"] as const).map((key) => (
              <input key={key} type={key === "birthDate" ? "date" : key === "birthTime" ? "time" : "text"} placeholder={key === "birthLocation" ? "Birth location" : key.replace(/([A-Z])/g, " $1")} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", color: "white" }} />
            ))}
            <ScButton onClick={() => addPerson.mutate()} loading={addPerson.isPending}>Save Person</ScButton>
          </section>
        )}

        {!result && !compare.isPending && (
          <section style={{ ...panel, padding: 34, textAlign: "center" }}>
            <IconHeart size={44} style={{ color: "#c084fc", margin: "0 auto 12px" }} />
            <h2 style={{ margin: 0 }}>Choose someone and run the comparison</h2>
            <p style={{ color: "rgba(245,242,255,.66)" }}>Your saved profile remains Person A. Add or select Person B above.</p>
          </section>
        )}

        {compare.isPending && <div style={{ padding: 80, textAlign: "center" }}><CosmicLoader label="Building the unified relationship reading..." /></div>}

        {result && !compare.isPending && (
          <>
            <section style={{ ...panel, padding: 24, display: "grid", gridTemplateColumns: "minmax(180px,.7fr) minmax(280px,1.6fr) minmax(240px,1fr)", gap: 24, alignItems: "center", marginBottom: 18 }}>
              <div style={{ textAlign: "center", borderRight: "1px solid rgba(255,255,255,.08)" }}>
                <div style={{ color: "rgba(245,242,255,.66)" }}>Overall Compatibility</div>
                <div style={{ fontSize: "clamp(4rem,10vw,7rem)", lineHeight: 1, fontFamily: "var(--font-serif)" }}>{overall}<span style={{ fontSize: ".38em" }}>%</span></div>
                <div style={{ color: "#f0abfc", textTransform: "uppercase", letterSpacing: ".14em", marginTop: 8 }}>{scoreLabel(overall)}</div>
              </div>
              <div>
                <div style={{ color: "#d8b4fe", fontSize: 13, textTransform: "uppercase", letterSpacing: ".14em" }}>{result.profile1Name} + {result.profile2Name}</div>
                <h2 style={{ margin: "7px 0 10px", fontSize: 28 }}>Transformational Partnership</h2>
                <p style={{ color: "rgba(247,244,255,.78)", lineHeight: 1.72, margin: 0 }}>{verdict}</p>
              </div>
              <div style={{ display: "grid", gap: 14 }}>
                <Bar label="Natural Harmony" value={emotional} />
                <Bar label="Conscious Effort" value={conflict} />
                <Bar label="Growth Potential" value={purpose} />
                <div style={{ marginTop: 4 }}><ConfidenceBadge badge={confidenceLabel} reason={result.confidence?.reason} size="sm" /></div>
              </div>
            </section>

            <nav style={{ ...panel, padding: 8, display: "flex", gap: 6, overflowX: "auto", marginBottom: 18 }}>
              {tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} style={{ border: 0, borderRadius: 99, padding: "10px 14px", whiteSpace: "nowrap", cursor: "pointer", color: activeTab === tab ? "white" : "rgba(245,242,255,.62)", background: activeTab === tab ? "linear-gradient(90deg,#6d28d9,#9333ea)" : "transparent" }}>{tab}</button>)}
            </nav>

            <section style={{ ...panel, padding: 22, marginBottom: 18 }}>
              <h2 style={{ marginTop: 0 }}>Relationship Core</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12 }}>
                {[["Bond Type", scoreLabel(overall)], ["Primary Strength", result.synergy[0] || "Emotional recognition"], ["Primary Challenge", result.friction[0] || "Different processing rhythms"], ["Shared Mission", result.growthOpportunities[0] || "Learning trust without control"], ["Human Design", hdType], ["Authority", hdAuthority]].map(([label, value]) => (
                  <div key={String(label)} style={{ background: "rgba(255,255,255,.04)", borderRadius: 12, padding: 14 }}><div style={{ color: "#c084fc", fontSize: 12, textTransform: "uppercase", letterSpacing: ".1em" }}>{label}</div><div style={{ marginTop: 7, lineHeight: 1.45 }}>{pureText(String(value))}</div></div>
                ))}
              </div>
            </section>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginBottom: 18 }}>
              <MetricCard icon={IconHeart} title="Love" score={emotional} rows={[["Emotional Safety", emotional], ["Affection", d.values], ["Romantic Bond", chemistry], ["Commitment Potential", purpose]]} />
              <MetricCard icon={IconCircle} title="Communication" score={communication} rows={[["Mental Understanding", d.identity], ["Emotional Expression", d.values], ["Listening", communication], ["Conflict Repair", conflict]]} />
              <MetricCard icon={IconSparkles} title="Chemistry" score={chemistry} rows={[["Physical Attraction", chemistry], ["Emotional Magnetism", emotional], ["Mental Stimulation", communication], ["Energetic Pull", overall]]} />
              <MetricCard icon={IconStress} title="Conflict" score={conflict} rows={[["Trigger Awareness", d.stress], ["Emotional Regulation", conflict], ["Forgiveness", emotional], ["Repair Potential", communication]]} />
              <MetricCard icon={IconGrowth} title="Purpose" score={purpose} rows={[["Shared Mission", purpose], ["Creative Vision", d.identity], ["Spiritual Growth", emotional], ["Life Direction", d.decisions]]} />
            </div>

            <section style={{ ...panel, padding: 22, marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}><IconIdentity size={22} style={{ color: "#c084fc" }} /><h2 style={{ margin: 0 }}>Human Design Compatibility</h2></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
                <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 14, padding: 16 }}><strong>Aura Dynamic</strong><p style={{ color: "rgba(247,244,255,.72)", lineHeight: 1.6 }}>{hdType}. The relationship thrives when each person respects the other’s natural energy pace rather than demanding identical output.</p></div>
                <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 14, padding: 16 }}><strong>Authority and Timing</strong><p style={{ color: "rgba(247,244,255,.72)", lineHeight: 1.6 }}>{hdAuthority}. Major decisions should follow the slower clarity process instead of the louder personality.</p></div>
                <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 14, padding: 16 }}><strong>Center Dynamics</strong><p style={{ color: "rgba(247,244,255,.72)", lineHeight: 1.6 }}>Identity, stress, values, and decision scores are translated into conditioning risks, natural harmony, and practical relationship guidance.</p></div>
                <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 14, padding: 16 }}><strong>System Coverage</strong><p style={{ color: "rgba(247,244,255,.72)", lineHeight: 1.6 }}>{result.systemsUsed?.map((item) => item.system).join(", ") || "Astrology, numerology, personality, and available Human Design signals."}</p></div>
              </div>
            </section>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14, marginBottom: 18 }}>
              <InsightList title="Biggest Strengths" items={result.synergy} tone="good" />
              <InsightList title="Friction Points" items={result.friction} tone="warn" />
              <InsightList title="How to Win Anyway" items={result.growthOpportunities} tone="growth" />
            </div>

            {(result.missingDataWarnings?.length || result.systemsExcluded?.length) ? (
              <section style={{ ...panel, padding: 18, marginBottom: 18, borderColor: "rgba(251,191,36,.3)" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}><IconAlert size={18} style={{ color: "#fbbf24" }} /><strong>Confidence Notes</strong></div>
                {[...(result.missingDataWarnings || []), ...(result.systemsExcluded || []).map((item) => `${item.system}: ${item.reason || "not included"}`)].map((item, index) => <div key={index} style={{ color: "rgba(247,244,255,.7)", marginTop: 7 }}>{pureText(item)}</div>)}
              </section>
            ) : null}

            <section style={{ ...panel, padding: 22, display: "grid", gridTemplateColumns: "1fr minmax(240px,.55fr)", gap: 20 }}>
              <div><h2 style={{ marginTop: 0 }}>Final Verdict</h2><p style={{ color: "rgba(247,244,255,.78)", lineHeight: 1.75 }}>{verdict}</p></div>
              <div style={{ background: "radial-gradient(circle,rgba(168,85,247,.25),transparent 65%)", borderRadius: 16, display: "grid", placeItems: "center", minHeight: 170 }}><IconSparkles size={74} style={{ color: "#d8b4fe" }} /></div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
