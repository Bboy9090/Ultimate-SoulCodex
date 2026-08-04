import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  Crown,
  ExternalLink,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";

interface PremiumUpgradeModalProps {
  profileId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

type CheckoutResponse = {
  url?: string;
  alreadyPremium?: boolean;
  message?: string;
  code?: string;
};

export function PremiumUpgradeModal({
  profileId,
  onClose,
  onSuccess,
}: PremiumUpgradeModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleUpgrade = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${profileId}`,
        },
        credentials: "include",
        body: JSON.stringify({ profileId }),
      });

      const payload = (await response
        .json()
        .catch(() => ({}))) as CheckoutResponse;

      if (!response.ok) {
        throw new Error(
          payload.message || "Secure checkout could not be started",
        );
      }

      if (payload.alreadyPremium) {
        await queryClient.invalidateQueries({
          queryKey: ["/api/profiles", profileId],
        });
        toast({
          title: "Premium already active",
          description: "This profile already has premium access.",
        });
        onClose();
        onSuccess?.();
        return;
      }

      if (!payload.url) {
        throw new Error("Secure checkout did not return a destination");
      }

      window.location.assign(payload.url);
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : "Secure checkout is temporarily unavailable";
      setError(message);
      toast({
        title: "Checkout unavailable",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          <button
            type="button"
            aria-label="Close premium dialog"
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="mb-4 flex items-center space-x-2">
            <Crown className="h-6 w-6 text-accent" />
            <CardTitle>Unlock Premium</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-2xl font-bold">One-time purchase</div>
            <p className="text-sm text-muted-foreground">
              The exact price is confirmed before payment on secure checkout.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground">
              Current premium access
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Downloadable personalized Soul Codex PDF report</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Evidence-traceable verified Big Three summary</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Numerology and archetype synthesis in one report</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Lifetime access to included premium report tools</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
              <div>
                <h3 className="text-sm font-semibold">Hosted Stripe Checkout</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Payment details are entered on Stripe's hosted checkout page.
                  Soul Codex does not collect, transmit, log, or store card
                  numbers, security codes, or expiration dates.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Button
              type="button"
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening secure checkout...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Continue to secure checkout
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="w-full"
            >
              Not now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
