import type { CSSProperties } from "react";
import { Link } from "wouter";

const FEATURES = [
  {
    glyph: "☽",
    title: "Today's Reading",
    desc: "Moon phase, personal day number, and a tailored do/don't signal — calculated fresh each morning from your birth data.",
    href: "/today",
    cta: "See Today",
    color: "var(--cosmic-cyan)",
  },
  {
    glyph: "◈",
    title: "Soul Codex",
    desc: "A deep 30-point synthesis naming your archetype, mapping your patterns, and giving you a codename that actually means something.",
    href: "/codex",
    cta: "Open Codex",
    color: "var(--cosmic-violet)",
  },
  {
    glyph: "⊕",
    title: "Compatibility",
    desc: "Synastry across identity, stress, values, and decision style. Works with a name and birthdate — no account needed.",
    href: "/compat",
    cta: "Check Compatibility",
    color: "var(--cosmic-pink)",
  },
  {
    glyph: "◉",
    title: "Soul Guide Chat",
    desc: "Ask anything about your profile, your current season, or what a specific pattern means for you right now.",
    href: "/guide",
    cta: "Open Guide",
    color: "var(--cosmic-gold)",
  },
];

const STEPS = [
  { num: "01", title: "Enter your birth data", desc: "Date is required. Time unlocks Rising, houses, and full aspects. Location enables transit calculations." },
  { num: "02", title: "Answer five questions", desc: "Stress response, decision style, non-negotiables, goals, and social energy. About three minutes." },
  { num: "03", title: "Systems integrate", desc: "Astrology, numerology, Human Design, and behavioral analysis are synthesized into one coherent reading." },
  { num: "04", title: "Get your reading", desc: "Named archetype, today's card, full soul codex, and daily guidance — all in one place." },
];

const SYSTEMS = [
  { category: "Astrology", glyph: "◎", items: ["Sun sign", "Moon sign", "Rising sign", "Natal houses", "Planetary aspects"] },
  { category: "Numerology", glyph: "⬡", items: ["Life Path number", "Personal Year cycle", "Expression number"] },
  { category: "Human Design", glyph: "◈", items: ["Type", "Authority", "Profile", "Defined centers"] },
  { category: "Elemental", glyph: "▲", items: ["Stress element", "Pressure response", "Recovery pattern"] },
  { category: "Behavioral", glyph: "◆", items: ["Decision style", "Social energy", "Non-negotiables", "Core goals"] },
  { category: "Synthesis", glyph: "✦", items: ["Soul archetype", "Core essence", "Moral compass", "Growth edges"] },
];

/* Shared divider glow between sections */
function GlowDivider({ color = "var(--cosmic-purple)" }: { color?: string }) {
  return (
    <div style={{
      height: 1,
      background: `linear-gradient(90deg, transparent 0%, ${color} 30%, ${color} 70%, transparent 100%)`,
      opacity: 0.25,
      margin: "0",
    }} />
  );
}

/* Floating orb — absolutely positioned ambient glow */
function Orb({ style }: { style: CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        borderRadius: "50%",
        filter: "blur(80px)",
        pointerEvents: "none",
        userSelect: "none",
        ...style,
      }}
    />
  );
}

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", overflowX: "hidden" }}>

      {/* ═══════════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════════ */}
      <section style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "7rem 1.5rem 5rem",
        textAlign: "center",
      }}>
        {/* Orbs — same treatment as app's body::before */}
        <Orb style={{ width: 600, height: 600, top: "-15%", left: "-10%", background: "radial-gradient(circle at 30% 30%, rgba(124,58,237,0.45) 0%, transparent 60%)", animation: "float 10s ease-in-out infinite" }} />
        <Orb style={{ width: 480, height: 480, bottom: "-10%", right: "-8%", background: "radial-gradient(circle at 70% 70%, rgba(236,72,153,0.3) 0%, transparent 60%)", animation: "float 13s ease-in-out infinite reverse" }} />
        <Orb style={{ width: 350, height: 350, top: "40%", right: "10%", background: "radial-gradient(circle at 50% 50%, rgba(34,211,238,0.12) 0%, transparent 60%)", animation: "float 8s ease-in-out infinite" }} />

        {/* Atmospheric logo glow */}
        <img
          src="/soul-codex-logo.svg"
          aria-hidden="true"
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700, height: 700, objectFit: "contain",
            opacity: 0.06, mixBlendMode: "screen",
            filter: "blur(38px)",
            pointerEvents: "none", userSelect: "none", zIndex: 0,
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 700 }}>

          {/* ── Hero logo centerpiece ─────────────────────────────────────── */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.75rem" }}>
            <img
              src="/soul-codex-logo.svg"
              alt="Soul Codex"
              style={{
                width: 88,
                height: 88,
                filter: "drop-shadow(0 0 22px rgba(212,168,95,0.5)) drop-shadow(0 0 8px rgba(212,168,95,0.25))",
              }}
            />
          </div>

          {/* Eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.3rem 1rem", borderRadius: 99,
            background: "rgba(212,168,95,0.08)",
            border: "1px solid rgba(212,168,95,0.25)",
            fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--sc-gold)", marginBottom: "1.5rem",
            boxShadow: "0 0 16px rgba(212,168,95,0.12)",
          }}>
            <span>✦</span>
            <span>Free to start · No account required</span>
          </div>

          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.8rem, 8vw, 5rem)",
            lineHeight: 1.1,
            marginBottom: "1.5rem",
            letterSpacing: "-0.02em",
            color: "var(--foreground)",
          }}>
            <span className="gradient-text">Unveil Your</span>
            <br />
            Soul Codex
          </h1>

          <p style={{
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            color: "var(--muted-foreground)",
            lineHeight: 1.7,
            marginBottom: "2.5rem",
            maxWidth: 580,
            margin: "0 auto 2.5rem",
          }}>
            One sharp reading built from astrology, numerology, Human Design, timing systems, and behavioral pattern analysis.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/start">
              <button className="btn btn-glow" style={{ fontSize: "1rem", padding: "0.85rem 2.25rem", borderRadius: "var(--radius-lg)" }}>
                Build My Profile
              </button>
            </Link>
            <a href="#how-it-works" style={{ textDecoration: "none" }}>
              <button className="btn btn-secondary" style={{ fontSize: "1rem", padding: "0.85rem 2.25rem", borderRadius: "var(--radius-lg)" }}>
                How It Works ▶
              </button>
            </a>
          </div>

          {/* Trust strip */}
          <div style={{
            display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap",
            marginTop: "3rem", opacity: 0.55,
          }}>
            {["Free to start", "Private", "~15 min"].map((t) => (
              <span key={t} style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <span style={{ color: "var(--cosmic-lavender)", fontSize: "0.55rem" }}>✦</span>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <GlowDivider />

      {/* ═══════════════════════════════════════════════════════════
          SAMPLE PROFILE CARD
          ═══════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", padding: "6rem 1.5rem", overflow: "hidden" }}>
        <Orb style={{ width: 400, height: 400, top: "0%", right: "-5%", background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 60%)" }} />

        <div style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cosmic-lavender)", marginBottom: "0.75rem", opacity: 0.7 }}>
            Example output
          </p>
          <h2 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 3.5vw, 2rem)", marginBottom: "2rem" }}>
            This is what you get
          </h2>

          <div className="glass-card-static" style={{
            borderTop: "2px solid var(--cosmic-purple)",
            padding: "2.25rem 2rem",
            textAlign: "left",
            boxShadow: "0 0 60px rgba(124,58,237,0.15), 0 4px 24px rgba(0,0,0,0.4)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "1.1rem", color: "var(--cosmic-lavender)", opacity: 0.6 }}>✦</span>
              <span style={{ fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>Soul Archetype</span>
            </div>

            <h3 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", marginBottom: "0.35rem", lineHeight: 1.15 }}>
              Iron Architect
            </h3>
            <p style={{ color: "var(--cosmic-lavender)", fontSize: "0.9rem", marginBottom: "1.75rem", fontStyle: "italic", lineHeight: 1.5 }}>
              I build what others imagine, and I do not stop until it stands.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.65rem" }}>
              {[
                { label: "Sun", val: "Scorpio" },
                { label: "Moon", val: "Capricorn" },
                { label: "Rising", val: "Virgo" },
                { label: "Life Path", val: "8" },
                { label: "HD Type", val: "Projector" },
                { label: "Authority", val: "Splenic" },
              ].map((row) => (
                <div key={row.label} style={{
                  padding: "0.6rem 0.75rem",
                  background: "rgba(139,92,246,0.07)",
                  border: "1px solid rgba(139,92,246,0.14)",
                  borderRadius: "calc(var(--radius) - 2px)",
                }}>
                  <div style={{ fontSize: "0.58rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.2rem" }}>{row.label}</div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--foreground)" }}>{row.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <GlowDivider color="var(--cosmic-pink)" />

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ position: "relative", padding: "6rem 1.5rem", overflow: "hidden" }}>
        <Orb style={{ width: 500, height: 500, bottom: "-10%", left: "-5%", background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 60%)" }} />

        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", marginBottom: "0.6rem" }}>
              How It Works
            </h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem" }}>Four steps. One coherent reading.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="glass-card-static"
                style={{ padding: "1.75rem", borderTop: "1px solid rgba(139,92,246,0.2)" }}
              >
                <div style={{
                  fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, rgba(124,58,237,0.5) 0%, rgba(139,92,246,0.15) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 1,
                  marginBottom: "0.85rem",
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--foreground)" }}>{step.title}</h3>
                <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GlowDivider />

      {/* ═══════════════════════════════════════════════════════════
          FEATURE HIGHLIGHTS
          ═══════════════════════════════════════════════════════════ */}
      <section id="features" style={{ position: "relative", padding: "6rem 1.5rem", overflow: "hidden" }}>
        <Orb style={{ width: 450, height: 450, top: "10%", right: "-5%", background: "radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 60%)" }} />

        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", marginBottom: "0.6rem" }}>
              Everything in One Place
            </h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem" }}>
              Your profile powers all of it. Build once, read daily.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="glass-card"
                style={{ padding: "1.75rem 1.5rem", display: "flex", flexDirection: "column", borderTop: `2px solid ${f.color}22` }}
              >
                <div style={{ fontSize: "1.75rem", color: f.color, marginBottom: "1rem", opacity: 0.85, filter: `drop-shadow(0 0 12px ${f.color}66)` }}>
                  {f.glyph}
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.6rem", color: "var(--foreground)" }}>{f.title}</h3>
                <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", lineHeight: 1.65, marginBottom: "1.5rem", flex: 1 }}>{f.desc}</p>
                <Link href={f.href} style={{ textDecoration: "none" }}>
                  <button className="btn btn-secondary" style={{ width: "100%", fontSize: "0.82rem" }}>{f.cta}</button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GlowDivider color="var(--cosmic-cyan)" />

      {/* ═══════════════════════════════════════════════════════════
          SYSTEMS
          ═══════════════════════════════════════════════════════════ */}
      <section id="systems" style={{ position: "relative", padding: "6rem 1.5rem", overflow: "hidden" }}>
        <Orb style={{ width: 400, height: 400, top: "-5%", left: "-5%", background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 60%)" }} />
        <Orb style={{ width: 300, height: 300, bottom: "0%", right: "5%", background: "radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 60%)" }} />

        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", marginBottom: "0.6rem" }}>
              What Goes Into Your Reading
            </h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem", maxWidth: 520, margin: "0 auto" }}>
              Not every system that exists — only the ones that add signal.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {SYSTEMS.map((sys) => (
              <div
                key={sys.category}
                className="glass-card-static"
                style={{ padding: "1.25rem", borderTop: "1px solid rgba(139,92,246,0.18)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "1rem", color: "var(--cosmic-lavender)", opacity: 0.7 }}>{sys.glyph}</span>
                  <span style={{ fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--cosmic-lavender)", fontWeight: 600 }}>
                    {sys.category}
                  </span>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {sys.items.map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                      <span style={{ color: "var(--cosmic-purple)", fontSize: "0.45rem", flexShrink: 0 }}>▪</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p style={{
            textAlign: "center", marginTop: "2.5rem",
            fontSize: "0.82rem", color: "var(--muted-foreground)", opacity: 0.55,
            fontStyle: "italic", letterSpacing: "0.01em",
          }}>
            Not 31 disconnected systems. One coherent reading built from the systems that actually add signal.
          </p>
        </div>
      </section>

      <GlowDivider color="var(--cosmic-violet)" />

      {/* ═══════════════════════════════════════════════════════════
          PRICING
          ═══════════════════════════════════════════════════════════ */}
      <section id="pricing" style={{ position: "relative", padding: "6rem 1.5rem", overflow: "hidden" }}>
        <Orb style={{ width: 500, height: 500, bottom: "-15%", right: "-10%", background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 60%)" }} />

        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", marginBottom: "0.6rem" }}>
              Start Free
            </h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem" }}>
              Your core reading is free. Unlock everything when you're ready.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "1.25rem" }}>
            {/* Free tier */}
            <div className="glass-card-static" style={{ padding: "2.25rem 2rem" }}>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>Free</div>
              <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1, marginBottom: "0.3rem" }}>$0</div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginBottom: "2rem" }}>No credit card needed</div>
              <ul style={{ margin: "0 0 2rem", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {[
                  "Astrology Big 3 (Sun, Moon, Rising)",
                  "Life Path number",
                  "Soul Archetype",
                  "Today's daily card",
                  "Quick Compatibility check",
                ].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.84rem", color: "var(--muted-foreground)" }}>
                    <span style={{ color: "var(--cosmic-lavender)", marginTop: "0.1em", flexShrink: 0 }}>◌</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/start" style={{ textDecoration: "none" }}>
                <button className="btn btn-secondary" style={{ width: "100%" }}>Build My Profile</button>
              </Link>
            </div>

            {/* Premium tier */}
            <div className="glass-card-static" style={{
              padding: "2.25rem 2rem",
              position: "relative",
              borderTop: "2px solid var(--cosmic-purple)",
              boxShadow: "0 0 40px rgba(124,58,237,0.2), 0 4px 24px rgba(0,0,0,0.4)",
            }}>
              <div style={{
                position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                background: "linear-gradient(135deg, var(--cosmic-purple) 0%, var(--cosmic-violet) 100%)",
                color: "#fff", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase",
                padding: "0.2rem 0.9rem", borderRadius: 99, fontWeight: 600,
                boxShadow: "0 0 16px rgba(124,58,237,0.5)",
              }}>
                Full Codex
              </div>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--cosmic-lavender)", marginBottom: "0.5rem" }}>Premium</div>
              <div style={{ lineHeight: 1, marginBottom: "0.3rem" }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--foreground)" }}>$6.99</span>
                <span style={{ fontSize: "0.9rem", color: "var(--muted-foreground)" }}>/mo</span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginBottom: "2rem" }}>or $49.99/year — save $34</div>
              <ul style={{ margin: "0 0 2rem", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {[
                  "Everything in Free",
                  "Full natal chart — houses & aspects",
                  "Complete Human Design profile",
                  "Full Soul Codex reading",
                  "Daily personalized guidance",
                  "Soul Guide chat",
                  "Compatibility deep-dives",
                  "Timeline & life current tracker",
                ].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.84rem", color: "var(--muted-foreground)" }}>
                    <span style={{ color: "#22c55e", marginTop: "0.1em", flexShrink: 0, filter: "drop-shadow(0 0 4px rgba(34,197,94,0.4))" }}>✦</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/start" style={{ textDecoration: "none" }}>
                <button className="btn btn-primary" style={{ width: "100%" }}>Start Free</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <GlowDivider />

      {/* ═══════════════════════════════════════════════════════════
          CLOSING CTA
          ═══════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "7rem 1.5rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <Orb style={{ width: 700, height: 700, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle at 50% 50%, rgba(124,58,237,0.18) 0%, transparent 55%)" }} />
        <img
          src="/soul-codex-logo.svg"
          aria-hidden="true"
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 620, height: 620, objectFit: "contain",
            opacity: 0.06, mixBlendMode: "screen",
            filter: "blur(36px)",
            pointerEvents: "none", userSelect: "none", zIndex: 0,
          }}
        />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 520, margin: "0 auto" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1.25rem", opacity: 0.35, filter: "drop-shadow(0 0 16px rgba(139,92,246,0.6))" }}>✦</div>
          <h2 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 5vw, 2.8rem)", marginBottom: "0.85rem", lineHeight: 1.15 }}>
            Ready to See Yours?
          </h2>
          <p style={{ color: "var(--muted-foreground)", fontSize: "1rem", marginBottom: "2.25rem", lineHeight: 1.7 }}>
            Free to start. No account needed.<br />Your reading is ready in about 15 minutes.
          </p>
          <Link href="/start">
            <button className="btn btn-glow" style={{ fontSize: "1rem", padding: "0.9rem 2.75rem", borderRadius: "var(--radius-lg)" }}>
              Build My Profile
            </button>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <GlowDivider />
      <footer style={{
        padding: "2rem 1.5rem",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        maxWidth: 900,
        margin: "0 auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "var(--cosmic-lavender)", fontSize: "1.1rem" }}>✦</span>
          <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "0.9rem" }}>Soul Codex</span>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8rem", color: "var(--muted-foreground)", flexWrap: "wrap" }}>
          <a href="#features" style={{ color: "inherit", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--cosmic-lavender)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}>Features</a>
          <a href="#systems" style={{ color: "inherit", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--cosmic-lavender)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}>Systems</a>
          <a href="#pricing" style={{ color: "inherit", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--cosmic-lavender)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}>Pricing</a>
          <Link href="/start" style={{ color: "inherit", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--cosmic-lavender)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}>Get Started</Link>
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", opacity: 0.4 }}>
          © 2026 Soul Codex
        </div>
      </footer>

    </div>
  );
}
