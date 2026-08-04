import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import type { OfflineCodexProfile } from "@soulcodex/core";
import { ArrowLeft, CloudOff, Compass, Crown, Infinity, ShieldCheck, Sparkles } from "lucide-react";
import DepthSoulGuide from "@/components/DepthSoulGuide";
import CosmicChart from "@/components/cosmic-chart";
import Navigation from "@/components/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  loadActiveProfile,
  saveActiveProfile,
} from "@/lib/ActiveProfileRepository";
import {
  loadOfflineProfile,
  saveOfflineProfile,
} from "@/lib/offlineProfileStore";
import {
  getVerifiedAstrologySign,
  profileNeedsOnlineVerification,
  reconcileActiveProfile,
  reconcileOfflineProfile,
  type ReconciledOfflineProfile,
} from "@/lib/profileVerificationReconciliation";

type VerificationAttempt = "idle" | "running" | "complete" | "deferred";

export default function OfflineProfilePage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [verificationAttempt, setVerificationAttempt] =
    useState<VerificationAttempt>("idle");

  const { data: profile, isLoading, error } = useQuery<OfflineCodexProfile>({
    queryKey: ["offline-profile", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("Profile id is missing");
      const stored = await loadOfflineProfile(id);
      if (!stored) throw new Error("Offline profile not found on this device");
      return stored;
    },
  });

  const reconciledProfile = profile as ReconciledOfflineProfile | undefined;

  useEffect(() => {
    if (!reconciledProfile || verificationAttempt !== "idle") return;
    if (!profileNeedsOnlineVerification(reconciledProfile)) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setVerificationAttempt("deferred");
      return;
    }

    const currentProfile = reconciledProfile;
    let cancelled = false;
    setVerificationAttempt("running");

    async function refreshVerification() {
      try {
        const response = await fetch("/api/profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: currentProfile.name,
            birthDate: currentProfile.birthDate,
            ...(currentProfile.birthTime
              ? { birthTime: currentProfile.birthTime }
              : {}),
            birthLocation: currentProfile.birthLocation,
            timezone: currentProfile.timezone,
            latitude: currentProfile.latitude ?? undefined,
            longitude: currentProfile.longitude ?? undefined,
          }),
        });

        if (!response.ok) {
          throw new Error(`verification_refresh_failed_${response.status}`);
        }

        const remote = await response.json();
        const syncedAt = new Date().toISOString();
        const hydrated = reconcileOfflineProfile(
          currentProfile,
          remote,
          syncedAt,
        );

        await saveOfflineProfile(hydrated);

        const active = loadActiveProfile().profile;
        if (active?.id === currentProfile.id) {
          const saved = saveActiveProfile(
            reconcileActiveProfile(active, remote, syncedAt),
          );
          if (!saved.success) {
            throw new Error(saved.error || "active_profile_reconciliation_failed");
          }
        }

        localStorage.setItem(
          `soulcodex.offlineProfileRemote.v1.${currentProfile.id}`,
          JSON.stringify({ remoteId: remote.id, syncedAt }),
        );

        if (!cancelled) {
          queryClient.setQueryData(["offline-profile", id], hydrated);
          setVerificationAttempt("complete");
        }
      } catch (cause) {
        console.warn(
          "[offline-profile] Online verification refresh deferred",
          cause,
        );
        if (!cancelled) setVerificationAttempt("deferred");
      }
    }

    void refreshVerification();
    return () => {
      cancelled = true;
    };
  }, [id, queryClient, reconciledProfile, verificationAttempt]);

  const verifiedAstrology = reconciledProfile?.verifiedAstrologyData;
  const verifiedSun = useMemo(
    () => getVerifiedAstrologySign(verifiedAstrology, "sun"),
    [verifiedAstrology],
  );
  const verifiedMoon = useMemo(
    () => getVerifiedAstrologySign(verifiedAstrology, "moon"),
    [verifiedAstrology],
  );
  const verifiedRising = useMemo(
    () => getVerifiedAstrologySign(verifiedAstrology, "rising"),
    [verifiedAstrology],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 flex min-h-[calc(100vh-6rem)] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            <p className="text-muted-foreground">Opening the Codex stored on this device...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile || !reconciledProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 flex min-h-[calc(100vh-6rem)] items-center justify-center px-4">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <CloudOff className="mx-auto mb-4 h-12 w-12 text-destructive" />
              <h2 className="mb-2 text-xl font-semibold">Local profile unavailable</h2>
              <p className="mb-4 text-muted-foreground">This profile was not found in this browser or device storage.</p>
              <Link href="/create"><Button>Create a new local Codex</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const astrology = profile.astrologyData;
  const numerology = profile.numerologyData;
  const archetype = profile.archetypeData;
  const hasVerifiedCore = Boolean(verifiedSun && verifiedMoon);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/"><Button variant="ghost" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back to home</Button></Link>

          <div className="mb-8 text-center">
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Saved on this device</Badge>
              <Badge variant="outline" className="gap-1"><CloudOff className="h-3.5 w-3.5" /> Works offline</Badge>
              {hasVerifiedCore && (
                <Badge variant="outline" className="gap-1 border-emerald-500/40 text-emerald-500">
                  <ShieldCheck className="h-3.5 w-3.5" /> Sun and Moon verified
                </Badge>
              )}
            </div>
            <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
              {profile.name}'s
              <span className="ml-2 bg-gradient-to-r from-primary to-accent bg-clip-text font-serif text-transparent">Soul Codex</span>
            </h1>
            <p className="text-muted-foreground">Generated locally on {new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>

          {verificationAttempt === "running" && (
            <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
              Checking the saved birth data against the independent online astronomy reference. The local reading remains available while this finishes.
            </div>
          )}

          {verificationAttempt === "deferred" && !hasVerifiedCore && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">
              Online verification is unavailable right now. Local symbolic layers remain visible, while Moon, Rising, houses, and sign-based compatibility stay paused rather than guessed.
            </div>
          )}

          <Card className="cosmic-border mystical-glow mb-8 border-0 bg-transparent">
            <div className="cosmic-border-inner">
              <CardContent className="p-8 text-center">
                <Crown className="mx-auto mb-4 h-12 w-12 text-accent" />
                <h2 className="mb-2 text-2xl font-bold sm:text-3xl">{archetype.title}</h2>
                <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground">{archetype.description}</p>
                <div className="flex flex-wrap items-center justify-center gap-5 text-sm">
                  <span>{verifiedSun ? `${verifiedSun} Sun · verified` : `${astrology.sunSign} Sun · local symbolic layer`}</span>
                  <span>{verifiedMoon ? `${verifiedMoon} Moon · verified` : "Moon · unresolved"}</span>
                  <span>{verifiedRising ? `${verifiedRising} Rising · verified` : "Rising · unresolved"}</span>
                </div>
              </CardContent>
            </div>
          </Card>

          <div className="mb-8 grid gap-6 lg:grid-cols-3">
            <Card className="glassmorphism">
              <CardHeader><CardTitle className="flex items-center gap-2"><Infinity className="h-5 w-5 text-primary" /> Core numbers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between"><span>Life Path</span><Badge>{numerology.lifePath}</Badge></div>
                <div className="flex justify-between"><span>Expression</span><Badge variant="secondary">{numerology.expression}</Badge></div>
                <div className="flex justify-between"><span>Soul Urge</span><Badge variant="secondary">{numerology.soulUrge}</Badge></div>
                <div className="flex justify-between"><span>Personal Year</span><Badge variant="outline">{numerology.personalYear}</Badge></div>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Symbolic chart</CardTitle></CardHeader>
              <CardContent className="flex justify-center"><CosmicChart astrologyData={astrology} size={240} /></CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardHeader><CardTitle className="flex items-center gap-2"><Compass className="h-5 w-5 text-primary" /> Local guidance</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed">{profile.dailyGuidance}</p>
                <div>
                  <p className="mb-2 text-sm font-semibold">Strengths</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">{archetype.strengths.map((item) => <li key={item}>• {item}</li>)}</ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glassmorphism mb-8">
            <CardHeader><CardTitle>Your locally available biography</CardTitle></CardHeader>
            <CardContent><p className="text-lg leading-relaxed">{profile.biography}</p></CardContent>
          </Card>

          <div className="mb-5 rounded-lg border border-primary/25 bg-primary/5 p-4 text-sm text-muted-foreground">
            {hasVerifiedCore
              ? "Sun and Moon were independently verified and merged into this device profile. Rising, houses, nodes, Chiron, and unsupported planetary details remain unresolved or local symbolic context until their own verification contracts pass."
              : "This local reading does not promote Moon, Rising, houses, or planetary approximations into verified identity facts. Those layers remain unresolved until independent astronomical verification succeeds."}
          </div>

          <DepthSoulGuide interpretation={profile.depthInterpretation} defaultOpenGroupIds={["behavior", "relationships-decisions"]} />
        </div>
      </div>
    </div>
  );
}
