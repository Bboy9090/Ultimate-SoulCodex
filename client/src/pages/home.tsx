import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import Navigation from "@/components/navigation";
import DiamondClosure from "../components/DiamondClosure";
import { useActiveProfile } from "../hooks/useActiveProfile";
import {
  compatibilityLink,
  connectionComparableSunSign,
  hasComparableConnectionData,
  loadConnections,
  type SavedConnection,
} from "../lib/connectionRepository";
import {
  ArrowRight,
  HeartHandshake,
  Orbit,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";

function getProfileIdentity(profile: any) {
  const id = profile?.id ?? profile?.uuid;
  const name = profile?.name ?? profile?.codename ?? profile?.firstName ?? "there";
  return { id, name };
}

export default function Home() {
  const { profile, isHydrated, isEmpty } = useActiveProfile();
  const [, setLocation] = useLocation();
  const [connections, setConnections] = useState<SavedConnection[]>([]);

  useEffect(() => {
    if (isHydrated && isEmpty) setLocation("/create");
  }, [isHydrated, isEmpty, setLocation]);

  useEffect(() => {
    const refreshConnections = () => setConnections(loadConnections());
    refreshConnections();
    window.addEventListener("soulcodex:connections-updated", refreshConnections);
    window.addEventListener("storage", refreshConnections);
    return () => {
      window.removeEventListener("soulcodex:connections-updated", refreshConnections);
      window.removeEventListener("storage", refreshConnections);
    };
  }, []);
  if (!isHydrated || isEmpty) {
    return (
      <div className="sc-app-shell">
        <Navigation />
        <main className="sc-page flex min-h-[70vh] items-center justify-center" role="status" aria-live="polite">
          <p className="text-sm text-[var(--sc-stone)]">Opening profile setup…</p>
        </main>
      </div>
    );
  }

  const { id, name } = getProfileIdentity(profile);
  const identityHref = id ? `/profile/${id}` : "/create";
  const readingHref = id ? `/reading/${id}` : "/create";
  const leadConnection = connections.find(hasComparableConnectionData) ?? connections[0] ?? null;
  const circlePreview = connections.slice(0, 4);

  const todayMoves = [
    {
      label: "You",
      title: profile ? "Continue your pattern" : "Create your identity",
      description: profile
        ? "Return to the reading without reopening every system at once."
        : "Start with your own profile so daily and relationship context has a grounded anchor.",
      href: profile ? readingHref : identityHref,
    },
    {
      label: "Timing",
      title: "Check the current cycle",
      description: "Open Timeline for the current symbolic timing context and keep lived events separate from interpretation.",
      href: "/timeline",
    },
    {
      label: "People",
      title: leadConnection ? `Check in with ${leadConnection.name}` : "Build your circle",
      description: leadConnection
        ? hasComparableConnectionData(leadConnection)
          ? "Open the relationship lens using only the chart facts currently saved for this person."
          : "This person is saved locally. Add known chart facts before asking Soul Codex to compare you."
        : "Save friends, partners, or family locally so relationship tools become one tap away.",
      href: leadConnection && hasComparableConnectionData(leadConnection)
        ? compatibilityLink(leadConnection)
        : "/connections",
    },
  ] as const;

  const destinations = [
    {
      href: readingHref,
      icon: UserRound,
      label: "Me",
      title: "Tell me about me.",
      description: "A clean synthesis of your Big 3, core numbers, Human Design, and supported lived patterns. Tap deeper only when you want the machinery.",
      accent: "gold",
    },
    {
      href: "/timeline",
      icon: Orbit,
      label: "Today",
      title: "Tell me about today.",
      description: "Current timing, transits when verified, numerology cycles, and Human Design context resolved into a small number of useful influences.",
      accent: "blue",
    },
    {
      href: "/compatibility",
      icon: HeartHandshake,
      label: "Connections",
      title: "Tell me about me and this person.",
      description: "Communication, emotional rhythm, attraction, life direction, and verified Human Design context without hiding the reasons behind the comparison.",
      accent: "teal",
    },
    {
      href: "/systems",
      icon: ShieldCheck,
      label: "Why",
      title: "Explain why.",
      description: "See what was calculated, what was verified, what is symbolic, what came from your own answers, and what remains unknown.",
      accent: "violet",
    },
  ] as const;

  const accentClass = {
    gold: "text-[var(--sc-gold-bright)] border-[rgba(217,182,111,.20)] bg-[rgba(217,182,111,.07)]",
    violet: "text-[var(--sc-violet)] border-[rgba(154,116,220,.20)] bg-[rgba(154,116,220,.07)]",
    blue: "text-[var(--sc-blue)] border-[rgba(100,151,217,.20)] bg-[rgba(100,151,217,.07)]",
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
                ? "One clean surface for four questions: who you are, what matters today, how you connect, and why the app reached each conclusion."
                : "Soul Codex keeps the machinery deep and the surface simple: Me, Today, Connections, and Why."}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={profile ? readingHref : identityHref} className="sc-button-primary">
                {profile ? "Continue reading" : "Create profile"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={profile ? identityHref : "/compatibility"} className="sc-button-secondary">
                {profile ? "Open Identity" : "Open Compatibility"}
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <span className="sc-trust-chip">
                <ShieldCheck className="h-3.5 w-3.5" />
                Evidence-aware
              </span>
              <span className="rounded-full border border-white/[0.065] bg-white/[0.018] px-3 py-1.5 text-[11px] font-medium text-[var(--sc-stone)]">Local-first profile</span>
              <span className="rounded-full border border-white/[0.065] bg-white/[0.018] px-3 py-1.5 text-[11px] font-medium text-[var(--sc-stone)]">Uncertainty stays visible</span>
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

        <div className="mb-5">
          <DiamondClosure
            clarity={profile?.dailyGuidance || "Start with the strongest supported signal. Ignore the noise. Make one useful move."}
            depth="Today combines only the timing and profile signals that have enough evidence to be shown. Symbolic meaning stays separate from verified calculation."
            nextMove="Open Today, inspect the three to five strongest current influences, then choose one action small enough to test in real life."
            nextHref="/timeline"
            nextLabel="Open Today"
          />
        </div>

        <section className="mb-5 grid gap-4 lg:grid-cols-[1.15fr_.85fr]" aria-label="Daily and social context">
          <div className="sc-panel p-5 sm:p-6">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="sc-eyebrow">Today</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold text-[var(--sc-ivory)]">Three useful ways back in.</h2>
              </div>
              <span className="text-xs text-[var(--sc-stone)]">No forecast required</span>
            </div>
            <div className="grid gap-2.5">
              {todayMoves.map((move) => (
                <Link
                  key={move.label}
                  href={move.href}
                  className="group rounded-xl border border-white/[0.065] bg-white/[0.02] p-4 text-[var(--sc-ivory)] no-underline transition hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="m-0 text-[10px] font-bold uppercase tracking-[.16em] text-[var(--sc-stone)]">{move.label}</p>
                      <h3 className="mt-1.5 font-serif text-lg font-semibold">{move.title}</h3>
                      <p className="mb-0 mt-2 text-[13px] leading-6 text-[var(--sc-stone)]">{move.description}</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--sc-gold)] transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="sc-panel p-5 sm:p-6" data-testid="home-circle-panel">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="sc-eyebrow">Your circle</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold text-[var(--sc-ivory)]">
                  {connections.length ? `${connections.length} saved ${connections.length === 1 ? "person" : "people"}` : "People become part of the environment."}
                </h2>
              </div>
              <UsersRound className="h-5 w-5 text-[var(--sc-teal)]" />
            </div>

            {circlePreview.length ? (
              <div className="grid gap-2">
                {circlePreview.map((connection) => {
                  const sun = connectionComparableSunSign(connection);
                  const comparable = hasComparableConnectionData(connection);
                  const href = comparable ? compatibilityLink(connection) : "/connections";
                  return (
                    <Link
                      key={connection.id}
                      href={href}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] px-3.5 py-3 text-[var(--sc-ivory)] no-underline hover:bg-white/[0.04]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{connection.name}</p>
                        <p className="mt-1 text-xs text-[var(--sc-stone)]">
                          {sun ? `${sun} Sun` : "Chart facts incomplete"} · {connection.placements?.length ?? 0} saved placements
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] font-semibold text-[var(--sc-gold-bright)]">{comparable ? "Compare" : "Complete"}</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/[0.09] bg-white/[0.012] p-4">
                <p className="m-0 text-sm leading-6 text-[var(--sc-stone)]">
                  Add someone you actually know. Soul Codex keeps the person private on this device and leaves unknown chart facts unknown.
                </p>
              </div>
            )}

            <Link href="/connections" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--sc-gold-bright)] no-underline hover:text-white">
              {connections.length ? "Open all people" : "Add your first person"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Soul Codex four core questions">
          {destinations.map(({ href, icon: Icon, label, title, description, accent }) => (
            <Link key={label} href={href} className="sc-panel sc-card-link flex min-h-[238px] flex-col p-5 text-[var(--sc-ivory)] no-underline sm:p-5.5">
              <span className={`mb-8 grid h-10 w-10 place-items-center rounded-xl border ${accentClass[accent]}`}>
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[var(--sc-stone)]">{label}</div>
              <h2 className="m-0 font-serif text-[1.36rem] font-semibold leading-tight tracking-[-.015em]">{title}</h2>
              <p className="mb-0 mt-3 text-[13px] leading-[1.65] text-[var(--sc-stone)]">{description}</p>
              <span className="mt-auto flex items-center gap-1.5 pt-5 text-[11px] font-semibold text-[var(--sc-ivory-soft)]">
                Open {label} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-5 grid gap-4 rounded-[1.35rem] border border-white/[0.065] bg-white/[0.018] p-5 sm:grid-cols-[auto_1fr] sm:items-start sm:p-6">
          <div className="sc-icon-well">
            <ShieldCheck className="h-[18px] w-[18px] text-[var(--sc-teal)]" strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="m-0 font-serif text-xl font-semibold tracking-[-.015em] text-[var(--sc-ivory)]">Why am I seeing this?</h2>
            <p className="mb-0 mt-2 max-w-[860px] text-[13px] leading-6 text-[var(--sc-stone)] sm:text-sm">
              Every surfaced insight must separate verified calculation, deterministic math, symbolic interpretation, self-report, and unresolved data. The machinery stays available without taking over the reading.
            </p>
            <Link href="/systems" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--sc-gold-bright)] no-underline hover:text-white">
              Open evidence and systems <ArrowRight className="h-4 w-4" />
            </Link>
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
