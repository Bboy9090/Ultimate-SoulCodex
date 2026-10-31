import { Link } from "wouter";
import type { ChartPlacementReading } from "@/lib/chartPlacementReading";

export default function PlanetaryDepthPanel({ depth }: { depth?: ChartPlacementReading["depth"] }) {
  if (!depth) return <aside className="my-4 rounded-xl border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.04)] p-4" aria-label="Free and Plus placement access">
    <p className="sc-eyebrow">Core clarity · Free</p>
    <p className="mt-2 text-sm leading-6">Your chart facts, placement meaning, possible strength, core tradeoff, and practical action are included. Soul Codex+ adds expanded relationship context, a decision worksheet, and guided reflection for each supported planet.</p>
    <Link href="/pricing" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--sc-gold-bright)]">Compare Free and Soul Codex+</Link>
  </aside>;
  return <details className="my-4 rounded-xl border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.04)] p-4" data-testid="planetary-plus-depth">
    <summary className="cursor-pointer font-semibold text-[var(--sc-gold-bright)]">Soul Codex+ · Explore this placement more deeply</summary>
    <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--sc-ivory-soft)]">
      <section><h4 className="font-semibold">Relationship context</h4><p>{depth.relationships}</p></section>
      <section><h4 className="font-semibold">Decision worksheet</h4><p>{depth.decisions}</p></section>
      <section><h4 className="font-semibold">Guided reflection</h4><p>{depth.reflection}</p></section>
    </div>
  </details>;
}
