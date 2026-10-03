import { ArrowRight, Diamond } from "lucide-react";
import { Link } from "wouter";

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
  return (
    <section className="sc-panel sc-panel-gold p-5 sm:p-6" aria-label="Diamond Way closure">
      <div className="mb-4 flex items-center gap-2">
        <Diamond className="h-4 w-4 text-[var(--sc-gold-bright)]" />
        <p className="sc-eyebrow m-0">Diamond Way</p>
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
