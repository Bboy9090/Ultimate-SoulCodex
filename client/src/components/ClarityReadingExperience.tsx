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
} from "@/lib/depthEngine";
import { getProfilePath } from "@/lib/clarityNavigation";

type ClarityReadingExperienceProps = {
  profileId: string;
  profileName: string;
  model: ClarityReadingModel;
  offline?: boolean;
};

const confidenceClass: Record<ClarityConfidence, string> = {
  verified: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  deterministic: "border-sky-300/25 bg-sky-300/10 text-sky-100",
  supported: "border-violet-300/25 bg-violet-300/10 text-violet-100",
  tentative: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  unavailable: "border-white/10 bg-white/5 text-white/50",
};

const chapterIcons = [Eye, ShieldCheck, Gift, Target, HeartHandshake];

function DepthChapterCard({ chapter, depth, index }: { chapter: DepthChapter; depth: ReadingDepth; index: number }) {
  const Icon = chapterIcons[index] ?? Sparkles;
  const showStandard = depth === "standard" || depth === "deep";
  const showDeep = depth === "deep";

  return (
    <article className="rounded-3xl border border-white/10 bg-black/25 p-5 shadow-xl backdrop-blur sm:p-7">
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 rounded-xl border border-amber-300/20 bg-amber-300/10 p-2 text-amber-300">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">{chapter.eyebrow}</p>
          <h2 className="font-serif text-2xl leading-tight text-white sm:text-3xl">{chapter.title}</h2>
        </div>
      </div>

      <p className="mb-4 leading-7 text-white/75">{chapter.observation}</p>

      {showStandard && (
        <div className="space-y-5 border-t border-white/10 pt-5">
          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.13em] text-violet-200">What this means in plain language</h3>
            <p className="leading-7 text-white/68">{chapter.translation}</p>
          </section>
          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.13em] text-teal-200">How it may show up</h3>
            <ul className="space-y-2 text-white/65">
              {chapter.dailyLife.map((item) => <li key={item} className="flex gap-2 leading-7"><span aria-hidden="true">•</span><span>{item}</span></li>)}
            </ul>
          </section>
          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-2xl border border-teal-300/15 bg-teal-300/[0.04] p-4">
              <h3 className="mb-2 font-semibold text-teal-200">Healthy strength</h3>
              <p className="leading-7 text-white/65">{chapter.strength}</p>
            </section>
            <section className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-4">
              <h3 className="mb-2 font-semibold text-amber-200">Cost when overused</h3>
              <p className="leading-7 text-white/65">{chapter.cost}</p>
            </section>
          </div>
        </div>
      )}

      {showDeep && (
        <div className="mt-5 space-y-5 border-t border-white/10 pt-5">
          <section>
            <h3 className="mb-2 font-semibold text-violet-200">How other people may experience it</h3>
            <p className="leading-7 text-white/65">{chapter.relationshipView}</p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold text-amber-200">What changes under stress</h3>
            <p className="leading-7 text-white/65">{chapter.stressView}</p>
          </section>
          <section className="rounded-2xl border border-violet-300/20 bg-violet-300/[0.05] p-4">
            <h3 className="mb-2 font-semibold text-violet-100">Reflection check</h3>
            <p className="leading-7 text-white/75">{chapter.reflection}</p>
          </section>
          <section className="rounded-2xl border border-teal-300/20 bg-teal-300/[0.05] p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-teal-100"><CheckCircle2 aria-hidden="true" className="h-4 w-4" /> One grounded move</h3>
            <p className="leading-7 text-white/75">{chapter.action}</p>
          </section>
        </div>
      )}
    </article>
  );
}

export default function ClarityReadingExperience({ profileId, profileName, model, offline = false }: ClarityReadingExperienceProps) {
  const [depth, setDepth] = useState<ReadingDepth>("standard");
  const chapters = useMemo(() => buildDepthChapters(model), [model]);

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6" aria-labelledby="clarity-reading-title">
      <Link href={getProfilePath(profileId)} className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        {offline ? "Local profile and evidence" : "Full profile and evidence"}
      </Link>

      <header className="mb-8 max-w-4xl">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">{offline ? "Offline depth reading" : "Depth reading"}</p>
        <h1 id="clarity-reading-title" className="mb-5 font-serif text-4xl leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">{profileName}, let&apos;s explain the pattern instead of naming it.</h1>
        <p className="max-w-3xl text-lg leading-8 text-white/70">{model.summary}</p>
      </header>

      <section aria-labelledby="core-synthesis-title" className="mb-6 rounded-3xl border border-amber-300/30 bg-gradient-to-br from-violet-950/75 to-black/45 p-6 shadow-2xl backdrop-blur sm:p-9">
        <div className="mb-4 flex items-center gap-3 text-amber-300"><Sparkles aria-hidden="true" className="h-5 w-5" /><span className="text-[11px] font-bold uppercase tracking-[0.18em]">Core synthesis</span></div>
        <h2 id="core-synthesis-title" className="mb-4 font-serif text-3xl sm:text-5xl">{model.title}</h2>
        <p className="max-w-3xl text-base leading-8 text-white/70">This reading separates observation from interpretation, then follows the pattern into daily life, strengths, costs, relationships, stress, reflection, and action.</p>
      </section>

      <section aria-label="Reading depth" className="mb-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <p className="mb-3 text-sm font-semibold text-white/75">Choose how far to go</p>
        <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="Choose reading depth">
          {(["quick", "standard", "deep"] as ReadingDepth[]).map((option) => (
            <button key={option} type="button" onClick={() => setDepth(option)} aria-pressed={depth === option} className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${depth === option ? "border-amber-300/40 bg-amber-300/15 text-amber-100" : "border-white/10 bg-black/20 text-white/60 hover:bg-white/5"}`}>
              {option === "quick" ? "Quick insight" : option === "standard" ? "Standard reading" : "Deep dive"}
            </button>
          ))}
        </div>
      </section>

      <section aria-label="Depth reading chapters" className="mb-6 grid gap-5">
        {chapters.map((chapter, index) => <DepthChapterCard key={chapter.id} chapter={chapter} depth={depth} index={index} />)}
      </section>

      <section aria-labelledby="evidence-title" className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-teal-300"><ShieldCheck aria-hidden="true" className="h-5 w-5" /><h2 id="evidence-title" className="font-semibold">Evidence remains inspectable</h2></div>
        <p className="mb-4 text-sm leading-6 text-white/55">Depth does not grant certainty. Open the details to inspect sources, confidence, and unresolved limits.</p>
        <details className="group rounded-xl border border-white/10 bg-black/20 p-4">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg text-sm font-semibold text-white/80 outline-none focus-visible:ring-2 focus-visible:ring-amber-300">Evidence and confidence details<ChevronDown aria-hidden="true" className="h-4 w-4 transition group-open:rotate-180" /></summary>
          <div className="pt-4">
            {model.signals.length > 0 ? <ul className="mb-5 grid gap-2 sm:grid-cols-2" aria-label="Reading evidence signals">{model.signals.map((signal) => <li key={signal.id} className={`rounded-xl border px-3 py-2.5 text-sm ${confidenceClass[signal.confidence]}`}><div><span className="font-semibold">{signal.label}:</span> {signal.value}</div><div className="mt-1 text-xs opacity-70">{signal.confidence} · {signal.source}</div></li>)}</ul> : <p className="mb-5 text-white/60">No supported summary signals are available.</p>}
            <h3 className="mb-2 text-sm font-semibold text-white/75">Limits and corrections</h3>
            <ul className="space-y-2 text-sm leading-6 text-white/55">{model.limitations.map((limitation) => <li key={limitation} className="flex gap-2"><span aria-hidden="true">•</span><span>{limitation}</span></li>)}</ul>
          </div>
        </details>
      </section>
    </main>
  );
}
