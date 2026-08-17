import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import type { OfflineCodexProfile } from "@soulcodex/core";
import { ArrowLeft, ArrowRight, BookOpen, Check, CloudOff, Compass, Crown, Infinity, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import DepthSoulGuide from "@/components/DepthSoulGuide";
import Navigation from "@/components/navigation";
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

  if (isLoading) return <div className="sc-app-shell"><Navigation /><div className="flex min-h-screen items-center justify-center"><div className="text-center"><Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[var(--sc-gold)]" /><p className="text-[var(--sc-stone)]">Opening your Codex...</p></div></div></div>;
  if (error || !profile || !reconciledProfile) return <div className="sc-app-shell"><Navigation /><div className="flex min-h-screen items-center justify-center px-4"><div className="sc-panel max-w-md p-8 text-center"><CloudOff className="mx-auto mb-4 h-10 w-10 text-[var(--sc-danger)]" /><h2 className="font-serif text-2xl font-medium text-[var(--sc-ivory)]">Local profile unavailable</h2><p className="my-4 text-sm leading-6 text-[var(--sc-stone)]">This profile was not found in this browser or device storage.</p><Link href="/create" className="sc-button-primary">Create a new Codex</Link></div></div></div>;

  const astrology = profile.astrologyData;
  const numerology = profile.numerologyData;
  const archetype = profile.archetypeData;
  const hasVerifiedCore = Boolean(verifiedSun && verifiedMoon);
  const needsOnlineVerification = profileNeedsOnlineVerification(reconciledProfile);
  const readingHref = `/reading/${profile.id}`;

  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="sc-page pb-20">
        <Link href="/" className="mb-6 -ml-3 inline-flex items-center rounded-xl px-3 py-2 text-sm text-[var(--sc-stone)] no-underline hover:text-[var(--sc-ivory)]"><ArrowLeft className="mr-2 h-4 w-4" /> Home</Link>

        <section className="sc-panel sc-panel-gold relative mb-6 overflow-hidden p-6 sm:p-9">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            aria-hidden="true"
            style={{ background: "radial-gradient(circle at 92% 5%, rgba(154,116,220,.16), transparent 31%), radial-gradient(circle at 14% 100%, rgba(217,182,111,.06), transparent 25%)" }}
          />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_290px] lg:items-center">
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--sc-line)] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-[var(--sc-stone)]"><CloudOff className="h-3.5 w-3.5" /> stored locally</span>
                {hasVerifiedCore && <span className="sc-trust-chip"><ShieldCheck className="h-3.5 w-3.5" /> core verified</span>}
              </div>
              <p className="sc-eyebrow mb-3">Identity · Soul Codex</p>
              <h1 className="sc-display sc-display-gradient text-4xl sm:text-6xl">{profile.name}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--sc-stone)]">{archetype.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={readingHref} className="sc-button-primary">Open depth reading <ArrowRight className="ml-2 h-4 w-4" /></Link>
                <Link href="/compatibility" className="sc-button-secondary">Explore compatibility</Link>
                {needsOnlineVerification && verificationAttempt !== "complete" && (
                  <button
                    type="button"
                    className="flex h-11 items-center rounded-xl border border-[rgba(114,216,197,.25)] bg-[rgba(114,216,197,.04)] px-5 text-sm font-semibold text-[#bdeee0] transition hover:bg-[rgba(114,216,197,.08)] disabled:opacity-60"
                    onClick={() => void requestOnlineVerification()}
                    disabled={verificationAttempt === "running"}
                    data-testid="button-verify-online-profile"
                  >
                    {verificationAttempt === "running" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying…</> : <><ShieldCheck className="mr-2 h-4 w-4" />Verify online</>}
                  </button>
                )}
              </div>
              {needsOnlineVerification && verificationAttempt !== "complete" && (
                <p className="mt-3 max-w-2xl text-xs leading-5 text-[var(--sc-stone)]">Optional. Choosing Verify online sends only birth date, optional birth time, timezone, and coordinates to Soul Codex&apos;s astronomy verification endpoint. It does not create a server profile or invoke AI generation. Merely opening this local profile does not upload it.</p>
              )}
            </div>
            <div className="relative mx-auto flex aspect-square w-full max-w-[260px] items-center justify-center rounded-full border border-[var(--sc-line-gold)] bg-black/20 shadow-[inset_0_0_60px_rgba(123,97,255,.08)]"><div className="absolute inset-4 rounded-full border border-dashed border-[rgba(154,116,220,.25)]" /><Crown className="h-12 w-12 text-[var(--sc-gold-bright)]" /><div className="absolute bottom-8 text-center"><p className="sc-eyebrow justify-center">archetype</p><p className="mt-1 max-w-[180px] text-sm font-semibold text-[var(--sc-ivory)]">{archetype.title}</p></div></div>
          </div>
        </section>

        {verificationAttempt === "running" && <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.05)] p-4 text-sm text-[var(--sc-stone)]"><Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-[var(--sc-gold)]" /><span>You requested astronomy verification. Soul Codex is checking only the calculation inputs needed for that evidence while your local reading remains available.</span></div>}
        {verificationAttempt === "deferred" && !hasVerifiedCore && <div className="mb-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-[var(--sc-stone)]">The requested online verification could not complete. Local symbolic layers remain visible; Moon, Rising, houses, and sign-based compatibility stay unresolved rather than guessed.</div>}
        {verificationAttempt === "complete" && <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[rgba(114,216,197,.2)] bg-[rgba(114,216,197,.04)] p-4 text-sm text-[var(--sc-stone)]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sc-teal)]" /><span>Requested online verification completed and supported evidence was reconciled into this same local profile. No server profile was created by that verification request.</span></div>}

        <section className="mb-6 grid gap-4 lg:grid-cols-3">
          <div className="sc-panel p-5"><div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-3"><div className="sc-icon-well"><Sparkles className="h-5 w-5" /></div><div><p className="font-semibold text-[var(--sc-ivory)]">Astrology core</p><p className="text-xs text-[var(--sc-stone)]">verified where available</p></div></div></div><div className="space-y-3">{[["Sun", verifiedSun || astrology.sunSign, Boolean(verifiedSun)], ["Moon", verifiedMoon || "Unresolved", Boolean(verifiedMoon)], ["Rising", verifiedRising || "Unresolved", Boolean(verifiedRising)]].map(([label, value, verified]) => <div key={String(label)} className="flex items-center justify-between border-b border-[var(--sc-line)] pb-3 last:border-0 last:pb-0"><span className="text-sm text-[var(--sc-stone)]">{String(label)}</span><span className="flex items-center gap-2 text-sm font-semibold text-[var(--sc-ivory)]">{String(value)} {verified && <Check className="h-3.5 w-3.5 text-[var(--sc-teal)]" />}</span></div>)}</div></div>
          <div className="sc-panel p-5"><div className="mb-5 flex items-center gap-3"><div className="sc-icon-well"><Infinity className="h-5 w-5" /></div><div><p className="font-semibold text-[var(--sc-ivory)]">Core numbers</p><p className="text-xs text-[var(--sc-stone)]">numerology layer</p></div></div><div className="grid grid-cols-2 gap-3">{[["Life Path", numerology.lifePath], ["Expression", numerology.expression], ["Soul Urge", numerology.soulUrge], ["Personal Year", numerology.personalYear]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-[var(--sc-line)] bg-white/[0.025] p-3"><p className="text-[11px] uppercase tracking-[.12em] text-[var(--sc-stone)]">{String(label)}</p><p className="mt-1 font-serif text-2xl font-medium text-[var(--sc-gold-bright)]">{String(value)}</p></div>)}</div></div>
          <div className="sc-panel p-5"><div className="mb-4 flex items-center gap-3"><div className="sc-icon-well"><Compass className="h-5 w-5" /></div><div><p className="font-semibold text-[var(--sc-ivory)]">Current guidance</p><p className="text-xs text-[var(--sc-stone)]">local interpretation</p></div></div><p className="text-sm leading-7 text-[var(--sc-ivory-soft)]">{profile.dailyGuidance}</p><div className="mt-5 flex flex-wrap gap-2">{archetype.strengths.slice(0, 3).map((item) => <span key={item} className="rounded-full border border-[var(--sc-line)] bg-white/[0.035] px-3 py-1 text-xs text-[var(--sc-stone)]">{item}</span>)}</div></div>
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-[360px_1fr]">
          <div className="sc-panel flex min-h-[300px] items-center justify-center p-6" data-testid="local-astronomy-unresolved-panel">
            <div className="max-w-[280px] text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.05)] text-[var(--sc-gold-bright)]"><Compass className="h-7 w-7" /></div>
              <p className="sc-eyebrow mt-5 justify-center">Natal wheel</p>
              <h2 className="mt-2 font-serif text-2xl font-medium text-[var(--sc-ivory)]">Unavailable locally without verified placements.</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">Soul Codex does not draw sample planets, random aspects, approximate houses, or an invented wheel. Exact chart geometry appears only after the required astronomy evidence exists.</p>
            </div>
          </div>
          <div className="sc-panel p-6 sm:p-8"><p className="sc-eyebrow mb-3">Local biography</p><h2 className="mb-4 font-serif text-3xl font-medium text-[var(--sc-ivory)]">The story this profile currently tells.</h2><p className="text-base leading-8 text-[var(--sc-ivory-soft)]">{profile.biography}</p><Link href={readingHref} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--sc-gold-bright)] no-underline hover:text-white">Read the deeper pattern <BookOpen className="h-4 w-4" /></Link></div>
        </section>

        <div className="mb-6 rounded-2xl border border-[rgba(114,216,197,.18)] bg-[rgba(114,216,197,.04)] p-5"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sc-teal)]" /><div><p className="font-semibold text-[var(--sc-ivory)]">Evidence boundary</p><p className="mt-1 text-sm leading-6 text-[var(--sc-stone)]">{hasVerifiedCore ? "Sun and Moon were independently verified and merged into this device profile. Rising, houses, nodes, Chiron, and unsupported planetary details remain unresolved or symbolic context until their own verification contracts pass." : "This local reading uses symbolic Sun and deterministic numerology only. Moon, Rising, planets, houses, aspects, nodes, Chiron, and chart geometry remain unresolved until you explicitly request independent astronomical verification and it succeeds."}</p></div></div></div>

        <DepthSoulGuide interpretation={profile.depthInterpretation} defaultOpenGroupIds={["behavior", "relationships-decisions"]} />
      </main>
    </div>
  );
}