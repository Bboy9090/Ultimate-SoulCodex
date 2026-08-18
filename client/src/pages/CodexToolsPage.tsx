import { useState } from "react";
import {
  Check,
  Clipboard,
  Compass,
  Loader2,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/queryClient";

interface ToolEvidence {
  kind: "heuristic" | "template" | "symbolic_random_draw";
  personalizedFromProfile: false;
  verifiedFactsUsed: unknown[];
  note: string;
}

interface ToolResult {
  tool: string;
  title: string;
  observation: string;
  meaning: string;
  action: string;
  extras?: Record<string, unknown>;
  evidence: ToolEvidence;
}

type RunningTool = "before" | "boundary" | "draw" | null;

function cleanToolText(value: string): string {
  return value.replace(/\*\*/g, "").replace(/^>\s?/gm, "").trim();
}

async function requestTool(path: string, body: Record<string, unknown>): Promise<ToolResult> {
  const response = await apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = typeof payload?.message === "string"
      ? payload.message
      : `Tool request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return response.json() as Promise<ToolResult>;
}

export default function CodexToolsPage() {
  const [message, setMessage] = useState("");
  const [boundarySituation, setBoundarySituation] = useState("");
  const [spread, setSpread] = useState<"quick" | "situation" | "deep">("quick");
  const [running, setRunning] = useState<RunningTool>(null);
  const [result, setResult] = useState<ToolResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = async (tool: Exclude<RunningTool, null>, path: string, body: Record<string, unknown>) => {
    if (running) return;
    setRunning(tool);
    setError(null);
    setCopied(false);
    try {
      setResult(await requestTool(path, body));
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : "The tool could not complete this request.");
    } finally {
      setRunning(null);
    }
  };

  const copyResult = async () => {
    if (!result) return;
    const content = [
      result.title,
      "",
      cleanToolText(result.observation),
      "",
      cleanToolText(result.meaning),
      "",
      cleanToolText(result.action),
      "",
      `Evidence note: ${result.evidence.note}`,
    ].join("\n");
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
        <header className="sc-panel sc-panel-gold relative overflow-hidden p-6 sm:p-9">
          <div className="relative">
            <div className="sc-eyebrow mb-4"><Compass className="h-3.5 w-3.5" />Clarity tools</div>
            <h1 className="sc-display sc-display-gradient">Useful prompts without fake certainty</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--sc-stone)] sm:text-lg">
              These recovered tools are deliberately narrow. They use only the text you enter here, not your birth date, saved profile, Moon, Rising, Human Design, or hidden account data.
            </p>
            <div className="mt-5 flex max-w-3xl items-start gap-3 rounded-2xl border border-[rgba(57,194,173,.18)] bg-[rgba(57,194,173,.055)] p-4 text-sm leading-6 text-[var(--sc-ivory-soft)]">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sc-teal)]" />
              <p className="m-0">
                Heuristics and symbolic draws are labeled as such. They are reflection aids, not predictions, diagnoses, safety determinations, or substitutes for professional medical, legal, or financial judgment.
              </p>
            </div>
          </div>
        </header>

        <section className="mt-7 grid gap-5 lg:grid-cols-3">
          <article className="sc-panel p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="sc-icon-well"><MessageSquareText className="h-[18px] w-[18px]" /></span>
              <div>
                <h2 className="m-0 font-serif text-xl font-semibold text-[var(--sc-ivory)]">Before You Act</h2>
                <p className="m-0 mt-1 text-xs text-[var(--sc-stone)]">Transparent text-pattern heuristic</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-[var(--sc-stone)]">Paste a message you are considering sending. The check looks for simple reactive, emotional, unclear, and length markers. It does not decide for you.</p>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={5000}
              rows={7}
              placeholder="Paste the message here…"
              className="mt-3 w-full resize-y rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3 text-sm leading-6 text-[var(--sc-ivory)] outline-none placeholder:text-[var(--sc-stone)]/60 focus:border-[rgba(217,182,111,.35)]"
              data-testid="input-before-you-act"
            />
            <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--sc-stone)]">
              <span>Only this text is sent</span><span>{message.length}/5000</span>
            </div>
            <Button
              type="button"
              disabled={!message.trim() || Boolean(running)}
              onClick={() => run("before", "/api/codex-tools/before-you-act", { text: message })}
              className="mt-4 w-full"
              data-testid="button-before-you-act"
            >
              {running === "before" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              Check the wording
            </Button>
          </article>

          <article className="sc-panel p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="sc-icon-well"><Clipboard className="h-[18px] w-[18px]" /></span>
              <div>
                <h2 className="m-0 font-serif text-xl font-semibold text-[var(--sc-ivory)]">Boundary Script</h2>
                <p className="m-0 mt-1 text-xs text-[var(--sc-stone)]">Editable communication template</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-[var(--sc-stone)]">Describe the situation in plain language. The tool chooses a starting template. It does not infer the other person's motives or tell you what you must do.</p>
            <textarea
              value={boundarySituation}
              onChange={(event) => setBoundarySituation(event.target.value)}
              maxLength={1500}
              rows={7}
              placeholder="Example: My boss keeps asking me to take on work after hours…"
              className="mt-3 w-full resize-y rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3 text-sm leading-6 text-[var(--sc-ivory)] outline-none placeholder:text-[var(--sc-stone)]/60 focus:border-[rgba(217,182,111,.35)]"
              data-testid="input-boundary-script"
            />
            <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--sc-stone)]">
              <span>No profile data is attached</span><span>{boundarySituation.length}/1500</span>
            </div>
            <Button
              type="button"
              disabled={!boundarySituation.trim() || Boolean(running)}
              onClick={() => run("boundary", "/api/codex-tools/boundary-script", { situation: boundarySituation })}
              className="mt-4 w-full"
              data-testid="button-boundary-script"
            >
              {running === "boundary" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquareText className="mr-2 h-4 w-4" />}
              Draft a boundary
            </Button>
          </article>

          <article className="sc-panel p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="sc-icon-well"><Sparkles className="h-[18px] w-[18px]" /></span>
              <div>
                <h2 className="m-0 font-serif text-xl font-semibold text-[var(--sc-ivory)]">Codex Draw</h2>
                <p className="m-0 mt-1 text-xs text-[var(--sc-stone)]">Symbolic random reflection</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-[var(--sc-stone)]">Draw one, three, or five tarot-style symbolic prompts. No fake transit, no destiny claim, and no suggestion that randomness is evidence.</p>
            <label className="mt-5 block text-xs font-semibold uppercase tracking-[.12em] text-[var(--sc-stone)]" htmlFor="codex-spread">Spread</label>
            <select
              id="codex-spread"
              value={spread}
              onChange={(event) => setSpread(event.target.value as typeof spread)}
              className="mt-2 h-12 w-full rounded-xl border border-white/[0.08] bg-[var(--sc-ink)] px-3.5 text-sm text-[var(--sc-ivory)] outline-none focus:border-[rgba(217,182,111,.35)]"
              data-testid="select-codex-spread"
            >
              <option value="quick">Quick card · 1 prompt</option>
              <option value="situation">Situation · 3 prompts</option>
              <option value="deep">Deep reflection · 5 prompts</option>
            </select>
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.018] p-3 text-xs leading-5 text-[var(--sc-stone)]">
              The draw deliberately uses zero verified profile facts. Interpret only what is useful and compare it with real evidence from your life.
            </div>
            <Button
              type="button"
              disabled={Boolean(running)}
              onClick={() => run("draw", "/api/codex-tools/codex-draw", { spread })}
              className="mt-4 w-full"
              data-testid="button-codex-draw"
            >
              {running === "draw" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Draw reflection cards
            </Button>
          </article>
        </section>

        {error && (
          <section className="mt-7 rounded-2xl border border-red-400/20 bg-red-500/[0.06] p-5 text-sm leading-6 text-red-100" role="alert">
            {error}
          </section>
        )}

        {result && (
          <section className="sc-panel sc-panel-gold mt-7 p-6 sm:p-8" data-testid="codex-tool-result">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="sc-eyebrow mb-3">{result.evidence.kind.replace(/_/g, " ")}</div>
                <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--sc-ivory)]">{result.title}</h2>
              </div>
              <Button type="button" variant="outline" onClick={copyResult} className="gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                <p className="m-0 text-[10px] font-bold uppercase tracking-[.16em] text-[var(--sc-gold)]">Observation</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--sc-ivory-soft)]">{cleanToolText(result.observation)}</p>
              </div>
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                <p className="m-0 text-[10px] font-bold uppercase tracking-[.16em] text-[var(--sc-gold)]">Meaning</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--sc-ivory-soft)]">{cleanToolText(result.meaning)}</p>
              </div>
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                <p className="m-0 text-[10px] font-bold uppercase tracking-[.16em] text-[var(--sc-gold)]">Action</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--sc-ivory-soft)]">{cleanToolText(result.action)}</p>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[rgba(57,194,173,.16)] bg-[rgba(57,194,173,.045)] p-4 text-xs leading-6 text-[var(--sc-stone)]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sc-teal)]" />
              <p className="m-0"><strong className="text-[var(--sc-ivory-soft)]">Evidence boundary:</strong> {result.evidence.note} Profile personalization: none. Verified profile facts used: none.</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
