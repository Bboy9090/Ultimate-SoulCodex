import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  Gift,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import Navigation from "@/components/navigation";
import type { Profile } from "@shared/schema";

type ReadingCardProps = {
  eyebrow: string;
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "gold" | "violet" | "teal";
};

const toneClass = {
  gold: "text-amber-300 border-amber-300/20",
  violet: "text-violet-300 border-violet-300/20",
  teal: "text-teal-300 border-teal-300/20",
};

function ReadingCard({ eyebrow, title, body, icon: Icon, tone = "gold" }: ReadingCardProps) {
  return (
    <article className={`rounded-2xl border bg-black/20 p-5 sm:p-6 backdrop-blur ${toneClass[tone]}`}>
      <Icon className="mb-4 h-5 w-5" />
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">{eyebrow}</p>
      <h2 className="mb-3 font-serif text-2xl leading-tight text-white">{title}</h2>
      <p className="leading-7 text-white/68">{body}</p>
    </article>
  );
}

function firstText(...values: unknown[]): string | undefined {
  return values.find((value) => typeof value === "string" && value.trim().length > 0) as string | undefined;
}

export default function ClarityReadingPage() {
  const { id } = useParams();
  const { data: profile, isLoading, error } = useQuery<Profile>({
    queryKey: ["/api/profiles", id],
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090610] text-white">
        <Navigation />
        <main className="flex min-h-screen items-center justify-center px-5 pt-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-2 border-white/15 border-t-amber-300" />
            <p className="text-white/60">Building the clearest supported reading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#090610] text-white">
        <Navigation />
        <main className="mx-auto max-w-xl px-5 pb-20 pt-32 text-center">
          <ShieldCheck className="mx-auto mb-5 h-10 w-10 text-amber-300" />
          <h1 className="mb-3 font-serif text-4xl">This reading could not be loaded.</h1>
          <p className="mb-7 text-white/60">No interpretation should be invented when the profile itself is unavailable.</p>
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-5 py-3 font-semibold text-black">
            Return home <ArrowRight className="h-4 w-4" />
          </Link>
        </main>
      </div>
    );
  }

  const astrology = (profile.astrologyData ?? {}) as any;
  const numerology = (profile.numerologyData ?? {}) as any;
  const personality = (profile.personalityData ?? {}) as any;
  const archetype = (profile.archetypeData ?? {}) as any;

  const title = firstText(archetype.title, archetype.name) ?? "Your evolving pattern";
  const summary = firstText(
    profile.biography,
    archetype.description,
    "Your available profile contains symbolic and calculated signals that should be tested against lived experience rather than treated as fixed identity.",
  )!;

  const strength = firstText(
    archetype.strengths?.[0],
    archetype.gifts?.[0],
    "You may be especially effective when reflection becomes a practical decision rather than endless analysis.",
  )!;
  const shadow = firstText(
    archetype.shadows?.[0],
    archetype.growthAreas?.[0],
    "A useful strength can become costly when it is overused, performed for approval, or used to avoid a necessary choice.",
  )!;
  const protection = firstText(
    archetype.protectiveFunction,
    archetype.hiddenNeed,
    "This pattern may be protecting stability, dignity, belonging, certainty, or emotional safety. The profile cannot prove which one without your lived context.",
  )!;
  const relationship = firstText(
    archetype.relationshipImpact,
    personality.relationshipStyle,
    "In relationships, the central task is to name needs and boundaries directly instead of expecting other people to decode them.",
  )!;

  const verifiedSignals = [
    astrology.sunSign && `${astrology.sunSign} Sun`,
    astrology.moonSign && `${astrology.moonSign} Moon`,
    astrology.risingSign && `${astrology.risingSign} Rising`,
    numerology.lifePath && `Life Path ${numerology.lifePath}`,
    personality.enneagram?.type && `Enneagram ${personality.enneagram.type}`,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_-10%,rgba(106,61,170,.32),transparent_36%),linear-gradient(180deg,#090610,#0d0917_52%,#08060d)] text-white">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
        <Link href={`/profile/${profile.id}`} className="mb-8 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Full profile and evidence
        </Link>

        <header className="mb-9 max-w-4xl">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">Clarity reading</p>
          <h1 className="mb-5 font-serif text-5xl leading-[0.96] tracking-tight sm:text-7xl">{profile.name}, this is the pattern worth understanding.</h1>
          <p className="max-w-3xl text-lg leading-8 text-white/68">{summary}</p>
        </header>

        <section className="mb-6 rounded-3xl border border-amber-300/30 bg-gradient-to-br from-violet-950/75 to-black/45 p-6 shadow-2xl backdrop-blur sm:p-9">
          <div className="mb-4 flex items-center gap-3 text-amber-300">
            <Sparkles className="h-5 w-5" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Core synthesis</span>
          </div>
          <h2 className="mb-4 font-serif text-3xl sm:text-5xl">{title}</h2>
          <p className="max-w-3xl text-base leading-8 text-white/70">
            The purpose of this reading is not to force you into a label. It is to show the likely pattern, what it may protect, what it gives you, what it costs, and the next choice you can test in real life.
          </p>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-2">
          <ReadingCard eyebrow="What people may notice" title="The visible strength" body={strength} icon={Eye} />
          <ReadingCard eyebrow="What may be underneath" title="The protective function" body={protection} icon={ShieldCheck} tone="violet" />
          <ReadingCard eyebrow="The gift" title="What this pattern can become" body={strength} icon={Gift} tone="teal" />
          <ReadingCard eyebrow="The cost" title="When the strength turns against you" body={shadow} icon={Target} tone="gold" />
          <ReadingCard eyebrow="Connection" title="How it may affect relationships" body={relationship} icon={HeartHandshake} tone="violet" />
          <ReadingCard
            eyebrow="Grounded action"
            title="One move to test today"
            body="Choose one situation where you usually over-explain, delay, perform, withdraw, or take over. Replace the automatic move with one direct sentence and one observable action. Then record what actually happened."
            icon={CheckCircle2}
            tone="teal"
          />
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-teal-300">
            <ShieldCheck className="h-5 w-5" />
            <h2 className="font-semibold">Evidence remains inspectable</h2>
          </div>
          {verifiedSignals.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {verifiedSignals.map((signal) => (
                <span key={signal} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70">
                  {signal}
                </span>
              ))}
            </div>
          ) : (
            <p className="mb-4 text-white/60">No supported summary signals were available to display here.</p>
          )}
          <p className="text-sm leading-6 text-white/50">
            Symbolic overlap is supporting context, not independent proof. Unknown or approximate birth-time inputs must remain visibly uncertain. Lived experience is the final correction layer.
          </p>
        </section>
      </main>
    </div>
  );
}
