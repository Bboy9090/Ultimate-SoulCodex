import { useEffect, useState } from "react";
import Navigation from "@/components/navigation";
import CompatibilityHubPage from "./CompatibilityHubPage";

function CompatibilitySkeleton() {
  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="sc-page max-w-6xl pt-28" aria-busy="true" aria-live="polite">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="mb-4 h-3 w-44 animate-pulse rounded bg-[rgba(217,182,111,.22)]" />
            <div className="mb-3 h-14 w-full max-w-2xl animate-pulse rounded-2xl bg-white/[0.07] sm:h-20" />
            <div className="mb-3 h-5 w-full max-w-xl animate-pulse rounded bg-white/[0.035]" />
            <div className="h-5 w-4/5 max-w-lg animate-pulse rounded bg-white/[0.035]" />
          </div>
          <div className="mx-auto aspect-square w-56 animate-pulse rounded-full border border-[var(--sc-line-gold)] bg-[rgba(154,116,220,.04)]" />
        </div>
        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="sc-panel h-48 animate-pulse bg-white/[0.02]" />
          ))}
        </section>
        <span className="sr-only">Loading Compatibility</span>
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
