import { Link } from "wouter";
import { Capacitor } from "@capacitor/core";
import { Check, Crown, ShieldCheck } from "lucide-react";
import Navigation from "@/components/navigation";

const foundationFeatures = [
  "One local-first profile that reopens offline",
  "Verified astronomy only when the required inputs and evidence contract support it",
  "Deterministic numerology with symbolic interpretation kept distinct",
  "Reading, Timeline, and Compatibility that reuse the same Identity",
  "Inspectable evidence, uncertainty, exclusions, and limitations",
];

const plannedPremiumFeatures = [
  "Everything in the Foundation experience",
  "Downloadable personalized Soul Codex report tools",
  "Evidence-aware Big Three and numerology synthesis",
  "Additional report/export features only after their release gates pass",
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
            The current release keeps the core Identity, Reading, Timeline, and Compatibility journey available without pretending planned premium systems are already complete.
          </p>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="sc-panel sc-panel-gold flex flex-col p-6 sm:p-8">
            <div className="sc-eyebrow">Available now</div>
            <h2 className="mt-3 font-serif text-3xl font-semibold">Foundation</h2>
            <div className="mt-4 text-3xl font-semibold text-[var(--sc-gold-bright)]">Free</div>
            <FeatureList features={foundationFeatures} />
            <Link href="/create" className="sc-button-primary mt-auto w-full">
              Create profile
            </Link>
          </article>

          <article className="sc-panel flex flex-col p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <div className="sc-eyebrow">Planned expansion</div>
              <Crown className="h-4 w-4 text-[var(--sc-gold)]" aria-hidden="true" />
            </div>
            <h2 className="mt-3 font-serif text-3xl font-semibold">Premium report tools</h2>
            <p className="mt-4 text-sm leading-6 text-[var(--sc-stone)]">
              {isNative
                ? "Purchasing is not enabled in this native release candidate. No external checkout link or card-entry flow is exposed here."
                : "Premium purchasing is not part of this release candidate. Price and included tools will be shown only when the purchase path itself has passed its release and platform gates."}
            </p>
            <FeatureList features={plannedPremiumFeatures} />
            <div className="mt-auto rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-center text-sm font-semibold text-[var(--sc-stone)]">
              Not available for purchase in rc.3
            </div>
          </article>
        </section>

        <section className="sc-panel mt-4 p-6 sm:p-8">
          <div className="sc-eyebrow">Clear answers</div>
          <h2 className="mt-2 font-serif text-3xl font-semibold">Access FAQ</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Faq question="Do I need to recreate my profile?" answer="No. Identity, Reading, Timeline, and Compatibility reuse the same saved profile." />
            <Faq question="Does premium include every planned system?" answer="No. A system appears only after its calculation, evidence, privacy, and release contracts pass. Planned work is not sold as implemented work." />
            <Faq question="Where would card details be entered?" answer="Soul Codex does not contain raw card-number, expiration, CVC, or CVV fields. The server also rejects those fields if they are sent to retired or hosted-checkout boundaries." />
            <Faq question="Why is purchasing unavailable here?" answer={isNative ? "This native release candidate intentionally exposes no purchase action while distribution and platform-specific purchase requirements are still being qualified." : "The Foundation release is being qualified first. Premium purchase activation is a separate release decision and is not implied by this page."} />
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
