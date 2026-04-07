import { Link } from "wouter";

const FEATURES = [
  {
    glyph: "☽",
    title: "Today's Reading",
    desc: "Your daily card combines moon phase, personal day number, and a tailored signal — calculated fresh every morning from your birth data.",
    href: "/today",
    cta: "See Today",
  },
  {
    glyph: "◈",
    title: "Soul Codex",
    desc: "A deep 30-point synthesis that names your archetype, maps your patterns, and gives you a codename that actually means something.",
    href: "/codex",
    cta: "Open Codex",
  },
  {
    glyph: "⊕",
    title: "Compatibility",
    desc: "Professional synastry analysis across identity, stress, values, and decision style. Works with a name and birthdate — no account needed.",
    href: "/compat",
    cta: "Check Compatibility",
  },
  {
    glyph: "◉",
    title: "Soul Guide Chat",
    desc: "Ask your personal guide anything about your profile, your current season, or what a specific pattern means for you.",
    href: "/guide",
    cta: "Open Guide",
  },
];

const STEPS = [
  { num: "1", title: "Enter your birth data", desc: "Date is required. Time unlocks your Rising sign, houses, and full aspects. Location enables transit calculations." },
  { num: "2", title: "Answer five questions", desc: "Your stress response, decision style, non-negotiables, goals, and social energy. Takes about three minutes." },
  { num: "3", title: "Systems integrate", desc: "Astrology, numerology, Human Design, and behavioral pattern analysis are synthesized into a single coherent reading." },
  { num: "4", title: "Get your reading", desc: "Your named archetype, today's card, full soul codex, and ongoing daily guidance — all in one place." },
];

const SYSTEMS = [
  { category: "Astrology", items: ["Sun sign", "Moon sign", "Rising sign", "Natal houses", "Planetary aspects"] },
  { category: "Numerology", items: ["Life Path number", "Personal Year cycle", "Expression number"] },
  { category: "Human Design", items: ["Type", "Authority", "Profile", "Defined centers"] },
  { category: "Elemental", items: ["Stress element", "Pressure response", "Recovery pattern"] },
  { category: "Behavioral", items: ["Decision style", "Social energy", "Non-negotiables", "Core goals"] },
  { category: "Synthesis", items: ["Soul archetype", "Core essence", "Moral compass", "Growth edges"] },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        id="hero"
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "6rem 1.5rem 4rem",
          textAlign: "center",
        }}
      >
        {/* Atmospheric logo glow */}
        <img
          src="/logo.png"
          aria-hidden="true"
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700, height: 700, objectFit: "contain",
            opacity: 0.07, mixBlendMode: "screen",
            filter: "blur(40px)",
            pointerEvents: "none", userSelect: "none", zIndex: 0,
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 680 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.3rem 0.9rem", borderRadius: 99,
            background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
            fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase",
            color: "var(--cosmic-lavender)", marginBottom: "1.75rem",
          }}>
            <span style={{ opacity: 0.7 }}>✦</span>
            <span>Free to start · No account required</span>
          </div>

          <h1
            className="gradient-text"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.4rem, 7vw, 4rem)",
              lineHeight: 1.15,
              marginBottom: "1.25rem",
              letterSpacing: "-0.02em",
            }}
          >
            Unveil Your<br />Soul Codex
          </h1>

          <p style={{
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            color: "var(--muted-foreground)",
            lineHeight: 1.65,
            marginBottom: "2.25rem",
            maxWidth: 560,
            margin: "0 auto 2.25rem",
          }}>
            One sharp reading built from astrology, numerology, Human Design, timing systems, and behavioral pattern analysis.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/start">
              <button className="btn btn-primary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}>
                Build My Profile
              </button>
            </Link>
            <a href="#how-it-works" style={{ textDecoration: "none" }}>
              <button className="btn btn-secondary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}>
                How It Works
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────────────── */}
      <section style={{
        borderTop: "1px solid var(--glass-border)",
        borderBottom: "1px solid var(--glass-border)",
        background: "var(--glass-bg)",
        padding: "1.5rem 1.5rem",
      }}>
        <div style={{
          maxWidth: 700, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem", textAlign: "center",
        }}>
          {[
            { val: "Free", label: "to start" },
            { val: "~15 min", label: "to build your profile" },
            { val: "Private", label: "no data sold, ever" },
          ].map((s) => (
            <div key={s.val}>
              <div style={{ fontSize: "clamp(1.3rem, 3vw, 1.8rem)", fontWeight: 700, color: "var(--cosmic-lavender)", lineHeight: 1.1 }}>{s.val}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: "0.2rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SAMPLE PROFILE CARD ───────────────────────────────────────── */}
      <section style={{ padding: "5rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "0.75rem", opacity: 0.7 }}>
            Example output
          </p>
          <div style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderTop: "3px solid var(--cosmic-purple)",
            borderRadius: "var(--radius)",
            padding: "2rem 1.75rem",
            textAlign: "left",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
              <span style={{ fontSize: "1.3rem", opacity: 0.5 }}>✦</span>
              <span style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>Soul Archetype</span>
            </div>
            <h2 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "1.9rem", marginBottom: "0.35rem", lineHeight: 1.2 }}>
              Iron Architect
            </h2>
            <p style={{ color: "var(--cosmic-lavender)", fontSize: "0.9rem", marginBottom: "1.5rem", fontStyle: "italic" }}>
              I build what others imagine, and I do not stop until it stands.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[
                { label: "Sun Sign", val: "Scorpio" },
                { label: "Moon Sign", val: "Capricorn" },
                { label: "Rising", val: "Virgo" },
                { label: "Life Path", val: "8" },
                { label: "HD Type", val: "Projector" },
                { label: "Authority", val: "Splenic" },
              ].map((row) => (
                <div key={row.label} style={{
                  padding: "0.65rem 0.85rem",
                  background: "rgba(139,92,246,0.06)",
                  border: "1px solid rgba(139,92,246,0.12)",
                  borderRadius: "calc(var(--radius) - 4px)",
                }}>
                  <div style={{ fontSize: "0.62rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.2rem" }}>{row.label}</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--foreground)" }}>{row.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          padding: "5rem 1.5rem",
          background: "rgba(139,92,246,0.03)",
          borderTop: "1px solid var(--glass-border)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 4vw, 2.2rem)", marginBottom: "0.6rem" }}>
              How It Works
            </h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem" }}>Four steps. One coherent reading.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {STEPS.map((step) => (
              <div
                key={step.num}
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius)",
                  padding: "1.5rem",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(139,92,246,0.15)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.85rem", fontWeight: 700, color: "var(--cosmic-lavender)",
                  marginBottom: "1rem",
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--foreground)" }}>{step.title}</h3>
                <p style={{ fontSize: "0.83rem", color: "var(--muted-foreground)", lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE HIGHLIGHTS ────────────────────────────────────────── */}
      <section id="features" style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 4vw, 2.2rem)", marginBottom: "0.6rem" }}>
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
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius)",
                  padding: "1.75rem 1.5rem",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ fontSize: "1.6rem", color: "var(--cosmic-lavender)", marginBottom: "0.85rem", opacity: 0.8 }}>{f.glyph}</div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.6rem", color: "var(--foreground)" }}>{f.title}</h3>
                <p style={{ fontSize: "0.83rem", color: "var(--muted-foreground)", lineHeight: 1.65, marginBottom: "1.5rem", flex: 1 }}>{f.desc}</p>
                <Link href={f.href} style={{ textDecoration: "none" }}>
                  <button className="btn btn-secondary" style={{ width: "100%", fontSize: "0.82rem" }}>{f.cta}</button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SYSTEMS ───────────────────────────────────────────────────── */}
      <section
        id="systems"
        style={{
          padding: "5rem 1.5rem",
          background: "rgba(139,92,246,0.03)",
          borderTop: "1px solid var(--glass-border)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 4vw, 2.2rem)", marginBottom: "0.6rem" }}>
              What Goes Into Your Reading
            </h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem", maxWidth: 520, margin: "0 auto" }}>
              Not every system that exists — only the ones that add signal. Each category feeds into your synthesis.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            {SYSTEMS.map((sys) => (
              <div
                key={sys.category}
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius)",
                  padding: "1.25rem 1.25rem",
                }}
              >
                <div style={{
                  fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "var(--cosmic-lavender)", fontWeight: 600, marginBottom: "0.85rem",
                }}>
                  {sys.category}
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                  {sys.items.map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                      <span style={{ color: "var(--cosmic-purple)", fontSize: "0.5rem", flexShrink: 0 }}>▪</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p style={{
            textAlign: "center", marginTop: "2rem",
            fontSize: "0.8rem", color: "var(--muted-foreground)", opacity: 0.65,
            fontStyle: "italic",
          }}>
            Not 31 disconnected systems. One coherent reading built from the systems that actually add signal.
          </p>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 4vw, 2.2rem)", marginBottom: "0.6rem" }}>
              Start Free
            </h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem" }}>
              Your core reading is free. Unlock daily guidance and the full codex when you're ready.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {/* Free tier */}
            <div style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius)",
              padding: "2rem 1.75rem",
            }}>
              <div style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>Free</div>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.25rem" }}>$0</div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "1.75rem" }}>No credit card</div>
              <ul style={{ margin: "0 0 2rem", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {[
                  "Astrology Big 3 (Sun, Moon, Rising)",
                  "Life Path number",
                  "Soul Archetype",
                  "Today's daily card",
                  "Quick Compatibility check",
                ].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
                    <span style={{ color: "var(--cosmic-lavender)", marginTop: "0.05em", flexShrink: 0 }}>◌</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/start" style={{ textDecoration: "none" }}>
                <button className="btn btn-secondary" style={{ width: "100%" }}>Build My Profile</button>
              </Link>
            </div>

            {/* Premium tier */}
            <div style={{
              background: "var(--glass-bg)",
              border: "1px solid rgba(139,92,246,0.4)",
              borderTop: "3px solid var(--cosmic-purple)",
              borderRadius: "var(--radius)",
              padding: "2rem 1.75rem",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                background: "var(--cosmic-purple)", color: "#fff",
                fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "0.2rem 0.75rem", borderRadius: 99, fontWeight: 600,
              }}>
                Full Codex
              </div>
              <div style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--cosmic-lavender)", marginBottom: "0.5rem" }}>Premium</div>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.25rem" }}>$6.99<span style={{ fontSize: "1rem", fontWeight: 400, color: "var(--muted-foreground)" }}>/mo</span></div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "1.75rem" }}>or $49.99/year</div>
              <ul style={{ margin: "0 0 2rem", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {[
                  "Everything in Free",
                  "Full natal chart with houses & aspects",
                  "Complete Human Design profile",
                  "Full Soul Codex reading",
                  "Daily personalized guidance",
                  "Soul Guide chat",
                  "Compatibility deep-dives",
                  "Timeline & life current tracker",
                ].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
                    <span style={{ color: "#22c55e", marginTop: "0.05em", flexShrink: 0 }}>✦</span>
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

      {/* ── CLOSING CTA ───────────────────────────────────────────────── */}
      <section style={{
        padding: "6rem 1.5rem",
        textAlign: "center",
        borderTop: "1px solid var(--glass-border)",
        position: "relative",
        overflow: "hidden",
      }}>
        <img
          src="/logo.png"
          aria-hidden="true"
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600, height: 600, objectFit: "contain",
            opacity: 0.06, mixBlendMode: "screen",
            filter: "blur(40px)",
            pointerEvents: "none", userSelect: "none", zIndex: 0,
          }}
        />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 500, margin: "0 auto" }}>
          <div style={{ fontSize: "2rem", opacity: 0.4, marginBottom: "1.25rem" }}>✦</div>
          <h2 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", marginBottom: "0.75rem", lineHeight: 1.2 }}>
            Ready to See Yours?
          </h2>
          <p style={{ color: "var(--muted-foreground)", fontSize: "1rem", marginBottom: "2rem", lineHeight: 1.65 }}>
            Free to start. No account needed. Your reading is ready in about 15 minutes.
          </p>
          <Link href="/start">
            <button className="btn btn-primary" style={{ fontSize: "1rem", padding: "0.85rem 2.5rem" }}>
              Build My Profile
            </button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid var(--glass-border)",
        padding: "2rem 1.5rem",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        maxWidth: 860,
        margin: "0 auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", fontSize: "0.85rem" }}>
          <span style={{ color: "var(--cosmic-lavender)" }}>✦</span>
          <span style={{ fontWeight: 600, color: "var(--foreground)" }}>Soul Codex</span>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8rem", color: "var(--muted-foreground)", flexWrap: "wrap" }}>
          <a href="#features" style={{ color: "inherit", textDecoration: "none" }}>Features</a>
          <a href="#systems" style={{ color: "inherit", textDecoration: "none" }}>Systems</a>
          <a href="#pricing" style={{ color: "inherit", textDecoration: "none" }}>Pricing</a>
          <Link href="/start" style={{ color: "inherit", textDecoration: "none" }}>Get Started</Link>
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", opacity: 0.5 }}>
          © 2026 Soul Codex
        </div>
      </footer>

    </div>
  );
}
