import { Link } from "wouter";
import { Check, Crown, ShieldCheck } from "lucide-react";
import Navigation from "@/components/navigation";
import SoulCodexPlusBillingPanel from "@/components/SoulCodexPlusBillingPanel";

const foundationFeatures = [
  "One active profile with your supported Big 3",
  "Life Path and date-based numerology",
  "A limited daily synthesis with up to three qualified influences",
  "Basic Connections and one bounded relationship comparison",
  "Why am I seeing this? evidence and uncertainty",
  "Diamond Way clarity, depth, and one next move",
];

const livePremiumFeatures = [
  "Everything in Free",
  "Full governed numerology: Expression, Soul Urge, Personality, and Maturity when a complete birth name is available",
  "Verified Human Design Type, Strategy, Authority, and Profile",
  "Daily synthesis with up to five qualified current influences",
  "Evidence-aware downloadable natal PDF report",
];

const roadmapFeatures = [
  "Full natal chart premium surface: all qualified planets, houses, aspects, Midheaven, Nodes, and Chiron",
  "Human Design centers, channels, and deeper interaction synthesis",
  "Advanced transits and Timeline history",
  "Five-dimension multi-system Connections",
  "Premium personalized tarot/card generation",
];

export default function PricingPage() {
  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="sc-page max-w-6xl">
        <header className="mx-auto max-w-4xl text-center">
          <div className="sc-eyebrow">Access</div>
          <h1 className="mt-4 font-serif text-[clamp(3rem,8vw,5.5rem)] font-medium leading-[.97] tracking-[-.04em] text-[var(--sc-ivory)]">
            Start with the Foundation.
          </h1>
          <p className="sc-lede mx-auto mt-5 max-w-3xl">
            Free gives you a real Soul Codex experience. Soul Codex+ unlocks the additional qualified capabilities listed below without changing the accuracy standard.
          </p>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="sc-panel sc-panel-gold flex flex-col p-6 sm:p-8">
            <div className="sc-eyebrow">Core clarity</div>
            <h2 className="mt-3 font-serif text-3xl font-semibold">Free</h2>
            <div className="mt-4 text-3xl font-semibold text-[var(--sc-gold-bright)]">Free</div>
            <FeatureList features={foundationFeatures} />
            <Link href="/create" className="sc-button-primary mt-auto w-full">
              Create profile
            </Link>
          </article>

          <article className="sc-panel flex flex-col p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <div className="sc-eyebrow">Deeper intelligence</div>
              <Crown className="h-4 w-4 text-[var(--sc-gold)]" aria-hidden="true" />
            </div>
            <h2 className="mt-3 font-serif text-3xl font-semibold">Soul Codex+</h2>
            <p className="mt-4 text-sm leading-6 text-[var(--sc-stone)]">
              Soul Codex+ uses the same accuracy standard as Free. Purchase availability and localized pricing come from the qualified platform billing path rather than hard-coded app values.
            </p>
            <FeatureList features={livePremiumFeatures} />
            <SoulCodexPlusBillingPanel />
          </article>
        </section>

        <section className="sc-panel mt-4 p-6 sm:p-8">
          <div className="sc-eyebrow">Roadmap · not sold yet</div>
          <h2 className="mt-2 font-serif text-3xl font-semibold">Planned, not included in the current paid promise</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--sc-stone)]">
            These features stay outside Soul Codex+ until their complete UI, evidence boundary, entitlement gate, and regression coverage are live.
          </p>
          <FeatureList features={roadmapFeatures} />
        </section>

        <section className="sc-panel mt-4 p-6 sm:p-8">
          <div className="sc-eyebrow">Clear answers</div>
          <h2 className="mt-2 font-serif text-3xl font-semibold">Access FAQ</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Faq question="Do I need to recreate my profile?" answer="No. Identity, Reading, Timeline, and Compatibility reuse the same saved profile." />
            <Faq question="What does Soul Codex+ actually unlock?" answer="Only the capabilities listed as included now: full-name numerology, verified Human Design core, up to five qualified Daily influences, and the evidence-aware natal PDF report. Roadmap features are shown separately and are not sold yet. Accuracy is never paywalled." />
            <Faq question="When does paid access begin?" answer="Only after the payment provider's signed subscription evidence is verified by Soul Codex and creates a valid durable entitlement. A return page or local flag never grants Plus." />
            <Faq question="Where are card details entered?" answer="Soul Codex does not contain raw card-number, expiration, CVC, or CVV fields. When a qualified purchase path is active, payment details stay on the approved provider or app-store surface." />
          </div>
        </section>

        <section className="mt-4 flex gap-3 rounded-2xl border border-[rgba(114,216,197,.18)] bg-[rgba(114,216,197,.05)] p-4 text-sm text-[var(--sc-stone)]">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sc-teal)]" />
          <p className="m-0 leading-6">
            <strong className="text-[var(--sc-ivory-soft)]">Billing boundary:</strong> premium entitlement may only follow a verified paid event through an approved purchase path. A client-side success screen never grants premium by itself.
          </p>
        </section>
      </main>
    </div>
  );
}

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="my-6 space-y-3 text-sm text-[var(--sc-stone)]">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-3">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sc-teal)]" />
          <span className="leading-6">{feature}</span>
        </li>
      ))}
    </ul>
  );
}

function Faq({ question, answer }: { question: string; answer: string }) {
  return (
    <article className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
      <h3 className="m-0 font-serif text-lg font-semibold text-[var(--sc-ivory)]">{question}</h3>
      <p className="mb-0 mt-2 text-sm leading-6 text-[var(--sc-stone)]">{answer}</p>
    </article>
  );
}
