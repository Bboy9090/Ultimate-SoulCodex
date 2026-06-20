import { Capacitor } from "@capacitor/core";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconArrowLeft, IconShield, IconZap, IconSparkles,
  IconCheckCircle, IconLoader
} from "../components/Icons";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { apiFetch } from "../lib/queryClient";

export default function PricingPage() {
  const isIOS = Capacitor.getPlatform() === "ios";
  const [, navigate] = useLocation();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const benefits = [
    "Full 30-40 page Personal Dossier (PDF)",
    "Unlimited Soul Oracle interactions",
    "Deep-dive Shadow & Trigger analysis",
    "Priority access to new esoteric systems",
    "Zero ads, forever"
  ];

  const getProfileId = (): string | undefined => {
    try { return JSON.parse(localStorage.getItem("soulProfile") || "null")?.profileId; }
    catch { return undefined; }
  };

  // Real entitlement: redeem an access code against the backend. Premium is only
  // ever granted server-side (session + entitlement); localStorage is written
  // ONLY after /api/entitlements confirms — never as a standalone unlock.
  const handleRedeem = async () => {
    const trimmed = code.trim();
    if (!trimmed) { setError("Enter your access code."); return; }
    setError(null);
    setIsVerifying(true);
    try {
      const res = await apiFetch("/api/access-codes/validate", {
        method: "POST",
        body: JSON.stringify({ code: trimmed, profileId: getProfileId() }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok || !data?.success) {
        setIsVerifying(false);
        setError(data?.message || "Invalid or expired access code.");
        return;
      }
      // Confirm with backend truth before reflecting any premium state in the UI.
      const ent = await apiFetch("/api/entitlements")
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      if (ent?.isPremium) {
        try { localStorage.setItem("soulPremium", "true"); } catch {}
        setIsVerifying(false);
        setIsSuccess(true);
        setTimeout(() => navigate("/profile"), 1800);
      } else {
        setIsVerifying(false);
        setError("Code accepted but premium did not activate. Please refresh and try again.");
      }
    } catch {
      setIsVerifying(false);
      setError("Network error. Please try again.");
    }
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
                  <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                    <IconLoader size={80} className="text-[var(--sc-gold)] animate-spin" />
                    <IconShield size={32} className="absolute m-auto text-[var(--sc-gold)]/50" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-serif tracking-tight text-[var(--sc-gold)]">Verifying Access Code</h2>
                    <p className="text-white/60 text-sm">Confirming your entitlement with the server...</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto w-24 h-24 bg-[var(--sc-gold)]/10 rounded-full flex items-center justify-center border border-[var(--sc-gold)]/30">
                    <IconCheckCircle size={48} className="text-[var(--sc-gold)]" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-serif tracking-tight text-[var(--sc-gold)]">Access Granted</h2>
                    <p className="text-white/60 text-sm">Your Soul Codex premium is active. Preparing your dossier...</p>
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
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5 border border-white/5 flex items-center gap-2">
              <IconArrowLeft size={16} />
              Back to Profile
            </Button>
          </Link>
          <div className="flex items-center space-x-2 text-[var(--sc-gold)]">
            <IconShield size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Access Code</span>
          </div>
        </div>

        <div className="text-center mb-12 space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block p-4 rounded-2xl bg-[var(--sc-gold)]/10 mb-2 border border-[var(--sc-gold)]/20"
          >
            <IconSparkles size={40} className="text-[var(--sc-gold)]" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-[var(--sc-gold)] to-[var(--sc-gold-soft)] font-serif">
            The Eternal Now
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto font-sans leading-relaxed">
            Experience the full depth of your celestial blueprint. <br className="hidden md:block" />
            Unlock premium with your Soul Codex access code.
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
                    <IconCheckCircle size={12} className="text-[var(--sc-gold)]" />
                  </div>
                  <span className="text-white/90 text-sm font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Side — real access-code redemption */}
          <div className="p-10 rounded-3xl flex flex-col justify-center items-center text-center space-y-8 bg-[var(--sc-gold)]/[0.03] border-[var(--sc-gold)]/30 border-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[var(--sc-gold)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-3 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--sc-gold)] opacity-80">Redeem Access</span>
              <p className="text-white/60 text-sm max-w-xs">Enter the access code from your invite or purchase to unlock premium.</p>
            </div>

            <div className="w-full space-y-4 relative z-10">
              <input
                value={code}
                onChange={(e) => { setCode(e.target.value); if (error) setError(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleRedeem(); }}
                placeholder="ENTER ACCESS CODE"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Access code"
                className="w-full h-14 px-4 rounded-2xl bg-black/30 border border-[var(--sc-gold)]/30 text-center text-lg tracking-[0.2em] uppercase text-white placeholder-white/25 focus:outline-none focus:border-[var(--sc-gold)] transition-colors"
              />
              {error && <p className="text-sm text-rose-400" role="alert">{error}</p>}
              <Button
                size="lg"
                disabled={isVerifying}
                className="w-full h-16 text-lg font-black bg-[var(--sc-gold)] hover:bg-[var(--sc-gold-soft)] text-[var(--sc-bg-ink)] rounded-2xl shadow-[0_10px_40px_rgba(212,168,95,0.4)] transition-all active:scale-95 transform flex items-center justify-center disabled:opacity-60"
                onClick={handleRedeem}
              >
                <IconZap size={22} className="mr-3 fill-current" />
                {isVerifying ? "Verifying…" : "Redeem Code"}
              </Button>
              <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest">
                Access is granted server-side · no card required
              </p>
            </div>

            <div className="pt-6 border-t border-white/5 w-full relative z-10">
              <p className="text-xs text-white/40 leading-relaxed italic">
                Don't have a code? It's included with your invite to the <br /> Soul Codex early access program.
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
