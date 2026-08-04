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
      <div className="min-h-screen bg-[#090610] text-white">
        <Navigation />
        <main className="flex min-h-screen items-center justify-center px-5 pt-20" aria-live="polite">
          <div className="text-center">
            <div
              aria-hidden="true"
              className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-2 border-white/15 border-t-amber-300"
            />
            <p className="text-white/60">Opening the clarity reading stored on this device...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#090610] text-white">
        <Navigation />
        <main className="mx-auto max-w-xl px-5 pb-20 pt-32 text-center">
          <ShieldCheck aria-hidden="true" className="mx-auto mb-5 h-10 w-10 text-amber-300" />
          <h1 className="mb-3 font-serif text-4xl">This local reading is unavailable.</h1>
          <p className="mb-7 text-white/60">
            Soul Codex will not manufacture a replacement when the saved profile cannot be found.
          </p>
          <Link
            href="/create"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-300 px-5 py-3 font-semibold text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Create a local Codex <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </main>
      </div>
    );
  }

  const model = buildClarityReadingModel(profile as any);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_-10%,rgba(106,61,170,.32),transparent_36%),linear-gradient(180deg,#090610,#0d0917_52%,#08060d)] text-white">
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
