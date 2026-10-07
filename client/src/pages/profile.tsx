import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Crown, Share2, Shield, Sparkles } from "lucide-react";
import Navigation from "@/components/navigation";
import { useProductAccess } from "../hooks/useProductAccess";
import DiamondClosure from "@/components/DiamondClosure";
import HumanDepthSurface, { type HumanDepthItem } from "@/components/HumanDepthSurface";
import NatalReportDownloadButton from "@/components/NatalReportDownloadButton";
import { ShareModal } from "@/components/ShareModal";
import { Button } from "@/components/ui/button";
import type { Profile } from "@shared/schema";
import { tierAllowsCapability } from "@shared/product-access";
import { explainProfileLabel } from "../lib/profileLabelExplanation";
import {
  getSynthesisAstrologySign,
  hasVerifiedHumanDesignTrust,
} from "../lib/profileVerificationReconciliation";

const text = (...values: unknown[]) => values.find((value) => typeof value === "string" && value.trim().length > 0) as string | undefined;

export default function ProfilePage() {
  const { id } = useParams();
  const [shareOpen, setShareOpen] = useState(false);
  const { data: profile, isLoading, error } = useQuery<Profile>({
    queryKey: ["/api/profiles", id],
    enabled: Boolean(id),
  });
  const { tier } = useProductAccess();

  const items = useMemo<HumanDepthItem[]>(() => {
    if (!profile) return [];
    const astrology = (profile.astrologyData ?? {}) as any;
    const numerology = (profile.numerologyData ?? {}) as any;
    const personality = (profile.personalityData ?? {}) as any;
    const archetype = (profile.archetypeData ?? {}) as any;
    const result: HumanDepthItem[] = [];

    const biography = text(profile.biography, archetype.description);
    if (biography) {
      result.push({
        id: "core-story",
        title: archetype.title || "Your core story",
        observation: biography,
        realLife: [
          "Notice where this theme appears in actual decisions rather than only in words that sound meaningful.",
          "Compare how the pattern changes at work, with family, in close relationships, and when you are alone.",
          "Compare any symbolic tension with a specific event; a chart does not establish your motives.",
        ],
        benefit: "A useful core story can organize scattered details into a pattern you can recognize and work with.",
        tradeoff: "A story becomes limiting when it hardens into identity and makes contradictory experiences feel invalid.",
        misunderstanding: "Symbolic language can sound more certain than the evidence allows. Recognition matters more than dramatic wording.",
        relationshipView: "The people closest to you may see different versions of this pattern. Their experience can add context without overruling your own.",
        practicalTakeaway: "Name one recent event that supports this description and one that complicates it. Keep both. Nuance is more useful than forced agreement.",
        evidence: "Built from the saved biography and archetype description. These are interpretive synthesis fields, not clinical findings.",
      });
    }

    for (const strength of archetype.strengths ?? []) result.push(explainProfileLabel(String(strength), "strength", profile));
    for (const growth of archetype.shadows ?? archetype.growthAreas ?? []) result.push(explainProfileLabel(String(growth), "growth", profile));

    const sun = getSynthesisAstrologySign(astrology, "sun");
    const moon = getSynthesisAstrologySign(astrology, "moon");
    const rising = getSynthesisAstrologySign(astrology, "rising");
    if (sun || moon || rising) {
      result.push({
        id: "astrology-big-three",
        title: "How the Big Three may divide the work",
        observation: `Your saved profile lists ${sun ? `${sun} Sun` : "an unresolved Sun"}, ${moon ? `${moon} Moon` : "an unresolved Moon"}, and ${rising ? `${rising} Rising` : "an unresolved Rising"}. Rather than treating these as three personality slogans, use them as three different questions about identity, emotional processing, and first response.`,
        realLife: [
          "The Sun layer is most useful when asking what you are trying to develop, express, or stand behind consciously.",
          "The Moon layer is most useful when asking what restores safety and what becomes automatic when emotions are involved.",
          "The Rising layer is most useful when asking what other people meet first and how you enter unfamiliar situations.",
        ],
        benefit: "Separating the layers can explain why you may appear one way, feel another way privately, and still choose a third response deliberately.",
        tradeoff: "The model becomes shallow when signs are reduced to stereotypes or used to excuse behavior.",
        misunderstanding: "A placement does not force a trait. It offers symbolic language for testing patterns against lived experience.",
        relationshipView: "Conflict often begins when another person responds to the visible layer while you expect them to understand the private one.",
        practicalTakeaway: "During one emotionally important moment, write down what you showed, what you felt, and what you chose. Compare the three without forcing them to match.",
        evidence: "Derived from saved astrology fields. Birth-time-dependent claims remain limited when the recorded time is missing or approximate.",
      });
    }

    if (numerology.lifePath || numerology.expression || numerology.soulUrge) {
      result.push({
        id: "numerology-core",
        title: "What your core numbers are trying to describe",
        observation: `The saved profile includes Life Path ${numerology.lifePath ?? "unknown"}, Expression ${numerology.expression ?? "unknown"}, and Soul Urge ${numerology.soulUrge ?? "unknown"}. These numbers should not sit on the page like serial numbers for a soul. Each points to a different question: recurring life lessons, outward capacity, and inward motivation.`,
        realLife: [
          "Life Path is most useful when looking for themes that repeat across different periods rather than predicting a fixed destiny.",
          "Expression is most useful when asking what skills or modes of contribution become available when you are engaged and practiced.",
          "Soul Urge is most useful when asking what feels meaningful even when nobody is watching or rewarding you.",
        ],
        benefit: "Used together, the numbers can expose a gap between what you can do, what life keeps asking you to learn, and what you privately want.",
        tradeoff: "A number becomes restrictive when it is treated as permission to stop growing or as proof that every matching sentence must be true.",
        misunderstanding: "Numerology is deterministic as arithmetic but interpretive in meaning. The calculation can be exact while the explanation remains symbolic.",
        relationshipView: "Differences often matter less than whether two people understand each other's priorities, pace, and way of contributing.",
        practicalTakeaway: "Choose one current responsibility. Ask whether it serves your development, uses your real capacities, and matters to you inwardly. A mismatch tells you more than the number alone.",
        evidence: "The numeric values come from saved calculations. Their psychological or spiritual meanings are interpretive.",
      });
    }

    if (personality.enneagram?.type || personality.mbti?.type) {
      result.push({
        id: "personality-bridge",
        title: "How assessed personality may show up under pressure",
        observation: `Your saved assessments include ${personality.enneagram?.type ? `Enneagram Type ${personality.enneagram.type}` : "no Enneagram result"} and ${personality.mbti?.type ? personality.mbti.type : "no MBTI result"}. These systems are most useful when they explain motivation and information-processing habits, not when they become decorative identity badges.`,
        realLife: [
          "Notice which need becomes urgent during conflict: safety, control, understanding, approval, freedom, competence, peace, or something else.",
          "Notice what kind of information you trust first and what evidence you tend to ignore when rushed.",
          "Compare your relaxed behavior with your stressed behavior. A useful model should explain the change, not pretend you act the same everywhere.",
        ],
        benefit: "Assessment language can make invisible motives and decision habits easier to discuss.",
        tradeoff: "Typing can become an excuse, a social costume, or a way to avoid evidence that does not fit the preferred identity.",
        misunderstanding: "Your type describes a tendency within a model. It does not contain your history, maturity, context, culture, or every choice.",
        relationshipView: "The practical value is learning how another person interprets your behavior and how to state the need underneath it before resentment does the translating.",
        practicalTakeaway: "Identify one recent disagreement. Separate what happened, what you assumed, what you needed, and what you actually communicated.",
        evidence: "Based on saved user-assessment fields. Assessment quality depends on honest responses and the limits of each framework.",
      });
    }

    const guidance = text(profile.dailyGuidance, archetype.guidance);
    if (guidance) {
      result.push({
        id: "guidance",
        title: "Turn guidance into an observable experiment",
        observation: guidance,
        realLife: [
          "A useful guidance statement should change one decision, conversation, boundary, or repeated behavior.",
          "The action should be small enough to complete and specific enough that you can tell what happened afterward.",
          "If the statement only sounds beautiful, it belongs in decoration rather than guidance.",
        ],
        benefit: "Guidance becomes valuable when it turns reflection into a testable next step.",
        tradeoff: "Vague guidance can create the feeling of insight without producing evidence, change, or clearer self-understanding.",
        misunderstanding: "Symbolic guidance is not a command or prediction. You remain responsible for context and consequences.",
        relationshipView: "When guidance involves another person, communicate directly rather than silently testing whether they can guess what you need.",
        practicalTakeaway: "Rewrite the guidance as one sentence beginning with “Today I will…” and include a behavior another person could observe.",
        evidence: "Drawn from the saved daily and archetype guidance fields. Relevance must be confirmed through lived experience.",
      });
    }

    return result;
  }, [profile]);

  if (isLoading) return <div className="sc-app-shell"><Navigation /><main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4"><p className="text-[var(--sc-stone)]">Building the reading from available evidence…</p></main></div>;

  if (error || !profile) return <div className="sc-app-shell"><Navigation /><main className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-4"><div className="sc-panel p-8 text-center"><Shield className="mx-auto mb-4 h-10 w-10 text-[var(--sc-danger)]" /><h1 className="mb-2 font-serif text-2xl font-semibold text-[var(--sc-ivory)]">Profile not found</h1><p className="mb-5 text-[var(--sc-stone)]">The requested profile could not be loaded.</p><Link href="/" className="sc-button-primary">Return home</Link></div></main></div>;

  const astrology = (profile.astrologyData ?? {}) as any;
  const numerology = (profile.numerologyData ?? {}) as any;
  const humanDesign = (profile.humanDesignData ?? {}) as any;
  const archetype = (profile.archetypeData ?? {}) as any;
  const sun = getSynthesisAstrologySign(astrology, "sun");
  const moon = getSynthesisAstrologySign(astrology, "moon");
  const rising = getSynthesisAstrologySign(astrology, "rising");
  const humanDesignVerified = hasVerifiedHumanDesignTrust(humanDesign);
  const canSeeFullNumerology = tierAllowsCapability(tier, "full_name_numerology");
  const canSeeHumanDesignDepth = tierAllowsCapability(tier, "human_design_depth");
  const canUsePremiumExports = tierAllowsCapability(tier, "premium_exports");

  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
        <Link href="/"><Button variant="ghost" className="mb-6 text-[var(--sc-stone)] hover:text-[var(--sc-ivory)]"><ArrowLeft className="mr-2 h-4 w-4" /> Back home</Button></Link>

        <header className="sc-panel sc-panel-gold relative mb-8 overflow-hidden p-6 sm:p-9">
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            aria-hidden="true"
            style={{ background: "radial-gradient(circle at 92% 5%, rgba(154,116,220,.16), transparent 31%), radial-gradient(circle at 14% 100%, rgba(217,182,111,.06), transparent 25%)" }}
          />
          <div className="relative">
            <div className="sc-eyebrow mb-4"><Crown className="h-3.5 w-3.5" />Unified Soul Codex</div>
            <h1 className="sc-display sc-display-gradient">{profile.name}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--sc-stone)] sm:text-lg">This page now explains the profile as one connected human story. Labels remain visible, but none of them are allowed to stand alone and pretend they explained you.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {sun && <span className="rounded-full border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.07)] px-3 py-1.5 text-[11px] font-medium text-[#ead9b9]">{sun} Sun</span>}
              {moon && <span className="rounded-full border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.07)] px-3 py-1.5 text-[11px] font-medium text-[#ead9b9]">{moon} Moon</span>}
              {rising && <span className="rounded-full border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.07)] px-3 py-1.5 text-[11px] font-medium text-[#ead9b9]">{rising} Rising</span>}
              {numerology.lifePath && <span className="rounded-full border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.07)] px-3 py-1.5 text-[11px] font-medium text-[#ead9b9]">Life Path {numerology.lifePath}</span>}
              {archetype.title && <span className="rounded-full border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.07)] px-3 py-1.5 text-[11px] font-medium text-[#ead9b9]">{archetype.title}</span>}
            </div>
          </div>
        </header>

        <div className="mb-7 rounded-[1.35rem] border border-white/[0.065] bg-white/[0.018] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="sc-icon-well shrink-0"><Sparkles className="h-[18px] w-[18px]" /></span>
            <div>
              <h2 className="font-serif text-xl font-semibold text-[var(--sc-ivory)]">One profile, one explanation standard</h2>
              <p className="mt-1 leading-7 text-[var(--sc-stone)]">Astrology, numerology, personality, archetype, biography, and guidance are integrated below. Evidence labels stay separate from interpretation, and your feedback corrects the explanation rather than rewriting calculated data.</p>
            </div>
          </div>
        </div>

        <section className="mb-8 grid gap-3 lg:grid-cols-3" aria-label="Core profile">
          <details className="sc-panel p-5">
            <summary className="cursor-pointer list-none">
              <p className="sc-eyebrow">Your Big 3</p>
              <h2 className="mt-2 font-serif text-xl font-semibold text-[var(--sc-ivory)]">Identity · emotions · first impression</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">
                {sun ? `${sun} Sun` : "Sun unresolved"} · {moon ? `${moon} Moon` : "Moon unresolved"} · {rising ? `${rising} Rising` : "Rising unresolved"}
              </p>
            </summary>
            <div className="mt-5 space-y-3 border-t border-white/[0.06] pt-4 text-sm leading-6 text-[var(--sc-stone)]">
              <p><strong className="text-[var(--sc-ivory)]">Sun</strong> — how identity and conscious expression are symbolically framed.</p>
              <p><strong className="text-[var(--sc-ivory)]">Moon</strong> — how emotional processing is symbolically framed.</p>
              <p><strong className="text-[var(--sc-ivory)]">Rising</strong> — how approach and first presentation are symbolically framed.</p>
              <p>Birth-time-dependent placements remain unresolved unless the underlying chart evidence supports them.</p>
              <Link href="/systems" className="inline-flex items-center text-[var(--sc-gold-bright)] no-underline">Why am I seeing this?</Link>
            </div>
          </details>

          <details className="sc-panel p-5">
            <summary className="cursor-pointer list-none">
              <p className="sc-eyebrow">Your Core Numbers</p>
              <h2 className="mt-2 font-serif text-xl font-semibold text-[var(--sc-ivory)]">Life Path · Expression · Soul Urge</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">
                Life Path {numerology.lifePath ?? "—"} · {canSeeFullNumerology ? `Expression ${numerology.expression ?? "—"} · Soul Urge ${numerology.soulUrge ?? "—"} · Personality ${numerology.personality ?? "—"} · Maturity ${numerology.maturity ?? "—"}` : "Expression + Soul Urge + Personality + Maturity · Soul Codex+"}
              </p>
            </summary>
            <div className="mt-5 space-y-3 border-t border-white/[0.06] pt-4 text-sm leading-6 text-[var(--sc-stone)]">
              <p>The number calculations are deterministic when the required birth data is present. Their meanings remain symbolic reflection, not verified psychology.</p>
              {!canSeeFullNumerology && (
                <Link href="/pricing" className="inline-flex items-center text-[var(--sc-gold-bright)] no-underline">
                  Unlock full name numerology with Soul Codex+
                </Link>
              )}
              <Link href="/systems" className="inline-flex items-center text-[var(--sc-gold-bright)] no-underline">Why am I seeing this?</Link>
            </div>
          </details>

          <details className="sc-panel p-5">
            <summary className="cursor-pointer list-none">
              <p className="sc-eyebrow">Your Human Design</p>
              <h2 className="mt-2 font-serif text-xl font-semibold text-[var(--sc-ivory)]">Type · Strategy · Authority · Profile</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">
                {humanDesignVerified
                  ? canSeeHumanDesignDepth
                    ? `${humanDesign.type ?? "—"} · ${humanDesign.strategy ?? "—"} · ${humanDesign.authority ?? "—"} · ${humanDesign.profile ?? "—"}`
                    : "Verified · deeper Human Design in Soul Codex+"
                  : "Not verified yet"}
              </p>
            </summary>
            <div className="mt-5 space-y-3 border-t border-white/[0.06] pt-4 text-sm leading-6 text-[var(--sc-stone)]">
              <p>{humanDesignVerified
                ? canSeeHumanDesignDepth
                  ? "Type, Strategy, Authority, and Profile passed the governed Human Design trust boundary. Their practical meaning is still a symbolic framework to test against lived experience."
                  : "Human Design is verified for this profile. Soul Codex+ unlocks the verified Type, Strategy, Authority, and Profile. Centers and channels are not sold here until their premium surface is fully qualified."
                : "Soul Codex will not invent Type, Strategy, Authority, or Profile when the required verification is missing."}</p>
              {humanDesignVerified && !canSeeHumanDesignDepth && (
                <Link href="/pricing" className="inline-flex items-center text-[var(--sc-gold-bright)] no-underline">
                  Unlock Human Design depth
                </Link>
              )}
              <Link href="/systems" className="inline-flex items-center text-[var(--sc-gold-bright)] no-underline">Why am I seeing this?</Link>
            </div>
          </details>
        </section>

        <HumanDepthSurface profileId={String(id)} heading="How these patterns may live in you" intro="Read for recognition, contradiction, cost, context, and usable action. Reject anything that does not fit your lived experience." items={items} />

        <div className="mt-8">
          <DiamondClosure
            clarity="Keep the strongest supported pattern. Do not turn every label into identity."
            depth="Your Big 3, core numbers, Human Design, and lived evidence each do different jobs. Expand only the layer you need, and use Why when you want provenance."
            nextMove={profile.dailyGuidance || archetype.guidance || "Choose one pattern from this reading and test it against one real event today."}
            nextHref={`/reading/${id}`}
            nextLabel="Continue the reading"
          />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`/reading/${id}`} className="sc-button-primary">Open full Quick / Standard / Deep Dive reading</Link>
          <Button type="button" variant="secondary" onClick={() => setShareOpen(true)}><Share2 className="mr-2 h-4 w-4" />Create public card</Button>
          <NatalReportDownloadButton
            profileId={String(id)}
            profileName={profile.name}
            isPremium={canUsePremiumExports}
          />
        </div>
        {shareOpen && (
          <ShareModal
            profileId={String(id)}
            profileName={profile.name}
            onClose={() => setShareOpen(false)}
          />
        )}
      </main>
    </div>
  );
}
