import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import ConfidenceBadge from "../components/ConfidenceBadge";

interface ThemeScore {
  tag: string;
  score: number;
  sources: string[];
}

interface CodexSynthesis {
  codename: string;
  archetype: string;
  badges: {
    badge: "verified" | "partial" | "unverified";
    label: string;
    reason: string;
    aiAssuranceNote: string;
    /** Legacy API shape */
    confidenceLabel?: string;
  };
  topThemes: ThemeScore[];
  strengths: string[];
  shadows: string[];
  triggers: string[];
  prescriptions: string[];
  narrative: string;
}

// Map section header prefixes to accent colors + glyphs
const SECTION_ACCENTS: Record<string, { color: string; glyph: string }> = {
  "CODENAME":   { color: "#fbbf24", glyph: "⧫" },
  "MOTTO":      { color: "#a78bfa", glyph: "◈" },
  "WHO I AM":   { color: "#8b5cf6", glyph: "◉" },
  "HOW I MOVE": { color: "#f59e0b", glyph: "⬡" },
  "WHAT I WON": { color: "#f472b6", glyph: "◌" },
  "WHAT I'M B": { color: "#fbbf24", glyph: "◆" },
  "THIS WEEK":  { color: "#22d3ee", glyph: "◎" },
};

function getSectionAccent(header: string) {
  const upper = header.toUpperCase();
  for (const [key, val] of Object.entries(SECTION_ACCENTS)) {
    if (upper.startsWith(key)) return val;
  }
  return { color: "#8b5cf6", glyph: "◈" };
}

const SECTION_HEADERS = [
  "CODENAME:", "MOTTO:", "WHO I AM", "HOW I MOVE UNDER PRESSURE",
  "WHAT I WON'T TOLERATE", "WHAT I'M BUILDING", "THIS WEEK",
];

function parseNarrative(text: string) {
  if (!text) return [];
  const lines = text.split("\n");
  const sections: { header: string; lines: string[] }[] = [];
  let current: { header: string; lines: string[] } | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    const isHeader = SECTION_HEADERS.some(h => line.startsWith(h));
    if (isHeader) {
      if (current) sections.push(current);
      current = { header: line, lines: [] };
    } else if (current && line) {
      current.lines.push(line);
    } else if (!current && line) {
      current = { header: "", lines: [line] };
    }
  }
  if (current) sections.push(current);
  return sections;
}

const THEME_ICONS: Record<string, string> = {
  precision: "◈", service: "✦", privacy: "◉", intensity: "⬡", freedom: "◎",
  leadership: "▲", healing: "✿", order: "⊞", innovation: "⚙", intuition: "☽",
  discipline: "⬛", rebellion: "⚡", craft: "⬟", legacy: "⧫", emotion_depth: "◇",
  social_sensitivity: "◌", truth: "◆", boundaries: "▪", courage: "▶", focus: "⊕",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase",
      color: "var(--muted-foreground)", marginBottom: "0.85rem", fontWeight: 700
    }}>
      {children}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "rgba(15,25,40,0.6)",
      border: "1px solid rgba(139,92,246,0.15)",
      borderRadius: "14px",
      padding: "1.25rem 1.5rem",
      marginBottom: "1rem",
      ...style
    }}>
      {children}
    </div>
  );
}

function AccordionSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: "1px solid rgba(139,92,246,0.15)",
      borderRadius: "10px",
      marginBottom: "0.5rem",
      overflow: "hidden"
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", textAlign: "left", background: "rgba(15,25,40,0.55)",
          border: "none", padding: "0.85rem 1.25rem", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          color: "var(--foreground)"
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.55rem", fontSize: "0.88rem", fontWeight: 600 }}>
          <span style={{ opacity: 0.75 }}>{icon}</span>
          {title}
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
      </button>
      {open && (
        <div style={{ padding: "1rem 1.25rem 1.25rem", background: "rgba(10,15,30,0.5)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function SystemRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "0.3rem 0", borderBottom: "1px solid rgba(139,92,246,0.08)" }}>
      <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", flexShrink: 0, marginRight: "1rem" }}>{label}</span>
      <span style={{ fontSize: "0.8rem", color: "rgba(230,230,255,0.88)", textAlign: "right" }}>{String(value)}</span>
    </div>
  );
}

interface NormalizedProfile {
  astro: any; num: any; hd: any; elemMed: any; chakra: any; ayurveda: any;
  moral: any; archData: any; palmistry: any; personality: any; numerology: any;
  sunSign: string | null; moonSign: string | null; risingSign: string | null;
  lifePathNum: number | null; hdType: string | null;
}

function normalizeProfileData(p: any): NormalizedProfile {
  const astro      = p?.astrology      ?? p?.astrologyData      ?? {};
  const num        = p?.numerologyData ?? p?.numerology         ?? {};
  const hd         = p?.humanDesignData ?? p?.humanDesign       ?? {};
  const numerology = num?.calculateNumerology ?? num;
  return {
    astro, num, hd, numerology,
    elemMed:     p?.elementalMedicineData ?? {},
    chakra:      p?.chakraData            ?? {},
    ayurveda:    p?.ayurvedaData          ?? {},
    moral:       p?.moralCompassData      ?? p?.moralCompass ?? {},
    archData:    p?.archetypeData         ?? p?.archetype   ?? {},
    palmistry:   p?.palmistryData         ?? {},
    personality: p?.personalityData       ?? {},
    sunSign:     astro?.sunSign     ?? p?.sun_sign    ?? null,
    moonSign:    astro?.moonSign    ?? p?.moon_sign   ?? null,
    risingSign:  astro?.risingSign  ?? p?.rising_sign ?? null,
    lifePathNum: numerology?.lifePath ?? numerology?.lifePathNumber ?? null,
    hdType:      hd?.type ?? null,
  };
}

export default function CodexReadingPage() {
  const [, navigate] = useLocation();
  const [synthesis, setSynthesis] = useState<CodexSynthesis | null>(null);
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest("/api/codex30/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Generation failed");
      return data.synthesis as CodexSynthesis;
    },
    onSuccess: (data) => {
      setSynthesis(data);
      try { localStorage.setItem("soulCodexReading", JSON.stringify(data)); } catch {}
    },
    onError: (err: any) => setError(err.message ?? "Unknown error"),
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("soulProfile");
      if (raw) setFullProfile(JSON.parse(raw));
    } catch {}

    const cached = localStorage.getItem("soulCodexReading");
    if (cached) {
      try { setSynthesis(JSON.parse(cached)); return; } catch {}
    }
    buildAndGenerate();
  }, []);

  function buildAndGenerate() {
    const rawProfile    = localStorage.getItem("soulProfile");
    const rawChart      = localStorage.getItem("soulFullChart");
    const rawInputs     = localStorage.getItem("soulUserInputs");
    const rawOnboarding = localStorage.getItem("onboardingData");
    const rawConf       = localStorage.getItem("soulConfidence");

    let profile: any    = {};
    let fullChart: any  = undefined;
    let userInputs: any = {};

    try { if (rawProfile) profile = JSON.parse(rawProfile); } catch {}
    try { if (rawChart)   fullChart = JSON.parse(rawChart); } catch {}
    if (rawInputs)     { try { userInputs = JSON.parse(rawInputs); } catch {} }
    else if (rawOnboarding) { try { userInputs = JSON.parse(rawOnboarding); } catch {} }
    else if (profile?.signals) { userInputs = profile.signals; }
    if (rawConf) { try { const c = JSON.parse(rawConf); profile.confidence = c; } catch {} }

    if (!rawProfile && !rawOnboarding) {
      setError("No profile found. Complete the onboarding first.");
      return;
    }
    generateMutation.mutate({ profile, fullChart, userInputs });
  }

  function handleRegenerate() {
    try { localStorage.removeItem("soulCodexReading"); } catch {}
    setSynthesis(null);
    setError(null);
    buildAndGenerate();
  }

  const sections = parseNarrative(synthesis?.narrative ?? "");

  // ── Derived profile fields ──────────────────────────────────────────
  const {
    astro, hd, elemMed, chakra, ayurveda, moral, archData, palmistry, personality, numerology,
    sunSign, moonSign, risingSign, lifePathNum, hdType
  } = normalizeProfileData(fullProfile);

  // ── Loading state ───────────────────────────────────────────────────
  if (generateMutation.isPending && !synthesis) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", padding: "2rem" }}>
        <div style={{ fontSize: "3rem", animation: "spin 3s linear infinite" }}>✦</div>
        <h2 style={{ color: "var(--cosmic-lavender)", fontFamily: "var(--font-serif)", fontSize: "1.4rem" }}>
          Building your Codex Reading…
        </h2>
        <p style={{ color: "var(--muted-foreground)", textAlign: "center", maxWidth: "380px", fontSize: "0.9rem" }}>
          Collecting signals from your chart, numerology, moral compass, and more.
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Error
  if (error) {
    const noProfile = error.toLowerCase().includes("no profile") || error.toLowerCase().includes("onboarding");
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: 440, width: "100%" }}>
          <div style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderTop: `3px solid ${noProfile ? "var(--cosmic-purple)" : "#ef4444"}`,
            borderRadius: "var(--radius)",
            padding: "2rem 1.75rem",
            textAlign: "center",
          }}>
            {noProfile ? (
              <>
                <div style={{ fontSize: "1.75rem", marginBottom: "1rem", color: "var(--cosmic-lavender)", opacity: 0.7 }}>◈</div>
                <h3 style={{ marginBottom: "0.5rem", fontSize: "1.1rem", fontWeight: 600 }}>Your Codex needs a profile first</h3>
                <p style={{ color: "var(--muted-foreground)", fontSize: "0.85rem", lineHeight: 1.65, marginBottom: "0.75rem" }}>
                  Your Codex Reading is a 30-point synthesis that assigns you a codename, a first-person narrative, and a ranked map of your core patterns across 15+ systems.
                </p>
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                  {["Codename", "30-pt synthesis", "Core narrative"].map((f) => (
                    <span key={f} style={{ padding: "0.2rem 0.6rem", borderRadius: 99, fontSize: "0.7rem", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "var(--cosmic-lavender)" }}>{f}</span>
                  ))}
                </div>
                <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => navigate("/start")}>Build My Profile</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: "1.5rem", marginBottom: "1rem", opacity: 0.5 }}>⚠</div>
                <h3 style={{ marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 600 }}>Could not generate your reading</h3>
                <p style={{ color: "var(--muted-foreground)", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "0.35rem" }}>
                  The synthesis engine hit an error. Your profile data is intact — retrying usually resolves this.
                </p>
                <p style={{ color: "var(--muted-foreground)", fontSize: "0.75rem", opacity: 0.6, marginBottom: "1.5rem" }}>{error}</p>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setError(null); buildAndGenerate(); }}>Try Again</button>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate("/start")}>Start Over</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!synthesis) return null;

  return (
    <div style={{ minHeight: "100vh", padding: "2rem 1rem 4rem", maxWidth: "740px", margin: "0 auto" }}>

      {/* ── A. HEADER / IDENTITY ────────────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{
          display: "inline-block", background: "rgba(139,92,246,0.12)",
          border: "1px solid rgba(139,92,246,0.3)", borderRadius: "99px",
          padding: "0.3rem 1rem", fontSize: "0.7rem", letterSpacing: "0.12em",
          color: "var(--cosmic-lavender)", marginBottom: "1rem", textTransform: "uppercase",
        }}>
          Soul Codex Reading
        </div>
        <h1 style={{
          fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
          color: "var(--cosmic-gold)", marginBottom: "0.5rem", lineHeight: 1.2,
        }}>
          {synthesis.codename}
        </h1>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
          <ConfidenceBadge
            badge={synthesis.badges.badge ?? (synthesis.badges.confidenceLabel as any) ?? "unverified"}
            label={synthesis.badges.label ?? synthesis.badges.confidenceLabel}
            reason={synthesis.badges.reason}
            size="sm"
          />
        </div>
        {synthesis.badges.aiAssuranceNote && (
          <p style={{
            fontSize: "0.72rem",
            color: "var(--muted-foreground)",
            maxWidth: "34rem",
            margin: "0.75rem auto 0",
            lineHeight: 1.55,
            fontStyle: "normal",
          }}>
            {synthesis.badges.aiAssuranceNote}
          </p>
        )}
      </div>

      {/* Identity Grid */}
      {(sunSign || moonSign || risingSign || lifePathNum || hdType) && (
        <Card style={{ marginBottom: "1.5rem" }}>
          <SectionLabel>Identity</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "0.75rem" }}>
            {sunSign && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.3rem", marginBottom: "0.2rem" }}>☀</div>
                <div style={{ fontSize: "0.6rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Sun</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(230,230,255,0.9)" }}>{sunSign}</div>
              </div>
            )}
            {moonSign && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.3rem", marginBottom: "0.2rem" }}>☽</div>
                <div style={{ fontSize: "0.6rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Moon</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(230,230,255,0.9)" }}>{moonSign}</div>
              </div>
            )}
            {risingSign && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.3rem", marginBottom: "0.2rem" }}>↑</div>
                <div style={{ fontSize: "0.6rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Rising</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(230,230,255,0.9)" }}>{risingSign}</div>
              </div>
            )}
            {lifePathNum != null && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.3rem", marginBottom: "0.2rem", fontWeight: 700, color: "var(--cosmic-gold)" }}>{lifePathNum}</div>
                <div style={{ fontSize: "0.6rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Life Path</div>
              </div>
            )}
            {hdType && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.1rem", marginBottom: "0.2rem" }}>⬡</div>
                <div style={{ fontSize: "0.6rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Energy Type</div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(230,230,255,0.9)" }}>{hdType}</div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ── B. CORE THEMES ──────────────────────────────────────────── */}
      {synthesis.topThemes.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <SectionLabel>Core Themes</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {synthesis.topThemes.slice(0, 6).map(t => (
              <span key={t.tag} style={{
                display: "inline-flex", alignItems: "center", gap: "0.35rem",
                background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: "10px", padding: "0.4rem 0.85rem",
                fontSize: "0.82rem", color: "var(--cosmic-lavender)"
              }}>
                <span style={{ opacity: 0.8, fontSize: "0.95rem" }}>{THEME_ICONS[t.tag] ?? "◈"}</span>
                {t.tag.replace(/_/g, " ")}
                <span style={{ opacity: 0.45, fontSize: "0.68rem" }}>{t.score}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── C. ARCHETYPE ─────────────────────────────────────────────── */}
      {(synthesis.codename || archData?.title || archData?.description) && (
        <Card style={{ marginBottom: "1.5rem", borderColor: "rgba(212,175,55,0.2)" }}>
          <SectionLabel>Archetype</SectionLabel>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <span style={{ fontSize: "2rem", flexShrink: 0 }}>⚔</span>
            <div>
              <div style={{
                fontFamily: "var(--font-serif)", fontSize: "1.15rem",
                color: "var(--cosmic-gold)", marginBottom: "0.4rem", fontWeight: 600
              }}>
                {archData?.title ?? synthesis.codename}
              </div>
              {(archData?.description ?? archData?.tagline ?? archData?.role) && (
                <p style={{ fontSize: "0.85rem", color: "rgba(230,230,255,0.8)", lineHeight: 1.65, margin: 0 }}>
                  {archData.description ?? archData.tagline ?? archData.role}
                </p>
              )}
              {archData?.element && (
                <span style={{
                  display: "inline-block", marginTop: "0.6rem",
                  fontSize: "0.72rem", color: "var(--muted-foreground)",
                  background: "rgba(255,255,255,0.05)", borderRadius: "6px", padding: "0.15rem 0.5rem"
                }}>
                  {archData.element} {archData.role ? `· ${archData.role}` : ""}
                </span>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* ── D. BODY & ENERGY ─────────────────────────────────────────── */}
      {(elemMed?.primaryElement || elemMed?.stressElement || elemMed?.recommendation || chakra?.primaryChakra || ayurveda?.primaryDosha) && (
        <Card style={{ marginBottom: "1.5rem" }}>
          <SectionLabel>Body &amp; Energy</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {elemMed?.primaryElement && (
              <div>
                <div style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>Primary Element</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "rgba(230,230,255,0.9)" }}>{elemMed.primaryElement}</div>
              </div>
            )}
            {elemMed?.stressElement && (
              <div>
                <div style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>Stress Element</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#f59e0b" }}>{elemMed.stressElement}</div>
              </div>
            )}
            {chakra?.primaryChakra && (
              <div>
                <div style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>Primary Chakra</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "rgba(230,230,255,0.9)" }}>{chakra.primaryChakra}</div>
              </div>
            )}
            {ayurveda?.primaryDosha && (
              <div>
                <div style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>Dosha</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "rgba(230,230,255,0.9)" }}>{ayurveda.primaryDosha}</div>
              </div>
            )}
          </div>
          {elemMed?.recommendation && (
            <p style={{ fontSize: "0.82rem", color: "rgba(230,230,255,0.75)", lineHeight: 1.65, margin: "0.85rem 0 0", borderTop: "1px solid rgba(139,92,246,0.1)", paddingTop: "0.75rem" }}>
              {elemMed.recommendation}
            </p>
          )}
        </Card>
      )}

      {/* ── E. MORAL COMPASS ─────────────────────────────────────────── */}
      {(moral?.decisionStyle || moral?.name || (moral?.nonNegotiables ?? []).length > 0 || moral?.socialEnergy) && (
        <Card style={{ marginBottom: "1.5rem" }}>
          <SectionLabel>Moral Compass</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem", marginBottom: moral?.nonNegotiables?.length ? "0.85rem" : 0 }}>
            {(moral?.decisionStyle || moral?.name) && (
              <div>
                <div style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>Decision Style</div>
                <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "rgba(230,230,255,0.9)" }}>{moral.decisionStyle ?? moral.name}</div>
              </div>
            )}
            {moral?.socialEnergy && (
              <div>
                <div style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>Social Energy</div>
                <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "rgba(230,230,255,0.9)" }}>{moral.socialEnergy}</div>
              </div>
            )}
          </div>
          {Array.isArray(moral?.nonNegotiables) && moral.nonNegotiables.length > 0 && (
            <div>
              <div style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Non-Negotiables</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {moral.nonNegotiables.map((n: string, i: number) => (
                  <span key={i} style={{
                    fontSize: "0.78rem", padding: "0.2rem 0.6rem",
                    background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)",
                    borderRadius: "6px", color: "var(--cosmic-gold)"
                  }}>
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}
          {moral?.notes && (
            <p style={{ fontSize: "0.82rem", color: "rgba(230,230,255,0.75)", lineHeight: 1.65, margin: "0.75rem 0 0" }}>{moral.notes}</p>
          )}
        </Card>
      )}

      {/* ── F. NARRATIVE ─────────────────────────────────────────────── */}
      {sections.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <SectionLabel>Narrative</SectionLabel>
          {sections.map((sec, i) => (
            <div key={i} style={{
              background: "rgba(15,25,40,0.6)",
              border: "1px solid rgba(139,92,246,0.15)",
              borderRadius: "12px",
              padding: "1.25rem 1.5rem",
              marginBottom: "0.75rem"
            }}>
              {sec.header && (
                <h2 style={{
                  fontFamily: sec.header.startsWith("CODENAME") || sec.header.startsWith("WHO") ? "var(--font-serif)" : undefined,
                  fontSize: sec.header.startsWith("CODENAME") ? "0.7rem" : "0.85rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--cosmic-gold)",
                  marginBottom: "0.75rem"
                }}>
                  {sec.header}
                </h2>
              )}
              {sec.lines.map((line, j) => (
                <p key={j} style={{
                  color: line.startsWith("-") ? "var(--cosmic-lavender)" : "rgba(230,230,255,0.87)",
                  lineHeight: 1.75,
                  marginBottom: j < sec.lines.length - 1 ? "0.6rem" : 0,
                  fontFamily: i < 2 ? "var(--font-serif)" : undefined,
                  fontSize: i === 0 ? "1.15rem" : "0.95rem",
                  paddingLeft: line.startsWith("-") ? "0.25rem" : 0
                }}>
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Strengths / Shadows */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        {synthesis.strengths.length > 0 && (
          <div style={{
            background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)",
            borderLeft: "3px solid #22c55e", borderRadius: "12px", padding: "1.2rem",
          }}>
            <h3 style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#22c55e", marginBottom: "0.65rem" }}>
              Signal Strengths
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {synthesis.strengths.slice(0, 5).map((s, i) => (
                <li key={i} style={{ fontSize: "0.82rem", color: "rgba(230,255,230,0.82)", lineHeight: 1.6, paddingBottom: "0.3rem" }}>
                  <span style={{ color: "#22c55e", marginRight: "0.4rem" }}>✓</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {synthesis.shadows.length > 0 && (
          <div style={{
            background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
            borderLeft: "3px solid #f87171", borderRadius: "12px", padding: "1.2rem",
          }}>
            <h3 style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#f87171", marginBottom: "0.65rem" }}>
              Growth Edges
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {synthesis.shadows.slice(0, 5).map((s, i) => (
                <li key={i} style={{ fontSize: "0.82rem", color: "rgba(255,220,220,0.82)", lineHeight: 1.6, paddingBottom: "0.3rem" }}>
                  <span style={{ color: "#f87171", marginRight: "0.4rem" }}>◈</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Triggers ─────────────────────────────────────────────────────── */}
      {synthesis.triggers.length > 0 && (
        <div style={{
          background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem"
        }}>
          <h3 style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#f59e0b", marginBottom: "0.65rem" }}>
            What Drains Me
          </h3>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {synthesis.triggers.map((t, i) => (
              <li key={i} style={{ fontSize: "0.83rem", color: "rgba(255,240,200,0.85)", lineHeight: 1.7, paddingBottom: "0.25rem" }}>
                <span style={{ color: "#f59e0b", marginRight: "0.4rem" }}>▪</span>{t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── G. SYSTEMS BREAKDOWN (accordion) ────────────────────────── */}
      <div style={{ marginBottom: "2rem" }}>
        <SectionLabel>Systems Breakdown</SectionLabel>

        <AccordionSection title="Astrology" icon="☀">
          <SystemRow label="Sun Sign"    value={sunSign} />
          <SystemRow label="Moon Sign"   value={moonSign} />
          <SystemRow label="Rising Sign" value={risingSign} />
          <SystemRow label="Mercury"     value={astro?.mercurySign} />
          <SystemRow label="Venus"       value={astro?.venusSign} />
          <SystemRow label="Mars"        value={astro?.marsSign} />
          <SystemRow label="Jupiter"     value={astro?.jupiterSign} />
          <SystemRow label="Saturn"      value={astro?.saturnSign} />
        </AccordionSection>

        <AccordionSection title="Numerology" icon="◈">
          <SystemRow label="Life Path"   value={lifePathNum} />
          <SystemRow label="Expression"  value={numerology?.expression ?? numerology?.expressionNumber} />
          <SystemRow label="Soul Urge"   value={numerology?.soulUrge   ?? numerology?.soulUrgeNumber} />
          <SystemRow label="Personality" value={numerology?.personality ?? numerology?.personalityNumber} />
          <SystemRow label="Birthday"    value={numerology?.birthday   ?? numerology?.birthdayNumber} />
        </AccordionSection>

        <AccordionSection title="Human Design" icon="⬡">
          <SystemRow label="Type"        value={hd?.type} />
          <SystemRow label="Profile"     value={hd?.profile} />
          <SystemRow label="Authority"   value={hd?.authority} />
          <SystemRow label="Strategy"    value={hd?.strategy} />
          <SystemRow label="Definition"  value={hd?.definition} />
          <SystemRow label="Incarnation Cross" value={hd?.incarnationCross ?? hd?.cross} />
        </AccordionSection>

        <AccordionSection title="Elements" icon="🜁">
          <SystemRow label="Primary Element" value={elemMed?.primaryElement} />
          <SystemRow label="Stress Element"  value={elemMed?.stressElement} />
          <SystemRow label="Balance"         value={elemMed?.balance} />
          <SystemRow label="Recommendation"  value={elemMed?.recommendation} />
        </AccordionSection>

        <AccordionSection title="Personality" icon="◇">
          <SystemRow label="MBTI"            value={personality?.mbti?.type ?? personality?.mbtiType} />
          <SystemRow label="Enneagram"       value={personality?.enneagram?.type != null ? `Type ${personality.enneagram.type}` : undefined} />
          <SystemRow label="Big 5 Openness"  value={personality?.bigFive?.openness} />
          <SystemRow label="Big 5 Conscientiousness" value={personality?.bigFive?.conscientiousness} />
          <SystemRow label="Disc"            value={personality?.disc?.type} />
        </AccordionSection>

        <AccordionSection title="Archetype" icon="⚔">
          <SystemRow label="Title"       value={archData?.title    ?? archData?.name} />
          <SystemRow label="Element"     value={archData?.element} />
          <SystemRow label="Role"        value={archData?.role} />
          <SystemRow label="Tagline"     value={archData?.tagline} />
          <SystemRow label="Frequency"   value={archData?.soulFrequency?.frequency ?? fullProfile?.soul_frequency?.frequency} />
        </AccordionSection>

        {(palmistry?.dominantHand || palmistry?.lifeLineSummary || palmistry?.heartLineSummary || palmistry?.headLineSummary) && (
          <AccordionSection title="Palm Signals" icon="✋">
            <SystemRow label="Dominant Hand"  value={palmistry?.dominantHand} />
            <SystemRow label="Life Line"      value={palmistry?.lifeLineSummary  ?? palmistry?.lifeLine} />
            <SystemRow label="Heart Line"     value={palmistry?.heartLineSummary ?? palmistry?.heartLine} />
            <SystemRow label="Head Line"      value={palmistry?.headLineSummary  ?? palmistry?.headLine} />
            <SystemRow label="Fate Line"      value={palmistry?.fateLineSummary  ?? palmistry?.fateLine} />
          </AccordionSection>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", paddingTop: "1rem" }}>
        <button
          className="btn btn-secondary"
          onClick={handleRegenerate}
          disabled={generateMutation.isPending}
          style={{ fontSize: "0.85rem" }}
        >
          {generateMutation.isPending ? "Regenerating…" : "↺ Regenerate Reading"}
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => navigate("/profile")}
          style={{ fontSize: "0.85rem" }}
        >
          ← Profile
        </button>
        <button className="btn btn-ghost" onClick={() => navigate("/poster")} style={{ fontSize: "0.85rem" }}>
          Poster →
        </button>
      </div>
    </div>
  );
}
