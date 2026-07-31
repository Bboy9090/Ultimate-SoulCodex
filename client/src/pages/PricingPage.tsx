import { Link } from "wouter";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Soul Codex Pricing</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose the plan that resonates with your spiritual journey
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Free Tier */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Free Soul Reading</CardTitle>
                <p className="text-muted-foreground text-sm mt-2">Perfect for beginners</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-3xl font-bold">Free</div>

                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Astrology Big 3 (Sun, Moon, Rising)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Life Path Number</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Enneagram Type</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Archetype Profile</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Personal Biography</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Daily Cosmic Guidance</span>
                  </li>
                </ul>

                <Link href="/create">
                  <Button variant="outline" className="w-full">
                    Start Free Reading
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Tier */}
            <div className="cosmic-border mystical-glow">
              <Card className="cosmic-border-inner border-0 bg-transparent">
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-2xl">Full Soul Codex</CardTitle>
                    <Crown className="h-6 w-6 text-accent" />
                  </div>
                  <p className="text-muted-foreground text-sm">Complete spiritual blueprint</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-3xl font-bold">
                    $47
                    <span className="text-sm text-muted-foreground font-normal ml-2">one-time</span>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Everything in Free</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Complete astrology charts (Western + Vedic)</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Full Human Design + Gene Keys</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>12+ mystical system integration</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Astrocartography world map</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>AI palmistry analysis</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>30-40 page PDF dossier</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>First-person bio generator</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Personalized rituals & practices</span>
                    </li>
                  </ul>

                  <Link href="/create">
                    <Button className="w-full bg-primary text-primary-foreground">
                      Get Your Full Codex
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is it a subscription?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No. Premium is a one-time $47 payment. No recurring charges. No subscription.
                    Once purchased, it's yours forever.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I upgrade from free to premium?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! Create your free profile first to see your free readings. Then upgrade to
                    premium to unlock all advanced features and download your complete dossier.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We accept all major credit cards (Visa, Mastercard, Amex) through secure payment
                    processing. Your payment information is never stored on our servers.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What if I'm not satisfied?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We offer a 30-day money-back guarantee if you're not completely satisfied with
                    your premium experience. No questions asked.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I use premium on multiple devices?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! Your premium upgrade is tied to your Soul Codex account. You can access it
                    from any device by logging in with your account.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
