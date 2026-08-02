import { useState } from "react";
import type { DisplayMode } from "@soulcodex/core";

const facts = [
  { label: "Birth date", value: "September 17, 1990", state: "provided" },
  { label: "Birth time", value: "11:11 AM", state: "provided" },
  { label: "Birth place", value: "Bronx, New York", state: "provided" },
  { label: "Life Path", value: "9", state: "calculated" },
  { label: "Moon", value: "Pending independent verification", state: "pending" },
  { label: "Ascendant", value: "Unresolved", state: "pending" },
];

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        padding: "1.5rem 0",
        borderTop: "1px solid rgba(212,168,95,0.18)",
      }}
    >
      <p
        style={{
          margin: "0 0 0.45rem",
          color: "var(--sc-gold)",
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          margin: "0 0 0.8rem",
          color: "var(--sc-ivory)",
          fontSize: "clamp(1.2rem, 3vw, 1.55rem)",
          lineHeight: 1.25,
        }}
      >
        {title}
      </h2>
      <div style={{ color: "var(--sc-stone)", fontSize: "1rem", lineHeight: 1.72 }}>
        {children}
      </div>
    </section>
  );
}

function EvidencePanel() {
  return (
    <div
      style={{
        marginTop: "1.5rem",
        padding: "1.25rem",
        borderRadius: 14,
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(212,168,95,0.18)",
      }}
    >
      <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.1rem", color: "var(--sc-ivory)" }}>
        Why the app said this
      </h2>
      <p style={{ margin: "0 0 1rem", color: "var(--sc-stone)", lineHeight: 1.6 }}>
        This sample uses verified birth inputs and deterministic numerology. Time-sensitive astrology remains paused until the calculation layer supplies independent evidence.
      </p>
      <div style={{ display: "grid", gap: "0.65rem" }}>
        {facts.map((fact) => (
          <div
            key={fact.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
              padding: "0.7rem 0",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span style={{ color: "var(--sc-stone)" }}>{fact.label}</span>
            <span style={{ color: fact.state === "pending" ? "#f0b7d5" : "var(--sc-ivory)", textAlign: "right" }}>
              {fact.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RobertReadingDemo() {
  const [mode, setMode] = useState<DisplayMode>("essential");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #24162f 0%, #111014 46%, #09090b 100%)",
        color: "var(--sc-ivory)",
        padding: "clamp(1.25rem, 4vw, 3rem)",
      }}
    >
      <article style={{ width: "min(760px, 100%)", margin: "0 auto" }}>
        <header style={{ marginBottom: "1.5rem" }}>
          <p
            style={{
              margin: "0 0 0.6rem",
              color: "var(--sc-gold)",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Soul Codex · Clarity Reading
          </p>
          <h1
            style={{
              margin: "0 0 0.7rem",
              fontSize: "clamp(2rem, 7vw, 3.7rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
            }}
          >
            You do not need more information. You need to know what matters.
          </h1>
          <p style={{ margin: 0, color: "var(--sc-stone)", fontSize: "1.05rem", lineHeight: 1.65 }}>
            Robert, your strongest pattern is not simply perfectionism. It is the habit of becoming responsible for whatever you can see clearly enough to fix.
          </p>
        </header>

        <nav
          aria-label="Reading depth"
          style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap", marginBottom: "1rem" }}
        >
          {(["essential", "complete", "technical"] as DisplayMode[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              style={{
                border: item === mode ? "1px solid var(--sc-gold)" : "1px solid rgba(255,255,255,0.12)",
                background: item === mode ? "rgba(212,168,95,0.12)" : "rgba(255,255,255,0.02)",
                color: item === mode ? "var(--sc-gold)" : "var(--sc-stone)",
                borderRadius: 999,
                padding: "0.65rem 1rem",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {item}
            </button>
          ))}
        </nav>

        <Section eyebrow="The pattern" title="You notice what is missing, then quietly make it your responsibility.">
          <p style={{ margin: 0 }}>
            You are naturally drawn to broken systems, unfinished ideas, and people who need help finding a way forward. Once you understand the problem, walking away can feel almost irresponsible. That is why your projects grow, your roles expand, and other people begin depending on you before anyone formally asks.
          </p>
        </Section>

        <Section eyebrow="Why it happens" title="Competence became one of your safest ways to create order.">
          <p style={{ margin: 0 }}>
            Knowing what to do gives you steadiness. Solving the problem gives you control over uncertainty. The deeper pattern is not that you believe everyone else is incapable. It is that relying on yourself often feels more predictable than waiting to discover whether someone else will follow through.
          </p>
        </Section>

        <Section eyebrow="The gift" title="You can turn scattered pieces into a working system.">
          <p style={{ margin: 0 }}>
            You see connections across technology, storytelling, psychology, design, and lived experience. Where other people see separate ideas, you look for the structure that can hold them together. That is why you keep creating platforms rather than isolated products. You are not merely collecting features. You are trying to build a world that makes sense.
          </p>
        </Section>

        {mode !== "essential" && (
          <>
            <Section eyebrow="What people may miss" title="Being capable does not mean carrying everything feels easy.">
              <p style={{ margin: 0 }}>
                People may meet your vision before they meet your exhaustion. They can see the ideas, urgency, and determination while missing how much emotional weight sits underneath them. When you feel unappreciated, the pain is rarely only about recognition. It is also about wondering whether anyone understands what it costs you to keep showing up.
              </p>
            </Section>

            <Section eyebrow="The cost" title="Improvement can become a moving finish line.">
              <p style={{ margin: 0 }}>
                Every solved problem reveals another possible upgrade. That makes your work ambitious, but it can also erase the feeling of arrival. When nothing is allowed to be complete, progress stops feeling real. The danger is not that you will fail to build enough. It is that you will build so much that you never pause long enough to recognize what already exists.
              </p>
            </Section>
          </>
        )}

        <Section eyebrow="Clarity" title="Your next move is not expansion. It is selection.">
          <p style={{ margin: "0 0 0.8rem" }}>
            Choose one foundation that deserves your full protection. Finish it before volunteering for another mission. Let some problems remain visible without immediately making them yours.
          </p>
          <blockquote
            style={{
              margin: 0,
              padding: "1rem 1.1rem",
              borderLeft: "3px solid var(--sc-gold)",
              background: "rgba(212,168,95,0.07)",
              color: "var(--sc-ivory)",
              fontSize: "1.05rem",
              lineHeight: 1.55,
            }}
          >
            Before saying yes, ask: “Is this mine to carry, or am I only carrying it because I can?”
          </blockquote>
        </Section>

        {mode === "technical" && <EvidencePanel />}

        <footer
          style={{
            marginTop: "2rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            color: "var(--sc-stone)",
            lineHeight: 1.6,
            fontSize: "0.9rem",
          }}
        >
          This reading is a reflective interpretation, not a fixed biography. Keep what creates clarity. Question what does not. Your lived experience remains the final authority.
        </footer>
      </article>

      <style>{`
        :root {
          --sc-gold: #d4a85f;
          --sc-ivory: #f5f2ea;
          --sc-stone: #aaa2ad;
        }
        button:focus-visible {
          outline: 2px solid var(--sc-gold);
          outline-offset: 3px;
        }
      `}</style>
    </main>
  );
}
