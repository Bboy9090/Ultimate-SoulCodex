import type { CSSProperties } from "react";
import { Link } from "wouter";

import {
  IconStar,
  IconProfile,
  IconGuide,
  IconTracker,
  IconCodex,
  IconCompat,
  IconBlueprint,
  IconMoon,
  IconSparkles,
  IconChevronRight,
  IconCircle,
  IconArrowRight,
  IconSquare,
  IconLogo,
} from "../components/Icons";

const GOLD = "rgba(212,168,95";
const AMBER = "rgba(185,110,55";
const BROWN = "rgba(130,65,35";

const FEATURES = [
  {
    glyph: IconMoon,
    title: "Today's Reading",
    desc: "A daily signal based on your profile, the current sky, and your personal timing.",
    href: "/today",
    cta: "See Today",
  },
  {
    glyph: IconCodex,
    title: "Soul Codex",
    desc: "Your main reading: identity, patterns, strengths, pressure points, and growth direction.",
    href: "/codex",
    cta: "Open Codex",
  },
  {
    glyph: IconCompat,
    title: "Compatibility",
    desc: "See where two people naturally match, where they clash, and what needs care.",
    href: "/compat",
    cta: "Check Compatibility",
  },
  {
    glyph: IconProfile,
    title: "Soul Guide Chat",
    desc: "Ask plain questions about your reading and get answers that stay tied to your profile.",
    href: "/guide",
    cta: "Open Guide",
  },
];

const STEPS = [
  { num: "01", title: "Enter your birth data", desc: "Your date starts the reading. Time and location make it more exact." },
  { num: "02", title: "Answer a few pattern questions", desc: "How you handle stress, choices, goals, values, and people." },
  { num: "03", title: "The systems are blended", desc: "Astrology, numerology, Human Design, timing, and behavior become one reading." },
  { num: "04", title: "Read what fits", desc: "You get your archetype, core patterns, daily guidance, and next growth moves." },
];

const SYSTEMS = [
  { category: "Astrology", glyph: IconMoon, items: ["Sun sign", "Moon sign", "Rising sign", "Houses", "Planet aspects"] },
  { category: "Numerology", glyph: IconTracker, items: ["Life Path", "Personal Year", "Name numbers"] },
  { category: "Human Design", glyph: IconCodex, items: ["Type", "Authority", "Profile", "Centers"] },
  { category: "Timing", glyph: IconGuide, items: ["Daily signal", "Current season", "Growth cycles"] },
  { category: "Behavior", glyph: IconBlueprint, items: ["Decision style", "Stress pattern", "Social energy", "Core goals"] },
  { category: "Synthesis", glyph: IconStar, items: ["Soul archetype", "Core pattern", "Shadow edge", "Next move"] },
];

function GlowDivider() {
  return (
    <div
      style={{
        height: 1,
        background: `linear-gradient(90deg, transparent 0%, ${GOLD},0.26) 30%, ${GOLD},0.26) 70%, transparent 100%)`,
        margin: 0,
      }}
    />
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
  background: "rgba(18,8,30,0.48)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(212,168,95,0.18)",
  borderRadius: 12,
};

const heroButtonStyle: CSSProperties = {
  fontSize: "1.02rem",
  padding: "0.92rem 2.35rem",
  minWidth: 220,
  borderRadius: 18,
};

export default function LandingPage() {
  return (
    <div className="landing-nebula" style={{ minHeight: "100vh", overflowX: "hidden", position: "relative" }}>
      <header className="sc-marketing-header" style={{ background: "rgba(16,7,24,0.82)", borderBottomColor: "rgba(212,168,95,0.16)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.65rem", textDecoration: "none" }}>
          <IconLogo size={36} style={{ filter: "drop-shadow(0 0 16px rgba(212,168,95,0.72))" }} />
          <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", lineHeight: 1, color: "#e6b995" }}>
            Soul<br />Codex
          </span>
        </Link>

        <nav className="sc-marketing-nav">
          {[
            { label: "Systems", href: "#systems" },
            { label: "Pricing", href: "#pricing" },
          ].map((link) => (
            <a key={link.href} href={link.href} className="sc-marketing-link" style={{ color: "#d9ad8e", fontFamily: "var(--font-serif)", fontSize: "1.05rem" }}>
              {link.label}
            </a>
          ))}
          <Link href="/start">
            <button className="btn btn-primary sc-marketing-cta" style={{ color: "#2b1532", background: "linear-gradient(135deg, #cba6ff 0%, #f1b58d 100%)" }}>
              Get Started
            </button>
          </Link>
        </nav>
      </header>

      <section
        className="sc-landing-hero"
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: "calc(100vh - 72px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "7rem 1.4rem 4.5rem",
          textAlign: "center",
          background:
            "linear-gradient(rgba(12,5,22,0.08), rgba(12,5,22,0.28)), radial-gradient(ellipse at 50% 30%, rgba(230,151,86,0.34) 0%, transparent 34%), radial-gradient(ellipse at 18% 72%, rgba(113,76,184,0.36) 0%, transparent 42%), radial-gradient(ellipse at 84% 78%, rgba(96,45,126,0.34) 0%, transparent 42%)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(230,185,149,0.13) 1px, transparent 1px), linear-gradient(to bottom, rgba(230,185,149,0.13) 1px, transparent 1px), linear-gradient(32deg, transparent 49.7%, rgba(230,185,149,0.18) 50%, transparent 50.3%), linear-gradient(148deg, transparent 49.7%, rgba(230,185,149,0.14) 50%, transparent 50.3%)",
            backgroundSize: "120px 120px, 120px 120px, 280px 280px, 280px 280px",
            opacity: 0.78,
            pointerEvents: "none",
          }}
        />
        <Orb style={{ width: 620, height: 620, top: "-10%", left: "-12%", background: `radial-gradient(circle at 30% 30%, ${AMBER},0.24) 0%, transparent 62%)` }} />
        <Orb style={{ width: 520, height: 520, bottom: "-12%", right: "-10%", background: `radial-gradient(circle at 70% 70%, ${BROWN},0.26) 0%, transparent 60%)` }} />

        <div className="sc-hero-panel animate-fadeInScale" style={{ position: "relative", zIndex: 1, maxWidth: 760, background: "rgba(12,5,22,0.18)", borderColor: "rgba(230,185,149,0.1)" }}>
          <div className="sc-hero-logo-wrap animate-floatUp" style={{ display: "flex", justifyContent: "center", marginBottom: "1.65rem" }}>
            <IconLogo
              size={134}
              style={{ filter: "drop-shadow(0 0 34px rgba(230,185,149,0.72)) drop-shadow(0 0 84px rgba(163,88,214,0.35))" }}
            />
          </div>

          <div
            className="sc-kicker"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.55rem",
              padding: "0.42rem 1.35rem",
              borderRadius: 99,
              background: "rgba(110,68,94,0.55)",
              border: "1px solid rgba(230,185,149,0.45)",
              fontSize: "0.76rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#f0bfd0",
              marginBottom: "1.45rem",
            }}
          >
            <IconSparkles size={14} />
            <span>Free to start · No account required</span>
          </div>

          <h1
            className="sc-hero-title"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(3.3rem, 9vw, 5.7rem)",
              lineHeight: 0.98,
              marginBottom: "1.5rem",
              color: "#e6b995",
              letterSpacing: 0,
            }}
          >
            Unveil Your<br />Soul Codex
          </h1>

          <p
            className="sc-hero-copy"
            style={{
              fontSize: "clamp(1.08rem, 2.7vw, 1.35rem)",
              color: "rgba(246,226,231,0.82)",
              lineHeight: 1.72,
              maxWidth: 620,
              margin: "0 auto 2.4rem",
            }}
          >
            One sharp reading built from astrology, numerology, Human Design, timing, and behavioral patterns.
          </p>

          <div className="sc-hero-actions" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/start">
              <button className="btn btn-primary" style={{ ...heroButtonStyle, background: "linear-gradient(135deg, #e7c3d6 0%, #d6a789 100%)", color: "#32143f", boxShadow: "0 12px 36px rgba(230,185,149,0.28)" }}>
                Build My Profile
              </button>
            </Link>
            <a href="#how-it-works" style={{ textDecoration: "none" }}>
              <button className="btn btn-secondary" style={{ ...heroButtonStyle, display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(30,10,23,0.58)", color: "#d9ad8e", borderColor: "rgba(217,173,142,0.38)" }}>
                How It Works <IconChevronRight size={17} />
              </button>
            </a>
          </div>

          <div className="sc-trust-strip" style={{ display: "flex", gap: "1.8rem", justifyContent: "center", flexWrap: "wrap", marginTop: "3rem", opacity: 0.72 }}>
            {["Free to start", "Private", "~15 min"].map((text) => (
              <span className="sc-trust-pill" key={text} style={{ fontSize: "0.86rem", color: "rgba(246,226,231,0.72)", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <IconStar size={10} style={{ color: "#e6b995", opacity: 0.85 }} />{text}
              </span>
            ))}
          </div>
        </div>
      </section>

      <GlowDivider />

      <section style={{ position: "relative", padding: "6rem 1.5rem", overflow: "hidden" }}>
        <Orb style={{ width: 400, height: 400, top: 0, right: "-5%", background: `radial-gradient(circle, ${AMBER},0.14) 0%, transparent 60%)` }} />
        <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <div className="section-label" style={{ marginBottom: "0.8rem", color: "rgba(246,241,232,0.42)" }}>Preview</div>
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#e6b995", marginBottom: "0.75rem", opacity: 0.75 }}>
            Example output
          </p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 3.5vw, 2.15rem)", marginBottom: "2rem", color: "#e6b995" }}>
            What the reading gives you
          </h2>

          <div className="sc-polish-card" style={{ ...cardStyle, borderTop: "2px solid rgba(230,185,149,0.42)", padding: "2.25rem 2rem", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
              <IconSparkles size={14} style={{ color: "#e6b995", opacity: 0.7 }} />
              <span style={{ fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(246,241,232,0.48)" }}>Soul Archetype</span>
            </div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", marginBottom: "0.35rem", lineHeight: 1.15, color: "#e6b995" }}>
              Iron Architect
            </h3>
            <p style={{ color: "rgba(246,241,232,0.68)", fontSize: "0.94rem", marginBottom: "1.75rem", lineHeight: 1.55 }}>
              You turn pressure into structure, and you work best when the mission is clear.
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
                <div key={row.label} style={{ padding: "0.6rem 0.75rem", background: "rgba(230,185,149,0.07)", border: "1px solid rgba(230,185,149,0.16)", borderRadius: 8 }}>
                  <div style={{ fontSize: "0.58rem", color: "rgba(246,241,232,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.2rem" }}>{row.label}</div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--sc-ivory)" }}>{row.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <GlowDivider />

      <section id="how-it-works" style={{ position: "relative", padding: "6rem 1.5rem", overflow: "hidden" }}>
        <Orb style={{ width: 500, height: 500, bottom: "-10%", left: "-5%", background: `radial-gradient(circle, ${BROWN},0.18) 0%, transparent 60%)` }} />
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-label" style={{ marginBottom: "0.8rem", color: "rgba(246,241,232,0.42)" }}>Flow</div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.7rem, 4vw, 2.5rem)", marginBottom: "0.6rem", color: "#e6b995" }}>
              How It Works
            </h2>
            <p style={{ color: "rgba(246,241,232,0.58)", fontSize: "0.98rem" }}>Four steps. One clear reading.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {STEPS.map((step) => (
              <div className="sc-polish-card" key={step.num} style={{ ...cardStyle, padding: "1.75rem", borderTop: "1px solid rgba(230,185,149,0.22)" }}>
                <div style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 700, color: "rgba(230,185,149,0.42)", lineHeight: 1, marginBottom: "0.85rem", fontFamily: "var(--font-serif)" }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: "0.98rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--sc-ivory)" }}>{step.title}</h3>
                <p style={{ fontSize: "0.86rem", color: "rgba(246,241,232,0.58)", lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GlowDivider />

      <section id="features" style={{ position: "relative", padding: "6rem 1.5rem", overflow: "hidden" }}>
        <Orb style={{ width: 450, height: 450, top: "10%", right: "-5%", background: `radial-gradient(circle, ${GOLD},0.09) 0%, transparent 60%)` }} />
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-label" style={{ marginBottom: "0.8rem", color: "rgba(246,241,232,0.42)" }}>Daily Use</div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.7rem, 4vw, 2.5rem)", marginBottom: "0.6rem", color: "#e6b995" }}>
              Everything in One Place
            </h2>
            <p style={{ color: "rgba(246,241,232,0.58)", fontSize: "0.98rem" }}>
              Build your profile once. Use it whenever you need clarity.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            {FEATURES.map((feature) => (
              <div className="sc-polish-card" key={feature.title} style={{ ...cardStyle, padding: "1.75rem 1.5rem", display: "flex", flexDirection: "column", borderTop: "2px solid rgba(230,185,149,0.22)" }}>
                <div style={{ fontSize: "1.75rem", color: "#e6b995", marginBottom: "1rem", opacity: 0.9, display: "flex", alignItems: "center" }}>
                  <feature.glyph size={28} />
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.6rem", color: "var(--sc-ivory)" }}>{feature.title}</h3>
                <p style={{ fontSize: "0.86rem", color: "rgba(246,241,232,0.58)", lineHeight: 1.65, marginBottom: "1.5rem", flex: 1 }}>{feature.desc}</p>
                <Link href={feature.href} style={{ textDecoration: "none" }}>
                  <button className="btn btn-secondary" style={{ width: "100%", fontSize: "0.84rem" }}>{feature.cta}</button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GlowDivider />

      <section id="systems" style={{ position: "relative", padding: "6rem 1.5rem", overflow: "hidden" }}>
        <Orb style={{ width: 400, height: 400, top: "-5%", left: "-5%", background: `radial-gradient(circle, ${AMBER},0.16) 0%, transparent 60%)` }} />
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-label" style={{ marginBottom: "0.8rem", color: "rgba(246,241,232,0.42)" }}>Built From</div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.7rem, 4vw, 2.5rem)", marginBottom: "0.6rem", color: "#e6b995" }}>
              What Goes Into Your Reading
            </h2>
            <p style={{ color: "rgba(246,241,232,0.58)", fontSize: "0.98rem", maxWidth: 520, margin: "0 auto" }}>
              Only the systems that add useful signal.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {SYSTEMS.map((system) => (
              <div className="sc-polish-card" key={system.category} style={{ ...cardStyle, padding: "1.25rem", borderTop: "1px solid rgba(230,185,149,0.18)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "1rem", color: "#e6b995", opacity: 0.8, display: "flex", alignItems: "center" }}>
                    <system.glyph size={16} />
                  </span>
                  <span style={{ fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#e6b995", fontWeight: 600, opacity: 0.85 }}>
                    {system.category}
                  </span>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {system.items.map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "rgba(246,241,232,0.58)" }}>
                      <IconSquare size={6} style={{ color: "#e6b995", flexShrink: 0, opacity: 0.75 }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: "2.5rem", fontSize: "0.86rem", color: "rgba(246,241,232,0.36)", fontStyle: "italic" }}>
            Not a pile of disconnected meanings. One clear reading.
          </p>
        </div>
      </section>

      <GlowDivider />

      <section id="pricing" style={{ position: "relative", padding: "6rem 1.5rem", overflow: "hidden" }}>
        <Orb style={{ width: 500, height: 500, bottom: "-15%", right: "-10%", background: `radial-gradient(circle, ${AMBER},0.18) 0%, transparent 60%)` }} />
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-label" style={{ marginBottom: "0.8rem", color: "rgba(246,241,232,0.42)" }}>Membership</div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.7rem, 4vw, 2.5rem)", marginBottom: "0.6rem", color: "#e6b995" }}>
              Start Free
            </h2>
            <p style={{ color: "rgba(246,241,232,0.58)", fontSize: "0.98rem" }}>
              Your core reading is free. Unlock the deeper tools when you are ready.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "1.25rem" }}>
            <div className="sc-polish-card" style={{ ...cardStyle, padding: "2.25rem 2rem" }}>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(246,241,232,0.45)", marginBottom: "0.5rem" }}>Free</div>
              <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--sc-ivory)", lineHeight: 1, marginBottom: "0.3rem" }}>$0</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(246,241,232,0.45)", marginBottom: "2rem" }}>No credit card needed</div>
              <ul style={{ margin: "0 0 2rem", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {[
                  "Sun, Moon, and Rising",
                  "Life Path number",
                  "Soul Archetype",
                  "Today's card",
                  "Quick Compatibility check",
                ].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.86rem", color: "rgba(246,241,232,0.62)" }}>
                    <IconCircle size={10} style={{ color: "#e6b995", marginTop: "0.3em", flexShrink: 0, opacity: 0.75 }} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/start" style={{ textDecoration: "none" }}>
                <button className="btn btn-secondary" style={{ width: "100%" }}>Build My Profile</button>
              </Link>
            </div>

            <div className="sc-polish-card sc-premium-card" style={{ ...cardStyle, padding: "2.25rem 2rem", position: "relative", borderTop: "2px solid rgba(230,185,149,0.55)", boxShadow: "0 0 40px rgba(230,185,149,0.12), 0 4px 24px rgba(0,0,0,0.4)" }}>
              <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, rgba(230,185,149,0.95) 0%, rgba(185,130,65,0.95) 100%)", color: "#1A0E07", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.2rem 0.9rem", borderRadius: 99, fontWeight: 700 }}>
                Full Codex
              </div>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#e6b995", marginBottom: "0.5rem" }}>Premium</div>
              <div style={{ lineHeight: 1, marginBottom: "0.3rem" }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--sc-ivory)" }}>$6.99</span>
                <span style={{ fontSize: "0.9rem", color: "rgba(246,241,232,0.45)" }}>/mo</span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "rgba(246,241,232,0.45)", marginBottom: "2rem" }}>or $49.99/year</div>
              <ul style={{ margin: "0 0 2rem", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {[
                  "Everything in Free",
                  "Full chart with houses and aspects",
                  "Complete Human Design profile",
                  "Full Soul Codex reading",
                  "Daily personalized guidance",
                  "Soul Guide chat",
                  "Compatibility deep-dives",
                  "Timeline and life current tracker",
                ].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.86rem", color: "rgba(246,241,232,0.72)" }}>
                    <IconSparkles size={12} style={{ color: "#e6b995", marginTop: "0.2em", flexShrink: 0 }} />
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

      <section style={{ padding: "7rem 1.5rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <Orb style={{ width: 700, height: 700, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: `radial-gradient(circle at 50% 50%, ${AMBER},0.16) 0%, transparent 55%)` }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 620, height: 620, opacity: 0.055, mixBlendMode: "screen", filter: "blur(36px)", pointerEvents: "none", userSelect: "none", zIndex: 0 }}>
          <IconLogo size={620} />
        </div>
        <div className="sc-closing-panel" style={{ position: "relative", zIndex: 1, maxWidth: 540, margin: "0 auto" }}>
          <div className="section-label" style={{ marginBottom: "0.8rem", color: "rgba(246,241,232,0.42)" }}>Begin</div>
          <div style={{ fontSize: "2.5rem", marginBottom: "1.25rem", color: "#e6b995", opacity: 0.6 }}>
            <IconLogo size={52} style={{ margin: "0 auto" }} />
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.9rem, 5vw, 2.9rem)", marginBottom: "0.85rem", lineHeight: 1.15, color: "#e6b995" }}>
            Ready to See Yours?
          </h2>
          <p style={{ color: "rgba(246,241,232,0.62)", fontSize: "1rem", marginBottom: "2.25rem", lineHeight: 1.7 }}>
            Free to start. No account needed.<br />Your reading is ready in about 15 minutes.
          </p>
          <Link href="/start" style={{ textDecoration: "none" }}>
            <button className="btn btn-primary" style={{ fontSize: "1.05rem", padding: "0.9rem 2.5rem" }}>
              Build My Profile
            </button>
          </Link>
          <p style={{ marginTop: "1rem", fontSize: "0.72rem", color: "rgba(246,241,232,0.3)" }}>
            Already have a profile?{" "}
            <Link href="/today" style={{ color: "#e6b995", opacity: 0.78, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              Open your reading <IconArrowRight size={12} />
            </Link>
          </p>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid rgba(212,168,95,0.1)", padding: "1.5rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
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
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.72rem", color: "#e6b995", opacity: 0.56, textTransform: "uppercase", letterSpacing: "0.1em" }}
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
