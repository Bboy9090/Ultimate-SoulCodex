import { Link } from "wouter";
import { Capacitor } from "@capacitor/core";
import { Check, Crown, ShieldCheck } from "lucide-react";
import Navigation from "@/components/navigation";

const foundationFeatures = [
  "One active profile with your supported Big 3",
  "Life Path and date-based numerology",
  "A limited daily synthesis with up to three qualified influences",
  "Basic Connections and one bounded relationship comparison",
  "Why am I seeing this? evidence and uncertainty",
  "Diamond Way clarity, depth, and one next move",
];

const plannedPremiumFeatures = [
  "Everything in Free",
  "Full natal chart: planets, houses, aspects, Midheaven, Nodes, and Chiron when verified",
  "Full governed numerology from your complete birth name",
  "Verified Human Design Type, Strategy, Authority, Profile, centers, and channels",
  "Daily synthesis with up to five strongest influences",
  "Advanced transits, Timeline history, and deeper timing intelligence",
  "Full multi-system Connections: communication, emotional rhythm, attraction, life direction, and Human Design context",
  "Advanced Diamond Way readings, richer exports, and premium share formats",
];

export default function PricingPage() {
  const isNative = Capacitor.isNativePlatform();

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
            Free gives you a real Soul Codex experience. Soul Codex+ unlocks more depth, continuity, and cross-system intelligence without changing the accuracy standard.
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
              {isNative
                ? "Monthly and annual Soul Codex+ access will activate only after StoreKit / Play Billing and durable entitlement verification pass release gates."
                : "Soul Codex+ will use monthly and annual plans once the verified subscription path is enabled. Pricing comes from the active store catalog, not hard-coded app logic."}
            </p>
            <FeatureList features={plannedPremiumFeatures} />
            <div className="mt-auto rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-center text-sm font-semibold text-[var(--sc-stone)]">
              Soul Codex+ · activation pending billing certification
            </div>
          </article>
        </section>

        <section className="sc-panel mt-4 p-6 sm:p-8">
          <div className="sc-eyebrow">Clear answers</div>
          <h2 className="mt-2 font-serif text-3xl font-semibold">Access FAQ</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Faq question="Do I need to recreate my profile?" answer="No. Identity, Reading, Timeline, and Compatibility reuse the same saved profile." />
            <Faq question="What does Soul Codex+ actually unlock?" answer="More depth and continuity: full qualified chart layers, richer daily intelligence, deeper Connections, verified Human Design detail, advanced Timeline history, and premium synthesis. Accuracy is never paywalled." />
            <Faq question="Where would card details be entered?" answer="Soul Codex does not contain raw card-number, expiration, CVC, or CVV fields. The server also rejects those fields if they are sent to retired or hosted-checkout boundaries." />
            <Faq question="Why is purchasing unavailable here?" answer={isNative ? "This native release candidate exposes no purchase action until StoreKit / Play Billing, restore, revocation, and durable entitlement verification pass." : "The paid layer is defined, but purchase activation remains a separate release gate. The app will not imply an active subscription path before billing truth is verified."} />
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
