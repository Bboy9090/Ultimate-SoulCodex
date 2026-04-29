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
    // Beta/Reviewer Auto-Unlock
    // This allows App Store reviewers and beta testers to access premium features
    // without requiring a live StoreKit connection during the final audit phase.
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      try {
        localStorage.setItem("soulPremium", "true");
        // Force a small delay before redirecting
        setTimeout(() => navigate("/profile"), 2000);
      } catch {}
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--sc-bg-ink)] text-white p-6 pt-24 overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,var(--sc-gold-glow)_0%,transparent_70%)]" />
      </div>

      <AnimatePresence>
        {(isVerifying || isSuccess) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[var(--sc-bg-ink)]/95 backdrop-blur-xl flex items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-6 max-w-sm"
            >
              {isVerifying ? (
                <>
                  <div className="relative mx-auto w-20 h-20">
                    <Loader2 className="w-20 h-20 text-[var(--sc-gold)] animate-spin" />
                    <ShieldCheck className="absolute inset-0 m-auto w-8 h-8 text-[var(--sc-gold)]/50" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-serif tracking-tight text-[var(--sc-gold)]">Syncing with Cosmos</h2>
                    <p className="text-white/60 text-sm">Authenticating your celestial signature...</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto w-24 h-24 bg-[var(--sc-gold)]/10 rounded-full flex items-center justify-center border border-[var(--sc-gold)]/30">
                    <CheckCircle2 className="w-12 h-12 text-[var(--sc-gold)]" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-serif tracking-tight text-[var(--sc-gold)]">Access Granted</h2>
                    <p className="text-white/60 text-sm">Your Soul Codex has been permanently unlocked. Preparing your dossier...</p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/profile">
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5 border border-white/5">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
          <div className="flex items-center space-x-2 text-[var(--sc-gold)]">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Beta Access Mode</span>
          </div>
        </div>

        <div className="text-center mb-12 space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block p-4 rounded-2xl bg-[var(--sc-gold)]/10 mb-2 border border-[var(--sc-gold)]/20"
          >
            <Sparkles className="h-10 w-10 text-[var(--sc-gold)]" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-[var(--sc-gold)] to-[var(--sc-gold-soft)] font-serif">
            The Eternal Now
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto font-sans leading-relaxed">
            Experience the full depth of your celestial blueprint. <br className="hidden md:block" /> 
            Limited-time Beta Access for early souls.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Benefits Side */}
          <div className="space-y-6 p-10 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--sc-gold)] mb-6">Unlocked Features</h2>
            <div className="space-y-5">
              {benefits.map((benefit, i) => (
                <motion.div 
                  key={i}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="mt-1 w-5 h-5 rounded-full bg-[var(--sc-gold)]/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-3 w-3 text-[var(--sc-gold)]" />
                  </div>
                  <span className="text-white/90 text-sm font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Side */}
          <div className="p-10 rounded-3xl flex flex-col justify-center items-center text-center space-y-10 bg-[var(--sc-gold)]/[0.03] border-[var(--sc-gold)]/30 border-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[var(--sc-gold)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="space-y-3 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--sc-gold)] opacity-80">Beta Phase I</span>
              <div className="flex flex-col items-center">
                <span className="text-white/40 text-sm line-through decoration-[var(--sc-gold)]/50">$29.99</span>
                <span className="text-6xl font-serif font-black text-[var(--sc-gold)]">FREE</span>
              </div>
            </div>

            <div className="w-full space-y-4 relative z-10">
              <Button 
                size="lg" 
                className="w-full h-18 text-xl font-black bg-[var(--sc-gold)] hover:bg-[var(--sc-gold-soft)] text-[var(--sc-bg-ink)] rounded-2xl shadow-[0_10px_40px_rgba(212,168,95,0.4)] transition-all active:scale-95 transform"
                onClick={handlePurchase}
              >
                <Zap className="mr-3 h-6 w-6 fill-current" />
                GET ACCESS
              </Button>
              <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest">
                Unlock instantly for beta review
              </p>
            </div>

            <div className="pt-6 border-t border-white/5 w-full relative z-10">
              <p className="text-xs text-white/40 leading-relaxed italic">
                By entering, you confirm participation in the <br /> Soul Codex early access program.
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
