import { Link } from "wouter";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pb-12 pt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center sm:mb-16">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Foundation Web
            </p>
            <h1 className="mb-4 text-4xl font-bold">Soul Codex Access</h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Start with the complete web foundation. Premium, when available,
              adds downloadable report tools without pretending every planned
              mystical system has already passed verification.
            </p>
          </div>

          <div className="mb-16 grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Foundation Reading</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create one profile and use the core web journey
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-3xl font-bold">Free</div>
                <FeatureList features={freeFeatures} />
                <Link href="/create">
                  <Button variant="outline" className="w-full">
                    Create Your Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <div className="cosmic-border mystical-glow">
              <Card className="cosmic-border-inner border-0 bg-transparent">
                <CardHeader>
                  <div className="mb-2 flex items-center space-x-2">
                    <CardTitle className="text-2xl">Premium Report Tools</CardTitle>
                    <Crown className="h-6 w-6 text-accent" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Availability and exact price are confirmed before purchase
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="text-2xl font-bold">
                      Price shown at secure checkout
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      One-time payment when hosted checkout is enabled
                    </p>
                  </div>
                  <FeatureList features={premiumFeatures} />
                  <Link href="/create">
                    <Button className="w-full bg-primary text-primary-foreground">
                      Create a Profile First
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          <section className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-2xl font-bold">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
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

          <section className="mx-auto mt-10 flex max-w-3xl gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
            <p className="m-0 text-sm leading-relaxed text-muted-foreground">
              Premium access is activated only after a signature-verified paid
              checkout event. No fake success screen, no card form disguised as
              a spiritual experience, and no entitlement stored only in memory.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="space-y-3">
      {features.map((feature) => (
        <li key={feature} className="flex items-start space-x-3">
          <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

function Faq({ question, answer }: { question: string; answer: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{question}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{answer}</p>
      </CardContent>
    </Card>
  );
}
