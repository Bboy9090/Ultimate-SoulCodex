import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import Navigation from "@/components/navigation";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { useProductAccess } from "@/hooks/useProductAccess";
import { tierAllowsCapability } from "@shared/product-access";
import { compareFriendCharts } from "@/lib/friendChartCompatibility";
import { personalAtlasPlacements } from "@/lib/personalAstrologyAtlas";
import {
  BIG_THREE,
  EVERYTHING_VERIFIED,
  SHARE_FIELD_OPTIONS,
  SoulCircleError,
  buildShareSelection,
  chartChips,
  comparablePlacements,
  needsVerification,
  soulCircleApi,
  toggleField,
  type SoulCircleChart,
  type SoulCircleField,
  type SoulCircleFriend,
} from "@/lib/soulCircleClient";

function ChipRow({ chart, label }: { chart: SoulCircleChart | null | undefined; label: string }) {
  const chips = chartChips(chart);
  if (chips.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2" aria-label={label}>
      {chips.map((chip) => <span key={chip.key} className="sc-trust-chip">{chip.label}: {chip.value}</span>)}
    </div>
  );
}

export default function SoulCircleFriendPage() {
  const { id = "" } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { profile } = useActiveProfile();
  const { tier } = useProductAccess();
  const deeperUnlocked = tierAllowsCapability(tier, "interpretation_depth");

  const [friend, setFriend] = useState<SoulCircleFriend | null>(null);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<SoulCircleField[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<SoulCircleChart | null>(null);
  const [needsVerify, setNeedsVerify] = useState(false);

  const load = useCallback(async () => {
    try {
      const loaded = await soulCircleApi.getFriend(id);
      setFriend(loaded);
      setFields(loaded.iShare?.fields ?? []);
      setDisplayName(loaded.myPreview?.displayName ?? "");
      setMissing(false);
    } catch (failure) {
      if (failure instanceof SoulCircleError && (failure.status === 404 || failure.code === "soul_circle_not_found")) setMissing(true);
      else setError(failure instanceof SoulCircleError ? failure.message : "This friend could not be loaded.");
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  // Comparison happens here, on this device, against this person's own saved chart.
  const comparison = useMemo(() => {
    const theirs = comparablePlacements(friend?.theirChart);
    const mine = personalAtlasPlacements((((profile as any)?.verifiedAstrologyData ?? profile?.astrologyData) ?? {}) as any)
      .filter((placement) => placement.kind !== "angle" && placement.house)
      .map(({ key, sign, house }) => ({ key, sign, house }));
    if (theirs.length === 0 || mine.length === 0) return { result: null, theirs: theirs.length, mine: mine.length };
    return { result: compareFriendCharts(mine, theirs), theirs: theirs.length, mine: mine.length };
  }, [friend?.theirChart, profile]);

  async function saveSharing() {
    setError(""); setNeedsVerify(false); setSaved(null);
    const built = buildShareSelection(fields, displayName);
    if (!built.ok) { setError(built.message); return; }
    setSaving(true);
    try {
      const result = await soulCircleApi.setShare(id, built.selection);
      setSaved(result.preview);
      await load();
    } catch (failure) {
      setNeedsVerify(needsVerification(failure));
      setError(failure instanceof SoulCircleError ? failure.message : "Sharing could not be updated.");
    } finally { setSaving(false); }
  }

  async function act(run: () => Promise<void>, failureMessage: string, after?: () => void) {
    setError("");
    try { await run(); after ? after() : await load(); }
    catch (failure) { setError(failure instanceof SoulCircleError ? failure.message : failureMessage); }
  }

  const identityHref = (profile as any)?.id ? `/profile/${(profile as any).id}` : "/create";
  const visiblePerspectives = comparison.result ? (deeperUnlocked ? comparison.result.friendshipPerspectives : comparison.result.friendshipPerspectives.slice(0, 1)) : [];
  const visibleMoments = comparison.result ? (deeperUnlocked ? comparison.result.conversationMoments : comparison.result.conversationMoments.slice(0, 2)) : [];

  if (missing) {
    return (
      <div className="sc-app-shell"><Navigation /><main className="sc-page">
        <section className="sc-panel max-w-xl p-6" data-testid="circle-friend-missing">
          <h1 className="font-serif text-2xl text-[var(--sc-ivory)]">That friend isn&apos;t in your circle</h1>
          <Link href="/circle" className="sc-button-secondary mt-4 inline-flex no-underline">Back to Soul Circle</Link>
        </section>
      </main></div>
    );
  }

  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="sc-page">
        <Link href="/circle" className="text-sm text-[var(--sc-gold-bright)] no-underline">← Soul Circle</Link>
        <header className="pb-6 pt-3">
          <p className="sc-eyebrow">Friend</p>
          <h1 className="mt-3 font-serif text-[clamp(2rem,6vw,3.5rem)] leading-[1.02] text-[var(--sc-ivory)]" data-testid="circle-friend-name">{friend?.displayName ?? "Loading…"}</h1>
        </header>

        {error ? (
          <p role="alert" className="mb-4 rounded-xl border border-[rgba(255,120,120,.3)] bg-[rgba(255,120,120,.06)] p-3 text-sm text-[var(--sc-ivory-soft)]">
            {error}{needsVerify ? <> <Link href={identityHref} className="font-semibold text-[var(--sc-gold-bright)]">Open your Identity to verify →</Link></> : null}
          </p>
        ) : null}

        {friend ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="sc-panel p-5" aria-labelledby="circle-theirs-title" data-testid="circle-theirs">
              <h2 id="circle-theirs-title" className="font-serif text-2xl text-[var(--sc-ivory)]">What they share with you</h2>
              {friend.theirChartStatus === "shared" ? (
                <>
                  <ChipRow chart={friend.theirChart} label="Their shared signs" />
                  <p className="mt-3 text-xs leading-5 text-[var(--sc-stone)]">Independently verified signs only. This updates on its own if they re-verify, and stops the moment they stop sharing.</p>
                </>
              ) : friend.theirChartStatus === "unavailable" ? (
                <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">They chose to share, but none of those signs are independently verified yet. Nothing is guessed in the meantime.</p>
              ) : (
                <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">They haven&apos;t shared anything with you yet. You don&apos;t need to do anything; their signs will appear here if they choose to share.</p>
              )}
            </section>

            <section className="sc-panel p-5" aria-labelledby="circle-mine-title" data-testid="circle-sharing">
              <h2 id="circle-mine-title" className="font-serif text-2xl text-[var(--sc-ivory)]">What you share with them</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">Only this friend, only what you tick, and only what is independently verified. Nothing is shared until you save.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="sc-button-secondary" onClick={() => setFields(BIG_THREE)}>Sun, Moon &amp; Rising</button>
                <button type="button" className="sc-button-secondary" onClick={() => setFields(EVERYTHING_VERIFIED)}>Everything verified</button>
                <button type="button" className="sc-button-secondary" onClick={() => setFields([])}>Nothing</button>
              </div>
              <fieldset className="mt-4 space-y-3">
                <legend className="sr-only">Choose what this friend can see</legend>
                {SHARE_FIELD_OPTIONS.map((option) => (
                  <label key={option.field} className="flex cursor-pointer items-start gap-3 text-sm text-[var(--sc-ivory-soft)]">
                    <input type="checkbox" className="mt-1 h-4 w-4" checked={fields.includes(option.field)} onChange={() => setFields((current) => toggleField(current, option.field))} data-testid={`circle-field-${option.field}`} />
                    <span><span className="font-semibold">{option.label}</span><span className="block text-xs text-[var(--sc-stone)]">{option.hint}</span></span>
                  </label>
                ))}
              </fieldset>
              {fields.includes("displayName") ? (
                <div className="mt-3">
                  <label htmlFor="circle-display-name" className="text-sm text-[var(--sc-ivory-soft)]">Name this friend sees</label>
                  <input id="circle-display-name" value={displayName} maxLength={80} onChange={(event) => setDisplayName(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-[var(--sc-ivory)]" autoComplete="off" />
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={saveSharing} disabled={saving} className="sc-button-primary" data-testid="circle-save-sharing">{saving ? "Saving…" : friend.iShare ? "Update sharing" : "Start sharing"}</button>
                {friend.iShare ? <button type="button" className="sc-button-secondary" onClick={() => act(() => soulCircleApi.stopSharing(id), "Could not stop sharing.")} data-testid="circle-stop-sharing">Stop sharing</button> : null}
              </div>
              {friend.iShare ? (
                <div className="mt-4 rounded-xl border border-[var(--sc-line-gold)] p-3" data-testid="circle-my-preview">
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-[var(--sc-stone)]">They can see right now</p>
                  <ChipRow chart={saved ?? friend.myPreview} label="What this friend sees of you" />
                  {chartChips(saved ?? friend.myPreview).length === 0 ? <p className="mt-2 text-xs text-[var(--sc-stone)]">Nothing yet. None of your picks are independently verified.</p> : null}
                  <p className="mt-2 text-xs text-[var(--sc-stone)]">Sharing renews every 180 days and ends if either of you leaves.</p>
                </div>
              ) : null}
            </section>

            <section className="sc-panel p-5 lg:col-span-2" aria-labelledby="circle-compare-title" data-testid="circle-compare">
              <p className="sc-eyebrow">Compared on your device</p>
              <h2 id="circle-compare-title" className="mt-2 font-serif text-2xl text-[var(--sc-ivory)]">You &amp; {friend.displayName}</h2>
              {comparison.result ? (
                <>
                  <p className="mt-3 text-base leading-7 text-[var(--sc-ivory-soft)]">{comparison.result.guideSummary.headline}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{comparison.result.guideSummary.streetTranslation}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="sc-trust-chip">Evidence: {comparison.result.friendshipCoverage.matched}/4 friendship placements on both charts</span>
                    {comparison.result.friendshipScore !== null ? <span className="sc-trust-chip">Friendship resonance {comparison.result.friendshipScore}/100</span> : null}
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {visiblePerspectives.map((item) => (
                      <article key={item.key} className="rounded-xl border border-white/10 bg-black/15 p-4">
                        <h3 className="font-serif text-xl text-[var(--sc-ivory)]">{item.label}</h3>
                        <p className="mt-2 text-sm leading-6 text-[var(--sc-ivory-soft)]">{item.youExperienceThem}</p>
                        <p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{item.theyExperienceYou}</p>
                      </article>
                    ))}
                  </div>
                  {visibleMoments.length > 0 ? (
                    <div className="mt-5" data-testid="circle-conversation-lab">
                      <h3 className="font-serif text-xl text-[var(--sc-ivory)]">Conversation Lab: a reading worth talking about</h3>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {visibleMoments.map((moment) => (
                          <article key={moment.key} className="rounded-xl border border-white/10 bg-black/15 p-4">
                            <h4 className="font-serif text-lg text-[var(--sc-ivory)]">{moment.label}</h4>
                            <p className="mt-1 text-xs text-[var(--sc-stone)]">{moment.basis}</p>
                            <p className="mt-3 text-base font-semibold leading-7 text-[var(--sc-gold-bright)]">{moment.question}</p>
                            <p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{moment.followUp}</p>
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {!deeperUnlocked && (comparison.result.friendshipPerspectives.length > visiblePerspectives.length || comparison.result.conversationMoments.length > visibleMoments.length) ? (
                    <p className="mt-4 text-sm text-[var(--sc-stone)]">Free includes a first look. <Link href="/pricing" className="font-semibold text-[var(--sc-gold-bright)]">Soul Codex+</Link> opens the rest of the supported placements.</p>
                  ) : null}
                  <p className="mt-4 text-xs leading-5 text-[var(--sc-stone)]">Symbolic reflection from placements you both have verified, not a measure of the friendship or a prediction. Your own chart never leaves this device to make this comparison.</p>
                </>
              ) : (
                <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]" data-testid="circle-compare-unavailable">
                  {comparison.theirs === 0
                    ? "Comparison needs them to share their verified planets and houses with you."
                    : <>Comparison needs verified planets and houses on your own chart. <Link href={identityHref} className="font-semibold text-[var(--sc-gold-bright)]">Verify your chart →</Link></>}
                </p>
              )}
            </section>

            <section className="sc-panel p-5 lg:col-span-2" aria-label="Leave or block">
              <div className="flex flex-wrap gap-3">
                <button type="button" className="sc-button-secondary" data-testid="circle-remove" onClick={() => { if (window.confirm(`Remove ${friend.displayName} from your Soul Circle? Both of you stop sharing with each other.`)) void act(() => soulCircleApi.removeFriend(id), "Could not remove this friend.", () => navigate("/circle")); }}>Remove from circle</button>
                <button type="button" className="sc-button-secondary" data-testid="circle-block" onClick={() => { if (window.confirm(`Block ${friend.displayName}? They won't be told, and sharing stops immediately both ways.`)) void act(() => soulCircleApi.blockFriend(id), "Could not block this person.", () => navigate("/circle")); }}>Block</button>
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
