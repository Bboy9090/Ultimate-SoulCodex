import { useEffect, useState } from "react";
import Navigation from "@/components/navigation";
import CompatibilityHubPage from "./CompatibilityHubPage";

function CompatibilitySkeleton() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_0%,rgba(81,45,125,.22),transparent_34%),#09070f] text-[#f7f0e4]">
      <Navigation />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-28" aria-busy="true" aria-live="polite">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300">Relationship intelligence</p>
        <div className="mb-4 h-12 w-4/5 animate-pulse rounded-xl bg-white/10 sm:h-16 sm:w-3/5" />
        <div className="mb-8 h-5 w-full max-w-2xl animate-pulse rounded bg-white/5" />
        <section className="mb-5 rounded-2xl border border-amber-300/15 bg-white/[0.035] p-5">
          <div className="mb-4 h-7 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-full animate-pulse rounded bg-white/5" />
        </section>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-2xl border border-white/10 bg-white/[0.035]" />
          ))}
        </section>
        <span className="sr-only">Loading relationship intelligence</span>
      </main>
    </div>
  );
}

export default function CompatibilityRoute() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return ready ? <CompatibilityHubPage /> : <CompatibilitySkeleton />;
}
