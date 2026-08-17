import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Eye,
  Gift,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import type {
  ClarityConfidence,
  ClarityReadingModel,
} from "@/lib/clarityReadingModel";
import {
  buildDepthChapters,
  type DepthChapter,
  type ReadingDepth,
  type ReadingFit,
} from "@/lib/depthEngine";
import { getProfilePath } from "@/lib/clarityNavigation";

type ClarityReadingExperienceProps = {
  profileId: string;
  profileName: string;
  model: ClarityReadingModel;
  offline?: boolean;
};

type FitMap = Record<string, ReadingFit | undefined>;

const confidenceClass: Record<ClarityConfidence, string> = {
  verified: "border-[rgba(114,216,197,.25)] bg-[rgba(114,216,197,.1)] text-[#bdeee0]",
  deterministic: "border-[rgba(100,151,217,.25)] bg-[rgba(100,151,217,.1)] text-[#bcd8f5]",
  supported: "border-[rgba(154,116,220,.25)] bg-[rgba(154,116,220,.1)] text-[#d6c8f5]",
  tentative: "border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.1)] text-[#ead9b9]",
  unavailable: "border-[var(--sc-line)] bg-white/5 text-[var(--sc-stone)]",
};

const chapterIcons = [Eye, ShieldCheck, Gift, Target, HeartHandshake];

const fitOptions: Array<{ value: ReadingFit; label: string }> = [
  { value: "very-much", label: "Very much" },
  { value: "partly", label: "Partly" },
  { value: "not-really", label: "Not really" },
];

function DepthChapterCard({
  chapter,
  depth,
  index,
  fit,
  onFit,
}: {
  chapter: DepthChapter;
  depth: ReadingDepth;
  index: number;
  fit?: ReadingFit;
  onFit: (fit: ReadingFit) => void;
}) {
  const Icon = chapterIcons[index] ?? Sparkles;
  const showStandard = depth === "standard" || depth === "deep";
  const showDeep = depth === "deep";

  return (
    <article className="relative rounded-[1.6rem] p-px [background:linear-gradient(140deg,rgba(217,182,111,.4)_0%,rgba(255,255,255,.05)_45%,rgba(255,255,255,.02)_100%)] shadow-[var(--sc-shadow-soft)]">
      <div className="relative overflow-hidden rounded-[calc(1.6rem-1px)] bg-[linear-gradient(155deg,rgba(28,21,39,.94),rgba(11,8,16,.97))] p-5 backdrop-blur-xl sm:p-7">
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,rgba(255,255,255,.045),transparent_34%)]" />
        <div className="relative mb-4 flex items-start gap-3">
          <span className="mt-0.5 rounded-xl border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.1)] p-2 text-[var(--sc-gold-bright)]">
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--sc-stone)]">{chapter.eyebrow}</p>
            <h2 className="font-serif text-2xl font-medium leading-tight text-[var(--sc-ivory)] sm:text-3xl">{chapter.title}</h2>
          </div>
        </div>

        <p className="relative mb-4 leading-7 text-[var(--sc-ivory-soft)]">{chapter.observation}</p>

        {showStandard && (
          <div className="relative space-y-5 border-t border-[var(--sc-line)] pt-5">
            <section>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.13em] text-[var(--sc-violet)]">What this means in plain language</h3>
              <p className="leading-7 text-[var(--sc-ivory-soft)]">{chapter.translation}</p>
            </section>
            <section>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.13em] text-[var(--sc-teal)]">What this may look like in real life</h3>
              <ul className="space-y-2 text-[var(--sc-ivory-soft)]">
                {chapter.dailyLife.map((item) => <li key={item} className="flex gap-2 leading-7"><span aria-hidden="true" className="text-[var(--sc-gold)]">•</span><span>{item}</span></li>)}
              </ul>
            </section>
            <div className="grid gap-4 md:grid-cols-2">
              <section className="rounded-2xl border border-[rgba(114,216,197,.16)] bg-[rgba(114,216,197,.045)] p-4">
                <h3 className="mb-2 font-semibold text-[var(--sc-teal)]">What this gives you</h3>
                <p className="leading-7 text-[var(--sc-ivory-soft)]">{chapter.strength}</p>
              </section>
              <section className="rounded-2xl border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.045)] p-4">
                <h3 className="mb-2 font-semibold text-[var(--sc-gold-bright)]">What it may cost</h3>
                <p className="leading-7 text-[var(--sc-ivory-soft)]">{chapter.cost}</p>
              </section>
            </div>
            <section className="rounded-2xl border border-[var(--sc-line)] bg-white/[0.035] p-4">
              <h3 className="mb-2 font-semibold text-[var(--sc-ivory-soft)]">How this may be misunderstood</h3>
              <p className="leading-7 text-[var(--sc-ivory-soft)]">{chapter.misunderstanding}</p>
            </section>
          </div>
        )}

        {showDeep && (
          <div className="relative mt-5 space-y-5 border-t border-[var(--sc-line)] pt-5">
            <section>
              <h3 className="mb-2 font-semibold text-[var(--sc-violet)]">How other people may experience it</h3>
              <p className="leading-7 text-[var(--sc-ivory-soft)]">{chapter.relationshipView}</p>
            </section>
            <section>
              <h3 className="mb-2 font-semibold text-[var(--sc-gold-bright)]">What changes under stress</h3>
              <p className="leading-7 text-[var(--sc-ivory-soft)]">{chapter.stressView}</p>
            </section>
            <section>
              <h3 className="mb-2 font-semibold text-[var(--sc-teal)]">What to do with this insight</h3>
              <p className="leading-7 text-[var(--sc-ivory-soft)]">{chapter.practicalTakeaway}</p>
            </section>
            <section className="rounded-2xl border border-[rgba(154,116,220,.2)] bg-[rgba(154,116,220,.05)] p-4">
              <h3 className="mb-2 font-semibold text-[#e4d9fa]">Reflection check</h3>
              <p className="leading-7 text-[var(--sc-ivory)]">{chapter.reflection}</p>
            </section>
            <section className="rounded-2xl border border-[rgba(114,216,197,.2)] bg-[rgba(114,216,197,.05)] p-4">
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-[#c9f2e6]"><CheckCircle2 aria-hidden="true" className="h-4 w-4" /> One grounded move</h3>
              <p className="leading-7 text-[var(--sc-ivory)]">{chapter.action}</p>
            </section>
          </div>
        )}

        <section className="relative mt-5 border-t border-[var(--sc-line)] pt-5" aria-label={`Does ${chapter.title.toLowerCase()} fit your experience?`}>
          <p className="mb-3 text-sm font-semibold text-[var(--sc-ivory-soft)]">Does this fit your experience?</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Reading fit feedback">
            {fitOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onFit(option.value)}
                aria-pressed={fit === option.value}
                className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sc-gold)] ${fit === option.value ? "border-[var(--sc-line-gold)] bg-[linear-gradient(145deg,rgba(217,182,111,.18),rgba(154,116,220,.06))] text-[var(--sc-gold-bright)] shadow-[0_8px_24px_rgba(217,182,111,.12)]" : "border-[var(--sc-line)] bg-white/[0.02] text-[var(--sc-stone)] hover:bg-white/[0.05]"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {fit && <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">Saved on this device. Your response corrects the interpretation; it does not rewrite your birth data or pretend the app knows more than you do.</p>}
        </section>
      </div>
    </article>
  );
}

export default function ClarityReadingExperience({ profileId, profileName, model, offline = false }: ClarityReadingExperienceProps) {
  const [depth, setDepth] = useState<ReadingDepth>("standard");
  const [fits, setFits] = useState<FitMap>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem(`soulcodex:reading-fit:${profileId}`) ?? "{}") as FitMap;
    } catch {
      return {};
    }
  });
  const chapters = useMemo(() => buildDepthChapters(model, fits), [model, fits]);

  const recordFit = (chapterId: string, fit: ReadingFit) => {
    const next = { ...fits, [chapterId]: fit };
    setFits(next);
    try {
      window.localStorage.setItem(`soulcodex:reading-fit:${profileId}`, JSON.stringify(next));
    } catch {
      // The reading remains usable when storage is unavailable.
    }
  };

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6" aria-labelledby="clarity-reading-title">
      <Link href={getProfilePath(profileId)} className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-[var(--sc-stone)] transition hover:bg-white/5 hover:text-[var(--sc-ivory)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sc-gold)]">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        {offline ? "Local profile and evidence" : "Full profile and evidence"}
      </Link>

      <header className="mb-8 max-w-4xl">
        <p className="sc-eyebrow mb-3">{offline ? "Offline human-depth reading" : "Human-depth reading"}</p>
        <h1 id="clarity-reading-title" className="sc-display sc-display-gradient mb-5 text-4xl sm:text-6xl lg:text-7xl">{profileName}, let&apos;s follow the pattern into real life.</h1>
        <p className="max-w-3xl text-lg leading-8 text-[var(--sc-stone)]">{model.summary}</p>
      </header>

      <section aria-labelledby="core-synthesis-title" className="sc-panel sc-panel-gold relative mb-6 overflow-hidden p-6 sm:p-9">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          aria-hidden="true"
          style={{ background: "radial-gradient(circle at 92% 5%, rgba(154,116,220,.16), transparent 31%), radial-gradient(circle at 14% 100%, rgba(217,182,111,.06), transparent 25%)" }}
        />
        <div className="relative mb-4 flex items-center gap-3 text-[var(--sc-gold-bright)]"><Sparkles aria-hidden="true" className="h-5 w-5" /><span className="text-[11px] font-bold uppercase tracking-[0.18em]">Core synthesis</span></div>
        <h2 id="core-synthesis-title" className="relative mb-4 font-serif text-3xl font-medium text-[var(--sc-ivory)] sm:text-5xl">{model.title}</h2>
        <p className="relative max-w-3xl text-base leading-8 text-[var(--sc-stone)]">The goal is not to hand you another list of traits. Each chapter follows the pattern into decisions, work, relationships, stress, misunderstanding, tradeoffs, and one action you can test.</p>
        {model.coreContradiction && (
          <div className="relative mt-6 rounded-2xl border border-[rgba(154,116,220,.2)] bg-[rgba(154,116,220,.06)] p-4 sm:p-5" aria-label="Cross-system tension">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#d6c8f5]">Cross-system tension</p>
            <p className="max-w-3xl leading-7 text-[var(--sc-ivory-soft)]">{model.coreContradiction}</p>
            <p className="mt-3 text-xs leading-5 text-[var(--sc-stone)]">A tension means two supported symbolic themes can coexist. It is not proof of an inner conflict, diagnosis, or fixed identity.</p>
          </div>
        )}
      </section>

      <section aria-label="Reading depth" className="mb-6 rounded-2xl border border-[var(--sc-line)] bg-white/[0.035] p-4">
        <p className="mb-3 text-sm font-semibold text-[var(--sc-ivory-soft)]">Choose how far to go</p>
        <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="Choose reading depth">
          {(["quick", "standard", "deep"] as ReadingDepth[]).map((option) => (
            <button key={option} type="button" onClick={() => setDepth(option)} aria-pressed={depth === option} className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sc-gold)] ${depth === option ? "border-[var(--sc-line-gold)] bg-[linear-gradient(145deg,rgba(217,182,111,.18),rgba(154,116,220,.06))] text-[var(--sc-gold-bright)] shadow-[0_8px_24px_rgba(217,182,111,.12)]" : "border-[var(--sc-line)] bg-white/[0.02] text-[var(--sc-stone)] hover:bg-white/[0.05]"}`}>
              {option === "quick" ? "Quick insight" : option === "standard" ? "Standard reading" : "Deep dive"}
            </button>
          ))}
        </div>
      </section>

      <section aria-label="Human-depth reading chapters" className="mb-6 grid gap-5">
        {chapters.map((chapter, index) => (
          <DepthChapterCard
            key={chapter.id}
            chapter={chapter}
            depth={depth}
            index={index}
            fit={fits[chapter.id]}
            onFit={(fit) => recordFit(chapter.id, fit)}
          />
        ))}
      </section>

      <section aria-labelledby="evidence-title" className="rounded-2xl border border-[var(--sc-line)] bg-white/[0.035] p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-[var(--sc-teal)]"><ShieldCheck aria-hidden="true" className="h-5 w-5" /><h2 id="evidence-title" className="font-semibold text-[var(--sc-ivory)]">Evidence remains inspectable</h2></div>
        <p className="mb-4 text-sm leading-6 text-[var(--sc-stone)]">Depth does not grant certainty. Open the details to inspect sources, confidence, and unresolved limits.</p>
        <details className="group rounded-xl border border-[var(--sc-line)] bg-black/20 p-4">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg text-sm font-semibold text-[var(--sc-ivory-soft)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--sc-gold)]">Evidence and confidence details<ChevronDown aria-hidden="true" className="h-4 w-4 text-[var(--sc-gold)] transition group-open:rotate-180" /></summary>
          <div className="pt-4">
            {model.signals.length > 0 ? <ul className="mb-5 grid gap-2 sm:grid-cols-2" aria-label="Reading evidence signals">{model.signals.map((signal) => <li key={signal.id} className={`rounded-xl border px-3 py-2.5 text-sm ${confidenceClass[signal.confidence]}`}><div><span className="font-semibold">{signal.label}:</span> {signal.value}</div><div className="mt-1 text-xs opacity-70">{signal.confidence} · {signal.source}</div></li>)}</ul> : <p className="mb-5 text-[var(--sc-stone)]">No supported summary signals are available.</p>}
            <h3 className="mb-2 text-sm font-semibold text-[var(--sc-ivory-soft)]">Limits and corrections</h3>
            <ul className="space-y-2 text-sm leading-6 text-[var(--sc-stone)]">{model.limitations.map((limitation) => <li key={limitation} className="flex gap-2"><span aria-hidden="true" className="text-[var(--sc-gold)]">•</span><span>{limitation}</span></li>)}</ul>
          </div>
        </details>
      </section>
    </main>
  );
}
