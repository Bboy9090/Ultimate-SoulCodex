import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import type { OfflineCodexProfile } from "@soulcodex/core";
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
import { loadOfflineProfile } from "@/lib/offlineProfileStore";
import { getVerifiedAstrologySign } from "@/lib/profileVerificationReconciliation";

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

export default function OfflineClarityReadingPage() {
  const { id } = useParams();
  const { data: profile, isLoading, error } = useQuery<OfflineCodexProfile>({
    queryKey: ["offline-profile", id],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) throw new Error("Profile id is missing");
      const stored = await loadOfflineProfile(id);
      if (!stored) throw new Error("Offline profile not found on this device");
      return stored;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090610] text-white">
        <Navigation />
        <main className="flex min-h-screen items-center justify-center px-5 pt-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-2 border-white/15 border-t-amber-300" />
            <p className="text-white/60">Opening the clarity reading stored on this device...</p>
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
          <h1 className="mb-3 font-serif text-4xl">This local reading is unavailable.</h1>
          <p className="mb-7 text-white/60">Soul Codex will not manufacture a replacement when the saved profile cannot be found.</p>
          <Link href="/create" className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-5 py-3 font-semibold text-black">
            Create a local Codex <ArrowRight className="h-4 w-4" />
          </Link>
        </main>
      </div>
    );
  }

  const astrology = profile.astrologyData as any;
  const numerology = profile.numerologyData as any;
  const archetype = profile.archetypeData as any;
  const depth = profile.depthInterpretation as any;
  const verifiedAstrology = (profile as any).verifiedAstrologyData;

  const title = firstText(depth?.claritySummary?.title, archetype.title) ?? "Your evolving pattern";
  const summary = firstText(depth?.claritySummary?.summary, profile.biography, archetype.description)!;
  const strength = firstText(depth?.gift?.summary, archetype.strengths?.[0], "A strength becomes useful when it produces a clear decision rather than another layer of analysis.")!;
  const shadow = firstText(depth?.shadow?.summary, archetype.shadows?.[0], "The same strength can become costly when it is overused or used to avoid a necessary choice.")!;
  const protection = firstText(depth?.protectiveFunction?.summary, depth?.hiddenNeed?.summary, "This pattern may protect stability, dignity, belonging, certainty, or emotional safety. Your lived context decides which explanation fits.")!;
  const relationship = firstText(depth?.relationshipImpact?.summary, "In relationships, name the need or boundary directly instead of requiring another person to decode it.")!;
  const action = firstText(depth?.action?.summary, profile.dailyGuidance, "Replace one automatic response with one direct sentence and one observable action, then record what actually happened.")!;

  const verifiedSun = getVerifiedAstrologySign(verifiedAstrology, "sun");
  const verifiedMoon = getVerifiedAstrologySign(verifiedAstrology, "moon");
  const verifiedRising = getVerifiedAstrologySign(verifiedAstrology, "rising");
  const supportedSignals = [
    verifiedSun && `${verifiedSun} Sun · verified`,
    verifiedMoon && `${verifiedMoon} Moon · verified`,
    verifiedRising && `${verifiedRising} Rising · verified`,
    numerology.lifePath && `Life Path ${numerology.lifePath} · deterministic`,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_-10%,rgba(106,61,170,.32),transparent_36%),linear-gradient(180deg,#090610,#0d0917_52%,#08060d)] text-white">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
        <Link href={`/profile/${profile.id}`} className="mb-8 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Local profile and evidence
        </Link>

        <header className="mb-9 max-w-4xl">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">Offline clarity reading</p>
            <span className="rounded-full border border-teal-300/20 bg-teal-300/5 px-3 py-1 text-xs text-teal-200">Saved on this device</span>
          </div>
          <h1 className="mb-5 font-serif text-5xl leading-[0.96] tracking-tight sm:text-7xl">{profile.name}, this is the pattern worth understanding.</h1>
          <p className="max-w-3xl text-lg leading-8 text-white/68">{summary}</p>
        </header>

        <section className="mb-6 rounded-3xl border border-amber-300/30 bg-gradient-to-br from-violet-950/75 to-black/45 p-6 shadow-2xl backdrop-blur sm:p-9">
          <div className="mb-4 flex items-center gap-3 text-amber-300">
            <Sparkles className="h-5 w-5" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Core synthesis</span>
          </div>
          <h2 className="mb-4 font-serif text-3xl sm:text-5xl">{title}</h2>
          <p className="max-w-3xl text-base leading-8 text-white/70">This local reading uses the evidence already stored on your device. Missing or unverified layers stay unresolved rather than being quietly promoted into facts.</p>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-2">
          <ReadingCard eyebrow="What people may notice" title="The visible strength" body={strength} icon={Eye} />
          <ReadingCard eyebrow="What may be underneath" title="The protective function" body={protection} icon={ShieldCheck} tone="violet" />
          <ReadingCard eyebrow="The gift" title="What this pattern can become" body={strength} icon={Gift} tone="teal" />
          <ReadingCard eyebrow="The cost" title="When the strength turns against you" body={shadow} icon={Target} />
          <ReadingCard eyebrow="Connection" title="How it may affect relationships" body={relationship} icon={HeartHandshake} tone="violet" />
          <ReadingCard eyebrow="Grounded action" title="One move to test today" body={action} icon={CheckCircle2} tone="teal" />
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-teal-300">
            <ShieldCheck className="h-5 w-5" />
            <h2 className="font-semibold">Local evidence remains inspectable</h2>
          </div>
          {supportedSignals.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {supportedSignals.map((signal) => (
                <span key={signal} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70">{signal}</span>
              ))}
            </div>
          ) : (
            <p className="mb-4 text-white/60">No independently verified astronomy signals are stored yet. Deterministic and symbolic layers remain labeled accordingly.</p>
          )}
          <p className="text-sm leading-6 text-white/50">Symbolic overlap is context, not independent proof. Approximate or unknown birth-time layers remain uncertain. Lived experience is the final correction layer.</p>
        </section>
      </main>
    </div>
  );
}
