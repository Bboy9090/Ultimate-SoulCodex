import { Link } from "wouter";
import Navigation from "@/components/navigation";
import { loadActiveProfile } from "../lib/ActiveProfileRepository";
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  Orbit,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

function getProfileIdentity(profile: any) {
  const id = profile?.id ?? profile?.uuid;
  const name = profile?.name ?? profile?.codename ?? profile?.firstName ?? "there";
  return { id, name };
}

export default function Home() {
  const result = loadActiveProfile();
  const profile = result.profile;
  const { id, name } = getProfileIdentity(profile);
  const identityHref = id ? `/profile/${id}` : "/create";
  const readingHref = id ? `/reading/${id}` : "/create";

  const destinations = [
    {
      href: identityHref,
      icon: UserRound,
      label: "Identity",
      title: "Who am I?",
      description: "Your core profile, calculated systems, and evidence status in one coherent map.",
      accent: "gold",
    },
    {
      href: readingHref,
      icon: BookOpen,
      label: "Reading",
      title: "Why do I operate this way?",
      description: "Patterns, protective functions, hidden needs, gifts, costs, and grounded next moves.",
      accent: "violet",
    },
    {
      href: "/timeline",
      icon: Orbit,
      label: "Timeline",
      title: "Where am I now?",
      description: "Current cycles, pressure points, timing context, and what deserves your attention today.",
      accent: "blue",
    },
    {
      href: "/compatibility",
      icon: HeartHandshake,
      label: "Compatibility",
      title: "How do I connect?",
      description: "Connection, friction, communication, repair, and growth beyond a shallow score.",
      accent: "teal",
    },
  ] as const;

  const accentClass = {
    gold: "text-[var(--sc-gold-bright)] border-[rgba(217,182,111,.20)] bg-[rgba(217,182,111,.07)]",
    violet: "text-[#b79ae4] border-[rgba(154,116,220,.20)] bg-[rgba(154,116,220,.07)]",
    blue: "text-[#88b5ee] border-[rgba(100,151,217,.20)] bg-[rgba(100,151,217,.07)]",
    teal: "text-[var(--sc-teal)] border-[rgba(114,216,197,.20)] bg-[rgba(114,216,197,.07)]",
  };

  return (
    <div className="sc-app-shell">
      <Navigation />

      <main className="sc-page">
        <section className="grid items-center gap-10 pb-10 pt-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14 lg:pb-14 lg:pt-10">
          <div className="max-w-[820px]">
            <div className="sc-eyebrow mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              Soul Codex · Clarity Engine
            </div>

            <h1 className="sc-display sc-display-gradient max-w-[900px]">
              {profile ? (
                <>
                  Welcome back,
                  <br />
                  {name}.
                </>
              ) : (
                <>
                  Know yourself.
                  <br />
                  Keep the mystery.
                </>
              )}
            </h1>

            <p className="sc-lede mt-6 max-w-[720px]">
              {profile
                ? "Your profile is already here. Continue from what you know, inspect what is still uncertain, and go one layer deeper without starting over."
                : "A living identity map across astrology, numerology, Human Design, behavior, timing, and relationships, built to explain patterns without pretending every pattern is a fact."}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={profile ? readingHref : identityHref} className="sc-button-primary">
                {profile ? "Continue your reading" : "Build my Soul Profile"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={profile ? identityHref : "/compatibility"} className="sc-button-secondary">
                {profile ? "Open identity map" : "Explore what it connects"}
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <span className="sc-trust-chip">
                <ShieldCheck className="h-3.5 w-3.5" />
                Evidence-aware
              </span>
              <span className="rounded-full border border-white/[0.065] bg-white/[0.018] px-3 py-1.5 text-[11px] font-medium text-[var(--sc-stone)]">
                Local-first profile
              </span>
              <span className="rounded-full border border-white/[0.065] bg-white/[0.018] px-3 py-1.5 text-[11px] font-medium text-[var(--sc-stone)]">
                Uncertainty stays visible
              </span>
            </div>
          </div>

          <div className="hidden justify-self-center lg:block" aria-hidden="true">
            <div className="sc-orbital-seal">
              <span className="sc-orbit-ring" />
              <span className="sc-orbit-ring" />
              <span className="sc-orbit-dot" />
              <EyeGlyph />
            </div>
          </div>
        </section>

        <section className="sc-panel sc-panel-gold mb-5 overflow-hidden px-5 py-6 sm:px-7 sm:py-7 lg:px-9 lg:py-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(circle at 92% 5%, rgba(154,116,220,.16), transparent 31%), radial-gradient(circle at 14% 100%, rgba(217,182,111,.06), transparent 25%)",
            }}
          />
          <div className="relative grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <div className="sc-eyebrow mb-3">Today’s clarity</div>
              <h2 className="m-0 max-w-[820px] font-serif text-[clamp(1.7rem,4vw,2.85rem)] font-medium leading-[1.12] tracking-[-.025em] text-[var(--sc-ivory)]">
                Depth is useful only when it leaves you with a clearer next move.
              </h2>
              <p className="mb-0 mt-3 max-w-[760px] text-sm leading-7 text-[var(--sc-stone)] sm:text-[15px]">
                One honest pattern. One limit worth respecting. One action small enough to test in real life.
                The Codex is here to sharpen your judgment, not replace it.
              </p>
            </div>
            <Link
              href={profile ? readingHref : identityHref}
              className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-[var(--sc-gold-bright)] no-underline hover:text-white"
            >
              {profile ? "Go deeper" : "Begin here"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Soul Codex destinations">
          {destinations.map(({ href, icon: Icon, label, title, description, accent }) => (
            <Link
              key={label}
              href={href}
              className="sc-panel sc-card-link flex min-h-[238px] flex-col p-5 text-[var(--sc-ivory)] no-underline sm:p-5.5"
            >
              <span className={`mb-8 grid h-10 w-10 place-items-center rounded-xl border ${accentClass[accent]}`}>
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[var(--sc-stone)]">
                {label}
              </div>
              <h2 className="m-0 font-serif text-[1.36rem] font-semibold leading-tight tracking-[-.015em]">
                {title}
              </h2>
              <p className="mb-0 mt-3 text-[13px] leading-[1.65] text-[var(--sc-stone)]">
                {description}
              </p>
              <span className="mt-auto flex items-center gap-1.5 pt-5 text-[11px] font-semibold text-[var(--sc-ivory-soft)]">
                Open layer <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-5 grid gap-4 rounded-[1.35rem] border border-white/[0.065] bg-white/[0.018] p-5 sm:grid-cols-[auto_1fr] sm:items-start sm:p-6">
          <div className="sc-icon-well">
            <ShieldCheck className="h-[18px] w-[18px] text-[var(--sc-teal)]" strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="m-0 font-serif text-xl font-semibold tracking-[-.015em] text-[var(--sc-ivory)]">
              Human meaning first. Evidence always within reach.
            </h2>
            <p className="mb-0 mt-2 max-w-[860px] text-[13px] leading-6 text-[var(--sc-stone)] sm:text-sm">
              Calculated results, independent verification, inference, missing data, and limitations stay distinct.
              A possibility never gets polished into certainty just because certainty looks prettier on a screen.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function EyeGlyph() {
  return (
    <div className="relative z-10 grid h-20 w-20 place-items-center rounded-full border border-[rgba(239,208,141,.20)] bg-[rgba(10,8,16,.62)] shadow-[0_0_45px_rgba(217,182,111,.10)]">
      <div className="relative h-8 w-12 rounded-[50%] border border-[var(--sc-gold-bright)] opacity-90">
        <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--sc-gold-bright)] shadow-[0_0_14px_rgba(239,208,141,.55)]" />
      </div>
    </div>
  );
}
