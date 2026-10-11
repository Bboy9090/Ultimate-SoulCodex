import { ArrowRight, Diamond } from "lucide-react";
import { Link } from "wouter";
import { tierAllowsCapability } from "@shared/product-access";
import { useProductAccess } from "@/hooks/useProductAccess";

type DiamondClosureProps = {
  clarity: string;
  depth: string;
  nextMove: string;
  nextHref?: string;
  nextLabel?: string;
};

export default function DiamondClosure({
  clarity,
  depth,
  nextMove,
  nextHref,
  nextLabel = "Take the next step",
}: DiamondClosureProps) {
  const { tier } = useProductAccess();
  const deeperInterpretationUnlocked = tierAllowsCapability(tier, "interpretation_depth");

  return (
    <section className="sc-panel sc-panel-gold p-5 sm:p-6" aria-label="Diamond Way closure">
      <div className="mb-4 flex items-center gap-2">
        <Diamond className="h-4 w-4 text-[var(--sc-gold-bright)]" />
        <p className="sc-eyebrow m-0">Diamond Way</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
        <div>
          <p className="m-0 text-[10px] font-bold uppercase tracking-[.14em] text-[var(--sc-stone)]">
            {deeperInterpretationUnlocked ? "Soul Codex+ depth active" : "Free clarity"}
          </p>
          <p className="m-0 mt-1 text-xs leading-5 text-[var(--sc-stone)]">
            {deeperInterpretationUnlocked
              ? "Deeper supported interpretation can open beyond this core closure without changing the evidence standard."
              : "This core answer is complete on Free. Plus expands supported tensions, relationship impact, shadow, decisions, and cross-layer explanation."}
          </p>
        </div>
        {!deeperInterpretationUnlocked ? (
          <Link href="/pricing" className="text-xs font-semibold text-[var(--sc-gold-bright)] no-underline hover:text-white">
            Open deeper layers
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[var(--sc-stone)]">Clarity</p>
          <p className="mt-2 text-sm leading-6 text-[var(--sc-ivory)]">{clarity}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[var(--sc-stone)]">Depth</p>
          <p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{depth}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[var(--sc-stone)]">Next move</p>
          <p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{nextMove}</p>
          {nextHref && (
            <Link href={nextHref} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--sc-gold-bright)] no-underline hover:text-white">
              {nextLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
