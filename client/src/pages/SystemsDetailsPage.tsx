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
import UltimateCodexPanel from "@/components/UltimateCodexPanel";
import type { PlacementLike } from "@soulcodex/core";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { getSynthesisPlacement, getVerifiedPlacement } from "@/lib/placementVerification";
import { hasVerifiedHumanDesignTrust } from "@/lib/profileVerificationReconciliation";
import { humanDesignListLabel, normalizeHumanDesignCenters } from "@/lib/humanDesignDisplay";
import { buildUltimateCodexSynthesis } from "@/lib/ultimateCodexSynthesis";

type Placement = PlacementLike & {
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
  const verified = textValue(getVerifiedPlacement(placement)?.sign);
  const synthesisPlacement = getSynthesisPlacement(placement);
  const stable = synthesisPlacement?.evidenceState === "stable_across_range" ? textValue(synthesisPlacement.sign) : null;
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
  } else if (stable) {
    value = stable;
    state = "Stable across full-day range";
    stateClass = "text-[var(--sc-gold-bright)]";
    explanation = placement?.reason || "This sign stayed identical across every supported birth-time value in the full-day range. It may influence synthesis with range provenance but is not relabeled independently verified.";
  } else if (placement?.evidenceState === "conditional") {
    value = "Multiple possibilities";
    state = "Conditional · branch only";
    stateClass = "text-amber-300";
    explanation = placement?.reason || "This placement changes across the supported birth-time range and is excluded from the main synthesis.";
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
        ? "This is a local calendar Sun candidate only. It is excluded from personality synthesis until ephemeris evidence independently verifies it or proves it stable across the full supported time range."
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
      {placement?.evidenceState === "conditional" && Array.isArray(placement.conditionalValues) && placement.conditionalValues.length > 0 && (
        <div className="mt-2 rounded-xl border border-amber-400/15 bg-amber-400/[0.035] px-3 py-2 text-[11px] leading-5 text-amber-100/80">
          <strong>Rectification branches:</strong>{" "}
          {placement.conditionalValues.map((branch) =>
            `${branch.value ?? "?"} ${branch.startLocalTime ?? ""}–${branch.endLocalTime ?? ""}`
          ).join(" · ")}
        </div>
      )}
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
            <Link href="/systems/atlas" className="mt-4 block underline">Explore the Astrology Atlas without a profile</Link>
            <p className="mt-4 text-xs text-[var(--sc-stone)]">Repository status: {status}</p>
          </div>
        </main>
      </div>
    );
  }

  const astrology = (profile.astrologyData ?? {}) as Record<string, any>;
  const placements = (astrology.placements ?? {}) as Record<string, Placement>;
  const sunPlacement = (astrology.sun ?? placements.sun) as Placement | undefined;
  const moonPlacement = (astrology.moon ?? placements.moon) as Placement | undefined;
  const risingPlacement = (astrology.rising ?? placements.rising) as Placement | undefined;
  const numerology = (profile.numerologyData ?? profile.personalNumbers ?? {}) as Record<string, any>;
  const humanDesign = (profile.humanDesignData ?? {}) as Record<string, any>;
  const ultimateCodex = buildUltimateCodexSynthesis(profile);
  const humanDesignStatus = textValue(humanDesign.status) ?? "unverified";
  const humanDesignVerified = hasVerifiedHumanDesignTrust(humanDesign);
  const humanDesignRange = humanDesign.status === "range_analyzed" && humanDesign.components ? humanDesign.components : null;
  const stableHdEntries = humanDesignRange
    ? Object.entries(humanDesignRange).filter(([, value]: any) =>
        value?.evidenceState === "stable_across_range" &&
        value?.rangeEvidence?.resolutionMinutes === 1 &&
        value?.rangeEvidence?.testedValues === 1440)
    : [];
  const conditionalHdEntries = humanDesignRange
    ? Object.entries(humanDesignRange).filter(([, value]: any) => value?.evidenceState === "conditional")
    : [];
  const humanDesignCenters = normalizeHumanDesignCenters(humanDesign.centers);

  const latitude = textValue(profile.latitude);
  const longitude = textValue(profile.longitude);
  const exactTimedInputs = Boolean(
    profile.birthTime && profile.timezone && latitude && longitude,
  );

  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="sc-page pb-24">
        <header className="mx-auto mb-7 max-w-4xl text-center">
          <div className="sc-eyebrow mb-4 justify-center"><Eye className="h-3.5 w-3.5" /> Optional inspection layer</div>
          <h1 className="sc-display sc-display-gradient text-4xl sm:text-6xl">See the underlying systems</h1>
          <p className="sc-lede mx-auto mt-5 max-w-3xl">
            Soul Codex keeps the main experience synthesis-first. This page is for the moment you think, “Wait, what did it calculate for my Moon, Rising, or Life Path?” It shows what was calculated, what was verified, what was withheld, and why.
          </p>
        </header>

        <div className="mx-auto max-w-5xl space-y-5">
          <Link href="/systems/atlas" className="sc-panel block p-5">
            <h2 className="font-serif text-2xl">Explore the Astrology Atlas</h2>
            <p className="mt-2">All 144 sign-and-house combinations, with meanings, reflection prompts, and clear guidance when your birth time is unknown.</p>
          </Link>
          <section className="sc-panel p-5 sm:p-7">
            <div className="mb-5 flex items-start gap-3">
              <div className="sc-icon-well"><MapPin className="h-5 w-5" /></div>
              <div>
                <p className="font-semibold text-[var(--sc-ivory)]">Birth inputs used by the calculation layer</p>
                <p className="mt-1 text-sm leading-6 text-[var(--sc-stone)]">These are inputs, not interpretations. Exact timed inputs make Moon/Rising calculable; verification determines whether a result is promoted as evidence.</p>
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
                    ? "Moon and Ascendant candidates can be calculated from the saved inputs. If either remains unresolved below, the remaining problem is evidence/verification, not missing birth data."
                    : "Missing inputs reduce scope rather than honesty. With a known birthplace timezone and unknown time, Soul Codex can run a full-day range analysis: invariant placements become stable-across-range evidence, changing placements stay conditional, and location/time-sensitive geometry remains unavailable until its required inputs exist."}
                </p>
              </div>
            </div>
          </section>

          <section className="sc-panel p-5 sm:p-7">
            <div className="mb-5 flex items-start gap-3">
              <div className="sc-icon-well"><Sparkles className="h-5 w-5" /></div>
              <div>
                <p className="font-semibold text-[var(--sc-ivory)]">Astrology evidence</p>
                <p className="mt-1 text-sm leading-6 text-[var(--sc-stone)]">A calculated candidate can be shown here without pretending it is independently verified. The main synthesis may use only the evidence tier permitted by its contract.</p>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <PlacementRow label="Sun" placement={sunPlacement} legacyValue={profile.sunSign ?? astrology.sunSign} />
              <PlacementRow label="Moon" placement={moonPlacement} legacyValue={profile.moonSign ?? astrology.moonSign} />
              <PlacementRow label="Rising" placement={risingPlacement} legacyValue={profile.risingSign ?? astrology.risingSign} />
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <NumberRow label="Life Path" value={profile.lifePathNumber ?? numerology.lifePath} />
              <NumberRow label="Birthday" value={numerology.birthday} />
              <NumberRow label="Expression" value={numerology.expression} />
              <NumberRow label="Soul Urge" value={numerology.soulUrge} />
              <NumberRow label="Personality" value={numerology.personality} />
              <NumberRow label="Maturity" value={numerology.maturity} />
              <NumberRow label="Personal Year" value={numerology.personalYear} />
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--sc-stone)]">Life Path and Birthday are deterministic from birth date. Expression, Soul Urge, Personality Number, and Maturity require the explicit full birth name and remain unavailable when it is missing. Personal Year is a date-based changing cycle and is kept out of the permanent Codex fingerprint.</p>
            <div className="mt-4 rounded-2xl border border-[var(--sc-line)] bg-white/[0.02] p-4 text-xs leading-6 text-[var(--sc-stone)]">
              <strong className="text-[var(--sc-ivory)]">Why another app might show a different Life Path:</strong> systems can differ in date normalization, reduction order, and treatment of master numbers. Soul Codex preserves 11, 22, and 33 where the current formula defines them instead of silently reducing them.
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
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <NumberRow label="Type" value={humanDesign.type ?? profile.humanDesignType} />
                  <NumberRow label="Strategy" value={humanDesign.strategy} />
                  <NumberRow label="Authority" value={humanDesign.authority} />
                  <NumberRow label="Profile" value={humanDesign.profile} />
                  <NumberRow label="Definition" value={humanDesign.definition} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-[var(--sc-line)] bg-white/[0.025] p-4 text-xs leading-6 text-[var(--sc-stone)]"><strong className="text-[var(--sc-ivory)]">Centers</strong><br />Defined: {humanDesignCenters.defined.join(", ") || "None"}<br />Open/undefined: {humanDesignCenters.undefined.join(", ") || "None"}</div>
                  <div className="rounded-xl border border-[var(--sc-line)] bg-white/[0.025] p-4 text-xs leading-6 text-[var(--sc-stone)]"><strong className="text-[var(--sc-ivory)]">Bodygraph detail</strong><br />Channels: {humanDesignListLabel(humanDesign.channels, "channel")}<br />Activated gates: {humanDesignListLabel(humanDesign.activatedGates, "gate")}</div>
                </div>
              </div>
            ) : stableHdEntries.length > 0 || conditionalHdEntries.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[rgba(217,182,111,.22)] bg-[rgba(217,182,111,.04)] p-4">
                  <p className="text-sm font-semibold text-[var(--sc-ivory)]">Human Design partially available from full-day range analysis</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--sc-stone)]">Stable components may support synthesis with range provenance. Changing components remain conditional and are not promoted into the main reading.</p>
                </div>
                {stableHdEntries.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {stableHdEntries.map(([key, value]: any) => (
                      <NumberRow key={key} label={key.replace(/([A-Z])/g, " $1")} value={value.value || "None"} />
                    ))}
                  </div>
                )}
                {conditionalHdEntries.length > 0 && (
                  <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.035] p-4 text-xs leading-6 text-[var(--sc-stone)]">
                    <strong className="text-[var(--sc-ivory)]">Conditional until birth time · branch-only:</strong>
                    <div className="mt-2 space-y-2">
                      {conditionalHdEntries.map(([key, value]: any) => (
                        <div key={key}>
                          <span className="font-semibold capitalize text-[var(--sc-ivory-soft)]">{key.replace(/([A-Z])/g, " $1")}:</span>{" "}
                          {Array.isArray(value?.conditionalValues) && value.conditionalValues.length
                            ? value.conditionalValues.map((branch: any) =>
                                `${branch.value ?? "?"} ${branch.startLocalTime ?? ""}–${branch.endLocalTime ?? ""}`
                              ).join(" · ")
                            : "Changes across the supported day."}
                        </div>
                      ))}
                    </div>
                    <p className="mt-2">These windows are rectification evidence, not certified Human Design data, and do not enter the main synthesis.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-3 rounded-2xl border border-amber-400/15 bg-amber-400/[0.035] p-4">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-200/80" />
                <div>
                  <p className="text-sm font-semibold text-[var(--sc-ivory)]">Human Design unavailable under the current evidence</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--sc-stone)]">Stored status: {humanDesignStatus}. Soul Codex will not guess missing components or relabel incomplete data as verified.</p>
                </div>
              </div>
            )}
          </section>

          <UltimateCodexPanel synthesis={ultimateCodex} />

          <section className="sc-panel border-[rgba(114,216,197,.18)] bg-[rgba(114,216,197,.025)] p-5 sm:p-7">
            <div className="flex gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sc-teal)]" />
              <div>
                <p className="font-semibold text-[var(--sc-ivory)]">How these systems affect the main Soul Codex</p>
                <p className="mt-2 text-sm leading-7 text-[var(--sc-stone)]">
                  The main reading should use systems as supporting evidence only when they add a distinct, defensible insight. Repeated labels, weakly verified layers, and systems that merely restate the same theme stay out of the foreground. This inspector exists so nothing has to be hidden from a curious user just to keep the main experience clear.
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--sc-stone)]">
                  Verified Equal House geometry, Midheaven, planetary-house assignments, Mean Nodes, qualified Chiron, and verified Human Design now support the written Codex while remaining visibly symbolic interpretation. Palmistry computer vision and astrocartography lines remain unavailable until their own evidence contracts are production-grade. “Not ready” is preferable to decorative precision.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
