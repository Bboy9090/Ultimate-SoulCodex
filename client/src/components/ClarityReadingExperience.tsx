import { Link } from "wouter";
import {
  ArrowLeft,
  CheckCircle2,
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

type ReadingCardProps = {
  eyebrow: string;
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "gold" | "violet" | "teal";
};

type ClarityReadingExperienceProps = {
  profileId: string;
  profileName: string;
  model: ClarityReadingModel;
  offline?: boolean;
};

const toneClass = {
  gold: "text-amber-300 border-amber-300/20",
  violet: "text-violet-300 border-violet-300/20",
  teal: "text-teal-300 border-teal-300/20",
};

const confidenceClass: Record<ClarityConfidence, string> = {
  verified: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  deterministic: "border-sky-300/25 bg-sky-300/10 text-sky-100",
  supported: "border-violet-300/25 bg-violet-300/10 text-violet-100",
  tentative: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  unavailable: "border-white/10 bg-white/5 text-white/50",
};

function ReadingCard({ eyebrow, title, body, icon: Icon, tone = "gold" }: ReadingCardProps) {
  return (
    <article
      className={`rounded-2xl border bg-black/20 p-5 backdrop-blur sm:p-6 ${toneClass[tone]}`}
    >
      <Icon aria-hidden="true" className="mb-4 h-5 w-5" />
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
        {eyebrow}
      </p>
      <h2 className="mb-3 font-serif text-2xl leading-tight text-white">{title}</h2>
      <p className="leading-7 text-white/70">{body}</p>
    </article>
  );
}

export default function ClarityReadingExperience({
  profileId,
  profileName,
  model,
  offline = false,
}: ClarityReadingExperienceProps) {
  return (
    <main
      id="main-content"
      className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6"
      aria-labelledby="clarity-reading-title"
    >
      <Link
        href={`/profile/${profileId}`}
        className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        {offline ? "Local profile and evidence" : "Full profile and evidence"}
      </Link>

      <header className="mb-9 max-w-4xl">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">
            {offline ? "Offline clarity reading" : "Clarity reading"}
          </p>
          {offline && (
            <span className="rounded-full border border-teal-300/20 bg-teal-300/5 px-3 py-1 text-xs text-teal-200">
              Saved on this device
            </span>
          )}
        </div>
        <h1
          id="clarity-reading-title"
          className="mb-5 font-serif text-4xl leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl"
        >
          {profileName}, this is the pattern worth understanding.
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-white/70">{model.summary}</p>
      </header>

      <section
        aria-labelledby="core-synthesis-title"
        className="mb-6 rounded-3xl border border-amber-300/30 bg-gradient-to-br from-violet-950/75 to-black/45 p-6 shadow-2xl backdrop-blur sm:p-9"
      >
        <div className="mb-4 flex items-center gap-3 text-amber-300">
          <Sparkles aria-hidden="true" className="h-5 w-5" />
          <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
            Core synthesis
          </span>
        </div>
        <h2 id="core-synthesis-title" className="mb-4 font-serif text-3xl sm:text-5xl">
          {model.title}
        </h2>
        <p className="max-w-3xl text-base leading-8 text-white/70">
          {offline
            ? "This reading uses evidence stored on your device. Missing or unverified layers stay unresolved rather than being quietly promoted into facts."
            : "This reading separates supported patterns from certainty. It shows what the pattern may protect, what it gives you, what it costs, and a next choice you can test in real life."}
        </p>
      </section>

      <section aria-label="Clarity reading chapters" className="mb-6 grid gap-4 md:grid-cols-2">
        <ReadingCard
          eyebrow="What people may notice"
          title="The visible pattern"
          body={model.visiblePattern}
          icon={Eye}
        />
        <ReadingCard
          eyebrow="What may be underneath"
          title="The protective function"
          body={model.protectiveFunction}
          icon={ShieldCheck}
          tone="violet"
        />
        <ReadingCard
          eyebrow="The gift"
          title="What this pattern can become"
          body={model.gift}
          icon={Gift}
          tone="teal"
        />
        <ReadingCard
          eyebrow="The cost"
          title="When the strength turns against you"
          body={model.cost}
          icon={Target}
        />
        <ReadingCard
          eyebrow="Connection"
          title="How it may affect relationships"
          body={model.relationshipImpact}
          icon={HeartHandshake}
          tone="violet"
        />
        <ReadingCard
          eyebrow="Grounded action"
          title="One move to test today"
          body={model.groundedAction}
          icon={CheckCircle2}
          tone="teal"
        />
      </section>

      <section
        aria-labelledby="evidence-title"
        className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6"
      >
        <div className="mb-4 flex items-center gap-2 text-teal-300">
          <ShieldCheck aria-hidden="true" className="h-5 w-5" />
          <h2 id="evidence-title" className="font-semibold">
            {offline ? "Local evidence remains inspectable" : "Evidence remains inspectable"}
          </h2>
        </div>

        {model.signals.length > 0 ? (
          <ul className="mb-5 flex flex-wrap gap-2" aria-label="Reading evidence signals">
            {model.signals.map((signal) => (
              <li
                key={signal.id}
                className={`rounded-full border px-3 py-1.5 text-sm ${confidenceClass[signal.confidence]}`}
                title={`Source: ${signal.source}`}
              >
                <span className="font-medium">{signal.label}:</span> {signal.value}
                <span className="ml-1 opacity-70">· {signal.confidence}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-5 text-white/60">No supported summary signals are available.</p>
        )}

        <h3 className="mb-2 text-sm font-semibold text-white/75">Limits and corrections</h3>
        <ul className="space-y-2 text-sm leading-6 text-white/55">
          {model.limitations.map((limitation) => (
            <li key={limitation} className="flex gap-2">
              <span aria-hidden="true">•</span>
              <span>{limitation}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
