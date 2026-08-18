import { useMemo, useState } from "react";
import { BrainCircuit, Loader2, Send, ShieldCheck, Sparkles } from "lucide-react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { apiFetch } from "@/lib/queryClient";

type EvidenceSummary = {
  profileUsed: boolean;
  verifiedAstrology: Record<string, string>;
  deterministicNumerology: Record<string, number>;
  verifiedHumanDesign: Record<string, string>;
  symbolicContext: Record<string, string>;
  unresolved: string[];
};

type GuideResponse = {
  content: string;
  status: string;
  provider: string;
  evidence: EvidenceSummary;
  usage: {
    premium: boolean;
    used: number;
    limit: number | null;
    remaining: number | null;
  };
};

type HistoryItem = { role: "user" | "assistant"; content: string };

const SECTION_ORDER = ["Pattern", "Why", "Need", "Gift", "Cost", "Action", "Evidence"] as const;

function parseDiamond(text: string) {
  return SECTION_ORDER.map((section, index) => {
    const next = SECTION_ORDER[index + 1];
    const start = text.search(new RegExp(`\\*\\*${section}\\*\\*`, "i"));
    if (start < 0) return null;
    const afterLabel = text.slice(start).replace(new RegExp(`^\\*\\*${section}\\*\\*\\s*`, "i"), "");
    const end = next ? afterLabel.search(new RegExp(`\\*\\*${next}\\*\\*`, "i")) : -1;
    const body = (end >= 0 ? afterLabel.slice(0, end) : afterLabel).trim();
    return { section, body };
  }).filter((item): item is { section: typeof SECTION_ORDER[number]; body: string } => Boolean(item));
}

function EvidenceBadge({ label, value }: { label: string; value: string }) {
  return <span className="rounded-full border border-[rgba(57,194,173,.18)] bg-[rgba(57,194,173,.055)] px-3 py-1.5 text-[11px] text-[var(--sc-ivory-soft)]"><strong>{label}:</strong> {value}</span>;
}

export default function SoulGuidePage() {
  const { profile } = useActiveProfile();
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [response, setResponse] = useState<GuideResponse | null>(null);
  const [useServerProfile, setUseServerProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remoteId = typeof profile?.remoteId === "string" && profile.remoteId.trim()
    ? profile.remoteId.trim()
    : null;
  const sections = useMemo(() => response ? parseDiamond(response.content) : [], [response]);

  const submit = async () => {
    const cleanMessage = message.trim();
    if (!cleanMessage || loading) return;
    setLoading(true);
    setError(null);

    const requestHistory = history.slice(-6);
    try {
      const result = await apiFetch("/api/soul-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          message: cleanMessage,
          history: requestHistory,
          ...(useServerProfile && remoteId ? { profileId: remoteId } : {}),
        }),
      });

      if (!result.ok) {
        const payload = await result.json().catch(() => ({}));
        const text = typeof payload?.message === "string" ? payload.message : `Soul Guide returned ${result.status}.`;
        throw new Error(text);
      }

      const payload = await result.json() as GuideResponse;
      setResponse(payload);
      setHistory([...requestHistory, { role: "user", content: cleanMessage }, { role: "assistant", content: payload.content }].slice(-6));
      setMessage("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Soul Guide could not complete the request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6">
        <header className="sc-panel sc-panel-gold relative overflow-hidden p-6 sm:p-9">
          <div className="relative">
            <div className="sc-eyebrow mb-4"><BrainCircuit className="h-3.5 w-3.5" />Soul Guide</div>
            <h1 className="sc-display sc-display-gradient">Ask for clarity, not manufactured certainty</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--sc-stone)] sm:text-lg">
              Soul Guide answers one concrete question at a time and must show the evidence boundary underneath the answer. Missing placements stay missing. Symbolic systems remain symbolic.
            </p>
          </div>
        </header>

        <section className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sc-teal)]" />
            <div className="min-w-0 flex-1">
              <h2 className="m-0 font-serif text-lg font-semibold text-[var(--sc-ivory)]">Profile privacy boundary</h2>
              {remoteId ? (
                <>
                  <p className="mt-1 text-sm leading-6 text-[var(--sc-stone)]">A server-backed profile is available. Personalization is off until you explicitly enable it. Even then, the server sends the AI only verified astronomy, deterministic numerology, verified Human Design core fields, and a clearly labeled symbolic archetype title. It does not send birth date, birth location, coordinates, or the whole profile blob.</p>
                  <label className="mt-3 flex cursor-pointer items-center gap-3 text-sm text-[var(--sc-ivory-soft)]">
                    <input
                      type="checkbox"
                      checked={useServerProfile}
                      onChange={(event) => setUseServerProfile(event.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-black/30"
                      data-testid="toggle-soul-guide-profile"
                    />
                    Use my verified server-profile evidence for this conversation
                  </label>
                </>
              ) : (
                <p className="mt-1 text-sm leading-6 text-[var(--sc-stone)]">Your active profile is local-only or no server profile is linked. Soul Guide will stay general. It will not upload the local profile behind your back, because apparently consent is a feature worth keeping.</p>
              )}
            </div>
          </div>
        </section>

        <section className="sc-panel mt-6 p-5 sm:p-6">
          <label htmlFor="soul-guide-message" className="text-xs font-bold uppercase tracking-[.14em] text-[var(--sc-gold)]">Your question</label>
          <textarea
            id="soul-guide-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={6}
            maxLength={4000}
            placeholder="Describe one concrete situation, repeated pattern, decision, or conversation you want to understand…"
            className="mt-3 w-full resize-y rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3.5 text-sm leading-7 text-[var(--sc-ivory)] outline-none placeholder:text-[var(--sc-stone)]/60 focus:border-[rgba(217,182,111,.35)]"
            data-testid="input-soul-guide"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 text-[11px] leading-5 text-[var(--sc-stone)]">Ask about observable behavior and choices. High-stakes medical, legal, financial, or safety decisions must not be based on symbolic interpretation.</p>
            <Button
              type="button"
              onClick={submit}
              disabled={loading || !message.trim()}
              className="gap-2"
              data-testid="button-ask-soul-guide"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {loading ? "Checking the evidence…" : "Ask Soul Guide"}
            </Button>
          </div>
        </section>

        {error && <div role="alert" className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/[0.06] p-4 text-sm text-red-100">{error}</div>}

        {response && (
          <section className="mt-6" data-testid="soul-guide-response">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="sc-eyebrow"><Sparkles className="h-3.5 w-3.5" />{response.status} · {response.provider}</div>
              {!response.usage.premium && response.usage.limit !== null && (
                <span className="text-xs text-[var(--sc-stone)]">Session use {response.usage.used}/{response.usage.limit}</span>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {sections.map(({ section, body }) => (
                <article key={section} className={`rounded-2xl border p-5 ${section === "Action" || section === "Evidence" ? "border-[rgba(217,182,111,.16)] bg-[rgba(217,182,111,.035)]" : "border-white/[0.07] bg-white/[0.018]"}`}>
                  <p className="m-0 text-[10px] font-bold uppercase tracking-[.16em] text-[var(--sc-gold)]">{section}</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--sc-ivory-soft)]">{body}</p>
                </article>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-[rgba(57,194,173,.16)] bg-[rgba(57,194,173,.045)] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--sc-ivory)]"><ShieldCheck className="h-4 w-4 text-[var(--sc-teal)]" />Evidence actually admitted to the guide</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(response.evidence.verifiedAstrology).map(([key, value]) => <EvidenceBadge key={`a-${key}`} label={`Verified ${key}`} value={value} />)}
                {Object.entries(response.evidence.deterministicNumerology).map(([key, value]) => <EvidenceBadge key={`n-${key}`} label={`Deterministic ${key}`} value={String(value)} />)}
                {Object.entries(response.evidence.verifiedHumanDesign).map(([key, value]) => <EvidenceBadge key={`h-${key}`} label={`Verified HD ${key}`} value={value} />)}
                {Object.entries(response.evidence.symbolicContext).map(([key, value]) => <EvidenceBadge key={`s-${key}`} label={`Symbolic ${key}`} value={value} />)}
                {!response.evidence.profileUsed && <EvidenceBadge label="Profile" value="not used" />}
              </div>
              {response.evidence.unresolved.length > 0 && <p className="mb-0 mt-3 text-xs leading-6 text-[var(--sc-stone)]"><strong className="text-[var(--sc-ivory-soft)]">Excluded/unresolved:</strong> {response.evidence.unresolved.join(", ")}</p>}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
