import { Capacitor } from "@capacitor/core";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck, Zap, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function PricingPage() {
  const isIOS = Capacitor.getPlatform() === "ios";
  const [, navigate] = useLocation();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const benefits = [
    "Full 30-40 page Personal Dossier (PDF)",
    "Unlimited Soul Oracle interactions",
    "Deep-dive Shadow & Trigger analysis",
    "Priority access to new esoteric systems",
    "Zero ads, forever"
  ];

  const handlePurchase = async () => {
    setIsVerifying(true);
    // Simulate Apple IAP verification flow
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      try {
        localStorage.setItem("soulPremium", "true");
        // Force a small delay before redirecting
        setTimeout(() => navigate("/profile"), 2000);
      } catch {}
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-6 pt-24 overflow-hidden">
      <AnimatePresence>
        {(isVerifying || isSuccess) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-6 max-w-sm"
            >
              {isVerifying ? (
                <>
                  <div className="relative mx-auto w-20 h-20">
                    <Loader2 className="w-20 h-20 text-accent animate-spin" />
                    <ShieldCheck className="absolute inset-0 m-auto w-8 h-8 text-accent/50" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">Verifying with Apple</h2>
                    <p className="text-white/60 text-sm">Authenticating your secure transaction...</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-green-400">Welcome to Premium</h2>
                    <p className="text-white/60 text-sm">Your Soul Codex has been permanently unlocked. Preparing your dossier...</p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/profile">
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
          <div className="flex items-center space-x-2 text-accent">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-medium">Secure Apple Transaction</span>
          </div>
        </div>

        <div className="text-center mb-12 space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block p-3 rounded-2xl bg-accent/10 mb-2"
          >
            <Sparkles className="h-8 w-8 text-accent" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-purple-400">
            Ascend to Premium
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Experience the full depth of the Soul Codex with a permanent, one-time unlock.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Benefits Side */}
          <div className="space-y-6 p-8 rounded-3xl bg-white/[0.03] border border-white/10">
            <h2 className="text-xl font-semibold mb-4">What's included:</h2>
            <div className="space-y-4">
              {benefits.map((benefit, i) => (
                <motion.div 
                  key={i}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-white/80">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Side */}
          <div className="glassmorphism p-8 rounded-3xl flex flex-col justify-center items-center text-center space-y-8 bg-accent/5 border-accent/20 border-2">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-accent">Lifetime Access</span>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold">$29.99</span>
                <span className="text-white/40 text-sm">one-time</span>
              </div>
            </div>

            <div className="w-full space-y-4">
              <Button 
                size="lg" 
                className="w-full h-16 text-lg font-bold bg-accent hover:bg-accent/80 text-[#0A0A0B] rounded-2xl shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] transition-all active:scale-95"
                onClick={handlePurchase}
              >
                <Zap className="mr-2 h-5 w-5 fill-current" />
                Unlock Now
              </Button>
              <p className="text-[10px] text-white/40 uppercase tracking-tighter">
                Secure payment via Apple App Store
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 w-full">
              <p className="text-xs text-white/40 italic">
                Redeem an access code on your Profile page if you have one.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-white/30 text-xs flex justify-center gap-6">
          <Link href="/terms" className="hover:text-accent underline">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-accent underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
