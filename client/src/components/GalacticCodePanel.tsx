import { useMutation } from "@tanstack/react-query";
import { AlertCircle, Crown, RefreshCw, Sparkles } from "lucide-react";
import type { GalacticCodeResult } from "@shared/galactic-code/types";
import type { SoulCodexTier } from "@shared/product-access";
import { tierAllowsCapability } from "@shared/product-access";
import { apiRequest } from "@/lib/queryClient";
import { GalacticCodeMap } from "@/components/GalacticCodeMap";
import { Button } from "@/components/ui/button";

type GalacticCodeBrief = Pick<
  GalacticCodeResult,
  "version" | "coverage" | "codename" | "designation" | "tagline" | "primaryFunction" | "sourceCoverage"
>;

type GalacticCodeResponse = {
  revision: string;
  tier: SoulCodexTier;
  result: GalacticCodeBrief | GalacticCodeResult;
};

function isFullGalacticCode(result: GalacticCodeBrief | GalacticCodeResult): result is GalacticCodeResult {
  return "axes" in result && Array.isArray((result as GalacticCodeResult).axes);
}

function coverageLabel(value: "complete" | "partial" | "missing") {
  if (value === "complete") return "Strong";
  if (value === "partial") return "Some";
  return "Not available";
}

function galacticErrorCopy(error: Error | null) {
  const status = error?.message.match(/^(\d{3}):/)?.[1];

  if (status === "422") {
    return {
      title: "This synthesis needs more verified evidence.",
      body: "Verify more of the profile first, then try again. Soul Codex will not substitute guessed placements for missing evidence.",
    };
  }
  if (status === "429") {
    return {
      title: "Too many synthesis requests.",
      body: "Give this profile a moment before trying again. Your saved profile and existing evidence are unchanged.",
    };
  }
  if (status === "503") {
    return {
      title: "Synthesis is temporarily unavailable.",
      body: "The service could not complete the request right now. Try again later; Soul Codex will not fall back to guessed evidence.",
    };
  }
  if (status === "404") {
    return {
      title: "This profile is not available for synthesis.",
      body: "The saved profile could not be found for the current account or session. Reopen the profile and try again.",
    };
  }

  return {
    title: "This synthesis could not be built.",
    body: "Try again. If the problem continues, verify the saved profile and its evidence before retrying.",
  };
}

export default function GalacticCodePanel({
  profileId,
  tier,
}: {
  profileId: string;
  tier: SoulCodexTier;
}) {
  const canSeeDepth = tierAllowsCapability(tier, "cross_system_synthesis");
  const mutation = useMutation<GalacticCodeResponse, Error>({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/profiles/${encodeURIComponent(profileId)}/galactic-code`, {});
      return await response.json();
    },
  });

  const result = mutation.data?.result;
  const fullResult = result && isFullGalacticCode(result) ? result : null;
  const errorCopy = galacticErrorCopy(mutation.error);

  return (
    <section className="mt-8" aria-labelledby="galactic-code-heading">
      <div className="sc-panel sc-panel-gold overflow-hidden p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <div className="sc-eyebrow mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Soul Codex synthesis
            </div>
            <h2 id="galactic-code-heading" className="font-serif text-2xl font-semibold text-[var(--sc-ivory)]">
              One clear pattern from the evidence that actually qualifies
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--sc-stone)]">
              This combines only the parts of your saved profile that pass their evidence rules. It does not fill missing birth time,
              guess Human Design, or treat symbolic systems as verified psychology.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="shrink-0"
          >
            {mutation.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Building…
              </>
            ) : mutation.data ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh synthesis
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Build my synthesis
              </>
            )}
          </Button>
        </div>

        {mutation.isError && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[var(--sc-line)] bg-white/[0.025] p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sc-danger)]" />
            <div>
              <p className="font-medium text-[var(--sc-ivory)]">{errorCopy.title}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--sc-stone)]">
                {errorCopy.body}
              </p>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-6 border-t border-white/[0.06] pt-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.07)] px-3 py-1 text-[11px] font-medium text-[#ead9b9]">
                {result.coverage === "high" ? "Strong evidence coverage" : result.coverage === "partial" ? "Partial evidence coverage" : "Limited evidence coverage"}
              </span>
              {mutation.data?.tier === "plus" && canSeeDepth && (
                <span className="inline-flex items-center rounded-full border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.07)] px-3 py-1 text-[11px] font-medium text-[#ead9b9]">
                  <Crown className="mr-1 h-3 w-3" />
                  Soul Codex+ depth
                </span>
              )}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,.7fr)]">
              <div>
                <p className="sc-eyebrow">{result.designation}</p>
                <h3 className="mt-2 font-serif text-3xl font-semibold text-[var(--sc-ivory)]">{result.codename}</h3>
                <p className="mt-3 text-base leading-7 text-[var(--sc-stone)]">{result.tagline}</p>
                <div className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[.12em] text-[var(--sc-gold-bright)]">Main pattern</p>
                  <p className="mt-2 text-base leading-7 text-[var(--sc-ivory)]">{result.primaryFunction}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="text-[var(--sc-stone)]">Astrology</p>
                  <p className="mt-1 font-medium text-[var(--sc-ivory)]">{coverageLabel(result.sourceCoverage.astrology)}</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="text-[var(--sc-stone)]">Human Design</p>
                  <p className="mt-1 font-medium text-[var(--sc-ivory)]">{coverageLabel(result.sourceCoverage.humanDesign)}</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="text-[var(--sc-stone)]">Numerology</p>
                  <p className="mt-1 font-medium text-[var(--sc-ivory)]">{coverageLabel(result.sourceCoverage.numerology)}</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="text-[var(--sc-stone)]">Behavior evidence</p>
                  <p className="mt-1 font-medium text-[var(--sc-ivory)]">
                    {result.sourceCoverage.behavioralTraitCount > 0 ? `${result.sourceCoverage.behavioralTraitCount} supported` : "Not available"}
                  </p>
                </div>
              </div>
            </div>

            {fullResult && canSeeDepth ? (
              <div className="mt-7">
                <GalacticCodeMap code={fullResult} />
              </div>
            ) : tier === "free" ? (
              <div className="mt-6 rounded-2xl border border-[var(--sc-line)] bg-white/[0.02] p-4 text-sm leading-6 text-[var(--sc-stone)]">
                The clear core stays visible on Free. Soul Codex+ expands this same evidence into the deeper pattern map instead of replacing it with a different reading.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
