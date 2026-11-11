import { useQuery } from "@tanstack/react-query";

type BirthMomentResponse =
  | {
      status: "verified_calculation";
      astronomicalFacts: {
        utcInstant: string;
        timezoneProvenance: { kind: "explicit_iso_offset"; suppliedOffset: string };
        moonPhase: string;
        illuminationPercent: number;
        elongationDegrees: number;
        calculationContract: string;
        source: string;
      };
      symbolicInterpretation: null;
    }
  | {
      status: "unavailable";
      reason: string;
      astronomicalFacts: null;
      symbolicInterpretation: null;
    };

const unavailableMessages: Record<string, string> = {
  birth_time_unknown: "No exact birth time was saved. A single birth-moment Moon calculation would be a guess.",
  birth_timezone_unknown: "Birthplace timezone information is missing. An exact astronomical instant cannot be resolved.",
  birth_date_invalid: "The saved birth date needs correction before this calculation can run.",
  birth_time_unresolved: "The saved local birth time is invalid or ambiguous under historical timezone rules. No instant was selected.",
};

export default function BirthMomentPanel({ profileId }: { profileId: string }) {
  const { data, isLoading, isError } = useQuery<BirthMomentResponse>({
    queryKey: ["/api/profiles", profileId, "birth-moment"],
    enabled: Boolean(profileId),
    retry: false,
  });

  return (
    <section className="sc-panel mb-8 p-5 sm:p-6" aria-labelledby="birth-moment-heading">
      <p className="sc-eyebrow">Astronomical evidence · Included on Free</p>
      <h2 id="birth-moment-heading" className="mt-2 font-serif text-xl font-semibold text-[var(--sc-ivory)]">
        The Moon at your birth moment
      </h2>
      {isLoading ? (
        <p className="mt-3 text-sm text-[var(--sc-stone)]" role="status">Calculating verified birth-moment facts…</p>
      ) : isError || !data ? (
        <p className="mt-3 text-sm text-[var(--sc-stone)]" role="status">
          Birth-moment evidence could not be loaded. No lunar result has been assumed.
        </p>
      ) : data.status === "unavailable" ? (
        <p className="mt-3 text-sm leading-7 text-[var(--sc-stone)]" role="status">
          {unavailableMessages[data.reason] ?? "Birth-moment evidence remains unavailable; no substitute result was generated."}
        </p>
      ) : (
        <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--sc-stone)]">
          <p className="font-medium text-[var(--sc-ivory)]">
            {data.astronomicalFacts.moonPhase} · {data.astronomicalFacts.illuminationPercent}% illuminated
          </p>
          <p>Sun–Moon elongation: {data.astronomicalFacts.elongationDegrees.toFixed(1)}°.</p>
          <details className="rounded-xl border border-white/10 p-3">
            <summary className="cursor-pointer font-medium text-[var(--sc-ivory)]">Source and calculation evidence</summary>
            <dl className="mt-3 space-y-1">
              <div><dt className="inline font-semibold">UTC instant: </dt><dd className="inline">{data.astronomicalFacts.utcInstant}</dd></div>
              <div><dt className="inline font-semibold">Saved offset: </dt><dd className="inline">{data.astronomicalFacts.timezoneProvenance.suppliedOffset}</dd></div>
              <div><dt className="inline font-semibold">Engine: </dt><dd className="inline">{data.astronomicalFacts.source}</dd></div>
              <div><dt className="inline font-semibold">Contract: </dt><dd className="inline">{data.astronomicalFacts.calculationContract}</dd></div>
            </dl>
          </details>
        </div>
      )}
      <p className="mt-4 text-xs leading-6 text-[var(--sc-stone)]">
        This is an astronomical calculation, not a personality diagnosis or spiritual prediction.
        Eclipse proximity, lunar age, houses and symbolic meaning require separate evidence.
      </p>
    </section>
  );
}
