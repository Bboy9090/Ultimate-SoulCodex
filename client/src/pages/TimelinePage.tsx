import { useState, useEffect } from "react";
import { useLocation } from "wouter";

import { 
  calcPersonalYear, 
  calcPersonalMonth, 
  getCycleTransitionState, 
  getNextYearNum, 
  getNextMonthNum 
} from "@soulcodex/core";

// ── Phase content ─────────────────────────────────────────────────────────────

interface YearData {
  label: string;
  glyph: string;
  color: string;
  essence: string;
  why: string[];
  leanInto: string[];
  release: string[];
  nextYearLabel: string;
  nextYearEssence: string;
}

const YEAR_DATA: Record<number, YearData> = {
  1: {
    label: "New Cycle", glyph: "◎", color: "#D4A85F",
    essence: "I'm planting seeds for a new 9-year chapter. This is the year to initiate, not refine.",
    why: [
      "I'm at the numerological start of a new 9-year cycle.",
      "What I begin now has a long runway — interrupting it too early costs momentum.",
      "My energy is naturally oriented toward self-direction and fresh starts.",
    ],
    leanInto: [
      "I start the thing I've been delaying.",
      "I make decisions from identity, not from habit.",
      "I build new patterns before the old ones re-solidify.",
    ],
    release: [
      "Expecting to refine something that hasn't started yet.",
      "Carrying commitments that belong to the previous cycle.",
      "Waiting for permission to begin.",
    ],
    nextYearLabel: "Partnership",
    nextYearEssence: "Year 2 invites patience, cooperation, and the long game. What I'm planting now finds its first allies.",
  },
  2: {
    label: "Partnership", glyph: "◌", color: "#22d3ee",
    essence: "I'm in a year of quiet cultivation. Relationships and timing are the leverage points, not solo force.",
    why: [
      "I'm in the middle of building what Year 1 initiated.",
      "The numerological field favors waiting, listening, and pairing.",
      "Forcing outcomes this year breaks what patience would preserve.",
    ],
    leanInto: [
      "I invest in the relationship that has the most long-term signal.",
      "I listen more than I speak in decisions that affect others.",
      "I'm reliable where I said I would show up.",
    ],
    release: [
      "Competing when the year is asking me to collaborate.",
      "Rushing what is still germinating.",
      "Treating stillness as stagnation.",
    ],
    nextYearLabel: "Creative Expression",
    nextYearEssence: "Year 3 expands outward — social energy, creative output, and visibility return. What I've built quietly finds its audience.",
  },
  3: {
    label: "Creative Expression", glyph: "✦", color: "#f472b6",
    essence: "I'm in a year of outward expansion. What I create and share now has unusual reach.",
    why: [
      "The cycle is at its most socially expansive numerological point.",
      "Year 3 amplifies output — writing, speaking, teaching, building in public.",
      "Creative risks taken now compound across the next 6 years.",
    ],
    leanInto: [
      "I publish the thing I've been sitting on.",
      "I expand my creative surface area — more channels, more outputs.",
      "I say yes to social energy and visibility.",
    ],
    release: [
      "Perfecting output instead of shipping it.",
      "Isolating when the energy is designed for connection.",
      "Waiting until it's 'ready' before sharing.",
    ],
    nextYearLabel: "Foundation Work",
    nextYearEssence: "Year 4 calls me back to structure and discipline. The visibility I build now will need roots to sustain it.",
  },
  4: {
    label: "Foundation", glyph: "◆", color: "#f59e0b",
    essence: "I'm in a year of laying groundwork. Speed is the enemy of durability right now.",
    why: [
      "Year 4 numerological energy demands structure, not momentum.",
      "What I build this year is meant to hold weight for years.",
      "Shortcuts now become structural weaknesses later.",
    ],
    leanInto: [
      "I do the slow, unsexy work that compounds.",
      "I build systems, not just outputs.",
      "I audit what is held together by habit versus actual design.",
    ],
    release: [
      "Chasing novelty when the work needs repetition.",
      "Skipping the foundation because the visible part is more exciting.",
      "Overcommitting to things that don't deepen what I'm building.",
    ],
    nextYearLabel: "Liberation",
    nextYearEssence: "Year 5 breaks open — change, freedom, and disruption arrive after this year of consolidation. The stronger my foundation now, the freer I can move then.",
  },
  5: {
    label: "Liberation", glyph: "⬡", color: "#22c55e",
    essence: "I'm in a year of change. What no longer fits must go — not later, now.",
    why: [
      "Year 5 is the midpoint of the 9-year cycle — transformation is the mechanism.",
      "This is the most restless and expansive point in the 9-year cycle. Resistance amplifies friction.",
      "Freedom this year comes from releasing what belonged to the previous phase.",
    ],
    leanInto: [
      "I make the change I've been deferring.",
      "I follow what is pulling me, not just what's familiar.",
      "I test assumptions I've been treating as fixed.",
    ],
    release: [
      "Holding onto structures built for a self I've outgrown.",
      "Mistaking discomfort for danger.",
      "Over-planning what needs to be felt through.",
    ],
    nextYearLabel: "Responsibility",
    nextYearEssence: "Year 6 calls me to tend what matters — relationships, health, and commitments. The freedom I claim now shapes what I'm accountable for then.",
  },
  6: {
    label: "Responsibility", glyph: "◉", color: "#D4A85F",
    essence: "I'm in a year of tending. Home, health, and commitments reward showing up.",
    why: [
      "Year 6 shifts focus toward service, home, and what I owe to people I care about.",
      "The field this year favors depth over breadth.",
      "What I tend carefully now reaches maturity in Year 7 and 8.",
    ],
    leanInto: [
      "I show up where I said I would.",
      "I invest in the relationships that have been waiting.",
      "I treat my health as a structural asset, not an afterthought.",
    ],
    release: [
      "Spreading myself thin across too many obligations.",
      "Neglecting home and body in service of external output.",
      "Waiting to feel it before honoring the commitment.",
    ],
    nextYearLabel: "Introspection",
    nextYearEssence: "Year 7 invites depth and solitude. The inner work I do now becomes the wisdom I act from in Year 8.",
  },
  7: {
    label: "Depth", glyph: "◈", color: "#22d3ee",
    essence: "I'm in a year of introspection. Solitude is productive, not avoidant.",
    why: [
      "Year 7 is the inner year — research, reflection, and refinement.",
      "The numerological energy turns inward and rewards stillness.",
      "What I understand about myself this year informs the material output of Year 8.",
    ],
    leanInto: [
      "I read, study, and deepen — not broadly, but precisely.",
      "I spend time alone without an agenda.",
      "I ask the questions I've been too busy to hold.",
    ],
    release: [
      "Confusing busyness with progress.",
      "Forcing social output when the field is calling me inward.",
      "Skipping interior work because it has no visible deliverable.",
    ],
    nextYearLabel: "Power & Harvest",
    nextYearEssence: "Year 8 is material and ambitious — it rewards everything I've built internally. The deeper I go now, the more I have to leverage then.",
  },
  8: {
    label: "Power", glyph: "◆", color: "#f59e0b",
    essence: "I'm in a year of harvest. What I've built is ready to be leveraged.",
    why: [
      "Year 8 is the apex of the 9-year cycle — material, ambitious, and results-oriented.",
      "The field amplifies effort and rewards precision.",
      "Authority, resources, and recognition are accessible this year.",
    ],
    leanInto: [
      "I ask for what I've earned.",
      "I think at the decade level, not the quarter.",
      "I make the high-stakes decision I've been building toward.",
    ],
    release: [
      "Underselling what I've built.",
      "Letting fear of visibility shrink my ask.",
      "Confusing modesty with strategy.",
    ],
    nextYearLabel: "Completion",
    nextYearEssence: "Year 9 closes the cycle — release, forgive, and let go. The lighter I move into it, the more fully I can receive Year 1.",
  },
  9: {
    label: "Completion", glyph: "☽", color: "#f472b6",
    essence: "I'm closing a 9-year chapter. What has served its purpose must be released now.",
    why: [
      "Year 9 numerological energy is about endings, integration, and letting go.",
      "This year is clearing space for what comes in Year 1.",
      "Holding onto the past this year delays the next chapter by exactly how long I hold on.",
    ],
    leanInto: [
      "I complete what I started. I close the loop.",
      "I forgive what I've been carrying from this cycle.",
      "I let the chapter end with intention, not avoidance.",
    ],
    release: [
      "Starting new projects that belong in Year 1.",
      "Clinging to identities that have finished their role.",
      "Forcing growth where the cycle is calling for release.",
    ],
    nextYearLabel: "New Cycle Begins",
    nextYearEssence: "Year 1 opens a completely new 9-year chapter. Everything I release now creates the space to receive it fully.",
  },
};

interface MonthData {
  label: string;
  glyph: string;
  color: string;
  note: string;
}

const MONTH_DATA: Record<number, MonthData> = {
  1: { label: "Initiation",   glyph: "◎", color: "#D4A85F", note: "Fresh start energy. I act on instinct, not analysis." },
  2: { label: "Patience",     glyph: "◌", color: "#22d3ee", note: "I wait, listen, and trust what is still germinating." },
  3: { label: "Expression",   glyph: "✦", color: "#f472b6", note: "I share, connect, and move creative work forward." },
  4: { label: "Discipline",   glyph: "◆", color: "#f59e0b", note: "I build methodically. I do the unsexy work." },
  5: { label: "Change",       glyph: "⬡", color: "#22c55e", note: "I disrupt what no longer fits. I move quickly." },
  6: { label: "Tending",      glyph: "◉", color: "#D4A85F", note: "I invest in relationships and responsibilities." },
  7: { label: "Depth",        glyph: "◈", color: "#22d3ee", note: "I go inward. I research, reflect, refine." },
  8: { label: "Leverage",     glyph: "◆", color: "#f59e0b", note: "I push the material goal. I make the ask." },
  9: { label: "Release",      glyph: "☽", color: "#f472b6", note: "I complete, forgive, and let go of what's done." },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function TimelinePage() {
  const [, navigate]  = useLocation();
  const [birthData, setBirthData] = useState<{ month: number; day: number } | null>(null);
  const [todayCard, setTodayCard] = useState<any>(null);
  const [profile, setProfile]     = useState<any>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("soulProfile");
    if (savedProfile) setProfile(JSON.parse(savedProfile));

    const savedToday = localStorage.getItem("soulTodayCard");
    if (savedToday) setTodayCard(JSON.parse(savedToday));

    const rawProfile = localStorage.getItem("soulProfile");
    if (rawProfile) {
      try {
        const p = JSON.parse(rawProfile);
        if (p.birthDate) {
          const parts = p.birthDate.split("-");
          setBirthData({ month: parseInt(parts[1], 10), day: parseInt(parts[2], 10) });
          return; // Birth date found in profile, we're good
        }
      } catch {}
    }

    const rawInputs = localStorage.getItem("onboardingData") || localStorage.getItem("soulUserInputs");
    if (rawInputs) {
      try {
        const inputs = JSON.parse(rawInputs);
        const bd: string = inputs.birthDate;
        if (bd) {
          const parts = bd.split("-");
          setBirthData({ month: parseInt(parts[1], 10), day: parseInt(parts[2], 10) });
        }
      } catch {}
    }
  }, []);

  const today        = new Date();
  const currentYear  = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const py = birthData ? calcPersonalYear(birthData.month, birthData.day, currentYear) : null;
  const pm = py        ? calcPersonalMonth(py, currentMonth) : null;

  const nextPm           = pm ? getNextMonthNum(pm) : null;
  const yearData         = py     ? YEAR_DATA[py]      : null;
  const monthData        = pm     ? MONTH_DATA[pm]     : null;
  const nextMonthDat     = nextPm ? MONTH_DATA[nextPm] : null;

  const transition       = getCycleTransitionState(currentMonth);
  const monthsRemaining  = transition.monthsRemaining;
  const yearTurnsUrgent  = transition.isUrgent;
  const yearTurnsNear    = transition.isNear;
  const nextYearNum      = py ? getNextYearNum(py) : null;

  // Phase guidance always comes from the year archetype — never day-level to-do lists
  const leanIntoItems: string[] = yearData?.leanInto ?? [];
  const releaseItems:  string[] = yearData?.release  ?? [];

  const dateLabel = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const noData = !birthData && !todayCard;

  if (noData) {
    return (
      <div style={{ padding: "3rem 1rem 5rem", maxWidth: 480, margin: "0 auto" }}>
        <div style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          borderTop: "3px solid var(--sc-gold)",
          borderRadius: "var(--radius)",
          padding: "2.25rem 2rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "1.6rem", marginBottom: "1rem", color: "var(--cosmic-lavender)", opacity: 0.75 }}>◎</div>
          <h3 style={{ marginBottom: "0.65rem", fontSize: "1.15rem", fontWeight: 600 }}>
            Your Timeline isn't active yet
          </h3>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.25rem" }}>
            The Timeline shows where you are in your personal numerology cycle — your current year archetype, the active month frequency, and what's opening next. It's calculated from your birth date and updates automatically each month.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.75rem", textAlign: "left" }}>
            {[
              { glyph: "◎", label: "Current Personal Year", desc: "The 9-year cycle archetype you're living through right now" },
              { glyph: "◉", label: "Active Personal Month", desc: "The specific frequency you're operating in this month" },
              { glyph: "◈", label: "What Opens Next", desc: "The transition approaching in your numerology arc" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.6rem 0.75rem", background: "rgba(212,168,95,0.05)", border: "1px solid rgba(212,168,95,0.14)", borderRadius: 8 }}>
                <span style={{ color: "var(--cosmic-lavender)", fontSize: "0.85rem", marginTop: "0.05rem", flexShrink: 0 }}>{item.glyph}</span>
                <span>
                  <span style={{ fontWeight: 600, fontSize: "0.8rem", display: "block" }}>{item.label}</span>
                  <span style={{ color: "var(--muted-foreground)", fontSize: "0.73rem" }}>{item.desc}</span>
                </span>
              </div>
            ))}
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => navigate("/start")}>
            Finish My Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="nebula-bg" style={{ minHeight: "100vh", padding: "2rem 1rem 5rem" }}>
      <div style={{ maxWidth: 780, margin: "0 auto", position: "relative", zIndex: 1 }}>

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <section style={{ textAlign: "center", marginBottom: "2.25rem" }}>
        <p style={{ fontSize: "0.68rem", letterSpacing: "0.14em", color: "var(--muted-foreground)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          {dateLabel}
        </p>
        <h1 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 5vw, 2.25rem)", marginBottom: "0.4rem" }}>
          Your Current Phase
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.88rem" }}>
          Where I am in the cycle — and what comes next.
        </p>
      </section>

      {/* ── Current Phase Card ───────────────────────────────────────────────── */}
      {yearData && py && (
        <div style={{
          background: "rgba(15,20,40,0.65)",
          border: `1px solid ${yearData.color}38`,
          borderLeft: `3px solid ${yearData.color}`,
          borderRadius: "16px",
          padding: "1.75rem",
          marginBottom: "1.25rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
            {/* Big year number */}
            <div style={{
              width: 58, height: 58, borderRadius: "50%", flexShrink: 0,
              background: `${yearData.color}18`, border: `1px solid ${yearData.color}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: "1.8rem", fontWeight: 700, color: yearData.color, lineHeight: 1 }}>{py}</span>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "0.2rem" }}>
                Personal Year {py}
              </div>
              <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)" }}>
                {yearData.label}
              </h2>
            </div>

            {/* Current month chip */}
            {monthData && (
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "0.2rem" }}>
                  This Month
                </div>
                <span style={{
                  display: "inline-block", padding: "0.22rem 0.7rem",
                  background: `${monthData.color}18`, border: `1px solid ${monthData.color}30`,
                  borderRadius: "99px", fontSize: "0.72rem", fontWeight: 600, color: monthData.color,
                }}>
                  {monthData.glyph} {monthData.label}
                </span>
              </div>
            )}
          </div>

          {/* Essence quote */}
          <p style={{
            fontSize: "0.92rem", color: "rgba(220,215,255,0.85)", lineHeight: 1.7,
            margin: 0, fontStyle: "italic",
            borderTop: `1px solid ${yearData.color}20`, paddingTop: "1rem",
          }}>
            "{yearData.essence}"
          </p>
        </div>
      )}

      {/* Archetype sub-label (if profile loaded) */}
      {profile?.archetype?.name && py && (
        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--muted-foreground)", marginBottom: "1.25rem", marginTop: "-0.5rem" }}>
          {profile.archetype.name} in a Year-{py} phase
        </p>
      )}

      {/* ── Why This Phase ───────────────────────────────────────────────────── */}
      {yearData && (
        <div style={{
          background: "var(--sc-card-bg)",
          border: "1px solid rgba(212,168,95,0.18)",
          borderLeft: "3px solid #D4A85F",
          borderRadius: "12px",
          padding: "1.25rem 1.5rem",
          marginBottom: "1.1rem",
        }}>
          <p style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#D4A85F", marginBottom: "0.75rem", fontWeight: 700, margin: "0 0 0.75rem" }}>
            ◉ Why This Phase Is Active
          </p>
          {yearData.why.map((line, i) => (
            <p key={i} style={{ fontSize: "0.87rem", color: "rgba(246,241,232,0.82)", margin: "0 0 0.45rem", lineHeight: 1.65 }}>
              <span style={{ color: "#D4A85F", marginRight: "0.5rem", fontSize: "0.7rem" }}>▶</span>{line}
            </p>
          ))}
        </div>
      )}

      {/* ── Lean Into / Release ───────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.1rem" }}>

        {/* Lean Into */}
        <div style={{
          background: "rgba(34,197,94,0.05)",
          border: "1px solid rgba(34,197,94,0.2)",
          borderLeft: "3px solid #22c55e",
          borderRadius: "12px",
          padding: "1.25rem",
        }}>
          <p style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#22c55e", marginBottom: "0.75rem", fontWeight: 700, margin: "0 0 0.75rem" }}>
            ✦ Lean Into
          </p>
          {leanIntoItems.slice(0, 3).map((item: string, i: number) => (
            <p key={i} style={{ fontSize: "0.82rem", color: "rgba(200,255,210,0.85)", margin: "0 0 0.45rem", lineHeight: 1.65 }}>
              <span style={{ color: "#22c55e", marginRight: "0.4rem" }}>→</span>{item}
            </p>
          ))}
        </div>

        {/* Release */}
        <div style={{
          background: "rgba(245,158,11,0.05)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderLeft: "3px solid #f59e0b",
          borderRadius: "12px",
          padding: "1.25rem",
        }}>
          <p style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#f59e0b", marginBottom: "0.75rem", fontWeight: 700, margin: "0 0 0.75rem" }}>
            ▪ Release
          </p>
          {releaseItems.slice(0, 3).map((item: string, i: number) => (
            <p key={i} style={{ fontSize: "0.82rem", color: "rgba(255,240,200,0.82)", margin: "0 0 0.45rem", lineHeight: 1.65 }}>
              <span style={{ color: "#f59e0b", marginRight: "0.4rem" }}>✕</span>{item}
            </p>
          ))}
        </div>
      </div>

      {/* ── What Opens Next ──────────────────────────────────────────────────── */}
      {(nextMonthDat || yearData) && (
        <div style={{
          background: "rgba(212,168,95,0.04)",
          border: "1px solid rgba(212,168,95,0.18)",
          borderLeft: "3px solid #D4A85F",
          borderRadius: "12px",
          padding: "1.25rem 1.5rem",
          marginBottom: "1.5rem",
        }}>
          <p style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#D4A85F", marginBottom: "0.75rem", fontWeight: 700, margin: "0 0 0.75rem" }}>
            ◌ What Opens Next
          </p>

          {/* Next Personal Month — always show */}
          {nextMonthDat && nextPm && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: "0.6rem",
              marginBottom: yearTurnsUrgent || yearTurnsNear ? "0.85rem" : 0,
            }}>
              <span style={{ color: "#D4A85F", fontSize: "0.9rem", marginTop: "0.1rem", flexShrink: 0 }}>{nextMonthDat.glyph}</span>
              <p style={{ fontSize: "0.87rem", color: "rgba(246,241,232,0.9)", margin: 0, lineHeight: 1.65 }}>
                <strong>Month {nextPm} — {nextMonthDat.label}</strong><br />
                <span style={{ color: "rgba(212,168,95,0.75)" }}>{nextMonthDat.note}</span>
              </p>
            </div>
          )}

          {/* Year transition — only show when approaching the boundary */}
          {yearData && nextYearNum && yearTurnsNear && (
            <div style={{
              borderTop: "1px solid rgba(212,168,95,0.15)", paddingTop: "0.85rem",
              display: "flex", alignItems: "flex-start", gap: "0.6rem",
            }}>
              <span style={{ color: yearTurnsUrgent ? "#22c55e" : "#D4A85F", fontSize: "0.8rem", marginTop: "0.15rem", flexShrink: 0 }}>
                {yearTurnsUrgent ? "◉" : "→"}
              </span>
              <p style={{ fontSize: "0.85rem", color: yearTurnsUrgent ? "rgba(200,255,210,0.9)" : "rgba(246,241,232,0.82)", margin: 0, lineHeight: 1.65 }}>
                <strong style={{ color: yearTurnsUrgent ? "#22c55e" : "#D4A85F" }}>
                  {yearTurnsUrgent
                    ? `Year ${nextYearNum} — ${YEAR_DATA[nextYearNum].label} opens ${monthsRemaining === 0 ? "this month" : "next month"}`
                    : `Year ${nextYearNum} — ${YEAR_DATA[nextYearNum].label} arrives in ${monthsRemaining} months`}
                </strong><br />
                <span>{yearData.nextYearEssence}</span>
              </p>
            </div>
          )}

          {/* Mid-year (months 1-9): show the year arc note quietly */}
          {yearData && !yearTurnsNear && (
            <p style={{ fontSize: "0.82rem", color: "rgba(180,230,255,0.62)", margin: 0, lineHeight: 1.65, marginTop: nextMonthDat ? "0.7rem" : 0 }}>
              <span style={{ color: "#22d3ee", marginRight: "0.4rem", fontSize: "0.75rem" }}>→</span>
              {yearData.nextYearEssence}
            </p>
          )}
        </div>
      )}

      {/* ── Today's Signal strip ─────────────────────────────────────────────── */}
      {todayCard && (todayCard.moonPhase || todayCard.personalDayNumber) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem", marginBottom: "1.75rem" }}>
          {todayCard.moonPhase && (
            <div style={{
              background: "var(--sc-card-bg)", border: "1px solid var(--sc-card-border)",
              borderRadius: "12px", padding: "1rem", textAlign: "center",
            }}>
              <div style={{ fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "0.35rem" }}>Moon Phase</div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--foreground)" }}>{todayCard.moonPhase}</div>
            </div>
          )}
          {todayCard.personalDayNumber && (
            <div style={{
              background: "var(--sc-card-bg)", border: "1px solid var(--sc-card-border)",
              borderRadius: "12px", padding: "1rem", textAlign: "center",
            }}>
              <div style={{ fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "0.35rem" }}>Personal Day</div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--foreground)" }}>{todayCard.personalDayNumber}</div>
            </div>
          )}
        </div>
      )}

      {/* ── Life Map — compact future note ─────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0.6rem",
        padding: "0.6rem 0.9rem",
        border: "1px dashed rgba(212,168,95,0.15)",
        borderRadius: "10px",
        opacity: 0.45,
      }}>
        <span style={{ color: "var(--cosmic-lavender)", fontSize: "0.75rem", flexShrink: 0 }}>◎</span>
        <span style={{ fontSize: "0.73rem", color: "var(--muted-foreground)", lineHeight: 1.4 }}>
          Life Map — full 9-year arc view coming soon
        </span>
      </div>
      </div>
    </div>
  );
}
