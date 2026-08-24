import { Link } from "wouter";
import {
  Calculator,
  CheckCircle2,
  Clock3,
  Database,
  Eye,
  Fingerprint,
  Info,
  MapPin,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import Navigation from "@/components/navigation";
import { useActiveProfile } from "@/hooks/useActiveProfile";

type Placement = {
  sign?: string | null;
  verificationStatus?: string;
  status?: string;
  reason?: string;
  internalCandidate?: {
    sign?: string;
    longitude?: number;
    source?: string;
    engine?: string;
    inputTimestamp?: string;
  };
  verificationFailure?: {
    reason?: string;
    attemptedAt?: string;
  };
};

const MAJOR_PLANETS = [
  ["Mercury", "mercury"],
  ["Venus", "venus"],
  ["Mars", "mars"],
  ["Jupiter", "jupiter"],
  ["Saturn", "saturn"],
  ["Uranus", "uranus"],
  ["Neptune", "neptune"],
  ["Pluto", "pluto"],
] as const;

function textValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function PlacementRow({
  label,
  placement,
  legacyValue,
}: {
  label: string;
  placement?: Placement;
  legacyValue?: unknown;
}) {
  const verified =
    placement?.verificationStatus === "verified" && textValue(placement.sign);
  const candidate = textValue(placement?.internalCandidate?.sign);
  const legacy = textValue(legacyValue);

  let value = "Unresolved";
  let state = "Not available";
  let stateClass = "text-[var(--sc-stone)]";
  let explanation = placement?.reason || "No supported placement evidence is stored yet.";

  if (verified) {
    value = verified;
    state = "Verified chart fact";
    stateClass = "text-[var(--sc-teal)]";
  } else if (candidate) {
    value = candidate;
    state = "Calculated candidate · not promoted";
    stateClass = "text-[var(--sc-gold-bright)]";
    explanation =
      placement?.reason ||
      "A calculation exists, but Soul Codex is waiting for the required independent evidence before using it as verified chart data.";
  } else if (legacy) {
    value = legacy;
    state = label === "Sun" ? "Local symbolic value" : "Stored unverified value";
    stateClass = "text-[var(--sc-violet)]";
    explanation =
      label === "Sun"
        ? "This Sun sign is available from the local date-based Foundation calculation. It can support symbolic reflection but is not labeled independently verified here."
        : "This value exists in saved profile data but does not carry the current verified placement contract, so it is not promoted as verified evidence.";
  }

  return (
    <div className="rounded-2xl border border-[var(--sc-line)] bg-white/[0.025] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-[var(--sc-stone)]">{label}</p>
          <p className="mt-1 font-serif text-2xl font-medium text-[var(--sc-ivory)]">{value}</p>
        </div>
        <span className={`text-xs font-semibold ${stateClass}`}>{state}</span>
      </div>
      <p className="mt-3 text-xs leading-5 text-[var(--sc-stone)]">{explanation}</p>
      {candidate && typeof placement?.internalCandidate?.longitude === "number" && (
        <p className="mt-2 text-[11px] text-[var(--sc-stone)]">
          Candidate longitude: {placement.internalCandidate.longitude.toFixed(4)}°
        </p>
      )}
      {placement?.verificationFailure?.reason && (
        <p className="mt-2 rounded-xl border border-amber-400/15 bg-amber-400/[0.04] px-3 py-2 text-[11px] leading-5 text-amber-100/70">
          Last verification issue: {placement.verificationFailure.reason}
        </p>
      )}
    </div>
  );
}

function NumberRow({ label, value }: { label: string; value: unknown }) {
  const shown = textValue(value) ?? "Unresolved";
  return (
    <div className="rounded-xl border border-[var(--sc-line)] bg-white/[0.025] p-3">
      <p className="text-[11px] uppercase tracking-[.12em] text-[var(--sc-stone)]">{label}</p>
      <p className="mt-1 font-serif text-2xl font-medium text-[var(--sc-gold-bright)]">{shown}</p>
    </div>
  );
}

export default function SystemsDetailsPage() {
  const { profile, status } = useActiveProfile();

  if (!profile) {
    return (
      <div className="sc-app-shell">
        <Navigation />
        <main className="sc-page flex min-h-[75vh] items-center justify-center">
          <div className="sc-panel max-w-lg p-8 text-center">
            <Database className="mx-auto mb-4 h-9 w-9 text-[var(--sc-gold)]" />
            <h1 className="font-serif text-3xl font-medium text-[var(--sc-ivory)]">No active profile to inspect</h1>
            <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">
              Create or restore a profile first. The systems inspector reads the same local active profile used by Soul Codex; it does not create another identity record.
            </p>
            <Link href="/create" className="sc-button-primary mt-6 inline-flex">Create profile</Link>
            <p className="mt-4 text-xs text-[var(--sc-stone)]">Repository status: {status}</p>
          </div>
        </main>
      </div>
    );
  }

  const astrology = (profile.astrologyData ?? {}) as Record<string, any>;
  const placements = (astrology.placements ?? {}) as Record<string, Placement>;
  const planets = (astrology.planets ?? {}) as Record<string, Placement>;
  const sunPlacement = (astrology.sun ?? placements.sun) as Placement | undefined;
  const moonPlacement = (astrology.moon ?? placements.moon) as Placement | undefined;
  const risingPlacement = (astrology.rising ?? placements.rising) as Placement | undefined;
  const numerology = (profile.numerologyData ?? profile.personalNumbers ?? {}) as Record<string, any>;
  const humanDesign = (profile.humanDesignData ?? {}) as Record<string, any>;
  const humanDesignStatus = textValue(humanDesign.status) ?? "unverified";
  const humanDesignVerified = humanDesignStatus === "verified";

  const latitude = textValue(profile.latitude);
  const longitude = textValue(profile.longitude);
  const exactTimedInputs = Boolean(
    profile.birthTime && profile.timezone && latitude && longitude,
  );
  const verifiedPlanetCount = MAJOR_PLANETS.filter(
    ([, key]) => planets[key]?.verificationStatus === "verified",
  ).length;

  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="sc-page pb-24">
        <header className="mx-auto mb-7 max-w-4xl text-center">
          <div className="sc-eyebrow mb-4 justify-center"><Eye className="h-3.5 w-3.5" /> Optional inspection layer</div>
          <h1 className="sc-display sc-display-gradient text-4xl sm:text-6xl">See the underlying systems</h1>
          <p className="sc-lede mx-auto mt-5 max-w-3xl">
            Soul Codex keeps the main experience synthesis-first. This page is for the moment you think, “Wait, what did it calculate for my Moon, Rising, planets, or Life Path?” It shows what was calculated, what was verified, what was withheld, and why.
          </p>
        </header>

        <div className="mx-auto max-w-5xl space-y-5">
          <section className="sc-panel p-5 sm:p-7">
            <div className="mb-5 flex items-start gap-3">
              <div className="sc-icon-well"><MapPin className="h-5 w-5" /></div>
              <div>
                <p className="font-semibold text-[var(--sc-ivory)]">Birth inputs used by the calculation layer</p>
                <p className="mt-1 text-sm leading-6 text-[var(--sc-stone)]">These are inputs, not interpretations. Exact timed inputs make Moon, Rising, and the major-planet snapshot calculable; verification determines whether a result is promoted as evidence.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Name", profile.name ?? profile.codename ?? "Unresolved"],
                ["Birth date", profile.birthDate ?? "Unresolved"],
                ["Birth time", profile.birthTime || "Unknown"],
                ["Birth location", profile.birthLocation ?? profile.birthplace?.city ?? "Unresolved"],
                ["Timezone", profile.timezone ?? "Unresolved"],
                ["Coordinates", latitude && longitude ? `${latitude}, ${longitude}` : "Unresolved"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-[var(--sc-line)] bg-white/[0.025] p-3">
                  <p className="text-[11px] uppercase tracking-[.12em] text-[var(--sc-stone)]">{label}</p>
                  <p className="mt-1 break-words text-sm font-semibold text-[var(--sc-ivory)]">{value}</p>
                </div>
              ))}
            </div>
            <div className={`mt-4 flex gap-3 rounded-2xl border p-4 ${exactTimedInputs ? "border-[rgba(114,216,197,.22)] bg-[rgba(114,216,197,.04)]" : "border-amber-400/15 bg-amber-400/[0.035]"}`}>
              {exactTimedInputs ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sc-teal)]" /> : <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-200/80" />}
              <div>
                <p className="text-sm font-semibold text-[var(--sc-ivory)]">{exactTimedInputs ? "Timed chart inputs complete" : "Timed chart inputs incomplete"}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--sc-stone)]">
                  {exactTimedInputs
                    ? "Moon, Ascendant, and major-planet candidates can be calculated from the saved inputs. If a value remains unresolved below, the remaining problem is evidence/verification, not missing birth data."
                    : "Moon, Rising, and timed full-chart layers stay unresolved when exact time, birth-place timezone, or coordinates are missing. Soul Codex does not manufacture the missing precision."}
                </p>
              </div>
            </div>
          </section>

          <section className="sc-panel p-5 sm:p-7">
            <div className="mb-5 flex items-start gap-3">
              <div className="sc-icon-well"><Sparkles className="h-5 w-5" /></div>
              <div>
                <p className="font-semibold text-[var(--sc-ivory)]">Astrology evidence</p>
                <p className="mt-1 text-sm leading-6 text-[var(--sc-stone)]">A calculated candidate can be shown here without pretending it is independently verified. Mercury through Pluto are promoted only after agreement with NASA/JPL Horizons under the approved planetary evidence contract.</p>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <PlacementRow label="Sun" placement={sunPlacement} legacyValue={profile.sunSign ?? astrology.sunSign} />
              <PlacementRow label="Moon" placement={moonPlacement} legacyValue={profile.moonSign ?? astrology.moonSign} />
              <PlacementRow label="Rising" placement={risingPlacement} legacyValue={profile.risingSign ?? astrology.risingSign} />
            </div>

            <div className="mt-6 border-t border-[var(--sc-line)] pt-5">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--sc-ivory)]">Major planets</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--sc-stone)]">{verifiedPlanetCount}/8 independently verified in the currently saved astronomy snapshot.</p>
                </div>
                <span className="rounded-full border border-[var(--sc-line)] bg-white/[0.025] px-3 py-1 text-[11px] font-semibold text-[var(--sc-stone)]">NASA/JPL evidence contract</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {MAJOR_PLANETS.map(([label, key]) => (
                  <PlacementRow key={key} label={label} placement={planets[key]} />
                ))}
              </div>
            </div>
          </section>

          <section className="sc-panel p-5 sm:p-7">
            <div className="mb-5 flex items-start gap-3">
              <div className="sc-icon-well"><Calculator className="h-5 w-5" /></div>
              <div>
                <p className="font-semibold text-[var(--sc-ivory)]">Numerology calculations</p>
                <p className="mt-1 text-sm leading-6 text-[var(--sc-stone)]">The arithmetic is deterministic under Soul Codex&apos;s documented reduction rules. The spiritual or psychological meaning remains symbolic.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <NumberRow label="Life Path" value={profile.lifePathNumber ?? numerology.lifePath} />
              <NumberRow label="Expression" value={numerology.expression} />
              <NumberRow label="Soul Urge" value={numerology.soulUrge} />
              <NumberRow label="Personality" value={numerology.personality} />
              <NumberRow label="Personal Year" value={numerology.personalYear} />
            </div>
            <div className="mt-4 rounded-2xl border border-[var(--sc-line)] bg-white/[0.02] p-4 text-xs leading-6 text-[var(--sc-stone)]">
              <strong className="text-[var(--sc-ivory)]">Why another app might show a different Life Path:</strong> systems can differ in date normalization, reduction order, and treatment of master numbers. Soul Codex parses the supplied birth date as a calendar date rather than shifting it through the device timezone, and preserves 11, 22, and 33 where the current formula defines them.
            </div>
          </section>

          <section className="sc-panel p-5 sm:p-7">
            <div className="mb-5 flex items-start gap-3">
              <div className="sc-icon-well"><Fingerprint className="h-5 w-5" /></div>
              <div>
                <p className="font-semibold text-[var(--sc-ivory)]">Human Design</p>
                <p className="mt-1 text-sm leading-6 text-[var(--sc-stone)]">Human Design stays a supporting layer unless its calculation contract is verified. It should add explanatory depth, not become another unsupported headline.</p>
              </div>
            </div>
            {humanDesignVerified ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <NumberRow label="Type" value={humanDesign.type ?? profile.humanDesignType} />
                <NumberRow label="Strategy" value={humanDesign.strategy} />
                <NumberRow label="Authority" value={humanDesign.authority} />
                <NumberRow label="Profile" value={humanDesign.profile} />
              </div>
            ) : (
              <div className="flex gap-3 rounded-2xl border border-amber-400/15 bg-amber-400/[0.035] p-4">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-200/80" />
                <div>
                  <p className="text-sm font-semibold text-[var(--sc-ivory)]">Not promoted as verified Human Design evidence</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--sc-stone)]">Stored status: {humanDesignStatus}. Candidate fields may exist internally, but this inspector will not relabel them as authoritative chart facts.</p>
                </div>
              </div>
            )}
          </section>

          <section className="sc-panel border-[rgba(114,216,197,.18)] bg-[rgba(114,216,197,.025)] p-5 sm:p-7">
            <div className="flex gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sc-teal)]" />
              <div>
                <p className="font-semibold text-[var(--sc-ivory)]">How these systems affect the main Soul Codex</p>
                <p className="mt-2 text-sm leading-7 text-[var(--sc-stone)]">
                  The main reading should use systems as supporting evidence only when they add a distinct, defensible insight. Repeated labels, weakly verified layers, and systems that merely restate the same theme stay out of the foreground. This inspector exists so nothing has to be hidden from a curious user just to keep the main experience clear.
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--sc-stone)]">
                  Houses, Midheaven, nodes, Chiron, planetary house placements, palmistry computer vision, and astrocartography lines remain unavailable until their evidence contracts are production-grade. “Not ready” is preferable to decorative precision.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
