import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import type { OfflineCodexProfile } from "@soulcodex/core";
import { ArrowLeft, ArrowRight, BookOpen, Check, CloudOff, Compass, Crown, Infinity, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import DepthSoulGuide from "@/components/DepthSoulGuide";
import CosmicChart from "@/components/cosmic-chart";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { loadActiveProfile, saveActiveProfile } from "@/lib/ActiveProfileRepository";
import { loadOfflineProfile, saveOfflineProfile } from "@/lib/offlineProfileStore";
import { getVerifiedAstrologySign, profileNeedsOnlineVerification, reconcileActiveProfile, reconcileOfflineProfile, type ReconciledOfflineProfile } from "@/lib/profileVerificationReconciliation";
import { apiFetch } from "@/lib/queryClient";

type VerificationAttempt = "idle" | "running" | "complete" | "deferred";

export default function OfflineProfilePage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [verificationAttempt, setVerificationAttempt] = useState<VerificationAttempt>("idle");
  const { data: profile, isLoading, error } = useQuery<OfflineCodexProfile>({ queryKey: ["offline-profile", id], enabled: !!id, queryFn: async () => { if (!id) throw new Error("Profile id is missing"); const stored = await loadOfflineProfile(id); if (!stored) throw new Error("Offline profile not found on this device"); return stored; } });
  const reconciledProfile = profile as ReconciledOfflineProfile | undefined;

  const requestOnlineVerification = async () => {
    if (!reconciledProfile || verificationAttempt === "running" || !profileNeedsOnlineVerification(reconciledProfile)) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setVerificationAttempt("deferred");
      return;
    }

    const currentProfile = reconciledProfile;
    setVerificationAttempt("running");
    try {
      const response = await apiFetch("/api/verification/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: currentProfile.birthDate,
          ...(currentProfile.birthTime ? { birthTime: currentProfile.birthTime } : {}),
          timezone: currentProfile.timezone,
          latitude: currentProfile.latitude ?? undefined,
          longitude: currentProfile.longitude ?? undefined,
        }),
      });
      if (!response.ok) throw new Error(`verification_refresh_failed_${response.status}`);
      const verification = await response.json();
      const syncedAt = verification.updatedAt || new Date().toISOString();
      const hydrated = reconcileOfflineProfile(currentProfile, verification, syncedAt);
      await saveOfflineProfile(hydrated);
      const active = loadActiveProfile().profile;
      if (active?.id === currentProfile.id) {
        const saved = saveActiveProfile(reconcileActiveProfile(active, verification, syncedAt));
        if (!saved.success) throw new Error(saved.error || "active_profile_reconciliation_failed");
      }
      queryClient.setQueryData(["offline-profile", id], hydrated);
      setVerificationAttempt("complete");
    } catch (cause) {
      console.warn("[offline-profile] Requested online verification could not complete", cause);
      setVerificationAttempt("deferred");
    }
  };

  const verifiedAstrology = reconciledProfile?.verifiedAstrologyData;
  const verifiedSun = useMemo(() => getVerifiedAstrologySign(verifiedAstrology, "sun"), [verifiedAstrology]);
  const verifiedMoon = useMemo(() => getVerifiedAstrologySign(verifiedAstrology, "moon"), [verifiedAstrology]);
  const verifiedRising = useMemo(() => getVerifiedAstrologySign(verifiedAstrology, "rising"), [verifiedAstrology]);

  if (isLoading) return <div className="codex-page min-h-screen"><Navigation /><div className="flex min-h-screen items-center justify-center"><div className="text-center"><Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" /><p className="text-muted-foreground">Opening your Codex...</p></div></div></div>;
  if (error || !profile || !reconciledProfile) return <div className="codex-page min-h-screen"><Navigation /><div className="flex min-h-screen items-center justify-center px-4"><Card className="codex-panel max-w-md"><CardContent className="p-8 text-center"><CloudOff className="mx-auto mb-4 h-10 w-10 text-destructive" /><h2 className="codex-display text-2xl">Local profile unavailable</h2><p className="my-4 text-sm leading-6 text-muted-foreground">This profile was not found in this browser or device storage.</p><Link href="/create"><Button className="codex-primary-cta">Create a new Codex</Button></Link></CardContent></Card></div></div>;

  const astrology = profile.astrologyData;
  const numerology = profile.numerologyData;
  const archetype = profile.archetypeData;
  const hasVerifiedCore = Boolean(verifiedSun && verifiedMoon);
  const needsOnlineVerification = profileNeedsOnlineVerification(reconciledProfile);
  const readingHref = `/reading/${profile.id}`;

  return (
    <div className="codex-page min-h-screen text-foreground">
      <Navigation />
      <main className="codex-shell pb-20 pt-28 sm:pt-32">
        <Link href="/"><Button variant="ghost" className="mb-6 -ml-3 rounded-xl text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-2 h-4 w-4" /> Home</Button></Link>

        <section className="relative mb-6 overflow-hidden rounded-[28px] border border-white/10 bg-card/70 p-6 shadow-2xl sm:p-9">
          <div className="codex-aurora absolute inset-0 opacity-70" aria-hidden="true" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_290px] lg:items-center">
            <div>
              <div className="mb-4 flex flex-wrap gap-2"><span className="codex-status"><CloudOff className="h-3.5 w-3.5" /> stored locally</span>{hasVerifiedCore && <span className="codex-status codex-status-trust"><ShieldCheck className="h-3.5 w-3.5" /> core verified</span>}</div>
              <p className="codex-kicker mb-3">Identity · Soul Codex</p>
              <h1 className="codex-display text-4xl font-semibold tracking-[-0.035em] sm:text-6xl">{profile.name}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{archetype.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={readingHref}><Button className="codex-primary-cta h-11 rounded-xl px-5">Open depth reading <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
                <Link href="/compatibility"><Button variant="outline" className="h-11 rounded-xl border-white/10 bg-white/[0.035] px-5">Explore compatibility</Button></Link>
                {needsOnlineVerification && verificationAttempt !== "complete" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl border-emerald-400/25 bg-emerald-400/[0.04] px-5 text-emerald-200"
                    onClick={() => void requestOnlineVerification()}
                    disabled={verificationAttempt === "running"}
                    data-testid="button-verify-online-profile"
                  >
                    {verificationAttempt === "running" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying…</> : <><ShieldCheck className="mr-2 h-4 w-4" />Verify online</>}
                  </Button>
                )}
              </div>
              {needsOnlineVerification && verificationAttempt !== "complete" && (
                <p className="mt-3 max-w-2xl text-xs leading-5 text-muted-foreground">Optional. Choosing Verify online sends only birth date, optional birth time, timezone, and coordinates to Soul Codex&apos;s astronomy verification endpoint. It does not create a server profile or invoke AI generation. Merely opening this local profile does not upload it.</p>
              )}
            </div>
            <div className="relative mx-auto flex aspect-square w-full max-w-[260px] items-center justify-center rounded-full border border-primary/20 bg-black/20 shadow-[inset_0_0_60px_rgba(123,97,255,.08)]"><div className="absolute inset-4 rounded-full border border-dashed border-accent/25" /><Crown className="h-12 w-12 text-accent" /><div className="absolute bottom-8 text-center"><p className="codex-kicker">archetype</p><p className="mt-1 max-w-[180px] text-sm font-semibold">{archetype.title}</p></div></div>
          </div>
        </section>

        {verificationAttempt === "running" && <div className="mb-5 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground"><Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" /><span>You requested astronomy verification. Soul Codex is checking only the calculation inputs needed for that evidence while your local reading remains available.</span></div>}
        {verificationAttempt === "deferred" && !hasVerifiedCore && <div className="mb-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-muted-foreground">The requested online verification could not complete. Local symbolic layers remain visible; Moon, Rising, houses, and sign-based compatibility stay unresolved rather than guessed.</div>}
        {verificationAttempt === "complete" && <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-4 text-sm text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /><span>Requested online verification completed and supported evidence was reconciled into this same local profile. No server profile was created by that verification request.</span></div>}

        <section className="mb-6 grid gap-4 lg:grid-cols-3">
          <div className="codex-panel p-5"><div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-3"><div className="codex-icon-well"><Sparkles className="h-5 w-5" /></div><div><p className="font-semibold">Astrology core</p><p className="text-xs text-muted-foreground">verified where available</p></div></div></div><div className="space-y-3">{[["Sun", verifiedSun || astrology.sunSign, Boolean(verifiedSun)], ["Moon", verifiedMoon || "Unresolved", Boolean(verifiedMoon)], ["Rising", verifiedRising || "Unresolved", Boolean(verifiedRising)]].map(([label, value, verified]) => <div key={String(label)} className="flex items-center justify-between border-b border-white/6 pb-3 last:border-0 last:pb-0"><span className="text-sm text-muted-foreground">{String(label)}</span><span className="flex items-center gap-2 text-sm font-semibold">{String(value)} {verified && <Check className="h-3.5 w-3.5 text-emerald-400" />}</span></div>)}</div></div>
          <div className="codex-panel p-5"><div className="mb-5 flex items-center gap-3"><div className="codex-icon-well"><Infinity className="h-5 w-5" /></div><div><p className="font-semibold">Core numbers</p><p className="text-xs text-muted-foreground">numerology layer</p></div></div><div className="grid grid-cols-2 gap-3">{[["Life Path", numerology.lifePath], ["Expression", numerology.expression], ["Soul Urge", numerology.soulUrge], ["Personal Year", numerology.personalYear]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-white/7 bg-white/[0.025] p-3"><p className="text-[11px] uppercase tracking-[.12em] text-muted-foreground">{String(label)}</p><p className="codex-display mt-1 text-2xl text-accent">{String(value)}</p></div>)}</div></div>
          <div className="codex-panel p-5"><div className="mb-4 flex items-center gap-3"><div className="codex-icon-well"><Compass className="h-5 w-5" /></div><div><p className="font-semibold">Current guidance</p><p className="text-xs text-muted-foreground">local interpretation</p></div></div><p className="text-sm leading-7 text-foreground/80">{profile.dailyGuidance}</p><div className="mt-5 flex flex-wrap gap-2">{archetype.strengths.slice(0, 3).map((item) => <span key={item} className="rounded-full border border-white/8 bg-white/[0.035] px-3 py-1 text-xs text-muted-foreground">{item}</span>)}</div></div>
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-[360px_1fr]">
          <div className="codex-panel flex min-h-[360px] items-center justify-center p-5"><CosmicChart astrologyData={astrology} size={280} /></div>
          <div className="codex-panel p-6 sm:p-8"><p className="codex-kicker mb-3">Local biography</p><h2 className="codex-display mb-4 text-3xl">The story this profile currently tells.</h2><p className="text-base leading-8 text-foreground/80">{profile.biography}</p><Link href={readingHref} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">Read the deeper pattern <BookOpen className="h-4 w-4" /></Link></div>
        </section>

        <div className="mb-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-5"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /><div><p className="font-semibold">Evidence boundary</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{hasVerifiedCore ? "Sun and Moon were independently verified and merged into this device profile. Rising, houses, nodes, Chiron, and unsupported planetary details remain unresolved or symbolic context until their own verification contracts pass." : "This reading does not promote Moon, Rising, houses, or planetary approximations into verified identity facts. Those layers remain unresolved until you explicitly request independent astronomical verification and it succeeds."}</p></div></div></div>

        <DepthSoulGuide interpretation={profile.depthInterpretation} defaultOpenGroupIds={["behavior", "relationships-decisions"]} />
      </main>
    </div>
  );
}