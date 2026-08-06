import { Link } from "wouter";
import { ArrowRight, Clock3 } from "lucide-react";
import { loadActiveProfile } from "@/lib/ActiveProfileRepository";
import { getProfilePath } from "@/lib/clarityNavigation";

export default function TimelineContinuityHeader() {
  const profile = loadActiveProfile().profile as any;
  if (!profile) return null;

  const name = profile.name ?? profile.firstName ?? "Your";
  const id = profile.id ?? profile.uuid;
  const href = getProfilePath(id);

  return (
    <section className="mx-auto mt-6 max-w-5xl px-4" aria-labelledby="timeline-continuity-title">
      <div className="rounded-2xl border border-amber-300/20 bg-[linear-gradient(145deg,rgba(27,18,43,.92),rgba(12,9,20,.94))] p-5 text-white shadow-xl sm:p-6">
        <div className="mb-3 flex items-center gap-2 text-amber-300">
          <Clock3 aria-hidden="true" className="h-5 w-5" />
          <p className="text-[11px] font-bold uppercase tracking-[0.18em]">Living timeline</p>
        </div>
        <h1 id="timeline-continuity-title" className="mb-2 font-serif text-2xl sm:text-3xl">
          {name} history should explain change, not freeze identity.
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-white/65 sm:text-base">
          Cycles are context. Add real events, decisions, and reflections over time so symbolic timing can be compared with what actually happened.
        </p>
        {id && (
          <Link href={href} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-amber-300">
            Review the identity behind this timeline
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        )}
      </div>
    </section>
  );
}
