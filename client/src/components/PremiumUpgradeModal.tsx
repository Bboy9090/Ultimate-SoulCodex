import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Crown, Check, X, Loader2 } from "lucide-react";

interface PremiumUpgradeModalProps {
  profileId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PremiumUpgradeModal({
  profileId,
  onClose,
  onSuccess,
}: PremiumUpgradeModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const validatePaymentFields = (): boolean => {
    if (!cardNumber.replace(/\s/g, "")) {
      setError("Card number is required");
      return false;
    }
    if (cardNumber.replace(/\s/g, "").length < 13) {
      setError("Invalid card number");
      return false;
    }
    if (!expiryDate || expiryDate.split("/").length !== 2) {
      setError("Invalid expiry date (MM/YY)");
      return false;
    }
    if (!cvv || cvv.length < 3) {
      setError("Invalid CVV");
      return false;
    }
    return true;
  };

  const handleUpgrade = async () => {
    if (!validatePaymentFields()) {
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/profiles/${profileId}/upgrade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${profileId}`,
        },
        body: JSON.stringify({
          cardNumber: cardNumber.replace(/\s/g, ""),
          expiryDate,
          cvv,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process upgrade");
      }

      await response.json();

      // Invalidate profile query to refresh UI
      await queryClient.invalidateQueries({
        queryKey: ["/api/profiles", profileId],
      });

      toast({
        title: "Welcome to Premium!",
        description: "Your account has been upgraded. Enjoy all premium features!",
      });

      onClose();
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error occurred";
      setError(message);
      toast({
        title: "Upgrade Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2 mb-4">
            <Crown className="h-6 w-6 text-accent" />
            <CardTitle>Unlock Premium</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Price */}
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">$47</div>
            <p className="text-muted-foreground">One-time payment</p>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground">
              Premium Features
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Complete 30-40 page PDF dossier</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Astrocartography world map</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>AI palmistry analysis</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Full astrology charts</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Human Design + Gene Keys</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>12+ mystical systems</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>First-person bio narratives</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Personalized rituals</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="font-semibold text-sm">Payment Details</h3>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Card Number
              </label>
              <input
                type="text"
                placeholder="4111 1111 1111 1111"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(
                    e.target.value
                      .replace(/\s/g, "")
                      .replace(/(\d{4})/g, "$1 ")
                      .trim()
                  )
                }
                maxLength={19}
                className="w-full px-3 py-2 border rounded text-sm bg-background"
                disabled={isProcessing}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Expiry (MM/YY)
                </label>
                <input
                  type="text"
                  placeholder="12/25"
                  value={expiryDate}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.length >= 2) {
                      val = val.slice(0, 2) + "/" + val.slice(2, 4);
                    }
                    setExpiryDate(val);
                  }}
                  maxLength={5}
                  className="w-full px-3 py-2 border rounded text-sm bg-background"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  maxLength={4}
                  className="w-full px-3 py-2 border rounded text-sm bg-background"
                  disabled={isProcessing}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              For testing: use card 4111 1111 1111 1111
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="mr-2 h-4 w-4" />
                  Unlock Premium Now
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="w-full"
            >
              Cancel
            </Button>
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            One-time payment for lifetime access to all premium features.
            No subscription, no recurring charges.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
