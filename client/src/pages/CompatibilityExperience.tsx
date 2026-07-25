import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import Navigation from "../components/navigation";
import CosmicLoader from "../components/CosmicLoader";
import ConfidenceBadge from "../components/ConfidenceBadge";
import ScButton from "../components/ScButton";
import { apiRequest } from "../lib/queryClient";
import { IconAlert, IconHeart, IconSparkles } from "../components/Icons";
import { pureText } from "../lib/sanitizer";

interface Profile {
  id: string | number;
  name?: string;
  astrologyData?: Record<string, any>;
  astrology?: Record<string, any>;
  numerologyData?: Record<string, any>;
  numerology?: Record<string, any>;
  humanDesignData?: Record<string, any>;
  humanDesign?: Record<string, any>;
  [key: string]: any;
}

interface Result {
  overallScore: number;
  dimensions: { identity: number; stress: number; values: number; decisions: number };
  friction: string[];
  synergy: string[];
  growthOpportunities: string[];
  profile1Name?: string;
  profile2Name?: string;
  confidence?: { badge?: string; label?: string; reason?: string };
  systemsUsed?: Array<{ system: string; score?: number }>;
  systemsExcluded?: Array<{ system: string; reason?: string }>;
  missingDataWarnings?: string[];
}

const panel: CSSProperties = {
  background: "linear-gradient(145deg,rgba(19,24,54,.96),rgba(26,16,48,.92))",
  border: "1px solid rgba(178,120,255,.28)",
  borderRadius: 18,
  boxShadow: "0 18px 60px rgba(0,0,0,.26)",
};

const inputStyle: CSSProperties = {
  padding: 12,
  borderRadius: 11,
  background: "#111733",
  color: "white",
  border: "1px solid rgba(192,132,252,.3)",
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

function label(score: number) {
  if (score >= 90) return "Exceptional";
  if (score >= 80) return "Deep Resonance";
  if (score >= 65) return "Strong Connection";
  if (score >= 50) return "Mixed but Workable";
  return "Growth Intensive";
}

function read(profile: Profile | null, system: string, key: string) {
  return profile?.[system]?.[key] ?? profile?.[`${system}Data`]?.[key] ?? "Not available";
}

function Bar({ name, score }: { name: string; score: number }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <span style={{ color: "rgba(245,242,255,.75)" }}>{name}</span><strong>{clamp(score)}%</strong>
      </div>
      <div style={{ height: 7, borderRadius: 99, overflow: "hidden", background: "rgba(255,255,255,.08)" }}>
        <div style={{ height: "100%", width: `${clamp(score)}%`, background: "linear-gradient(90deg,#7c3aed,#c084fc)" }} />
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} style={{ ...panel, padding: 21, marginBottom: 18, scrollMarginTop: 96 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>{children}
    </section>
  );
}

function Facts({ items }: { items: Array<[string, ReactNode]> }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
      {items.map(([name, value]) => (
        <div key={name} style={{ background: "rgba(255,255,255,.045)", borderRadius: 13, padding: 15 }}>
          <div style={{ color: "#c084fc", fontSize: 11, textTransform: "uppercase", letterSpacing: ".11em" }}>{name}</div>
          <div style={{ marginTop: 8, lineHeight: 1.58, color: "rgba(250,248,255,.88)" }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function Insights({ title, items, color }: { title: string; items: string[]; color: string }) {
  const shown = items.length ? items : ["More detail becomes available as complete profile data is added."];
  return (
    <div style={{ ...panel, padding: 19 }}>
      <h3 style={{ color, marginTop: 0 }}>{title}</h3>
      {shown.map((item, index) => (
        <p key={index} style={{ display: "flex", gap: 9, lineHeight: 1.6, color: "rgba(247,244,255,.8)" }}>
          <span style={{ color }}>✦</span><span>{pureText(item)}</span>
        </p>
      ))}
    </div>
  );
}

export default function CompatibilityExperience() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [aId, setAId] = useState("");
  const [bId, setBId] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", birthDate: "", birthTime: "", birthLocation: "" });
  const [lastKey, setLastKey] = useState("");

  const personA = profiles.find((profile) => String(profile.id) === aId) ?? null;
  const personB = profiles.find((profile) => String(profile.id) === bId) ?? null;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/profiles", { credentials: "include" });
        if (!response.ok) throw new Error("Saved profiles could not be loaded.");
        const list = await response.json();
        if (!active) return;
        const safe = Array.isArray(list) ? list : [];
        setProfiles(safe);
        const params = new URLSearchParams(window.location.search);
        const requested = params.get("profileId");
        const rememberedA = localStorage.getItem("soulCompatibilityPrimaryId");
        const rememberedB = localStorage.getItem("soulCompatibilityPartnerId");
        const firstA = safe.find((p: Profile) => String(p.id) === requested)?.id
          ?? safe.find((p: Profile) => String(p.id) === rememberedA)?.id
          ?? safe[0]?.id ?? "";
        const firstB = safe.find((p: Profile) => String(p.id) === rememberedB && String(p.id) !== String(firstA))?.id
          ?? safe.find((p: Profile) => String(p.id) !== String(firstA))?.id ?? "";
        setAId(String(firstA));
        setBId(String(firstB));
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : "Saved profiles could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (aId) localStorage.setItem("soulCompatibilityPrimaryId", aId);
    if (bId) localStorage.setItem("soulCompatibilityPartnerId", bId);
  }, [aId, bId]);

  async function compare(first = aId, second = bId) {
    if (!first || !second || first === second) {
      setMessage("Choose two different saved profiles.");
      return;
    }
    setReportLoading(true);
    setMessage("");
    try {
      const response = await apiRequest("POST", "/api/compatibility", { profile1Id: first, profile2Id: second });
      const data = await response.json();
      const cd = data.compatibilityData || {};
      const d = cd.dimensions || {};
      setResult({
        overallScore: data.overallScore ?? cd.overall ?? 0,
        dimensions: {
          identity: d.identity?.score ?? d.identity ?? 0,
          stress: d.stress?.score ?? d.stress ?? 0,
          values: d.values?.score ?? d.values ?? 0,
          decisions: d.decisions?.score ?? d.decisions ?? 0,
        },
        friction: cd.friction || data.friction || [],
        synergy: cd.synergy || data.synergy || [],
        growthOpportunities: cd.growthOpportunities || data.growthOpportunities || [],
        profile1Name: data.profile1?.name ?? personA?.name ?? "Person A",
        profile2Name: data.profile2?.name ?? personB?.name ?? "Person B",
        confidence: data.confidence ?? cd.confidence,
        systemsUsed: data.systemsUsed ?? cd.systemsUsed ?? [],
        systemsExcluded: data.systemsExcluded ?? cd.systemsExcluded ?? [],
        missingDataWarnings: data.missingDataWarnings ?? cd.missingDataWarnings ?? [],
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The compatibility report could not be generated.");
      setResult(null);
    } finally {
      setReportLoading(false);
    }
  }

  useEffect(() => {
    const key = aId && bId ? `${aId}:${bId}` : "";
    if (!key || key === lastKey || loading) return;
    setLastKey(key);
    void compare(aId, bId);
  }, [aId, bId, lastKey, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  async function addPerson() {
    if (!form.name.trim() || !form.birthDate) {
      setMessage("Name and birth date are required.");
      return;
    }
    setReportLoading(true);
    try {
      const response = await apiRequest("POST", "/api/profiles", {
        ...form,
        birthTime: form.birthTime || undefined,
        birthLocation: form.birthLocation || undefined,
      });
      const created = await response.json();
      setProfiles((current) => [...current, created]);
      if (!aId) setAId(String(created.id)); else setBId(String(created.id));
      setForm({ name: "", birthDate: "", birthTime: "", birthLocation: "" });
      setFormOpen(false);
      setLastKey("");
      setMessage(`${created.name || form.name} was added.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add this person.");
    } finally {
      setReportLoading(false);
    }
  }

  const d = result?.dimensions ?? { identity: 0, stress: 0, values: 0, decisions: 0 };
  const overall = clamp(result?.overallScore ?? 0);
  const emotional = clamp((d.values + d.identity) / 2);
  const communication = clamp((d.decisions + d.identity) / 2);
  const chemistry = clamp((overall + d.values + 8) / 2);
  const conflict = clamp((d.stress + d.decisions) / 2);
  const purpose = clamp((d.identity + d.values + d.decisions) / 3);

  const verdict = useMemo(() => {
    if (!result) return "";
    return [
      result.synergy[0] || "This bond contains meaningful natural recognition and shared potential.",
      result.friction[0] || "The central challenge is learning each other’s timing, pressure responses, and emotional language.",
      result.growthOpportunities[0] || "Direct communication and deliberate repair turn recurring triggers into maturity.",
    ].map(pureText).join(" ");
  }, [result]);

  const nav = ["Overview", "Love", "Communication", "Chemistry", "Conflict", "Human Design", "Astrology", "Numerology", "Purpose", "Timeline"];
  const timeline = ["Recognition", "Attraction", "Bonding", "Trigger Phase", "Choice Point", "Mature Partnership"];

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%,rgba(91,33,182,.23),transparent 34%),#070b1d", color: "#f8f5ff" }}>
      <Navigation />
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "104px 16px 72px" }}>
        <header style={{ marginBottom: 20 }}>
          <div style={{ color: "#d8b4fe", textTransform: "uppercase", letterSpacing: ".18em", fontSize: 12 }}>Soul Codex Relationship Intelligence</div>
          <h1 style={{ margin: "7px 0 8px", fontSize: "clamp(2rem,7vw,4rem)", fontFamily: "var(--font-serif)" }}>Full Compatibility Report</h1>
          <p style={{ color: "rgba(245,242,255,.68)", lineHeight: 1.6 }}>Every available section is displayed in one continuous reading.</p>
        </header>

        <section style={{ ...panel, padding: 18, marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12, alignItems: "end" }}>
            <label style={{ display: "grid", gap: 7, fontSize: 12 }}>Person A
              <select value={aId} onChange={(event) => { const next = event.target.value; setAId(next); if (next === bId) setBId(String(profiles.find((p) => String(p.id) !== next)?.id ?? "")); setResult(null); setLastKey(""); }} style={inputStyle}>
                <option value="">Choose Person A</option>
                {profiles.map((profile) => <option key={String(profile.id)} value={String(profile.id)}>{profile.name || `Profile ${profile.id}`}</option>)}
              </select>
            </label>
            <label style={{ display: "grid", gap: 7, fontSize: 12 }}>Person B
              <select value={bId} onChange={(event) => { setBId(event.target.value); setResult(null); setLastKey(""); }} style={inputStyle}>
                <option value="">Choose Person B</option>
                {profiles.filter((p) => String(p.id) !== aId).map((profile) => <option key={String(profile.id)} value={String(profile.id)}>{profile.name || `Profile ${profile.id}`}</option>)}
              </select>
            </label>
            <ScButton variant="secondary" onClick={() => setFormOpen((open) => !open)}>Add Another Person</ScButton>
            <ScButton loading={reportLoading} onClick={() => void compare()}>Generate Full Report</ScButton>
          </div>
        </section>

        {message && <div style={{ ...panel, padding: 13, marginBottom: 16, color: "#f0abfc" }}>{message}</div>}

        {formOpen && (
          <section style={{ ...panel, padding: 18, marginBottom: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
            <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            <input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} style={inputStyle} />
            <input type="time" value={form.birthTime} onChange={(e) => setForm({ ...form, birthTime: e.target.value })} style={inputStyle} />
            <input placeholder="Birth location" value={form.birthLocation} onChange={(e) => setForm({ ...form, birthLocation: e.target.value })} style={inputStyle} />
            <ScButton loading={reportLoading} onClick={() => void addPerson()}>Save Person</ScButton>
          </section>
        )}

        {(loading || reportLoading) && <div style={{ padding: 72, textAlign: "center" }}><CosmicLoader label={loading ? "Loading saved profiles..." : "Building the complete relationship reading..."} /></div>}

        {!loading && !reportLoading && profiles.length < 2 && (
          <section style={{ ...panel, padding: 34, textAlign: "center" }}>
            <IconHeart size={46} style={{ color: "#c084fc", margin: "0 auto 12px" }} />
            <h2>{profiles.length ? "Add Person B" : "Create the first profile"}</h2>
            <p style={{ color: "rgba(245,242,255,.68)" }}>Two saved profiles are required for a compatibility report.</p>
            {!profiles.length && <a href="/create"><ScButton>Start First Reading</ScButton></a>}
          </section>
        )}

        {result && !loading && !reportLoading && (
          <main id="overview">
            <section style={{ ...panel, padding: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 24, alignItems: "center", marginBottom: 18 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "rgba(245,242,255,.66)" }}>Overall Compatibility</div>
                <div style={{ fontSize: "clamp(4rem,14vw,7rem)", lineHeight: 1, fontFamily: "var(--font-serif)" }}>{overall}<span style={{ fontSize: ".38em" }}>%</span></div>
                <div style={{ color: "#f0abfc", textTransform: "uppercase", letterSpacing: ".14em" }}>{label(overall)}</div>
              </div>
              <div>
                <div style={{ color: "#d8b4fe", textTransform: "uppercase", letterSpacing: ".12em", fontSize: 12 }}>{result.profile1Name} + {result.profile2Name}</div>
                <h2 style={{ margin: "8px 0 10px" }}>Relationship Core</h2>
                <p style={{ color: "rgba(247,244,255,.8)", lineHeight: 1.75 }}>{verdict}</p>
              </div>
              <div style={{ display: "grid", gap: 14 }}>
                <Bar name="Natural Harmony" score={emotional} />
                <Bar name="Conscious Effort" score={conflict} />
                <Bar name="Growth Potential" score={purpose} />
                <ConfidenceBadge badge={result.confidence?.label ?? result.confidence?.badge ?? "Partial"} reason={result.confidence?.reason} size="sm" />
              </div>
            </section>

            <nav style={{ ...panel, padding: 8, display: "flex", gap: 6, overflowX: "auto", marginBottom: 18, position: "sticky", top: 78, zIndex: 20 }}>
              {nav.map((item) => <button key={item} onClick={() => document.getElementById(item.toLowerCase().replace(/\s+/g, "-"))?.scrollIntoView({ behavior: "smooth" })} style={{ border: 0, borderRadius: 99, padding: "10px 14px", whiteSpace: "nowrap", color: "white", background: "rgba(124,58,237,.2)" }}>{item}</button>)}
            </nav>

            <Section id="relationship-core" title="Relationship Core">
              <Facts items={[
                ["Bond Type", label(overall)],
                ["Primary Strength", pureText(result.synergy[0] || "Emotional recognition and shared potential")],
                ["Primary Challenge", pureText(result.friction[0] || "Different processing rhythms")],
                ["Shared Mission", pureText(result.growthOpportunities[0] || "Learning trust without control")],
              ]} />
            </Section>

            <Section id="love" title={`Love Compatibility · ${emotional}%`}>
              <Bar name="Emotional Safety" score={emotional} /><br />
              <Facts items={[
                [`How ${personA?.name || "Person A"} loves`, "Presence, loyalty, protection, reassurance, consistency, and the patterns visible in the complete profile."],
                [`How ${personB?.name || "Person B"} loves`, "Attention, affection, shared experience, honesty, support, and the patterns visible in the complete profile."],
                ["What strengthens love", "State needs clearly, translate actions into emotional meaning, and let consistency carry more weight than intensity."],
                ["What weakens love", "Expecting the other person to automatically understand unspoken needs, boundaries, fears, or promises."],
              ]} />
            </Section>

            <Section id="communication" title={`Communication Compatibility · ${communication}%`}>
              <Facts items={[
                ["Mental Understanding", `${d.identity}% identity alignment shapes how naturally their perspectives recognize one another.`],
                ["Decision Rhythm", `${d.decisions}% decision alignment shows whether they reach clarity in similar ways and at similar speeds.`],
                ["Emotional Language", `${d.values}% values alignment shows how closely their private meanings and priorities match.`],
                ["Best Repair Method", "Acknowledge the impact, identify the real issue, allow honest processing time, and return with a direct agreement."],
              ]} />
            </Section>

            <Section id="chemistry" title={`Chemistry and Attraction · ${chemistry}%`}>
              <Facts items={[
                ["Physical Pull", `${chemistry}% projected attraction from overall resonance, values, identity, and available chemistry signals.`],
                ["Emotional Magnetism", `${emotional}% emotional recognition. Attraction deepens when both people feel seen rather than merely desired.`],
                ["Mental Stimulation", `${communication}% mental engagement. Difference can feed curiosity instead of automatically becoming friction.`],
                ["Reality Check", "Chemistry explains the pull. It does not replace honesty, consent, stability, safety, maturity, or compatible life choices."],
              ]} />
            </Section>

            <Section id="conflict" title={`Conflict, Triggers, and Repair · ${conflict}%`}>
              <Facts items={[
                ["Pressure Response", `${d.stress}% alignment under pressure. Lower alignment requires more deliberate pause and repair habits.`],
                ["Likely Trigger", pureText(result.friction[0] || "Different processing speeds, expectations, boundaries, or reassurance needs.")],
                ["Hidden Fear", "Conflict often protects a deeper fear involving rejection, abandonment, loss of control, disrespect, or not being understood."],
                ["How to Win Anyway", pureText(result.growthOpportunities[0] || "Do not force instant answers, weaponize silence, or treat intensity as final truth.")],
              ]} />
            </Section>

            <Section id="human-design" title="Human Design Compatibility">
              <Facts items={[
                [`${personA?.name || "Person A"} Type`, read(personA, "humanDesign", "type")],
                [`${personB?.name || "Person B"} Type`, read(personB, "humanDesign", "type")],
                ["Authority Comparison", `${read(personA, "humanDesign", "authority")} + ${read(personB, "humanDesign", "authority")}`],
                ["Profile Comparison", `${read(personA, "humanDesign", "profile")} + ${read(personB, "humanDesign", "profile")}`],
                ["Definition Pattern", `${read(personA, "humanDesign", "definition")} + ${read(personB, "humanDesign", "definition")}`],
                ["Relationship Guidance", "Respect each person’s strategy, energy pace, and authority. Major decisions should move at the speed of the slower clarity process."],
              ]} />
            </Section>

            <Section id="astrology" title="Astrology and Synastry">
              <Facts items={[
                [`${personA?.name || "Person A"} Sun / Moon / Rising`, `${read(personA, "astrology", "sunSign")} / ${read(personA, "astrology", "moonSign")} / ${read(personA, "astrology", "risingSign")}`],
                [`${personB?.name || "Person B"} Sun / Moon / Rising`, `${read(personB, "astrology", "sunSign")} / ${read(personB, "astrology", "moonSign")} / ${read(personB, "astrology", "risingSign")}`],
                ["Identity Chemistry", `${d.identity}% identity resonance reflects how naturally the two personal styles reinforce or challenge one another.`],
                ["Emotional Synastry", `${emotional}% projected emotional rhythm from the available birth and relationship signals.`],
                ["Long-Term Lesson", "Commitment themes appear through responsibility, boundaries, timing, consequences, and whether promises become reliable behavior."],
                ["Unknown-Time Honesty", "Time-sensitive placements remain limited or explicitly estimated when exact birth times are unavailable."],
              ]} />
            </Section>

            <Section id="numerology" title="Numerology Compatibility">
              <Facts items={[
                [`${personA?.name || "Person A"} Core Numbers`, `Life Path ${read(personA, "numerology", "lifePath")}, Expression ${read(personA, "numerology", "expression")}, Soul Urge ${read(personA, "numerology", "soulUrge")}`],
                [`${personB?.name || "Person B"} Core Numbers`, `Life Path ${read(personB, "numerology", "lifePath")}, Expression ${read(personB, "numerology", "expression")}, Soul Urge ${read(personB, "numerology", "soulUrge")}`],
                ["Life Direction", `${purpose}% projected shared-purpose alignment.`],
                ["Private Needs", "Soul Urge patterns describe what each person privately needs to feel fulfilled, valued, and emotionally honest."],
                ["Visible Expression", "Expression numbers describe how each person acts, communicates, solves problems, creates, and moves through the world."],
                ["Timing", "Personal-year influences are temporary context, not permanent destiny carved into celestial paperwork."],
              ]} />
            </Section>

            <Section id="purpose" title={`Shared Purpose and Soul Lessons · ${purpose}%`}>
              <Facts items={[
                ["Why the Bond Matters", pureText(result.growthOpportunities[0] || "The relationship reveals patterns that neither person can fully see alone.")],
                ["Highest Expression", "Mutual courage, honest interdependence, shared creation, clearer boundaries, and a bond that strengthens both identities."],
                ["Shadow Expression", "Rescuing, withdrawing, chasing, controlling, projecting, or repeating the same conflict without changing the underlying behavior."],
                ["Shared Mission", `${purpose}% purpose alignment across identity, values, decisions, and available symbolic systems.`],
              ]} />
            </Section>

            <Section id="timeline" title="Relationship Timeline">
              <div style={{ display: "grid", gap: 11 }}>
                {timeline.map((stage, index) => <div key={stage} style={{ display: "grid", gridTemplateColumns: "38px 1fr", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center", background: "linear-gradient(145deg,#6d28d9,#c084fc)", fontWeight: 800 }}>{index + 1}</div>
                  <div style={{ background: "rgba(255,255,255,.045)", borderRadius: 12, padding: 14 }}><strong>{stage}</strong></div>
                </div>)}
              </div>
            </Section>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14, marginBottom: 18 }}>
              <Insights title="Biggest Strengths" items={result.synergy} color="#5eead4" />
              <Insights title="Friction Points" items={result.friction} color="#fb7185" />
              <Insights title="How to Win Anyway" items={result.growthOpportunities} color="#c084fc" />
            </div>

            {(result.missingDataWarnings?.length || result.systemsExcluded?.length) ? (
              <section style={{ ...panel, padding: 18, marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}><IconAlert size={18} style={{ color: "#fbbf24" }} /><strong>Confidence and Missing-Data Notes</strong></div>
                {[...(result.missingDataWarnings || []), ...(result.systemsExcluded || []).map((item) => `${item.system}: ${item.reason || "not included"}`)].map((item, index) => <p key={index} style={{ color: "rgba(247,244,255,.72)" }}>{pureText(item)}</p>)}
              </section>
            ) : null}

            <section style={{ ...panel, padding: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
              <div><h2 style={{ marginTop: 0 }}>Final Verdict</h2><p style={{ color: "rgba(247,244,255,.82)", lineHeight: 1.8 }}>{verdict}</p><p style={{ color: "rgba(247,244,255,.62)", lineHeight: 1.7 }}>This report describes patterns, not guaranteed behavior. Character, consent, honesty, safety, maturity, and repeated choices remain more important than any symbolic system.</p></div>
              <div style={{ minHeight: 180, display: "grid", placeItems: "center", background: "radial-gradient(circle,rgba(168,85,247,.27),transparent 65%)", borderRadius: 18 }}><IconSparkles size={82} style={{ color: "#d8b4fe" }} /></div>
            </section>
          </main>
        )}
      </div>
    </div>
  );
}
