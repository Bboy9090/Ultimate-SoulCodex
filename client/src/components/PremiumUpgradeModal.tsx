import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Check,
  Crown,
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
  profileId: _profileId,
  onClose,
  onSuccess: _onSuccess,
}: PremiumUpgradeModalProps) {
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
            <div className="font-serif text-2xl font-semibold">Soul Codex+</div>
            <p className="text-sm text-[var(--sc-stone)]">
              Monthly and annual purchasing remains disabled until the durable entitlement, restore, revocation, and store-billing gates pass.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase text-[var(--sc-stone)]">Included premium access</h3>
            <div className="space-y-2 text-sm">
              {["Full-name numerology: Expression, Soul Urge, Personality, and Maturity", "Verified Human Design Type, Strategy, Authority, and Profile", "Up to five qualified Daily influences", "Evidence-aware downloadable natal PDF report"].map((item) => (
                <div className="flex items-start space-x-3" key={item}>
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#72d6b7]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.05)] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--sc-gold)]" />
              <div>
                <h3 className="text-sm font-semibold">Purchase path not active yet</h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--sc-stone)]">
                  Soul Codex will not charge for the retired one-time premium product or grant Plus from a local flag. Monthly and annual access will appear here only after verified billing truth is live.
                </p>
              </div>
            </div>
          </div>


          <div className="space-y-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="w-full">
              Continue with Free
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
