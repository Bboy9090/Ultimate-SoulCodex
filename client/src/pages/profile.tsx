import { useMemo } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Crown, Shield, Sparkles } from "lucide-react";
import Navigation from "@/components/navigation";
import HumanDepthSurface, { type HumanDepthItem } from "@/components/HumanDepthSurface";
import { Button } from "@/components/ui/button";
import type { Profile } from "@shared/schema";

const text = (...values: unknown[]) => values.find((value) => typeof value === "string" && value.trim().length > 0) as string | undefined;

function explainLabel(label: string, kind: "strength" | "growth"): HumanDepthItem {
  const clean = label.trim();
  const strength = kind === "strength";
  return {
    id: `${kind}-${clean.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    title: clean,
    observation: strength
      ? `${clean} is more useful as a lived pattern than as a flattering label. It may describe the way you respond when responsibility, loyalty, care, judgment, or contribution matters to you.`
      : `${clean} is not a verdict about your character. It points to a response that may once have protected you, but can become costly when it is repeated without checking what the present situation actually requires.`,
    realLife: strength
      ? [
          `In decisions, ${clean.toLowerCase()} may show up as taking time to make the choice useful, dependable, or aligned rather than merely fast.`,
          `At work or while creating, people may rely on this quality before they fully recognize how much attention and effort it requires from you.`,
          `In conflict, the same strength may be visible in what you repair, organize, protect, explain, or continue carrying after others have stepped back.`,
        ]
      : [
          `Under pressure, ${clean.toLowerCase()} may become faster and less flexible, making an old protective response feel like the only available option.`,
          `In relationships, another person may notice the behavior while missing the fear, need, or unfinished experience underneath it.`,
          `In work or creativity, this pattern may appear as delay, overwork, withdrawal, control, repetition, or difficulty declaring a version complete.`,
        ],
    benefit: strength
      ? `Used deliberately, ${clean.toLowerCase()} can make you steady, useful, trustworthy, perceptive, or capable of turning good intentions into something other people can actually feel and depend on.`
      : `Even a difficult pattern often began as protection. It may have helped you avoid chaos, rejection, helplessness, conflict, wasted effort, or the feeling of being controlled.`,
    tradeoff: strength
      ? `The cost begins when ${clean.toLowerCase()} becomes an obligation rather than a choice. You may carry too much, expect yourself to remain composed, or keep proving a strength that other people have started taking for granted.`
      : `The tradeoff is that protection can outlive the danger. What once created safety may now reduce honesty, flexibility, closeness, completion, or your ability to respond to the situation in front of you.`,
    misunderstanding: strength
      ? `People may see the result and miss the internal work behind it. Calm can be mistaken for indifference, loyalty for endless tolerance, independence for distance, and careful thought for hesitation.`
      : `Other people may judge the visible response without understanding its purpose. Explanation matters, but the pattern still remains your responsibility to notice and update.`,
    relationshipView: `The clearest relationship move is to name the hidden need directly. Do not require another person to decode care, fear, boundaries, or overwhelm from silence, intensity, over-explaining, control, or disappearance.`,
    practicalTakeaway: strength
      ? `Choose one place where this strength deserves a boundary. Keep the useful part, but stop performing the version that requires you to abandon your own limits.`
      : `The next time this response appears, pause long enough to ask: “What am I protecting, and is that protection still necessary here?” Then choose one smaller, direct action instead of repeating the full reflex.`,
    evidence: `This item came from the saved archetype ${kind === "strength" ? "strength" : "growth"} list. It is symbolic interpretation, not a diagnosis or independently verified fact.`,
  };
}

export default function ProfilePage() {
  const { id } = useParams();
  const { data: profile, isLoading, error } = useQuery<Profile>({
    queryKey: ["/api/profiles", id],
    enabled: Boolean(id),
  });

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
          "Pay attention to the contradiction: a real pattern often contains both a strength and the behavior that protects it.",
        ],
        benefit: "A useful core story can organize scattered details into a pattern you can recognize and work with.",
        tradeoff: "A story becomes limiting when it hardens into identity and makes contradictory experiences feel invalid.",
        misunderstanding: "Symbolic language can sound more certain than the evidence allows. Recognition matters more than dramatic wording.",
        relationshipView: "The people closest to you may see different versions of this pattern. Their experience can add context without overruling your own.",
        practicalTakeaway: "Name one recent event that supports this description and one that complicates it. Keep both. Nuance is more useful than forced agreement.",
        evidence: "Built from the saved biography and archetype description. These are interpretive synthesis fields, not clinical findings.",
      });
    }

    for (const strength of archetype.strengths ?? []) result.push(explainLabel(String(strength), "strength"));
    for (const growth of archetype.shadows ?? archetype.growthAreas ?? []) result.push(explainLabel(String(growth), "growth"));

    const sun = astrology.sunSign ?? astrology.sun?.sign;
    const moon = astrology.moonSign ?? astrology.moon?.sign;
    const rising = astrology.risingSign ?? astrology.rising?.sign;
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
  const archetype = (profile.archetypeData ?? {}) as any;

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
              {astrology.sunSign && <span className="rounded-full border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.07)] px-3 py-1.5 text-[11px] font-medium text-[#ead9b9]">{astrology.sunSign} Sun</span>}
              {astrology.moonSign && <span className="rounded-full border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.07)] px-3 py-1.5 text-[11px] font-medium text-[#ead9b9]">{astrology.moonSign} Moon</span>}
              {astrology.risingSign && <span className="rounded-full border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.07)] px-3 py-1.5 text-[11px] font-medium text-[#ead9b9]">{astrology.risingSign} Rising</span>}
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

        <HumanDepthSurface profileId={String(id)} heading="How these patterns may live in you" intro="Read for recognition, contradiction, cost, context, and usable action. Reject anything that does not fit your lived experience." items={items} />

        <div className="mt-8 flex justify-center"><Link href={`/profile/${id}/reading`} className="sc-button-primary">Open full Quick / Standard / Deep Dive reading</Link></div>
      </main>
    </div>
  );
}
