import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import type { OfflineCodexProfile } from "@soulcodex/core";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Navigation from "@/components/navigation";
import ClarityReadingExperience from "@/components/ClarityReadingExperience";
import { buildClarityReadingModel } from "@/lib/clarityReadingModel";
import { loadOfflineProfile } from "@/lib/offlineProfileStore";

export default function OfflineClarityReadingPage() {
  const { id } = useParams();
  const { data: profile, isLoading, error } = useQuery<OfflineCodexProfile>({
    queryKey: ["offline-profile", id],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) throw new Error("Profile id is missing");
      const stored = await loadOfflineProfile(id);
      if (!stored) throw new Error("Offline profile not found on this device");
      return stored;
    },
  });

  if (isLoading) {
    return (
      <div className="sc-app-shell">
        <Navigation />
        <main className="flex min-h-screen items-center justify-center px-5 pt-20" aria-live="polite">
          <div className="text-center">
            <div
              aria-hidden="true"
              className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-2 border-white/15 border-t-[var(--sc-gold)]"
            />
            <p className="text-[var(--sc-stone)]">Opening the clarity reading stored on this device...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="sc-app-shell">
        <Navigation />
        <main className="mx-auto max-w-xl px-5 pb-20 pt-32 text-center">
          <ShieldCheck aria-hidden="true" className="mx-auto mb-5 h-10 w-10 text-[var(--sc-gold-bright)]" />
          <h1 className="mb-3 font-serif text-4xl font-medium text-[var(--sc-ivory)]">This local reading is unavailable.</h1>
          <p className="mb-7 text-[var(--sc-stone)]">
            Soul Codex will not manufacture a replacement when the saved profile cannot be found.
          </p>
          <Link href="/create" className="sc-button-primary">
            Create a local Codex <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </main>
      </div>
    );
  }

  const model = buildClarityReadingModel(profile as any);

  return (
    <div className="sc-app-shell">
      <Navigation />
      <ClarityReadingExperience
        profileId={String(profile.id)}
        profileName={profile.name}
        model={model}
        offline
      />
    </div>
  );
}
