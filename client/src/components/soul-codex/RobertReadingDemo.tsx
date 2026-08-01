/**
 * Robert Gonzalez Reading Demo
 *
 * Demonstrates the Soul Codex reading experience v1 with Robert as golden fixture.
 * Used for rendering screenshots in all three display modes.
 */

import { useState } from "react";
import ReadingElement from "./ReadingElement";
import LimitationsPanel from "./LimitationsPanel";
import type { ReadingElement as ReadingElementType, DisplayMode } from "@soulcodex/core";
import { createRobertProfile } from "@soulcodex/core/__tests__/fixtures/robert-gonzalez";

// Mock reading elements for Robert
const ROBERT_READING_ELEMENTS: Record<string, ReadingElementType> = {
  sunSign: {
    headline: "You see inefficiency before anyone else, and you move to fix it.",
    mechanism:
      "Virgo Sun creates a drive for precision and improvement. Your mind automatically scans for what's wrong, not because you're negative, but because systems interest you. When you spot a flaw, your impulse is to correct it—immediately.",
    protection:
      "You may be protecting against chaos and disorganization by making yourself the person who catches problems. There's safety in being competent and necessary.",
    howOthersSeeit:
      "People experience you as unusually capable and detail-oriented. They trust your eye for quality. They may not see that you're also carrying the burden of noticing what everyone else misses.",
    gift:
      "Your ability to see and solve problems quickly makes you invaluable in roles requiring systems thinking—engineering, operations, quality assurance. You prevent disasters others don't yet see coming.",
    cost:
      "Over time, constant analysis becomes exhausting. You can paralyzed by the gap between how things are and how they should be. Others may perceive you as picky or hard to please, when really you're just seeing what needs to improve.",
    action:
      "This week, notice one thing you're fixing that nobody asked you to fix. Ask: Would this break without my intervention? If yes, fix it. If no, let it sit and observe what happens.",
    evidence: [
      {
        source: "ephemeris",
        description: "Sun at 23.45° Virgo (natal chart position)",
        value: "23.45°",
        verified: true,
      },
      {
        source: "calculation",
        description: "Date of birth September 17, 1990 determines solar position",
        verified: true,
      },
    ],
    confidence: 98,
    verified: true,
    visibleIn: ["essential", "complete", "technical"],
  },

  moonSign: {
    headline: "You process emotions quietly, and you expect others to do the same.",
    mechanism:
      "Virgo Moon means you feel emotions, but your first instinct is to analyze them before you express them. You prefer to observe and understand before you act. Mess and chaos—emotional or otherwise—make you uncomfortable.",
    protection:
      "By keeping emotions analyzed and compartmentalized, you maintain control. Raw feeling without understanding feels dangerous. So you think your way to safety.",
    howOthersSeeit:
      "People often think you're calmer or less emotional than you actually are. They may not realize how much you're processing internally. Some may perceive you as cold when you're actually just careful.",
    gift:
      "Your ability to step back and observe gives you clarity others lose in the moment. You don't make emotional decisions you regret later. You can help others find the precise problem beneath their feelings.",
    cost:
      "You can intellectualize emotions so much that you lose touch with what you actually feel. You may hold hurt for years without addressing it directly. Others may feel like you don't truly understand them—not because you don't, but because you're not showing them.",
    action:
      "Next time someone shares a feeling with you, resist the urge to analyze it right away. Instead, ask: 'What do you need from me right now?' Listen to the answer instead of offering improvement.",
    evidence: [
      {
        source: "ephemeris",
        description: "Moon at 18.32° Virgo (verified from birth time 11:11 AM)",
        value: "18.32°",
        verified: true,
      },
    ],
    confidence: 95,
    verified: true,
    visibleIn: ["complete", "technical"],
  },

  risingSign: {
    headline: "You come across as intense and investigating, and that's not accidental.",
    mechanism:
      "Scorpio Rising is how the world first experiences you. You present as penetrating, observant, someone who doesn't accept surface answers. Your eyes go deep. People feel like you're reading them.",
    protection:
      "This intensity protects you. If you seem like someone who investigates thoroughly, people think twice before deceiving you. Depth and power are safer than openness and vulnerability.",
    howOthersSeeit:
      "People take you seriously. They don't mess with you casually. But they may also experience you as intimidating or keep you at a distance. Some may test you early to see if you're trustworthy before getting closer.",
    gift:
      "Your Scorpio presence commands respect. People trust you with their deep truths. You attract meaningful connections because you signal that you can handle complexity and darkness without flinching.",
    cost:
      "This intensity can isolate you. People may keep you at arm's length because you seem too powerful or too serious. You may feel lonely even in relationships because no one sees your softer side.",
    action:
      "Intentionally show someone one thing about yourself that's vulnerable—not a weakness, but a real part of you that's not about power or control. Watch what happens.",
    evidence: [
      {
        source: "ephemeris",
        description: "Ascendant at 6.18° Scorpio (calculated from exact birth time)",
        value: "6.18°",
        verified: true,
      },
    ],
    confidence: 97,
    verified: true,
    visibleIn: ["complete", "technical"],
  },

  lifePathNumber: {
    headline: "Your purpose is about completion—finishing what others start.",
    mechanism:
      "Life Path 9 is calculated from your birth date (9+1+7+1+9+9+0 = 36 → 3+6 = 9). You're wired for synthesis, seeing the big picture, and bringing things to their natural conclusion. You're the person who can see how all the threads connect.",
    protection:
      "By taking on bigger, universal concerns, you may avoid your own smaller, more personal needs. Serving the larger cause gives permission to ignore your own life.",
    howOthersSeeit:
      "People see you as someone with wisdom and perspective beyond your years. You seem to understand cycles and endings. Some may expect you to have all the answers.",
    gift:
      "You can see patterns across domains. You synthesize information naturally and offer perspective that helps others understand where things are heading. You're trusted with complexity.",
    cost:
      "You can exhaust yourself by taking on too many causes. You may finish others' work while your own remains incomplete. Over-identification with universal service can leave you personally empty.",
    action:
      "Identify one personal project that matters only to you, not to anyone else. Commit to finishing it this year. Notice what happens to your sense of purpose.",
    evidence: [
      {
        source: "calculation",
        description: "September 17, 1990 → 9+1+7+1+9+9+0 = 36 → 3+6 = 9",
        verified: true,
      },
    ],
    confidence: 100,
    verified: true,
    visibleIn: ["essential", "complete", "technical"],
  },
};

export default function RobertReadingDemo() {
  const [mode, setMode] = useState<DisplayMode>("complete");
  const profile = createRobertProfile();

  const elementsForMode = Object.values(ROBERT_READING_ELEMENTS).filter((el) =>
    el.visibleIn.includes(mode)
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)",
        color: "var(--sc-ivory)",
        fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI"',
        padding: "2rem",
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div
          style={{
            marginBottom: "2rem",
            paddingBottom: "2rem",
            borderBottom: "1px solid rgba(212,168,95,0.2)",
          }}
        >
          <h1
            style={{
              margin: "0 0 0.5rem 0",
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--sc-gold)",
            }}
          >
            Robert Gonzalez
          </h1>
          <p
            style={{
              margin: "0",
              fontSize: "1rem",
              color: "var(--sc-stone)",
            }}
          >
            The Shadow Systems Architect
          </p>
          <p
            style={{
              margin: "0.5rem 0 0 0",
              fontSize: "0.85rem",
              color: "var(--sc-stone)",
              opacity: 0.7,
            }}
          >
            Virgo Sun • Virgo Moon • Scorpio Rising • Life Path 9 • Reflector 2/5
          </p>
        </div>

        {/* Display Mode Toggle */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {(["essential", "complete", "technical"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                border: mode === m ? "2px solid var(--sc-gold)" : "1px solid rgba(212,168,95,0.3)",
                background: mode === m ? "rgba(212,168,95,0.15)" : "transparent",
                color: mode === m ? "var(--sc-gold)" : "var(--sc-stone)",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: mode === m ? 600 : 400,
                textTransform: "capitalize",
                transition: "all 0.2s ease",
              }}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {/* Reading Elements */}
        <div style={{ marginTop: "2rem" }}>
          {elementsForMode.map((element, i) => (
            <ReadingElement key={i} element={element} mode={mode} showEvidence={mode === "technical"} />
          ))}
        </div>

        {/* Limitations Panel */}
        <LimitationsPanel profile={profile} />
      </div>

      {/* CSS Variables */}
      <style>{`
        :root {
          --sc-gold: #D4A85F;
          --sc-ivory: #F5F5F0;
          --sc-stone: #9E9E9E;
        }
      `}</style>
    </div>
  );
}
