import type { CSSProperties } from "react";
import { Link } from "wouter";

const GOLD   = "rgba(212,168,95";
const AMBER  = "rgba(185,110,55";
const BROWN  = "rgba(130,65,35";

import { 
  IconStar, IconProfile, IconGuide, IconTracker, 
  IconTimeline, IconCodex, IconCompat, IconBlueprint, 
  IconMoon, IconSparkles, IconChevronRight, IconCircle,
  IconArrowRight, IconSquare, IconLogo
} from "../components/Icons";

const FEATURES = [
  {
    glyph: IconMoon,
    title: "Today's Reading",
    desc: "Moon phase, personal day number, and a tailored signal — calculated fresh each morning from your birth data.",
    href: "/today",
    cta: "See Today",
  },
  {
    glyph: IconCodex,
    title: "Soul Codex",
    desc: "A deep synthesis naming your archetype, mapping your patterns, and giving you a codename that actually means something.",
    href: "/codex",
    cta: "Open Codex",
  },
  {
    glyph: IconCompat,
    title: "Compatibility",
    desc: "Synastry across identity, stress, values, and decision style. Works with a name and birthdate — no account needed.",
    href: "/compat",
    cta: "Check Compatibility",
  },
  {
    glyph: IconProfile,
    title: "Soul Guide Chat",
    desc: "Ask anything about your profile, your current season, or what a specific pattern means for you right now.",
    href: "/guide",
    cta: "Open Guide",
  },
];

const STEPS = [
  { num: "01", title: "Enter your birth data", desc: "Date is required. Time unlocks Rising, houses, and full aspects. Location enables transit calculations." },
  { num: "02", title: "Answer five questions", desc: "Stress response, decision style, non-negotiables, goals, and social energy. About three minutes." },
  { num: "03", title: "Systems integrate", desc: "Astrology, numerology, Human Design, and behavioral analysis are synthesized into one coherent reading." },
  { num: "04", title: "Get your reading", desc: "Named archetype, today's card, full soul codex, and daily guidance — all in one place." },
];

const SYSTEMS = [
  { category: "Astrology",   glyph: IconMoon, items: ["Sun sign", "Moon sign", "Rising sign", "Natal houses", "Planetary aspects"] },
  { category: "Numerology",  glyph: IconTracker, items: ["Life Path number", "Personal Year cycle", "Expression number"] },
  { category: "Human Design",glyph: IconCodex, items: ["Type", "Authority", "Profile", "Defined centers"] },
  { category: "Elemental",   glyph: IconGuide, items: ["Stress element", "Pressure response", "Recovery pattern"] },
  { category: "Behavioral",  glyph: IconBlueprint, items: ["Decision style", "Social energy", "Non-negotiables", "Core goals"] },
  { category: "Synthesis",   glyph: IconStar, items: ["Soul archetype", "Core essence", "Moral compass", "Growth edges"] },
];

function GlowDivider() {
  return (
    <div style={{
      height: 1,
      background: `linear-gradient(90deg, transparent 0%, ${GOLD},0.3) 30%, ${GOLD},0.3) 70%, transparent 100%)`,
      margin: 0,
    }} />
  );
}

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

const cardStyle: CSSProperties = {
  background: "rgba(18,8,30,0.45)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(212,168,95,0.18)",
  borderRadius: 12,
};

export default function LandingPage() {
  return (
    <div className="landing-nebula" style={{ minHeight: "100vh", overflowX: "hidden", position: "relative" }}>

      {/* ── Top nav ─────────────────────────────────────────────────────────── */}
      <header className="sc-marketing-header">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
          <IconLogo size={32} style={{ filter: "drop-shadow(0 0 10px rgba(212,168,95,0.6))" }} />
          <span style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", letterSpacing: "0.08em", color: "var(--sc-ivory)" }}>Soul Codex</span>
        </Link>
        <nav className="sc-marketing-nav">
          {[
            { label: "How It Works", href: "#how-it-works" },
            { label: "Systems",      href: "#systems" },
            { label: "Pricing",      href: "#pricing" },
          ].map((l) => (
            <a key={l.href} href={l.href} className="sc-marketing-link"
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--sc-ivory)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(246,241,232,0.55)")}
            >{l.label}</a>
          ))}
          <Link href="/start">
            <button className="btn btn-primary sc-marketing-cta">
              Get Started
            </button>
          </Link>
        </nav>
      </header>

      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section className="sc-landing-hero" style={{
        position: "relative", overflow: "hidden",
        minHeight: "88vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "7rem 1.5rem 5rem", textAlign: "center",
      }}>
        <Orb style={{ width: 600, height: 600, top: "-15%", left: "-10%", background: `radial-gradient(circle at 30% 30%, ${AMBER},0.38) 0%, transparent 60%)` }} />
        <Orb style={{ width: 480, height: 480, bottom: "-10%", right: "-8%", background: `radial-gradient(circle at 70% 70%, ${BROWN},0.28) 0%, transparent 60%)` }} />
        <Orb style={{ width: 350, height: 350, top: "40%", right: "10%", background: `radial-gradient(circle at 50% 50%, ${GOLD},0.10) 0%, transparent 60%)` }} />

        {/* Background logo glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 700, height: 700,
          opacity: 0.055, mixBlendMode: "screen",
          filter: "blur(38px)", pointerEvents: "none", userSelect: "none", zIndex: 0,
        }}>
          <IconLogo size={700} />
        </div>

        <div className="sc-hero-panel animate-fadeInScale" style={{ position: "relative", zIndex: 1, maxWidth: 700 }}>
          {/* Logo */}
          <div className="sc-hero-logo-wrap animate-floatUp" style={{ display: "flex", justifyContent: "center", marginBottom: "1.75rem" }}>
            <IconLogo
              size={120}
              style={{
                filter: "drop-shadow(0 0 30px rgba(212,168,95,0.6)) drop-shadow(0 0 70px rgba(200,130,60,0.28))",
              }}
            />
          </div>

          {/* Eyebrow badge */}
          <div className="sc-kicker" style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.3rem 1rem", borderRadius: 99,
            background: "rgba(212,168,95,0.08)", border: "1px solid rgba(212,168,95,0.25)",
            fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--sc-gold)", marginBottom: "1.5rem",
          }}>
            <IconLogo size={14} />
            <span>Free to start · No account required</span>
          </div>

          <h1 className="sc-hero-title" style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.8rem, 8vw, 5rem)",
            lineHeight: 1.1, marginBottom: "1.5rem",
            letterSpacing: "-0.01em", color: "var(--sc-ivory)",
          }}>
            <span style={{ color: "var(--sc-gold)" }}>Unveil Your</span>
            <br />Soul Codex
          </h1>

          <p className="sc-hero-copy" style={{
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            color: "rgba(246,241,232,0.62)",
            lineHeight: 1.75, marginBottom: "2.5rem",
            maxWidth: 560, margin: "0 auto 2.5rem",
          }}>
            One sharp reading built from astrology, numerology, Human Design, timing systems, and behavioral pattern analysis.
          </p>

          <div className="sc-hero-actions" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/start">
              <button className="btn btn-primary" style={{ fontSize: "1rem", padding: "0.85rem 2.25rem" }}>
                Build My Profile
              </button>
            </Link>
            <a href="#how-it-works" style={{ textDecoration: "none" }}>
              <button className="btn btn-secondary" style={{ fontSize: "1rem", padding: "0.85rem 2.25rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                How It Works <IconChevronRight size={16} />
              </button>
            </a>
          </div>

          {/* Trust strip */}
          <div className="sc-trust-strip" style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap", marginTop: "3rem", opacity: 0.5 }}>
            {["Free to start", "Private", "~15 min"].map((t) => (
              <span className="sc-trust-pill" key={t} style={{ fontSize: "0.78rem", color: "rgba(246,241,232,0.7)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <IconStar size={10} style={{ color: "var(--sc-gold)", opacity: 0.7 }} />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <GlowDivider />

      {/* ═══════════════════════════════════════════
          SAMPLE PROFILE CARD
      ═══════════════════════════════════════════ */}
      <section style={{ position: "relative", padding: "6rem 1.5rem", overflow: "hidden" }}>
        <Orb style={{ width: 400, height: 400, top: 0, right: "-5%", background: `radial-gradient(circle, ${AMBER},0.14) 0%, transparent 60%)` }} />
        <div style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
          <div className="section-label" style={{ marginBottom: "0.8rem", color: "rgba(246,241,232,0.42)" }}>Preview</div>
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--sc-gold)", marginBottom: "0.75rem", opacity: 0.7 }}>
            Example output
          </p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 3.5vw, 2rem)", marginBottom: "2rem", color: "var(--sc-gold)" }}>
            This is what you get
          </h2>

          <div className="sc-polish-card" style={{ ...cardStyle, borderTop: "2px solid rgba(212,168,95,0.4)", padding: "2.25rem 2rem", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
              <IconSparkles size={14} style={{ color: "var(--sc-gold)", opacity: 0.6 }} />
              <span style={{ fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(246,241,232,0.45)" }}>Soul Archetype</span>
            </div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", marginBottom: "0.35rem", lineHeight: 1.15, color: "var(--sc-gold)" }}>
              Iron Architect
            </h3>
            <p style={{ color: "rgba(246,241,232,0.65)", fontSize: "0.9rem", marginBottom: "1.75rem", fontStyle: "italic", lineHeight: 1.5 }}>
              I build what others imagine, and I do not stop until it stands.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.65rem" }}>
              {[
                { label: "Sun",       val: "Scorpio" },
                { label: "Moon",      val: "Capricorn" },
                { label: "Rising",    val: "Virgo" },
                { label: "Life Path", val: "8" },
                { label: "HD Type",   val: "Projector" },
                { label: "Authority", val: "Splenic" },
              ].map((row) => (
                <div key={row.label} style={{
                  padding: "0.6rem 0.75rem",
                  background: "rgba(212,168,95,0.07)",
                  border: "1px solid rgba(212,168,95,0.16)",
                  borderRadius: 8,
                }}>
                  <div style={{ fontSize: "0.58rem", color: "rgba(246,241,232,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.2rem" }}>{row.label}</div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--sc-ivory)" }}>{row.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <GlowDivider />

      {/* ═══════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════ */}
      <section id="how-it-works" style={{ position: "relative", padding: "6rem 1.5rem", overflow: "hidden" }}>
        <Orb style={{ width: 500, height: 500, bottom: "-10%", left: "-5%", background: `radial-gradient(circle, ${BROWN},0.18) 0%, transparent 60%)` }} />
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-label" style={{ marginBottom: "0.8rem", color: "rgba(246,241,232,0.42)" }}>Flow</div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", marginBottom: "0.6rem", color: "var(--sc-gold)" }}>
              How It Works
            </h2>
            <p style={{ color: "rgba(246,241,232,0.55)", fontSize: "0.95rem" }}>Four steps. One coherent reading.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {STEPS.map((step) => (
              <div className="sc-polish-card" key={step.num} style={{ ...cardStyle, padding: "1.75rem", borderTop: "1px solid rgba(212,168,95,0.2)" }}>
                <div style={{
                  fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 700,
                  color: "rgba(212,168,95,0.35)",
                  lineHeight: 1, marginBottom: "0.85rem",
                  fontFamily: "var(--font-serif)",
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--sc-ivory)" }}>{step.title}</h3>
                <p style={{ fontSize: "0.82rem", color: "rgba(246,241,232,0.55)", lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GlowDivider />

      {/* ═══════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════ */}
      <section id="features" style={{ position: "relative", padding: "6rem 1.5rem", overflow: "hidden" }}>
        <Orb style={{ width: 450, height: 450, top: "10%", right: "-5%", background: `radial-gradient(circle, ${GOLD},0.09) 0%, transparent 60%)` }} />
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-label" style={{ marginBottom: "0.8rem", color: "rgba(246,241,232,0.42)" }}>Daily Use</div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", marginBottom: "0.6rem", color: "var(--sc-gold)" }}>
              Everything in One Place
            </h2>
            <p style={{ color: "rgba(246,241,232,0.55)", fontSize: "0.95rem" }}>
              Your profile powers all of it. Build once, read daily.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            {FEATURES.map((f) => (
              <div className="sc-polish-card" key={f.title} style={{
                ...cardStyle, padding: "1.75rem 1.5rem",
                display: "flex", flexDirection: "column",
                borderTop: "2px solid rgba(212,168,95,0.22)",
              }}>
                <div style={{ fontSize: "1.75rem", color: "var(--sc-gold)", marginBottom: "1rem", opacity: 0.85, display: "flex", alignItems: "center" }}>
                  <f.glyph size={28} />
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.6rem", color: "var(--sc-ivory)" }}>{f.title}</h3>
                <p style={{ fontSize: "0.82rem", color: "rgba(246,241,232,0.55)", lineHeight: 1.65, marginBottom: "1.5rem", flex: 1 }}>{f.desc}</p>
                <Link href={f.href} style={{ textDecoration: "none" }}>
                  <button className="btn btn-secondary" style={{ width: "100%", fontSize: "0.82rem" }}>{f.cta}</button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GlowDivider />

      {/* ═══════════════════════════════════════════
          SYSTEMS
      ═══════════════════════════════════════════ */}
      <section id="systems" style={{ position: "relative", padding: "6rem 1.5rem", overflow: "hidden" }}>
        <Orb style={{ width: 400, height: 400, top: "-5%", left: "-5%", background: `radial-gradient(circle, ${AMBER},0.16) 0%, transparent 60%)` }} />
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-label" style={{ marginBottom: "0.8rem", color: "rgba(246,241,232,0.42)" }}>Built From</div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", marginBottom: "0.6rem", color: "var(--sc-gold)" }}>
              What Goes Into Your Reading
            </h2>
            <p style={{ color: "rgba(246,241,232,0.55)", fontSize: "0.95rem", maxWidth: 520, margin: "0 auto" }}>
              Not every system that exists — only the ones that add signal.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {SYSTEMS.map((sys) => (
              <div className="sc-polish-card" key={sys.category} style={{ ...cardStyle, padding: "1.25rem", borderTop: "1px solid rgba(212,168,95,0.18)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "1rem", color: "var(--sc-gold)", opacity: 0.7, display: "flex", alignItems: "center" }}>
                    <sys.glyph size={16} />
                  </span>
                  <span style={{ fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sc-gold)", fontWeight: 600, opacity: 0.8 }}>
                    {sys.category}
                  </span>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {sys.items.map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "rgba(246,241,232,0.55)" }}>
                      <IconSquare size={6} style={{ color: "var(--sc-gold)", flexShrink: 0, opacity: 0.7 }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: "2.5rem", fontSize: "0.82rem", color: "rgba(246,241,232,0.32)", fontStyle: "italic" }}>
            Not 31 disconnected systems. One coherent reading built from the systems that actually add signal.
          </p>
        </div>
      </section>

      <GlowDivider />

      {/* ═══════════════════════════════════════════
          PRICING
      ═══════════════════════════════════════════ */}
      <section id="pricing" style={{ position: "relative", padding: "6rem 1.5rem", overflow: "hidden" }}>
        <Orb style={{ width: 500, height: 500, bottom: "-15%", right: "-10%", background: `radial-gradient(circle, ${AMBER},0.18) 0%, transparent 60%)` }} />
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-label" style={{ marginBottom: "0.8rem", color: "rgba(246,241,232,0.42)" }}>Membership</div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", marginBottom: "0.6rem", color: "var(--sc-gold)" }}>
              Start Free
            </h2>
            <p style={{ color: "rgba(246,241,232,0.55)", fontSize: "0.95rem" }}>
              Your core reading is free. Unlock everything when you're ready.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "1.25rem" }}>
            {/* Free tier */}
            <div className="sc-polish-card" style={{ ...cardStyle, padding: "2.25rem 2rem" }}>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(246,241,232,0.45)", marginBottom: "0.5rem" }}>Free</div>
              <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--sc-ivory)", lineHeight: 1, marginBottom: "0.3rem" }}>$0</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(246,241,232,0.45)", marginBottom: "2rem" }}>No credit card needed</div>
              <ul style={{ margin: "0 0 2rem", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {[
                  "Astrology Big 3 (Sun, Moon, Rising)",
                  "Life Path number",
                  "Soul Archetype",
                  "Today's daily card",
                  "Quick Compatibility check",
                ].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.84rem", color: "rgba(246,241,232,0.6)" }}>
                    <IconCircle size={10} style={{ color: "var(--sc-gold)", marginTop: "0.3em", flexShrink: 0, opacity: 0.7 }} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/start" style={{ textDecoration: "none" }}>
                <button className="btn btn-secondary" style={{ width: "100%" }}>Build My Profile</button>
              </Link>
            </div>

            {/* Premium tier */}
            <div className="sc-polish-card sc-premium-card" style={{
              ...cardStyle, padding: "2.25rem 2rem",
              position: "relative",
              borderTop: "2px solid rgba(212,168,95,0.55)",
              boxShadow: "0 0 40px rgba(212,168,95,0.12), 0 4px 24px rgba(0,0,0,0.4)",
            }}>
              <div style={{
                position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                background: "linear-gradient(135deg, rgba(212,168,95,0.9) 0%, rgba(185,130,65,0.9) 100%)",
                color: "#1A0E07", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase",
                padding: "0.2rem 0.9rem", borderRadius: 99, fontWeight: 700,
              }}>
                Full Codex
              </div>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sc-gold)", marginBottom: "0.5rem" }}>Premium</div>
              <div style={{ lineHeight: 1, marginBottom: "0.3rem" }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--sc-ivory)" }}>$6.99</span>
                <span style={{ fontSize: "0.9rem", color: "rgba(246,241,232,0.45)" }}>/mo</span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "rgba(246,241,232,0.45)", marginBottom: "2rem" }}>or $49.99/year — save $34</div>
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
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.84rem", color: "rgba(246,241,232,0.7)" }}>
                    <IconSparkles size={12} style={{ color: "#a3e635", marginTop: "0.2em", flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/pricing" style={{ textDecoration: "none" }}>
                <button className="btn btn-primary" style={{ width: "100%" }}>Upgrade Now</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <GlowDivider />

      {/* ═══════════════════════════════════════════
          CLOSING CTA
      ═══════════════════════════════════════════ */}
      <section style={{ padding: "7rem 1.5rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <Orb style={{ width: 700, height: 700, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: `radial-gradient(circle at 50% 50%, ${AMBER},0.16) 0%, transparent 55%)` }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 620, height: 620,
          opacity: 0.055, mixBlendMode: "screen",
          filter: "blur(36px)", pointerEvents: "none", userSelect: "none", zIndex: 0,
        }}>
          <IconLogo size={620} />
        </div>
        <div className="sc-closing-panel" style={{ position: "relative", zIndex: 1, maxWidth: 520, margin: "0 auto" }}>
          <div className="section-label" style={{ marginBottom: "0.8rem", color: "rgba(246,241,232,0.42)" }}>Begin</div>
          <div style={{ fontSize: "2.5rem", marginBottom: "1.25rem", color: "var(--sc-gold)", opacity: 0.4 }}>
            <IconLogo size={48} style={{ margin: "0 auto" }} />
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 5vw, 2.8rem)", marginBottom: "0.85rem", lineHeight: 1.15, color: "var(--sc-gold)" }}>
            Ready to See Yours?
          </h2>
          <p style={{ color: "rgba(246,241,232,0.6)", fontSize: "1rem", marginBottom: "2.25rem", lineHeight: 1.7 }}>
            Free to start. No account needed.<br />Your reading is ready in about 15 minutes.
          </p>
          <Link href="/start" style={{ textDecoration: "none" }}>
            <button className="btn btn-primary" style={{ fontSize: "1.05rem", padding: "0.9rem 2.5rem" }}>
              Build My Profile
            </button>
          </Link>
          <p style={{ marginTop: "1rem", fontSize: "0.72rem", color: "rgba(246,241,232,0.3)" }}>
            Already have a profile?{" "}
            <Link href="/today" style={{ color: "var(--sc-gold)", opacity: 0.7, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>Open your reading <IconArrowRight size={12} /></Link>
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid rgba(212,168,95,0.1)",
        padding: "1.5rem 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <IconLogo size={20} style={{ opacity: 0.6 }} />
          <span style={{ fontSize: "0.78rem", color: "rgba(246,241,232,0.35)" }}>Soul Codex</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <button 
            onClick={() => {
              if (confirm("Reset your Soul Codex profile? This will clear all your data.")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.72rem", color: "var(--sc-gold)", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.1em" }}
          >
            Reset Profile
          </button>
          <p style={{ fontSize: "0.72rem", color: "rgba(246,241,232,0.28)", margin: 0 }}>
            For reflection, not clinical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
