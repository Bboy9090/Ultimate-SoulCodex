import { useEffect, useState } from "react";
import Navigation from "@/components/navigation";
import CompatibilityHubPage from "./CompatibilityHubPage";

function CompatibilitySkeleton() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_72%_4%,rgba(93,63,160,.18),transparent_28%),radial-gradient(circle_at_12%_30%,rgba(29,116,131,.10),transparent_25%),#08060e] text-[#f7f0e4]">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-28" aria-busy="true" aria-live="polite">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="mb-4 h-3 w-44 animate-pulse rounded bg-amber-300/30" />
            <div className="mb-3 h-14 w-full max-w-2xl animate-pulse rounded-2xl bg-white/10 sm:h-20" />
            <div className="mb-3 h-5 w-full max-w-xl animate-pulse rounded bg-white/5" />
            <div className="h-5 w-4/5 max-w-lg animate-pulse rounded bg-white/5" />
          </div>
          <div className="mx-auto aspect-square w-56 animate-pulse rounded-full border border-amber-300/15 bg-violet-300/[0.04]" />
        </div>
        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-2xl border border-white/10 bg-white/[0.025]" />
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
