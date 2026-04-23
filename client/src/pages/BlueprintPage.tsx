import { apiFetch } from "../lib/queryClient";
import { useState, useEffect } from "react";
import { Link } from "wouter";

const CACHE_PREFIX = "soulBlueprintReading";

const cardBase = {
  background: "rgba(28,18,10,0.72)",
  border: "1px solid rgba(212,168,95,0.18)",
  borderRadius: 12,
  backdropFilter: "blur(16px)",
} as const;

const goldHeading = {
  fontSize: "0.62rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
  color: "var(--sc-gold)",
  fontWeight: 700,
  opacity: 0.85,
};

interface BlueprintSections {
  lifePath:    string;
  sun:         string;
  moon:        string;
  rising:      string;
  humanDesign: string;
  geneKeys:    string;
  enneagram:   string;
  planets:     string;
  chiron:      string;
  nodes:       string;
  lifeTheme:   string;
}

interface BlueprintMeta {
  sun: string; moon: string; rising: string;
  lpNum: number; lpArchetype: string;
  hdType: string; hdAuth: string; hdProf: string;
  chirPl: string; northN: string; southN: string;
  ennType: string;
}

interface CachedReading {
  sections: BlueprintSections;
  meta: BlueprintMeta;
  generatedAt: string;
}

function getProfile() {
  try { return JSON.parse(localStorage.getItem("soulProfile") ?? "{}"); } catch { return {}; }
}

function cacheKey(profile: any): string {
  const id = profile?.id ?? profile?.userId ?? profile?.name ?? "anon";
  return `${CACHE_PREFIX}:${id}`;
}

function getCached(profile: any): CachedReading | null {
  try {
    const raw = localStorage.getItem(cacheKey(profile));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setCached(profile: any, data: CachedReading) {
  try { localStorage.setItem(cacheKey(profile), JSON.stringify(data)); } catch {}
}

function clearCached(profile: any) {
  try { localStorage.removeItem(cacheKey(profile)); } catch {}
}

const SECTION_META: { key: keyof BlueprintSections; label: string; glyph: string; subtitle: (meta: BlueprintMeta) => string }[] = [
  { key: "lifePath",    label: "Life Path",                  glyph: "◈", subtitle: m => `${m.lpNum} · ${m.lpArchetype}` },
  { key: "sun",         label: "Sun Sign",                   glyph: "☉", subtitle: m => `Sun in ${m.sun}` },
  { key: "moon",        label: "Moon Sign",                  glyph: "☽", subtitle: m => `Moon in ${m.moon}` },
  { key: "rising",      label: "Rising Sign",                glyph: "↑", subtitle: m => `Rising ${m.rising}` },
  { key: "humanDesign", label: "Human Design",               glyph: "⬡", subtitle: m => `${m.hdType}  ·  ${m.hdAuth} Authority  ·  ${m.hdProf} Profile` },
  { key: "geneKeys",    label: "Gene Keys",                  glyph: "✦", subtitle: _ => "Contemplative activation layer" },
  { key: "enneagram",   label: "Enneagram",                  glyph: "◉", subtitle: m => `Type ${m.ennType}` },
  { key: "planets",     label: "Planetary Placements + Houses", glyph: "☿", subtitle: _ => "Natal chart · planets + house positions" },
  { key: "chiron",      label: "Chiron",                     glyph: "⚷", subtitle: m => `In ${m.chirPl}` },
  { key: "nodes",       label: "North & South Nodes",        glyph: "☊", subtitle: m => `North ${m.northN}  ·  South ${m.southN}` },
  { key: "lifeTheme",   label: "Life Theme",                 glyph: "◌", subtitle: _ => "Synthesis · overarching pattern" },
];

const LOCKED_FEATURES = [
  "Your full Life Path interpretation",
  "Big Three breakdown — Sun, Moon, Rising",
  "Human Design reading — Type, Authority, Profile",
  "Gene Keys activation layer",
  "Enneagram deep-dive",
  "All planets + house placements",
  "Chiron wound & gift",
  "North & South Node life direction",
  "Life Theme synthesis",
];

export default function BlueprintPage() {
  const [isPremium, setIsPremium]          = useState(false);
  const [premiumChecked, setPremiumChecked] = useState(false);
  const [entitlementError, setEntitlementError] = useState(false);
  const [cached, setCachedState]           = useState<CachedReading | null>(null);
  const [generating, setGenerating]        = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [error, setError]                  = useState<string | null>(null);
  const [profile, setProfile]              = useState<any>(null);

  const checkEntitlements = (p: any) => {
    setEntitlementError(false);
    const cachedPremium = (() => { try { return localStorage.getItem("soulPremium") === "true"; } catch { return false; } })();
    if (cachedPremium) setIsPremium(true);
    apiFetch("/api/entitlements")
      .then((r) => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((d) => { if (d?.isPremium) setIsPremium(true); })
      .catch((err) => {
        console.warn("[blueprint] entitlements fetch failed:", err);
        setEntitlementError(true);
      })
      .finally(() => setPremiumChecked(true));
  };

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    setCachedState(getCached(p));
    checkEntitlements(p);
  }, []);

  const hasProfile = !!(profile?.birthDate || profile?.dob || profile?.sunSign);

  const handleGenerate = async (force = false) => {
    if (!hasProfile) return;
    if (force) clearCached(profile);
    setGenerating(true);
    setError(null);
    try {
      const res = await apiFetch("/api/blueprint/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      if (res.status === 403) {
        setIsPremium(false);
        setGenerating(false);
        return;
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "Generation failed. Try again.");
        setGenerating(false);
        return;
      }
      const json = await res.json();
      const data: CachedReading = { sections: json.sections, meta: json.meta, generatedAt: new Date().toISOString() };
      setCached(profile, data);
      setCachedState(data);
    } catch (err) {
      console.error("[blueprint] generate failed:", err);
      setError("Network error. Check your connection and try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = () => handleGenerate(true);

  const handleDownloadPdfReport = async () => {
    if (!profile) return;
    setDownloadingPdf(true);
    try {
      // Pull data from localStorage profile; if missing, fetch full profile from server
      let astro = profile.astrologyData ?? profile.astrology ?? profile.natalChart ?? null;
      let hd    = profile.humanDesignData ?? profile.humanDesign ?? profile.human_design ?? null;
      let name  = profile.name ?? "Soul Codex";
      let birthDate     = profile.birthDate ?? profile.dob ?? "";
      let birthTime     = profile.birthTime ?? profile.time ?? "";
      let birthLocation = profile.birthLocation ?? profile.location ?? profile.city ?? "";

      if (!astro || !birthDate) {
        try {
          const serverRes = await apiFetch("/api/profiles");
          if (serverRes.ok) {
            const profiles = await serverRes.json();
            const sp = Array.isArray(profiles) ? profiles[0] : profiles;
            if (sp) {
              astro         = sp.astrologyData  ?? astro ?? {};
              hd            = sp.humanDesignData ?? hd   ?? {};
              name          = sp.name          ?? name;
              birthDate     = sp.birthDate     ?? birthDate;
              birthTime     = sp.birthTime     ?? birthTime;
              birthLocation = sp.birthLocation ?? birthLocation;
            }
          }
        } catch { /* use whatever we have */ }
      }

      const res = await apiFetch("/api/natal-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: { name, birthDate, birthTime, birthLocation },
          astrologyData:   astro ?? {},
          humanDesignData: hd    ?? {},
        }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = `${name.replace(/\s+/g, "_")}_Natal_Chart.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[blueprint] PDF download failed:", err);
    } finally { setDownloadingPdf(false); }
  };

  /* ── No profile ── */
  if (!hasProfile) {
    return (
      <div style={{ padding: "3rem 1.5rem", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ ...cardBase, padding: "2.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>◌</div>
          <h2 style={{ fontFamily: "var(--font-serif)", color: "var(--sc-gold)", marginBottom: "0.75rem" }}>
            No profile found
          </h2>
          <p style={{ color: "rgba(246,241,232,0.55)", fontSize: "0.9rem", lineHeight: 1.65, marginBottom: "1.5rem" }}>
            Your Cosmic Blueprint is built from your birth data, Human Design, and behavioral profile. Start your Soul Codex to unlock it.
          </p>
          <Link href="/start">
            <button className="btn btn-primary" style={{ fontSize: "0.9rem", padding: "0.75rem 2rem" }}>
              Begin Your Soul Profile
            </button>
          </Link>
        </div>
      </div>
    );
  }

  /* ── Entitlement check failed (network/server error) ── */
  if (premiumChecked && entitlementError && !isPremium) {
    return (
      <div style={{ padding: "3rem 1.5rem", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ ...cardBase, padding: "2.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚡</div>
          <h2 style={{ fontFamily: "var(--font-serif)", color: "var(--sc-gold)", marginBottom: "0.75rem" }}>
            Connection error
          </h2>
          <p style={{ color: "rgba(246,241,232,0.55)", fontSize: "0.9rem", lineHeight: 1.65, marginBottom: "1.5rem" }}>
            We couldn't verify your access level. Check your connection and try again.
          </p>
          <button
            className="btn btn-primary"
            style={{ fontSize: "0.9rem", padding: "0.75rem 2rem" }}
            onClick={() => { setPremiumChecked(false); checkEntitlements(profile); }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ── Not premium (and check complete) ── */
  if (premiumChecked && !isPremium) {
    return (
      <div style={{ padding: "2rem 1.5rem 4rem", maxWidth: 760, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem,3vw,2rem)", color: "var(--sc-gold)", margin: "0 0 0.4rem", letterSpacing: "0.02em" }}>
          Full Cosmic Blueprint
        </h1>
        <p style={{ color: "rgba(246,241,232,0.45)", fontSize: "0.85rem", margin: "0 0 2rem" }}>
          A modality-by-modality reading of your soul's architecture.
        </p>

        {/* Locked card */}
        <div style={{ ...cardBase, padding: "2rem", border: "1px solid rgba(212,168,95,0.35)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "1.5rem", color: "var(--sc-gold)" }}>🔒</span>
            <div>
              <div style={{ ...goldHeading, marginBottom: "0.2rem" }}>Premium Feature</div>
              <div style={{ color: "rgba(246,241,232,0.6)", fontSize: "0.85rem" }}>
                Unlock your complete reading across all 9 modalities
              </div>
            </div>
          </div>

          {/* Feature list — blurred preview */}
          <div style={{ marginBottom: "1.75rem" }}>
            {LOCKED_FEATURES.map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "0.6rem",
                padding: "0.55rem 0",
                borderBottom: i < LOCKED_FEATURES.length - 1 ? "1px solid rgba(212,168,95,0.08)" : "none",
              }}>
                <span style={{ color: "var(--sc-gold)", fontSize: "0.7rem", opacity: 0.6 }}>✦</span>
                <span style={{ color: "rgba(246,241,232,0.65)", fontSize: "0.88rem" }}>{f}</span>
              </div>
            ))}
          </div>

          <Link href="/profile">
            <button className="btn btn-primary" style={{
              width: "100%", fontSize: "0.9rem", padding: "0.85rem",
              background: "linear-gradient(135deg, rgba(212,168,95,0.25), rgba(212,168,95,0.12))",
              border: "1px solid rgba(212,168,95,0.5)", color: "var(--sc-gold)", marginBottom: "0.75rem",
            }}>
              Unlock Full Blueprint
            </button>
          </Link>
          <div style={{ textAlign: "center" }}>
            <Link href="/profile" style={{ fontSize: "0.78rem", color: "rgba(246,241,232,0.35)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
              Enter access code
            </Link>
          </div>
        </div>

        {/* Blurred section preview */}
        <div style={{ marginTop: "1.5rem", position: "relative", overflow: "hidden", borderRadius: 12 }}>
          <div style={{ filter: "blur(6px)", pointerEvents: "none", userSelect: "none" }}>
            {SECTION_META.slice(0, 3).map(s => (
              <div key={s.key} style={{ ...cardBase, padding: "1.25rem 1.5rem", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "1.1rem", color: "var(--sc-gold)", opacity: 0.7 }}>{s.glyph}</span>
                  <span style={{ ...goldHeading }}>{s.label}</span>
                </div>
                <p style={{ color: "rgba(246,241,232,0.5)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
                  I move through the world with a particular signature that shapes how I initiate, respond, and rest. My pattern here is consistent and distinct.
                </p>
              </div>
            ))}
          </div>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 0%, rgba(26,14,7,0.85) 100%)",
            display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "1.5rem",
          }}>
            <span style={{ color: "rgba(212,168,95,0.5)", fontSize: "0.78rem", letterSpacing: "0.12em" }}>
              🔒  PREMIUM ONLY
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ── Premium: show generate or reading ── */
  return (
    <div style={{ padding: "2rem 1.5rem 4rem", maxWidth: 820, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem,3vw,2rem)", color: "var(--sc-gold)", margin: "0 0 0.3rem", letterSpacing: "0.02em" }}>
          Full Cosmic Blueprint
        </h1>
        <p style={{ color: "rgba(246,241,232,0.45)", fontSize: "0.85rem", margin: 0 }}>
          A modality-by-modality reading of your soul's architecture — Life Path to Life Theme.
        </p>
      </div>

      {/* No reading yet */}
      {!cached && !generating && (
        <div style={{ ...cardBase, padding: "2.5rem", textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.7 }}>✦</div>
          <h2 style={{ fontFamily: "var(--font-serif)", color: "var(--sc-ivory)", fontSize: "1.2rem", marginBottom: "0.5rem" }}>
            Your reading hasn't been generated yet
          </h2>
          <p style={{ color: "rgba(246,241,232,0.45)", fontSize: "0.87rem", lineHeight: 1.6, marginBottom: "1.5rem", maxWidth: 480, margin: "0 auto 1.5rem" }}>
            This pulls together your Life Path, Big Three, Human Design, Gene Keys, Enneagram, planetary placements, Chiron, Nodes, and synthesizes a Life Theme — all in one reading.
          </p>
          {error && <p style={{ color: "#f87171", fontSize: "0.82rem", marginBottom: "1rem" }}>{error}</p>}
          <button
            className="btn btn-primary"
            onClick={() => handleGenerate(false)}
            style={{ fontSize: "0.9rem", padding: "0.85rem 2.5rem" }}
          >
            ✦ Generate Full Reading
          </button>
        </div>
      )}

      {/* Generating spinner */}
      {generating && (
        <div style={{ ...cardBase, padding: "2.5rem", textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem", color: "var(--sc-gold)", opacity: 0.7 }}>◌</div>
          <p style={{ color: "rgba(246,241,232,0.6)", fontSize: "0.9rem" }}>
            Generating your full reading across 9 modalities…
          </p>
          <p style={{ color: "rgba(246,241,232,0.35)", fontSize: "0.78rem", marginTop: "0.5rem" }}>
            This takes 10–20 seconds.
          </p>
        </div>
      )}

      {/* Reading sections */}
      {cached && !generating && (
        <>
          {/* Meta bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.72rem", color: "rgba(246,241,232,0.3)", letterSpacing: "0.08em" }}>
              Generated {new Date(cached.generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <button
              onClick={handleRegenerate}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.72rem", color: "rgba(246,241,232,0.35)", textDecoration: "underline", textUnderlineOffset: "2px", padding: 0 }}
            >
              Clear &amp; Regenerate
            </button>
          </div>

          {error && (
            <p style={{ color: "#f87171", fontSize: "0.82rem", marginBottom: "1rem" }}>{error}</p>
          )}

          {/* Section cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {SECTION_META.map(s => {
              const text = cached.sections[s.key];
              if (!text) return null;
              return (
                <div key={s.key} style={{ ...cardBase, padding: "1.4rem 1.6rem" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.65rem", marginBottom: "0.85rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "1.1rem", color: "var(--sc-gold)", opacity: 0.8, lineHeight: 1 }}>{s.glyph}</span>
                    <span style={{ ...goldHeading }}>{s.label}</span>
                    <span style={{ fontSize: "0.7rem", color: "rgba(246,241,232,0.28)", letterSpacing: "0.06em" }}>
                      {s.subtitle(cached.meta)}
                    </span>
                  </div>
                  <p style={{ color: "rgba(246,241,232,0.8)", fontSize: "0.92rem", lineHeight: 1.7, margin: 0 }}>
                    {text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* PDF report CTA */}
          <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(212,168,95,0.12)", textAlign: "center" }}>
            <button
              className="btn btn-secondary"
              onClick={handleDownloadPdfReport}
              disabled={downloadingPdf}
              style={{ fontSize: "0.85rem", border: "1px solid rgba(212,168,95,0.3)", color: "var(--sc-gold)", background: "rgba(10,30,20,0.6)" }}
            >
              {downloadingPdf ? "✦ Generating PDF…" : "✦ Download Full PDF Report"}
            </button>
            <p style={{ fontSize: "0.68rem", color: "rgba(246,241,232,0.25)", marginTop: "0.4rem" }}>
              Natal chart · Big Three · Aspects · Human Design — AI written
            </p>
          </div>
        </>
      )}
    </div>
  );
}
