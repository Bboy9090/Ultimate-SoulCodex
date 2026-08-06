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
      <header className="rounded-3xl border border-violet-300/20 bg-violet-300/[0.045] p-5 sm:p-7">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-200">Human-depth explanation</p>
        <h2 className="font-serif text-3xl text-white">{heading}</h2>
        {intro && <p className="mt-3 max-w-3xl leading-7 text-white/65">{intro}</p>}
      </header>

      {items.map((item) => (
        <article key={item.id} className="rounded-3xl border border-white/10 bg-black/25 p-5 shadow-xl backdrop-blur sm:p-7">
          <h3 className="font-serif text-2xl text-white">{item.title}</h3>
          <p className="mt-3 leading-7 text-white/75">{item.observation}</p>

          {item.realLife?.length ? (
            <section className="mt-5 border-t border-white/10 pt-5">
              <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.13em] text-teal-200">What this may look like in real life</h4>
              <ul className="space-y-2 text-white/68">
                {item.realLife.map((example) => <li key={example} className="flex gap-2 leading-7"><span aria-hidden="true">•</span><span>{example}</span></li>)}
              </ul>
            </section>
          ) : null}

          {(item.benefit || item.tradeoff) && (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {item.benefit && <section className="rounded-2xl border border-teal-300/15 bg-teal-300/[0.04] p-4"><h4 className="mb-2 flex items-center gap-2 font-semibold text-teal-200"><CheckCircle2 className="h-4 w-4" /> What this gives you</h4><p className="leading-7 text-white/68">{item.benefit}</p></section>}
              {item.tradeoff && <section className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-4"><h4 className="mb-2 flex items-center gap-2 font-semibold text-amber-200"><Scale className="h-4 w-4" /> What it may cost</h4><p className="leading-7 text-white/68">{item.tradeoff}</p></section>}
            </div>
          )}

          {item.misunderstanding && <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"><h4 className="mb-2 flex items-center gap-2 font-semibold text-white/85"><CircleHelp className="h-4 w-4" /> How this may be misunderstood</h4><p className="leading-7 text-white/68">{item.misunderstanding}</p></section>}
          {item.relationshipView && <section className="mt-4 rounded-2xl border border-violet-300/15 bg-violet-300/[0.035] p-4"><h4 className="mb-2 flex items-center gap-2 font-semibold text-violet-200"><Users className="h-4 w-4" /> In relationships</h4><p className="leading-7 text-white/68">{item.relationshipView}</p></section>}
          {item.practicalTakeaway && <section className="mt-4 rounded-2xl border border-teal-300/15 bg-teal-300/[0.035] p-4"><h4 className="mb-2 font-semibold text-teal-200">What to do with this insight</h4><p className="leading-7 text-white/72">{item.practicalTakeaway}</p></section>}

          <section className="mt-5 border-t border-white/10 pt-5">
            <p className="mb-3 text-sm font-semibold text-white/80">Does this fit your experience?</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={`Does ${item.title} fit your experience?`}>
              {fitOptions.map((option) => <button key={option.value} type="button" onClick={() => recordFit(item.id, option.value)} aria-pressed={fits[item.id] === option.value} className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${fits[item.id] === option.value ? "border-violet-300/45 bg-violet-300/15 text-violet-100" : "border-white/10 bg-black/20 text-white/60 hover:bg-white/5"}`}>{option.label}</button>)}
            </div>
            {fits[item.id] && <p className="mt-3 text-sm leading-6 text-white/50">Saved on this device. Your answer corrects the interpretation layer; it does not rewrite calculated or verified data.</p>}
          </section>

          {item.evidence && <details className="group mt-5 rounded-xl border border-white/10 bg-black/20 p-4"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-white/70">Why this appeared in the reading<ChevronDown className="h-4 w-4 transition group-open:rotate-180" /></summary><p className="pt-3 text-sm leading-6 text-white/55">{item.evidence}</p></details>}
        </article>
      ))}
    </section>
  );
}
