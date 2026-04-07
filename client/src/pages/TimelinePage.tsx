import { useState, useEffect } from "react";
import { useLocation } from "wouter";

// ── Numerology helpers ────────────────────────────────────────────────────────

function reduceToSingle(n: number): number {
  let s = n;
  while (s > 9) {
    const digits = String(s).split("");
    s = digits.reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
  return s;
}

function calcPersonalYear(birthMonth: number, birthDay: number, year: number): number {
  return reduceToSingle(reduceToSingle(birthMonth) + reduceToSingle(birthDay) + reduceToSingle(year));
}

function calcPersonalMonth(py: number, month: number): number {
  return reduceToSingle(py + month);
}

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
    label: "New Cycle", glyph: "◎", color: "#8b5cf6",
    essence: "I'm planting seeds for a new 9-year chapter. This is the year to initiate, not refine.",
    why: [
      "I'm at the numerological start of a new 9-year cycle.",
      "What I begin now has a long runway — interrupting it too early costs momentum.",
      "My energy is naturally oriented toward self-direction and fresh starts.",
    ],
    leanInto: [
      "Start the thing I've been delaying.",
      "Make decisions from identity, not from habit.",
      "Build new patterns before the old ones re-solidify.",
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
      "Invest in the relationship that has the most long-term signal.",
      "Listen more than I speak in decisions that affect others.",
      "Be reliable where I said I would show up.",
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
      "Publish the thing I've been sitting on.",
      "Expand my creative surface area — more channels, more outputs.",
      "Say yes to social energy and visibility.",
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
      "Do the slow, unsexy work that compounds.",
      "Build systems, not just outputs.",
      "Audit what is held together by habit versus actual design.",
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
      "The numerological field is restless and expansive. Resistance amplifies friction.",
      "Freedom this year comes from releasing what belonged to the previous phase.",
    ],
    leanInto: [
      "Make the change I've been deferring.",
      "Follow what is pulling me, not just what's familiar.",
      "Test assumptions I've been treating as fixed.",
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
    label: "Responsibility", glyph: "◉", color: "#8b5cf6",
    essence: "I'm in a year of tending. Home, health, and commitments reward showing up.",
    why: [
      "Year 6 shifts focus toward service, home, and what I owe to people I care about.",
      "The field this year favors depth over breadth.",
      "What I tend carefully now reaches maturity in Year 7 and 8.",
    ],
    leanInto: [
      "Show up where I said I would.",
      "Invest in the relationships that have been waiting.",
      "Treat my health as a structural asset, not an afterthought.",
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
      "Read, study, and deepen — not broadly, but precisely.",
      "Spend time alone without an agenda.",
      "Ask the questions I've been too busy to hold.",
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
      "Ask for what I've earned.",
      "Think at the decade level, not the quarter.",
      "Make the high-stakes decision I've been building toward.",
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
      "The field is clearing space for what's coming in Year 1.",
      "Holding onto the past this year delays the next chapter by exactly how long I hold on.",
    ],
    leanInto: [
      "Complete what I started. Close the loop.",
      "Forgive what I've been carrying from this cycle.",
      "Let the chapter end with intention, not avoidance.",
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
  1: { label: "Initiation",   glyph: "◎", color: "#8b5cf6", note: "New beginnings, fresh energy — act on instinct." },
  2: { label: "Patience",     glyph: "◌", color: "#22d3ee", note: "Wait, listen, and trust what is still germinating." },
  3: { label: "Expression",   glyph: "✦", color: "#f472b6", note: "Share, connect, and move creative work forward." },
  4: { label: "Discipline",   glyph: "◆", color: "#f59e0b", note: "Build methodically. Do the unsexy work." },
  5: { label: "Change",       glyph: "⬡", color: "#22c55e", note: "Disrupt what no longer fits. Move quickly." },
  6: { label: "Tending",      glyph: "◉", color: "#8b5cf6", note: "Invest in relationships and responsibilities." },
  7: { label: "Depth",        glyph: "◈", color: "#22d3ee", note: "Go inward. Research, reflect, refine." },
  8: { label: "Leverage",     glyph: "◆", color: "#f59e0b", note: "Push the material goal. Make the ask." },
  9: { label: "Release",      glyph: "☽", color: "#f472b6", note: "Complete, forgive, and let go of what's done." },
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

  const nextPm           = pm ? (pm === 9 ? 1 : pm + 1) : null;
  const yearData         = py     ? YEAR_DATA[py]      : null;
  const monthData        = pm     ? MONTH_DATA[pm]     : null;
  const nextMonthDat     = nextPm ? MONTH_DATA[nextPm] : null;
  const monthsRemaining  = 12 - currentMonth;          // 0 = December, 8 = April
  const yearTurnsUrgent  = monthsRemaining <= 1;       // this month or next month
  const yearTurnsNear    = monthsRemaining <= 3;       // within 3 months
  const nextYearNum      = py ? (py === 9 ? 1 : py + 1) : null;

  // Phase guidance always comes from the year archetype — never day-level to-do lists
  const leanIntoItems: string[] = yearData?.leanInto ?? [];
  const releaseItems:  string[] = yearData?.release  ?? [];

  const dateLabel = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const noData = !birthData && !todayCard;

  if (noData) {
    return (
      <div style={{ padding: "3rem 1rem 5rem", maxWidth: 500, margin: "0 auto" }}>
        <h1 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 5vw, 2rem)", marginBottom: "1.75rem", textAlign: "center" }}>
          Your Timeline
        </h1>
        <div style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          borderTop: "3px solid var(--cosmic-purple)",
          borderRadius: "var(--radius)",
          padding: "2rem 1.75rem",
        }}>
          <div style={{ fontSize: "1.75rem", marginBottom: "1rem", color: "var(--cosmic-lavender)", opacity: 0.7, textAlign: "center" }}>◎</div>
          <h3 style={{ textAlign: "center", marginBottom: "0.5rem", fontSize: "1.05rem", fontWeight: 600 }}>
            Timeline unlocks with your profile
          </h3>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.85rem", lineHeight: 1.65, marginBottom: "1.25rem", textAlign: "center" }}>
            Your personal numerology cycle determines what phase you're in right now — and what's opening next.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.75rem" }}>
            {[
              { glyph: "▲", label: "Current Personal Year", desc: "The 9-year cycle archetype you're living this year" },
              { glyph: "◉", label: "Active Personal Month", desc: "The specific frequency you're operating in right now" },
              { glyph: "◈", label: "What Opens Next", desc: "The transition approaching in your numerology arc" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.65rem 0.75rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)", borderRadius: 8 }}>
                <span style={{ color: "var(--cosmic-lavender)", fontSize: "0.9rem", marginTop: "0.05rem", flexShrink: 0 }}>{item.glyph}</span>
                <span>
                  <span style={{ fontWeight: 600, fontSize: "0.83rem", display: "block" }}>{item.label}</span>
                  <span style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>{item.desc}</span>
                </span>
              </div>
            ))}
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => navigate("/start")}>
            Create Your Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem 1rem 5rem", maxWidth: 780, margin: "0 auto" }}>

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
          background: "rgba(15,20,40,0.5)",
          border: "1px solid rgba(139,92,246,0.15)",
          borderLeft: "3px solid #8b5cf6",
          borderRadius: "12px",
          padding: "1.25rem 1.5rem",
          marginBottom: "1.1rem",
        }}>
          <p style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8b5cf6", marginBottom: "0.75rem", fontWeight: 700, margin: "0 0 0.75rem" }}>
            ◉ Why This Phase Is Active
          </p>
          {yearData.why.map((line, i) => (
            <p key={i} style={{ fontSize: "0.87rem", color: "rgba(220,215,255,0.82)", margin: "0 0 0.45rem", lineHeight: 1.65 }}>
              <span style={{ color: "#8b5cf6", marginRight: "0.5rem", fontSize: "0.7rem" }}>▶</span>{line}
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
          background: "rgba(34,211,238,0.04)",
          border: "1px solid rgba(34,211,238,0.18)",
          borderLeft: "3px solid #22d3ee",
          borderRadius: "12px",
          padding: "1.25rem 1.5rem",
          marginBottom: "1.5rem",
        }}>
          <p style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#22d3ee", marginBottom: "0.75rem", fontWeight: 700, margin: "0 0 0.75rem" }}>
            ◌ What Opens Next
          </p>

          {/* Next Personal Month — always show */}
          {nextMonthDat && nextPm && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: "0.6rem",
              marginBottom: yearTurnsUrgent || yearTurnsNear ? "0.85rem" : 0,
            }}>
              <span style={{ color: "#22d3ee", fontSize: "0.9rem", marginTop: "0.1rem", flexShrink: 0 }}>{nextMonthDat.glyph}</span>
              <p style={{ fontSize: "0.87rem", color: "rgba(200,240,255,0.9)", margin: 0, lineHeight: 1.65 }}>
                <strong>Month {nextPm} — {nextMonthDat.label}</strong><br />
                <span style={{ color: "rgba(180,230,255,0.75)" }}>{nextMonthDat.note}</span>
              </p>
            </div>
          )}

          {/* Year transition — only show when approaching the boundary */}
          {yearData && nextYearNum && yearTurnsNear && (
            <div style={{
              borderTop: "1px solid rgba(34,211,238,0.15)", paddingTop: "0.85rem",
              display: "flex", alignItems: "flex-start", gap: "0.6rem",
            }}>
              <span style={{ color: yearTurnsUrgent ? "#22c55e" : "#22d3ee", fontSize: "0.8rem", marginTop: "0.15rem", flexShrink: 0 }}>
                {yearTurnsUrgent ? "◉" : "→"}
              </span>
              <p style={{ fontSize: "0.85rem", color: yearTurnsUrgent ? "rgba(200,255,210,0.9)" : "rgba(180,230,255,0.78)", margin: 0, lineHeight: 1.65 }}>
                <strong style={{ color: yearTurnsUrgent ? "#22c55e" : "#22d3ee" }}>
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
              background: "rgba(15,20,40,0.5)", border: "1px solid rgba(139,92,246,0.15)",
              borderRadius: "12px", padding: "1rem", textAlign: "center",
            }}>
              <div style={{ fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "0.35rem" }}>Moon Phase</div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--foreground)" }}>{todayCard.moonPhase}</div>
            </div>
          )}
          {todayCard.personalDayNumber && (
            <div style={{
              background: "rgba(15,20,40,0.5)", border: "1px solid rgba(139,92,246,0.15)",
              borderRadius: "12px", padding: "1rem", textAlign: "center",
            }}>
              <div style={{ fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "0.35rem" }}>Personal Day</div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--foreground)" }}>{todayCard.personalDayNumber}</div>
            </div>
          )}
        </div>
      )}

      {/* ── Life Map teaser ──────────────────────────────────────────────────── */}
      <div style={{
        background: "rgba(15,20,40,0.4)",
        border: "1px dashed rgba(139,92,246,0.22)",
        borderRadius: "14px",
        padding: "1.5rem 1.75rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
          <div>
            <p style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "0.3rem" }}>
              In Development
            </p>
            <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Life Map</p>
          </div>
          <span style={{
            display: "inline-block", padding: "0.2rem 0.65rem",
            background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.22)",
            borderRadius: "99px", fontSize: "0.68rem", color: "var(--cosmic-lavender)",
          }}>Soon ✦</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
          {[
            ["◎", "My full 9-year arc — Years 1 through 9 laid out as a scrollable timeline"],
            ["◆", "Past years dimmed, current year highlighted, upcoming years shown as markers"],
            ["☽", "Major threshold points marked — the years when my cycle resets or peaks"],
          ].map(([glyph, text]) => (
            <p key={text} style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", margin: 0, lineHeight: 1.6 }}>
              <span style={{ color: "rgba(139,92,246,0.55)", marginRight: "0.5rem" }}>{glyph}</span>{text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
