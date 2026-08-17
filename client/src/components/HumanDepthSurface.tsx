import { useState } from "react";
import { CheckCircle2, ChevronDown, CircleHelp, Scale, Users } from "lucide-react";

export type HumanDepthFit = "very-much" | "partly" | "not-really";

export type HumanDepthItem = {
  id: string;
  title: string;
  observation: string;
  realLife?: string[];
  benefit?: string;
  tradeoff?: string;
  misunderstanding?: string;
  relationshipView?: string;
  practicalTakeaway?: string;
  evidence?: string;
};

type Props = {
  profileId: string;
  heading: string;
  intro?: string;
  items: HumanDepthItem[];
};

const fitOptions: Array<{ value: HumanDepthFit; label: string }> = [
  { value: "very-much", label: "Very much" },
  { value: "partly", label: "Partly" },
  { value: "not-really", label: "Not really" },
];

export default function HumanDepthSurface({ profileId, heading, intro, items }: Props) {
  const storageKey = `soulcodex:surface-fit:${profileId}:${heading}`;
  const [fits, setFits] = useState<Record<string, HumanDepthFit>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem(storageKey) ?? "{}") as Record<string, HumanDepthFit>;
    } catch {
      return {};
    }
  });

  const recordFit = (id: string, fit: HumanDepthFit) => {
    const next = { ...fits, [id]: fit };
    setFits(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Feedback is optional; the reading stays usable when storage is unavailable.
    }
  };

  if (!items.length) return null;

  return (
    <section className="space-y-5" aria-label={heading}>
      <header className="sc-panel sc-panel-gold p-5 sm:p-7">
        <p className="sc-eyebrow mb-2">Human-depth explanation</p>
        <h2 className="font-serif text-3xl font-medium text-[var(--sc-ivory)]">{heading}</h2>
        {intro && <p className="mt-3 max-w-3xl leading-7 text-[var(--sc-stone)]">{intro}</p>}
      </header>

      {items.map((item) => (
        <article key={item.id} className="relative rounded-[1.6rem] p-px [background:linear-gradient(140deg,rgba(217,182,111,.4)_0%,rgba(255,255,255,.05)_45%,rgba(255,255,255,.02)_100%)] shadow-[var(--sc-shadow-soft)]">
          <div className="relative overflow-hidden rounded-[calc(1.6rem-1px)] bg-[linear-gradient(155deg,rgba(28,21,39,.94),rgba(11,8,16,.97))] p-5 backdrop-blur-xl sm:p-7">
            <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,rgba(255,255,255,.045),transparent_34%)]" />
            <h3 className="relative font-serif text-2xl font-medium text-[var(--sc-ivory)]">{item.title}</h3>
            <p className="relative mt-3 leading-7 text-[var(--sc-ivory-soft)]">{item.observation}</p>

            {item.realLife?.length ? (
              <section className="relative mt-5 border-t border-[var(--sc-line)] pt-5">
                <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.13em] text-[var(--sc-teal)]">What this may look like in real life</h4>
                <ul className="space-y-2 text-[var(--sc-ivory-soft)]">
                  {item.realLife.map((example) => <li key={example} className="flex gap-2 leading-7"><span aria-hidden="true" className="text-[var(--sc-gold)]">•</span><span>{example}</span></li>)}
                </ul>
              </section>
            ) : null}

            {(item.benefit || item.tradeoff) && (
              <div className="relative mt-5 grid gap-4 md:grid-cols-2">
                {item.benefit && <section className="rounded-2xl border border-[rgba(114,216,197,.16)] bg-[rgba(114,216,197,.045)] p-4"><h4 className="mb-2 flex items-center gap-2 font-semibold text-[var(--sc-teal)]"><CheckCircle2 className="h-4 w-4" /> What this gives you</h4><p className="leading-7 text-[var(--sc-ivory-soft)]">{item.benefit}</p></section>}
                {item.tradeoff && <section className="rounded-2xl border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.045)] p-4"><h4 className="mb-2 flex items-center gap-2 font-semibold text-[var(--sc-gold-bright)]"><Scale className="h-4 w-4" /> What it may cost</h4><p className="leading-7 text-[var(--sc-ivory-soft)]">{item.tradeoff}</p></section>}
              </div>
            )}

            {item.misunderstanding && <section className="relative mt-4 rounded-2xl border border-[var(--sc-line)] bg-white/[0.03] p-4"><h4 className="mb-2 flex items-center gap-2 font-semibold text-[var(--sc-ivory-soft)]"><CircleHelp className="h-4 w-4" /> How this may be misunderstood</h4><p className="leading-7 text-[var(--sc-ivory-soft)]">{item.misunderstanding}</p></section>}
            {item.relationshipView && <section className="relative mt-4 rounded-2xl border border-[rgba(154,116,220,.16)] bg-[rgba(154,116,220,.04)] p-4"><h4 className="mb-2 flex items-center gap-2 font-semibold text-[var(--sc-violet)]"><Users className="h-4 w-4" /> In relationships</h4><p className="leading-7 text-[var(--sc-ivory-soft)]">{item.relationshipView}</p></section>}
            {item.practicalTakeaway && <section className="relative mt-4 rounded-2xl border border-[rgba(114,216,197,.16)] bg-[rgba(114,216,197,.04)] p-4"><h4 className="mb-2 font-semibold text-[var(--sc-teal)]">What to do with this insight</h4><p className="leading-7 text-[var(--sc-ivory-soft)]">{item.practicalTakeaway}</p></section>}

            <section className="relative mt-5 border-t border-[var(--sc-line)] pt-5">
              <p className="mb-3 text-sm font-semibold text-[var(--sc-ivory-soft)]">Does this fit your experience?</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label={`Does ${item.title} fit your experience?`}>
                {fitOptions.map((option) => <button key={option.value} type="button" onClick={() => recordFit(item.id, option.value)} aria-pressed={fits[item.id] === option.value} className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sc-gold)] ${fits[item.id] === option.value ? "border-[var(--sc-line-gold)] bg-[linear-gradient(145deg,rgba(217,182,111,.18),rgba(154,116,220,.06))] text-[var(--sc-gold-bright)] shadow-[0_8px_24px_rgba(217,182,111,.12)]" : "border-[var(--sc-line)] bg-white/[0.02] text-[var(--sc-stone)] hover:bg-white/[0.05]"}`}>{option.label}</button>)}
              </div>
              {fits[item.id] && <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">Saved on this device. Your answer corrects the interpretation layer; it does not rewrite calculated or verified data.</p>}
            </section>

            {item.evidence && <details className="group relative mt-5 rounded-xl border border-[var(--sc-line)] bg-white/[0.02] p-4"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[var(--sc-ivory-soft)]">Why this appeared in the reading<ChevronDown className="h-4 w-4 text-[var(--sc-gold)] transition group-open:rotate-180" /></summary><p className="pt-3 text-sm leading-6 text-[var(--sc-stone)]">{item.evidence}</p></details>}
          </div>
        </article>
      ))}
    </section>
  );
}
