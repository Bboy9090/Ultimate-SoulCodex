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
  ArrowRight,
  ChevronRight,
  CircleDot,
  Diamond,
  Moon,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import TimelineIntelligence from "../components/TimelineIntelligence";
import FeatureState from "../components/FeatureState";
import { useActiveProfile } from "../hooks/useActiveProfile";

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
  4: { label: "Foundation", essence: "Build what can carry weight. Structure, repetition, discipline, and durability matter more than novelty.", lean: ["Do the slow work that compounds.", "Build systems, not just outputs.", "Strengthen weak foundations before expansion."], release: ["Chasing novelty for stimulation.", "Skipping invisible structural work.", "Overcommitting beyond the foundation."] },
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
  const { profile, isLoading, isCorrupted, reason } = useActiveProfile();
  const [todayCard, setTodayCard] = useState<any>(null);

  useEffect(() => {
    try {
      const savedToday = localStorage.getItem("soulTodayCard");
      setTodayCard(savedToday ? JSON.parse(savedToday) : null);
    } catch {
      setTodayCard(null);
    }
  }, []);

  const birthData = useMemo(() => {
    const birthDate = profile?.birthDate;
    if (!birthDate) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
    if (!match) return null;
    return { month: Number(match[2]), day: Number(match[3]) };
  }, [profile?.birthDate]);

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
    if (personalYear && phase) {
      signals.push({ date, system: "personal-year" as const, value: personalYear, label: `year-${personalYear}`, description: `Year ${personalYear} · ${phase.label}` });
    }
    if (personalMonth) {
      signals.push({ date, system: "personal-month" as const, value: personalMonth, label: `month-${personalMonth}`, description: `Month ${personalMonth} · ${MONTH_LABELS[personalMonth]}` });
    }
    if (todayCard?.moonPhase) {
      signals.push({ date, system: "moon-phase" as const, value: todayCard.moonPhase, label: todayCard.moonPhase, description: "Moon phase cycle" });
    }
    if (todayCard?.personalDayNumber) {
      signals.push({ date, system: "personal-day" as const, value: todayCard.personalDayNumber, label: `day-${todayCard.personalDayNumber}`, description: "Personal day frequency" });
    }
    return signals;
  }, [personalYear, personalMonth, phase, todayCard]);

  if (isLoading) {
    return (
      <main className="sc-page !pt-8">
        <FeatureState kind="loading" title="Loading Timeline" description="Opening the saved Identity used for your deterministic numerology cycles." />
      </main>
    );
  }

  if (isCorrupted) {
    return (
      <main className="sc-page !pt-8">
        <FeatureState kind="error" title="Your saved profile needs attention" description={reason || "Timeline will not infer birth data from a corrupted profile."} />
        <button className="sc-button-primary mt-4" onClick={() => navigate("/create")}>Create profile</button>
      </main>
    );
  }

  if (!birthData) {
    return (
      <main className="sc-page !pt-8">
        <section className="sc-panel sc-panel-gold mx-auto max-w-3xl p-8 text-center sm:p-10">
          <CircleDot className="mx-auto h-10 w-10 text-[var(--sc-gold)]" />
          <div className="sc-eyebrow mt-5">Personal cycles</div>
          <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Timeline needs a saved birth date.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--sc-stone)]">
            Timeline uses the birth date already stored in Identity to calculate personal-year and personal-month cycles. It does not need another onboarding flow.
          </p>
          <button className="sc-button-primary mt-6" onClick={() => navigate("/create")}>Create profile <ArrowRight className="h-4 w-4" /></button>
        </section>
      </main>
    );
  }

  return (
    <main className="sc-page !pt-8">
      <header className="grid items-center gap-8 pb-8 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div>
          <div className="sc-eyebrow">{dateLabel}</div>
          <h1 className="mt-4 font-serif text-[clamp(3rem,8vw,5.7rem)] font-medium leading-[.96] tracking-[-.04em] text-[var(--sc-ivory)]">Your current phase</h1>
          <p className="sc-lede mt-5 max-w-3xl">A living view of the symbolic numerology cycle you are in now, the pressure inside it, and the next turn already approaching.</p>
        </div>

        {personalYear && phase ? (
          <div className="relative mx-auto grid aspect-square w-48 place-items-center rounded-full border border-[rgba(217,182,111,.22)] bg-[radial-gradient(circle,rgba(217,182,111,.08),rgba(154,116,220,.05)_52%,transparent_70%)] shadow-[0_0_70px_rgba(154,116,220,.12)]" aria-label={`Personal Year ${personalYear}: ${phase.label}`}>
            <span className="absolute inset-[15%] rounded-full border border-[rgba(154,116,220,.2)]" />
            <div className="relative z-10 text-center">
              <div className="font-serif text-6xl text-[var(--sc-gold-bright)]">{personalYear}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[.16em] text-[var(--sc-stone)]">Personal Year</div>
            </div>
          </div>
        ) : null}
      </header>

      {phase && personalYear ? (
        <section className="sc-panel sc-panel-gold p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="sc-eyebrow">Year {personalYear}</div>
              <h2 className="mt-2 font-serif text-4xl font-semibold">{phase.label}</h2>
            </div>
            {personalMonth ? <span className="sc-trust-chip">Month {personalMonth} · {MONTH_LABELS[personalMonth]}</span> : null}
          </div>
          <p className="mb-0 mt-5 max-w-4xl text-base leading-7 text-[var(--sc-ivory-soft)]">{phase.essence}</p>
          {profile?.archetype ? (
            <p className="mb-0 mt-4 text-sm text-[var(--sc-stone)]">
              {typeof profile.archetype === "string" ? profile.archetype : (profile.archetype as any)?.name || "Your archetype"} moving through a Year {personalYear} phase
            </p>
          ) : null}
        </section>
      ) : null}

      {phase ? (
        <section className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="sc-panel p-6">
            <span className="sc-icon-well"><Sparkles className="h-5 w-5" /></span>
            <div className="sc-eyebrow mt-5">Lean into</div>
            <h2 className="mt-2 font-serif text-2xl font-semibold">What supports this phase</h2>
            <ul className="mt-5 space-y-3 text-sm text-[var(--sc-stone)]">
              {phase.lean.map((item) => <li key={item} className="flex gap-2"><ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sc-gold)]" />{item}</li>)}
            </ul>
          </article>

          <article className="sc-panel p-6">
            <span className="sc-icon-well"><X className="h-5 w-5" /></span>
            <div className="sc-eyebrow mt-5">Release</div>
            <h2 className="mt-2 font-serif text-2xl font-semibold">What creates drag</h2>
            <ul className="mt-5 space-y-3 text-sm text-[var(--sc-stone)]">
              {phase.release.map((item) => <li key={item} className="flex gap-2"><X className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sc-danger)]" />{item}</li>)}
            </ul>
          </article>
        </section>
      ) : null}

      {(nextMonth || nextYear) ? (
        <section className="sc-panel mt-4 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="sc-icon-well"><Diamond className="h-5 w-5" /></span>
            <div>
              <div className="sc-eyebrow">What opens next</div>
              <h2 className="m-0 mt-1 font-serif text-2xl font-semibold">The cycle is already moving.</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {nextMonth ? (
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                <span className="text-xs text-[var(--sc-stone)]">Next month frequency</span>
                <strong className="mt-2 block font-serif text-xl">Month {nextMonth} · {MONTH_LABELS[nextMonth]}</strong>
                <p className="mb-0 mt-3 text-sm leading-6 text-[var(--sc-stone)]">The monthly emphasis shifts while the larger personal-year theme remains the container.</p>
              </div>
            ) : null}
            {nextYear ? (
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                <span className="text-xs text-[var(--sc-stone)]">Next year archetype</span>
                <strong className="mt-2 block font-serif text-xl">Year {nextYear} · {YEAR_PHASES[nextYear].label}</strong>
                <p className="mb-0 mt-3 text-sm leading-6 text-[var(--sc-stone)]">
                  {transition.isNear
                    ? `The year boundary is ${transition.monthsRemaining === 0 ? "here" : `${transition.monthsRemaining} month${transition.monthsRemaining === 1 ? "" : "s"} away`}.`
                    : "This is the next major chapter after the current annual cycle completes."}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {todayCard && (todayCard.moonPhase || todayCard.personalDayNumber) ? (
        <section className="mt-4 grid gap-3 sm:grid-cols-2">
          {todayCard.moonPhase ? (
            <div className="sc-panel flex items-center gap-3 p-4"><Moon className="h-4 w-4 text-[var(--sc-violet)]" /><span className="text-xs text-[var(--sc-stone)]">Moon phase</span><strong className="ml-auto">{todayCard.moonPhase}</strong></div>
          ) : null}
          {todayCard.personalDayNumber ? (
            <div className="sc-panel flex items-center gap-3 p-4"><Sparkles className="h-4 w-4 text-[var(--sc-gold)]" /><span className="text-xs text-[var(--sc-stone)]">Personal day</span><strong className="ml-auto">{todayCard.personalDayNumber} · {DAY_LABELS[todayCard.personalDayNumber]?.label ?? "Focus"}</strong></div>
          ) : null}
        </section>
      ) : null}

      {systemSignals.length > 0 ? <section className="mt-4"><TimelineIntelligence systemSignals={systemSignals} /></section> : null}

      <aside className="mt-4 flex gap-3 rounded-2xl border border-[rgba(114,216,197,.18)] bg-[rgba(114,216,197,.05)] p-4 text-sm text-[var(--sc-stone)]">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sc-teal)]" />
        <p className="m-0 leading-6"><strong className="text-[var(--sc-ivory-soft)]">Symbolic timing framework.</strong> Personal-year, month, and day cycles organize reflection; they are not deterministic forecasts or evidence that a calendar controls outcomes.</p>
      </aside>
    </main>
  );
}
