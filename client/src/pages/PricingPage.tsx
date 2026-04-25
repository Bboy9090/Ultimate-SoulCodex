import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': any;
    }
  }
}

export default function PricingPage() {
  const isIOS = Capacitor.getPlatform() === "ios";

  useEffect(() => {
    if (!isIOS) {
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/pricing-table.js";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isIOS]);

  if (isIOS) {
    return (
      <div className="min-h-screen bg-background p-6 pt-24">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <Link href="/profile">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
          
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-4">
              <Zap className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Unlock Premium Access</h1>
            <p className="text-muted-foreground text-lg">
              Unlock your full 30-40 page PDF dossier, unlimited Soul Guide access, and the complete Codex reading.
            </p>
          </div>

          <div className="glassmorphism p-8 space-y-6">
            <h2 className="text-xl font-semibold">Native iOS Purchases</h2>
            <p className="text-sm text-muted-foreground">
              Apple requires in-app purchases for digital content on iOS. We are currently finalizing our App Store integration. 
            </p>
            <div className="p-4 border border-dashed border-accent/30 rounded-lg bg-accent/5">
              <p className="text-accent font-medium">Coming soon to the App Store!</p>
            </div>
            <p className="text-xs text-muted-foreground italic">
              If you have an access code, you can still redeem it on your profile page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/profile">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
          <div className="flex items-center space-x-2 text-accent">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-medium">Secure Payment via Stripe</span>
          </div>
        </div>

        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-bold gradient-text flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-accent" />
            Choose Your Path
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience the full depth of the Soul Codex with a one-time premium unlock.
          </p>
        </div>

        <div className="glassmorphism p-2 rounded-2xl overflow-hidden shadow-2xl bg-white/5">
          <stripe-pricing-table 
            pricing-table-id="prctbl_1TPy11RvQgCiyIfsNPfxSnUI"
            publishable-key={import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY}
          ></stripe-pricing-table>
        </div>
      </div>
    </div>
  );
}
