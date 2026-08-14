import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  calcPersonalMonth,
  calcPersonalYear,
  DAY_LABELS,
  getCycleTransitionState,
  getNextMonthNum,
  getNextYearNum,
} from "@soulcodex/core";
import {
  IconArrowRight,
  IconChevronRight,
  IconCircle,
  IconDiamond,
  IconIdentity,
  IconMoon,
  IconSparkles,
  IconSquare,
  IconX,
} from "../components/Icons";
import TimelineIntelligence from "../components/TimelineIntelligence";
import { loadActiveProfile } from "../lib/profileStorage";

type Phase = {
  label: string;
  essence: string;
  lean: string[];
  release: string[];
};

const YEAR_PHASES: Record<number, Phase> = {
  1: { label: "New Cycle", essence: "Begin before the path feels complete. This year rewards identity, initiation, and clean first moves.", lean: ["Start the delayed thing.", "Choose from identity, not habit.", "Build new patterns before old ones harden again."], release: ["Waiting for permission.", "Dragging finished commitments forward.", "Trying to perfect what has not begun."] },
  2: { label: "Partnership", essence: "Cultivate more than you force. Relationships, timing, patience, and cooperation carry the leverage.", lean: ["Invest in the relationship with long signal.", "Listen before deciding for two people.", "Show up reliably where trust is growing."], release: ["Competing when collaboration would work.", "Rushing what is still germinating.", "Treating stillness as failure."] },
  3: { label: "Expression", essence: "Create outwardly. Voice, visibility, play, connection, and creative output want room to move.", lean: ["Publish what has been waiting.", "Increase creative surface area.", "Let conversation and visibility work for you."], release: ["Perfecting instead of shipping.", "Isolation by default.", "Hiding until everything feels ready."] },
  4: { label: "Foundation", essence: "Build what can carry weight. Structure, repetition, discipline, and durability matter more than novelty.", lean: ["Do the slow work that compounds.", "Build systems, not just outputs.", "Strengthen weak foundations before expansion."], release: ["Chasing novelty for stimulation.", "Skipping invisible structural work.", "Overcommitting beyond the foundation." ] },
  5: { label: "Liberation", essence: "Change is the mechanism. Movement, experimentation, freedom, and correction are more useful than rigid control.", lean: ["Make the change you keep deferring.", "Test assumptions you treat as permanent.", "Follow real movement, not mere familiarity."], release: ["Structures built for an older self.", "Confusing discomfort with danger.", "Over-planning what needs experimentation."] },
  6: { label: "Responsibility", essence: "Tend what matters. Home, body, relationships, care, and commitments reward consistent presence.", lean: ["Honor the commitments that matter.", "Invest in close relationships.", "Treat health and home as infrastructure."], release: ["Spreading yourself too thin.", "Neglecting the body for output.", "Waiting for motivation before responsibility."] },
  7: { label: "Depth", essence: "Go inward with purpose. Research, solitude, reflection, refinement, and meaning-making become productive work.", lean: ["Study deeply instead of broadly.", "Protect useful solitude.", "Ask the questions busyness keeps hiding."], release: ["Busyness as proof of progress.", "Forced visibility.", "Avoiding inner work because it has no obvious deliverable."] },
  8: { label: "Power", essence: "Use what you have built. Material leverage, authority, precision, ambition, and results come into focus.", lean: ["Ask for what the work has earned.", "Think in longer horizons.", "Make the decision you have prepared for."], release: ["Underselling your value.", "Shrinking from visibility.", "Confusing modesty with strategy."] },
  9: { label: "Completion", essence: "Close the chapter cleanly. Integration, forgiveness, finishing, and release make room for the next cycle.", lean: ["Finish and close loops.", "Release what has completed its role.", "Integrate the lesson instead of repeating it."], release: ["Starting what belongs in the next cycle.", "Clinging to expired identities.", "Forcing growth where closure is needed."] },
};

const MONTH_LABELS: Record<number, string> = {
  1: "Initiation",
  2: "Patience",
  3: "Expression",
  4: "Discipline",
  5: "Change",
  6: "Tending",
  7: "Depth",
  8: "Leverage",
  9: "Release",
};

export default function TimelinePage() {
  const [, navigate] = useLocation();
  const [birthData, setBirthData] = useState<{ month: number; day: number } | null>(null);
  const [todayCard, setTodayCard] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const result = loadActiveProfile();
    if (result) setProfile(result);

    try {
      const savedToday = localStorage.getItem("soulTodayCard");
      if (savedToday) setTodayCard(JSON.parse(savedToday));
    } catch {}

    const birthDate = result?.birthDate;
    if (birthDate) {
      const [, month, day] = birthDate.split("-");
      setBirthData({ month: Number(month), day: Number(day) });
      return;
    }

    const rawInputs = localStorage.getItem("onboardingData") || localStorage.getItem("soulUserInputs");
    if (!rawInputs) return;
    try {
      const inputs = JSON.parse(rawInputs);
      if (inputs.birthDate) {
        const [, month, day] = String(inputs.birthDate).split("-");
        setBirthData({ month: Number(month), day: Number(day) });
      }
    } catch {}
  }, []);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const personalYear = birthData ? calcPersonalYear(birthData.month, birthData.day, year) : null;
  const personalMonth = personalYear ? calcPersonalMonth(personalYear, month) : null;
  const nextMonth = personalMonth ? getNextMonthNum(personalMonth) : null;
  const nextYear = personalYear ? getNextYearNum(personalYear) : null;
  const phase = personalYear ? YEAR_PHASES[personalYear] : null;
  const transition = getCycleTransitionState(month);

  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const systemSignals = useMemo(() => {
    const signals: any[] = [];
    const date = new Date().toISOString().split("T")[0];
    if (personalYear && phase) signals.push({ date, system: "personal-year" as const, value: personalYear, label: `year-${personalYear}`, description: `Year ${personalYear} — ${phase.label}` });
    if (personalMonth) signals.push({ date, system: "personal-month" as const, value: personalMonth, label: `month-${personalMonth}`, description: `Month ${personalMonth} — ${MONTH_LABELS[personalMonth]}` });
    if (todayCard?.moonPhase) signals.push({ date, system: "moon-phase" as const, value: todayCard.moonPhase, label: todayCard.moonPhase, description: "Moon phase cycle" });
    if (todayCard?.personalDayNumber) signals.push({ date, system: "personal-day" as const, value: todayCard.personalDayNumber, label: `day-${todayCard.personalDayNumber}`, description: "Personal day frequency" });
    return signals;
  }, [personalYear, personalMonth, phase, todayCard]);

  if (!birthData && !todayCard) {
    return (
      <div className="timeline-shell timeline-empty-shell">
        <main className="timeline-empty">
          <div className="timeline-orbit-mark"><IconCircle size={26} /></div>
          <p className="timeline-kicker">Personal cycles</p>
          <h1>Your Timeline is waiting for a birth date.</h1>
          <p>Timeline uses your saved birth date to place you inside the current personal-year and personal-month cycle. It updates automatically as the calendar moves.</p>
          <div className="timeline-empty-grid">
            <span><IconCircle size={15} /> Current year archetype</span>
            <span><IconIdentity size={15} /> Active month frequency</span>
            <span><IconDiamond size={15} /> Upcoming transition</span>
          </div>
          <button className="timeline-primary-button" onClick={() => navigate("/start")}>Finish my profile <IconArrowRight size={15} /></button>
        </main>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="timeline-shell">
      <main className="timeline-main">
        <header className="timeline-hero">
          <div>
            <p className="timeline-kicker">{dateLabel}</p>
            <h1>Your current phase</h1>
            <p className="timeline-lede">A living view of the cycle you are in now, the tension inside it, and the next turn already approaching.</p>
          </div>
          {personalYear && phase && (
            <div className="timeline-year-orbit" aria-label={`Personal Year ${personalYear}: ${phase.label}`}>
              <div className="timeline-ring" />
              <div className="timeline-year-core"><span>{personalYear}</span><small>Personal Year</small></div>
            </div>
          )}
        </header>

        {phase && personalYear && (
          <section className="timeline-feature-card">
            <div className="timeline-feature-topline">
              <div>
                <p className="timeline-kicker">Year {personalYear}</p>
                <h2>{phase.label}</h2>
              </div>
              {personalMonth && <span className="timeline-month-chip">Month {personalMonth} · {MONTH_LABELS[personalMonth]}</span>}
            </div>
            <p className="timeline-essence">{phase.essence}</p>
            {profile?.archetype && <p className="timeline-archetype">{typeof profile.archetype === "string" ? profile.archetype : profile.archetype?.name || "Your archetype"} moving through a Year-{personalYear} phase</p>}
          </section>
        )}

        {phase && (
          <section className="timeline-direction-grid">
            <article className="timeline-direction-card timeline-lean">
              <div className="timeline-card-icon"><IconSparkles size={18} /></div>
              <p className="timeline-kicker">Lean into</p>
              <h3>What supports this phase</h3>
              <ul>{phase.lean.map((item) => <li key={item}><IconChevronRight size={13} />{item}</li>)}</ul>
            </article>
            <article className="timeline-direction-card timeline-release">
              <div className="timeline-card-icon"><IconSquare size={18} /></div>
              <p className="timeline-kicker">Release</p>
              <h3>What creates drag</h3>
              <ul>{phase.release.map((item) => <li key={item}><IconX size={12} />{item}</li>)}</ul>
            </article>
          </section>
        )}

        {(nextMonth || nextYear) && (
          <section className="timeline-next-card">
            <div className="timeline-next-heading">
              <div className="timeline-card-icon timeline-card-icon-gold"><IconDiamond size={18} /></div>
              <div><p className="timeline-kicker">What opens next</p><h2>The cycle is already moving.</h2></div>
            </div>
            <div className="timeline-next-grid">
              {nextMonth && <div><span>Next month frequency</span><strong>Month {nextMonth} · {MONTH_LABELS[nextMonth]}</strong><p>The monthly emphasis shifts while the larger personal-year theme remains the container.</p></div>}
              {nextYear && <div><span>Next year archetype</span><strong>Year {nextYear} · {YEAR_PHASES[nextYear].label}</strong><p>{transition.isNear ? `The year boundary is ${transition.monthsRemaining === 0 ? "here" : `${transition.monthsRemaining} month${transition.monthsRemaining === 1 ? "" : "s"} away`}.` : "This is the next major chapter after the current annual cycle completes."}</p></div>}
            </div>
          </section>
        )}

        {todayCard && (todayCard.moonPhase || todayCard.personalDayNumber) && (
          <section className="timeline-signal-strip">
            {todayCard.moonPhase && <div><IconMoon size={16} /><span>Moon phase</span><strong>{todayCard.moonPhase}</strong></div>}
            {todayCard.personalDayNumber && <div><IconSparkles size={16} /><span>Personal day</span><strong>{todayCard.personalDayNumber} · {DAY_LABELS[todayCard.personalDayNumber]?.label ?? "Focus"}</strong></div>}
          </section>
        )}

        {systemSignals.length > 0 && <section className="timeline-intelligence"><TimelineIntelligence systemSignals={systemSignals} /></section>}

        <aside className="timeline-honesty">
          <IconIdentity size={17} />
          <p><strong>Interpretive boundary:</strong> numerology cycles are symbolic timing frameworks, not deterministic forecasts. Timeline should help you organize reflection and choices, not pretend the calendar has seized control of your steering wheel.</p>
        </aside>
      </main>
      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .timeline-shell{min-height:100vh;color:var(--foreground,#f7f0e4);background:radial-gradient(circle at 82% 4%,rgba(93,63,160,.18),transparent 26%),radial-gradient(circle at 12% 30%,rgba(29,116,131,.1),transparent 24%),linear-gradient(180deg,#08060e 0%,#0b0813 50%,#07060b 100%)}
  .timeline-main{width:min(980px,calc(100% - 32px));margin:0 auto;padding:110px 0 82px}.timeline-kicker{margin:0 0 9px;color:var(--sc-gold,#d4a85f);font-size:10px;font-weight:800;letter-spacing:.17em;text-transform:uppercase}.timeline-hero{display:grid;grid-template-columns:1fr 270px;align-items:center;gap:38px;padding:24px 0 30px}.timeline-hero h1,.timeline-empty h1{margin:0;font-family:var(--font-serif);font-size:clamp(2.7rem,7vw,5.6rem);font-weight:500;line-height:.98;letter-spacing:-.04em}.timeline-lede,.timeline-empty>p{max-width:680px;margin:18px 0 0;color:rgba(247,240,228,.66);font-size:16px;line-height:1.7}
  .timeline-year-orbit{position:relative;width:230px;aspect-ratio:1;margin:auto;display:grid;place-items:center}.timeline-ring{position:absolute;inset:5%;border:1px solid rgba(212,168,95,.22);border-radius:50%;box-shadow:inset 0 0 60px rgba(111,73,184,.07)}.timeline-ring:before,.timeline-ring:after{content:"";position:absolute;width:9px;height:9px;border-radius:50%;background:#d4a85f;box-shadow:0 0 15px rgba(212,168,95,.8)}.timeline-ring:before{left:8%;top:28%}.timeline-ring:after{right:12%;bottom:20%;background:#9786ef}.timeline-year-core{width:118px;height:118px;border-radius:50%;display:grid;place-items:center;align-content:center;border:1px solid rgba(212,168,95,.42);background:radial-gradient(circle,rgba(212,168,95,.13),rgba(77,52,129,.12));box-shadow:0 0 70px rgba(114,76,184,.17)}.timeline-year-core span{font-family:var(--font-serif);font-size:48px;line-height:.9;color:#ead09c}.timeline-year-core small{margin-top:6px;color:rgba(247,240,228,.5);font-size:9px;letter-spacing:.12em;text-transform:uppercase}
  .timeline-feature-card,.timeline-next-card,.timeline-direction-card,.timeline-honesty,.timeline-empty{border:1px solid rgba(212,168,95,.17);background:linear-gradient(145deg,rgba(24,18,38,.88),rgba(12,9,20,.9));box-shadow:0 28px 75px rgba(0,0,0,.22)}.timeline-feature-card{padding:26px;border-radius:24px}.timeline-feature-topline{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.timeline-feature-topline h2{margin:0;font-size:clamp(1.9rem,4vw,3rem);font-family:var(--font-serif);font-weight:500}.timeline-month-chip{padding:7px 11px;border:1px solid rgba(155,137,238,.23);border-radius:999px;background:rgba(155,137,238,.08);color:#c9bfff;font-size:12px;white-space:nowrap}.timeline-essence{max-width:760px;margin:21px 0 0;padding-top:18px;border-top:1px solid rgba(255,255,255,.07);color:rgba(247,240,228,.78);font-size:17px;line-height:1.72}.timeline-archetype{margin:13px 0 0;color:rgba(247,240,228,.43);font-size:12px}
  .timeline-direction-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}.timeline-direction-card{padding:23px;border-radius:21px}.timeline-card-icon{width:42px;height:42px;display:grid;place-items:center;margin-bottom:18px;border-radius:13px;color:#67c7c5;border:1px solid rgba(103,199,197,.2);background:rgba(103,199,197,.07)}.timeline-release .timeline-card-icon{color:#e0b468;border-color:rgba(224,180,104,.2);background:rgba(224,180,104,.07)}.timeline-direction-card h3{margin:0 0 14px;font-size:20px}.timeline-direction-card ul{display:grid;gap:10px;margin:0;padding:0;list-style:none}.timeline-direction-card li{display:flex;gap:8px;color:rgba(247,240,228,.64);font-size:14px;line-height:1.55}.timeline-direction-card li svg{flex:none;margin-top:4px;color:#73cac8}.timeline-release li svg{color:#d9ac63}
  .timeline-next-card{margin-top:14px;padding:24px;border-radius:22px}.timeline-next-heading{display:flex;gap:14px;align-items:center}.timeline-next-heading h2{margin:0;font-size:23px}.timeline-card-icon-gold{margin:0;color:#d4a85f;border-color:rgba(212,168,95,.22);background:rgba(212,168,95,.07)}.timeline-next-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:19px}.timeline-next-grid>div{padding:18px;border:1px solid rgba(255,255,255,.07);border-radius:16px;background:rgba(255,255,255,.025)}.timeline-next-grid span{display:block;margin-bottom:7px;color:rgba(247,240,228,.4);font-size:10px;letter-spacing:.12em;text-transform:uppercase}.timeline-next-grid strong{display:block;color:#ead8b4;font-size:17px}.timeline-next-grid p{margin:8px 0 0;color:rgba(247,240,228,.55);font-size:13px;line-height:1.55}
  .timeline-signal-strip{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.timeline-signal-strip>div{display:grid;grid-template-columns:auto 1fr;gap:2px 9px;align-items:center;padding:15px 17px;border:1px solid rgba(255,255,255,.07);border-radius:16px;background:rgba(255,255,255,.025)}.timeline-signal-strip svg{grid-row:1/3;color:#9e8fed}.timeline-signal-strip span{color:rgba(247,240,228,.4);font-size:10px;text-transform:uppercase;letter-spacing:.11em}.timeline-signal-strip strong{font-size:14px}.timeline-intelligence{margin-top:16px}.timeline-honesty{display:grid;grid-template-columns:auto 1fr;gap:12px;margin-top:16px;padding:17px 19px;border-radius:17px;color:rgba(247,240,228,.57);font-size:13px;line-height:1.6}.timeline-honesty svg{color:#67c7c5;margin-top:2px}.timeline-honesty p{margin:0}.timeline-honesty strong{color:#d7ece8}
  .timeline-empty-shell{display:grid;place-items:center;padding:40px 16px}.timeline-empty{width:min(650px,100%);padding:38px 30px;border-radius:24px;text-align:center}.timeline-empty h1{font-size:clamp(2.2rem,7vw,4.4rem)}.timeline-empty>p{margin-left:auto;margin-right:auto}.timeline-orbit-mark{width:60px;height:60px;display:grid;place-items:center;margin:0 auto 18px;border-radius:50%;color:#d4a85f;border:1px solid rgba(212,168,95,.3);background:rgba(212,168,95,.07)}.timeline-empty-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:24px 0}.timeline-empty-grid span{display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;border:1px solid rgba(255,255,255,.07);border-radius:12px;color:rgba(247,240,228,.58);font-size:12px}.timeline-primary-button{display:inline-flex;align-items:center;gap:7px;border:0;border-radius:12px;padding:12px 17px;background:#d4a85f;color:#130d09;font-weight:800;cursor:pointer}
  @media(max-width:760px){.timeline-hero{grid-template-columns:1fr}.timeline-year-orbit{width:190px}.timeline-direction-grid,.timeline-next-grid{grid-template-columns:1fr}}
  @media(max-width:520px){.timeline-main{width:min(100% - 22px,980px);padding-top:92px}.timeline-feature-topline{display:block}.timeline-month-chip{display:inline-flex;margin-top:13px}.timeline-signal-strip,.timeline-empty-grid{grid-template-columns:1fr}.timeline-year-orbit{width:165px}.timeline-year-core{width:94px;height:94px}.timeline-year-core span{font-size:39px}}
`;
