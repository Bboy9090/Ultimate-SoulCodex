import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import type { OfflineCodexProfile } from "@soulcodex/core";
import { ArrowLeft, CloudOff, Compass, Crown, Infinity, ShieldCheck, Sparkles } from "lucide-react";
import DepthSoulGuide from "@/components/DepthSoulGuide";
import CosmicChart from "@/components/cosmic-chart";
import Navigation from "@/components/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadOfflineProfile } from "@/lib/offlineProfileStore";

export default function OfflineProfilePage() {
  const { id } = useParams();
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

  if (error || !profile) {
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
            </div>
            <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
              {profile.name}'s
              <span className="ml-2 bg-gradient-to-r from-primary to-accent bg-clip-text font-serif text-transparent">Soul Codex</span>
            </h1>
            <p className="text-muted-foreground">Generated locally on {new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>

          <Card className="cosmic-border mystical-glow mb-8 border-0 bg-transparent">
            <div className="cosmic-border-inner">
              <CardContent className="p-8 text-center">
                <Crown className="mx-auto mb-4 h-12 w-12 text-accent" />
                <h2 className="mb-2 text-2xl font-bold sm:text-3xl">{archetype.title}</h2>
                <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground">{archetype.description}</p>
                <div className="flex flex-wrap items-center justify-center gap-5 text-sm">
                  <span>{astrology.sunSign} Sun</span>
                  <span>{astrology.moonSign} Moon approximation</span>
                  <span>{astrology.risingSign} Rising approximation</span>
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
            <CardHeader><CardTitle>Your locally generated biography</CardTitle></CardHeader>
            <CardContent><p className="text-lg leading-relaxed">{profile.biography}</p></CardContent>
          </Card>

          <div className="mb-5 rounded-lg border border-primary/25 bg-primary/5 p-4 text-sm text-muted-foreground">
            This reading was generated without an AI provider. Sun and numerology layers are deterministic. Moon, Rising, houses, and planetary placements are explicitly labeled as legacy-grade approximations until the astronomical engine is connected.
          </div>

          <DepthSoulGuide interpretation={profile.depthInterpretation} defaultOpenGroupIds={["behavior", "relationships-decisions"]} />
        </div>
      </div>
    </div>
  );
}
