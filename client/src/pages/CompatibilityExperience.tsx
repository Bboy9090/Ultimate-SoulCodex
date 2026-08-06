import { useEffect, useMemo, useState } from "react";
import Navigation from "../components/navigation";
import HumanDepthSurface, { type HumanDepthItem } from "../components/HumanDepthSurface";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "../lib/queryClient";

interface Profile {
  id: string | number;
  name?: string;
  [key: string]: any;
}

interface Result {
  overallScore: number;
  dimensions: { identity: number; stress: number; values: number; decisions: number };
  friction: string[];
  synergy: string[];
  growthOpportunities: string[];
  profile1Name?: string;
  profile2Name?: string;
  confidence?: { badge?: string; label?: string; reason?: string };
  systemsUsed?: Array<{ system: string; score?: number }>;
  systemsExcluded?: Array<{ system: string; reason?: string }>;
  missingDataWarnings?: string[];
}

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

function scoreLanguage(score: number) {
  const value = clamp(score);
  if (value >= 80) return "This area may feel naturally reinforcing, but ease still requires honest communication and reciprocal effort.";
  if (value >= 60) return "This area appears workable with meaningful overlap and enough difference to require translation rather than assumption.";
  if (value >= 40) return "This area may alternate between connection and friction depending on stress, timing, and whether needs are stated directly.";
  return "This area may require deliberate communication, boundaries, and realistic expectations. A lower score is not a verdict on the relationship.";
}

function relationshipItem(id: string, title: string, observation: string, score?: number, kind: "synergy" | "friction" | "growth" | "dimension" = "dimension"): HumanDepthItem {
  const scoreText = typeof score === "number" ? ` The model assigned ${clamp(score)}%, which should be treated as a summary signal rather than the meaning itself.` : "";
  return {
    id,
    title,
    observation: `${observation}${scoreText}`,
    realLife: kind === "synergy" ? [
      "You may recover from small misunderstandings more easily because there is enough shared language, pace, or value beneath them.",
      "Support can feel natural here, but unspoken expectations may still turn an easy strength into quiet resentment.",
      "The useful test is whether this strength remains present during stress, inconvenience, and disagreement, not only during good moments.",
    ] : kind === "friction" ? [
      "One person may interpret the other's pace, silence, intensity, directness, or need for space as a statement about love rather than a difference in regulation or communication.",
      "The same argument may repeat because each person is defending a different need while discussing only the visible behavior.",
      "Friction becomes more informative when you can name the trigger, the assumption, the unmet need, and the repair each person recognizes.",
    ] : [
      "Notice whether you make decisions at the same speed or whether one person needs discussion while the other needs space, evidence, or immediate action.",
      "Compare what each person does under pressure. Compatibility in calm conditions does not automatically predict conflict behavior.",
      "Ask whether your shared values produce shared behavior. Agreement in theory is less useful than what both people repeatedly choose.",
    ],
    benefit: kind === "friction" ? "Difference can expose blind spots and teach clearer boundaries, repair, and translation when both people are willing to participate." : "This area can become a dependable source of connection when both people understand what is actually working and protect it deliberately.",
    tradeoff: kind === "synergy" ? "Ease can create complacency. People sometimes stop explaining, appreciating, or repairing because they expect the connection to carry itself." : "Without direct communication, difference can become mind-reading, scorekeeping, withdrawal, control, or repeated arguments about the wrong issue.",
    misunderstanding: "Compatibility does not mean sameness, permanence, safety, or destiny. It describes patterns that may become easier or harder under specific conditions.",
    relationshipView: "The central question is not 'Are we compatible?' It is 'What happens between us when needs, stress responses, and decision styles differ, and can we repair without erasing either person?'",
    practicalTakeaway: "Choose one recurring interaction. Each person names what happened, what they assumed, what they needed, and one repair action they would actually recognize.",
    evidence: typeof score === "number" ? `Based on the compatibility dimension score and available profile systems. ${scoreLanguage(score)}` : "Based on generated compatibility themes. Interpretive statements must be tested against the relationship's lived history.",
  };
}

export default function CompatibilityExperience() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [aId, setAId] = useState("");
  const [bId, setBId] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/profiles", { credentials: "include" })
      .then((response) => {
        if (!response.ok) throw new Error("Saved profiles could not be loaded.");
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        const safe = Array.isArray(data) ? data : [];
        setProfiles(safe);
        setAId(String(safe[0]?.id ?? ""));
        setBId(String(safe[1]?.id ?? ""));
      })
      .catch((error) => active && setMessage(error instanceof Error ? error.message : "Saved profiles could not be loaded."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  async function compare() {
    if (!aId || !bId || aId === bId) {
      setMessage("Choose two different saved profiles.");
      return;
    }
    setReportLoading(true);
    setMessage("");
    try {
      const response = await apiRequest("POST", "/api/compatibility", { profile1Id: aId, profile2Id: bId });
      const data = await response.json();
      const compatibility = data.compatibilityData || {};
      const dimensions = compatibility.dimensions || {};
      setResult({
        overallScore: data.overallScore ?? compatibility.overall ?? 0,
        dimensions: {
          identity: dimensions.identity?.score ?? dimensions.identity ?? 0,
          stress: dimensions.stress?.score ?? dimensions.stress ?? 0,
          values: dimensions.values?.score ?? dimensions.values ?? 0,
          decisions: dimensions.decisions?.score ?? dimensions.decisions ?? 0,
        },
        friction: compatibility.friction ?? data.friction ?? [],
        synergy: compatibility.synergy ?? data.synergy ?? [],
        growthOpportunities: compatibility.growthOpportunities ?? data.growthOpportunities ?? [],
        profile1Name: data.profile1Name,
        profile2Name: data.profile2Name,
        confidence: data.confidence ?? compatibility.confidence,
        systemsUsed: data.systemsUsed ?? compatibility.systemsUsed,
        systemsExcluded: data.systemsExcluded ?? compatibility.systemsExcluded,
        missingDataWarnings: data.missingDataWarnings ?? compatibility.missingDataWarnings,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Compatibility could not be calculated.");
    } finally {
      setReportLoading(false);
    }
  }

  const personA = profiles.find((profile) => String(profile.id) === aId);
  const personB = profiles.find((profile) => String(profile.id) === bId);

  const items = useMemo<HumanDepthItem[]>(() => {
    if (!result) return [];
    const built: HumanDepthItem[] = [
      relationshipItem("identity", "Identity and recognition", scoreLanguage(result.dimensions.identity), result.dimensions.identity),
      relationshipItem("stress", "Stress and repair", scoreLanguage(result.dimensions.stress), result.dimensions.stress),
      relationshipItem("values", "Values in practice", scoreLanguage(result.dimensions.values), result.dimensions.values),
      relationshipItem("decisions", "Decision pace and style", scoreLanguage(result.dimensions.decisions), result.dimensions.decisions),
    ];
    result.synergy.forEach((value, index) => built.push(relationshipItem(`synergy-${index}`, "Where connection may feel natural", value, undefined, "synergy")));
    result.friction.forEach((value, index) => built.push(relationshipItem(`friction-${index}`, "Where misunderstanding may repeat", value, undefined, "friction")));
    result.growthOpportunities.forEach((value, index) => built.push(relationshipItem(`growth-${index}`, "What this relationship may ask you to practice", value, undefined, "growth")));
    return built;
  }, [result]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
        <header className="mb-7 rounded-3xl border border-rose-300/20 bg-gradient-to-br from-violet-950/70 to-black/40 p-6 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-200">Relationship intelligence</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-6xl">Explain the relationship, not just the score.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/68">A percentage cannot tell you how two people misunderstand each other, what feels easy, what breaks under stress, or what repair actually looks like. This report follows the numbers into lived interaction.</p>
        </header>

        <Card className="mb-7 border-white/10 bg-black/20"><CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="grid gap-2 text-sm font-semibold">First profile<select value={aId} onChange={(event) => setAId(event.target.value)} className="min-h-11 rounded-xl border border-white/10 bg-background px-3">{profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name || `Profile ${profile.id}`}</option>)}</select></label>
          <label className="grid gap-2 text-sm font-semibold">Second profile<select value={bId} onChange={(event) => setBId(event.target.value)} className="min-h-11 rounded-xl border border-white/10 bg-background px-3">{profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name || `Profile ${profile.id}`}</option>)}</select></label>
          <Button onClick={compare} disabled={loading || reportLoading}>{reportLoading ? "Explaining…" : "Compare deeply"}</Button>
        </CardContent></Card>

        {message && <p className="mb-5 rounded-xl border border-amber-300/20 bg-amber-300/10 p-4 text-amber-100">{message}</p>}

        {result && <>
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-5"><Badge className="text-base">Overall {clamp(result.overallScore)}%</Badge><strong>{result.profile1Name || personA?.name} + {result.profile2Name || personB?.name}</strong><span className="text-sm text-white/55">{result.confidence?.label || result.confidence?.badge || "Interpretive confidence shown in evidence details"}</span></div>
          <HumanDepthSurface profileId={`${aId}-${bId}`} heading="How this connection may work in real life" intro="Use the score as navigation, not judgment. The meaning lives in repeated behavior, stress, communication, repair, and whether both people remain willing to participate." items={items} />
          {(result.missingDataWarnings?.length || result.systemsExcluded?.length) ? <details className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5"><summary className="cursor-pointer font-semibold">Missing data and excluded systems</summary><ul className="mt-3 space-y-2 text-sm text-white/60">{result.missingDataWarnings?.map((warning) => <li key={warning}>• {warning}</li>)}{result.systemsExcluded?.map((entry) => <li key={entry.system}>• {entry.system}: {entry.reason || "not included"}</li>)}</ul></details> : null}
        </>}
      </main>
    </div>
  );
}
