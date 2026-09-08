import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Capacitor } from "@capacitor/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/queryClient";
import {
  Check,
  Crown,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Smartphone,
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
  const nativeStoreBuild = Capacitor.isNativePlatform();

  const handleUpgrade = async () => {
    // rc.3 does not initiate an external digital-goods checkout from inside an
    // App Store / Play Store shell. Store-specific purchase architecture must
    // earn its own policy + entitlement contract before native purchase is
    // enabled. Existing premium entitlement remains readable in native builds.
    if (nativeStoreBuild) {
      setError("Premium purchasing is not enabled inside this native release candidate. Existing premium access remains available.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await apiFetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${profileId}`,
        },
        credentials: "include",
        body: JSON.stringify({ profileId }),
      });

      const payload = (await response.json().catch(() => ({}))) as CheckoutResponse;

      if (!response.ok) {
        throw new Error(payload.message || "Secure checkout could not be started");
      }

      if (payload.alreadyPremium) {
        await queryClient.invalidateQueries({ queryKey: ["/api/profiles", profileId] });
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
      const message = cause instanceof Error ? cause.message : "Secure checkout is temporarily unavailable";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="sc-panel w-full max-w-md border-[var(--sc-line-gold)] bg-[var(--sc-panel)] text-[var(--sc-ivory)]">
        <CardHeader className="relative">
          <button
            type="button"
            aria-label="Close premium dialog"
            onClick={onClose}
            className="absolute right-4 top-4 text-[var(--sc-stone)] hover:text-[var(--sc-ivory)]"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="mb-4 flex items-center space-x-2">
            <Crown className="h-6 w-6 text-[var(--sc-gold)]" />
            <CardTitle>Premium</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="font-serif text-2xl font-semibold">One-time premium access</div>
            <p className="text-sm text-[var(--sc-stone)]">
              {nativeStoreBuild
                ? "Purchase initiation is intentionally unavailable in this native release candidate while store billing is validated."
                : "The exact price is confirmed before payment on secure checkout."}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase text-[var(--sc-stone)]">Included premium access</h3>
            <div className="space-y-2 text-sm">
              {["Downloadable personalized Soul Codex PDF report", "Evidence-traceable verified Big Three summary", "Numerology and archetype synthesis in one report", "Lifetime access to included premium report tools"].map((item) => (
                <div className="flex items-start space-x-3" key={item}>
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#72d6b7]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {nativeStoreBuild ? (
            <div className="rounded-xl border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.05)] p-4">
              <div className="flex items-start gap-3">
                <Smartphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--sc-gold)]" />
                <div>
                  <h3 className="text-sm font-semibold">Native purchase boundary</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--sc-stone)]">
                    This build does not open an external payment page for new digital-premium purchases. Store-specific billing must pass its own review contract before that control is enabled.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[rgba(114,216,183,.25)] bg-[rgba(114,216,183,.05)] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#72d6b7]" />
                <div>
                  <h3 className="text-sm font-semibold">Hosted Stripe Checkout</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--sc-stone)]">
                    Payment details are entered on Stripe&apos;s hosted checkout page. Soul Codex does not collect, transmit, log, or store card numbers, security codes, or expiration dates.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-[rgba(232,138,90,.25)] bg-[rgba(232,138,90,.06)] p-3 text-sm text-[#f0b198]">
              {error}
            </div>
          )}

          <div className="space-y-3 pt-2">
            {!nativeStoreBuild && (
              <Button
                type="button"
                onClick={handleUpgrade}
                disabled={isProcessing}
                className="w-full bg-[var(--sc-gold)] text-[#170f07] hover:brightness-105"
              >
                {isProcessing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Opening secure checkout…</>
                ) : (
                  <><ExternalLink className="mr-2 h-4 w-4" />Continue to secure checkout</>
                )}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing} className="w-full">
              {nativeStoreBuild ? "Close" : "Not now"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
