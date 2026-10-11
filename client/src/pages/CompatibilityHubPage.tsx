import { Link } from "wouter";
import Navigation from "../components/navigation";
import { tierAllowsCapability } from "@shared/product-access";
import FeatureState from "../components/FeatureState";
import AurelionPlanetaryMatcher from "../components/AurelionPlanetaryMatcher";
import { useActiveProfile } from "../hooks/useActiveProfile";
import { useProductAccess } from "../hooks/useProductAccess";
import {
  ArrowRight,
  Heart,
  HeartHandshake,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

const DIMENSIONS = [
  {
    icon: MessageCircleMore,
    title: "Communication",
    text: "How each person processes, expresses, and translates ideas. Free keeps a bounded symbolic comparison; deeper Mercury-to-Mercury and aspect context belongs to Soul Codex+.",
    premium: false,
  },
  {
    icon: Heart,
    title: "Emotional rhythm",
    text: "Moon patterns, emotional pacing, stress response, and what each person may need when pressure rises.",
    premium: true,
  },
  {
    icon: Sparkles,
    title: "Attraction & chemistry",
    text: "Venus–Mars and other qualified attraction signals without turning chemistry into a relationship verdict.",
    premium: true,
  },
  {
    icon: Wrench,
    title: "Life direction",
    text: "Numerology timing, long-range priorities, recurring themes, and where two trajectories reinforce or challenge each other.",
    premium: true,
  },
  {
    icon: HeartHandshake,
    title: "Human Design context",
    text: "Type, Strategy, Authority, Profile, and interaction context only when both Human Design records are verified.",
    premium: true,
  },
] as const;

function profileName(profile: any) {
  return profile?.name || profile?.firstName || profile?.codename || "Your";
}

function sunSign(profile: any) {
  return profile?.astrologyData?.sun?.sign
    ?? profile?.astrologyData?.sunSign
    ?? profile?.astrology?.sun?.sign
    ?? profile?.astrology?.sunSign
    ?? profile?.sunSign
    ?? null;
}

function lifePath(profile: any) {
  return profile?.lifePathNumber
    ?? profile?.numerologyData?.lifePathNumber
    ?? profile?.numerologyData?.lifePath
    ?? profile?.numerology?.lifePath?.value
    ?? null;
}

export default function CompatibilityHubPage() {
  const { profile, isLoading, isCorrupted, reason } = useActiveProfile();
  const { tier } = useProductAccess();
  const advancedConnections = tierAllowsCapability(tier, "advanced_connections");

  if (isLoading) {
    return (
      <div className="sc-app-shell">
        <Navigation />
        <main className="sc-page">
          <FeatureState
            kind="loading"
            title="Loading Compatibility"
            description="Opening the same saved Identity used by the rest of Soul Codex."
          />
        </main>
      </div>
    );
  }

  if (isCorrupted) {
    return (
      <div className="sc-app-shell">
        <Navigation />
        <main className="sc-page">
          <FeatureState
            kind="error"
            title="Your saved profile needs attention"
            description={reason || "Compatibility will not guess from a corrupted or incompatible saved profile."}
          />
          <Link href="/create" className="sc-button-primary mt-4">Create profile</Link>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="sc-app-shell">
        <Navigation />
        <main className="sc-page max-w-4xl">
          <section className="sc-panel sc-panel-gold p-7 text-center sm:p-10">
            <HeartHandshake className="mx-auto h-10 w-10 text-[var(--sc-gold)]" aria-hidden="true" />
            <div className="sc-eyebrow mt-5">Relationship intelligence</div>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-[var(--sc-ivory)] sm:text-5xl">
              Compatibility starts with one saved Identity.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[var(--sc-stone)]">
              Create one profile. Identity, Reading, Timeline, and Compatibility reuse it without asking you to rebuild yourself on every screen.
            </p>
            <Link href="/create" className="sc-button-primary mt-6">
              Create profile <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const savedSun = sunSign(profile);
  const savedLifePath = lifePath(profile);
  const profileId = profile.id;

  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="sc-page">
        <header className="grid items-end gap-8 pb-8 pt-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="max-w-4xl">
            <div className="sc-eyebrow">Relationship intelligence</div>
            <h1 className="mt-4 font-serif text-[clamp(3rem,8vw,6rem)] font-medium leading-[.96] tracking-[-.04em] text-[var(--sc-ivory)]">
              {profileName(profile)} Compatibility
            </h1>
            <p className="sc-lede mt-5 max-w-3xl">
              Start with a useful free comparison, then go deeper across communication, emotional rhythm, attraction, life direction, and verified Human Design context. No universal verdict.
            </p>
          </div>

          <aside className="sc-panel p-5" aria-label="Compatibility formula coverage">
            <p className="m-0 text-[10px] font-bold uppercase tracking-[.16em] text-[var(--sc-stone)]">Used by Foundation Compatibility</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="sc-trust-chip">Sun: {savedSun || "unavailable"}</span>
              <span className="sc-trust-chip">Life Path: {savedLifePath ?? "unavailable"}</span>
            </div>
            <p className="mb-0 mt-4 text-xs leading-5 text-[var(--sc-stone)]">
              Moon, Rising, houses, and Human Design may exist elsewhere in Identity, but they are <strong className="text-[var(--sc-ivory-soft)]">not used in this Foundation formula</strong>.
            </p>
          </aside>
        </header>

        <div className="mb-5">
          <AurelionPlanetaryMatcher profile={profile} />
        </div>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Compatibility dimensions">
          {DIMENSIONS.map(({ icon: Icon, title, text, premium }, index) => (
            <article key={title} className="sc-panel flex min-h-[220px] flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="sc-icon-well"><Icon className="h-[18px] w-[18px]" aria-hidden="true" /></span>
                <span className="font-mono text-xs text-[var(--sc-stone)]">{premium && !advancedConnections ? "PLUS" : `0${index + 1}`}</span>
              </div>
              <h2 className="mb-0 mt-7 font-serif text-xl font-semibold text-[var(--sc-ivory)]">{title}</h2>
              <p className="mb-0 mt-3 text-sm leading-6 text-[var(--sc-stone)]">{text}</p>
              {premium && !advancedConnections ? (
                <span className="mt-auto pt-5 text-sm font-semibold text-[var(--sc-stone)]">
                  Planned · not included in current Soul Codex+
                </span>
              ) : null}
            </article>
          ))}
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <Link href="/compatibility/explorer" className="sc-panel sc-panel-gold sc-card-link p-6 text-[var(--sc-ivory)] no-underline">
            <span className="sc-icon-well"><Sparkles className="h-5 w-5" /></span>
            <div className="sc-eyebrow mt-5">Explore patterns</div>
            <h2 className="mt-3 font-serif text-3xl font-semibold">All-sign Compatibility map</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--sc-stone)]">
              Free keeps a bounded symbolic comparison available. The deeper five-dimension relationship model remains planned and is not included in the current Soul Codex+ promise until its end-to-end evidence path ships.
            </p>
            <strong className="mt-6 inline-flex items-center gap-2 text-sm text-[var(--sc-gold-bright)]">Open Compatibility map <ArrowRight className="h-4 w-4" /></strong>
          </Link>

          <Link href="/compatibility/compare" className="sc-panel sc-card-link p-6 text-[var(--sc-ivory)] no-underline" data-testid="compatibility-compare-person">
            <span className="sc-icon-well"><Users className="h-5 w-5" /></span>
            <div className="sc-eyebrow mt-5">Compare a person</div>
            <h2 className="mt-3 font-serif text-3xl font-semibold">One bounded comparison</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--sc-stone)]">
              Keep your saved Identity loaded and add only the other person’s symbolic Sun sign for the current Foundation model.
            </p>
            <strong className="mt-6 inline-flex items-center gap-2 text-sm text-[var(--sc-gold-bright)]">Compare a person <ArrowRight className="h-4 w-4" /></strong>
          </Link>
        </section>

        <section className="mt-4 flex gap-3 rounded-2xl border border-[rgba(114,216,197,.18)] bg-[rgba(114,216,197,.05)] p-4 text-sm text-[var(--sc-stone)]">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sc-teal)]" aria-hidden="true" />
          <p className="m-0 leading-6">
            <strong className="text-[var(--sc-ivory-soft)]">Symbolic model.</strong> Scores organize relationship themes; they do not measure the probability of love, compatibility, health, or destiny.
          </p>
        </section>

        {profileId ? (
          <div className="mt-6 text-center">
            <Link href={`/profile/${profileId}`} className="text-sm text-[var(--sc-stone)] hover:text-[var(--sc-ivory)]">
              Open Identity <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </Link>
          </div>
        ) : null}
      </main>
    </div>
  );
}
