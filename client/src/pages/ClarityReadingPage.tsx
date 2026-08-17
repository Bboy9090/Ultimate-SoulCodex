import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Navigation from "@/components/navigation";
import ClarityReadingExperience from "@/components/ClarityReadingExperience";
import { buildClarityReadingModel } from "@/lib/clarityReadingModel";
import type { Profile } from "@shared/schema";

export default function ClarityReadingPage() {
  const { id } = useParams();
  const { data: profile, isLoading, error } = useQuery<Profile>({
    queryKey: ["/api/profiles", id],
    enabled: Boolean(id),
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
            <p className="text-[var(--sc-stone)]">Building the clearest supported reading...</p>
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
          <h1 className="mb-3 font-serif text-4xl font-medium text-[var(--sc-ivory)]">This reading could not be loaded.</h1>
          <p className="mb-7 text-[var(--sc-stone)]">
            No interpretation should be invented when the profile itself is unavailable.
          </p>
          <Link href="/" className="sc-button-primary">
            Return home <ArrowRight aria-hidden="true" className="h-4 w-4" />
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
      />
    </div>
  );
}
