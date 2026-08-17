import { Link } from "wouter";
import Navigation from "@/components/navigation";
import { Check, Crown, ShieldCheck } from "lucide-react";

const freeFeatures = [
  "One local-first profile that reopens offline",
  "Verified tropical Sun, Moon, and Rising when exact required inputs exist",
  "Numerology and current-cycle context",
  "Essential, Complete, and Technical reading modes",
  "Timeline and compatibility journeys that reuse your saved profile",
  "Inspectable evidence, uncertainty, and limitations",
];

const premiumFeatures = [
  "Everything in the Foundation reading",
  "Downloadable personalized Soul Codex PDF report",
  "Verified Big Three summary with provenance",
  "Numerology and archetype synthesis in one report",
  "Lifetime access to the premium report tools included at purchase",
];

export default function PricingPage() {
  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="sc-page">
        <div className="mb-14 text-center sm:mb-16">
          <p className="sc-eyebrow justify-center">Foundation Web</p>
          <h1 className="sc-display sc-display-gradient mt-3">Soul Codex Access</h1>
          <p className="sc-lede mx-auto mt-5 max-w-2xl">
            Start with the complete web foundation. Premium, when available, adds downloadable report tools without pretending every planned mystical system has already passed verification.
          </p>
        </div>

        <div className="mb-16 grid gap-6 md:grid-cols-2">
          <div className="sc-panel p-7 sm:p-8">
            <h2 className="font-serif text-2xl font-semibold text-[var(--sc-ivory)]">Foundation Reading</h2>
            <p className="mt-2 text-sm text-[var(--sc-stone)]">Create one profile and use the core web journey</p>
            <div className="mt-6 font-serif text-4xl font-medium text-[var(--sc-ivory)]">Free</div>
            <FeatureList features={freeFeatures} />
            <Link href="/create" className="mt-7 flex min-h-[46px] items-center justify-center rounded-xl border border-[var(--sc-line)] bg-white/[0.02] px-4 text-sm font-semibold text-[var(--sc-ivory-soft)] no-underline transition hover:border-[var(--sc-line-gold)] hover:bg-white/[0.04]">
              Create Your Profile
            </Link>
          </div>

          <div className="relative rounded-[1.4rem] p-px shadow-[0_28px_80px_rgba(0,0,0,.32)] [background:linear-gradient(140deg,rgba(239,208,141,.75)_0%,rgba(154,116,220,.45)_50%,rgba(255,255,255,.06)_100%)]">
            <div className="relative overflow-hidden rounded-[calc(1.4rem-1px)] p-7 sm:p-8 [background:radial-gradient(circle_at_88%_6%,rgba(154,116,220,.2),transparent_38%),linear-gradient(150deg,rgba(30,22,44,.97),rgba(11,8,16,.99))]">
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,rgba(255,255,255,.06),transparent_36%)]" />
              <div className="relative">
                <div className="mb-2 flex items-center gap-2.5">
                  <h2 className="font-serif text-2xl font-semibold text-[var(--sc-ivory)]">Premium Report Tools</h2>
                  <Crown className="h-6 w-6 text-[var(--sc-gold-bright)]" style={{ filter: "drop-shadow(0 0 8px rgba(217,182,111,.4))" }} />
                </div>
                <p className="text-sm text-[var(--sc-stone)]">Availability and exact price are confirmed before purchase</p>
                <div className="mt-6">
                  <div className="font-serif text-2xl font-medium text-[var(--sc-gold-bright)]">Price shown at secure checkout</div>
                  <p className="mt-2 text-sm text-[var(--sc-stone)]">One-time payment when hosted checkout is enabled</p>
                </div>
                <FeatureList features={premiumFeatures} gold />
                <Link href="/create" className="sc-button-primary mt-7 w-full justify-center">
                  Create a Profile First
                </Link>
              </div>
            </div>
          </div>
        </div>

        <section className="mx-auto max-w-3xl">
          <p className="sc-eyebrow justify-center">Questions</p>
          <h2 className="mt-2 text-center font-serif text-3xl font-semibold text-[var(--sc-ivory)]">Frequently Asked Questions</h2>
          <div className="mt-8 space-y-3">
            <Faq
              question="Is premium a subscription?"
              answer="The current hosted web checkout is designed as a one-time purchase. The exact price and included report tools are shown before payment."
            />
            <Faq
              question="Where do I enter payment details?"
              answer="On Stripe's hosted checkout page only. Soul Codex does not collect, transmit, log, or store card numbers, security codes, or expiration dates."
            />
            <Faq
              question="Why might checkout be unavailable?"
              answer="Checkout stays disabled unless Stripe and persistent database storage are both configured. That prevents a paid entitlement from disappearing after a server restart."
            />
            <Faq
              question="Does premium include every planned system?"
              answer="No. Houses, Midheaven, nodes, Chiron, planetary house placements, and Human Design interpretation remain outside Foundation v1 until their own verification contracts pass."
            />
            <Faq
              question="Do I need to recreate my profile?"
              answer="No. Identity, Reading, Timeline, Compatibility, and eligible premium report tools reuse the same saved profile."
            />
          </div>
        </section>

        <section className="mx-auto mt-10 flex max-w-3xl gap-3 rounded-2xl border border-[rgba(114,216,197,.22)] bg-[rgba(114,216,197,.05)] p-5">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--sc-teal)]" />
          <p className="m-0 text-sm leading-relaxed text-[var(--sc-stone)]">
            Premium access is activated only after a signature-verified paid checkout event. No fake success screen, no card form disguised as a spiritual experience, and no entitlement stored only in memory.
          </p>
        </section>
      </main>
    </div>
  );
}

function FeatureList({ features, gold }: { features: string[]; gold?: boolean }) {
  return (
    <ul className="mt-6 space-y-3">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-3">
          <Check className={`mt-0.5 h-5 w-5 flex-shrink-0 ${gold ? "text-[var(--sc-gold-bright)]" : "text-[var(--sc-teal)]"}`} />
          <span className="text-sm leading-6 text-[var(--sc-ivory-soft)]">{feature}</span>
        </li>
      ))}
    </ul>
  );
}

function Faq({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-2xl border border-[var(--sc-line)] bg-white/[0.018] p-5">
      <h3 className="font-serif text-lg font-semibold text-[var(--sc-ivory)]">{question}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{answer}</p>
    </div>
  );
}
